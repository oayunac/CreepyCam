import { useState, useEffect } from 'react';
import { useCamera } from './hooks/useCamera';
import { useDetection } from './hooks/useDetection';
import { SettingsPanel } from './components/SettingsPanel';
import { DetectionHistory } from './components/DetectionHistory';
import { BehaviorPanel } from './components/BehaviorPanel';
import type { AppSettings } from './types';
import { DEFAULT_SETTINGS } from './types';
import { t } from './i18n';
import './App.css';

const STORAGE_KEY = 'creepycam-settings';

function loadSettings(): AppSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS;
}

function App() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [showSettings, setShowSettings] = useState(false);
  const loc = settings.locale;
  const { videoRef, isActive, error: cameraError, start, stop, captureGrid } = useCamera();
  const {
    records, isRunning, isAnalyzing, pendingThumbnail, lastError,
    startDetection, stopDetection, clearRecords,
  } = useDetection(settings, captureGrid, isActive);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleToggleCamera = () => {
    if (isActive) {
      stopDetection();
      stop();
    } else {
      start();
    }
  };

  const handleToggleDetection = () => {
    if (isRunning) {
      stopDetection();
    } else {
      if (settings.enableNotifications && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      startDetection();
    }
  };

  return (
    <div className="app-layout">
      <BehaviorPanel settings={settings} onChange={setSettings} />

      <div className="app">
        <header className="app-header">
          <div className="header-left">
            <h1>CreepyCam</h1>
            <p className="subtitle">{t('subtitle', loc)}</p>
          </div>
          <button
            className="btn-icon"
            onClick={() => setShowSettings(!showSettings)}
            title={t('settings', loc)}
          >
            {showSettings ? '\u2715' : '\u2699'}
          </button>
        </header>

        {showSettings && (
          <SettingsPanel
            settings={settings}
            onChange={setSettings}
            disabled={isRunning}
          />
        )}

        <main className="app-main">
          <section className="camera-section">
            <div className="video-container">
              <video ref={videoRef} playsInline muted className="camera-feed" />
              {!isActive && (
                <div className="video-placeholder">
                  <p>{t('cameraOff', loc)}</p>
                </div>
              )}
              {isAnalyzing && <div className="analyzing-overlay">{t('analyzing', loc)}</div>}
            </div>

            <div className="controls">
              <button
                className={`btn ${isActive ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleToggleCamera}
              >
                {isActive ? t('stopCamera', loc) : t('startCamera', loc)}
              </button>
              <button
                className={`btn ${isRunning ? 'btn-danger' : 'btn-success'}`}
                onClick={handleToggleDetection}
                disabled={!isActive}
              >
                {isRunning ? t('stopMonitoring', loc) : t('startMonitoring', loc)}
              </button>
            </div>

            {cameraError && <p className="error-msg">Camera: {cameraError}</p>}
            {lastError && <p className="error-msg">Detection: {lastError}</p>}

            {isRunning && (
              <div className="status-bar">
                <span className="status-dot pulse" />
                {t('monitoringEvery', loc)} {settings.captureIntervalSeconds}{t('monitoringUnit', loc)}
                {' \u00b7 '}Provider: {settings.provider.type}
                {' \u00b7 '}Model: {settings.provider.model}
              </div>
            )}
          </section>

          <section className="history-section">
            <DetectionHistory
              records={records}
              settings={settings}
              pendingThumbnail={pendingThumbnail}
              onClear={clearRecords}
            />
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
