import { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  frames: string[];
  interval?: number;
  className?: string;
  alt?: string;
  autoPlay?: boolean;
}

export function AnimatedFrames({ frames, interval = 300, className, alt = '', autoPlay = false }: Props) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const timerRef = useRef<number | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!playing || frames.length <= 1) {
      stopTimer();
      return;
    }
    timerRef.current = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % frames.length);
    }, interval);
    return stopTimer;
  }, [playing, frames, interval, stopTimer]);

  const handleEnter = useCallback(() => {
    setPlaying(true);
  }, []);

  const handleLeave = useCallback(() => {
    setPlaying(false);
    setIndex(0);
  }, []);

  if (frames.length === 0) return null;

  return (
    <img
      src={frames[index]}
      className={className}
      alt={alt}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    />
  );
}
