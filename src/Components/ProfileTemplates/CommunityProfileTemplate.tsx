import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import type { ProfileTemplateProps } from "./types";
import { ProfileCursor } from "./ProfileCursor";
import { useI18n } from "../../i18n/i18nProvider";

const escapeScriptClose = (value: string) => value.replace(/<\/script/gi, "<\\/script");
const escapeJsonForHtml = (value: unknown) =>
  JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");

export const CommunityProfileTemplate = ({
  data,
  username,
  discordData,
}: ProfileTemplateProps) => {
  const template = data.communityTemplate;
  const { t } = useI18n();

  const srcDoc = useMemo(() => {
    if (!template) return "";

    const profilePayload = {
      username: data.username,
      routeUsername: username,
      displayName: data.profile.display_name || data.username,
      bio: data.profile.bio || "",
      profileImage: data.profile.profile_image || "/favicon.png",
      bannerImage: data.profile.banner_image || "",
      bannerVideo: data.profile.banner_video || "",
      bannerType: data.profile.banner_type || "image",
      badges: data.profile.profile_badges || [],
      location: data.profile.location || "",
      statusText: data.profile.status_text || "",
      musicTitle: data.profile.music_title || "",
      musicUrl: data.profile.music_url || "",
      links: data.socialMedia || {},
      stats: data.stats || {},
      discord: discordData || null,
    };

    const safeJs = escapeScriptClose(template.js_code || "");

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        min-height: 100%;
        background: #050505;
        color: white;
        font-family: Inter, Arial, sans-serif;
      }
      body { overflow: auto; }
      a { color: inherit; }
      ${template.css_code || ""}
    </style>
  </head>
  <body>
    <script>
      window.ARCXNJO_PROFILE = ${escapeJsonForHtml(profilePayload)};
    </script>
    ${template.html_code || ""}
    ${
      safeJs.trim()
        ? `<script>
          try {
            ${safeJs}
          } catch (error) {
            document.body.insertAdjacentHTML(
              "beforeend",
              "<pre style='position:fixed;left:12px;bottom:12px;max-width:calc(100% - 24px);white-space:pre-wrap;background:rgba(0,0,0,.75);color:#fca5a5;border:1px solid rgba(248,113,113,.35);border-radius:12px;padding:12px;font-size:12px;z-index:999999;'>Template JS error: " +
                String(error && error.message ? error.message : error).replace(/[<>&]/g, "") +
              "</pre>"
            );
          }
        </script>`
        : ""
    }
  </body>
</html>`;
  }, [data, discordData, template, username]);

  if (!template) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4 text-center text-white">
        <div>
          <p className="text-2xl font-black">{t("profile.communityTemplateUnavailable")}</p>
          <p className="mt-2 text-sm text-white/45">
            {t("profile.communityTemplateUnavailableDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white">
      <ProfileCursor cursorUrl={data.profile.custom_cursor_url} />

      <Link
        to="/"
        title={t("nav.home")}
        aria-label={t("profile.goHome")}
        className="fixed right-5 top-5 z-[60] flex h-11 w-11 items-center justify-center rounded-2xl bg-black/25 text-white/60 opacity-75 shadow-[0_8px_25px_rgba(0,0,0,0.22)] backdrop-blur-xl transition hover:bg-black/40 hover:text-white hover:opacity-100"
      >
        <FaHome className="text-base" />
      </Link>

      <iframe
        title={template.name}
        sandbox="allow-scripts allow-popups"
        srcDoc={srcDoc}
        className="block h-screen w-full border-0 bg-black"
      />
    </div>
  );
};
