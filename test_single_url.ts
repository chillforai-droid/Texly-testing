import fetch from 'node-fetch';

async function test() {
  const url = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights/ssd_mobilenet_v1_model-weights_manifest.json';
  try {
    const res = await fetch(url);
    console.log(`${url} -> ${res.status}`);
  } catch (e: any) {
    console.log(`${url} -> Error: ${e.message}`);
  }
}

test();
