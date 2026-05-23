import { UiFastRegister } from "./Ui/UiFastRegister";
import { useI18n } from "../i18n/i18nProvider";

export const Sidebar = () => {
  const { t } = useI18n();

  return (
    <div className="relative min-h-screen w-full bg-black">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center text-purple-400 drop-shadow-lg">
          {t("home.heroTitle")}
        </h1>

        <p className="text-lg md:text-xl w-full md:w-[70%] text-center mb-8 text-gray-300">
          {t("home.heroSubtitle")}
        </p>

        <UiFastRegister />
      </div>
    </div>
  );
};
