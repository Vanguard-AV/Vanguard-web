import {
  FIVE_MIB,
  SMS_MAX_BATCH_ITEMS,
  SMS_MAX_META_LENGTH,
  SMS_MAX_TEXT_LENGTH,
} from "../catalog.ts";

export interface ValidatedSmsItem {
  text: string;
  sender?: string;
  id?: string;
}

export interface ValidatedSmsSingleRequest {
  text: string;
  sender?: string;
  id?: string;
  threshold?: number;
  includeDetails: boolean;
}

export interface ValidatedSmsBatchRequest {
  messages: ValidatedSmsItem[];
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

export type SmsValidationResult<T> = { ok: true; data: T } | ValidationFailure;

export type SmsFileParseResult =
  | { ok: true; messages: ValidatedSmsItem[] }
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

function parseOptionalMeta(
  raw: unknown,
  fieldLabel: string,
): { ok: true; value: string | undefined } | { ok: false; error: string } {
  if (raw === undefined || raw === null) return { ok: true, value: undefined };
  if (typeof raw !== "string") {
    return { ok: false, error: `${fieldLabel} must be text.` };
  }
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, value: undefined };
  if (trimmed.length > SMS_MAX_META_LENGTH) {
    return {
      ok: false,
      error: `${fieldLabel} must be ${SMS_MAX_META_LENGTH} characters or fewer.`,
    };
  }
  return { ok: true, value: trimmed };
}

function parseIncludeDetails(raw: unknown): boolean {
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "string") return raw.toLowerCase() !== "false";
  return true;
}

export function validateSmsSinglePayload(
  raw: Record<string, unknown>,
): SmsValidationResult<ValidatedSmsSingleRequest> {
  const fieldErrors: Record<string, string> = {};
  const textRaw = typeof raw.text === "string" ? raw.text : "";
  const trimmed = textRaw.trim();

  if (!trimmed) {
    fieldErrors.text = "Enter an SMS message to inspect.";
  } else if (textRaw.length > SMS_MAX_TEXT_LENGTH) {
    fieldErrors.text = `SMS messages must be ${SMS_MAX_TEXT_LENGTH.toLocaleString()} characters or fewer.`;
  }

  const senderRes = parseOptionalMeta(raw.sender, "Sender");
  if (!senderRes.ok) fieldErrors.sender = senderRes.error;

  const idRes = parseOptionalMeta(raw.id, "Reference ID");
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
      text: trimmed,
      ...(senderRes.ok && senderRes.value ? { sender: senderRes.value } : {}),
      ...(idRes.ok && idRes.value ? { id: idRes.value } : {}),
      ...(thresholdRes.ok && thresholdRes.value !== undefined
        ? { threshold: thresholdRes.value }
        : {}),
      includeDetails: parseIncludeDetails(raw.includeDetails),
    },
  };
}

export function validateSmsBatchPayload(
  raw: Record<string, unknown>,
): SmsValidationResult<ValidatedSmsBatchRequest> {
  const fieldErrors: Record<string, string> = {};
  const thresholdRes = parseOptionalThreshold(raw.threshold);
  if (!thresholdRes.ok) fieldErrors.threshold = thresholdRes.error;

  if (!Array.isArray(raw.messages) || raw.messages.length === 0) {
    fieldErrors.messages = "Provide at least 1 SMS message to inspect.";
  } else if (raw.messages.length > SMS_MAX_BATCH_ITEMS) {
    fieldErrors.messages = `Batch scans accept at most ${SMS_MAX_BATCH_ITEMS} messages at a time (received ${raw.messages.length}).`;
  }

  const validatedItems: ValidatedSmsItem[] = [];

  if (Array.isArray(raw.messages) && !fieldErrors.messages) {
    for (let index = 0; index < raw.messages.length; index += 1) {
      const entry = raw.messages[index];
      let text = "";
      let sender: string | undefined;
      let id: string | undefined;

      if (typeof entry === "string") {
        text = entry.trim();
      } else if (entry && typeof entry === "object") {
        const obj = entry as Record<string, unknown>;
        text = typeof obj.text === "string" ? obj.text.trim() : "";
        const s = parseOptionalMeta(obj.sender, "Sender");
        if (!s.ok) {
          fieldErrors.messages = `Message #${index + 1}: ${s.error}`;
          break;
        }
        sender = s.value;
        const idParsed = parseOptionalMeta(obj.id, "Reference ID");
        if (!idParsed.ok) {
          fieldErrors.messages = `Message #${index + 1}: ${idParsed.error}`;
          break;
        }
        id = idParsed.value;
      }

      if (!text) {
        fieldErrors.messages = `Message #${index + 1} is empty. Remove blank entries and try again.`;
        break;
      }
      if (text.length > SMS_MAX_TEXT_LENGTH) {
        fieldErrors.messages = `Message #${index + 1} exceeds the ${SMS_MAX_TEXT_LENGTH.toLocaleString()}-character limit.`;
        break;
      }

      validatedItems.push({
        text,
        ...(sender ? { sender } : {}),
        ...(id ? { id } : {}),
      });
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      code: "validation_error",
      httpStatus: 400,
      message: Object.values(fieldErrors)[0] ?? "Check your batch messages.",
      fieldErrors,
    };
  }

  return {
    ok: true,
    data: {
      messages: validatedItems,
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

function normalizeJsonItem(entry: unknown): ValidatedSmsItem | null {
  if (typeof entry === "string") {
    const trimmed = entry.trim();
    return trimmed ? { text: trimmed } : null;
  }
  if (entry && typeof entry === "object") {
    const obj = entry as Record<string, unknown>;
    const rawText = obj.text ?? obj.message ?? obj.body ?? obj.sms;
    if (typeof rawText !== "string" || !rawText.trim()) return null;
    const item: ValidatedSmsItem = { text: rawText.trim() };
    if (typeof obj.sender === "string" && obj.sender.trim()) {
      item.sender = obj.sender.trim();
    }
    if (typeof obj.id === "string" && obj.id.trim()) {
      item.id = obj.id.trim();
    } else if (typeof obj.id === "number") {
      item.id = String(obj.id);
    }
    return item;
  }
  return null;
}

export function parseSmsBatchFile(
  bytes: Uint8Array,
  filename: string,
): SmsFileParseResult {
  if (bytes.byteLength === 0) {
    return {
      ok: false,
      code: "validation_error",
      httpStatus: 400,
      message: "The uploaded SMS batch file is empty.",
      fieldErrors: { file: "Choose a non-empty .txt, .csv, .json, or .jsonl file." },
    };
  }

  if (bytes.byteLength > FIVE_MIB) {
    return {
      ok: false,
      code: "payload_too_large",
      httpStatus: 413,
      message: "SMS batch import files must be 5 MiB or smaller.",
      fieldErrors: { file: "File exceeds the 5 MiB limit." },
    };
  }

  const ext = filename.toLowerCase().split(".").pop() ?? "";
  if (!["txt", "csv", "json", "jsonl"].includes(ext)) {
    return {
      ok: false,
      code: "unsupported_content",
      httpStatus: 422,
      message: "Unsupported SMS batch format. Upload a .txt, .csv, .json, or .jsonl file.",
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
        message: "The uploaded file appears to be binary rather than UTF-8 SMS text.",
        fieldErrors: { file: "File content must be plain UTF-8 text." },
      };
    }
  }

  const decoded = new TextDecoder("utf-8", { fatal: false })
    .decode(bytes)
    .replace(/^\uFEFF/, "");

  let rawMessages: ValidatedSmsItem[] = [];

  try {
    if (ext === "txt") {
      rawMessages = decoded
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((text) => ({ text }));
    } else if (ext === "csv") {
      const rows = parseCsvRows(decoded).filter((r) =>
        r.some((cell) => cell.trim().length > 0),
      );
      if (rows.length === 0) {
        return {
          ok: false,
          code: "validation_error",
          httpStatus: 400,
          message: "No SMS messages were found in the uploaded CSV file.",
          fieldErrors: { file: "CSV contains no rows." },
        };
      }
      const header = rows[0].map((col) => col.trim().toLowerCase());
      const textCol = header.findIndex((col) =>
        ["text", "message", "body", "sms", "content"].includes(col),
      );
      const senderCol = header.findIndex((col) =>
        ["sender", "from", "phone"].includes(col),
      );
      const idCol = header.findIndex((col) => col === "id");

      const hasHeader = textCol !== -1 || senderCol !== -1 || idCol !== -1;
      const dataRows = hasHeader ? rows.slice(1) : rows;
      const effectiveTextCol = textCol !== -1 ? textCol : 0;

      for (const cols of dataRows) {
        const text = (cols[effectiveTextCol] ?? "").trim();
        if (!text) continue;
        const item: ValidatedSmsItem = { text };
        if (senderCol !== -1 && cols[senderCol]?.trim()) {
          item.sender = cols[senderCol].trim();
        }
        if (idCol !== -1 && cols[idCol]?.trim()) {
          item.id = cols[idCol].trim();
        }
        rawMessages.push(item);
      }
    } else if (ext === "json") {
      const parsed = JSON.parse(decoded) as unknown;
      const list = Array.isArray(parsed)
        ? parsed
        : parsed &&
            typeof parsed === "object" &&
            Array.isArray((parsed as Record<string, unknown>).messages)
          ? ((parsed as Record<string, unknown>).messages as unknown[])
          : null;

      if (!list) {
        return {
          ok: false,
          code: "unsupported_content",
          httpStatus: 422,
          message:
            "JSON batch files must contain an array of messages or a { messages: [...] } object.",
          fieldErrors: { file: "Expected a JSON array or { messages: [...] }." },
        };
      }

      for (const entry of list) {
        const normalized = normalizeJsonItem(entry);
        if (normalized) rawMessages.push(normalized);
      }
    } else if (ext === "jsonl") {
      const lines = decoded
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      for (const line of lines) {
        const normalized = normalizeJsonItem(JSON.parse(line));
        if (normalized) rawMessages.push(normalized);
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

  const batchValidation = validateSmsBatchPayload({ messages: rawMessages });
  if (!batchValidation.ok) {
    return {
      ...batchValidation,
      fieldErrors: { file: batchValidation.message },
    };
  }

  return { ok: true, messages: batchValidation.data.messages };
}
