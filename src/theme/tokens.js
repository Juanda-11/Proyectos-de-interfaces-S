// Design tokens de WorkerWatch (Cyber-Industrial Premium)
export const WATCH_SIZE = 380;

export const COLORS = {
  bg: '#000000', // OLED black
  surface: '#090D16',
  white: '#FFFFFF',
  black: '#000000',
  dim: '#A7B0C0',
  glass: 'rgba(255,255,255,0.07)',
  glassBorder: 'rgba(255,255,255,0.16)',
  bezel: '#1B2233',
  line: '#2A3350',
  warn: '#FFB020',
  ai: '#A855F7',
  safe: '#00FF87',
  alert: '#FF416C',
  cyan: '#60EFFF',
};

export const GRADIENTS = {
  safe: ['#00FF87', '#60EFFF'], // activo / seguro
  alert: ['#FF416C', '#FF4B2B'], // alerta / urgencia
  ai: ['#A855F7', '#6366F1'], // asistente IA
  warn: ['#FFB020', '#FF8A00'], // advertencia / severidad media
  muted: ['#3A4259', '#2A3350'], // fuera de turno
};

// Color base del resplandor (glow) por variante
export const GLOW = {
  safe: '#00FF87',
  alert: '#FF416C',
  ai: '#A855F7',
  warn: '#FFB020',
  muted: '#3A4259',
};
