import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaClock, FaHome, FaMapMarkerAlt, FaMusic } from "react-icons/fa";
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
    <div className="fixed right-5 top-1/2 z-[80] hidden -translate-y-1/2 flex-col items-center gap-3 md:flex">
      {scrollSections.map((section) => {
        const active = activeSection === section.id;

        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            className="group flex h-4 w-4 items-center justify-center"
            aria-label={section.label}
            title={section.label}
          >
            <span
              className={`rounded-full transition-all duration-300 ${
                active
                  ? "h-3 w-3 bg-white shadow-[0_0_16px_rgba(255,255,255,0.95)]"
                  : "h-1.5 w-1.5 bg-white/35 group-hover:h-2.5 group-hover:w-2.5 group-hover:bg-white/85 group-hover:shadow-[0_0_12px_rgba(255,255,255,0.75)]"
              }`}
            />
          </button>
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
  const { t } = useI18n();

  const [entered, setEntered] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [now, setNow] = useState(new Date());
  const [activeSection, setActiveSection] = useState("profile");

  const audioRef = useRef<HTMLAudioElement | null>(null);
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
    const duration = 850;
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

  const playingTitle =
    discordData?.spotify?.song ||
    data.profile.music_title ||
    t("profile.profileMusic") ||
    "Profile music";

  const playingArtist =
    discordData?.spotify?.artist ||
    (hasMusic ? "ARCXNJO profile audio" : t("profile.onlineOnDiscord"));

  return (
    <div
      ref={scrollContainerRef}
      className="profile-pro-scroll relative h-screen overflow-y-auto overflow-x-hidden overscroll-contain bg-black text-white [scrollbar-width:none]"
    >
      <style>{`
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
        <main className="relative z-10">
          <section
            id="pro-profile"
            className="flex min-h-screen items-center justify-center px-4 py-16"
          >
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

          <section
            id="pro-activity"
            className="mx-auto grid min-h-screen max-w-5xl content-center gap-5 px-4 py-16 md:grid-cols-2"
          >
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
            
          </section>

          <section
            id="pro-music"
            className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-16"
          >
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

              {hasMusic ? (
                <div className="mb-6 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-center text-sm font-semibold text-white/65">
                  Music starts after CLICK TO ENTER
                </div>
              ) : (
                <div className="mb-6 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-center text-sm font-semibold text-white/35">
                  No profile music
                </div>
              )}

              <div className="rounded-3xl border border-white/10 bg-black/35 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/40">
                      now playing
                    </p>

                    <p className="mt-2 max-w-[260px] truncate text-sm font-semibold text-white/70">
                      {playingTitle}
                    </p>
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                    live
                  </span>
                </div>

                <div className="mt-6 flex h-24 items-end justify-center gap-1.5 overflow-hidden rounded-2xl bg-black/25 px-4 py-4">
                  {Array.from({ length: 28 }).map((_, index) => (
                    <span
                      key={index}
                      className="w-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.55)]"
                      style={{
                        height: `${18 + ((index * 13) % 72)}%`,
                        opacity: 0.35 + ((index % 5) * 0.12),
                        animation: `arcxnjoEqualizer ${
                          0.7 + (index % 6) * 0.12
                        }s ease-in-out infinite`,
                        animationDelay: `${index * 0.045}s`,
                      }}
                    />
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
