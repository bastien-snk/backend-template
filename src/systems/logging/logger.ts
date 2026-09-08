import pino, {type Logger as PinoLogger} from "pino";

export type Logger = PinoLogger;

export function createLogger(level: string): Logger {
  return pino({level});
}
