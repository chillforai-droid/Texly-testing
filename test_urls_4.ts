import fetch from 'node-fetch';

const urls = [
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/ssd_mobilenet_v1_model-weights_manifest.json',
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/ssd_mobilenet_v1_model-shard1',
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/face_landmark_68_model-weights_manifest.json',
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/face_landmark_68_model-shard1'
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
