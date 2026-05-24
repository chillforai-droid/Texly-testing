
/**
 * Adds a watermark to an image.
 * @param imageUrl The URL of the image to watermark.
 * @param text The watermark text.
 * @returns A promise that resolves to a Blob of the watermarked image.
 */
export async function addWatermarkToImage(imageUrl: string, text: string = "TexlyOnline"): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Configure watermark text
      // Font size relative to image width (e.g., 3% of width)
      const fontSize = Math.max(20, Math.floor(img.width * 0.03));
      ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
      
      // Set opacity to 0.5 (half visible)
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "white";
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Measure text to position it in the bottom right corner
      const metrics = ctx.measureText(text);
      const padding = fontSize;
      const x = canvas.width - metrics.width - padding;
      const y = canvas.height - padding;

      // Draw the text
      ctx.fillText(text, x, y);

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Could not generate blob"));
        }
      }, 'image/png', 0.9);
    };
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = imageUrl;
  });
}
