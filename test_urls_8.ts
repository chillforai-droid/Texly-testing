import fetch from 'node-fetch';

const urls = [
  'https://justadudewhohacks.github.io/face-api.js/models/ssd_mobilenet_v1_model-weights_manifest.json',
  'https://justadudewhohacks.github.io/face-api.js/models/ssd_mobilenet_v1_model-shard1',
  'https://justadudewhohacks.github.io/face-api.js/models/face_landmark_68_model-weights_manifest.json',
  'https://justadudewhohacks.github.io/face-api.js/models/face_landmark_68_model-shard1'
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
