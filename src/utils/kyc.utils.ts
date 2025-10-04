import * as fs from 'fs';
import * as path from 'path';

export interface KYCImages {
  selfie?: string;
  frontDocument?: string;
  backDocument?: string;
}

/**
 * Converts KYC document images to base64 format
 * @param images Object containing file paths for selfie, frontDocument, and backDocument
 * @returns Promise with base64 encoded images
 */
export async function convertKYCImagesToBase64(images: {
  selfiePath?: string;
  frontDocumentPath?: string;
  backDocumentPath?: string;
}): Promise<KYCImages> {
  const result: KYCImages = {};

  try {
    if (images.selfiePath) {
      result.selfie = await readFileToBase64(images.selfiePath);
    }

    if (images.frontDocumentPath) {
      result.frontDocument = await readFileToBase64(images.frontDocumentPath);
    }

    if (images.backDocumentPath) {
      result.backDocument = await readFileToBase64(images.backDocumentPath);
    }

    return result;
  } catch (error) {
    console.error('Error converting KYC images to base64:', error);
    throw new Error('Failed to process KYC document images');
  }
}

/**
 * Helper function to read a file and convert it to base64
 * @param filePath Path to the file
 * @returns Base64 encoded string with data URI
 */
async function readFileToBase64(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`File not found: ${filePath}`));
    }

    // Read file as base64
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return reject(err);
      }

      // Get file extension
      const ext = path.extname(filePath).toLowerCase().substring(1);
      
      // Create data URI
      const base64 = `data:image/${ext};base64,${data.toString('base64')}`;
      resolve(base64);
    });
  });
}

/**
 * Extracts base64 data from a data URI
 * @param dataUri Data URI string (e.g., 'data:image/png;base64,...')
 * @returns The base64 data without the data URI prefix
 */
export function extractBase64Data(dataUri: string): string {
  return dataUri.split(',')[1];
}

/**
 * Converts a base64 string to a Buffer
 * @param base64String Base64 string (with or without data URI)
 * @returns Buffer containing the binary data
 */
export function base64ToBuffer(base64String: string): Buffer {
  const base64Data = base64String.includes(',') 
    ? extractBase64Data(base64String)
    : base64String;
    
  return Buffer.from(base64Data, 'base64');
}

/**
 * Gets the file size in bytes
 * @param filePath Path to the file
 * @returns File size in bytes
 */
export function getFileSizeInBytes(filePath: string): number {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    throw new Error(`Error getting file size: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates if a file size is within the allowed limits
 * @param filePath Path to the file
 * @param maxSizeInMB Maximum allowed size in MB (default: 5MB)
 * @returns Object with validation result and size information
 */
export function validateFileSize(filePath: string, maxSizeInMB: number = 5): {
  isValid: boolean;
  sizeInBytes: number;
  sizeInMB: number;
  maxSizeInBytes: number;
  maxSizeInMB: number;
} {
  const sizeInBytes = getFileSizeInBytes(filePath);
  const sizeInMB = sizeInBytes / (1024 * 1024);
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  
  return {
    isValid: sizeInBytes <= maxSizeInBytes,
    sizeInBytes,
    sizeInMB: parseFloat(sizeInMB.toFixed(2)),
    maxSizeInBytes,
    maxSizeInMB
  };
}

/**
 * Validates multiple KYC document files
 * @param files Object containing file paths for selfie, frontDocument, and backDocument
 * @param maxSizeInMB Maximum allowed size in MB for each file (default: 5MB)
 * @returns Object with validation results for each file
 */
export function validateKYCDocumentSizes(
  files: {
    selfiePath?: string;
    frontDocumentPath?: string;
    backDocumentPath?: string;
  },
  maxSizeInMB: number = 5
): {
  selfie?: ReturnType<typeof validateFileSize> & { path: string };
  frontDocument?: ReturnType<typeof validateFileSize> & { path: string };
  backDocument?: ReturnType<typeof validateFileSize> & { path: string };
  allValid: boolean;
} {
  const result: any = { allValid: true };
  
  if (files.selfiePath) {
    const validation = { 
      ...validateFileSize(files.selfiePath, maxSizeInMB),
      path: files.selfiePath 
    };
    result.selfie = validation;
    result.allValid = result.allValid && validation.isValid;
  }
  
  if (files.frontDocumentPath) {
    const validation = { 
      ...validateFileSize(files.frontDocumentPath, maxSizeInMB),
      path: files.frontDocumentPath 
    };
    result.frontDocument = validation;
    result.allValid = result.allValid && validation.isValid;
  }
  
  if (files.backDocumentPath) {
    const validation = { 
      ...validateFileSize(files.backDocumentPath, maxSizeInMB),
      path: files.backDocumentPath 
    };
    result.backDocument = validation;
    result.allValid = result.allValid && validation.isValid;
  }
  
  return result;
}