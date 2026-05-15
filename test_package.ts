import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/package.json');
    console.log(`Package -> ${res.status}`);
  } catch (e: any) {
    console.log(`Package -> Error: ${e.message}`);
  }
}

test();
