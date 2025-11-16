import type { ActionResult } from "../types/error";

export function createDBActionError<T = never>(message: string, error: unknown): ActionResult<T> {
  return {
    success: false,
    error: {
      message,
      rawError: error instanceof Error ? error : undefined,
    },
  };
}
