import fetch from 'node-fetch';

const urls = [
  'https://raw.githubusercontent.com/muhammedtalo/face-api.js-models/master/ssd_mobilenet_v1_model-weights_manifest.json',
  'https://raw.githubusercontent.com/k-yle/face-api.js-models/master/ssd_mobilenet_v1_model-weights_manifest.json',
  'https://raw.githubusercontent.com/c-v-m/face-api.js-models/master/ssd_mobilenet_v1_model-weights_manifest.json'
];

async function test() {
  for (const url of urls) {
    try {
      const res = await fetch(url);
      console.log(`${url} -> ${res.status}`);
    } catch (e: any) {
      console.log(`${url} -> Error: ${e.message}`);
    }
  }
}

test();
