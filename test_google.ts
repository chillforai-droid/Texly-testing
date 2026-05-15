import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('https://www.google.com');
    console.log(`Google -> ${res.status}`);
  } catch (e: any) {
    console.log(`Google -> Error: ${e.message}`);
  }
}

test();
