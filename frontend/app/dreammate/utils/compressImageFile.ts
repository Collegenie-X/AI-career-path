/**
 * 이미지 파일을 캔버스로 축소·압축해 data URL로 변환.
 * localStorage 용량을 아끼기 위해 긴 변 기준 maxDim, JPEG quality로 다운스케일한다.
 */
export async function compressImageFile(
  file: File,
  maxDim = 1280,
  quality = 0.72,
): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file);
  // SVG 등 캔버스 처리가 무의미한 경우 원본 반환
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return dataUrl;
  }

  const img = await loadImage(dataUrl);
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const targetW = Math.round(img.width * scale);
  const targetH = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, targetW, targetH);

  try {
    return canvas.toDataURL('image/jpeg', quality);
  } catch {
    return dataUrl;
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('이미지를 불러오지 못했습니다.'));
    img.src = src;
  });
}
