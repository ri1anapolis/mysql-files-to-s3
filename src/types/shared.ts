/**
 * Shared type definitions for the application
 */

// Data types
export interface LocalDataRow {
  id: string | number
  file: Uint8Array | Buffer
  verification_code: string
  [key: string]: string | number | Buffer | Uint8Array | undefined
}

export interface UploadedFile {
  _id: string | number
  hash: string
  encrypted_url: string
}
