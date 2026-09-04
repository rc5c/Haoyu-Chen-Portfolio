import { useEffect, useMemo, useRef, useState } from "react";
import { appPath, publicUrl } from "./urls";
import {
  categories,
  categoryMeta,
  communication,
  projectBySlug,
  projectsFor,
  youtubeEmbedUrl,
} from "./data";

function usePathname() {
  const [pathname, setPathname] = useState(() => appPath(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setPathname(appPath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (to, { replace = false } = {}) => {
    window.history[replace ? "replaceState" : "pushState"]({}, "", publicUrl(to));
    setPathname(to);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return [pathname, navigate];
}

function RouteLink({ to, navigate, children, className = "", onBeforeNavigate }) {
  const handleClick = (event) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    if (onBeforeNavigate) onBeforeNavigate();
    navigate(to);
  };

  return (
    <a href={publicUrl(to)} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

function MinimalNav({ navigate, active, onHome }) {
  return (
    <header className={`minimal-nav theme-${active || "neutral"}`}>
      <button type="button" className="wordmark" onClick={onHome}>
        Haoyu Chen’s Portfolio
      </button>
      <nav aria-label="Portfolio categories">
        <button type="button" className="home-link" onClick={onHome}>
          HOME
        </button>
        {categories.map((category) => (
          <RouteLink
            key={category}
            to={`/${category}`}
            navigate={navigate}
            className={active === category ? "active" : ""}
          >
            {categoryMeta[category].label}
          </RouteLink>
        ))}
        <RouteLink
          to="/communication"
          navigate={navigate}
          className={active === "communication" ? "active" : ""}
        >
          COMMUNICATION
        </RouteLink>
      </nav>
    </header>
  );
}

function HandwrittenTitle() {
  const lines = [
    { text: "Haoyu", y: 94, delay: "0s" },
    { text: "Chen’s", y: 178, delay: "0.55s" },
    { text: "Portfolio", y: 266, delay: "1.05s" },
  ];

  return (
    <svg
      className="handwritten-title"
      viewBox="0 0 520 330"
      role="img"
      aria-label="Haoyu Chen’s Portfolio"
    >
      <defs>
        <linearGradient id="title-rainbow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f08aa8" />
          <stop offset="24%" stopColor="#efa35c" />
          <stop offset="45%" stopColor="#d4db68" />
          <stop offset="65%" stopColor="#58ced0" />
          <stop offset="82%" stopColor="#5f9de8" />
          <stop offset="100%" stopColor="#9d72dc" />
        </linearGradient>
      </defs>
      {lines.map((line) => (
        <g key={line.text} style={{ "--line-delay": line.delay }}>
          <text className="title-stroke" x="260" y={line.y} textAnchor="middle">
            {line.text}
          </text>
          <text className="title-fill" x="260" y={line.y} textAnchor="middle">
            {line.text}
          </text>
        </g>
      ))}
      <path
        className="title-underline"
        d="M135 302 C230 290 335 286 410 271"
        pathLength="1"
      />
    </svg>
  );
}

function IntroScene({ navigate, initialStage = "idle", onHubVisited }) {
  const [stage, setStage] = useState(initialStage);
  const [transitionCategory, setTransitionCategory] = useState(null);
  const [showIdleHint, setShowIdleHint] = useState(false);
  const [coverReady, setCoverReady] = useState(false);
  const coverRef = useRef(null);
  const idleTimerRef = useRef(null);
  const bookActivatedRef = useRef(false);
  const timerIds = useRef([]);
  const reducedMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    document.title = "Haoyu Chen’s Portfolio";
    if (coverRef.current?.complete && coverRef.current.naturalWidth > 0) {
      setCoverReady(true);
    }
  }, []);

  useEffect(() => {
    if (stage !== "idle" || !coverReady || bookActivatedRef.current) {
      setShowIdleHint(false);
      return undefined;
    }
    idleTimerRef.current = window.setTimeout(() => {
      if (!bookActivatedRef.current) setShowIdleHint(true);
    }, 2000);
    return () => {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    };
  }, [stage, coverReady]);

  useEffect(
    () => () => timerIds.current.forEach((timerId) => window.clearTimeout(timerId)),
    [],
  );

  const after = (delay, action) => {
    const timerId = window.setTimeout(action, delay);
    timerIds.current.push(timerId);
  };

  const begin = () => {
    if (stage !== "idle") return;
    bookActivatedRef.current = true;
    window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = null;
    setShowIdleHint(false);
    if (reducedMotion) {
      setStage("hub-idle");
      return;
    }

    setStage("title-writing");
    after(2600, () => setStage("title-complete"));
    after(3020, () => setStage("book-opening"));
    after(3920, () => setStage("object-reveal"));
    after(4720, () => setStage("hub-idle"));
  };

  const openCategory = (category) => {
    if (stage !== "hub-idle" || transitionCategory) return;
    onHubVisited();
    if (reducedMotion) {
      navigate(`/${category}`);
      return;
    }

    setTransitionCategory(category);
    setStage("category-transition");
    after(440, () => navigate(`/${category}`));
  };

  const hubVisible = [
    "book-opening",
    "object-reveal",
    "hub-idle",
    "category-transition",
  ].includes(stage);

  return (
    <main className={`intro-scene stage-${stage}`} data-cover-ready={coverReady} aria-live="polite">
      <div className="book-visual">
        <img
          ref={coverRef}
          className="scene-image closed-book-image"
          src={publicUrl("/assets/book-closed.png")}
          alt="Closed white portfolio book"
          fetchPriority="high"
          onLoad={() => setCoverReady(true)}
        />
        <span className="bookmark-accent" aria-hidden="true" />
        <HandwrittenTitle />
        <div className="book-geometry">
          <button
            type="button"
            className="book-trigger"
            onClick={begin}
            disabled={stage !== "idle"}
            aria-label="Open Haoyu Chen's portfolio book"
          />
          {stage === "idle" && showIdleHint && (
            <div className="book-idle-hint visible" aria-hidden="true">
              <svg viewBox="0 0 100 120">
                <path d="M50 9 C47 34 53 66 50 105" pathLength="1" />
                <path d="M29 85 L50 107 L71 85" pathLength="1" />
              </svg>
              <span className="hint-desktop-label">Click Me</span>
              <span className="hint-touch-label">Tap Me</span>
            </div>
          )}
        </div>
      </div>

      <p className="sr-only">
        {stage === "idle"
          ? "Closed portfolio book ready to open."
          : stage === "hub-idle"
            ? "Portfolio book open. Choose Gallery, Sound, Video, or Website."
            : "Opening Haoyu Chen's portfolio."}
      </p>

      <section className={`hub-scene ${hubVisible ? "visible" : ""}`} aria-label="Portfolio book">
        <img
          className="hub-image"
          src={publicUrl("/assets/book-hub.png")}
          alt="An open book with a photo album, music player, video screen, and browser window emerging from its pages"
        />
        <div className="category-hotspots">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              className={`category-hotspot ${category}`}
              onClick={() => openCategory(category)}
              disabled={stage !== "hub-idle"}
              aria-label={`Open ${categoryMeta[category].label} projects`}
            >
              <span>{categoryMeta[category].label}</span>
            </button>
          ))}
        </div>
      </section>

      <div
        className={`category-wipe ${transitionCategory ? "active" : ""}`}
        style={{ "--wipe-color": transitionCategory ? categoryMeta[transitionCategory].accent : "transparent" }}
        aria-hidden="true"
      />
    </main>
  );
}

function ProjectCard({ project, navigate }) {
  return (
    <RouteLink
      to={`/${project.category}/${project.slug}`}
      navigate={navigate}
      className="project-card"
    >
      <div className="project-thumb">
        {project.thumbnail ? <img src={project.thumbnail} alt="" loading="lazy" decoding="async" /> : <span className="media-category-symbol" aria-hidden="true">♫</span>}
        <span className="view-cue">VIEW PROJECT</span>
      </div>
      <div className="project-card-copy">
        <h2>{project.title}</h2>
        <div>
          <span>{project.type}</span>
          <span>{project.year}</span>
        </div>
      </div>
    </RouteLink>
  );
}

function CategoryPage({ category, navigate, onHome }) {
  const meta = categoryMeta[category];
  const categoryProjects = projectsFor(category);

  useEffect(() => {
    document.title = `${meta.label} — Haoyu Chen’s Portfolio`;
  }, [meta.label]);

  return (
    <main className={`content-page category-page theme-${category}`}>
      <MinimalNav navigate={navigate} active={category} onHome={onHome} />
      <section className="category-heading">
        <div>
          <p className="eyebrow">{meta.eyebrow}</p>
          <h1>{meta.label}</h1>
        </div>
        <p>{meta.description}</p>
      </section>
      <section className="project-grid" aria-label={`${meta.label} projects`}>
        {categoryProjects.map((project) => (
          <ProjectCard key={project.id} project={project} navigate={navigate} />
        ))}
      </section>
      <footer className="page-footer">
        <span>Haoyu Chen</span>
        <span>Selected work</span>
      </footer>
    </main>
  );
}

function GalleryViewer({ project }) {
  const images = project.images?.length
    ? project.images
    : [project.mediaUrl || project.thumbnail].filter(Boolean);
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const dialogRef = useRef(null);
  const changeImage = (step) => setIndex((current) => (current + step + images.length) % images.length);

  useEffect(() => {
    if (!expanded) return undefined;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [expanded]);

  const controls = (
    <div className="viewer-controls">
      <button type="button" disabled={images.length < 2} onClick={() => changeImage(-1)}>PREVIOUS</button>
      <span aria-live="polite">{String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
      <button type="button" disabled={images.length < 2} onClick={() => changeImage(1)}>NEXT</button>
    </div>
  );

  return (
    <>
      <div className="gallery-viewer media-shell">
        <button className="gallery-open" type="button" onClick={() => setExpanded(true)} aria-label={`Open ${project.title} image ${index + 1} fullscreen`}>
          <img src={images[index]} alt={`${project.title}, image ${index + 1}`} decoding="async" />
          <span className="gallery-expand-cue">VIEW FULLSCREEN ↗</span>
        </button>
        {controls}
      </div>
      <dialog className="gallery-lightbox" ref={dialogRef} aria-label={`${project.title} fullscreen viewer`}
        onCancel={() => setExpanded(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            setExpanded(false);
          }
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            changeImage(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}>
        <header><span>{project.title}</span><button type="button" onClick={() => setExpanded(false)}>CLOSE ×</button></header>
        {expanded && <img src={images[index]} alt={`${project.title}, image ${index + 1}`} />}
        {controls}
      </dialog>
    </>
  );
}

function SoundPlayer({ project }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [error, setError] = useState("");
  const audioRef = useRef(null);
  const scrubbingRef = useRef(false);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setError("");
    if (!audio.paused) audio.pause();
    else {
      try {
        if (audio.ended || (Number.isFinite(audio.duration) && audio.currentTime >= audio.duration)) {
          audio.currentTime = 0;
          setCurrentTime(0);
        }
        await audio.play();
      }
      catch { setError("Audio could not start. Please try again."); }
    }
  };

  const changeVolume = (event) => {
    const nextVolume = Math.min(1, Math.max(0, Number(event.currentTarget.value) / 100));
    setVolume(nextVolume);
    if (audioRef.current) audioRef.current.volume = nextVolume;
  };

  const seekTo = (value) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    const nextTime = Math.min(audio.duration, Math.max(0, Number(value)));
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };
  const seek = (event) => seekTo(event.currentTarget.value);
  const seekAtPointer = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    seekTo(((event.clientX - bounds.left) / bounds.width) * duration);
  };
  const syncTime = (event) => {
    if (!scrubbingRef.current) setCurrentTime(event.currentTarget.currentTime);
  };
  const syncDuration = (event) => {
    const value = event.currentTarget.duration;
    setDuration(Number.isFinite(value) ? value : 0);
  };
  const formatTime = (value) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;

  return (
    <div className="sound-player media-shell">
      {project.audioUrl && (
        <audio
          ref={audioRef}
          src={project.audioUrl}
          preload="metadata"
          onLoadedMetadata={syncDuration}
          onDurationChange={syncDuration}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onVolumeChange={(event) => setVolume(event.currentTarget.volume)}
          onEnded={(event) => { setPlaying(false); syncTime(event); }}
          onTimeUpdate={syncTime}
          onSeeked={syncTime}
          onError={() => { setPlaying(false); setError("Audio could not load."); }}
        />
      )}
      {(project.mediaUrl || project.thumbnail) ? <img src={project.mediaUrl || project.thumbnail} alt="" /> : <span className="media-category-symbol" aria-hidden="true">♫</span>}
      <div className="sound-console">
        <div>
          <p>NOW PLAYING</p>
          <h2>{project.title}</h2>
        </div>
        <button type="button" className="round-control" onClick={toggle} aria-pressed={playing} disabled={!project.audioUrl}>
          {playing ? "PAUSE" : "PLAY"}
        </button>
        <label className="seek-control">
          <span className="sr-only">Playback progress</span>
          <input type="range" min="0" max={duration || 1} step="0.1" value={currentTime} disabled={!duration}
            aria-label="Playback progress"
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
            onInput={seek} onChange={seek}
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              event.preventDefault();
              event.currentTarget.focus();
              event.currentTarget.setPointerCapture(event.pointerId);
              scrubbingRef.current = true;
              seekAtPointer(event);
            }}
            onPointerMove={(event) => { if (scrubbingRef.current) seekAtPointer(event); }}
            onPointerUp={(event) => {
              if (!scrubbingRef.current) return;
              seekAtPointer(event);
              scrubbingRef.current = false;
              event.currentTarget.releasePointerCapture(event.pointerId);
            }}
            onPointerCancel={() => { scrubbingRef.current = false; }}
            onLostPointerCapture={() => { scrubbingRef.current = false; }}
            onKeyDown={(event) => {
              const targets = { ArrowLeft: currentTime - 5, ArrowDown: currentTime - 5, ArrowRight: currentTime + 5, ArrowUp: currentTime + 5, Home: 0, End: duration };
              if (event.key in targets) { event.preventDefault(); seekTo(targets[event.key]); }
            }}
            onBlur={() => { scrubbingRef.current = false; }} />
          <span className="audio-times"><time>{formatTime(currentTime)}</time><time>{duration ? formatTime(duration) : "—:—"}</time></span>
        </label>
        <label className="volume-control">
          <span>VOLUME</span>
          <input type="range" min="0" max="100" step="1" value={Math.round(volume * 100)}
            aria-label="Volume"
            aria-valuetext={`${Math.round(volume * 100)} percent`}
            onInput={changeVolume}
            onChange={changeVolume} />
        </label>
      </div>
      {error && <p className="audio-error" role="alert">{error}</p>}
    </div>
  );
}

function VideoPlayer({ project }) {
  const embedUrl = youtubeEmbedUrl(project.videoUrl);
  return embedUrl ? (
    <div className="video-player youtube-player media-shell">
      <iframe
        src={embedUrl}
        title={project.title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  ) : (
    <div className="video-player media-shell">
      {project.videoUrl ? <video src={project.videoUrl} controls preload="metadata" playsInline /> : <p>No video supplied.</p>}
    </div>
  );
}

function WebsiteViewer({ project, navigate }) {
  const projectUrl = project.websiteUrl || project.externalUrl;
  return (
    <div className="website-viewer media-shell">
      <div className="browser-bar">
        <span>PORTFOLIO.HTML</span>
        <span>READY</span>
      </div>
      {project.localProjectPath ? (
        <iframe
          className="website-project-frame"
          src={project.localProjectPath}
          title={`${project.title} website preview`}
          loading="lazy"
        />
      ) : (
        <img src={project.mediaUrl || project.thumbnail} alt={`${project.title} website preview`} decoding="async" />
      )}
      {projectUrl ? (
        <a href={projectUrl} target="_blank" rel="noreferrer">OPEN PROJECT</a>
      ) : (
        <button type="button" onClick={() => navigate("/")}>OPEN PROJECT</button>
      )}
    </div>
  );
}

function MediaViewer({ project, navigate }) {
  if (project.category === "gallery") return <GalleryViewer project={project} />;
  if (project.category === "sound") return <SoundPlayer project={project} />;
  if (project.category === "video") return <VideoPlayer project={project} />;
  return <WebsiteViewer project={project} navigate={navigate} />;
}

function ProjectInfo({ project }) {
  const rows = [
    ["MEDIUM", project.type],
    ["YEAR", project.year],
    ["COURSE", project.course],
    project.duration ? ["DURATION", project.duration] : null,
    project.role ? ["ROLE", project.role] : null,
    project.technologies ? ["TECHNOLOGIES", project.technologies] : null,
  ].filter((row) => row?.[1]);

  return (
    <aside className="project-info">
      <p className="eyebrow">{categoryMeta[project.category].label} PROJECT</p>
      <h1>{project.title}</h1>
      <p className="project-type">{project.type}</p>
      <dl>
        {rows.map(([term, detail]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{detail}</dd>
          </div>
        ))}
      </dl>
      {project.description && (
        <div className="concept-copy">
          <p>CONCEPT</p>
          <p>{project.description}</p>
        </div>
      )}
      {(project.externalUrl || project.githubUrl || project.websiteUrl) && (
        <div className="project-links">
          {project.externalUrl && <a href={project.externalUrl} target="_blank" rel="noreferrer">VIEW PROJECT</a>}
          {project.websiteUrl && <a href={project.websiteUrl} target="_blank" rel="noreferrer">OPEN WEBSITE</a>}
          {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer">VIEW GITHUB</a>}
        </div>
      )}
    </aside>
  );
}

function ProjectPage({ project, navigate, onHome }) {
  useEffect(() => {
    document.title = `${project.title} — Haoyu Chen’s Portfolio`;
  }, [project.title]);

  return (
    <main className={`content-page detail-page theme-${project.category}`}>
      <MinimalNav navigate={navigate} active={project.category} onHome={onHome} />
      <div className="detail-back-row">
        <RouteLink to={`/${project.category}`} navigate={navigate} className="back-link">
          BACK TO {categoryMeta[project.category].label}
        </RouteLink>
      </div>
      <section className="project-detail-layout">
        <div className="media-column">
          <MediaViewer key={project.id} project={project} navigate={navigate} />
          <div className="media-caption">
            <span>{project.title}</span>
            <span>{[project.year, project.type].filter(Boolean).join(" · ")}</span>
          </div>
        </div>
        <ProjectInfo project={project} />
      </section>
    </main>
  );
}

function CommunicationPage({ navigate, onHome }) {
  const links = [
    ["Email", communication.email ? `mailto:${communication.email}` : "", communication.email],
    ["GitHub", communication.github, communication.github?.replace(/^https?:\/\//, "")],
    ["LinkedIn", communication.linkedin, communication.linkedin?.replace(/^https?:\/\//, "")],
    ["Instagram", communication.instagram, communication.instagram?.replace(/^https?:\/\//, "")],
  ].filter(([, href]) => href);

  useEffect(() => {
    document.title = "Communication — Haoyu Chen’s Portfolio";
  }, []);

  return (
    <main className="content-page communication-page theme-communication">
      <MinimalNav navigate={navigate} active="communication" onHome={onHome} />
      <section className="communication-layout">
        <div className="communication-intro">
          <p className="eyebrow">ABOUT & CONTACT</p>
          <h1>Communication</h1>
          <p className="communication-lead">{communication.introduction}</p>
          <dl className="communication-identity">
            {communication.academicIdentity && <div>
              <dt>CURRENTLY</dt>
              <dd>{communication.academicIdentity}</dd>
            </div>}
            {communication.interests && <div>
              <dt>INTERESTS</dt>
              <dd>{communication.interests}</dd>
            </div>}
          </dl>
          {communication.statement && <blockquote>{communication.statement}</blockquote>}
        </div>

        <aside className="contact-panel">
          <p className="eyebrow">GET IN TOUCH</p>
          <h2>Contact</h2>
          {communication.availability && <p>{communication.availability}</p>}
          <div className="contact-links">
            {links.map(([label, href, value]) => (
              <a key={label} href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer">
                <span>{label}</span>
                <strong>{value}</strong>
              </a>
            ))}
          </div>
          {communication.cvLink && (
            <a className="cv-link" href={communication.cvLink} target="_blank" rel="noreferrer">
              DOWNLOAD CV
            </a>
          )}
        </aside>
      </section>
      <div className="communication-book" aria-hidden="true">
        <img src={publicUrl("/assets/book-hub.png")} alt="" />
      </div>
    </main>
  );
}

function NotFound({ navigate, onHome }) {
  return (
    <main className="content-page not-found">
      <MinimalNav navigate={navigate} onHome={onHome} />
      <section>
        <p className="eyebrow">PAGE NOT FOUND</p>
        <h1>This page slipped between the leaves.</h1>
        <button type="button" onClick={onHome}>RETURN HOME</button>
      </section>
    </main>
  );
}

export function App() {
  const [pathname, navigate] = usePathname();
  const [returnToHub, setReturnToHub] = useState(false);
  const segments = pathname.split("/").filter(Boolean);
  const category = segments[0];
  const project = segments.length === 2
    ? projectBySlug(category, segments[1])
    : null;

  const onHome = () => {
    setReturnToHub(true);
    navigate("/");
  };

  let page;
  if (pathname === "/") {
    page = (
      <IntroScene
        navigate={navigate}
        initialStage={returnToHub ? "hub-idle" : "idle"}
        onHubVisited={() => setReturnToHub(true)}
      />
    );
  } else if (segments.length === 1 && categoryMeta[category]) {
    page = <CategoryPage category={category} navigate={navigate} onHome={onHome} />;
  } else if (segments.length === 1 && category === "communication") {
    page = <CommunicationPage navigate={navigate} onHome={onHome} />;
  } else if (project) {
    page = <ProjectPage project={project} navigate={navigate} onHome={onHome} />;
  } else {
    page = <NotFound navigate={navigate} onHome={onHome} />;
  }

  return page;
}
