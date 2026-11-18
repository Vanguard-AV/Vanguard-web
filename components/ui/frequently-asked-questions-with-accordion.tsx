"use client";

import { Fragment, useId, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useReducedMotion } from "@/lib/reduced-motion";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: ReactNode;
}

interface FrequentlyAskedQuestionsProps {
  id?: string;
  title?: string;
  description?: string;
  data: readonly FAQItem[];
  className?: string;
  supportEmail?: string;
}

const reveal = { y: [8, 0], opacity: [0.75, 1] };

export default function FrequentlyAskedQuestions({
  id,
  title = "Frequently asked questions",
  description,
  data,
  className,
  supportEmail,
}: FrequentlyAskedQuestionsProps) {
  const titleId = useId();
  const reducedMotion = useReducedMotion();
  const enter = reducedMotion ? undefined : reveal;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn(
        "border-t border-outline bg-canvas py-[clamp(4.5rem,9vw,8rem)] text-foreground selection:bg-accent selection:text-canvas",
        className,
      )}
    >
      <div>
        <h2
          id={titleId}
          tabIndex={-1}
          className="text-center text-4xl leading-none font-medium tracking-tight text-balance sm:text-5xl lg:text-6xl"
        >
          {title.split(/\s+/).map((word, index) => (
            <Fragment key={`${word}-${index}`}>
              {index > 0 && " "}
              <motion.span
                className="inline-block"
                whileInView={enter && { ...enter, filter: ["blur(2px)", "blur(0px)"] }}
                viewport={{ once: true }}
                transition={{ duration: 0.36, delay: index * 0.055, ease: "easeOut" }}
              >
                {word}
              </motion.span>
            </Fragment>
          ))}
        </h2>

        {(description || supportEmail) && (
          <motion.p
            whileInView={enter}
            viewport={{ once: true }}
            transition={{ duration: 0.36, delay: 0.12, ease: "easeOut" }}
            className="mx-auto mt-4 max-w-lg text-center text-base leading-relaxed text-balance text-muted-foreground sm:text-lg"
          >
            {description}
            {supportEmail && (
              <>
                {description && " "}
                <a
                  href={`mailto:${supportEmail}`}
                  className="rounded-sm wrap-anywhere text-accent underline underline-offset-4 hover:text-foreground"
                >
                  {supportEmail}
                </a>
              </>
            )}
          </motion.p>
        )}

        <Accordion
          type="single"
          collapsible
          className="mt-9 rounded-xl border border-outline bg-surface sm:mt-12"
        >
          {data.map(({ question, answer }, index) => (
            <AccordionItem key={question} value={question} asChild className="relative">
              <motion.div
                whileInView={enter}
                viewport={{ once: true }}
                transition={{ duration: 0.32, delay: 0.12 + index * 0.045, ease: "easeOut" }}
              >
                <AccordionTrigger className="z-10 min-h-14 cursor-pointer items-center rounded-none px-4 text-base leading-snug wrap-anywhere hover:bg-surface-hover hover:no-underline focus-visible:relative data-[state=open]:text-accent sm:px-6 sm:text-lg [&>svg]:size-5 [&>svg]:translate-y-0 [&[data-state=open]>svg]:text-accent [[data-slot=accordion-item]:first-child_&]:rounded-t-xl [[data-slot=accordion-item]:last-child_&[data-state=closed]]:rounded-b-xl">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="max-w-[72ch] px-4 pb-5 text-base leading-relaxed text-muted-foreground sm:px-6">
                  {answer}
                </AccordionContent>
              </motion.div>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
