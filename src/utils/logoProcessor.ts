
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = false;

const MAX_IMAGE_DIMENSION = 512; // Reduced for better performance

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting background removal process...');
    
    // Use a more reliable segmentation model
    const segmenter = await pipeline(
      'image-segmentation', 
      'Xenova/detr-resnet-50-panoptic',
      { device: 'wasm' } // Use WASM for better compatibility
    );
    
    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize image if needed and draw it to canvas
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`);
    
    // Get image data as ImageData for processing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Process the image with the segmentation model
    console.log('Processing with segmentation model...');
    const result = await segmenter(canvas.toDataURL('image/png'));
    
    console.log('Segmentation result:', result);
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      throw new Error('Invalid segmentation result');
    }
    
    // Create output canvas
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Draw original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Get the output image data to modify alpha channel
    const outputImageData = outputCtx.getImageData(0, 0, canvas.width, canvas.height);
    const data = outputImageData.data;
    
    // Simple color-based background removal for logos
    // This works better for logos with solid backgrounds
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Check if pixel is close to white (common logo background)
      const isWhiteBackground = r > 240 && g > 240 && b > 240;
      
      // Check if pixel is close to the corner colors (likely background)
      const cornerColor = {
        r: data[0],
        g: data[1], 
        b: data[2]
      };
      
      const isCornerColor = Math.abs(r - cornerColor.r) < 30 && 
                           Math.abs(g - cornerColor.g) < 30 && 
                           Math.abs(b - cornerColor.b) < 30;
      
      if (isWhiteBackground || isCornerColor) {
        data[i + 3] = 0; // Make transparent
      }
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    console.log('Background removal applied successfully');
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Successfully created transparent logo blob');
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Enable CORS for processing
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const processLogoForTransparency = async (logoPath: string): Promise<string> => {
  try {
    console.log('Processing logo for transparency:', logoPath);
    
    // Load the current logo
    const response = await fetch(logoPath);
    const blob = await response.blob();
    const imageElement = await loadImage(blob);
    
    // Remove background
    const transparentBlob = await removeBackground(imageElement);
    
    // Convert to data URL for immediate use
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        console.log('Logo processed successfully');
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(transparentBlob);
    });
  } catch (error) {
    console.error('Error processing logo for transparency:', error);
    // Return original logo as fallback
    return logoPath;
  }
};
