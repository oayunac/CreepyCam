import type { AppSettings, ProviderConfig } from '../types';
import type { Locale } from '../i18n';
import { t } from '../i18n';

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
  const loc = settings.locale;
  const updateProvider = (partial: Partial<ProviderConfig>) => {
    onChange({ ...settings, provider: { ...settings.provider, ...partial } });
  };

  const mixedBlocked = isMixedContentBlocked(settings.provider.baseUrl);

  return (
    <div className="settings-panel">
      <h3>{t('settings', loc)}</h3>

      <label>
        Language / 语言
        <select
          value={settings.locale}
          onChange={(e) => onChange({ ...settings, locale: e.target.value as Locale })}
          disabled={disabled}
        >
          <option value="en">English</option>
          <option value="zh">中文</option>
        </select>
      </label>

      {mixedBlocked && (
        <div className="mixed-content-warning">
          <div className="warning-badge">{t('warningBadge', loc)}</div>
          <strong>{t('mixedContentTitle', loc)}</strong>
          <p>{t('mixedContentDesc', loc)}</p>
          <ol>
            <li><strong>{t('mixedChrome', loc)}</strong></li>
            <li><strong>{t('mixedLocal', loc)}</strong></li>
          </ol>
        </div>
      )}

      <label>
        {t('provider', loc)}
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
        {t('baseUrl', loc)}
        <input
          type="text"
          value={settings.provider.baseUrl}
          onChange={(e) => updateProvider({ baseUrl: e.target.value })}
          disabled={disabled}
        />
      </label>

      <label>
        {t('model', loc)}
        <input
          type="text"
          value={settings.provider.model}
          onChange={(e) => updateProvider({ model: e.target.value })}
          disabled={disabled}
        />
      </label>

      {(settings.provider.type === 'openai-compatible') && (
        <label>
          {t('apiKey', loc)}
          <input
            type="password"
            value={settings.provider.apiKey || ''}
            onChange={(e) => updateProvider({ apiKey: e.target.value || undefined })}
            disabled={disabled}
          />
        </label>
      )}

      <label>
        {t('captureInterval', loc)}
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
        {t('modelImageSize', loc)}
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

      <label>
        {t('maxTokens', loc)}
        <input
          type="number"
          min={128}
          max={4096}
          step={64}
          value={settings.maxTokens}
          onChange={(e) => onChange({ ...settings, maxTokens: Number(e.target.value) })}
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
        {t('enableNotifications', loc)}
      </label>

      <div className="settings-hint">
        <strong>{t('setupNotes', loc)}</strong>
        <ul>
          <li>{t('setupLocal', loc)}</li>
          <li>{t('setupOllama', loc)}</li>
          <li>{t('setupLmStudio', loc)}</li>
        </ul>
      </div>
    </div>
  );
}
