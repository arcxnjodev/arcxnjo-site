import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaClock, FaHome, FaMapMarkerAlt, FaMusic } from "react-icons/fa";
import { ParticleLayer } from "./ParticleLayer";
import {
  BackgroundLayer,
  BadgesInline,
  DiscordProfileCard,
  EnterOverlay,
  MediaControls,
  SocialLinks,
} from "./ProfileParts";
import { ProfileMusicPlayer } from "./ProfileMusicPlayer";
import { getTemplateStyle } from "./profileUtils";
import { ProfileCursor } from "./ProfileCursor";
import type { ProfileEffect, ProfileTemplateProps } from "./types";
import { TypewriterBio } from "./TypewriterBio";


const scrollSections = [
  {
    id: "profile",
    label: "Profile",
  },
  {
    id: "activity",
    label: "Activity",
  },
  {
    id: "music",
    label: "Music",
  },
];

const ScrollDots = ({
  activeSection,
  onSelect,
}: {
  activeSection: string;
  onSelect: (id: string) => void;
}) => {
  return (
    <div className="fixed right-5 top-1/2 z-[80] hidden -translate-y-1/2 flex-col items-center gap-4 md:flex ">
      {scrollSections.map((section) => {
        const active = activeSection === section.id;

        return (
          <span
            key={section.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(section.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(section.id);
              }
            }}
            aria-label={section.label}
            title={section.label}
            className="group flex cursor-pointer items-center justify-center"
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                active
                  ? "h-3.5 w-3.5 bg-white shadow-[0_0_16px_rgba(255,255,255,0.95)]"
                  : "h-2 w-2 bg-white/35 group-hover:bg-white/80 group-hover:shadow-[0_0_10px_rgba(255,255,255,0.75)]"
              }`}
            />
          </span>
        );
      })}
    </div>
  );
};

export const ProScrollTemplate = ({
  data,
  username,
  apiUrl,
  discordData,
}: ProfileTemplateProps) => {
  const [entered, setEntered] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [now, setNow] = useState(new Date());
  const [activeSection, setActiveSection] = useState("profile");

  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isAutoScrollingRef = useRef(false);
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
    const container = scrollContainerRef.current;
    if (!container) return;

    let frame = 0;

    const updateActiveSection = () => {
      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        const containerMiddle = container.scrollTop + container.clientHeight / 2;

        let closestSection = scrollSections[0].id;
        let closestDistance = Number.POSITIVE_INFINITY;

        scrollSections.forEach((section) => {
          const element = container.querySelector<HTMLElement>(
            `#pro-${section.id}`
          );

          if (!element) return;

          const sectionMiddle = element.offsetTop + element.clientHeight / 2;
          const distance = Math.abs(containerMiddle - sectionMiddle);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestSection = section.id;
          }
        });

        setActiveSection(closestSection);
      });
    };

    updateActiveSection();
    container.addEventListener("scroll", updateActiveSection, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener("scroll", updateActiveSection);
    };
  }, []);

  const animateScrollTo = (targetTop: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const startTop = container.scrollTop;
    const distance = targetTop - startTop;
    const duration = 595;
    const startTime = performance.now();

    isAutoScrollingRef.current = true;

    const easeInOutCubic = (value: number) => {
      return value < 0.5
        ? 4 * value * value * value
        : 1 - Math.pow(-2 * value + 2, 3) / 2;
    };

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      container.scrollTop = startTop + distance * easedProgress;

      if (progress < 1) {
        requestAnimationFrame(step);
        return;
      }

      window.setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 120);
    };

    requestAnimationFrame(step);
  };

  const scrollToSection = (id: string) => {
    const container = scrollContainerRef.current;
    const element = container?.querySelector<HTMLElement>(`#pro-${id}`);

    if (!container || !element) return;

    setActiveSection(id);
    animateScrollTo(element.offsetTop);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (isAutoScrollingRef.current) return;

      const currentIndex = scrollSections.findIndex(
        (section) => section.id === activeSection
      );

      const direction = event.deltaY > 0 ? 1 : -1;

      const nextIndex = Math.min(
        Math.max(currentIndex + direction, 0),
        scrollSections.length - 1
      );

      const nextSection = scrollSections[nextIndex];

      if (!nextSection || nextSection.id === activeSection) return;

      scrollToSection(nextSection.id);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [activeSection]);

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

  const customCursorUrl = data.profile.custom_cursor_url?.trim();
  const hasCustomCursor = Boolean(customCursorUrl);

return (
    <div
      ref={scrollContainerRef}
      className={`profile-pro-scroll relative h-screen overflow-y-auto overflow-x-hidden overscroll-contain bg-black text-white [scrollbar-width:none] ${
        hasCustomCursor ? "cursor-none [&_*]:cursor-none" : ""
      }`}
    >
      <ProfileCursor cursorUrl={customCursorUrl} />
      <style>{`
        @font-face {
          font-family: 'arcxnjo';
          src: url('/fonts/bLcMbcn.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        .profile-pro-scroll, .profile-pro-scroll * {
          font-family: 'arcxnjo', sans-serif !important;
        }

        .profile-pro-scroll::-webkit-scrollbar {
          display: none;
        }

        @keyframes arcxnjoEqualizer {
          0%, 100% {
            transform: scaleY(0.35);
            opacity: 0.35;
          }

          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
      `}</style>

      <ScrollDots activeSection={activeSection} onSelect={scrollToSection} />

      <Link
        to="/"
        title="Home"
        aria-label="Go to home"
        className="fixed right-5 top-5 z-[60] flex h-11 w-11 items-center justify-center rounded-2xl bg-black/25 text-white/60 opacity-75 shadow-[0_8px_25px_rgba(0,0,0,0.22)] backdrop-blur-sm transition hover:bg-black/40 hover:text-white hover:opacity-100"
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

      {/* Áudio principal que controla tudo (o Player interno vai se conectar a este) */}
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
        <main className="relative z-10">
          <section
            id="pro-profile"
            className="flex min-h-screen items-center justify-center px-4 py-16"
          >
            <div className="w-full max-w-xl text-center">
              <img
                src={data.profile.profile_image || "/favicon.png"}
                alt={data.username}
                className={`mx-auto h-32 w-32 rounded-full bg-black object-cover ${template.avatar}`}
              />

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                  {displayName || data.username}
                </h1>

                <BadgesInline badges={profileBadges} />
              </div>

              <p className="mt-2 text-sm text-white/65">@{data.username}</p>

              {data.profile.bio && (
                <TypewriterBio
                  text={data.profile.bio}
                  className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/85"
                  delay={600}
                />
              )}

              <SocialLinks socialEntries={socialEntries} className="mt-7" />

              <p className="mt-6 text-xs uppercase tracking-[0.35em] text-white/35">
                scroll
              </p>
            </div>
          </section>

          <section
            id="pro-activity"
            className="mx-auto grid min-h-screen max-w-5xl content-center gap-5 px-4 py-16 md:grid-cols-2"
          >
            <div className="rounded-3xl border border-white/10 bg-black/40 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-md [will-change:transform]">
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

            <div className="rounded-3xl border border-white/10 bg-black/40 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-md [will-change:transform]">
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
                showLyrics={false}
                className="shadow-[0_20px_70px_rgba(0,0,0,0.35)]"
              />
            </div>

          </section>

          <section
            id="pro-music"
            className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-16"
          >
            <div className="w-full flex flex-col gap-6">
              {hasMusic ? (
                <ProfileMusicPlayer
                  externalAudioRef={audioRef}
                  musicUrl={data.profile.music_url!}
                  musicTitle={data.profile.music_title}
                  musicArtist={data.profile.music_artist}
                />
              ) : (
                <div className="rounded-[2rem] border border-white/10 bg-black/45 p-8 text-center backdrop-blur-md">
                  <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-white">
                    <FaMusic className="text-xl" />
                  </div>
                  <p className="text-sm font-semibold text-white/35">No profile music</p>
                </div>
              )}
            </div>
          </section>
        </main>
      )}
    </div>
  );
};