import {
  SINGLE_SCAN_TIMEOUT_MS,
  SMS_BATCH_TIMEOUT_MS,
} from "@/lib/features/catalog";
import { postGatewayJson } from "@/lib/features/server/gateway-client";
import {
  mapSmsBatchResponse,
  mapSmsSingleResponse,
} from "@/lib/features/server/mappers";
import {
  enforceScanRateLimit,
  handleRouteError,
  sanitizeDisplayFilename,
  scanErrorResponse,
  scanSuccessResponse,
} from "@/lib/features/server/route-helpers";
import {
  parseSmsBatchFile,
  validateSmsBatchPayload,
  validateSmsSinglePayload,
} from "@/lib/features/server/sms-import";

export const maxDuration = 65;

export async function POST(request: Request) {
  const rateLimited = enforceScanRateLimit(request);
  if (rateLimited) return rateLimited;

  const contentType = (request.headers.get("content-type") ?? "").toLowerCase();

  try {
    if (contentType.includes("multipart/form-data")) {
      let formData: FormData;
      try {
        formData = await request.formData();
      } catch {
        return scanErrorResponse({
          status: 400,
          code: "validation_error",
          message: "Could not read the uploaded batch form data. Try selecting the file again.",
          retryable: false,
        });
      }

      const fileEntry = formData.get("file");
      if (!(fileEntry instanceof File)) {
        return scanErrorResponse({
          status: 400,
          code: "validation_error",
          message: "Choose a .txt, .csv, .json, or .jsonl file to scan.",
          fieldErrors: { file: "Select a supported SMS batch file." },
          retryable: false,
        });
      }

      const filename = sanitizeDisplayFilename(fileEntry.name, "messages.txt");
      const bytes = new Uint8Array(await fileEntry.arrayBuffer());
      const parsed = parseSmsBatchFile(bytes, filename);
      if (!parsed.ok) {
        return scanErrorResponse({
          status: parsed.httpStatus,
          code: parsed.code,
          message: parsed.message,
          fieldErrors: parsed.fieldErrors,
          retryable: false,
        });
      }

      const rawThreshold = formData.get("threshold");
      const rawIncludeDetails = formData.get("includeDetails");
      const validated = validateSmsBatchPayload({
        messages: parsed.messages,
        threshold: typeof rawThreshold === "string" ? rawThreshold : undefined,
        includeDetails:
          typeof rawIncludeDetails === "string" ? rawIncludeDetails : true,
      });

      if (!validated.ok) {
        return scanErrorResponse({
          status: validated.httpStatus,
          code: validated.code,
          message: validated.message,
          fieldErrors: validated.fieldErrors,
          retryable: false,
        });
      }

      const upstream = await postGatewayJson({
        endpoint: "smsBatch",
        payload: {
          messages: validated.data.messages,
          ...(validated.data.threshold !== undefined
            ? { threshold: validated.data.threshold }
            : {}),
          include_details: validated.data.includeDetails,
        },
        timeoutMs: SMS_BATCH_TIMEOUT_MS,
      });

      const outcome = mapSmsBatchResponse(upstream, {
        label: `${filename} (${validated.data.messages.length} messages)`,
        customThreshold: validated.data.threshold !== undefined,
      });
      return scanSuccessResponse(outcome);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return scanErrorResponse({
        status: 400,
        code: "validation_error",
        message: "Malformed SMS scan request. Verify your message input and try again.",
        retryable: false,
      });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return scanErrorResponse({
        status: 400,
        code: "validation_error",
        message: "Provide an SMS message or batch list to scan.",
        retryable: false,
      });
    }

    const record = body as Record<string, unknown>;
    const mode = record.mode === "batch" ? "batch" : "single";

    if (mode === "batch") {
      const validated = validateSmsBatchPayload(record);
      if (!validated.ok) {
        return scanErrorResponse({
          status: validated.httpStatus,
          code: validated.code,
          message: validated.message,
          fieldErrors: validated.fieldErrors,
          retryable: false,
        });
      }

      const upstream = await postGatewayJson({
        endpoint: "smsBatch",
        payload: {
          messages: validated.data.messages,
          ...(validated.data.threshold !== undefined
            ? { threshold: validated.data.threshold }
            : {}),
          include_details: validated.data.includeDetails,
        },
        timeoutMs: SMS_BATCH_TIMEOUT_MS,
      });

      const outcome = mapSmsBatchResponse(upstream, {
        customThreshold: validated.data.threshold !== undefined,
      });
      return scanSuccessResponse(outcome);
    }

    const validated = validateSmsSinglePayload(record);
    if (!validated.ok) {
      return scanErrorResponse({
        status: validated.httpStatus,
        code: validated.code,
        message: validated.message,
        fieldErrors: validated.fieldErrors,
        retryable: false,
      });
    }

    const upstream = await postGatewayJson({
      endpoint: "smsSingle",
      payload: {
        text: validated.data.text,
        ...(validated.data.sender ? { sender: validated.data.sender } : {}),
        ...(validated.data.id ? { id: validated.data.id } : {}),
        ...(validated.data.threshold !== undefined
          ? { threshold: validated.data.threshold }
          : {}),
        include_details: validated.data.includeDetails,
      },
      timeoutMs: SINGLE_SCAN_TIMEOUT_MS,
    });

    const outcome = mapSmsSingleResponse(upstream);
    return scanSuccessResponse(outcome);
  } catch (error) {
    return handleRouteError(error);
  }
}
