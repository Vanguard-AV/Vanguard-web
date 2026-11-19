import ClientFeedback from "@/components/ui/testimonial";

// Quotes, attributions, and ratings as published on https://vanguard-av.net/#testimonials.
const testimonials = [
  {
    name: "Mohamed Waheed",
    role: "Cyber Security Team Leader",
    company: "SMART Technology Solutions",
    quote:
      "Vanguard stands out because it approaches cybersecurity as a connected ecosystem rather than a set of isolated tools. What impressed me most is the way the platform correlates threats across files, URLs, emails, code, and even multimedia content. From a security leadership perspective, this kind of unified and layered visibility is exactly what modern defense strategies need, especially against multi-vector attacks.",
    rating: 5,
  },
  {
    name: "Ahmed Mansour",
    role: "Cyber Security Consultant",
    company: "Freelance",
    quote:
      "What I appreciate about Vanguard is that it reflects a strong understanding of today’s threat landscape. The combination of AI-driven detection, static-first analysis, and threat intelligence integration makes the solution both practical and forward-looking. It is not just another scanner; it is a well-thought-out security platform that addresses phishing, malware, vulnerable code, and hidden payloads in a more comprehensive way.",
    rating: 5,
  },
  {
    name: "Maher Elgamil",
    role: "Lead Software Engineering",
    company: "Sudeem",
    quote:
      "From a software engineering point of view, Vanguard is a very promising project because it bridges security research with real engineering use cases. The inclusion of source code vulnerability scanning, malicious Python package detection, and developer-focused integration such as browser and coding workflow support shows that the team understands how security should fit naturally into the development lifecycle.",
    rating: 5,
  },
  {
    name: "Mahmoud Ayman",
    role: "CEO",
    company: "Parmagina",
    quote:
      "Vanguard has clear business value because it turns advanced cybersecurity concepts into a solution that is accessible for real users and organizations. What makes it compelling is that it does not target only large enterprises; it can also serve individuals, developers, and small businesses that need strong protection without the complexity of expensive enterprise tools.",
    rating: 5,
  },
  {
    name: "Ahmed Elbosily",
    role: "Co-Founder",
    company: "CUBE Egypt",
    quote:
      "What makes Vanguard impressive is its product vision. The team identified a real problem in the market: fragmented desktop security and the lack of one intelligent platform that covers multiple attack surfaces. By bringing together AI-powered scanning, threat intelligence, and a centralized dashboard, Vanguard shows strong potential as a scalable cybersecurity product.",
    rating: 5,
  },
  {
    name: "Mahmoud Emad",
    role: "Software Project Manager",
    company: "Code Clouders",
    quote:
      "Vanguard reflects solid project thinking in both scope and execution. The platform is not limited to one security feature; it is designed as a coordinated system with multiple specialized modules working together under one architecture. From a project management perspective, this shows good planning, clear product direction, and a strong awareness of both technical challenges and user needs.",
    rating: 5,
  },
] as const;

export function Testimonials() {
  return (
    <ClientFeedback
      testimonials={testimonials}
      title="Testimonials"
      description="Perspectives on Vanguard from security, engineering, and business leaders."
    />
  );
}
