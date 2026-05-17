import fetch from 'node-fetch';

async function test() {
  const url = 'https://raw.githubusercontent.com/muhammedtalo/face-api.js-models/main/ssd_mobilenet_v1_model-weights_manifest.json';
  try {
    const res = await fetch(url);
    console.log(`${url} -> ${res.status}`);
  } catch (e: any) {
    console.log(`${url} -> Error: ${e.message}`);
  }
}

test();
