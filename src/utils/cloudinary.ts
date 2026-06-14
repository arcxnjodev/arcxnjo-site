/**
 * Otimiza URLs do Cloudinary adicionando parâmetros de qualidade.
 * Funciona apenas com URLs do Cloudinary — outras URLs passam sem modificação.
 */

const CLOUDINARY_PATTERN = /https:\/\/res\.cloudinary\.com\/([^/]+)\/(image|video)\/upload\//;

function injectTransform(url: string, transform: string): string {
  return url.replace(
    /\/(image|video)\/upload\//,
    `/$1/upload/${transform}/`
  );
}

/**
 * Retorna a URL com qualidade máxima para imagens.
 * Usa q_95,f_auto pra manter alta fidelidade e formato otimizado.
 */
export function optimizeImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (!CLOUDINARY_PATTERN.test(url)) return url;
  // Evita duplicar transformações
  if (url.includes("/q_") || url.includes("/f_auto")) return url;
  return injectTransform(url, "q_95,f_auto");
}

/**
 * Retorna a URL com qualidade máxima para vídeos.
 * Usa q_auto:best,vc_auto pra melhor qualidade sem reprocessar.
 */
export function optimizeVideoUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (!CLOUDINARY_PATTERN.test(url)) return url;
  if (url.includes("/q_") || url.includes("/vc_")) return url;
  return injectTransform(url, "q_auto:best,vc_auto");
}
