import { useState } from "react";
import { useI18n } from "../i18n/i18nProvider";

export const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useI18n();

  const faqItems = [
    {
      question: t("faq.q1"),
      answer: t("faq.a1"),
    },
    {
      question: t("faq.q2"),
      answer: t("faq.a2"),
    },
    {
      question: t("faq.q3"),
      answer: t("faq.a3"),
    },
    {
      question: t("faq.q4"),
      answer: t("faq.a4"),
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full max-w-3xl mx-auto px-4 py-16 text-white">
      <h2 className="text-3xl font-bold text-center mb-8">{t("faq.title")}</h2>

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

              {isOpen && <div className="px-5 pb-4 text-gray-300">{item.answer}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
};
