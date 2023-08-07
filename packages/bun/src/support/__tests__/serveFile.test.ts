/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from '../../builtins/fs';
import Bun from '../../builtins/Bun';
import { serveFile } from '../serveFile';
import { mockMethod, resetAllMocks } from '../testHelpers';

describe('serveFile', () => {
  const beforeEach = () => {
    mockMethod(Bun, 'file', (filePath) => {
      return { _stream: filePath } as any;
    });
  };

  const afterEach = () => {
    resetAllMocks();
  };

  it('should serve a file that exists', async () => {
    beforeEach();
    mockMethod(fs, 'stat', (filePath, callback) => {
      if (typeof callback === 'function') {
        callback(null, mockStat(42, true) as any);
      }
    });
    const filePath = '/foo/thing.png';
    const result = await serveFile(new Headers(), filePath);
    expect(JSON.stringify(result)).toBe(
      JSON.stringify({
        headers: {
          'Content-Length': '42',
          'Content-Type': 'image/png',
          ETag: 'W/"2a16806b5bc00"',
          'Last-Modified': 'Tue, 01 Jan 2019 00:00:00 GMT',
        },
        body: { _stream: '/foo/thing.png' },
      }),
    );
    afterEach();
  });

  it('should return null if the file does not exist', async () => {
    beforeEach();
    mockMethod(fs, 'stat', (filePath, callback) => {
      if (typeof callback === 'function') {
        const error = new Error('ENOENT: no such file or directory');
        callback(error, undefined as any);
      }
    });
    const filePath = './foo.txt';
    const result = await serveFile(new Headers(), filePath);
    expect(result).toBe(null);
    afterEach();
  });

  it('should return null if the entry at path is not a file', async () => {
    beforeEach();
    mockMethod(fs, 'stat', (filePath, callback) => {
      if (typeof callback === 'function') {
        callback(null, mockStat(5, false) as any);
      }
    });
    const filePath = './foo/dir';
    const result = await serveFile(new Headers(), filePath);
    expect(result).toBe(null);
    afterEach();
  });

  it('should fall back to default content type', async () => {
    beforeEach();
    mockMethod(fs, 'stat', (filePath, callback) => {
      if (typeof callback === 'function') {
        callback(null, mockStat(15, true) as any);
      }
    });
    const filePath = './foo/file.asdf';
    const result = await serveFile(new Headers(), filePath);
    expect(JSON.stringify(result)).toBe(
      JSON.stringify({
        headers: {
          'Content-Length': '15',
          'Content-Type': 'application/octet-stream',
          ETag: 'W/"f16806b5bc00"',
          'Last-Modified': 'Tue, 01 Jan 2019 00:00:00 GMT',
        },
        body: { _stream: './foo/file.asdf' },
      }),
    );
    afterEach();
  });
});

function mockStat(size: number, isFile: boolean) {
  return {
    size,
    mtimeMs: new Date('2019-01-01T00:00:00.000Z').valueOf(),
    isFile: () => isFile,
  };
}
