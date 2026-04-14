import type { Locale } from './i18n';

export const BUILTIN_BEHAVIORS = [
  'eating',
  'biting_hand',
  'picking_face',
  'scratching_head',
  'pen_spinning',
  'snacking',
  'staring_at_camera',
] as const;

export type BuiltinBehaviorType = typeof BUILTIN_BEHAVIORS[number];

export interface CustomBehavior {
  id: string;
  label: string;
}

export interface DetectionResult {
  detected: boolean;
  behaviors: string[];
  message: string;
}

export interface DetectionRecord {
  id: string;
  timestamp: number;
  result: DetectionResult;
  frames: string[];
  gridDataUrl: string;
  fullImageDataUrl: string;
}

export interface ProviderConfig {
  type: 'ollama' | 'lmstudio' | 'openai-compatible';
  baseUrl: string;
  model: string;
  apiKey?: string;
}

export interface ModelProvider {
  name: string;
  analyze(imageBase64: string, prompt: string): Promise<DetectionResult>;
}

export interface AppSettings {
  locale: Locale;
  provider: ProviderConfig;
  captureIntervalSeconds: number;
  modelImageSize: number;
  enableNotifications: boolean;
  enabledBuiltins: BuiltinBehaviorType[];
  customBehaviors: CustomBehavior[];
  enabledCustomIds: string[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  locale: (navigator.language.startsWith('zh') ? 'zh' : 'en') as Locale,
  provider: {
    type: 'ollama',
    baseUrl: 'http://localhost:11434',
    model: 'gemma4:latest',
  },
  captureIntervalSeconds: 10,
  modelImageSize: 512,
  enableNotifications: true,
  enabledBuiltins: [...BUILTIN_BEHAVIORS],
  customBehaviors: [],
  enabledCustomIds: [],
};
