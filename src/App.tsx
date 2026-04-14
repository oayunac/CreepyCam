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
            <h1>{t('appName', loc)}</h1>
            <p className="subtitle">{t('subtitle', loc)}</p>
          </div>
          <div className="header-right">
            <a
              href="https://buymeacoffee.com/k5t7bgc47xw"
              target="_blank"
              rel="noopener noreferrer"
              className="bmc-btn"
            >
              ☕ Buy me a coffee
            </a>
            <button
              className="btn-icon"
              onClick={() => setShowSettings(!showSettings)}
              title={t('settings', loc)}
            >
              {showSettings ? '\u2715' : '\u2699'}
            </button>
          </div>
        </header>

        {showSettings && (
          <SettingsPanel
            settings={settings}
            onChange={setSettings}
            disabled={isRunning}
          />
        )}

        {/* Camera — inline when idle, floating PiP when monitoring */}
        <div className={`video-wrapper ${isRunning ? 'pip' : ''}`}>
          <div className="video-container">
            <video ref={videoRef} playsInline muted className="camera-feed" />
            {!isActive && (
              <div className="video-placeholder">
                <p>{t('cameraOff', loc)}</p>
              </div>
            )}
            {isAnalyzing && <div className="analyzing-overlay">{t('analyzing', loc)}</div>}
          </div>

          {!isRunning && (
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
          )}

          {isRunning && (
            <div className="pip-controls">
              <button
                className="btn btn-danger btn-pip"
                onClick={handleToggleDetection}
              >
                {t('stopMonitoring', loc)}
              </button>
            </div>
          )}
        </div>

        {!isRunning && (
          <div className="controls-inline">
            {cameraError && <p className="error-msg">Camera: {cameraError}</p>}
            {lastError && <p className="error-msg">Detection: {lastError}</p>}
          </div>
        )}

        {isRunning && (
          <div className="status-bar">
            <span className="status-dot pulse" />
            {t('monitoringEvery', loc)} {settings.captureIntervalSeconds}{t('monitoringUnit', loc)}
            {' \u00b7 '}Provider: {settings.provider.type}
            {' \u00b7 '}Model: {settings.provider.model}
            {lastError && <span className="status-error"> · {lastError}</span>}
          </div>
        )}

        <main className="app-main">
          <DetectionHistory
            records={records}
            settings={settings}
            pendingThumbnail={pendingThumbnail}
            onClear={clearRecords}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
