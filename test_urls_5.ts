import fetch from 'node-fetch';

const urls = [
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenet_v1_model-weights_manifest.json',
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/main/weights/ssd_mobilenet_v1_model-weights_manifest.json',
  'https://raw.githubusercontent.com/WebDevSimplified/Face-Detection-JavaScript/master/models/ssd_mobilenet_v1_model-weights_manifest.json',
  'https://raw.githubusercontent.com/WebDevSimplified/Face-Detection-JavaScript/main/models/ssd_mobilenet_v1_model-weights_manifest.json',
  'https://raw.githubusercontent.com/muhammedtalo/face-api.js-models/master/ssd_mobilenet_v1_model-weights_manifest.json',
  'https://raw.githubusercontent.com/muhammedtalo/face-api.js-models/main/ssd_mobilenet_v1_model-weights_manifest.json'
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
