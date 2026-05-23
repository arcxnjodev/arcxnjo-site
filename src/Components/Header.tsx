import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";
import { useI18n } from "../i18n/i18nProvider";
import type { Language } from "../i18n/translations";

export const Header = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const { language, setLanguage, t } = useI18n();

  useEffect(() => {
    const checkLogin = () => {
      setLoggedIn(isLoggedIn());
    };

    checkLogin();

    window.addEventListener("storage", checkLogin);
    window.addEventListener("focus", checkLogin);

    return () => {
      window.removeEventListener("storage", checkLogin);
      window.removeEventListener("focus", checkLogin);
    };
  }, []);

  return (
    <div className="fixed w-full flex justify-center top-5 z-50">
      <div className="text-white bg-gray-900/90 backdrop-blur-md flex items-center justify-between px-5 w-[90%] md:w-[70%] rounded-full h-[70px] md:h-[80px] shadow-2xl border border-white/10">
        <Link to="/" className="flex items-center hover:opacity-80 transition">
          <span
            className="text-white text-xl md:text-2xl font-bold tracking-[0.25em]"
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            ARC<span className="text-purple-500">X</span>NJO
          </span>
        </Link>

        <div>
          <ul className="flex items-center gap-2 md:gap-5">
            <li>
              <Link
                to="/pricing"
                className="py-2 px-3 md:px-4 rounded-lg hover:bg-white/10 transition text-sm md:text-base text-white"
              >
                {t("nav.pricing")}
              </Link>
            </li>

            <li>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-white/10 text-white text-sm rounded-lg px-2 py-2 outline-none cursor-pointer"
                aria-label="Language"
              >
                <option className="bg-gray-900" value="pt">
                  PT
                </option>
                <option className="bg-gray-900" value="en">
                  EN
                </option>
                <option className="bg-gray-900" value="es">
                  ES
                </option>
              </select>
            </li>

            {loggedIn ? (
              <li>
                <Link
                  to="/panel"
                  className="py-2 px-4 md:px-5 rounded-lg transition bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm md:text-base shadow-lg shadow-purple-700/20"
                >
                  {t("nav.panel")}
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    className="py-2 px-3 md:px-4 rounded-lg hover:bg-white/10 transition text-sm md:text-base text-white"
                  >
                    {t("nav.login")}
                  </Link>
                </li>

                <li>
                  <Link
                    to="/register"
                    className="py-2 px-3 md:px-4 rounded-lg transition bg-purple-600 hover:bg-purple-700 !text-black font-bold text-sm md:text-base"
                  >
                    {t("nav.signup")}
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
