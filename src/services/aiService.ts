import sharp from 'sharp';

// AI Service - Now using external cloud APIs for heavy processing
// TensorFlow/TFJS logic has been removed as per architecture upgrade

export async function faceSwap(sourceBuffer: Buffer, targetBuffer: Buffer): Promise<Buffer> {
  // This function is now handled by the external FastAPI backend
  // The frontend calls the FastAPI backend directly
  throw new Error('Face swap is now handled by the external cloud API');
}

export async function removeBackground(imageBuffer: Buffer): Promise<Buffer> {
  // This function is now handled by the external FastAPI backend
  throw new Error('Background removal is now handled by the external cloud API');
}

export async function enhanceImage(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
    .modulate({ brightness: 1.05, saturation: 1.1 })
    .sharpen()
    .toBuffer();
}

export async function compressImage(imageBuffer: Buffer, quality: number = 60): Promise<Buffer> {
  return sharp(imageBuffer)
    .jpeg({ quality })
    .toBuffer();
}
