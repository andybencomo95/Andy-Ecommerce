import axios from 'axios';

/**
 * Extract a user-facing error message from an axios error.
 */
export function getAxiosErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err) && err.response !== undefined) {
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
    const data: unknown = err.response.data;
    if (data !== null && typeof data === 'object') {
      const errorField = (data as Record<string, unknown>).error;
      if (errorField !== null && typeof errorField === 'object') {
        const msg = (errorField as Record<string, unknown>).message;
        if (typeof msg === 'string') {
          return msg;
        }
      }
    }
  }
  return 'Error del servidor';
}
