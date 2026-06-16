import type React from "react";
import { useEffect, useState, type FormEvent, type RefObject } from "react";
import {
  FaBookOpen,
  FaDiscord,
  FaGlobe,
  FaMusic,
  FaPaperPlane,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import { useI18n } from "../../i18n/i18nProvider";
import {
  badgeMap,
  discordProfileIcons,
  getSocialUrl,
  socialColors,
  socialIcons,
} from "./profileUtils";
import type { GuestbookEntry, ProfileData, TemplateStyle } from "./types";
import { LyricsDisplay } from "./LyricsDisplay";
import { optimizeImageUrl, optimizeVideoUrl } from "../../utils/cloudinary";

export const BackgroundLayer = ({
  data,
  template,
  isVideoBackground,
  backgroundVideoRef,
  controlsTarget,
  muted,
}: {
  data: ProfileData;
  template: TemplateStyle;
  isVideoBackground: boolean;
  backgroundVideoRef: RefObject<HTMLVideoElement | null>;
  controlsTarget: "music" | "video" | null;
  muted: boolean;
}) => {
  return (
    <>
      {isVideoBackground ? (
        <video
          ref={backgroundVideoRef as React.LegacyRef<HTMLVideoElement>}
          src={optimizeVideoUrl(data.profile.banner_video)}
          className="absolute inset-0 h-full w-full object-cover"
          muted={controlsTarget !== "video" ? true : muted}
          loop
          autoPlay={false}
          playsInline
        />
      ) : data.profile.banner_image ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${optimizeImageUrl(data.profile.banner_image)})`,
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-purple-950" />
      )}

      <div className={`absolute inset-0 ${template.overlay}`} />
    </>
  );
};

export const EnterOverlay = ({ onEnter }: { onEnter: () => void }) => {
  return (
    <button
      type="button"
      onClick={onEnter}
      aria-label="Enter profile"
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-black/25 backdrop-blur-md transition duration-500 hover:bg-black/20"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),transparent_32%,rgba(0,0,0,0.62)_100%)]" />

      <span className="relative select-none text-3xl font-black uppercase tracking-[0.34em] text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.55)] transition duration-300 hover:scale-105 md:text-5xl">
        Click
      </span>
    </button>
  );
};

export const BadgesInline = ({ badges }: { badges: string[] }) => {
  const [openBadgeId, setOpenBadgeId] = useState<string | null>(null);

  if (badges.length === 0) return null;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-2.5 py-1.5 align-middle backdrop-blur-2xl shadow-[0_0_24px_rgba(255,255,255,0.12)]">
      {badges.map((badgeId) => {
        const badge = badgeMap[badgeId];
        if (!badge) return null;

        const isOpen = openBadgeId === badgeId;

        return (
          <button
            key={badgeId}
            type="button"
            onClick={() =>
              setOpenBadgeId((prev) => (prev === badgeId ? null : badgeId))
            }
            onBlur={() => {
              window.setTimeout(() => {
                setOpenBadgeId((prev) => (prev === badgeId ? null : prev));
              }, 120);
            }}
            className="group relative grid h-9 w-9 place-items-center rounded-full transition hover:scale-110"
            title={badge.label}
          >
            <span className="absolute inset-0 rounded-full bg-white/5 opacity-0 blur-md transition group-hover:opacity-100" />

            <img
              src={badge.image}
              alt={badge.label}
              className="relative h-6 w-6 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.32)]"
              draggable={false}
            />

            <span
              className={`pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/85 px-2 py-1 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md transition-all duration-200 ${
                isOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
              }`}
            >
              {badge.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export const SocialLinks = ({
  socialEntries,
  className = "",
}: {
  socialEntries: [string, string][];
  className?: string;
}) => {
  if (socialEntries.length === 0) return null;

  return (
    <div className={`flex flex-wrap justify-center gap-4 ${className}`}>
      {socialEntries.map(([platform, url]) => {
        const Icon = socialIcons[platform.toLowerCase()] || FaGlobe;
        const color = socialColors[platform.toLowerCase()] || "#ffffff";

        return (
          <a
            key={platform}
            href={getSocialUrl(platform, url)}
            target="_blank"
            rel="noreferrer"
            title={platform}
            aria-label={platform}
            className="grid h-[54px] w-[54px] place-items-center rounded-full bg-black text-[26px] ring-1 ring-white/20 transition duration-200 hover:scale-110"
            style={{
              color: `${color} !important` as React.CSSProperties["color"],
              boxShadow: `0 0 18px ${color}33`,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 28px ${color}88`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 18px ${color}33`;
            }}
          >
            <Icon style={{ color, fill: color }} />
          </a>
        );
      })}
    </div>
  );
};

export const MediaControls = ({
  data,
  template,
  hasMusic,
  controlsTarget,
  muted,
  volume,
  toggleMute,
  handleVolumeChange,
  formatMusicFileName,
}: {
  data: ProfileData;
  template: TemplateStyle;
  hasMusic: boolean;
  controlsTarget: "music" | "video" | null;
  muted: boolean;
  volume: number;
  toggleMute: () => void;
  handleVolumeChange: (value: number) => void;
  formatMusicFileName: string;
}) => {
  const { t } = useI18n();
  void formatMusicFileName;

  if (!controlsTarget) return null;

  return (
    <div className="fixed left-5 top-5 z-40 group">
      <div className="relative">
        <button
          type="button"
          onClick={toggleMute}
          title={muted ? "Unmute" : "Mute"}
          className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200 ${template.audioButton}`}
        >
          {muted || volume === 0 ? (
            <FaVolumeMute className="text-xl" />
          ) : (
            <FaVolumeUp className="text-xl" />
          )}
        </button>

        <div className="pointer-events-none absolute left-0 top-full translate-y-1 pt-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
          <div className={`w-72 rounded-2xl p-4 ${template.audioPanel}`}>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <FaMusic className="text-sm text-white/90" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {hasMusic
                    ? data.profile.music_title || t("profile.profileMusic")
                    : t("profile.videoAudio")}
                </p>

                <p className="mt-0.5 text-xs text-white/50">
                  {muted || volume === 0
                    ? t("profile.muted")
                    : `${t("profile.volume")} ${Math.round(volume * 100)}%`}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-white/60">{t("profile.volume")}</span>
                <span className="text-xs text-white/60">
                  {Math.round(volume * 100)}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className={`h-2 w-full cursor-pointer ${template.sliderAccent}`}
              />
            </div>

            {hasMusic && (
              <div className="mt-4 rounded-xl bg-white/10 py-2.5 text-center text-sm font-medium text-white/65">
                Music is playing for visitors after CLICK TO ENTER
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const GuestbookWidget = ({
  username,
  apiUrl,
  template,
}: {
  username: string;
  apiUrl: string;
  template: TemplateStyle;
}) => {
  const { t } = useI18n();
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [open, setOpen] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const fetchGuestbook = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/profile/${username}/guestbook`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to load guestbook.");
        }

        setEntries(Array.isArray(result) ? result : []);
        setIndex(0);
        setVisible(true);
      } catch (error) {
        console.error("Guestbook fetch error:", error);
      }
    };

    if (username) {
      fetchGuestbook();
    }
  }, [username, apiUrl]);

  useEffect(() => {
    if (entries.length <= 1) return;

    let switchTimeout: number | null = null;

    const interval = window.setInterval(() => {
      setVisible(false);

      switchTimeout = window.setTimeout(() => {
        setIndex((prev) => (prev + 1) % entries.length);
        setVisible(true);
      }, 280);
    }, 3200);

    return () => {
      window.clearInterval(interval);
      if (switchTimeout) {
        window.clearTimeout(switchTimeout);
      }
    };
  }, [entries.length]);

  const currentEntry =
    entries.length > 0 ? entries[index % entries.length] : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!visitorName.trim() || !message.trim()) {
      setFeedback(t("profile.fillNameAndMessage"));
      return;
    }

    setSubmitting(true);
    setFeedback("");

    try {
      const response = await fetch(`${apiUrl}/api/profile/${username}/guestbook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visitorName,
          message,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message.");
      }

      if (result.entry) {
        setEntries((prev) => [result.entry, ...prev].slice(0, 30));
        setIndex(0);
        setVisible(true);
      }

      setVisitorName("");
      setMessage("");
      setFeedback(t("profile.messageSent"));
    } catch (error: any) {
      setFeedback(error.message || "Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex max-w-[90vw] items-end gap-3">
      <div className="pointer-events-none max-w-[260px] text-right">
        <div
          className={`transition-all duration-300 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          {currentEntry ? (
            <>
              <p className="text-sm font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
                {currentEntry.visitor_name}
              </p>

              <p className="mt-1 text-xs leading-relaxed text-white/85 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
                {currentEntry.message}
              </p>
            </>
          ) : (
            <p className="text-xs text-white/70 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
              {t("profile.noComments")}
            </p>
          )}
        </div>
      </div>

      <div className="relative">
        {open && (
          <div className="absolute bottom-16 right-0 w-[280px]">
            <div className={`rounded-2xl p-4 ${template.guestbookForm}`}>
              <div className="mb-3 flex items-center gap-2">
                <FaBookOpen className="text-sm text-white/80" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                  {t("profile.guestbook")}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder={t("profile.yourName")}
                  maxLength={32}
                  className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder-white/45"
                />

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("profile.leaveMessage")}
                  maxLength={180}
                  rows={3}
                  className="w-full resize-none rounded-xl bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder-white/45"
                />

                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-white/55">
                    {message.length}/180
                  </span>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20 disabled:opacity-50"
                  >
                    <FaPaperPlane className="text-xs" />
                    {submitting ? t("profile.sending") : t("profile.send")}
                  </button>
                </div>

                {feedback && <p className="text-xs text-white/70">{feedback}</p>}
              </form>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/20 text-white shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl transition hover:bg-black/30"
          title="Open guestbook"
        >
          <FaBookOpen className="text-lg" />
        </button>
      </div>
    </div>
  );
};

export const DiscordProfileCard = ({
  discordData,
  template,
  className = "",
  showLyrics = true,
}: {
  discordData: any;
  template: TemplateStyle;
  className?: string;
  showLyrics?: boolean;
}) => {
  const { t } = useI18n();

  const discordUser = discordData?.discord_user;

  if (!discordData || !discordUser) return null;

  const discordAvatar = discordUser?.avatar
    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${
        discordUser.avatar.startsWith("a_") ? "gif" : "png"
      }?size=128`
    : "https://cdn.discordapp.com/embed/avatars/0.png";

  const discordDisplayName =
    discordUser?.global_name || discordUser?.username || "Discord User";

  const discordStatusClass =
    discordData?.discord_status === "online"
      ? "bg-green-400"
      : discordData?.discord_status === "idle"
      ? "bg-yellow-400"
      : discordData?.discord_status === "dnd"
      ? "bg-red-500"
      : "bg-gray-400";

  const activeDiscordActivity =
    discordData?.activities?.find(
      (activity: any) => activity.type !== 4 && activity.name !== "Spotify"
    ) || null;

  const hasNitro = Boolean(
    discordData?.nitro ||
      Number(discordData?.premium_type) > 0 ||
      discordData?.discord_user?.avatar?.startsWith("a_") ||
      discordData?.banner?.startsWith("a_") ||
      discordData?.avatar_decoration ||
      discordData?.collectibles
  );

  const hasServerBoost = Boolean(discordData?.server_boosted);
  const serverRole = discordData?.server_role || null;
  const primaryGuild = discordData?.primary_guild || null;

  const nitroLabel =
    discordData?.premium_type === 1
      ? "Nitro Classic"
      : discordData?.premium_type === 2
      ? "Nitro"
      : discordData?.premium_type === 3
      ? "Nitro Basic"
      : "Nitro";

  const primaryGuildBadgeUrl =
    primaryGuild?.identity_guild_id && primaryGuild?.badge
      ? `https://cdn.discordapp.com/guild-tag-badges/${primaryGuild.identity_guild_id}/${primaryGuild.badge}.png?size=32`
      : null;

  return (
    <div className={`rounded-2xl p-4 text-left ${template.infoCard} ${className}`}>
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <img
            src={discordAvatar}
            alt={discordDisplayName}
            className="h-14 w-14 rounded-full bg-black object-cover"
          />

          <span
            className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-black ${discordStatusClass}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <FaDiscord className={`text-sm ${template.infoIcon}`} />

            <p className="truncate text-base font-semibold text-white">
              {discordDisplayName}
            </p>
          </div>

          <p className="truncate text-xs text-white/55">@{discordUser.username}</p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {hasNitro && (
              <span title={nitroLabel} className="inline-flex items-center justify-center">
                <img
                  src={discordProfileIcons.nitro}
                  alt={nitroLabel}
                  className="h-5 w-5 object-contain"
                  draggable={false}
                />
              </span>
            )}

            {hasServerBoost && (
              <span title="Server Booster" className="inline-flex items-center justify-center">
                <img
                  src={discordProfileIcons.boost}
                  alt="Server Booster"
                  className="h-5 w-5 object-contain"
                  draggable={false}
                />
              </span>
            )}

            {primaryGuild?.identity_enabled && primaryGuild?.tag && (
              <span
                title={primaryGuild.tag}
                className="inline-flex items-center gap-1 rounded-md bg-white/10 px-1.5 py-0.5 text-[11px] font-bold text-white"
              >
                {primaryGuildBadgeUrl && (
                  <img
                    src={primaryGuildBadgeUrl}
                    alt={primaryGuild.tag}
                    className="h-4 w-4 object-contain"
                    draggable={false}
                  />
                )}
                {primaryGuild.tag}
              </span>
            )}

            {serverRole && (
              <span
                title={serverRole.name}
                className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-white"
                style={{
                  backgroundColor: `${serverRole.color}33`,
                  boxShadow: `0 0 10px ${serverRole.color}22`,
                }}
              >
                {serverRole.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {discordData.spotify ? (
  <>
    <div className="mt-4 flex items-center gap-3 rounded-xl bg-black/20 p-3">
      {discordData.spotify.album_art_url && (
        <img
          src={discordData.spotify.album_art_url}
          alt={discordData.spotify.song}
          className="h-11 w-11 rounded-lg object-cover"
        />
      )}

      <div className="min-w-0">
        <p className="text-xs text-white/50">{t("profile.listeningSpotify")}</p>

        <p className="mt-1 truncate text-sm font-semibold text-white">
          {discordData.spotify.song}
        </p>

        <p className="truncate text-xs text-white/60">
          {discordData.spotify.artist}
        </p>
      </div>
    </div>

      {showLyrics && <LyricsDisplay spotify={discordData.spotify} />}
  </>
      ) : activeDiscordActivity ? (
        <div className="mt-4 rounded-xl bg-black/20 p-3">
          <p className="text-xs text-white/50">{t("profile.activity")}</p>

          <p className="mt-1 truncate text-sm font-semibold text-white">
            {activeDiscordActivity.name}
          </p>

          {(activeDiscordActivity.details || activeDiscordActivity.state) && (
            <p className="truncate text-xs text-white/60">
              {activeDiscordActivity.details || activeDiscordActivity.state}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-xl bg-black/20 p-3">
          <p className="text-xs text-white/60">{t("profile.onlineOnDiscord")}</p>
        </div>
      )}
    </div>
  );
};
