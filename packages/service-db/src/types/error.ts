export type DBActionError = {
  message: string;
  rawError?: Error;
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
