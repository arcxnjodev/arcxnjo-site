import { useMemo } from "react";

type CommunityTemplatePreviewProps = {
  htmlCode: string;
  cssCode?: string;
  jsCode?: string;
  height?: string;
};

const buildPreviewDocument = ({
  htmlCode,
  cssCode = "",
  jsCode = "",
}: {
  htmlCode: string;
  cssCode?: string;
  jsCode?: string;
}) => {
  const safeJs = jsCode.replace(/<\/script/gi, "<\\/script");

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
      body {
        overflow: auto;
      }
      ${cssCode}
    </style>
  </head>
  <body>
    ${htmlCode}
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
};

export const CommunityTemplatePreview = ({
  htmlCode,
  cssCode = "",
  jsCode = "",
  height = "420px",
}: CommunityTemplatePreviewProps) => {
  const srcDoc = useMemo(
    () => buildPreviewDocument({ htmlCode, cssCode, jsCode }),
    [htmlCode, cssCode, jsCode]
  );

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/40">
      <iframe
        title="Community template preview"
        sandbox="allow-scripts"
        srcDoc={srcDoc}
        className="block w-full bg-black"
        style={{ height }}
      />
    </div>
  );
};
