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

export const BUILTIN_LABELS: Record<BuiltinBehaviorType, string> = {
  eating: 'Eating',
  biting_hand: 'Biting Hand',
  picking_face: 'Picking Face',
  scratching_head: 'Scratching Head',
  pen_spinning: 'Pen Spinning',
  snacking: 'Sneaking Snacks',
  staring_at_camera: 'Staring at Camera',
};

export interface CustomBehavior {
  id: string;
  label: string;
}

export interface BehaviorItem {
  id: string;
  label: string;
  enabled: boolean;
  builtin: boolean;
}

export interface DetectionResult {
  detected: boolean;
  behaviors: string[];
  evidence: string;
}

export interface DetectionRecord {
  id: string;
  timestamp: number;
  result: DetectionResult;
  thumbnailDataUrl: string;
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
  provider: ProviderConfig;
  captureIntervalSeconds: number;
  modelImageSize: number;
  enableNotifications: boolean;
  enabledBuiltins: BuiltinBehaviorType[];
  customBehaviors: CustomBehavior[];
  enabledCustomIds: string[];
}

export const DEFAULT_SETTINGS: AppSettings = {
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

export function getAllBehaviorItems(settings: AppSettings): BehaviorItem[] {
  const builtins: BehaviorItem[] = BUILTIN_BEHAVIORS.map((b) => ({
    id: b,
    label: BUILTIN_LABELS[b],
    enabled: settings.enabledBuiltins.includes(b),
    builtin: true,
  }));
  const customs: BehaviorItem[] = settings.customBehaviors.map((c) => ({
    id: c.id,
    label: c.label,
    enabled: settings.enabledCustomIds.includes(c.id),
    builtin: false,
  }));
  return [...builtins, ...customs];
}

export function getEnabledBehaviorLabels(settings: AppSettings): { id: string; label: string }[] {
  const items = getAllBehaviorItems(settings);
  return items.filter((i) => i.enabled).map(({ id, label }) => ({ id, label }));
}

export function getBehaviorLabel(id: string, settings: AppSettings): string {
  if (id in BUILTIN_LABELS) return BUILTIN_LABELS[id as BuiltinBehaviorType];
  const custom = settings.customBehaviors.find((c) => c.id === id);
  return custom?.label || id;
}
