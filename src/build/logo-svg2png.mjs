import sharp from 'sharp';

const srcfile = new URL('resources/brand/logo.svg', import.meta.url);
const resizeWidth = 1024;
const dstfile = new URL('logo.png', import.meta.url);

const img = await sharp(srcfile.pathname);
const resized = await img.resize(resizeWidth);
await resized.toFile(dstfile.pathname);
