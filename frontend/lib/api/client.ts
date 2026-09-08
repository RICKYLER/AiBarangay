/**
 * Typed fetch wrapper for the Express API.
 *
 * All calls are same-origin (Next rewrites /api → backend), so the
 * httpOnly session cookie rides along automatically. The frontend
 * never sees database credentials — only this API surface.
 */

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function parse(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.error || 'Request failed.', data.errors);
  }
  return data;
}

export async function apiGet<T>(path: string): Promise<T> {
  return parse(await fetch(path, { credentials: 'same-origin' })) as T;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return parse(
    await fetch(path, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  ) as T;
}

/** Multipart upload (report photo). */
export async function apiUpload<T>(path: string, form: FormData): Promise<T> {
  return parse(
    await fetch(path, {
      method: 'POST',
      credentials: 'same-origin',
      body: form,
    })
  ) as T;
}
