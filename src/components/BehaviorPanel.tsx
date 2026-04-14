import { useState, useRef, useEffect } from 'react';
import type { AppSettings, BuiltinBehaviorType } from '../types';
import { BUILTIN_BEHAVIORS } from '../types';
import { t, type StringKey } from '../i18n';

interface Props {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
}

const REPO_URL = 'https://github.com/oayunac/CreepyCam';

export function BehaviorPanel({ settings, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showInfo) return;
    const handleClick = (e: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setShowInfo(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showInfo]);
  const loc = settings.locale;

  const toggleBuiltin = (b: BuiltinBehaviorType) => {
    const next = settings.enabledBuiltins.includes(b)
      ? settings.enabledBuiltins.filter((x) => x !== b)
      : [...settings.enabledBuiltins, b];
    onChange({ ...settings, enabledBuiltins: next });
  };

  const toggleCustom = (id: string) => {
    const next = settings.enabledCustomIds.includes(id)
      ? settings.enabledCustomIds.filter((x) => x !== id)
      : [...settings.enabledCustomIds, id];
    onChange({ ...settings, enabledCustomIds: next });
  };

  const addCustom = () => {
    const label = newLabel.trim();
    if (!label) return;
    const id = `custom_${Date.now()}`;
    onChange({
      ...settings,
      customBehaviors: [...settings.customBehaviors, { id, label }],
      enabledCustomIds: [...settings.enabledCustomIds, id],
    });
    setNewLabel('');
  };

  const removeCustom = (id: string) => {
    onChange({
      ...settings,
      customBehaviors: settings.customBehaviors.filter((c) => c.id !== id),
      enabledCustomIds: settings.enabledCustomIds.filter((x) => x !== id),
    });
  };

  const enabledCount = settings.enabledBuiltins.length + settings.enabledCustomIds.length;
  const totalCount = BUILTIN_BEHAVIORS.length + settings.customBehaviors.length;

  return (
    <div className={`behavior-panel ${expanded ? 'expanded' : ''}`}>
      <div className="behavior-sidebar">
        <button className="behavior-toggle" onClick={() => setExpanded(!expanded)}>
          <span className="toggle-arrow">{expanded ? '\u25C0' : '\u25B6'}</span>
          <span className="toggle-label">
            {t('watchlist', loc)}
            <span className="toggle-count">{enabledCount}/{totalCount}</span>
          </span>
        </button>

        <div className="panel-info-container" ref={infoRef}>
          <button
            className="info-btn"
            onClick={() => setShowInfo(!showInfo)}
            title="Info"
          >
            &#9432;
          </button>
          {showInfo && (
            <div className="info-popup">
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                oayunac/CreepyCam
              </a>
              <a
                href={`${REPO_URL}/commit/${__COMMIT_FULL__}`}
                target="_blank"
                rel="noopener noreferrer"
                className="commit-link"
              >
                {__COMMIT_HASH__}
              </a>
              <a
                href="https://buymeacoffee.com/k5t7bgc47xw"
                target="_blank"
                rel="noopener noreferrer"
                className="bmc-link"
              >
                Buy me a coffee ☕
              </a>
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="behavior-content">
          <div className="behavior-list">
            {BUILTIN_BEHAVIORS.map((b) => (
              <label key={b} className="behavior-check">
                <input
                  type="checkbox"
                  checked={settings.enabledBuiltins.includes(b)}
                  onChange={() => toggleBuiltin(b)}
                />
                <span>{t(b as StringKey, loc)}</span>
              </label>
            ))}

            {settings.customBehaviors.map((c) => (
              <div key={c.id} className="behavior-check custom">
                <label className="behavior-check">
                  <input
                    type="checkbox"
                    checked={settings.enabledCustomIds.includes(c.id)}
                    onChange={() => toggleCustom(c.id)}
                  />
                  <span>{c.label}</span>
                </label>
                <button className="remove-btn" onClick={() => removeCustom(c.id)} title="Remove">
                  &times;
                </button>
              </div>
            ))}
          </div>

          <div className="behavior-add">
            <input
              type="text"
              placeholder={t('addBehavior', loc)}
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addCustom(); }}
            />
            <button onClick={addCustom} disabled={!newLabel.trim()}>+</button>
          </div>
        </div>
      )}
    </div>
  );
}
