import fs from 'fs';
import parser from 'xml2json';
import { spawnSync } from 'child_process';

function toIn(val, unit) {
  let res = undefined;
  switch (unit) {
    case 'mm':
      res = val / 25.4;
      break;
    case 'cm':
      res = val / 2.54;
      break;
    case 'm':
      res = val / 0.0254;
      break;
    case 'in':
      res = val;
      break;
    case '':
      res = val / 96;
      break;
    default:
      throw Error(`invalid unit: ${unit} ${unit === undefined} ${unit === null} ${unit === ''}`);
  }
  return res;
}

const pngSizes = [128, 96, 64, 32, 16];
const icoSizes = [256, 128, 96, 72, 64, 48, 32, 24, 16];
const unitRe = /([0-9]*(\.[0-9]+)?)([a-zA-Z]*)/;
const srcfile = new URL('resources/brand/logo.svg', import.meta.url);

console.log('Generating icons from', srcfile.pathname);

const srcData = fs.readFileSync(srcfile);
const json = JSON.parse(parser.toJson(srcData));
const [, width, , widthUnit] = unitRe.exec(json.svg.width);

const w = toIn(width, widthUnit);
if (w === undefined) {
  throw Error(`Invalid width unit: ${widthUnit}`);
}

for (const size of pngSizes) {
  const density = size / w;
  const filename = `favicon-${size}x${size}.png`;
  const dstfile = new URL(`../../public/icons/${filename}`, import.meta.url);
  console.log('Writing PNG icon to', dstfile.pathname);
  const res = spawnSync(
    'magick',
    [
      '-background',
      'none',
      '-density',
      `${density}`,
      srcfile.pathname,
      dstfile.pathname,
    ],
    {
      shell: false,
    }
  );
  if (res.status !== 0) {
    throw Error(`Failed to generate ${filename}: ${res.stderr}`);
  }
}

const icoDstfile = new URL('../../public/favicon.ico', import.meta.url);
console.log('Writing ICO icon to', icoDstfile.pathname);
const res = spawnSync(
  'magick',
  [
    '-background',
    'none',
    '-density',
    `${Math.max(...icoSizes) / w}`,
    srcfile.pathname,
    '-define',
    `icon:auto-resize=${icoSizes.join(',')}`,
    icoDstfile.pathname,
  ],
  {
    shell: false,
  }
);
if (res.status !== 0) {
  throw Error(`Failed to generate favicon.ico: ${res.stderr}`);
}
