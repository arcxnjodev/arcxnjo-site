import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { useI18n } from "../../i18n/i18nProvider";
import { ParticleLayer } from "./ParticleLayer";
import {
  BackgroundLayer,
  BadgesInline,
  DiscordProfileCard,
  EnterOverlay,
  GuestbookWidget,
  MediaControls,
  SocialLinks,
} from "./ProfileParts";
import { getTemplateStyle } from "./profileUtils";
import { ProfileCursor } from "./ProfileCursor";
import type { ProfileEffect, ProfileTemplateProps } from "./types";

export const SleekTemplate = ({
  data,
  username,
  apiUrl,
  discordData,
}: ProfileTemplateProps) => {
  const { t } = useI18n();

  const [entered, setEntered] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.6);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement | null>(null);

  const hasMusic = Boolean(data?.profile.music_url);
  const isVideoBackground = Boolean(
    data?.profile.banner_type === "video" && data?.profile.banner_video
  );
  const controlsTarget = hasMusic ? "music" : isVideoBackground ? "video" : null;

  const template = getTemplateStyle(data.profile.profile_template);
  const displayName = data.profile.display_name?.trim();
  const profileEffect = (data.profile.profile_effect || "none") as ProfileEffect;
  const profileBadges = Array.isArray(data.profile.profile_badges)
    ? data.profile.profile_badges
    : [];

  const socialEntries = Object.entries(data.socialMedia || {}).filter(
    ([, url]) => url && url.trim() !== ""
  );

  useEffect(() => {
    if (controlsTarget === "music" && audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = muted;
    }
    if (controlsTarget === "video" && backgroundVideoRef.current) {
      backgroundVideoRef.current.volume = volume;
      backgroundVideoRef.current.muted = muted;
    }
  }, [volume, muted, controlsTarget]);

  const handleEnter = async () => {
    setEntered(true);
    try {
      if (hasMusic && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = volume;
        audioRef.current.muted = false;
        setMuted(false);
        await audioRef.current.play();
        return;
      }
      if (isVideoBackground && backgroundVideoRef.current) {
        backgroundVideoRef.current.volume = volume;
        backgroundVideoRef.current.muted = muted;
        await backgroundVideoRef.current.play();
      }
    } catch (error) {
      console.error("Media play error:", error);
    }
  };

  const toggleMute = () => setMuted((prev) => !prev);

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (value > 0 && muted) setMuted(false);
    if (value === 0) setMuted(true);
  };

  const customCursorUrl = data.profile.custom_cursor_url?.trim();
  const hasCustomCursor = Boolean(customCursorUrl);

  const formatMusicFileName = useMemo(() => {
    if (!data?.profile.music_title?.trim()) return "profile-audio";
    return data.profile.music_title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
  }, [data?.profile.music_title]);

  return (
    <div
      className={`relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white ${
        hasCustomCursor ? "cursor-none [&_*]:cursor-none" : ""
      }`}
    >
      <ProfileCursor cursorUrl={customCursorUrl} />

      <Link
        to="/"
        title="Home"
        aria-label="Go to home"
        className="fixed right-5 top-5 z-[60] flex h-11 w-11 items-center justify-center rounded-2xl bg-black/15 text-white/55 opacity-60 shadow-[0_8px_25px_rgba(0,0,0,0.22)] backdrop-blur-xl transition hover:bg-black/30 hover:text-white hover:opacity-100"
      >
        <FaHome className="text-base" />
      </Link>

      <BackgroundLayer
        data={data}
        template={template}
        isVideoBackground={isVideoBackground}
        backgroundVideoRef={backgroundVideoRef}
        controlsTarget={controlsTarget}
        muted={muted}
      />

      {entered && <ParticleLayer effect={profileEffect} />}

      {hasMusic && (
        <audio ref={audioRef} src={data.profile.music_url} loop preload="auto" playsInline />
      )}

      {!entered && <EnterOverlay onEnter={handleEnter} />}

      {entered && (
        <MediaControls
          data={data}
          template={template}
          hasMusic={hasMusic}
          controlsTarget={controlsTarget}
          muted={muted}
          volume={volume}
          toggleMute={toggleMute}
          handleVolumeChange={handleVolumeChange}
          formatMusicFileName={formatMusicFileName}
        />
      )}

      {entered && (
        <GuestbookWidget username={username} apiUrl={apiUrl} template={template} />
      )}

      {entered && (
        <div className="relative z-10 w-full max-w-3xl px-4 py-10">
          {/* Layout horizontal: foto + info */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">

            {/* Coluna esquerda: foto grande */}
            <div className="flex-shrink-0">
              <div className="relative mx-auto w-fit md:mx-0">
                <img
                  src={data.profile.profile_image || "/favicon.png"}
                  alt={data.username}
                  className="h-36 w-36 rounded-2xl border border-white/10 bg-black object-cover shadow-[0_0_40px_rgba(0,0,0,0.6)] md:h-44 md:w-44"
                />

                {/* Badge online do Discord */}
                {discordData?.discord_user && (
                  <span
                    className="absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-black"
                    style={{
                      backgroundColor:
                        discordData.discord_user.status === "online"
                          ? "#22c55e"
                          : discordData.discord_user.status === "idle"
                          ? "#eab308"
                          : discordData.discord_user.status === "dnd"
                          ? "#ef4444"
                          : "#6b7280",
                    }}
                  />
                )}
              </div>
            </div>

            {/* Coluna direita: info */}
            <div className="min-w-0 flex-1">
              {/* Nome + badges */}
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                  {displayName || `@${data.username}`}
                </h1>
                <BadgesInline badges={profileBadges} />
              </div>

              {displayName && (
                <p className="mt-0.5 text-sm text-white/45">@{data.username}</p>
              )}

              {data.profile.bio && (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/70">
                  {data.profile.bio}
                </p>
              )}

              {/* Views */}
              <p className="mt-3 text-xs text-white/30">
                {data.stats?.profile_views || 0} {t("profile.views")}
              </p>

              {/* Socials */}
              <SocialLinks socialEntries={socialEntries} className="mt-4" />
            </div>
          </div>

          {/* Discord card abaixo */}
          <DiscordProfileCard
            discordData={discordData}
            template={template}
            className="mt-4"
          />
        </div>
      )}
    </div>
  );
};
