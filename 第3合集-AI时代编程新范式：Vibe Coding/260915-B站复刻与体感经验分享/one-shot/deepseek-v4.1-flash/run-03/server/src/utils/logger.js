/* 极简结构化日志：避免引入额外依赖，同时保留级别与时间戳 */

const LEVEL_COLOR = {
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  debug: '\x1b[90m',
};

const RESET = '\x1b[0m';

function stamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function emit(level, scope, args) {
  const color = LEVEL_COLOR[level] || '';
  const prefix = `${color}[${stamp()}] ${level.toUpperCase().padEnd(5)} [${scope}]${RESET}`;
  const fn = level === 'error' ? console.error : console.log;
  fn(prefix, ...args);
}

export function createLogger(scope = 'app') {
  return {
    info: (...args) => emit('info', scope, args),
    warn: (...args) => emit('warn', scope, args),
    error: (...args) => emit('error', scope, args),
    debug: (...args) => {
      if (process.env.DEBUG) emit('debug', scope, args);
    },
  };
}

export const logger = createLogger('server');
export default logger;
