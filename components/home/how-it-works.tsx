"use client";

import {
  IconChevronRight,
  IconFileTypePdf,
  IconLink,
  IconMail,
} from "@tabler/icons-react";
import { Tabs } from "radix-ui";
import styles from "./how-it-works.module.css";

const examples = [
  {
    id: "link",
    label: "Delivery link",
    icon: IconLink,
    input: "delivery-update.example/verify",
    finding: "Possible delivery impersonation",
    evidence: "The link asks you to verify a delivery on an unfamiliar domain.",
    scope:
      "Vanguard checks the domain and path for phishing signals without visiting the site.",
    action: "Check the delivery in the carrier’s official app.",
  },
  {
    id: "email",
    label: "Account email",
    icon: IconMail,
    input: "Your account will be suspended",
    finding: "Sender and reply-to domains differ",
    evidence: "Replies would go to a different domain from the sender’s.",
    scope:
      "Vanguard checks the addresses, wording, and links for signs of impersonation.",
    action: "Open your account from a saved bookmark to check for alerts.",
  },
  {
    id: "file",
    label: "PDF invoice",
    icon: IconFileTypePdf,
    input: "supplier-invoice.pdf",
    finding: "Embedded script found",
    evidence:
      "The invoice contains code that a PDF reader could run when you open the file.",
    scope:
      "Vanguard checks the PDF's structure and embedded content without executing it.",
    action: "Confirm the invoice with the supplier before opening it.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="bg-canvas py-[clamp(4.5rem,9vw,8rem)] text-foreground selection:bg-accent selection:text-canvas"
    >
      <Tabs.Root
        defaultValue="link"
        orientation="vertical"
        className={styles.layout}
      >
        <div>
          <h2
            id="how-it-works-title"
            tabIndex={-1}
            className="text-[clamp(2.75rem,5.2vw,5rem)] leading-[0.98] font-medium tracking-[-0.03em] text-balance"
          >
            How it works
          </h2>
          <p className="mt-4 max-w-[34ch] text-base leading-relaxed text-muted-foreground lg:text-lg">
            Choose an example to see what Vanguard checks, what it flags, and
            how you can respond.
          </p>

          <Tabs.List aria-label="Scan examples" className={styles.examples}>
            {examples.map(({ id, label, icon: Icon }) => (
              <Tabs.Trigger key={id} value={id} className={styles.example}>
                <Icon aria-hidden="true" size={20} stroke={1.5} />
                <span>{label}</span>
                <IconChevronRight aria-hidden="true" size={16} stroke={1.5} />
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </div>

        {examples.map(({ id, input, finding, evidence, scope, action }) => (
          <Tabs.Content key={id} value={id} className={styles.report}>
            <p className={styles.reportLabel}>Sample scan report</p>
            <p className={styles.input}>{input}</p>
            <h3 className={styles.finding}>{finding}</h3>
            <p className={styles.evidence}>{evidence}</p>

            <div className={styles.nextStep}>
              <p className="font-semibold">Next step</p>
              <p>{action}</p>
            </div>

            <details className={styles.scope}>
              <summary>What Vanguard checks</summary>
              <p>{scope}</p>
            </details>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </section>
  );
}
