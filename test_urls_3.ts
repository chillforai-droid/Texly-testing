import fetch from 'node-fetch';

const urls = [
  'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/ssd_mobilenet_v1.json',
  'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_landmark_68.json'
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
