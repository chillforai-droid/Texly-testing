import fetch from 'node-fetch';

const urls = [
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenet_v1_model-weights_manifest.json',
  'https://raw.githubusercontent.com/vladmandic/face-api/master/model/ssd_mobilenet_v1.json',
  'https://raw.githubusercontent.com/WebDevSimplified/Face-Detection-JavaScript/master/models/ssd_mobilenet_v1_model-weights_manifest.json',
  'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights/ssd_mobilenet_v1_model-weights_manifest.json'
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
