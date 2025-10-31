import { promises as fs } from "fs"
import { Client } from "minio"
import { encrypt } from "./utils/encrypt.js"

interface LocalDataRow {
  id: string | number
  verification_code: string
  [key: string]: any
}

interface S3Data {
  client: Client
  bucket: string
  prefix: string
  filesNames: string[]
}

interface UploadedFile {
  _id: string | number
  hash: string
  encrypted_url: string
}

const uploadFiles = async (
  localData: LocalDataRow[],
  localFolder: string,
  s3Data: S3Data,
  crypto_key: string
): Promise<UploadedFile[]> => {
  const { client, bucket, prefix, filesNames } = s3Data

  return new Promise(resolve => {
    const uploadedFiles: UploadedFile[] = []
    let counter = 0
    localData.forEach(async row => {
      const fileName = `${row.id}.pdf`
      const localFilePath = `${localFolder}/${fileName}`

      try {
        if (!filesNames.includes(fileName)) {
          await fs.access(localFilePath)
          const localFile = await fs.readFile(localFilePath)

          // Upload file to MinIO/S3
          const objectName = `${prefix}/${fileName}`
          await client.putObject(bucket, objectName, localFile)

          // Generate presigned URL for download (有效期1小时)
          const url = await client.presignedGetObject(bucket, objectName, 3600)

          uploadedFiles.push({
            _id: row.id,
            hash: `${encrypt("MD5", row.verification_code, crypto_key)}`,
            encrypted_url: `${encrypt("AES", url, crypto_key)}`,
          })
        }
      } catch (error) {
        console.log(`::: S3: Error while uploading file: ${error}`)
      }
      counter++
      if (counter === localData.length) {
        console.log(`::: S3: All files were uploaded.`)
        resolve(uploadedFiles)
      }
    })
  })
}

export default uploadFiles
