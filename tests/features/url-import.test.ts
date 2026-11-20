import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseUrlBatchFile,
  validateUrlBatchPayload,
  validateUrlSinglePayload,
} from "../../lib/features/server/url-import.ts";

describe("URL single & batch validation and file import", () => {
  it("validates a single HTTP(S) URL or bare host with optional reference ID and threshold", () => {
    const result = validateUrlSinglePayload({
      url: "  https://example.test/login?verify=1  ",
      id: "url-01",
      threshold: 0.45,
      includeDetails: true,
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.url, "https://example.test/login?verify=1");
      assert.equal(result.data.id, "url-01");
      assert.equal(result.data.threshold, 0.45);
      assert.equal(result.data.includeDetails, true);
    }
  });

  it("rejects empty whitespace URLs, >8,192-char URLs, >128-char IDs, and out-of-range thresholds", () => {
    const empty = validateUrlSinglePayload({ url: "   \n  " });
    assert.equal(empty.ok, false);

    const tooLong = validateUrlSinglePayload({
      url: `https://example.test/${"a".repeat(8_190)}`,
    });
    assert.equal(tooLong.ok, false);

    const badId = validateUrlSinglePayload({
      url: "https://example.test",
      id: "x".repeat(129),
    });
    assert.equal(badId.ok, false);

    const badThreshold = validateUrlSinglePayload({
      url: "https://example.test",
      threshold: 1.5,
    });
    assert.equal(badThreshold.ok, false);
  });

  it("rejects batch payloads with 0 items or more than 256 items", () => {
    const empty = validateUrlBatchPayload({ urls: [] });
    assert.equal(empty.ok, false);

    const tooMany = validateUrlBatchPayload({
      urls: Array.from({ length: 257 }, (_, i) => ({
        url: `https://example.test/${i}`,
      })),
    });
    assert.equal(tooMany.ok, false);
  });

  it("parses .txt line-delimited URL batch files while skipping blanks and # comment lines", () => {
    const txt =
      "# Exported suspicious URLs\nhttps://example.test/one\n\n  # comment two\nexample.test/two\r\n";
    const bytes = new TextEncoder().encode(txt);
    const parsed = parseUrlBatchFile(bytes, "urls.txt");
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.equal(parsed.urls.length, 2);
      assert.equal(parsed.urls[0]?.url, "https://example.test/one");
      assert.equal(parsed.urls[1]?.url, "example.test/two");
    }
  });

  it("parses .csv files with url/link/domain headers, quoted commas, and optional id columns", () => {
    const csv =
      'id,url\nrec-1,"https://example.test/path?a=1,2"\nrec-2,bare-domain.example.test';
    const parsed = parseUrlBatchFile(new TextEncoder().encode(csv), "links.csv");
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.equal(parsed.urls.length, 2);
      assert.equal(parsed.urls[0]?.id, "rec-1");
      assert.equal(parsed.urls[0]?.url, "https://example.test/path?a=1,2");
      assert.equal(parsed.urls[1]?.id, "rec-2");
      assert.equal(parsed.urls[1]?.url, "bare-domain.example.test");
    }
  });

  it("parses .json arrays, { urls } wrappers, and .jsonl files", () => {
    const jsonPayload = JSON.stringify({
      urls: [
        "https://example.test/a",
        { url: "https://example.test/b", id: "item-b" },
      ],
    });
    const parsedJson = parseUrlBatchFile(
      new TextEncoder().encode(jsonPayload),
      "urls.json",
    );
    assert.equal(parsedJson.ok, true);
    if (parsedJson.ok) {
      assert.equal(parsedJson.urls.length, 2);
      assert.equal(parsedJson.urls[1]?.id, "item-b");
    }

    const jsonlPayload =
      '{"url":"https://example.test/1","id":"u1"}\n"https://example.test/2"\n';
    const parsedJsonl = parseUrlBatchFile(
      new TextEncoder().encode(jsonlPayload),
      "urls.jsonl",
    );
    assert.equal(parsedJsonl.ok, true);
    if (parsedJsonl.ok) {
      assert.equal(parsedJsonl.urls.length, 2);
      assert.equal(parsedJsonl.urls[0]?.id, "u1");
      assert.equal(parsedJsonl.urls[1]?.url, "https://example.test/2");
    }
  });

  it("rejects binary files, unsupported extensions, comment-only files, and >256 rows", () => {
    const badExt = parseUrlBatchFile(new Uint8Array([65]), "data.pdf");
    assert.equal(badExt.ok, false);

    const binaryBytes = new Uint8Array([104, 116, 116, 112, 0, 115]);
    const binaryRes = parseUrlBatchFile(binaryBytes, "binary.txt");
    assert.equal(binaryRes.ok, false);

    const commentOnly = parseUrlBatchFile(
      new TextEncoder().encode("# only comment\n   \n"),
      "comments.txt",
    );
    assert.equal(commentOnly.ok, false);

    const manyLines = Array.from(
      { length: 257 },
      (_, i) => `https://example.test/${i}`,
    ).join("\n");
    const overLimit = parseUrlBatchFile(
      new TextEncoder().encode(manyLines),
      "big.txt",
    );
    assert.equal(overLimit.ok, false);
  });
});
