import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const MODELS_URL = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/';
const MODELS_PATH = path.join(process.cwd(), 'models');

const FILES = [
  'ssd_mobilenet_v1_model-weights_manifest.json',
  'ssd_mobilenet_v1_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1'
];

async function download() {
  if (!fs.existsSync(MODELS_PATH)) {
    fs.mkdirSync(MODELS_PATH, { recursive: true });
  }

  for (const file of FILES) {
    const filePath = path.join(MODELS_PATH, file);
    if (fs.existsSync(filePath)) {
      console.log(`Skipping ${file}, already exists.`);
      continue;
    }

    console.log(`Downloading ${file}...`);
    const response = await fetch(`${MODELS_URL}${file}`);
    if (!response.ok) throw new Error(`Failed to download ${file}: ${response.statusText}`);
    
    const buffer = await response.buffer();
    fs.writeFileSync(filePath, buffer);
    console.log(`Finished ${file}`);
  }
}

download().catch(console.error);
