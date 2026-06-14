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

export const MinimalTemplate = ({
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
      className={`relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-10 text-white ${
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
        /* Sem card — tudo flutua direto sobre o fundo */
        <div className="relative z-10 w-full max-w-xs text-center">

          <img
            src={data.profile.profile_image || "/favicon.png"}
            alt={data.username}
            className="mx-auto h-20 w-20 rounded-full border border-white/10 bg-black object-cover"
          />

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">
              {displayName || `@${data.username}`}
            </h1>
            <BadgesInline badges={profileBadges} />
          </div>

          {displayName && (
            <p className="mt-0.5 text-xs text-white/35">@{data.username}</p>
          )}

          {data.profile.bio && (
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/55">
              {data.profile.bio}
            </p>
          )}

          <p className="mt-2 text-xs text-white/20">
            {data.stats?.profile_views || 0} {t("profile.views")}
          </p>

          <SocialLinks socialEntries={socialEntries} className="mt-5" />

          {discordData && (
            <DiscordProfileCard
              discordData={discordData}
              template={template}
              className="mt-5 text-left"
              showLyrics={true}
            />
          )}
        </div>
      )}
    </div>
  );
};
