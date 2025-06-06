export enum FileErrorCodes {
  // File Upload Errors
  FILE_UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',
  FILE_TYPE_NOT_ALLOWED = 'FILE_TYPE_NOT_ALLOWED',
  FILE_SIZE_EXCEEDED = 'FILE_SIZE_EXCEEDED',
  INVALID_FILE_BUFFER = 'INVALID_FILE_BUFFER',

  // File Access/Retrieval Errors
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  ACCESS_DENIED = 'ACCESS_DENIED',
  FILE_LISTING_FAILED = 'FILE_LISTING_FAILED',
  PRESIGNED_URL_GENERATION_FAILED = 'PRESIGNED_URL_GENERATION_FAILED',

  // MinIO/S3 Specific Errors
  MINIO_CONNECTION_ERROR = 'MINIO_CONNECTION_ERROR',
  BUCKET_NOT_FOUND = 'BUCKET_NOT_FOUND',
  MINIO_API_ERROR = 'MINIO_API_ERROR',

  // System Errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
}

export enum FileErrorMessages {
  // File Upload Messages
  FILE_UPLOAD_FAILED = 'Failed to upload the file. Please try again.',
  FILE_TYPE_NOT_ALLOWED = 'The provided file type is not allowed.',
  FILE_SIZE_EXCEEDED = 'The file size exceeds the maximum allowed limit.',
  INVALID_FILE_BUFFER = 'The file buffer is invalid or corrupted.',

  // File Access/Retrieval Messages
  FILE_NOT_FOUND = 'The requested file could not be found.',
  ACCESS_DENIED = 'You do not have permission to access this file.',
  FILE_LISTING_FAILED = 'Failed to retrieve the list of files.',
  PRESIGNED_URL_GENERATION_FAILED = 'Could not generate a download link for the file.',

  // MinIO/S3 Specific Messages
  MINIO_CONNECTION_ERROR = 'Could not connect to the file storage service.',
  BUCKET_NOT_FOUND = 'The target storage bucket does not exist.',
  MINIO_API_ERROR = 'An error occurred with the file storage service.',

  // System Messages
  INTERNAL_SERVER_ERROR = 'An internal server error occurred in the file service.',
  CONFIGURATION_ERROR = 'File service is not configured correctly.',
}
