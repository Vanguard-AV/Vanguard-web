import {
  FIVE_MIB,
  URL_MAX_BATCH_ITEMS,
  URL_MAX_ID_LENGTH,
  URL_MAX_LENGTH,
} from "../catalog.ts";

export interface ValidatedUrlItem {
  url: string;
  id?: string;
}

export interface ValidatedUrlSingleRequest {
  url: string;
  id?: string;
  threshold?: number;
  includeDetails: boolean;
}

export interface ValidatedUrlBatchRequest {
  urls: ValidatedUrlItem[];
  threshold?: number;
  includeDetails: boolean;
}

type ValidationFailure = {
  ok: false;
  code: "validation_error" | "payload_too_large" | "unsupported_content";
  httpStatus: number;
  message: string;
  fieldErrors?: Record<string, string>;
};

export type UrlValidationResult<T> = { ok: true; data: T } | ValidationFailure;

export type UrlFileParseResult =
  | { ok: true; urls: ValidatedUrlItem[] }
  | ValidationFailure;

function parseOptionalThreshold(
  raw: unknown,
): { ok: true; value: number | undefined } | { ok: false; error: string } {
  if (raw === undefined || raw === null || raw === "") {
    return { ok: true, value: undefined };
  }
  const num = typeof raw === "number" ? raw : Number(String(raw).trim());
  if (!Number.isFinite(num) || num < 0 || num > 1) {
    return {
      ok: false,
      error: "Custom threshold must be a number between 0 and 1.",
    };
  }
  return { ok: true, value: num };
}

function parseOptionalId(
  raw: unknown,
): { ok: true; value: string | undefined } | { ok: false; error: string } {
  if (raw === undefined || raw === null) return { ok: true, value: undefined };
  if (typeof raw !== "string") {
    return { ok: false, error: "Reference ID must be text." };
  }
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, value: undefined };
  if (trimmed.length > URL_MAX_ID_LENGTH) {
    return {
      ok: false,
      error: `Reference ID must be ${URL_MAX_ID_LENGTH} characters or fewer.`,
    };
  }
  return { ok: true, value: trimmed };
}

function parseIncludeDetails(raw: unknown): boolean {
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "string") return raw.toLowerCase() !== "false";
  return true;
}

export function validateUrlSinglePayload(
  raw: Record<string, unknown>,
): UrlValidationResult<ValidatedUrlSingleRequest> {
  const fieldErrors: Record<string, string> = {};
  const urlRaw = typeof raw.url === "string" ? raw.url : "";
  const trimmed = urlRaw.trim();

  if (!trimmed) {
    fieldErrors.url = "Enter an HTTP(S) URL or bare domain to inspect.";
  } else if (trimmed.length > URL_MAX_LENGTH) {
    fieldErrors.url = `URLs must be ${URL_MAX_LENGTH.toLocaleString()} characters or fewer.`;
  }

  const idRes = parseOptionalId(raw.id);
  if (!idRes.ok) fieldErrors.id = idRes.error;

  const thresholdRes = parseOptionalThreshold(raw.threshold);
  if (!thresholdRes.ok) fieldErrors.threshold = thresholdRes.error;

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      code: "validation_error",
      httpStatus: 400,
      message: Object.values(fieldErrors)[0] ?? "Check the highlighted fields.",
      fieldErrors,
    };
  }

  return {
    ok: true,
    data: {
      url: trimmed,
      ...(idRes.ok && idRes.value ? { id: idRes.value } : {}),
      ...(thresholdRes.ok && thresholdRes.value !== undefined
        ? { threshold: thresholdRes.value }
        : {}),
      includeDetails: parseIncludeDetails(raw.includeDetails),
    },
  };
}

export function validateUrlBatchPayload(
  raw: Record<string, unknown>,
): UrlValidationResult<ValidatedUrlBatchRequest> {
  const fieldErrors: Record<string, string> = {};
  const thresholdRes = parseOptionalThreshold(raw.threshold);
  if (!thresholdRes.ok) fieldErrors.threshold = thresholdRes.error;

  if (!Array.isArray(raw.urls) || raw.urls.length === 0) {
    fieldErrors.urls = "Provide at least 1 URL to inspect.";
  } else if (raw.urls.length > URL_MAX_BATCH_ITEMS) {
    fieldErrors.urls = `Batch scans accept at most ${URL_MAX_BATCH_ITEMS} URLs at a time (received ${raw.urls.length}).`;
  }

  const validatedItems: ValidatedUrlItem[] = [];

  if (Array.isArray(raw.urls) && !fieldErrors.urls) {
    for (let index = 0; index < raw.urls.length; index += 1) {
      const entry = raw.urls[index];
      let url = "";
      let id: string | undefined;

      if (typeof entry === "string") {
        url = entry.trim();
      } else if (entry && typeof entry === "object") {
        const obj = entry as Record<string, unknown>;
        url = typeof obj.url === "string" ? obj.url.trim() : "";
        const idParsed = parseOptionalId(obj.id);
        if (!idParsed.ok) {
          fieldErrors.urls = `URL #${index + 1}: ${idParsed.error}`;
          break;
        }
        id = idParsed.value;
      }

      if (!url) {
        fieldErrors.urls = `URL #${index + 1} is empty. Remove blank entries and try again.`;
        break;
      }
      if (url.length > URL_MAX_LENGTH) {
        fieldErrors.urls = `URL #${index + 1} exceeds the ${URL_MAX_LENGTH.toLocaleString()}-character limit.`;
        break;
      }

      validatedItems.push({
        url,
        ...(id ? { id } : {}),
      });
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      code: "validation_error",
      httpStatus: 400,
      message: Object.values(fieldErrors)[0] ?? "Check your batch URLs.",
      fieldErrors,
    };
  }

  return {
    ok: true,
    data: {
      urls: validatedItems,
      ...(thresholdRes.ok && thresholdRes.value !== undefined
        ? { threshold: thresholdRes.value }
        : {}),
      includeDetails: parseIncludeDetails(raw.includeDetails),
    },
  };
}

function parseCsvRows(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\r") {
      if (input[i + 1] === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function normalizeJsonItem(entry: unknown): ValidatedUrlItem | null {
  if (typeof entry === "string") {
    const trimmed = entry.trim();
    return trimmed ? { url: trimmed } : null;
  }
  if (entry && typeof entry === "object") {
    const obj = entry as Record<string, unknown>;
    const rawUrl =
      obj.url ?? obj.link ?? obj.uri ?? obj.domain ?? obj.host ?? obj.text;
    if (typeof rawUrl !== "string" || !rawUrl.trim()) return null;
    const item: ValidatedUrlItem = { url: rawUrl.trim() };
    const rawId = obj.id ?? obj.record_id ?? obj.uid;
    if (typeof rawId === "string" && rawId.trim()) {
      item.id = rawId.trim();
    } else if (typeof rawId === "number") {
      item.id = String(rawId);
    }
    return item;
  }
  return null;
}

export function parseUrlBatchFile(
  bytes: Uint8Array,
  filename: string,
): UrlFileParseResult {
  if (bytes.byteLength === 0) {
    return {
      ok: false,
      code: "validation_error",
      httpStatus: 400,
      message: "The uploaded URL batch file is empty.",
      fieldErrors: {
        file: "Choose a non-empty .txt, .csv, .json, or .jsonl file.",
      },
    };
  }

  if (bytes.byteLength > FIVE_MIB) {
    return {
      ok: false,
      code: "payload_too_large",
      httpStatus: 413,
      message: "URL batch import files must be 5 MiB or smaller.",
      fieldErrors: { file: "File exceeds the 5 MiB limit." },
    };
  }

  const ext = filename.toLowerCase().split(".").pop() ?? "";
  if (!["txt", "csv", "json", "jsonl"].includes(ext)) {
    return {
      ok: false,
      code: "unsupported_content",
      httpStatus: 422,
      message:
        "Unsupported URL batch format. Upload a .txt, .csv, .json, or .jsonl file.",
      fieldErrors: { file: "Accepted formats: .txt, .csv, .json, .jsonl." },
    };
  }

  // Reject binary NUL bytes
  const sampleLen = Math.min(bytes.byteLength, 4096);
  for (let i = 0; i < sampleLen; i += 1) {
    if (bytes[i] === 0x00) {
      return {
        ok: false,
        code: "unsupported_content",
        httpStatus: 422,
        message:
          "The uploaded file appears to be binary rather than UTF-8 URL text.",
        fieldErrors: { file: "File content must be plain UTF-8 text." },
      };
    }
  }

  const decoded = new TextDecoder("utf-8", { fatal: false })
    .decode(bytes)
    .replace(/^\uFEFF/, "");

  let rawUrls: ValidatedUrlItem[] = [];

  try {
    if (ext === "txt") {
      rawUrls = decoded
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => Boolean(line) && !line.startsWith("#"))
        .map((url) => ({ url }));
    } else if (ext === "csv") {
      const rows = parseCsvRows(decoded).filter((r) =>
        r.some((cell) => cell.trim().length > 0),
      );
      if (rows.length === 0) {
        return {
          ok: false,
          code: "validation_error",
          httpStatus: 400,
          message: "No URLs were found in the uploaded CSV file.",
          fieldErrors: { file: "CSV contains no rows." },
        };
      }
      const header = rows[0].map((col) => col.trim().toLowerCase());
      const urlCol = header.findIndex((col) =>
        ["url", "urls", "link", "uri", "domain", "host", "text"].includes(col),
      );
      const idCol = header.findIndex((col) =>
        ["id", "record_id", "uid"].includes(col),
      );

      const hasHeader = urlCol !== -1 || idCol !== -1;
      const dataRows = hasHeader ? rows.slice(1) : rows;
      const effectiveUrlCol = urlCol !== -1 ? urlCol : 0;

      for (const cols of dataRows) {
        const url = (cols[effectiveUrlCol] ?? "").trim();
        if (!url) continue;
        const item: ValidatedUrlItem = { url };
        if (idCol !== -1 && cols[idCol]?.trim()) {
          item.id = cols[idCol].trim();
        }
        rawUrls.push(item);
      }
    } else if (ext === "json") {
      const parsed = JSON.parse(decoded) as unknown;
      const list = Array.isArray(parsed)
        ? parsed
        : parsed &&
            typeof parsed === "object" &&
            Array.isArray((parsed as Record<string, unknown>).urls)
          ? ((parsed as Record<string, unknown>).urls as unknown[])
          : null;

      if (!list) {
        return {
          ok: false,
          code: "unsupported_content",
          httpStatus: 422,
          message:
            "JSON batch files must contain an array of URLs or a { urls: [...] } object.",
          fieldErrors: { file: "Expected a JSON array or { urls: [...] }." },
        };
      }

      for (const entry of list) {
        const normalized = normalizeJsonItem(entry);
        if (normalized) rawUrls.push(normalized);
      }
    } else if (ext === "jsonl") {
      const lines = decoded
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      for (const line of lines) {
        const normalized = normalizeJsonItem(JSON.parse(line));
        if (normalized) rawUrls.push(normalized);
      }
    }
  } catch {
    return {
      ok: false,
      code: "unsupported_content",
      httpStatus: 422,
      message: `Could not parse the uploaded .${ext} file. Verify its formatting and try again.`,
      fieldErrors: { file: `Malformed .${ext} content.` },
    };
  }

  const batchValidation = validateUrlBatchPayload({ urls: rawUrls });
  if (!batchValidation.ok) {
    return {
      ...batchValidation,
      fieldErrors: { file: batchValidation.message },
    };
  }

  return { ok: true, urls: batchValidation.data.urls };
}
