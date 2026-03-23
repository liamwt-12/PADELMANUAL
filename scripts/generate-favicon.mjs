/**
 * Generate a favicon.ico with the letter "P" in copper (#c4956a) on cream (#faf9f6).
 * Creates a 32x32 ICO file with embedded BMP data. No external dependencies.
 */
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SIZE = 32;
const CREAM = { r: 250, g: 249, b: 246, a: 255 };
const COPPER = { r: 196, g: 149, b: 106, a: 255 };

// Create pixel grid (32x32)
const pixels = Array.from({ length: SIZE }, () =>
  Array.from({ length: SIZE }, () => ({ ...CREAM }))
);

// Draw a bold serif-style "P" letter
function setPixel(x, y, color) {
  if (x >= 0 && x < SIZE && y >= 0 && y < SIZE) {
    pixels[y][x] = { ...color };
  }
}

function fillRect(x1, y1, x2, y2, color) {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      setPixel(x, y, color);
    }
  }
}

function fillCircleQuarter(cx, cy, r, quadrant, color) {
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      if (x * x + y * y <= r * r) {
        let draw = false;
        if (quadrant === 'tr' && x >= 0 && y <= 0) draw = true;
        if (quadrant === 'br' && x >= 0 && y >= 0) draw = true;
        if (draw) setPixel(cx + x, cy + y, color);
      }
    }
  }
}

// Rounded cream background
const R = 6; // corner radius
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    // Check if pixel is outside rounded corners
    let inside = true;
    // Top-left corner
    if (x < R && y < R) {
      inside = (R - x - 0.5) ** 2 + (R - y - 0.5) ** 2 <= R * R;
    }
    // Top-right corner
    if (x >= SIZE - R && y < R) {
      inside = (x - (SIZE - R) + 0.5) ** 2 + (R - y - 0.5) ** 2 <= R * R;
    }
    // Bottom-left corner
    if (x < R && y >= SIZE - R) {
      inside = (R - x - 0.5) ** 2 + (y - (SIZE - R) + 0.5) ** 2 <= R * R;
    }
    // Bottom-right corner
    if (x >= SIZE - R && y >= SIZE - R) {
      inside = (x - (SIZE - R) + 0.5) ** 2 + (y - (SIZE - R) + 0.5) ** 2 <= R * R;
    }
    if (!inside) {
      pixels[y][x] = { r: 0, g: 0, b: 0, a: 0 }; // transparent
    }
  }
}

// Draw the "P" letter
// Vertical stem
fillRect(9, 6, 13, 25, COPPER);

// Top serif
fillRect(7, 6, 8, 8, COPPER);

// Bottom serif
fillRect(7, 23, 8, 25, COPPER);
fillRect(14, 23, 15, 25, COPPER);

// P bowl - top bar
fillRect(13, 6, 20, 9, COPPER);

// P bowl - right curve (approximated with rectangles)
fillRect(20, 7, 23, 9, COPPER);
fillRect(21, 9, 24, 11, COPPER);
fillRect(21, 11, 24, 13, COPPER);
fillRect(20, 13, 23, 15, COPPER);

// P bowl - bottom bar
fillRect(13, 14, 20, 17, COPPER);

// P bowl - inner cutout (cream colored, to make the bowl hollow)
fillRect(14, 10, 19, 13, CREAM);
// Restore rounded corner of inner bowl
fillRect(19, 10, 20, 10, COPPER);
fillRect(19, 13, 20, 13, COPPER);

// Build ICO file
// ICO format: ICONDIR + ICONDIRENTRY + BMP data

// BMP pixel data (BGRA, bottom-to-top row order)
const bmpPixels = Buffer.alloc(SIZE * SIZE * 4);
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const srcY = SIZE - 1 - y; // flip vertically for BMP
    const p = pixels[srcY][x];
    const offset = (y * SIZE + x) * 4;
    bmpPixels[offset] = p.b;     // Blue
    bmpPixels[offset + 1] = p.g; // Green
    bmpPixels[offset + 2] = p.r; // Red
    bmpPixels[offset + 3] = p.a; // Alpha
  }
}

// AND mask (1-bit per pixel, padded to 4-byte rows)
const maskRowBytes = Math.ceil(SIZE / 8);
const maskRowPadded = Math.ceil(maskRowBytes / 4) * 4;
const andMask = Buffer.alloc(SIZE * maskRowPadded, 0);
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const srcY = SIZE - 1 - y;
    if (pixels[srcY][x].a === 0) {
      // transparent pixel - set AND mask bit to 1
      const byteIndex = y * maskRowPadded + Math.floor(x / 8);
      const bitIndex = 7 - (x % 8);
      andMask[byteIndex] |= (1 << bitIndex);
    }
  }
}

// BITMAPINFOHEADER (40 bytes)
const bmpHeader = Buffer.alloc(40);
bmpHeader.writeUInt32LE(40, 0);           // biSize
bmpHeader.writeInt32LE(SIZE, 4);           // biWidth
bmpHeader.writeInt32LE(SIZE * 2, 8);       // biHeight (doubled for ICO)
bmpHeader.writeUInt16LE(1, 12);            // biPlanes
bmpHeader.writeUInt16LE(32, 14);           // biBitCount
bmpHeader.writeUInt32LE(0, 16);            // biCompression
bmpHeader.writeUInt32LE(bmpPixels.length + andMask.length, 20); // biSizeImage
// rest are 0

const imageData = Buffer.concat([bmpHeader, bmpPixels, andMask]);

// ICONDIR (6 bytes)
const iconDir = Buffer.alloc(6);
iconDir.writeUInt16LE(0, 0);    // Reserved
iconDir.writeUInt16LE(1, 2);    // Type (1 = ICO)
iconDir.writeUInt16LE(1, 4);    // Count

// ICONDIRENTRY (16 bytes)
const iconEntry = Buffer.alloc(16);
iconEntry.writeUInt8(SIZE, 0);             // Width
iconEntry.writeUInt8(SIZE, 1);             // Height
iconEntry.writeUInt8(0, 2);               // Color count
iconEntry.writeUInt8(0, 3);               // Reserved
iconEntry.writeUInt16LE(1, 4);            // Planes
iconEntry.writeUInt16LE(32, 6);           // Bit count
iconEntry.writeUInt32LE(imageData.length, 8);  // Bytes in resource
iconEntry.writeUInt32LE(22, 12);          // Image offset (6 + 16)

const ico = Buffer.concat([iconDir, iconEntry, imageData]);

const outPath = resolve(__dirname, '..', 'src', 'app', 'favicon.ico');
writeFileSync(outPath, ico);
console.log(`Favicon written to ${outPath} (${ico.length} bytes)`);
