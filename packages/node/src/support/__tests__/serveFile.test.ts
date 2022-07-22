/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import fsPromises from 'fs/promises';

import { serveFile } from '../serveFile';

function mockStat(size: number, isFile: boolean) {
  return { size, isFile: () => isFile };
}

describe('serveFile', () => {
  beforeEach(() => {
    jest.spyOn(fs, 'createReadStream').mockImplementation((filePath) => {
      return { _stream: filePath } as any;
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('should serve a file that exists', async () => {
    jest
      .spyOn(fsPromises, 'stat')
      .mockImplementation(async () => mockStat(42, true) as any);
    const filePath = '/foo/thing.png';
    const result = await serveFile({}, filePath);
    expect(result).toEqual({
      headers: {
        'Content-Length': '42',
        'Content-Type': 'image/png',
      },
      readStream: { _stream: filePath },
    });
  });

  it('should return null if the file does not exist', async () => {
    jest
      .spyOn(fsPromises, 'stat')
      .mockImplementation(() =>
        Promise.reject(new Error('ENOENT: no such file or directory')),
      );
    const filePath = './foo.txt';
    const result = await serveFile({}, filePath);
    expect(result).toEqual(null);
  });

  it('should return null if the entry at path is not a file', async () => {
    jest
      .spyOn(fsPromises, 'stat')
      .mockImplementation(async () => mockStat(5, false) as any);
    const filePath = './foo/dir';
    const result = await serveFile({}, filePath);
    expect(result).toEqual(null);
  });

  it('should fall back to default content type', async () => {
    jest
      .spyOn(fsPromises, 'stat')
      .mockImplementation(async () => mockStat(15, true) as any);
    const filePath = './foo/file.asdf';
    const result = await serveFile({}, filePath);
    expect(result).toEqual({
      headers: {
        'Content-Length': '15',
        'Content-Type': 'application/octet-stream',
      },
      readStream: { _stream: filePath },
    });
  });
});
