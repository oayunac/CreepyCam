import { useState, useRef, useCallback, useEffect } from 'react';
import type { DetectionRecord, AppSettings } from '../types';
import { t } from '../i18n';
import { createProvider, buildPrompt } from '../providers';

export function useDetection(
  settings: AppSettings,
  captureFrame: (size?: number) => { full: string; thumbnail: string } | null,
  isActive: boolean,
) {
  const [records, setRecords] = useState<DetectionRecord[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pendingThumbnail, setPendingThumbnail] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const settingsRef = useRef(settings);
  const captureFrameRef = useRef(captureFrame);

  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { captureFrameRef.current = captureFrame; }, [captureFrame]);

  const analyzeFrame = useCallback(async () => {
    const s = settingsRef.current;
    const frame = captureFrameRef.current(s.modelImageSize);
    if (!frame) return;

    setIsAnalyzing(true);
    setPendingThumbnail(frame.thumbnail);
    setLastError(null);

    try {
      const provider = createProvider(s.provider, s);
      const base64 = frame.thumbnail.split(',')[1];
      const prompt = buildPrompt(s);
      const result = await provider.analyze(base64, prompt);

      const record: DetectionRecord = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        result,
        thumbnailDataUrl: frame.thumbnail,
        fullImageDataUrl: frame.full,
      };

      setRecords((prev) => [record, ...prev].slice(0, 100));

      if (result.detected && s.enableNotifications) {
        sendNotification(
          t('notifCaught', s.locale),
          result.message,
          frame.thumbnail,
        );
      }
    } catch (e) {
      setLastError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
      setPendingThumbnail(null);
      if (runningRef.current) {
        timeoutRef.current = window.setTimeout(
          analyzeFrame,
          settingsRef.current.captureIntervalSeconds * 1000,
        );
      }
    }
  }, []);

  const startDetection = useCallback(() => {
    if (!isActive) return;
    runningRef.current = true;
    setIsRunning(true);
    analyzeFrame();
  }, [isActive, analyzeFrame]);

  const stopDetection = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isActive && isRunning) {
      stopDetection();
    }
  }, [isActive, isRunning, stopDetection]);

  return { records, isRunning, isAnalyzing, pendingThumbnail, lastError, startDetection, stopDetection, clearRecords: () => setRecords([]) };
}

function sendNotification(title: string, body: string, imageDataUrl: string) {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    new Notification(`CreepyCam: ${title}`, {
      body, icon: imageDataUrl, tag: 'creepycam-detection',
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((perm) => {
      if (perm === 'granted') {
        new Notification(`CreepyCam: ${title}`, {
          body, icon: imageDataUrl, tag: 'creepycam-detection',
        });
      }
    });
  }
}
