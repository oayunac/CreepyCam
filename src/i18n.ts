export type Locale = 'en' | 'zh';

const strings = {
  // Header
  appName: { en: 'CreepyCam', zh: '抓个正着' },
  subtitle: { en: 'I see what you did there...', zh: '有人在盯着你...' },

  // Camera
  cameraOff: { en: 'Camera is off', zh: '摄像头已关闭' },
  analyzing: { en: 'Analyzing...', zh: '分析中...' },
  startCamera: { en: 'Start Camera', zh: '启动摄像头' },
  stopCamera: { en: 'Stop Camera', zh: '关闭摄像头' },
  startMonitoring: { en: 'Start Monitoring', zh: '开始监控' },
  stopMonitoring: { en: 'Stop Monitoring', zh: '停止监控' },

  // Status
  monitoringEvery: { en: 'Monitoring every', zh: '每' },
  monitoringUnit: { en: 's', zh: '秒监控一次' },

  // History
  caughtInTheAct: { en: 'Caught in the Act', zh: '抓个正着' },
  focused: { en: 'Focused', zh: '仅异常' },
  all: { en: 'All', zh: '全部' },
  clear: { en: 'Clear', zh: '清除' },
  nothingYet: { en: 'Nothing caught yet. Start monitoring to begin.', zh: '还没抓到什么。开始监控吧。' },
  noDetections: { en: 'No detections yet. Toggle "All" to see every scan.', zh: '暂无异常。切换「全部」查看每次扫描。' },
  nothingDetected: { en: 'Nothing detected', zh: '未检测到异常' },
  ok: { en: 'OK', zh: '正常' },
  backToHistory: { en: 'Back to History', zh: '返回历史' },

  // Pending
  analyzingBadge: { en: 'Analyzing', zh: '分析中' },
  watchingClosely: { en: 'Watching closely...', zh: '正在仔细观察你...' },

  // Behavior panel
  watchlist: { en: 'Watchlist', zh: '监控清单' },
  addBehavior: { en: 'Add behavior...', zh: '添加行为...' },

  // Behavior labels
  eating: { en: 'Eating', zh: '吃东西' },
  biting_hand: { en: 'Biting Hand', zh: '咬手' },
  picking_face: { en: 'Picking Face', zh: '抠脸' },
  scratching_head: { en: 'Scratching Head', zh: '挠头' },
  pen_spinning: { en: 'Pen Spinning', zh: '转笔' },
  snacking: { en: 'Sneaking Snacks', zh: '偷吃零食' },
  staring_at_camera: { en: 'Staring at Camera', zh: '盯着摄像头' },

  // Settings
  settings: { en: 'Settings', zh: '设置' },
  provider: { en: 'Provider', zh: '提供商' },
  baseUrl: { en: 'Base URL', zh: '接口地址' },
  model: { en: 'Model', zh: '模型' },
  apiKey: { en: 'API Key (optional)', zh: 'API Key（可选）' },
  captureInterval: { en: 'Capture Interval (seconds)', zh: '捕获间隔（秒）' },
  modelImageSize: { en: 'Model Image Size (px)', zh: '模型图片尺寸（像素）' },
  enableNotifications: { en: 'Enable Browser Notifications', zh: '启用浏览器通知' },
  setupNotes: { en: 'Setup Notes', zh: '配置说明' },
  setupLocal: { en: 'Run this app locally (npm run dev) to avoid HTTPS mixed-content blocking', zh: '本地运行（npm run dev）以避免 HTTPS 混合内容限制' },
  setupOllama: { en: 'Ollama CORS: OLLAMA_ORIGINS=* ollama serve', zh: 'Ollama CORS：OLLAMA_ORIGINS=* ollama serve' },
  setupLmStudio: { en: 'LM Studio: Enable CORS in server settings', zh: 'LM Studio：在服务器设置中启用 CORS' },

  // Mixed content warning
  warningBadge: { en: 'WARNING', zh: '警告' },
  mixedContentTitle: { en: 'Mixed Content Blocked', zh: '混合内容已被阻止' },
  mixedContentDesc: { en: 'This HTTPS page cannot reach your HTTP model API. Options:', zh: '此 HTTPS 页面无法访问你的 HTTP 模型 API。解决方案：' },
  mixedChrome: { en: 'Use Chrome — Chrome allows HTTPS pages to access localhost', zh: '使用 Chrome — Chrome 允许 HTTPS 页面访问 localhost' },
  mixedLocal: { en: 'Run locally — git clone & npm run dev on http://localhost:5173', zh: '本地运行 — git clone & npm run dev 在 http://localhost:5173' },

  // Notifications
  notifCaught: { en: 'Caught you...', zh: '抓到你了...' },
} as const;

export type StringKey = keyof typeof strings;

export function t(key: StringKey, locale: Locale): string {
  return strings[key]?.[locale] ?? strings[key]?.en ?? key;
}

export function getBehaviorLabelI18n(id: string, locale: Locale, customBehaviors: { id: string; label: string }[]): string {
  if (id in strings) return t(id as StringKey, locale);
  const custom = customBehaviors.find((c) => c.id === id);
  return custom?.label || id;
}
