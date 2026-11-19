"use client";

import ContactWithGlobe from "@/components/ui/contact-with-globe";

export default function ContactWithGlobeDemo() {
  return (
    <ContactWithGlobe
      title="Get in touch"
      includeCompany
      labels={{ success: "Demo submitted successfully." }}
      onSubmit={async () => {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }}
    />
  );
}
