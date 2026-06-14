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

export const GridTemplate = ({
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
      className={`relative min-h-screen overflow-hidden bg-black text-white ${
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
        <div className="relative z-10 mx-auto w-full max-w-2xl px-4 py-10">

          {/* Card de perfil principal */}
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">

            {/* Banner interno */}
            <div className="relative h-24 bg-gradient-to-r from-white/5 to-white/10">
              {data.profile.banner_image && (
                <img
                  src={data.profile.banner_image}
                  alt="banner"
                  className="h-full w-full object-cover opacity-40"
                />
              )}

              {/* Avatar sobre o banner */}
              <div className="absolute -bottom-10 left-6">
                <img
                  src={data.profile.profile_image || "/favicon.png"}
                  alt={data.username}
                  className="h-20 w-20 rounded-2xl border-2 border-white/15 bg-black object-cover shadow-xl"
                />
              </div>
            </div>

            {/* Info */}
            <div className="px-6 pb-6 pt-12">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-black text-white">
                      {displayName || `@${data.username}`}
                    </h1>
                    <BadgesInline badges={profileBadges} />
                  </div>

                  {displayName && (
                    <p className="text-xs text-white/35">@{data.username}</p>
                  )}
                </div>

                <p className="text-xs text-white/25">
                  {data.stats?.profile_views || 0} {t("profile.views")}
                </p>
              </div>

              {data.profile.bio && (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/65">
                  {data.profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Grid de cards abaixo */}
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">

            {/* Card de socials */}
            {socialEntries.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
                  Links
                </p>
                <SocialLinks socialEntries={socialEntries} />
              </div>
            )}

            {/* Card do Discord */}
            {discordData && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
                  Discord
                </p>
                <DiscordProfileCard
                  discordData={discordData}
                  template={template}
                  showLyrics={true}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
