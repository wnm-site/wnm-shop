// Convert image file to compressed Base64 string
export const compressImage = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const timeout = setTimeout(() => reject(new Error(`Timeout: ${file.name} took too long to process`)), 30000);

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            clearTimeout(timeout);
            return reject(new Error(`Failed to get canvas context for: ${file.name}`));
          }

          ctx.drawImage(img, 0, 0, width, height);

          const base64 = canvas.toDataURL('image/jpeg', quality);
          clearTimeout(timeout);
          resolve(base64);
        } catch (error) {
          clearTimeout(timeout);
          reject(new Error(`Failed to compress image: ${file.name}. ${error.message}`));
        }
      };
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Failed to load image: ${file.name}. The file may be corrupted or not a valid image.`));
      };
      img.src = e.target.result;
    };

    reader.onerror = () => {
      clearTimeout(timeout);
      reject(new Error(`Failed to read file: ${file.name}`));
    };
    reader.readAsDataURL(file);
  });
};

export const isBase64TooLarge = (base64) => {
  const sizeInBytes = (base64.length * 3) / 4;
  return sizeInBytes > 900000; // 900KB safe limit
};

// Compress multiple images
export const compressMultipleImages = async (files, maxWidth = 600, quality = 0.6) => {
  const compressedImages = [];
  
  for (const file of files) {
    try {
      let base64 = await compressImage(file, maxWidth, quality);
      
      // If still too big, compress more
      if (isBase64TooLarge(base64)) {
        base64 = await compressImage(file, 400, 0.4);
      }
      
      compressedImages.push(base64);
    } catch (error) {
      console.error('Failed to compress image:', file.name, error);
    }
  }
  
  return compressedImages;
};

const PLACEHOLDER = 'https://via.placeholder.com/600x600?text=No+Image';

export const getProductImageSrc = (product) => {
  if (!product) return PLACEHOLDER;
  const images = product.images;
  if (Array.isArray(images) && images.length > 0) {
    const valid = images.find(img => typeof img === 'string' && img.trim() !== '');
    if (valid) return valid;
  }
  const image = product.image;
  if (typeof image === 'string' && image.trim() !== '') {
    return image;
  }
  return PLACEHOLDER;
};

export const getProductImages = (product) => {
  if (!product) return [PLACEHOLDER];
  const images = product.images;
  if (Array.isArray(images) && images.length > 0) {
    const valid = images.filter(img => typeof img === 'string' && img.trim() !== '');
    if (valid.length > 0) return valid;
  }
  const image = product.image;
  if (typeof image === 'string' && image.trim() !== '') {
    return [image];
  }
  return [PLACEHOLDER];
};

export const getColorImage = (product, colorName) => {
  if (!product || !colorName) return null;
  const colors = product.colors;
  if (Array.isArray(colors)) {
    const color = colors.find(c => c && c.name === colorName);
    if (color && typeof color.image === 'string' && color.image.trim() !== '') {
      return color.image;
    }
  }
  return null;
};
