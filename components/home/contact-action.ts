"use server";

import { createHash, randomUUID } from "node:crypto";
import { contactFields, contactFormEnabled, contactFormUnavailableMessage, type ContactState } from "@/lib/contact-fields";
import { siteContact } from "@/lib/site-contact";

export async function sendContactMessage(
  _previousState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const id = randomUUID();
  const values = { name: "", company: "", email: "", subject: "", message: "" };
  const errors: Partial<Record<keyof typeof values, string>> = {};

  for (const { name, label, required, maxLength } of contactFields) {
    const entry = formData.get(name);
    const value = typeof entry === "string" ? entry : "";
    values[name] = value.slice(0, maxLength);

    if (required && !value.trim()) {
      errors[name] = `${label} is required.`;
    } else if (value.length > maxLength) {
      errors[name] = `${label} must be ${maxLength} characters or fewer.`;
    }
  }

  if (!contactFormEnabled) {
    return { status: "error", id, message: contactFormUnavailableMessage, values };
  }

  const email = values.email.trim();
  if (!errors.email && !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/u.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (Object.keys(errors).length) {
    return { status: "error", id, message: "Check the highlighted fields and try again.", values, errors };
  }

  const sendError = {
    status: "error",
    id,
    message: "We couldn’t send your message. Try again or use the contact details in the footer.",
    values,
  } as const;
  const { RESEND_API_KEY, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL } = process.env;

  if (formData.get("company_website") || !RESEND_API_KEY || !CONTACT_FROM_EMAIL) {
    return sendError;
  }

  const company = values.company.trim();
  const body = JSON.stringify({
    from: CONTACT_FROM_EMAIL,
    to: [CONTACT_TO_EMAIL?.trim() || siteContact.email],
    reply_to: email,
    subject: "Vanguard AV website inquiry",
    text: [
      `Name: ${values.name.trim()}`,
      `Email: ${email}`,
      `Subject: ${values.subject.trim() || "General inquiry"}`,
      ...(company ? [`Company: ${company}`] : []),
      "",
      values.message.trim(),
    ].join("\n"),
  });

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `website-contact/${createHash("sha256").update(body).digest("hex")}`,
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return sendError;
  } catch {
    return sendError;
  }

  return { status: "success", id, message: "Thanks for reaching out. Your message was sent." };
}
