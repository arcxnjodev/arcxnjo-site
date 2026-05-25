import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaClock, FaCode, FaHome, FaMapMarkerAlt, FaMusic } from "react-icons/fa";
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
import type { ProfileEffect, ProfileTemplateProps } from "./types";

const fallbackLyrics = [
  "Lyrics area ready",
  "Add synced lyrics later through a lyrics field/API",
  "This section stays focused on the currently playing track",
];

export const ProScrollTemplate = ({
  data,
  username,
  apiUrl,
  discordData,
}: ProfileTemplateProps) => {
  const { t } = useI18n();

  const [entered, setEntered] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [now, setNow] = useState(new Date());

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement | null>(null);

  const hasMusic = Boolean(data?.profile.music_url);
  const isVideoBackground = Boolean(
    data?.profile.banner_type === "video" && data?.profile.banner_video
  );
  const controlsTarget = hasMusic ? "music" : isVideoBackground ? "video" : null;

  const template = getTemplateStyle("pro-scroll");
  const displayName = data.profile.display_name?.trim();
  const profileEffect = (data.profile.profile_effect || "none") as ProfileEffect;
  const profileBadges = Array.isArray(data.profile.profile_badges)
    ? data.profile.profile_badges
    : [];

  const socialEntries = Object.entries(data.socialMedia || {}).filter(
    ([, url]) => url && url.trim() !== ""
  );

  const activeDiscordActivity =
    discordData?.activities?.find(
      (activity: any) => activity.type !== 4 && activity.name !== "Spotify"
    ) || null;

  const timeLabel = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);

  const dateLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit",
  }).format(now);

  const timeZoneLabel =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "Local timezone";

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

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
        audioRef.current.volume = volume;
        audioRef.current.muted = muted;
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

  const toggleMute = () => {
    setMuted((prev) => !prev);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);

    if (value > 0 && muted) {
      setMuted(false);
    }

    if (value === 0) {
      setMuted(true);
    }
  };

  const formatMusicFileName = useMemo(() => {
    if (!data?.profile.music_title?.trim()) return "profile-audio";

    return data.profile.music_title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
  }, [data?.profile.music_title]);

  const playingTitle =
    discordData?.spotify?.song ||
    data.profile.music_title ||
    t("profile.profileMusic") ||
    "Profile music";

  const playingArtist =
    discordData?.spotify?.artist ||
    (hasMusic ? "ARCXNJO profile audio" : t("profile.onlineOnDiscord"));

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <Link
        to="/"
        title="Home"
        aria-label="Go to home"
        className="fixed right-5 top-5 z-[60] flex h-11 w-11 items-center justify-center rounded-2xl bg-black/25 text-white/60 opacity-75 shadow-[0_8px_25px_rgba(0,0,0,0.22)] backdrop-blur-xl transition hover:bg-black/40 hover:text-white hover:opacity-100"
      >
        <FaHome className="text-base" />
      </Link>

      <div className="fixed inset-0">
        <BackgroundLayer
          data={data}
          template={template}
          isVideoBackground={isVideoBackground}
          backgroundVideoRef={backgroundVideoRef}
          controlsTarget={controlsTarget}
          muted={muted}
        />

        {entered && <ParticleLayer effect={profileEffect} />}
      </div>

      {hasMusic && (
        <audio ref={audioRef} src={data.profile.music_url} loop preload="auto" />
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
        <main className="relative z-10">
          <section className="flex min-h-screen items-center justify-center px-4 py-16">
            <div className="w-full max-w-xl text-center">
              <img
                src={data.profile.profile_image || "/favicon.png"}
                alt={data.username}
                className={`mx-auto h-32 w-32 rounded-full border-4 bg-black object-cover ${template.avatar}`}
              />

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                  {displayName || data.username}
                </h1>

                <BadgesInline badges={profileBadges} />
              </div>

              <p className="mt-2 text-sm text-white/65">@{data.username}</p>

              {data.profile.bio && (
                <p className="mx-auto mt-4 max-w-md whitespace-pre-line text-sm leading-relaxed text-white/85">
                  {data.profile.bio}
                </p>
              )}

              <SocialLinks socialEntries={socialEntries} className="mt-7" />

              <p className="mt-6 text-xs uppercase tracking-[0.35em] text-white/35">
                scroll
              </p>
            </div>
          </section>

          <section className="mx-auto grid min-h-screen max-w-5xl content-center gap-5 px-4 py-16 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-black/40 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white">
                  <FaClock />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">Local time</p>
                  <p className="text-xs text-white/45">{timeZoneLabel}</p>
                </div>
              </div>

              <p className="text-4xl font-black text-white md:text-5xl">
                {timeLabel}
              </p>

              <p className="mt-2 text-sm text-white/50">{dateLabel}</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/40 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white">
                  <FaMapMarkerAlt />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">Location</p>
                  <p className="text-xs text-white/45">Profile info</p>
                </div>
              </div>

              <p className="text-xl font-bold text-white">
                {data.profile.location || "Unknown"}
              </p>

              {data.profile.status_text && (
                <p className="mt-2 text-sm text-white/60">
                  {data.profile.status_text}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <DiscordProfileCard
                discordData={discordData}
                template={template}
                className="shadow-[0_20px_70px_rgba(0,0,0,0.35)]"
              />
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/40 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:col-span-2">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white">
                  <FaCode />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">Activity</p>
                  <p className="text-xs text-white/45">Discord / profile activity</p>
                </div>
              </div>

              {discordData?.spotify ? (
                <p className="text-sm text-white/75">
                  {t("profile.listeningSpotify")}:{" "}
                  <span className="font-bold text-white">
                    {discordData.spotify.song}
                  </span>{" "}
                  by {discordData.spotify.artist}
                </p>
              ) : activeDiscordActivity ? (
                <p className="text-sm text-white/75">
                  {activeDiscordActivity.name}
                  {(activeDiscordActivity.details || activeDiscordActivity.state) &&
                    ` · ${activeDiscordActivity.details || activeDiscordActivity.state}`}
                </p>
              ) : (
                <p className="text-sm text-white/60">
                  {t("profile.onlineOnDiscord")}
                </p>
              )}
            </div>
          </section>

          <section className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-16">
            <div className="w-full rounded-[2rem] border border-white/10 bg-black/45 p-5 shadow-[0_25px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl md:p-8">
              <div className="mb-6 flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-white">
                  <FaMusic className="text-xl" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-2xl font-black text-white">
                    {playingTitle}
                  </p>

                  <p className="truncate text-sm text-white/55">{playingArtist}</p>
                </div>
              </div>

              {hasMusic && (
                <audio
                  src={data.profile.music_url}
                  controls
                  className="mb-6 w-full"
                />
              )}

              <div className="rounded-3xl border border-white/10 bg-black/35 p-5">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-white/40">
                  lyrics
                </p>

                <div className="space-y-3 text-center text-lg font-semibold leading-relaxed text-white/80 md:text-xl">
                  {fallbackLyrics.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
};
