import { FIVE_MIB, TWENTY_FIVE_MIB } from "../catalog.ts";

export type FileValidationResult =
  | { ok: true }
  | {
      ok: false;
      code: "validation_error" | "payload_too_large" | "unsupported_content";
      httpStatus: number;
      message: string;
      fieldErrors?: Record<string, string>;
    };

export interface ValidatedExeOptions {
  operatingPoint: "fpr_1pct" | "fpr_0.1pct";
  threshold: number | null;
  modelType: "hybrid" | "gbdt" | "both";
  deepInspection: boolean;
}

export interface ValidatedPdfOptions {
  threshold: number;
  estimator: "ensemble" | "rf" | "et" | "lr" | "lgbm";
  deepInspection: boolean;
  includeFeatures: boolean;
}

export type OptionValidationResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      code: "validation_error";
      httpStatus: 400;
      message: string;
      fieldErrors: Record<string, string>;
    };

function startsWithBytes(bytes: Uint8Array, prefix: readonly number[]): boolean {
  if (bytes.byteLength < prefix.length) return false;
  for (let i = 0; i < prefix.length; i += 1) {
    if (bytes[i] !== prefix[i]) return false;
  }
  return true;
}

function checkBounds(
  bytes: Uint8Array,
  minBytes: number,
  maxBytes: number,
  limitLabel: string,
): FileValidationResult {
  if (bytes.byteLength === 0) {
    return {
      ok: false,
      code: "validation_error",
      httpStatus: 400,
      message: "The selected file is empty (0 bytes). Choose a valid file and try again.",
      fieldErrors: { file: "File cannot be empty." },
    };
  }
  if (bytes.byteLength > maxBytes) {
    return {
      ok: false,
      code: "payload_too_large",
      httpStatus: 413,
      message: `This file exceeds the ${limitLabel} upload limit. Choose a smaller file and try again.`,
      fieldErrors: { file: `File must be ${limitLabel} or smaller.` },
    };
  }
  if (bytes.byteLength < minBytes) {
    return {
      ok: false,
      code: "unsupported_content",
      httpStatus: 422,
      message: "This file is too small to be a valid document of the selected type.",
      fieldErrors: { file: "File content is incomplete or unsupported." },
    };
  }
  return { ok: true };
}

function parseBoolOption(
  raw: string | null | undefined,
  defaultValue: boolean,
): boolean {
  if (raw === undefined || raw === null || raw === "") return defaultValue;
  return raw.toLowerCase() !== "false";
}

export function validateEmailBytes(bytes: Uint8Array): FileValidationResult {
  const bounds = checkBounds(bytes, 8, FIVE_MIB, "5 MiB");
  if (!bounds.ok) return bounds;

  // Reject well-known non-email binary headers disguised as .eml
  const disallowedBinary = [
    [0x89, 0x50, 0x4e, 0x47], // PNG
    [0xff, 0xd8, 0xff], // JPEG
    [0x47, 0x49, 0x46, 0x38], // GIF
    [0x25, 0x50, 0x44, 0x46, 0x2d], // %PDF-
    [0x4d, 0x5a], // MZ (PE/DOS)
    [0x50, 0x4b, 0x03, 0x04], // ZIP/OOXML
    [0x7f, 0x45, 0x4c, 0x46], // ELF
    [0xd0, 0xcf, 0x11, 0xe0], // OLE2
  ];
  for (const sig of disallowedBinary) {
    if (startsWithBytes(bytes, sig)) {
      return {
        ok: false,
        code: "unsupported_content",
        httpStatus: 422,
        message:
          "File content does not match a raw .eml email message. Upload an exported .eml file with email headers.",
        fieldErrors: { file: "Content is not a valid .eml message." },
      };
    }
  }

  const headSlice = bytes.subarray(0, Math.min(bytes.byteLength, 4096));
  for (let i = 0; i < headSlice.length; i += 1) {
    if (headSlice[i] === 0x00) {
      return {
        ok: false,
        code: "unsupported_content",
        httpStatus: 422,
        message:
          "File header contains binary data rather than RFC 5322 email headers.",
        fieldErrors: { file: "Content is not a valid .eml message." },
      };
    }
  }

  const headerText = new TextDecoder("latin1")
    .decode(headSlice)
    .replace(/^\uFEFF/, "");
  const headerBlock = headerText.split(/\r?\n\r?\n/, 1)[0] ?? headerText;
  const lines = headerBlock.split(/\r?\n/);

  let foundHeader = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) break;
    if (/^From\s+\S+/i.test(trimmed)) {
      // mbox "From " separator line is acceptable before headers
      continue;
    }
    if (/^[A-Za-z0-9-]{2,64}:\s*.*/.test(line)) {
      foundHeader = true;
      break;
    }
    if (!/^[ \t]/.test(line)) {
      break;
    }
  }

  if (!foundHeader) {
    return {
      ok: false,
      code: "unsupported_content",
      httpStatus: 422,
      message:
        "No valid email headers were found (such as From:, To:, or Subject:). Upload a raw .eml email file.",
      fieldErrors: { file: "Missing RFC 5322 email headers." },
    };
  }

  return { ok: true };
}

export function validateExeBytes(bytes: Uint8Array): FileValidationResult {
  const bounds = checkBounds(bytes, 64, TWENTY_FIVE_MIB, "25 MiB");
  if (!bounds.ok) return bounds;

  // Check DOS MZ signature
  if (bytes[0] !== 0x4d || bytes[1] !== 0x5a) {
    return {
      ok: false,
      code: "unsupported_content",
      httpStatus: 422,
      message:
        "File content is not a valid Windows Portable Executable (.exe, .dll, or .sys). Renamed or non-binary files cannot be scanned here.",
      fieldErrors: { file: "Missing Windows PE (MZ) binary signature." },
    };
  }

  // Read e_lfanew (little-endian uint32 at 0x3C) and check PE\0\0
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const peOffset = view.getUint32(0x3c, true);
  if (
    peOffset < 0x40 ||
    peOffset + 4 > bytes.byteLength ||
    bytes[peOffset] !== 0x50 ||
    bytes[peOffset + 1] !== 0x45 ||
    bytes[peOffset + 2] !== 0x00 ||
    bytes[peOffset + 3] !== 0x00
  ) {
    return {
      ok: false,
      code: "unsupported_content",
      httpStatus: 422,
      message:
        "File header is missing a valid Windows PE signature. Upload an unmodified .exe, .dll, or .sys binary.",
      fieldErrors: { file: "Invalid Windows PE header structure." },
    };
  }

  return { ok: true };
}

export function validateExeOptions(raw: {
  operatingPoint?: string | null;
  threshold?: string | null;
  modelType?: string | null;
  deepInspection?: string | null;
}): OptionValidationResult<ValidatedExeOptions> {
  const fieldErrors: Record<string, string> = {};

  const operatingPoint = (raw.operatingPoint?.trim() || "fpr_1pct") as
    | "fpr_1pct"
    | "fpr_0.1pct";
  if (operatingPoint !== "fpr_1pct" && operatingPoint !== "fpr_0.1pct") {
    fieldErrors.operatingPoint =
      "Select either balanced (1% FPR) or strict (0.1% FPR) sensitivity.";
  }

  const modelType = (raw.modelType?.trim() || "both") as
    | "hybrid"
    | "gbdt"
    | "both";
  if (modelType !== "hybrid" && modelType !== "gbdt" && modelType !== "both") {
    fieldErrors.modelType =
      "Select combined, deep binary pattern, or structural attribute analysis.";
  }

  let threshold: number | null = null;
  if (raw.threshold !== undefined && raw.threshold !== null && raw.threshold.trim() !== "") {
    const parsed = Number(raw.threshold.trim());
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
      fieldErrors.threshold = "Custom threshold must be a number between 0 and 1.";
    } else {
      threshold = parsed;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      code: "validation_error",
      httpStatus: 400,
      message: Object.values(fieldErrors)[0] ?? "Check the advanced options.",
      fieldErrors,
    };
  }

  return {
    ok: true,
    data: {
      operatingPoint,
      threshold,
      modelType,
      deepInspection: parseBoolOption(raw.deepInspection, true),
    },
  };
}

export function validateOfficeBytes(bytes: Uint8Array): FileValidationResult {
  const bounds = checkBounds(bytes, 6, TWENTY_FIVE_MIB, "25 MiB");
  if (!bounds.ok) return bounds;

  // OOXML ZIP (PK\x03\x04 or empty ZIP PK\x05\x06)
  if (
    startsWithBytes(bytes, [0x50, 0x4b, 0x03, 0x04]) ||
    startsWithBytes(bytes, [0x50, 0x4b, 0x05, 0x06])
  ) {
    return { ok: true };
  }

  // Legacy OLE2 Compound File Binary (.doc, .xls, .ppt, .msi-like Office containers)
  if (
    startsWithBytes(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])
  ) {
    return { ok: true };
  }

  // OneNote GUID header
  if (
    startsWithBytes(bytes, [
      0xe4, 0x52, 0x5c, 0x7b, 0x8c, 0xd8, 0xa7, 0x4d, 0xae, 0xb1, 0x53, 0x78,
      0xd0, 0x29, 0x96, 0xd3,
    ])
  ) {
    return { ok: true };
  }

  // Text-based Office carriers: RTF, Office XML, MHTML/MIME Office
  const prefixText = new TextDecoder("latin1")
    .decode(bytes.subarray(0, Math.min(bytes.byteLength, 512)))
    .replace(/^\uFEFF/, "")
    .trimStart();

  if (
    prefixText.startsWith("{\\rtf") ||
    prefixText.startsWith("<?xml") ||
    prefixText.startsWith("<w:wordDocument") ||
    prefixText.startsWith("<Workbook") ||
    /^MIME-Version:/i.test(prefixText) ||
    /^From:\s+/i.test(prefixText)
  ) {
    return { ok: true };
  }

  return {
    ok: false,
    code: "unsupported_content",
    httpStatus: 422,
    message:
      "File content does not match a supported Microsoft Office or RTF document format. Check that the file has not been renamed from another format.",
    fieldErrors: { file: "Unsupported Office document content." },
  };
}

export function validatePdfBytes(bytes: Uint8Array): FileValidationResult {
  const bounds = checkBounds(bytes, 5, TWENTY_FIVE_MIB, "25 MiB");
  if (!bounds.ok) return bounds;

  // Per PDF specification, %PDF- may appear anywhere in the first 1,024 bytes.
  const headText = new TextDecoder("latin1").decode(
    bytes.subarray(0, Math.min(bytes.byteLength, 1024)),
  );
  if (!headText.includes("%PDF-")) {
    return {
      ok: false,
      code: "unsupported_content",
      httpStatus: 422,
      message:
        "File content does not contain a valid PDF header (%PDF-). Check that this is an actual PDF document.",
      fieldErrors: { file: "Missing %PDF- header signature." },
    };
  }

  return { ok: true };
}

export function validatePdfOptions(raw: {
  threshold?: string | null;
  estimator?: string | null;
  deepInspection?: string | null;
  includeFeatures?: string | null;
}): OptionValidationResult<ValidatedPdfOptions> {
  const fieldErrors: Record<string, string> = {};

  let threshold = 0.5;
  if (raw.threshold !== undefined && raw.threshold !== null && raw.threshold.trim() !== "") {
    const parsed = Number(raw.threshold.trim());
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
      fieldErrors.threshold = "Custom threshold must be a number between 0 and 1.";
    } else {
      threshold = parsed;
    }
  }

  const estimator = (raw.estimator?.trim() || "ensemble") as
    | "ensemble"
    | "rf"
    | "et"
    | "lr"
    | "lgbm";
  if (!["ensemble", "rf", "et", "lr", "lgbm"].includes(estimator)) {
    fieldErrors.estimator =
      "Choose a supported PDF evaluation mode (ensemble, rf, et, lr, or lgbm).";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      code: "validation_error",
      httpStatus: 400,
      message: Object.values(fieldErrors)[0] ?? "Check the advanced options.",
      fieldErrors,
    };
  }

  return {
    ok: true,
    data: {
      threshold,
      estimator,
      deepInspection: parseBoolOption(raw.deepInspection, true),
      includeFeatures: parseBoolOption(raw.includeFeatures, false),
    },
  };
}
