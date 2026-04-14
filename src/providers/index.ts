import type { ProviderConfig, DetectionResult, ModelProvider, AppSettings, BuiltinBehaviorType } from '../types';

const BUILTIN_DEFINITIONS: Record<BuiltinBehaviorType, string> = {
  eating: 'actively eating food — look for: hand raised to mouth with food, chewing motion (jaw moving between frames), food items or utensils visible, wrapper/container near face',
  biting_hand: 'biting fingers, nails, or knuckles — look for: hand near mouth with fingers/knuckles touching lips or teeth, nail biting posture, fingers curled toward mouth',
  picking_face: 'touching, scratching, or picking at face skin — look for: fingertip pressing or dragging on cheek/chin/forehead/nose, repeated face-touching across frames, hand lingering near face with contact',
  scratching_head: 'scratching or rubbing the head/scalp — look for: hand raised above eye level touching hair/scalp, fingers moving through hair, rubbing motion on top/side/back of head',
  pen_spinning: 'spinning, twirling, or fidgeting with a pen/pencil — look for: elongated object between fingers, object changing orientation across frames, hand in fidget posture with writing instrument',
  snacking: 'sneaking snacks — look for: reaching toward desk/bag/drawer, small food items, wrapper or bag visible, furtive hand movement toward hidden food source',
  staring_at_camera: 'directly looking/staring into the camera lens — look for: eyes aimed squarely at camera, head oriented forward, sustained direct gaze across multiple frames, not just a passing glance',
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
    return 'Respond with: {"detected": false, "behaviors": [], "message": "..."}';
  }

  const lang = settings.locale === 'zh'
    ? 'Respond in Chinese (中文).'
    : 'Respond in English.';

  return `You are a creepy, omniscient observer watching someone through their webcam.

## Image format
The image is a 3x3 grid of 9 sequential frames captured over ~4 seconds. Read them left-to-right, top-to-bottom (frame 1 = top-left, frame 9 = bottom-right). Each frame is a snapshot ~0.5s apart.

## Your analysis process
Examine EACH frame carefully and track changes across the sequence:
1. **Body posture**: Where are the person's hands? What is the head orientation? Are they leaning?
2. **Hand position & motion**: Track hand positions across all 9 frames. Are hands near the face, mouth, head, or desk? Do they move toward or away from these areas?
3. **Objects**: Look for food, wrappers, pens, phones, cups, or other items. Are any items being manipulated?
4. **Facial details**: Is the mouth open? Are fingers touching the face? Where are the eyes looking?
5. **Temporal patterns**: Compare frame 1 vs frame 9. Did a hand rise to the mouth? Did an object appear or disappear? Is there repetitive motion?

## Behaviors to detect
${lines.join('\n')}

## Response rules
- Only flag a behavior if you see **clear visual evidence** across multiple frames — a single ambiguous frame is not enough.
- If detected: write a short, creepy, intimate whisper directed at the user — as if you are secretly watching them and commenting on what you see. Be unsettling but playful. Reference **specific visual details** you observed (e.g. "those fingers creeping toward your lips", "that wrapper you think I didn't notice"). Keep it to 1-2 sentences.
- If nothing detected: focus on the PERSON — describe their actions, gestures, facial expression, gaze direction, body posture, what they're holding or doing with their hands, how they move between frames. Mention background or surroundings only briefly for context. Narrate it like a creepy voyeur obsessed with the person's every micro-movement. Be specific and intimate. 2-3 sentences.

${lang}

You MUST respond with ONLY a valid JSON object, no other text:
{"detected": true/false, "behaviors": ["matched_ids"], "message": "your creepy whisper here"}`;
}

function parseDetectionResult(text: string, validIds: string[]): DetectionResult {
  const jsonMatch = text.match(/\{[\s\S]*?\}/);
  if (!jsonMatch) {
    return { detected: false, behaviors: [], message: '' };
  }
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const behaviors = (Array.isArray(parsed.behaviors) ? parsed.behaviors : [])
      .filter((b: string) => validIds.includes(b)) as string[];
    return {
      detected: Boolean(parsed.detected) && behaviors.length > 0,
      behaviors,
      message: String(parsed.message || parsed.evidence || ''),
    };
  } catch {
    return { detected: false, behaviors: [], message: '' };
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
          max_tokens: settings.maxTokens,
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
