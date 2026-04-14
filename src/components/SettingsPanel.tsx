import type { AppSettings, ProviderConfig } from '../types';

interface Props {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
  disabled: boolean;
}

function isMixedContentBlocked(providerUrl: string): boolean {
  if (typeof window === 'undefined' || window.location.protocol !== 'https:') return false;
  try {
    return new URL(providerUrl).protocol === 'http:';
  } catch {
    return false;
  }
}

export function SettingsPanel({ settings, onChange, disabled }: Props) {
  const updateProvider = (partial: Partial<ProviderConfig>) => {
    onChange({ ...settings, provider: { ...settings.provider, ...partial } });
  };

  const mixedBlocked = isMixedContentBlocked(settings.provider.baseUrl);

  return (
    <div className="settings-panel">
      <h3>Settings</h3>

      {mixedBlocked && (
        <div className="mixed-content-warning">
          <div className="warning-badge">WARNING</div>
          <strong>Mixed Content Blocked</strong>
          <p>
            This HTTPS page cannot reach your HTTP model API. Options:
          </p>
          <ol>
            <li><strong>Use Chrome</strong> — Chrome allows HTTPS pages to access <code>localhost</code></li>
            <li><strong>Run locally</strong> — <code>git clone &amp; npm run dev</code> on <code>http://localhost:5173</code></li>
          </ol>
        </div>
      )}

      <label>
        Provider
        <select
          value={settings.provider.type}
          onChange={(e) => {
            const type = e.target.value as ProviderConfig['type'];
            const defaults: Record<string, Partial<ProviderConfig>> = {
              ollama: { baseUrl: 'http://localhost:11434', model: 'gemma4:latest' },
              lmstudio: { baseUrl: 'http://localhost:1234', model: 'default' },
              'openai-compatible': { baseUrl: 'http://localhost:8080', model: 'default' },
            };
            updateProvider({ type, ...defaults[type] });
          }}
          disabled={disabled}
        >
          <option value="ollama">Ollama</option>
          <option value="lmstudio">LM Studio</option>
          <option value="openai-compatible">OpenAI Compatible</option>
        </select>
      </label>

      <label>
        Base URL
        <input
          type="text"
          value={settings.provider.baseUrl}
          onChange={(e) => updateProvider({ baseUrl: e.target.value })}
          disabled={disabled}
        />
      </label>

      <label>
        Model
        <input
          type="text"
          value={settings.provider.model}
          onChange={(e) => updateProvider({ model: e.target.value })}
          disabled={disabled}
        />
      </label>

      {(settings.provider.type === 'openai-compatible') && (
        <label>
          API Key (optional)
          <input
            type="password"
            value={settings.provider.apiKey || ''}
            onChange={(e) => updateProvider({ apiKey: e.target.value || undefined })}
            disabled={disabled}
          />
        </label>
      )}

      <label>
        Capture Interval (seconds)
        <input
          type="number"
          min={3}
          max={300}
          value={settings.captureIntervalSeconds}
          onChange={(e) => onChange({ ...settings, captureIntervalSeconds: Number(e.target.value) })}
          disabled={disabled}
        />
      </label>

      <label>
        Model Image Size (px)
        <input
          type="number"
          min={128}
          max={1024}
          step={64}
          value={settings.modelImageSize}
          onChange={(e) => onChange({ ...settings, modelImageSize: Number(e.target.value) })}
          disabled={disabled}
        />
      </label>

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={settings.enableNotifications}
          onChange={(e) => onChange({ ...settings, enableNotifications: e.target.checked })}
          disabled={disabled}
        />
        Enable Browser Notifications
      </label>

      <div className="settings-hint">
        <strong>Setup Notes</strong>
        <ul>
          <li>Run this app locally (<code>npm run dev</code>) to avoid HTTPS mixed-content blocking</li>
          <li>Ollama CORS: <code>OLLAMA_ORIGINS=* ollama serve</code></li>
          <li>LM Studio: Enable CORS in server settings</li>
        </ul>
      </div>
    </div>
  );
}
