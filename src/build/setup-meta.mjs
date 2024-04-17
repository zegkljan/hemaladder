import * as fs from 'fs';
import sharp from 'sharp';
import { texts, config } from './resources/brand/config.mjs';

if (config.enabledLocales.length === 0) {
  throw Error('no enabled locales');
} else if (texts[config.enabledLocales[0]] === undefined) {
  throw Error(`no texts for the first locale ${config.enabledLocales[0]}`);
}

const txt = texts[config.defaultLocale];

const path = 'dist/spa/index.html';
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

await sharp('./src/build/resources/brand/logo.svg')
  .resize(resizeWidth)
  .flatten({
    background: {
      r: 0,
      g: 0,
      b: 0
    }
  })
  .toFile('./dist/spa/assets/meta-image.png');
