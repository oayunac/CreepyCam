import { useState } from 'react';
import type { AppSettings, BuiltinBehaviorType } from '../types';
import { BUILTIN_BEHAVIORS, BUILTIN_LABELS } from '../types';

interface Props {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
}

export function BehaviorPanel({ settings, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [newLabel, setNewLabel] = useState('');

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

  const enabledCount =
    settings.enabledBuiltins.length +
    settings.enabledCustomIds.length;

  const totalCount =
    BUILTIN_BEHAVIORS.length +
    settings.customBehaviors.length;

  return (
    <div className={`behavior-panel ${expanded ? 'expanded' : ''}`}>
      <button className="behavior-toggle" onClick={() => setExpanded(!expanded)}>
        <span className="toggle-arrow">{expanded ? '\u25C0' : '\u25B6'}</span>
        <span className="toggle-label">
          Watchlist
          <span className="toggle-count">{enabledCount}/{totalCount}</span>
        </span>
      </button>

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
                <span>{BUILTIN_LABELS[b]}</span>
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
                <button
                  className="remove-btn"
                  onClick={() => removeCustom(c.id)}
                  title="Remove"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          <div className="behavior-add">
            <input
              type="text"
              placeholder="Add behavior..."
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
