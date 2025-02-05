export type RetryOptions = {
  retry?: number;
  timeout?: number;
  callback?: (retry: number) => void;
};

if (!("timeout" in AbortSignal)) {
  // @ts-ignore
  AbortSignal.timeout = function (delay: number) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), delay);
    timeoutId?.unref?.();
    return controller.signal;
  };
}

export const fetchRetry = async (
  url: RequestInfo | URL,
  options: RequestInit & RetryOptions = {}
) => {
  let retry = options.retry ?? 3;
  const { callback, timeout = 30000, ...init } = options;
  init.signal = AbortSignal.timeout(timeout);
  while (retry > 0) {
    try {
      return await fetch(url, init);
    } catch (e) {
      callback?.(retry);
      retry--;
      if (retry === 0) {
        throw e;
      }
    }
  }
};
