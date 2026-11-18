"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Fragment, useId, type ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useReducedMotion } from "@/lib/reduced-motion";

interface FAQsProps {
  id?: string;
  title?: string;
  description?: string;
  data?: readonly { question: string; answer: ReactNode }[];
  supportHref?: string;
}

const faqItems = [
  {
    question: "What is Ruixen UI?",
    answer:
      "Ruixen UI is a modern, fully responsive design system that provides pre-built components, utilities, and layouts to help developers build scalable web applications quickly and efficiently.",
  },
  {
    question: "Which platforms does Ruixen UI support?",
    answer:
      "Ruixen UI is built for web applications and works seamlessly with React, Next.js, and other modern JavaScript frameworks. It also supports dark mode and responsive layouts out of the box.",
  },
  {
    question: "Can I customize Ruixen UI components?",
    answer:
      "Yes! All Ruixen UI components are fully customizable via props, CSS classes, and theme configuration. You can easily adapt colors, spacing, typography, and layout to match your brand.",
  },
  {
    question: "Does Ruixen UI provide integration with third-party tools?",
    answer:
      "Absolutely. Ruixen UI includes ready-to-use integrations and patterns for popular tools and services, making it easier to connect your application with analytics, authentication, and workflow platforms.",
  },
  {
    question: "Is there documentation and support available?",
    answer:
      "Yes, Ruixen UI comes with comprehensive documentation, live examples, and tutorials. Additionally, our community and support channels are available to help you implement components and resolve any issues.",
  },
];

export default function FAQs({
  id,
  title = "FAQs",
  description = "Everything you need to know about Ruixen UI",
  data = faqItems,
  supportHref,
}: FAQsProps) {
  const titleId = useId();

  return (
    <section id={id} aria-labelledby={titleId} className="border-t border-outline py-16 md:py-24">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-5 md:gap-x-12">
        <div className="md:col-span-2">
          <h2 id={titleId} tabIndex={-1} className="text-4xl font-medium tracking-tight text-balance text-foreground sm:text-5xl">
            {title}
          </h2>
          <p className="mt-4 text-lg text-balance text-muted-foreground">
            {description}
          </p>
          {supportHref && (
            <p className="mt-6 text-muted-foreground">
              Can’t find what you’re looking for? Contact our{" "}
              <Link href={supportHref} className="font-medium text-accent underline underline-offset-4">
                support team
              </Link>
              .
            </p>
          )}
        </div>

        <Accordion type="single" collapsible className="min-w-0 md:col-span-3">
          {data.map(({ question, answer }) => (
            <AccordionItem key={question} value={question}>
              <AccordionTrigger className="min-h-14 cursor-pointer items-center text-base leading-snug wrap-anywhere hover:no-underline data-[state=open]:text-accent sm:text-lg">
                {question}
              </AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed wrap-anywhere text-muted-foreground">
                {typeof answer === "string" ? <BlurredStagger text={answer} /> : answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

const letterAnimation = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  show: { opacity: 1, filter: "blur(0px)" },
};

export function BlurredStagger({ text }: { text: string }) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) return <p>{text}</p>;

  return (
    <p>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden="true"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: Math.min(0.015, 0.9 / text.length) } } }}
      >
        {text.split(/\s+/).map((word, wordIndex) => (
          <Fragment key={wordIndex}>
            {wordIndex > 0 && " "}
            <span className="inline-block max-w-full">
              {Array.from(word).map((letter, letterIndex) => (
                <motion.span
                  key={letterIndex}
                  variants={letterAnimation}
                  transition={{ duration: 0.3 }}
                  className="inline-block"
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          </Fragment>
        ))}
      </motion.span>
    </p>
  );
}
