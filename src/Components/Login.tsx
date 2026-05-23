import Logo from "../assets/images/logo.webp";
import { useFormik } from "formik";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import loginSchema from "../Shemas/loginSchema";
import { useDispatch } from "react-redux";
import { loginUser } from "../Store/userSlice";
import { DiscordAuthButton } from "./Ui/DiscordAuthButton";
import { useI18n } from "../i18n/i18nProvider";

export const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();

  const API_URL = import.meta.env.VITE_API_URL || "https://api.arcxnjo.com.br";

  const [loading, setLoading] = useState(false);
  const [discordLoading, setDiscordLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleDiscordRedirect = async () => {
      const queryParams = new URLSearchParams(location.search);
      const discordToken = queryParams.get("discord_token");

      if (!discordToken) return;

      setDiscordLoading(true);
      setError("");

      try {
        localStorage.setItem("token", discordToken);

        const response = await axios.get(`${API_URL}/api/profile/me`, {
          headers: {
            Authorization: `Bearer ${discordToken}`,
          },
        });

        const user = {
          username: response.data.username,
          email: response.data.email,
        };

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("email", response.data.email || "");

        dispatch(loginUser(response.data.email || response.data.username || "discord"));

        navigate("/panel", { replace: true });
      } catch (error: any) {
        console.error("Discord login finish error:", error);
        localStorage.removeItem("token");
        setError(t("auth.discordLoginError"));
      } finally {
        setDiscordLoading(false);
      }
    };

    handleDiscordRedirect();
  }, [location.search, navigate, dispatch, API_URL, t]);

  const onSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/api/login`, {
        email: values.email,
        password: values.password,
      });

      const { user } = response.data;

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("email", user.email);
      localStorage.setItem("user", JSON.stringify(user));

      dispatch(loginUser(user.email));
      navigate("/panel");
    } catch (error: any) {
      setError(error.response?.data?.error || t("auth.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  const { values, errors, handleSubmit, handleChange } = useFormik({
    initialValues: { email: "", password: "" },
    onSubmit,
    validationSchema: loginSchema,
  });

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen bg-black">
      <div className="text-white w-[400px] max-w-[92vw] bg-slate-900 rounded-xl flex flex-col items-center p-10">
        <div className="flex flex-col items-center text-center">
          <img src={Logo} className="w-1/4 inline-block mb-3" />
          <p className="font-semibold text-lg">{t("auth.loginTitle")}</p>
        </div>

        {error && (
          <div className="mt-4 p-2 rounded text-center w-full bg-red-600">
            {error}
          </div>
        )}

        {discordLoading && (
          <div className="mt-4 p-2 rounded text-center w-full bg-[#5865F2]">
            {t("auth.discordLoading")}
          </div>
        )}

        <div className="w-[300px] max-w-full mt-6">
          <DiscordAuthButton text={t("auth.loginWithDiscord")} />

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/40">{t("common.or")}</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <span>{t("auth.email")}</span>
              <input
                name="email"
                type="email"
                onChange={handleChange}
                value={values.email}
                className="rounded-lg bg-gray-950 p-2 outline-none text-white focus:ring-2 focus:ring-purple-500"
                required
              />
              <p className="text-red-600 text-sm">{errors.email}</p>
            </div>

            <div className="flex flex-col gap-1">
              <span>{t("auth.password")}</span>
              <input
                name="password"
                type="password"
                onChange={handleChange}
                value={values.password}
                className="rounded-lg bg-gray-950 p-2 outline-none text-white focus:ring-2 focus:ring-purple-500"
                required
              />
              <p className="text-red-600 text-sm">{errors.password}</p>
            </div>

            <button
              type="submit"
              disabled={loading || discordLoading}
              className="bg-purple-700 w-full rounded-lg p-2 mt-5 border-purple-950 border-4 border-solid disabled:opacity-50 hover:bg-purple-600 transition"
            >
              {loading ? t("auth.loggingIn") : t("auth.login")}
            </button>

            <div className="text-center">
              <p className="text-sm">
                {t("auth.noAccount")}{" "}
                <Link to="/register" className="text-purple-700 hover:underline">
                  {t("auth.signup")}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
