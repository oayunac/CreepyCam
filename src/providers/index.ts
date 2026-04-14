import type { ProviderConfig, DetectionResult, ModelProvider, AppSettings } from '../types';
import type { BuiltinBehaviorType } from '../types';

const BUILTIN_DEFINITIONS: Record<BuiltinBehaviorType, string> = {
  eating: 'actively eating food, chewing, food in mouth',
  biting_hand: 'biting fingers, nails, or knuckles',
  picking_face: 'touching, scratching, or picking at face skin',
  scratching_head: 'scratching or rubbing the head/scalp',
  pen_spinning: 'spinning, twirling, or fidgeting with a pen/pencil',
  snacking: 'sneaking snacks, reaching for snack bags/wrappers',
  staring_at_camera: 'directly looking/staring into the camera lens',
};

export function buildPrompt(settings: AppSettings): string {
  const lines: string[] = [];

  for (const b of settings.enabledBuiltins) {
    lines.push(`- "${b}": ${BUILTIN_DEFINITIONS[b]}`);
  }
  for (const c of settings.customBehaviors) {
    if (settings.enabledCustomIds.includes(c.id)) {
      lines.push(`- "${c.id}": ${c.label}`);
    }
  }

  if (lines.length === 0) {
    return 'Respond with: {"detected": false, "behaviors": [], "evidence": "no behaviors configured"}';
  }

  return `You are analyzing a webcam image. Detect if the person is doing any of these habitual behaviors:

Behavior definitions:
${lines.join('\n')}

You MUST respond with ONLY a valid JSON object, no other text:
{"detected": true/false, "behaviors": ["list", "of", "matched", "behavior_ids"], "evidence": "brief description"}

If no behavior is detected, return: {"detected": false, "behaviors": [], "evidence": "no target behavior observed"}`;
}

function parseDetectionResult(text: string, validIds: string[]): DetectionResult {
  const jsonMatch = text.match(/\{[\s\S]*?\}/);
  if (!jsonMatch) {
    return { detected: false, behaviors: [], evidence: 'Failed to parse model response' };
  }
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const behaviors = (Array.isArray(parsed.behaviors) ? parsed.behaviors : [])
      .filter((b: string) => validIds.includes(b)) as string[];
    return {
      detected: Boolean(parsed.detected) && behaviors.length > 0,
      behaviors,
      evidence: String(parsed.evidence || ''),
    };
  } catch {
    return { detected: false, behaviors: [], evidence: 'Failed to parse model response' };
  }
}

function getValidIds(settings: AppSettings): string[] {
  const ids: string[] = [...settings.enabledBuiltins];
  for (const c of settings.customBehaviors) {
    if (settings.enabledCustomIds.includes(c.id)) ids.push(c.id);
  }
  return ids;
}

function createOllamaProvider(config: ProviderConfig, settings: AppSettings): ModelProvider {
  const validIds = getValidIds(settings);
  return {
    name: 'Ollama',
    async analyze(imageBase64: string, prompt: string): Promise<DetectionResult> {
      const res = await fetch(`${config.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'user', content: prompt, images: [imageBase64] }],
          stream: false,
          format: 'json',
        }),
      });
      if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
      const data = await res.json();
      return parseDetectionResult(data.message?.content || '', validIds);
    },
  };
}

function createOpenAICompatibleProvider(config: ProviderConfig, settings: AppSettings): ModelProvider {
  const validIds = getValidIds(settings);
  return {
    name: config.type === 'lmstudio' ? 'LM Studio' : 'OpenAI Compatible',
    async analyze(imageBase64: string, prompt: string): Promise<DetectionResult> {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (config.apiKey) headers['Authorization'] = `Bearer ${config.apiKey}`;
      const res = await fetch(`${config.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: config.model,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            ],
          }],
          max_tokens: 256,
          response_format: { type: 'json_object' },
        }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      return parseDetectionResult(data.choices?.[0]?.message?.content || '', validIds);
    },
  };
}

export function createProvider(config: ProviderConfig, settings: AppSettings): ModelProvider {
  switch (config.type) {
    case 'ollama':
      return createOllamaProvider(config, settings);
    case 'lmstudio':
    case 'openai-compatible':
      return createOpenAICompatibleProvider(config, settings);
  }
}
