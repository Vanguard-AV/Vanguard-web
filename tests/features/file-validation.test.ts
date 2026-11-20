import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  validateEmailBytes,
  validateExeBytes,
  validateExeOptions,
  validateOfficeBytes,
  validatePdfBytes,
  validatePdfOptions,
} from "../../lib/features/server/file-validation.ts";

function buildInertPeStub(): Uint8Array {
  const bytes = new Uint8Array(128);
  bytes[0] = 0x4d; // M
  bytes[1] = 0x5a; // Z
  // e_lfanew = 0x40 (64) little-endian at offset 0x3C
  bytes[0x3c] = 0x40;
  bytes[0x3d] = 0x00;
  bytes[0x3e] = 0x00;
  bytes[0x3f] = 0x00;
  // PE\0\0 signature at offset 0x40
  bytes[0x40] = 0x50; // P
  bytes[0x41] = 0x45; // E
  bytes[0x42] = 0x00;
  bytes[0x43] = 0x00;
  return bytes;
}

describe("server-side file content & option validation", () => {
  it("accepts valid RFC 5322 .eml bytes and rejects empty, oversized, or disguised files", () => {
    const valid = new TextEncoder().encode(
      "From: alice@example.test\r\nTo: bob@example.test\r\nSubject: Status\r\n\r\nHello.",
    );
    assert.equal(validateEmailBytes(valid).ok, true);

    assert.equal(validateEmailBytes(new Uint8Array()).ok, false);

    const fakeEml = new TextEncoder().encode("Just plain text without headers");
    const disguised = validateEmailBytes(fakeEml);
    assert.equal(disguised.ok, false);
    if (!disguised.ok) assert.equal(disguised.code, "unsupported_content");

    const pngAsEml = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    assert.equal(validateEmailBytes(pngAsEml).ok, false);

    const oversized = new Uint8Array(5 * 1024 * 1024 + 1);
    const overRes = validateEmailBytes(oversized);
    assert.equal(overRes.ok, false);
    if (!overRes.ok) assert.equal(overRes.code, "payload_too_large");
  });

  it("accepts valid Office formats (OOXML ZIP, OLE2, RTF, XML) and rejects renamed plain text or PNG", () => {
    const zipBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
    assert.equal(validateOfficeBytes(zipBytes).ok, true);

    const oleBytes = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
    assert.equal(validateOfficeBytes(oleBytes).ok, true);

    const rtfBytes = new TextEncoder().encode("{\\rtf1\\ansi Inert test document.}");
    assert.equal(validateOfficeBytes(rtfBytes).ok, true);

    const xmlBytes = new TextEncoder().encode('<?xml version="1.0"?><Workbook/>');
    assert.equal(validateOfficeBytes(xmlBytes).ok, true);

    const disguised = validateOfficeBytes(
      new TextEncoder().encode("not an office document"),
    );
    assert.equal(disguised.ok, false);
    if (!disguised.ok) assert.equal(disguised.code, "unsupported_content");
  });

  it("accepts valid %PDF- files (including minor leading offset) and rejects disguised files", () => {
    const pdf = new TextEncoder().encode("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF");
    assert.equal(validatePdfBytes(pdf).ok, true);

    const fakePdf = new TextEncoder().encode("hello world renamed to .pdf");
    const res = validatePdfBytes(fakePdf);
    assert.equal(res.ok, false);
    if (!res.ok) assert.equal(res.code, "unsupported_content");
  });

  it("validates PDF analyst options within canonical bounds", () => {
    assert.equal(
      validatePdfOptions({
        threshold: "0.75",
        estimator: "lgbm",
        deepInspection: "false",
        includeFeatures: "true",
      }).ok,
      true,
    );

    assert.equal(
      validatePdfOptions({ threshold: "1.5", estimator: "ensemble" }).ok,
      false,
    );
    assert.equal(
      validatePdfOptions({ threshold: "0.5", estimator: "invalid_est" }).ok,
      false,
    );
  });

  it("accepts valid synthetic PE header stubs and rejects disguised .exe files", () => {
    assert.equal(validateExeBytes(buildInertPeStub()).ok, true);

    const plainTextExe = new TextEncoder().encode("hello world renamed to exe");
    const res = validateExeBytes(plainTextExe);
    assert.equal(res.ok, false);
    if (!res.ok) assert.equal(res.code, "unsupported_content");

    const badPeOffset = new Uint8Array(128);
    badPeOffset[0] = 0x4d;
    badPeOffset[1] = 0x5a;
    badPeOffset[0x3c] = 0x40;
    // Missing PE\0\0 at 0x40
    assert.equal(validateExeBytes(badPeOffset).ok, false);
  });

  it("validates EXE analyst options within canonical bounds", () => {
    const ok = validateExeOptions({
      operatingPoint: "fpr_0.1pct",
      threshold: "0.42",
      modelType: "hybrid",
      deepInspection: "true",
    });
    assert.equal(ok.ok, true);

    assert.equal(
      validateExeOptions({ operatingPoint: "bogus" }).ok,
      false,
    );
    assert.equal(
      validateExeOptions({ threshold: "-0.1" }).ok,
      false,
    );
    assert.equal(
      validateExeOptions({ modelType: "unknown" }).ok,
      false,
    );
  });
});
