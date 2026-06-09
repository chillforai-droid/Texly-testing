// env-reader.ts
console.log('--- ENV KEYS ---');
const hfKeys = Object.keys(process.env).filter(key => 
  key.toLowerCase().includes('hf') || 
  key.toLowerCase().includes('hugging') || 
  key.toLowerCase().includes('gradio') ||
  key.toLowerCase().includes('space') ||
  key.toLowerCase().includes('key') ||
  key.toLowerCase().includes('token')
);
console.log('Matching env keys:', hfKeys);
for (const key of hfKeys) {
  // Safe logging of key and partial value
  const val = process.env[key];
  if (val) {
    console.log(`${key}: ${val.substring(0, 10)}... (length: ${val.length})`);
  } else {
    console.log(`${key}: undefined`);
  }
}
