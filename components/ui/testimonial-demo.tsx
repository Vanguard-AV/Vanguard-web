import ClientFeedback from "@/components/ui/testimonial";

const portraitBase = "https://cdn.21st.dev/assets/mirror";

const testimonials = [
  {
    name: "Guillermo Rauch",
    role: "CEO",
    company: "Enigma",
    quote: "Hypersphere has been a game-changer for us. Their service is top-notch and their team is incredibly responsive.",
    image: `${portraitBase}/68/68c583189c0e1ce21e113c290c7052e2293db7036c14e54a632fb15290d9b8c4.jpg`,
  },
  {
    name: "Rika Shinoda",
    role: "CEO",
    company: "Kintsugi",
    quote: "We've seen incredible results with Hypersphere. Their expertise, dedication.",
    image: `${portraitBase}/86/86a1c9c1309ca1d9fc99d59452c9c4a0f50ba192ddb264a3a0c76c4e78d7a405.jpg`,
  },
  {
    name: "Reacher",
    role: "CEO",
    company: "OdeaoLabs",
    quote: "Their team is highly professional, and their innovative solutions have truly transformed the way we operate.",
    image: `${portraitBase}/d7/d7ef0bb3c8517d3cb8bd73c054a87fcfbe86f836cff141a280a6431faa73847a.jpg`,
  },
  {
    name: "John",
    role: "CEO",
    company: "Labsbo",
    quote: "We're extremely satisfied with Hypersphere. Their expertise and dedication have exceeded our expectations.",
    image: `${portraitBase}/aa/aaff9c71c06802290840b09e412d9d7a92159d3182cb1fb0e88c216711d27e47.jpg`,
  },
  {
    name: "Steven Sunny",
    role: "CEO",
    company: "boxefi",
    quote: "Their customer support is absolutely exceptional. They are always available, incredibly helpful.",
    image: `${portraitBase}/34/34e73337944b73c8b25343cb5ff45ac43bb85358b64dc8d54f88769191d55253.jpg`,
  },
  {
    name: "Guillermo Rauch",
    role: "CEO",
    company: "OdeaoLabs",
    quote: "Hypersphere has been a key partner in our growth journey.",
    image: `${portraitBase}/5f/5fd63161d12eb2ed836aba11edd36efd6824e27b6a96151c1ee998a037b50f6d.jpg`,
  },
  {
    name: "Paul Brauch",
    role: "CTO",
    company: "Spectrum",
    quote: "Hypersphere has been a true game-changer for us. Their exceptional service, combined with their deep expertise and commitment to excellence, has made a significant impact on our business.",
    image: `${portraitBase}/03/037ea54a1e1b16d4cb42b0ef3d87b27d6b39d3ced535afa3f97ef861753b6ea8.jpg`,
  },
];

export default function TestimonialDemo() {
  return (
    <ClientFeedback
      id="testimonial-demo"
      title="Trusted by startups and the world’s largest companies"
      description="Hear what Hypersphere clients say about our service."
      testimonials={testimonials}
    />
  );
}
