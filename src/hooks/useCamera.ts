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

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { videoRef, isActive, error, start, stop, captureFrame };
}
