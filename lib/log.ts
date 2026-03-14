const DEBUG = !!process.env.DEBUG_LOG;

function ts() {
  return new Date().toISOString();
}

export function debug(...args: any[]) {
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.debug('[debug]', ts(), ...args);
  }
}

export function info(...args: any[]) {
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.info('[info]', ts(), ...args);
  }
}

export function warn(...args: any[]) {
  // always show warnings
  // eslint-disable-next-line no-console
  console.warn('[warn]', ts(), ...args);
}

export function error(...args: any[]) {
  // always show errors
  // eslint-disable-next-line no-console
  console.error('[error]', ts(), ...args);
}

export const LOG_DEBUG_ENABLED = DEBUG;
