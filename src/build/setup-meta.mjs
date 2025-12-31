import * as fs from 'fs';
import parser from 'xml2json';
import { spawnSync } from 'child_process';
import { texts, config } from './resources/brand/config.mjs';

if (config.enabledLocales.length === 0) {
  throw Error('no enabled locales');
} else if (texts[config.enabledLocales[0]] === undefined) {
  throw Error(`no texts for the first locale ${config.enabledLocales[0]}`);
}

const txt = texts[config.defaultLocale];

const path = new URL('../../dist/spa/index.html', import.meta.url);
const index = fs.readFileSync(path, 'utf8');

const meta = {
  'og:title': txt.appName,
  'og:type': 'website',
  'og:url': config.url,
  'og:image': config.url === undefined ? undefined : `${config.url}/assets/meta-image.png`,
  'twitter:title': txt.appName,
};
const replacement = Object.entries(meta)
  .filter(([, cont]) => cont !== undefined)
  .map(([prop, cont]) => `<meta property="${prop}" content="${cont}">`)
  .join('');
const newIndex = index.replace('</head>', replacement + '</head>');

fs.writeFileSync(path, newIndex, 'utf8');

// create the image for og:image from the logo
const resizeWidth = 630;
const unitRe = /([0-9]*(\.[0-9]+)?)([a-zA-Z]*)/;
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
const srcfile = new URL('resources/brand/logo.svg', import.meta.url);
const srcData = fs.readFileSync(srcfile);
const json = JSON.parse(parser.toJson(srcData));
const [, width, , widthUnit] = unitRe.exec(json.svg.width);
const w = toIn(width, widthUnit);
if (w === undefined) {
  throw Error(`Invalid width unit: ${widthUnit}`);
}
const dstfile = new URL('../../dist/spa/assets/meta-image.png', import.meta.url);
const res = spawnSync(
  'magick',
  [
    '-background',
    'black',
    '-density',
    `${resizeWidth / w}`,
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
