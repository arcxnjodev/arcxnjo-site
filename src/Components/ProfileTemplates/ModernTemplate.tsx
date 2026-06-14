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

export const ModernTemplate = ({
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
    return data.profile.music_title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }, [data?.profile.music_title]);

  return (
    <div
      className={`relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-10 text-white ${
        hasCustomCursor ? "cursor-none [&_*]:cursor-none" : ""
      }`}
    >
      <ProfileCursor cursorUrl={customCursorUrl} />

      <Link
        to="/"
        className="fixed right-5 top-5 z-[60] flex h-11 w-11 items-center justify-center rounded-2xl bg-black/15 text-white/55 opacity-60 backdrop-blur-xl transition hover:bg-black/30 hover:text-white hover:opacity-100"
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
      {hasMusic && <audio ref={audioRef} src={data.profile.music_url} loop preload="auto" playsInline />}
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

      {entered && <GuestbookWidget username={username} apiUrl={apiUrl} template={template} />}

      {entered && (
        <div className="relative z-10 w-full max-w-2xl">

          {/* Header com banner */}
          <div className="relative mb-4 h-32 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            {data.profile.banner_image && (
              <img src={data.profile.banner_image} alt="banner" className="h-full w-full object-cover opacity-50" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          {/* Duas colunas */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[200px_1fr]">

            {/* Coluna esquerda */}
            <div className="flex flex-col gap-4">
              {/* Card de perfil */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-xl">
                <img
                  src={data.profile.profile_image || "/favicon.png"}
                  alt={data.username}
                  className="mx-auto h-20 w-20 rounded-2xl border border-white/10 bg-black object-cover shadow-lg"
                />
                <h1 className="mt-3 text-base font-black text-white">
                  {displayName || `@${data.username}`}
                </h1>
                {displayName && (
                  <p className="text-xs text-white/35">@{data.username}</p>
                )}
                <BadgesInline badges={profileBadges} />
              </div>

              {/* Views */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-xl">
                <p className="text-2xl font-black text-white">
                  {data.stats?.profile_views || 0}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                  {t("profile.views")}
                </p>
              </div>
            </div>

            {/* Coluna direita */}
            <div className="flex flex-col gap-4">
              {/* Bio */}
              {data.profile.bio && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Bio</p>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-white/70">
                    {data.profile.bio}
                  </p>
                </div>
              )}

              {/* Discord */}
              {discordData && (
                <DiscordProfileCard
                  discordData={discordData}
                  template={template}
                  showLyrics={true}
                />
              )}

              {/* Socials */}
              {socialEntries.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Links</p>
                  <SocialLinks socialEntries={socialEntries} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
