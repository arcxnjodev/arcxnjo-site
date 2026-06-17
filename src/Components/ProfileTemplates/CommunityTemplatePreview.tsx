import { useEffect, useRef } from "react";

type TemplateStudioSettings = {
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  backgroundColor?: string;
  cardRadius?: number;
  cardBlur?: number;
  glowIntensity?: number;
  avatarSize?: number;
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundOpacity?: number;
  buttonStyle?: string;
  buttonRadius?: number;
  buttonGlow?: boolean;
  showIcons?: boolean;
  buttonSize?: string;
  showMusic?: boolean;
  musicUrl?: string;
  musicTitle?: string;
  musicPosition?: string;
  showCover?: boolean;
  coverImage?: string;
  showLyrics?: boolean;
};

type Props = {
  htmlCode: string;
  cssCode?: string;
  jsCode?: string;
  height?: string;
  templateSettings?: TemplateStudioSettings;
};

export const CommunityTemplatePreview = ({
  htmlCode,
  cssCode = "",
  jsCode = "",
  height = "400px",
  templateSettings,
}: Props) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    const settingsVars = templateSettings
      ? `
        :root {
          --primary: ${templateSettings.primaryColor || "#a855f7"};
          --secondary: ${templateSettings.secondaryColor || "#22d3ee"};
          --text: ${templateSettings.textColor || "#ffffff"};
          --bg: ${templateSettings.backgroundColor || "#000000"};
          --card-radius: ${templateSettings.cardRadius ?? 16}px;
          --glow: ${templateSettings.glowIntensity ?? 50}%;
          --avatar-size: ${templateSettings.avatarSize ?? 80}px;
          --bg-opacity: ${templateSettings.backgroundOpacity ?? 80}%;
          --btn-radius: ${templateSettings.buttonRadius ?? 12}px;
        }
      `
      : "";

    const content = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { overflow: hidden; }
    ${settingsVars}
    ${cssCode}
  </style>
</head>
<body>
  ${htmlCode}
  <script>
    try {
      ${jsCode}
    } catch(e) {
      console.warn('Template JS error:', e);
    }
  <\/script>
</body>
</html>`;

    doc.open();
    doc.write(content);
    doc.close();
  }, [htmlCode, cssCode, jsCode, templateSettings]);

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-scripts allow-same-origin"
      style={{ width: "100%", height, border: "none", display: "block" }}
      title="Template Preview"
    />
  );
};
