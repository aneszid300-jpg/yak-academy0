import { useCallback, useEffect, useRef, useState } from "react";

// Legacy study player: a native <video> with Yak's own control bar
// (bindYakVideoControls). Controls auto-hide 2.8 s after the last mouse move
// while playing, and stay visible while paused.

const RATES = [1, 1.25, 1.5, 1.75, 2, 0.75];
const HIDE_DELAY = 2800;

function formatVideoTime(sec) {
  sec = Number.isFinite(sec) ? Math.max(0, Math.floor(sec)) : 0;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
}

export default function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const progressRef = useRef(null);
  const hideTimer = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [overlayHidden, setOverlayHidden] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [time, setTime] = useState({ current: 0, duration: 0, buffered: 0 });
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [rateIndex, setRateIndex] = useState(null); // null until the speed is first changed
  const [fullscreen, setFullscreen] = useState(false);
  const [dragging, setDragging] = useState(false);

  // A new lesson: legacy shows the play overlay again and pauses.
  const [lastSrc, setLastSrc] = useState(src);
  if (lastSrc !== src) {
    setLastSrc(src);
    setPlaying(false);
    setOverlayHidden(false);
    setTime({ current: 0, duration: 0, buffered: 0 });
  }

  const showControls = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
    const video = videoRef.current;
    if (video && !video.paused) {
      hideTimer.current = setTimeout(() => {
        if (videoRef.current && !videoRef.current.paused) setControlsVisible(false);
      }, HIDE_DELAY);
    }
  }, []);
  useEffect(() => () => clearTimeout(hideTimer.current), []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) video.play().catch(() => {});
    else video.pause();
  };

  const syncTime = () => {
    const video = videoRef.current;
    if (!video) return;
    const duration = video.duration || 0;
    let buffered = 0;
    if (video.buffered?.length && duration > 0) {
      try {
        buffered = video.buffered.end(video.buffered.length - 1);
      } catch {
        buffered = 0;
      }
    }
    setTime({ current: video.currentTime || 0, duration, buffered });
  };

  const seekTo = (clientX) => {
    const video = videoRef.current;
    const wrap = progressRef.current;
    if (!video || !wrap || !Number.isFinite(video.duration) || !video.duration) return;
    const rect = wrap.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    video.currentTime = x * video.duration;
    syncTime();
  };

  // Dragging the progress bar keeps seeking until the mouse is released.
  useEffect(() => {
    if (!dragging) return;
    const onMove = (event) => seekTo(event.clientX);
    const onUp = () => setDragging(false);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    const card = cardRef.current;
    if (!card) return;
    if (!document.fullscreenElement) (card.requestFullscreen || card.webkitRequestFullscreen)?.call(card);
    else (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
  };

  // Duration can be Infinity/NaN until the browser knows it (e.g. streams).
  const knownDuration = Number.isFinite(time.duration) && time.duration > 0;
  const pct = knownDuration ? Math.min(100, (time.current / time.duration) * 100) : 0;
  const bufPct = knownDuration ? Math.min(100, (time.buffered / time.duration) * 100) : 0;
  const volPct = (muted ? 0 : volume) * 100;
  const stop = (event) => event.stopPropagation();

  return (
    <div className="study-video-card" ref={cardRef}>
      <div
        className={"study-video-frame" + (playing ? "" : " is-paused")}
        onMouseMove={showControls}
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={src}
          playsInline
          preload="metadata"
          onPlay={() => {
            setPlaying(true);
            setOverlayHidden(true);
            showControls();
          }}
          onPause={() => {
            setPlaying(false);
            if (!videoRef.current?.ended) setOverlayHidden(false);
            showControls();
          }}
          onEnded={() => {
            setPlaying(false);
            setOverlayHidden(false);
            showControls();
          }}
          onTimeUpdate={syncTime}
          onLoadedMetadata={syncTime}
          onProgress={syncTime}
          onVolumeChange={() => {
            const video = videoRef.current;
            setMuted(video.muted || video.volume === 0);
            setVolume(video.volume);
          }}
        ></video>

        <button
          type="button"
          className={"study-play-overlay" + (overlayHidden ? " is-hidden" : "")}
          aria-label="تشغيل"
          onClick={(event) => {
            event.stopPropagation();
            videoRef.current?.play().then(() => setOverlayHidden(true)).catch(() => {});
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>

        <div className={"yak-vctrl" + (controlsVisible ? " is-visible" : "")} onClick={stop}>
          <div className="yak-vctrl-row">
            <div className="yak-vctrl-left">
              <button type="button" className="yak-vctrl-btn yak-vctrl-play" aria-label="تشغيل/إيقاف" onClick={togglePlay}>
                {playing ? (
                  <svg className="yak-icon-pause" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="yak-icon-play" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </div>

            <div
              className="yak-vctrl-progress-wrap"
              ref={progressRef}
              onMouseDown={(event) => {
                setDragging(true);
                seekTo(event.clientX);
              }}
              onClick={(event) => seekTo(event.clientX)}
            >
              <div className="yak-vctrl-progress-bg">
                <div className="yak-vctrl-progress-buf" style={{ width: bufPct + "%" }}></div>
                <div className="yak-vctrl-progress-fill" style={{ width: pct + "%" }}></div>
                <div className="yak-vctrl-progress-thumb" style={{ left: pct + "%" }}></div>
                <input
                  type="range"
                  className="yak-vctrl-progress-input"
                  min="0"
                  max="100"
                  step="0.1"
                  value={pct}
                  aria-label="التقدم"
                  onChange={(event) => {
                    const video = videoRef.current;
                    if (video && Number.isFinite(video.duration)) video.currentTime = (parseFloat(event.target.value) / 100) * video.duration;
                  }}
                />
              </div>
            </div>

            <div className="yak-vctrl-right">
              <span className="yak-vctrl-time">
                <span>{formatVideoTime(time.current)}</span>
                <span className="yak-vctrl-time-sep">/</span>
                <span>{formatVideoTime(time.duration)}</span>
              </span>

              <div className="yak-vctrl-vol">
                <button
                  type="button"
                  className="yak-vctrl-btn"
                  aria-label="كتم الصوت"
                  onClick={() => {
                    if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
                  }}
                >
                  {muted ? (
                    <svg className="yak-icon-mute" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                  ) : (
                    <svg className="yak-icon-vol" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  className="yak-vctrl-vol-slider"
                  min="0"
                  max="1"
                  step="0.05"
                  value={muted ? 0 : volume}
                  aria-label="مستوى الصوت"
                  style={{ "--vol-pct": volPct + "%" }}
                  onChange={(event) => {
                    const video = videoRef.current;
                    if (!video) return;
                    const v = parseFloat(event.target.value);
                    video.volume = v;
                    video.muted = v === 0;
                  }}
                />
              </div>

              <button
                type="button"
                className="yak-vctrl-btn"
                aria-label="الإعدادات"
                title={rateIndex === null ? "الإعدادات" : "السرعة: " + RATES[rateIndex] + "x"}
                onClick={() => {
                  const next = ((rateIndex ?? 0) + 1) % RATES.length;
                  setRateIndex(next);
                  if (videoRef.current) videoRef.current.playbackRate = RATES[next];
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                  <path d="M19.622 10.395l-1.097-2.65L20 6l-2-2-1.735 1.483-2.707-1.113L12.935 2h-1.954l-.632 2.401-2.645 1.115L6 4 4 6l1.453 1.789-1.08 2.657L2 11v2l2.401.655L5.516 16.3 4 18l2 2 1.791-1.46 2.606 1.072L11 22h2l.604-2.387 2.651-1.098C16.697 18.831 18 20 18 20l2-2-1.484-1.75 1.098-2.652 2.386-.62V11l-2.378-.605Z" />
                </svg>
              </button>

              <button type="button" className="yak-vctrl-btn" aria-label="ملء الشاشة" onClick={toggleFullscreen}>
                {fullscreen ? (
                  <svg className="icon-compress" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                  </svg>
                ) : (
                  <svg className="icon-expand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
