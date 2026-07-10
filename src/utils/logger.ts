type LoggerMeta = Record<string, unknown>;

function formatMeta(meta?: LoggerMeta): string {
  if (!meta) {
    return '';
  }

  return ` ${JSON.stringify(meta)}`;
}

const logger = {
  info(message: string, meta?: LoggerMeta) {
    console.log(`[INFO] ${new Date().toISOString()} ${message}${formatMeta(meta)}`);
  },
  warn(message: string, meta?: LoggerMeta) {
    console.warn(`[WARN] ${new Date().toISOString()} ${message}${formatMeta(meta)}`);
  },
  error(message: string, meta?: LoggerMeta) {
    console.error(`[ERROR] ${new Date().toISOString()} ${message}${formatMeta(meta)}`);
  },
};

export default logger;
