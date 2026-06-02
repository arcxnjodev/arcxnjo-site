import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import type { ProfileTemplateProps } from "./types";
import { ProfileCursor } from "./ProfileCursor";
import { useI18n } from "../../i18n/i18nProvider";

type TemplateSettings = Record<string, unknown>;

const escapeScriptClose = (value: string) =>
  value.replace(/<\/script/gi, "<\\/script");
const escapeJsonForHtml = (value: unknown) =>
  JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");

const getString = (
  settings: TemplateSettings,
  key: string,
  fallback: string,
) => {
  const value = settings[key];
  return typeof value === "string" && value.trim() ? value : fallback;
};

const getNumber = (
  settings: TemplateSettings,
  key: string,
  fallback: number,
) => {
  const value = Number(settings[key]);
  return Number.isFinite(value) ? value : fallback;
};

const getBoolean = (
  settings: TemplateSettings,
  key: string,
  fallback: boolean,
) => {
  const value = settings[key];
  return typeof value === "boolean" ? value : fallback;
};

const buildStudioCss = (settings: TemplateSettings = {}) => {
  const primary = getString(settings, "primaryColor", "#a855f7");
  const secondary = getString(settings, "secondaryColor", "#22d3ee");
  const text = getString(settings, "textColor", "#ffffff");
  const background = getString(settings, "backgroundColor", "#050505");
  const cardRadius = getNumber(settings, "cardRadius", 28);
  const cardBlur = getNumber(settings, "cardBlur", 18);
  const glow = getNumber(settings, "glowIntensity", 38);
  const avatarSize = getNumber(settings, "avatarSize", 128);
  const backgroundImage = getString(settings, "backgroundImage", "");
  const backgroundOpacity =
    Math.max(0, Math.min(100, getNumber(settings, "backgroundOpacity", 42))) /
    100;
  const buttonRadius = getNumber(settings, "buttonRadius", 22);
  const buttonGlow = getBoolean(settings, "buttonGlow", true);
  const buttonStyle = getString(settings, "buttonStyle", "glass");
  const buttonSize = getString(settings, "buttonSize", "md");
  const buttonPadding =
    buttonSize === "lg"
      ? "16px 20px"
      : buttonSize === "sm"
        ? "9px 12px"
        : "12px 16px";

  const buttonBackground =
    buttonStyle === "solid"
      ? primary
      : buttonStyle === "outline"
        ? "transparent"
        : buttonStyle === "minimal"
          ? "transparent"
          : "rgba(255,255,255,.08)";

  const buttonBorder =
    buttonStyle === "minimal"
      ? "transparent"
      : buttonStyle === "solid"
        ? primary
        : "rgba(255,255,255,.16)";

  return `
    :root {
      --arc-primary: ${primary};
      --arc-secondary: ${secondary};
      --arc-text: ${text};
      --arc-bg: ${background};
      --arc-card-radius: ${cardRadius}px;
      --arc-card-blur: ${cardBlur}px;
      --arc-glow: 0 0 ${glow}px color-mix(in srgb, ${primary} 62%, transparent);
      --arc-avatar-size: ${avatarSize}px;
      --arc-button-radius: ${buttonRadius}px;
      --arc-button-padding: ${buttonPadding};
      --arc-button-bg: ${buttonBackground};
      --arc-button-border: ${buttonBorder};
    }

    html, body {
      background:
        ${backgroundImage ? `linear-gradient(rgba(0,0,0,${1 - backgroundOpacity}), rgba(0,0,0,${1 - backgroundOpacity})), url("${backgroundImage.replace(/"/g, "")}") center/cover fixed,` : ""}
        radial-gradient(circle at top, color-mix(in srgb, ${primary} 30%, transparent), transparent 34%),
        ${background} !important;
      color: var(--arc-text) !important;
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      background: radial-gradient(circle at 50% 0%, color-mix(in srgb, ${secondary} 16%, transparent), transparent 36%);
      z-index: 0;
    }

    main, section, article, .profile, .card, .container, .box, .bio-card, [data-card] {
      border-radius: var(--arc-card-radius) !important;
    }

    .profile, .card, .bio-card, [data-card] {
      backdrop-filter: blur(var(--arc-card-blur));
      box-shadow: var(--arc-glow);
    }

    img.avatar, .avatar img, .profile-avatar, [data-avatar] {
      width: var(--arc-avatar-size) !important;
      height: var(--arc-avatar-size) !important;
      object-fit: cover;
      box-shadow: var(--arc-glow);
    }

    a, button, .link, .social-link, [data-link], [data-button] {
      border-radius: var(--arc-button-radius) !important;
      padding: var(--arc-button-padding);
      background: var(--arc-button-bg);
      border-color: var(--arc-button-border) !important;
      ${buttonGlow ? "box-shadow: var(--arc-glow);" : "box-shadow: none !important;"}
    }
  `;
};

const buildStudioMusicScript = () => `
  (function () {
    var profile = window.ARCXNJO_PROFILE || {};
    var settings = profile.templateSettings || {};
    if (!settings.showMusic || !settings.musicUrl) return;
    if (document.querySelector('[data-arc-studio-music]')) return;

    var box = document.createElement('div');
    box.setAttribute('data-arc-studio-music', 'true');
    box.style.position = 'fixed';
    box.style.zIndex = '999998';
    box.style.maxWidth = '320px';
    box.style.width = 'calc(100% - 32px)';
    box.style.padding = '12px';
    box.style.border = '1px solid rgba(255,255,255,.14)';
    box.style.borderRadius = '20px';
    box.style.background = 'rgba(0,0,0,.52)';
    box.style.backdropFilter = 'blur(16px)';
    box.style.boxShadow = '0 18px 60px rgba(0,0,0,.38)';
    box.style.color = settings.textColor || '#fff';
    box.style.fontFamily = 'Inter, Arial, sans-serif';

    var position = settings.musicPosition || 'bottom';
    if (position === 'top') {
      box.style.top = '16px';
      box.style.left = '50%';
      box.style.transform = 'translateX(-50%)';
    } else if (position === 'left') {
      box.style.left = '16px';
      box.style.bottom = '16px';
    } else if (position === 'right') {
      box.style.right = '16px';
      box.style.bottom = '16px';
    } else {
      box.style.left = '50%';
      box.style.bottom = '16px';
      box.style.transform = 'translateX(-50%)';
    }

    var row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '10px';

    if (settings.showCover !== false) {
      var cover = document.createElement('div');
      cover.style.width = '42px';
      cover.style.height = '42px';
      cover.style.borderRadius = '12px';
      cover.style.flex = '0 0 auto';
      cover.style.background = settings.coverImage ? 'url(' + settings.coverImage + ') center/cover' : 'linear-gradient(135deg,' + (settings.primaryColor || '#a855f7') + ',' + (settings.secondaryColor || '#22d3ee') + ')';
      row.appendChild(cover);
    }

    var content = document.createElement('div');
    content.style.minWidth = '0';
    content.style.flex = '1';

    var title = document.createElement('p');
    title.textContent = settings.musicTitle || profile.musicTitle || 'Profile music';
    title.style.margin = '0 0 8px';
    title.style.fontSize = '12px';
    title.style.fontWeight = '800';
    title.style.whiteSpace = 'nowrap';
    title.style.overflow = 'hidden';
    title.style.textOverflow = 'ellipsis';
    content.appendChild(title);

    var audio = document.createElement('audio');
    audio.controls = true;
    audio.src = settings.musicUrl;
    audio.style.width = '100%';
    audio.style.height = '30px';
    content.appendChild(audio);

    if (settings.showLyrics) {
      var lyrics = document.createElement('p');
      lyrics.textContent = 'Lyrics ready';
      lyrics.style.margin = '8px 0 0';
      lyrics.style.fontSize = '11px';
      lyrics.style.opacity = '.55';
      content.appendChild(lyrics);
    }

    row.appendChild(content);
    box.appendChild(row);
    document.body.appendChild(box);
  })();
`;

export const CommunityProfileTemplate = ({
  data,
  username,
  discordData,
}: ProfileTemplateProps) => {
  const template = data.communityTemplate;
  const { t } = useI18n();

  const srcDoc = useMemo(() => {
    if (!template) return "";

    const templateSettings = ((template as any).template_settings ||
      {}) as TemplateSettings;

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
      templateSettings,
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
      ${buildStudioCss(templateSettings)}
      ${template.css_code || ""}
    </style>
  </head>
  <body>
    <script>
      window.ARCXNJO_PROFILE = ${escapeJsonForHtml(profilePayload)};
    </script>
    ${template.html_code || ""}
    <script>
      try {
        ${buildStudioMusicScript()}
      } catch (error) {}
    </script>
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
          <p className="text-2xl font-black">
            {t("profile.communityTemplateUnavailable")}
          </p>
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
