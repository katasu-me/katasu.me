export type DBActionError = {
  message: string;
  rawError?: unknown;
};

export type ActionResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: DBActionError;
    };
