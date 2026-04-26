import { useState } from "react";

const faqItems = [
  {
    question: "What is ARCXNJO?",
    answer:
      "ARCXNJO is a modern bio link platform where you can create a custom profile, share your social links, and build a unique online presence.",
  },
  {
    question: "Is ARCXNJO free to use?",
    answer:
      "Yes. ARCXNJO is free to use, with optional Pro features for users who want more customization and premium tools.",
  },
  {
    question: "What can I do with ARCXNJO?",
    answer:
      "You can create a custom profile, add your social links, customize your page, share your profile URL, and upgrade to Pro for premium features.",
  },
  {
    question: "How long does it take to create an ARCXNJO profile?",
    answer:
      "It only takes a few minutes. Create an account, choose your username, customize your profile, and share your link.",
  },
];

export const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full max-w-3xl mx-auto px-4 py-16 text-white">
      <h2 className="text-3xl font-bold text-center mb-8">FAQ</h2>

      <div className="space-y-4">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={item.question}
              className="border border-white/10 rounded-xl bg-white/5 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between text-left px-5 py-4 font-medium hover:bg-white/10 transition"
              >
                <span>{item.question}</span>
                <span className="text-xl">{isOpen ? "−" : "+"}</span>
              </button>

              {isOpen && (
                <div className="px-5 pb-4 text-gray-300">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};