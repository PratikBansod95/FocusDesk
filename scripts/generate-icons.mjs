import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'assets', 'icons');
mkdirSync(outDir, { recursive: true });

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function png(size, r, g, b) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const row = Buffer.alloc(1 + size * 3);
  for (let y = 0; y < size; y++) {
    const rowBuf = Buffer.alloc(1 + size * 3);
    rowBuf[0] = 0;
    for (let x = 0; x < size; x++) {
      const inset = size * 0.18;
      const inRect = x >= inset && y >= inset && x < size - inset && y < size - inset;
      const idx = 1 + x * 3;
      if (inRect) {
        rowBuf[idx] = r;
        rowBuf[idx + 1] = g;
        rowBuf[idx + 2] = b;
      } else {
        rowBuf[idx] = 79;
        rowBuf[idx + 1] = 110;
        rowBuf[idx + 2] = 247;
      }
    }
    // rebuild raw image data
  }
  const raw = [];
  for (let y = 0; y < size; y++) {
    raw.push(0);
    for (let x = 0; x < size; x++) {
      const inset = size * 0.2;
      const inRect = x >= inset && y >= inset && x < size - inset && y < size - inset;
      if (inRect) raw.push(r, g, b);
      else raw.push(15, 23, 42);
    }
  }
  const compressed = zlib.deflateSync(Buffer.from(raw));
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const size of [16, 48, 128]) {
  const file = join(outDir, `icon-${size}.png`);
  writeFileSync(file, png(size, 241, 245, 249));
  console.log('Wrote', file);
}
