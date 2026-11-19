"use client";

import { Root as Separator } from "@radix-ui/react-separator";
import { ArrowRight, ClockIcon, MailIcon } from "lucide-react";
import { useId, useState, type ComponentProps, type ReactNode, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactFields, type ContactState } from "@/lib/contact-fields";
import { cn } from "@/lib/utils";

interface ContactFormValues {
  name: string;
  company?: string;
  email: string;
  message: string;
  subject?: string;
}

interface ContactFormLabels {
  name: ReactNode;
  company: ReactNode;
  email: ReactNode;
  subject: ReactNode;
  message: ReactNode;
  submit: ReactNode;
  pending: ReactNode;
  success: ReactNode;
  error: ReactNode;
}

type ContactFormStatus = "idle" | "pending" | "success" | "error";

const defaultLabels: ContactFormLabels = {
  name: "Name",
  company: <>Company <span className="font-normal text-muted-foreground">(optional)</span></>,
  email: "Email",
  subject: <>Subject <span className="font-normal text-muted-foreground">(optional)</span></>,
  message: "Message",
  submit: "Send message",
  pending: "Sending…",
  success: "Thanks for your message. We'll get back to you soon.",
  error: "Something went wrong. Please try again.",
};

const defaultDetails = (
  <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
    <li className="flex items-center gap-3">
      <MailIcon aria-hidden="true" className="size-4 shrink-0" />
      <a href="mailto:hello@example.com" className="rounded-sm text-foreground underline-offset-4 hover:underline">
        hello@example.com
      </a>
    </li>
    <li className="flex items-center gap-3">
      <ClockIcon aria-hidden="true" className="size-4 shrink-0" />
      <span>We reply within one business day</span>
    </li>
  </ul>
);

interface ContactFormProps extends Omit<ComponentProps<"section">, "title" | "onSubmit"> {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  details?: ReactNode;
  labels?: Partial<ContactFormLabels>;
  includeCompany?: boolean;
  includeSubject?: boolean;
  layout?: "split" | "heading-above";
  formTitle?: ReactNode;
  /** Resolving clears the form. Throwing preserves the draft and shows the error label. */
  onSubmit?: (values: ContactFormValues) => void | Promise<void>;
  /** Pass a native action or a React Server Action. Children render as additional fields. */
  formProps?: ComponentProps<"form">;
  submissionState?: ContactState;
  isSubmitting?: boolean;
  disabledMessage?: string;
}

function ContactForm({
  eyebrow = "Contact",
  title = "Get in touch",
  description = "Questions about plans, features or anything else? Send us a message and the team will reply.",
  details = defaultDetails,
  labels: labelsProp,
  includeCompany = false,
  includeSubject = false,
  layout = "split",
  formTitle,
  onSubmit,
  formProps,
  submissionState,
  isSubmitting = false,
  disabledMessage,
  className,
  ...props
}: ContactFormProps) {
  const id = useId();
  const headingId = `${id}-heading`;
  const [callbackStatus, setCallbackStatus] = useState<ContactFormStatus>("idle");
  const labels = { ...defaultLabels, ...labelsProp };
  const result = onSubmit ? undefined : submissionState;
  const status = isSubmitting ? "pending" : result?.status ?? callbackStatus;
  const pending = status === "pending";
  const disabled = Boolean(disabledMessage);
  const errorResult = result?.status === "error" ? result : undefined;
  const headingAbove = layout === "heading-above";
  const pairedFields = headingAbove && includeCompany && includeSubject;
  const fields = contactFields.filter(({ name }) => (
    (name !== "subject" || includeSubject) && (name !== "company" || includeCompany)
  ));
  const { children: extraFields, className: formClassName, onSubmit: onNativeSubmit, ...nativeFormProps } = formProps ?? {};

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    if (disabled) {
      event.preventDefault();
      return;
    }

    onNativeSubmit?.(event);
    if (!onSubmit || event.defaultPrevented) return;
    event.preventDefault();
    if (pending) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const values: ContactFormValues = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      message: String(data.get("message") ?? ""),
    };
    if (includeCompany) values.company = String(data.get("company") ?? "");
    if (includeSubject) values.subject = String(data.get("subject") ?? "");

    setCallbackStatus("pending");
    try {
      await onSubmit(values);
      form.reset();
      setCallbackStatus("success");
    } catch {
      setCallbackStatus("error");
    }
  }

  return (
    <section
      aria-labelledby={headingId}
      data-slot="contact-form"
      data-status={status}
      className={cn("py-16 sm:py-24", className)}
      {...props}
    >
      <div
        data-slot="contact-form-container"
        className={cn(
          "mx-auto grid w-full max-w-6xl",
          headingAbove
            ? "gap-5 md:grid-cols-[minmax(0,4fr)_minmax(0,5fr)] md:gap-x-9 md:gap-y-7 md:[@media(max-height:700px)]:gap-y-3 lg:gap-x-14"
            : "gap-8 px-4 sm:gap-12 sm:px-6 lg:grid-cols-2",
        )}
      >
        <div data-slot="contact-form-header" className={cn("min-w-0", headingAbove ? "md:col-span-2" : "max-w-2xl")}>
          {eyebrow && (
            <p data-slot="contact-form-eyebrow" className="text-sm font-medium text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <h2
            id={headingId}
            tabIndex={-1}
            data-slot="contact-form-title"
            className={cn(
              "text-balance",
              headingAbove
                ? "text-[clamp(2.25rem,min(6.5vw,8.5svh),5rem)] leading-[0.98] font-medium tracking-[-0.035em]"
                : "text-3xl font-semibold tracking-tight sm:text-4xl",
              eyebrow ? "mt-2" : undefined,
            )}
          >
            {title}
          </h2>
          {description && (
            <p data-slot="contact-form-description" className={cn(
              "text-pretty text-muted-foreground",
              headingAbove ? "mt-3 max-w-[54ch] text-base sm:text-lg" : "mt-4 max-w-[36ch] text-lg",
            )}>
              {description}
            </p>
          )}
          {!headingAbove && details && <div data-slot="contact-form-details" className="mt-6 sm:mt-8">{details}</div>}
        </div>

        {headingAbove && details && <div data-slot="contact-form-details" className="min-w-0">{details}</div>}

        <Card data-slot="contact-form-card" className={cn(
          "min-w-0",
          headingAbove && "self-start rounded-2xl border-accent/20 shadow-none",
          headingAbove && !details && "md:col-span-2",
        )}>
          <CardContent className={cn("p-4 sm:p-6", headingAbove && "md:[@media(max-height:700px)]:p-4")}>
            {formTitle && (
              <>
                <h3 className="text-xl font-medium tracking-tight">{formTitle}</h3>
                <Separator decorative className="my-3 h-px bg-outline" />
              </>
            )}
            <form
              {...nativeFormProps}
              action={disabled ? undefined : nativeFormProps.action}
              aria-describedby={disabled ? `${id}-unavailable` : nativeFormProps["aria-describedby"]}
              data-slot="contact-form-form"
              data-status={status}
              className={cn("flex flex-col", headingAbove ? "gap-4" : "gap-6", formClassName)}
              onSubmit={handleSubmit}
            >
              {disabledMessage && (
                <p id={`${id}-unavailable`} className="text-sm text-muted-foreground">
                  {disabledMessage}
                </p>
              )}
              <fieldset
                key={result && result.status !== "idle" ? result.id : undefined}
                disabled={disabled || pending}
                className={cn(
                  "grid min-w-0",
                  headingAbove ? "gap-x-3 gap-y-3 min-[360px]:grid-cols-2 sm:gap-x-4" : "gap-5 sm:grid-cols-2",
                )}
              >
                {fields.map(({ name, required, maxLength }) => {
                  const fieldId = `${id}-${name}`;
                  const error = errorResult?.errors?.[name];
                  const fullWidth = name === "message" || (
                    !pairedFields && (name === "subject" || (name === "email" && includeCompany))
                  );
                  const fieldProps = {
                    id: fieldId,
                    name,
                    required,
                    maxLength,
                    defaultValue: errorResult?.values[name] ?? "",
                    "aria-invalid": error ? true : undefined,
                    "aria-describedby": error ? `${fieldId}-error` : undefined,
                  };

                  return (
                    <Field key={name} className={fullWidth ? "col-span-full" : undefined}>
                      <FieldLabel htmlFor={fieldId}>{labels[name]}</FieldLabel>
                      {name === "message" ? (
                        <Textarea {...fieldProps} rows={headingAbove ? 3 : 5} />
                      ) : (
                        <Input
                          {...fieldProps}
                          type={name === "email" ? "email" : "text"}
                          autoComplete={name === "company" ? "organization" : name === "subject" ? "off" : name}
                        />
                      )}
                      {error && <p id={`${fieldId}-error`} className="text-sm text-red-300">{error}</p>}
                    </Field>
                  );
                })}
                {extraFields}
              </fieldset>

              <div data-slot="contact-form-footer">
                <Button type="submit" data-slot="contact-form-submit" disabled={disabled} loading={pending} className={cn(
                  "w-full sm:w-auto",
                  headingAbove && "group gap-3 rounded-lg bg-accent px-5 text-canvas hover:bg-foreground active:bg-accent/90",
                  disabled && "disabled:bg-surface-hover disabled:text-muted-foreground disabled:opacity-100",
                )}>
                  {pending ? labels.pending : labels.submit}
                  {headingAbove && <ArrowRight aria-hidden="true" className="size-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" />}
                </Button>
                <p role="status" data-slot="contact-form-success" className="text-sm text-accent">
                  {pending && <span className="sr-only">{labels.pending}</span>}
                  {status === "success" && (
                    <span className="mt-4 block">{result?.status === "success" ? result.message : labels.success}</span>
                  )}
                </p>
                <p role="alert" data-slot="contact-form-error" className="text-sm text-red-300">
                  {status === "error" && <span className="mt-4 block">{errorResult?.message ?? labels.error}</span>}
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export { ContactForm, type ContactFormLabels, type ContactFormProps, type ContactFormStatus, type ContactFormValues };
export default ContactForm;
