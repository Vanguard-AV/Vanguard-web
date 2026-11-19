export const contactFormEnabled = false;
export const contactFormUnavailableMessage =
  "Message submissions are temporarily unavailable. You can reach us using the contact details in the footer.";

export const contactFields = [
  { name: "name", label: "Name", required: true, maxLength: 120 },
  { name: "company", label: "Company", required: false, maxLength: 120 },
  { name: "email", label: "Email", required: true, maxLength: 254 },
  { name: "subject", label: "Subject", required: false, maxLength: 160 },
  { name: "message", label: "Message", required: true, maxLength: 4000 },
] as const;

type ContactField = (typeof contactFields)[number]["name"];

export type ContactState =
  | { status: "idle" }
  | { status: "success"; id: string; message: string }
  | {
      status: "error";
      id: string;
      message: string;
      values: Record<ContactField, string>;
      errors?: Partial<Record<ContactField, string>>;
    };
