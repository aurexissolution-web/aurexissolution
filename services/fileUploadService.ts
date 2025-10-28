// services/fileUploadService.ts
// Using Base64 encoding to store files directly in Firestore (no Firebase Storage needed)

export interface UploadedFile {
  id: string;
  fileName: string;
  fileUrl: string; // Base64 data URL
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
}

// Allowed file types
const ALLOWED_FILE_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Spreadsheets
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  // Text
  'text/plain',
  // Archives
  'application/zip',
  'application/x-rar-compressed'
];

// Reduced max file size for Base64 storage (Firestore limit is 1MB per document field)
const MAX_FILE_SIZE = 800 * 1024; // 800KB (safe limit for Base64 encoding)

/**
 * Convert file to Base64 data URL
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Upload a file using Base64 encoding (stores in Firestore, no Firebase Storage needed)
 */
export const uploadTaskFile = async (
  taskId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadedFile> => {
  try {
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed. Please upload PDF, DOC, XLS, images, or ZIP files.`);
    }

    // Validate file size (800KB limit for Base64)
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds 800KB limit. Your file is ${(file.size / 1024).toFixed(0)}KB. Please use a smaller file.`);
    }

    // Simulate progress
    if (onProgress) onProgress(10);

    // Convert file to Base64
    const base64Data = await fileToBase64(file);
    
    if (onProgress) onProgress(100);

    // Generate unique file ID
    const timestamp = Date.now();
    const fileId = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Return file metadata with Base64 data as URL
    return {
      id: fileId,
      fileName: file.name,
      fileUrl: base64Data, // Base64 data URL (can be used directly in <a> tags)
      fileType: file.type,
      fileSize: file.size,
      uploadedAt: new Date()
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Delete a file (Base64 version - no actual deletion needed, just remove from Firestore)
 */
export const deleteTaskFile = async (taskId: string, fileId: string): Promise<void> => {
  try {
    // With Base64, files are stored in Firestore task document
    // Deletion is handled by removing from attachments array in the task
    console.log(`File ${fileId} will be removed from task ${taskId} attachments`);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * List all files for a task (Base64 version - files are in task document)
 */
export const listTaskFiles = async (taskId: string): Promise<UploadedFile[]> => {
  try {
    // With Base64, files are stored directly in the task document
    // This function is not needed but kept for compatibility
    console.log(`Listing files for task ${taskId} - files are in task document`);
    return [];
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
};

/**
 * Upload employee document using Base64
 */
export const uploadEmployeeDocument = async (
  employeeId: string,
  file: File
): Promise<UploadedFile> => {
  try {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed.`);
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds 800KB limit. Your file is ${(file.size / 1024).toFixed(0)}KB.`);
    }

    // Convert to Base64
    const base64Data = await fileToBase64(file);

    const timestamp = Date.now();
    const fileId = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    return {
      id: fileId,
      fileName: file.name,
      fileUrl: base64Data,
      fileType: file.type,
      fileSize: file.size,
      uploadedAt: new Date()
    };
  } catch (error) {
    console.error('Error uploading employee document:', error);
    throw error;
  }
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get file icon based on file type
 */
export const getFileIcon = (fileType: string): string => {
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('excel') || fileType.includes('spreadsheet') || fileType.includes('csv')) return '📊';
  if (fileType.includes('image')) return '🖼️';
  if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
  if (fileType.includes('text')) return '📃';
  return '📎';
};

