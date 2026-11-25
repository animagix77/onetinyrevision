"use client";
import { useEffect, useRef, useState } from "react";
import { Music2, VolumeX } from "lucide-react";
export default function Music() {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false),
    [error, setError] = useState(false);
  const wantsMusic = useRef(false);
  useEffect(() => {
    function visibility() {
      const player = audio.current;
      if (!player) return;
      if (document.hidden) player.pause();
      else if (wantsMusic.current)
        void player.play().catch(() => {
          wantsMusic.current = false;
          setPlaying(false);
        });
    }
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, []);
  async function toggle() {
    const player = audio.current;
    if (!player) return;
    if (wantsMusic.current) {
      wantsMusic.current = false;
      player.pause();
      setPlaying(false);
      return;
    }
    wantsMusic.current = true;
    player.volume = 0.42;
    setError(false);
    try {
      await player.play();
      setPlaying(wantsMusic.current);
    } catch {
      wantsMusic.current = false;
      setPlaying(false);
      setError(true);
    }
  }
  return (
    <>
      <audio ref={audio} src="./audio/potluck.mp3" loop preload="none" />
      <button
        type="button"
        className="music-toggle"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Mute kitchen jingle" : "Play kitchen jingle"}
        title={playing ? "Mute kitchen jingle" : "Play kitchen jingle"}
      >
        {playing ? <Music2 size={17} /> : <VolumeX size={17} />}
        <span>
          {error ? "Retry music" : playing ? "Music on" : "Music off"}
        </span>
      </button>
    </>
  );
}
