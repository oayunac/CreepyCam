import { useRef, useState, useCallback, useEffect } from 'react';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsActive(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to access camera');
      setIsActive(false);
    }
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const captureFrame = useCallback(
    (size?: number): { full: string; thumbnail: string } | null => {
      const video = videoRef.current;
      if (!video || !isActive) return null;

      const fullCanvas = document.createElement('canvas');
      fullCanvas.width = video.videoWidth;
      fullCanvas.height = video.videoHeight;
      const fullCtx = fullCanvas.getContext('2d')!;
      fullCtx.drawImage(video, 0, 0);
      const fullDataUrl = fullCanvas.toDataURL('image/jpeg', 0.9);

      const modelSize = size || 512;
      const scale = Math.min(modelSize / video.videoWidth, modelSize / video.videoHeight);
      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = Math.round(video.videoWidth * scale);
      thumbCanvas.height = Math.round(video.videoHeight * scale);
      const thumbCtx = thumbCanvas.getContext('2d')!;
      thumbCtx.drawImage(video, 0, 0, thumbCanvas.width, thumbCanvas.height);
      const thumbnailDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.8);

      return { full: fullDataUrl, thumbnail: thumbnailDataUrl };
    },
    [isActive],
  );

  const captureGrid = useCallback(
    async (
      modelSize: number,
      count = 9,
      intervalMs = 500,
    ): Promise<{ grid: string; firstFull: string; frameThumbs: string[] } | null> => {
      const video = videoRef.current;
      if (!video || !isActive) return null;

      const cols = Math.ceil(Math.sqrt(count));
      const rows = Math.ceil(count / cols);

      const snapOne = () => {
        const c = document.createElement('canvas');
        c.width = video.videoWidth;
        c.height = video.videoHeight;
        c.getContext('2d')!.drawImage(video, 0, 0);
        return c;
      };

      const frames: HTMLCanvasElement[] = [snapOne()];
      for (let i = 1; i < count; i++) {
        await new Promise((r) => setTimeout(r, intervalMs));
        if (!videoRef.current || !streamRef.current) return null;
        frames.push(snapOne());
      }

      // first frame as full-res evidence image
      const firstFull = frames[0].toDataURL('image/jpeg', 0.9);

      // individual frame thumbnails for animation
      const thumbScale = Math.min(160 / video.videoWidth, 90 / video.videoHeight);
      const frameThumbs = frames.map((f) => {
        const tc = document.createElement('canvas');
        tc.width = Math.round(video.videoWidth * thumbScale);
        tc.height = Math.round(video.videoHeight * thumbScale);
        tc.getContext('2d')!.drawImage(f, 0, 0, tc.width, tc.height);
        return tc.toDataURL('image/jpeg', 0.7);
      });

      // composite grid for model
      const cellW = Math.round(modelSize / cols);
      const cellH = Math.round(modelSize / rows);
      const gridCanvas = document.createElement('canvas');
      gridCanvas.width = cellW * cols;
      gridCanvas.height = cellH * rows;
      const gCtx = gridCanvas.getContext('2d')!;

      frames.forEach((frame, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        gCtx.drawImage(frame, col * cellW, row * cellH, cellW, cellH);
      });

      const grid = gridCanvas.toDataURL('image/jpeg', 0.8);
      return { grid, firstFull, frameThumbs };
    },
    [isActive],
  );

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { videoRef, isActive, error, start, stop, captureFrame, captureGrid };
}
