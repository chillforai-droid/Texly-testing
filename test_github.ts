import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('https://raw.githubusercontent.com/expressjs/express/master/package.json');
    console.log(`Express -> ${res.status}`);
  } catch (e: any) {
    console.log(`Express -> Error: ${e.message}`);
  }
}

test();
