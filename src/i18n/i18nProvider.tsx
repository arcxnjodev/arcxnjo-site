import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Language, translations } from "./translations";

type I18nContextType = {
  language: Language;
  country: string;
  locale: string;
  setLanguage: (language: Language) => void;
  t: (path: string) => string;
};

const I18nContext = createContext<I18nContextType | null>(null);

const supportedLanguages: Language[] = ["pt", "en", "es"];

const getBrowserLocale = () => {
  const languages = navigator.languages || [navigator.language];
  return languages.find(Boolean) || "en-US";
};

const getCountryFromLocale = (locale: string) => {
  const parts = locale.split("-");
  return parts[1]?.toUpperCase() || "";
};

const detectLanguage = () => {
  const savedLanguage = localStorage.getItem("arcxnjo_language") as Language | null;
  const locale = getBrowserLocale();
  const country = getCountryFromLocale(locale);
  const lowerLocale = locale.toLowerCase();

  if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
    return { language: savedLanguage, country, locale };
  }

  if (lowerLocale.startsWith("pt")) {
    return { language: "pt" as Language, country, locale };
  }

  if (lowerLocale.startsWith("es")) {
    return { language: "es" as Language, country, locale };
  }

  return { language: "en" as Language, country, locale };
};

const getNestedTranslation = (language: Language, path: string) => {
  const keys = path.split(".");
  let value: any = translations[language];

  for (const key of keys) {
    value = value?.[key];
  }

  if (typeof value === "string") return value;

  let fallback: any = translations.en;

  for (const key of keys) {
    fallback = fallback?.[key];
  }

  return typeof fallback === "string" ? fallback : path;
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const detected = detectLanguage();

  const [language, setLanguageState] = useState<Language>(detected.language);
  const [country] = useState(detected.country);
  const [locale] = useState(detected.locale);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (newLanguage: Language) => {
    localStorage.setItem("arcxnjo_language", newLanguage);
    setLanguageState(newLanguage);
  };

  const value = useMemo(
    () => ({
      language,
      country,
      locale,
      setLanguage,
      t: (path: string) => getNestedTranslation(language, path),
    }),
    [language, country, locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
};
