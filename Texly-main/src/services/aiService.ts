// AI Service - External APIs used for heavy processing
// sharp removed (not compatible with Vercel serverless)

export async function faceSwap(sourceBuffer: Buffer, targetBuffer: Buffer): Promise<Buffer> {
  throw new Error('Face swap is handled by external cloud API');
}

export async function removeBackground(imageBuffer: Buffer): Promise<Buffer> {
  throw new Error('Background removal is handled by external cloud API');
}

export async function enhanceImage(imageBuffer: Buffer): Promise<Buffer> {
  // Return as-is — enhancement handled client-side or via external API
  return imageBuffer;
}

export async function compressImage(imageBuffer: Buffer): Promise<Buffer> {
  // Return as-is — compression handled client-side
  return imageBuffer;
}

export async function upscaleImage(imageBuffer: Buffer): Promise<Buffer> {
  throw new Error('Upscaling is handled by external cloud API');
}
