import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseSmsBatchFile,
  validateSmsBatchPayload,
  validateSmsSinglePayload,
} from "../../lib/features/server/sms-import.ts";

describe("SMS single & batch validation and file import", () => {
  it("validates a single multilingual SMS message with optional metadata", () => {
    const result = validateSmsSinglePayload({
      text: "تم تأكيد موعدك غداً الساعة 10 صباحاً",
      sender: "Clinic",
      id: "msg-01",
      threshold: 0.45,
      includeDetails: true,
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.text, "تم تأكيد موعدك غداً الساعة 10 صباحاً");
      assert.equal(result.data.sender, "Clinic");
      assert.equal(result.data.threshold, 0.45);
    }
  });

  it("rejects empty whitespace SMS, >20,000-char SMS, and out-of-range thresholds", () => {
    const empty = validateSmsSinglePayload({ text: "   \n  " });
    assert.equal(empty.ok, false);

    const tooLong = validateSmsSinglePayload({ text: "a".repeat(20_001) });
    assert.equal(tooLong.ok, false);

    const badThreshold = validateSmsSinglePayload({
      text: "Hello",
      threshold: 1.2,
    });
    assert.equal(badThreshold.ok, false);
  });

  it("rejects batch payloads with 0 items or more than 256 items", () => {
    const empty = validateSmsBatchPayload({ messages: [] });
    assert.equal(empty.ok, false);

    const tooMany = validateSmsBatchPayload({
      messages: Array.from({ length: 257 }, (_, i) => ({ text: `msg ${i}` })),
    });
    assert.equal(tooMany.ok, false);
  });

  it("parses .txt line-delimited SMS batch files", () => {
    const bytes = new TextEncoder().encode("First message\n\nSecond message\r\n");
    const parsed = parseSmsBatchFile(bytes, "batch.txt");
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.equal(parsed.messages.length, 2);
      assert.equal(parsed.messages[0]?.text, "First message");
      assert.equal(parsed.messages[1]?.text, "Second message");
    }
  });

  it("parses .csv files with quoted commas, text, sender, and id columns", () => {
    const csv =
      'id,sender,text\n1,Bank,"Alert, verify https://example.test/ok"\n2,Friend,"See you at 6"';
    const parsed = parseSmsBatchFile(new TextEncoder().encode(csv), "alerts.csv");
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.equal(parsed.messages.length, 2);
      assert.equal(parsed.messages[0]?.sender, "Bank");
      assert.equal(
        parsed.messages[0]?.text,
        "Alert, verify https://example.test/ok",
      );
      assert.equal(parsed.messages[1]?.id, "2");
    }
  });

  it("parses .json arrays, { messages } wrappers, and .jsonl files", () => {
    const jsonPayload = JSON.stringify({
      messages: ["Simple text", { text: "Structured text", sender: "Notice" }],
    });
    const parsedJson = parseSmsBatchFile(
      new TextEncoder().encode(jsonPayload),
      "items.json",
    );
    assert.equal(parsedJson.ok, true);
    if (parsedJson.ok) {
      assert.equal(parsedJson.messages.length, 2);
      assert.equal(parsedJson.messages[1]?.sender, "Notice");
    }

    const jsonlPayload =
      '{"text":"Line one","id":"a"}\n"Line two"\n';
    const parsedJsonl = parseSmsBatchFile(
      new TextEncoder().encode(jsonlPayload),
      "items.jsonl",
    );
    assert.equal(parsedJsonl.ok, true);
    if (parsedJsonl.ok) {
      assert.equal(parsedJsonl.messages.length, 2);
      assert.equal(parsedJsonl.messages[0]?.id, "a");
      assert.equal(parsedJsonl.messages[1]?.text, "Line two");
    }
  });

  it("rejects unsupported import extensions, oversized files, and >256 rows", () => {
    const badExt = parseSmsBatchFile(new Uint8Array([65]), "data.pdf");
    assert.equal(badExt.ok, false);

    const manyLines = Array.from({ length: 257 }, (_, i) => `msg ${i}`).join("\n");
    const overLimit = parseSmsBatchFile(
      new TextEncoder().encode(manyLines),
      "big.txt",
    );
    assert.equal(overLimit.ok, false);
  });
});
