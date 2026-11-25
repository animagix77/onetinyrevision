"use client";
import { useEffect, useRef, useState } from "react";
import { Music2, VolumeX } from "lucide-react";

const preference = "com.judgedeanllc.onetinyrevision.music";
export default function Music() {
  const audio = useRef<HTMLAudioElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const wanted = useRef(true);
  const [enabled, setEnabled] = useState(true);

  function playIfAllowed() {
    const player = audio.current;
    if (player && wanted.current && player.paused && !document.hidden)
      void player.play().catch(() => {
        /* Retry on the next player gesture. */
      });
  }

  useEffect(() => {
    const player = audio.current!;
    try {
      wanted.current = localStorage.getItem(preference) !== "off";
    } catch {}
    setEnabled(wanted.current);
    player.volume = 0.28;
    playIfAllowed();
    function gesture(event: Event) {
      if (!button.current?.contains(event.target as Node)) playIfAllowed();
    }
    function visibility() {
      if (document.hidden) player.pause();
      else playIfAllowed();
    }
    const events = ["pointerup", "click", "keydown"];
    events.forEach((event) => document.addEventListener(event, gesture));
    document.addEventListener("visibilitychange", visibility);
    return () => {
      events.forEach((event) => document.removeEventListener(event, gesture));
      document.removeEventListener("visibilitychange", visibility);
      player.pause();
    };
  }, []);

  function toggle() {
    wanted.current = !wanted.current;
    setEnabled(wanted.current);
    try {
      localStorage.setItem(preference, wanted.current ? "on" : "off");
    } catch {}
    if (wanted.current) playIfAllowed();
    else audio.current?.pause();
  }

  const label = enabled ? "Mute kitchen jingle" : "Play kitchen jingle";
  return (
    <>
      <audio ref={audio} src="./audio/tasting-notes.mp3" loop preload="auto" />
      <button
        ref={button}
        type="button"
        className="music-toggle"
        onClick={toggle}
        aria-pressed={enabled}
        aria-label={label}
        title={label}
      >
        {enabled ? <Music2 size={17} /> : <VolumeX size={17} />}
        <span>{enabled ? "Music on" : "Music off"}</span>
      </button>
    </>
  );
}
