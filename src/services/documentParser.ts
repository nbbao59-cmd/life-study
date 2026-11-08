/**
 * Chuyển đổi và chuẩn bị tệp tài liệu trước khi gửi sang Gemini AI (Multimodal hoặc Text).
 */

const TEXT_EXTENSIONS = new Set(['txt', 'md', 'markdown', 'csv', 'tsv', 'json', 'html', 'htm', 'xml', 'rtf']);

export function inferMimeType(fileName: string, blobType?: string): string {
  if (blobType && blobType !== 'application/octet-stream' && blobType.trim()) {
    return blobType.trim();
  }
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'bmp':
      return 'image/bmp';
    case 'txt':
      return 'text/plain';
    case 'md':
    case 'markdown':
      return 'text/markdown';
    case 'csv':
      return 'text/csv';
    case 'json':
      return 'application/json';
    case 'html':
    case 'htm':
      return 'text/html';
    default:
      return blobType || 'application/octet-stream';
  }
}

export function isTextFile(fileName: string, mimeType: string): boolean {
  if (mimeType.startsWith('text/') || mimeType === 'application/json') return true;
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  return TEXT_EXTENSIONS.has(ext);
}

function readAsBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64 = result.replace(/^data:[^;]+;base64,/, '').trim();
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error ?? new Error('Không thể đọc dữ liệu tệp bằng FileReader.'));
    reader.onabort = () => reject(new Error('Thao tác đọc tệp đã bị hủy.'));
    reader.readAsDataURL(blob);
  });
}

export interface PreparedAiFile {
  name: string;
  mimeType: string;
  base64Data?: string;
  textData?: string;
}

/**
 * Chuẩn bị payload tệp cho AI:
 * - Text/Markdown/CSV: đọc nội dung dạng text (`blob.text()`).
 * - PDF/Ảnh: đọc dạng Data URL qua FileReader và tách chuỗi base64.
 */
export async function prepareFileForAi(blob: Blob, fileName: string): Promise<PreparedAiFile> {
  const mimeType = inferMimeType(fileName, blob.type);
  const name = fileName.trim() || 'Tài liệu';

  if (isTextFile(fileName, mimeType)) {
    const textData = await blob.text();
    return {
      name,
      mimeType,
      textData,
    };
  }

  const base64Data = await readAsBase64(blob);
  return {
    name,
    mimeType,
    base64Data,
  };
}
