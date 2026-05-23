import { UiFastRegister } from "./Ui/UiFastRegister";
import { useI18n } from "../i18n/i18nProvider";

export const Section = () => {
  const { t } = useI18n();

  return (
    <div className="bg-main w-[70%] rounded-xl text-white p-[55px] mx-auto">
      <h1 className="text-5xl">{t("home.sectionTitle")}</h1>
      <p className="text-lg">{t("home.sectionSubtitle")}</p>
      <UiFastRegister />
    </div>
  );
};
