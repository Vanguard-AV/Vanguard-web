"use client";

import { useActionState, type ReactNode } from "react";
import ContactWithGlobe from "@/components/ui/contact-with-globe";
import { contactFormEnabled, contactFormUnavailableMessage, type ContactState } from "@/lib/contact-fields";
import { sendContactMessage } from "./contact-action";

const initialState: ContactState = { status: "idle" };

export function HomeContactForm({ title, details }: { title: ReactNode; details: ReactNode }) {
  const [state, formAction, pending] = useActionState(sendContactMessage, initialState, "/#contact");

  return (
    <ContactWithGlobe
      id="contact"
      title={title}
      description="Get help with Vanguard AV or ask about access and licensing."
      details={details}
      includeCompany
      includeSubject
      disabledMessage={contactFormEnabled ? undefined : contactFormUnavailableMessage}
      isSubmitting={pending}
      submissionState={state}
      className="mx-auto mb-12 w-full max-w-[70rem] border-b border-outline py-0 pb-8 sm:py-0 sm:pb-8 md:mb-16 md:[@media(max-height:700px)]:pb-4"
      formProps={{
        action: formAction,
        "aria-label": "Contact Vanguard AV",
        children: (
          <div hidden>
            <label>
              Company website
              <input type="text" name="company_website" autoComplete="off" tabIndex={-1} />
            </label>
          </div>
        ),
      }}
    />
  );
}
