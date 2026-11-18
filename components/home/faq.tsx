import FAQs, { BlurredStagger } from "@/components/ui/text-reveal-faqs";

// Adapted from the FAQ on https://vanguard-av.net/.
const questions = [
  {
    question: "How does Vanguard differ from traditional antivirus?",
    answer:
      "Vanguard uses AI to look for suspicious patterns alongside checks for known threats. It brings checks for files, links, emails, source code, Python packages, and images into one place.",
  },
  {
    question: "Does Vanguard run suspicious files during a scan?",
    answer:
      "Vanguard takes a static-first approach. It examines a file’s contents and structure without executing it. When checking a URL, Vanguard analyzes the link text without visiting the destination.",
  },
  {
    question: "Can Vanguard flag threats it hasn’t seen before?",
    answer:
      "Vanguard combines deep learning and other machine learning methods to look for suspicious patterns in unfamiliar inputs. A scan can flag signs of a previously unseen threat, and its findings can help you decide whether to investigate further.",
  },
  {
    question: "What types of threats can Vanguard detect?",
    answer: (
      <div className="space-y-2">
        <BlurredStagger text="Vanguard looks for signs of these threats." />
        <ul className="list-disc space-y-1 ps-5 marker:text-accent">
          <li>Malicious executables, PDFs, and Office documents</li>
          <li>Phishing links and suspicious QR code destinations</li>
          <li>Suspicious emails, links, and attachments</li>
          <li>Vulnerabilities and malicious patterns in source code</li>
          <li>Malicious Python packages</li>
          <li>Data concealed in images through steganography</li>
        </ul>
      </div>
    ),
  },
  {
    question: "Who can use Vanguard?",
    answer:
      "Vanguard is designed for people checking unfamiliar links, messages, or files, developers reviewing code and dependencies, and smaller businesses that want to review scan results in one place.",
  },
] as const;

export function FAQ() {
  return (
    <FAQs
      id="questions"
      title="Frequently asked questions"
      description="Learn what Vanguard checks, how it looks for threats, and who it’s built for."
      data={questions}
    />
  );
}
