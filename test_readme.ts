import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/README.md');
    console.log(`README -> ${res.status}`);
  } catch (e: any) {
    console.log(`README -> Error: ${e.message}`);
  }
}

test();
