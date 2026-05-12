const COLORS = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

const BOX_CHARS = {
  top: '═',
  bottom: '═',
  left: '║',
  right: '║',
  topLeft: '╔',
  topRight: '╗',
  bottomLeft: '╚',
  bottomRight: '╝',
  divider: '─',
};

const MAX_LINE_WIDTH = 70;

function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 8);
}

let currentRequestId: string | null = null;

export function setRequestId(id?: string): string {
  currentRequestId = id ?? generateRequestId();
  return currentRequestId;
}

export function getRequestId(): string | null {
  return currentRequestId;
}

export function clearRequestId(): void {
  currentRequestId = null;
}

const timers = new Map<string, number>();

function formatValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
      .split('\n')
      .map(line => '  ' + line)
      .join('\n');
  }
  return String(value);
}

function formatObject(obj: Record<string, unknown>, indent: string = '  '): string[] {
  const lines: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      lines.push(`${indent}${COLORS.gray}${key}:${COLORS.reset}`);
      for (const subLine of formatObject(value as Record<string, unknown>, indent + '  ')) {
        lines.push(subLine);
      }
    } else if (Array.isArray(value)) {
      lines.push(`${indent}${COLORS.gray}${key}:${COLORS.reset} [${value.length} items]`);
      if (value.length > 0 && value.length <= 10) {
        for (let i = 0; i < value.length; i++) {
          lines.push(`${indent}  [${i}] ${formatValue(value[i])}`);
        }
      } else if (value.length > 10) {
        for (let i = 0; i < 5; i++) {
          lines.push(`${indent}  [${i}] ${formatValue(value[i])}`);
        }
        lines.push(`${indent}  ... (${value.length - 5} more)`);
      }
    } else {
      lines.push(`${indent}${COLORS.gray}${key}:${COLORS.reset} ${formatValue(value)}`);
    }
  }
  
  return lines;
}

function drawBox(title: string, content: string[], style: 'header' | 'section' | 'success' | 'error'): void {
  const requestIdStr = currentRequestId ? `Request: ${currentRequestId}` : '';
  const fullTitle = requestIdStr ? `${requestIdStr} | ${title}` : title;
  
  let color: string;
  let levelText: string;
  
  switch (style) {
    case 'header':
      color = COLORS.cyan;
      levelText = 'STEP';
      break;
    case 'success':
      color = COLORS.green;
      levelText = 'COMPLETE';
      break;
    case 'error':
      color = COLORS.red;
      levelText = 'ERROR';
      break;
    default:
      color = COLORS.yellow;
      levelText = 'STEP';
  }
  
  const topBorder = color + BOX_CHARS.topLeft + BOX_CHARS.top.repeat(MAX_LINE_WIDTH - 2) + BOX_CHARS.topRight + COLORS.reset;
  const bottomBorder = color + BOX_CHARS.bottomLeft + BOX_CHARS.bottom.repeat(MAX_LINE_WIDTH - 2) + BOX_CHARS.bottomRight + COLORS.reset;
  
  const titleLine = `${BOX_CHARS.left} ${COLORS.bold}[${levelText}] ${fullTitle}${COLORS.reset}${' '.repeat(Math.max(0, MAX_LINE_WIDTH - fullTitle.length - 10))} ${BOX_CHARS.right}`;
  
  console.log(topBorder);
  console.log(color + titleLine + COLORS.reset);
  console.log(bottomBorder);
  
  for (const line of content) {
    console.log(line);
  }
  
  console.log('');
}

function drawDivider(): void {
  console.log(COLORS.gray + BOX_CHARS.divider.repeat(MAX_LINE_WIDTH) + COLORS.reset);
}

export function debug(step: string, data: Record<string, unknown>): void {
  if (!isDevelopment()) return;
  
  const lines: string[] = [];
  lines.push('');
  
  for (const line of formatObject(data)) {
    lines.push(line);
  }
  
  drawBox(step, lines, 'header');
}

export function info(step: string, data: Record<string, unknown>): void {
  const lines: string[] = [];
  lines.push('');
  
  for (const line of formatObject(data)) {
    lines.push(line);
  }
  
  drawBox(step, lines, 'section');
}

export function success(step: string, data: Record<string, unknown>): void {
  const lines: string[] = [];
  lines.push('');
  
  for (const line of formatObject(data)) {
    lines.push(line);
  }
  
  drawBox(step, lines, 'success');
}

export function error(step: string, err: Error | string, data?: Record<string, unknown>): void {
  const lines: string[] = [];
  lines.push('');
  
  const errorMsg = err instanceof Error ? err.message : err;
  const stack = err instanceof Error ? err.stack : undefined;
  
  lines.push(`  ${COLORS.red}Error: ${errorMsg}${COLORS.reset}`);
  
  if (stack && isDevelopment()) {
    lines.push(`  ${COLORS.gray}Stack:${COLORS.reset}`);
    const stackLines = stack.split('\n').slice(1, 4);
    for (const stackLine of stackLines) {
      lines.push(`    ${COLORS.gray}${stackLine.trim()}${COLORS.reset}`);
    }
  }
  
  if (data) {
    lines.push('');
    for (const line of formatObject(data)) {
      lines.push(line);
    }
  }
  
  drawBox(step, lines, 'error');
}

export function warn(step: string, message: string, data?: Record<string, unknown>): void {
  const lines: string[] = [];
  lines.push('');
  lines.push(`  ${COLORS.yellow}Warning: ${message}${COLORS.reset}`);
  
  if (data) {
    lines.push('');
    for (const line of formatObject(data)) {
      lines.push(line);
    }
  }
  
  drawBox(step, lines, 'section');
}

export function time(label: string): void {
  if (!isDevelopment()) return;
  timers.set(label, Date.now());
}

export function timeEnd(label: string): number | undefined {
  if (!isDevelopment()) return undefined;
  
  const start = timers.get(label);
  if (!start) return undefined;
  
  const duration = Date.now() - start;
  timers.delete(label);
  
  return duration;
}

export function timing(step: string, label: string, data?: Record<string, unknown>): void {
  const duration = timeEnd(label);
  if (!isDevelopment() || duration === undefined) return;
  
  const lines: string[] = [];
  lines.push('');
  lines.push(`  ${COLORS.green}Duration: ${duration}ms${COLORS.reset}`);
  
  if (data) {
    lines.push('');
    for (const line of formatObject(data)) {
      lines.push(line);
    }
  }
  
  drawBox(`${step} (timing)`, lines, 'success');
}

export function substep(title: string, data: Record<string, unknown>): void {
  if (!isDevelopment()) return;
  
  console.log('');
  drawDivider();
  console.log(`${COLORS.cyan}  ${title}${COLORS.reset}`);
  drawDivider();
  
  for (const line of formatObject(data)) {
    console.log(line);
  }
  console.log('');
}

export function list(title: string, items: string[]): void {
  if (!isDevelopment()) return;
  
  console.log('');
  console.log(`${COLORS.cyan}  ${title}${COLORS.reset}`);
  
  for (const item of items) {
    console.log(`    ${item}`);
  }
  console.log('');
}

export const logger = {
  debug,
  info,
  success,
  error,
  warn,
  time,
  timeEnd,
  timing,
  substep,
  list,
  setRequestId,
  getRequestId,
  clearRequestId,
};

export default logger;