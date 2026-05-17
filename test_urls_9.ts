import fetch from 'node-fetch';

const urls = [
  'https://raw.githubusercontent.com/vladmandic/face-api/master/model/ssd_mobilenet_v1.json',
  'https://raw.githubusercontent.com/vladmandic/face-api/master/model/ssd_mobilenet_v1.bin',
  'https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_landmark_68.json',
  'https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_landmark_68.bin'
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
