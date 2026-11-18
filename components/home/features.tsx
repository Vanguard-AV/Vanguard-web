import {
  IconAlertTriangle,
  IconBraces,
  IconBrandVscode,
  IconBrowser,
  IconDeviceDesktop,
  IconFileDigit,
  IconFileTypeDoc,
  IconFileTypePdf,
  IconFingerprint,
  IconLink,
  IconListDetails,
  IconMail,
  IconPhoto,
  IconQrcode,
  IconRadar,
  IconReportAnalytics,
  IconShieldCheck,
} from "@tabler/icons-react";
import { MarketingFeatureBento } from "@/components/ui/marketing-feature-bento";

const features = [
  {
    title: "URL & QR Code Scanning",
    description:
      "Check links and QR code destinations for signs of phishing before you open them.",
    size: "wide",
    visual: (
      <div className="grid w-full max-w-lg items-center lg:grid-cols-[minmax(0,1fr)_0.75rem_auto] xl:[@media(min-height:45rem)]:grid-cols-[minmax(0,1fr)_1.5rem_auto]">
        <div className="grid gap-px overflow-hidden rounded-lg border border-outline bg-outline text-sm">
          <div className="flex items-center gap-2.5 bg-surface px-3 py-2.5 lg:gap-1.5 lg:px-2">
            <IconBrowser size={18} stroke={1.5} className="shrink-0 text-accent lg:size-4" />
            <span className="font-mono text-xs text-foreground">example.com</span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 bg-surface-raised px-3 py-2 lg:hidden xl:[@media(min-height:45rem)]:flex">
            <span className="flex items-center gap-1.5">
              <IconLink size={16} stroke={1.5} /> Link
            </span>
            <span className="flex items-center gap-1.5">
              <IconQrcode size={16} stroke={1.5} /> QR code
            </span>
          </div>
        </div>
        <span className="relative mx-auto h-4 w-px bg-accent/35 lg:h-px lg:w-full">
          <span className="absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
        </span>
        <div className="flex items-center justify-self-center gap-2.5 rounded-lg border border-accent/25 bg-surface-selected px-3 py-2.5 lg:justify-self-start lg:gap-1.5 lg:px-2">
          <IconShieldCheck size={28} stroke={1.5} className="shrink-0 text-accent lg:size-5 xl:[@media(min-height:45rem)]:size-6" />
          <span className="text-sm font-medium text-foreground lg:text-xs xl:[@media(min-height:45rem)]:text-sm">Phishing check</span>
        </div>
      </div>
    ),
  },
  {
    title: "File Scanning",
    size: "narrow",
    description:
      "Check binaries, PDFs, and Office documents for malicious content.",
    visual: (
      <div className="grid w-full max-w-60 divide-y divide-outline text-sm lg:grid-cols-3 lg:divide-x lg:divide-y-0 lg:text-xs xl:[@media(min-height:45rem)]:text-sm">
        {[
          { label: "Binaries", Icon: IconFileDigit },
          { label: "PDF", Icon: IconFileTypePdf },
          { label: "Office", Icon: IconFileTypeDoc },
        ].map(({ label, Icon }) => (
          <span key={label} className="flex items-center gap-2.5 px-2 py-1.5 lg:flex-col lg:gap-1 lg:px-0">
            <Icon size={20} stroke={1.5} className="shrink-0 text-accent lg:[@media(min-height:45rem)]:size-6" />
            {label}
          </span>
        ))}
      </div>
    ),
  },
  {
    title: "Email Scanning",
    description:
      "Check messages, links, and attachments for phishing and malicious content.",
    visual: (
      <div className="flex w-full max-w-60 items-center gap-4 text-sm">
        <IconMail size={34} stroke={1.35} className="shrink-0 text-accent" />
        <span className="grid flex-1 gap-2 border-s border-outline ps-4">
          <span>Message body</span>
          <span>Links & attachments</span>
        </span>
      </div>
    ),
  },
  {
    title: "Code & Library Scan",
    description:
      "Find vulnerabilities in source code and flag malicious Python packages before installation.",
    visual: (
      <div className="grid w-full max-w-60 gap-2 font-mono text-xs lg:gap-1">
        <span className="flex items-center gap-2 rounded-md border border-outline bg-surface px-2.5 py-2 lg:py-1">
          <IconBraces size={18} stroke={1.5} className="shrink-0 text-accent" />
          app.py
        </span>
        <span className="flex items-center gap-2 rounded-md border border-outline bg-surface px-2.5 py-2 lg:py-1">
          <IconListDetails size={18} stroke={1.5} className="shrink-0 text-accent" />
          requirements.txt
        </span>
      </div>
    ),
  },
  {
    title: "Multimedia Scanning",
    description:
      "Inspect images for concealed data, a technique known as steganography.",
    visual: (
      <div className="flex w-full max-w-60 items-center justify-center">
        <div className="grid size-14 shrink-0 place-items-center rounded-lg border border-outline bg-surface">
          <IconPhoto size={28} stroke={1.5} />
        </div>
        <div className="h-px w-12 bg-accent/35" />
        <div className="grid size-14 shrink-0 place-items-center rounded-lg border border-accent/25 bg-surface-selected text-accent">
          <IconFingerprint size={28} stroke={1.5} />
        </div>
      </div>
    ),
  },
  {
    title: "Threat Insight Engine",
    description:
      "Put suspicious findings in context with threat intelligence and technical reports.",
    visual: (
      <div className="flex w-full max-w-60 items-center gap-4 text-sm">
        <IconRadar size={36} stroke={1.35} className="shrink-0 text-accent" />
        <span className="grid flex-1 gap-2 border-s border-outline ps-4">
          <span>Attack indicators</span>
          <span>Malware behavior</span>
        </span>
      </div>
    ),
  },
  {
    title: "Real-Time Protection",
    description:
      "Protection designed to check files on desktop, links in the browser, and code in VS Code.",
    visual: (
      <div className="grid w-full max-w-60 grid-cols-3 gap-2 text-center text-xs">
        {[
          { label: "Desktop", Icon: IconDeviceDesktop },
          { label: "Browser", Icon: IconBrowser },
          { label: "VS Code", Icon: IconBrandVscode },
        ].map(({ label, Icon }) => (
          <span key={label} className="grid justify-items-center gap-2 lg:gap-1">
            <span className="grid size-11 place-items-center rounded-lg border border-outline bg-surface text-accent lg:size-9 lg:[@media(min-height:45rem)]:size-11">
              <Icon size={22} stroke={1.5} />
            </span>
            {label}
          </span>
        ))}
      </div>
    ),
  },
  {
    title: "Security Overview Dashboard",
    description:
      "Review alerts, risk scores, and scan results together and see what needs attention.",
    visual: (
      <div className="grid w-full max-w-60 gap-px overflow-hidden rounded-lg border border-outline bg-outline text-sm">
        <span className="flex items-center gap-2 bg-surface px-2.5 py-1.5 lg:py-1">
          <IconAlertTriangle size={16} stroke={1.5} className="shrink-0 text-accent" />
          Alerts & risk scores
        </span>
        <span className="flex items-center gap-2 bg-surface px-2.5 py-1.5 lg:py-1">
          <IconReportAnalytics size={16} stroke={1.5} className="shrink-0 text-accent" />
          Scan reports
        </span>
      </div>
    ),
  },
] as const;

export function Features() {
  return (
    <MarketingFeatureBento
      id="features"
      title="Features"
      description="Check links, files, and messages for threats, then review your findings in one place."
      features={features}
    />
  );
}
