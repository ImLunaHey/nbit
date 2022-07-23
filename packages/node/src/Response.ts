import type { Readable } from 'stream';
import type { ReadableStream } from 'stream/web';

import { StaticFile, type StaticFileOptions } from './core/StaticFile';
import { Headers, type HeadersInit } from './Headers';

type Body =
  | Uint8Array // Includes Buffer which is a subclass of Uint8Array
  | Readable // Traditional Node Streams API
  | ReadableStream // New Web Streams API (since Node 16.5)
  | StaticFile
  | string;

type RedirectStatus = 301 | 302 | 303 | 304 | 307 | 308;

export type ResponseInit = {
  headers?: HeadersInit;
  status?: number;
  statusText?: string;
};

export class Response {
  readonly status: number;
  readonly headers: Headers;
  readonly body: Body;

  constructor(body: Body, init?: ResponseInit) {
    const { status, headers } = init ?? {};
    this.status = status ?? 200;
    this.headers = new Headers(headers);
    this.body = body;
  }

  static redirect(url: string, init?: { status?: RedirectStatus }) {
    const { status } = init ?? {};
    return new Response('', {
      status: status ?? 302,
      // Note: express would percent-encode this URL using npm.im/encodeurl
      headers: { Location: url },
    });
  }

  // Note: This will throw if payload has circular references
  static json(payload: unknown, init?: ResponseInit) {
    const body = JSON.stringify(payload) ?? 'null';
    const headers = new Headers(init?.headers);
    headers.set('Content-Type', 'application/json; charset=UTF-8');
    return new Response(body, {
      ...init,
      headers,
    });
  }

  static file(filePath: string, init?: ResponseInit & StaticFileOptions) {
    const { status, statusText, headers, ...options } = init ?? {};
    return new Response(new StaticFile(filePath, options), {
      status: status ?? 200,
      statusText: statusText ?? '',
      headers: headers ?? [],
    });
  }
}

export function isStaticFile(object: unknown): object is StaticFile {
  return object instanceof StaticFile;
}
