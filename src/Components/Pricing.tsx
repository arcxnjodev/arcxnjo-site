import { Link } from "react-router-dom";
import { useI18n } from "../i18n/i18nProvider";

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="6.43 7.43 11.15 8.57"
    className="text-purple-500"
  >
    <path
      fill="currentColor"
      d="m10 13.6l5.9-5.9q.275-.275.7-.275t.7.275q.275.275.275.7t-.275.7l-6.6 6.6q-.3.3-.7.3t-.7-.3l-2.6-2.6q-.275-.275-.275-.7t.275-.7q.275-.275.7-.275t.7.275z"
    />
  </svg>
);

export const Pricing = () => {
  const { t } = useI18n();

  const freeFeatures = [
    t("pricing.basicEffects"),
    t("pricing.basicCustomization"),
    t("pricing.addSocialMedia"),
  ];

  const proFeatures = [
    t("pricing.customBadge"),
    t("pricing.premiumEffects"),
    t("pricing.premiumCustomization"),
    t("pricing.prioritySupport"),
  ];

  return (
    <div className="text-white w-full flex flex-col items-center mt-[100px] pb-[200px] px-4">
      <div>
        <h3 className="text-3xl text-center">{t("pricing.title")}</h3>
        <p className="text-center text-lg text-white/70">{t("pricing.subtitle")}</p>
      </div>

      <div className="mt-[50px] flex flex-col lg:flex-row items-stretch lg:items-end gap-6">
        <div className="bg-gray-900 p-5 rounded-xl flex flex-col gap-4 w-full lg:w-[370px]">
          <p className="text-xl">{t("common.free")}</p>

          <span className="flex items-center gap-1">
            <p className="font-bold text-2xl">$0</p>
            <p className="font-extralight">/{t("common.lifetime")}</p>
          </span>

          <p className="font-extralight">{t("pricing.freeDescription")}</p>

          <div className="flex flex-col gap-2">
            {freeFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <CheckIcon />
                <p>{feature}</p>
              </div>
            ))}
          </div>

          <Link
            to="/register"
            className="mt-auto text-center bg-white/10 hover:bg-white/20 rounded-xl py-3 font-semibold transition"
          >
            {t("pricing.getStarted")}
          </Link>
        </div>

        <div className="bg-gray-900 p-5 rounded-xl flex flex-col gap-4 w-full lg:w-[370px] bg-main border border-purple-500/30 shadow-[0_0_35px_rgba(147,51,234,0.22)]">
          <p className="text-xl">{t("common.pro")}</p>

          <span className="flex items-center gap-1">
            <p className="font-bold text-2xl">$2.99</p>
            <p className="font-extralight">/{t("common.month")}</p>
          </span>

          <p className="font-extralight">{t("pricing.proDescription")}</p>

          <div className="flex flex-col gap-2">
            {proFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <CheckIcon />
                <p>{feature}</p>
              </div>
            ))}
          </div>

          <Link
            to="/register"
            className="mt-auto text-center bg-purple-700 hover:bg-purple-600 rounded-xl py-3 font-semibold transition"
          >
            {t("pricing.upgradeNow")}
          </Link>
        </div>
      </div>
    </div>
  );
};
