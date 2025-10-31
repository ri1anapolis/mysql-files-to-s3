import { Client } from "minio"

interface S3Config {
  fileRetention: number
  defaultPrefix: string
  [key: string]: any
}

interface S3ServiceAccount {
  uri: string
  user: string
  password: string
  bucket: string
}

interface S3File {
  name: string
  lastModified: string | undefined
  size: number | undefined
}

interface S3Data {
  retention: number
  prefix: string
  client: Client
  bucket: string
  files: S3File[]
  filesNames: string[]
}

const s3Data = async (
  s3Config: S3Config,
  s3ServiceAccount: S3ServiceAccount
): Promise<S3Data> => {
  const { fileRetention, defaultPrefix } = s3Config
  const { uri, user, password, bucket } = s3ServiceAccount

  try {
    // Parse MinIO endpoint from URI
    const endpoint = uri.replace(/^https?:\/\//, "")

    // Initialize MinIO client
    const client = new Client({
      endPoint: endpoint,
      port: 443,
      useSSL: true,
      accessKey: user,
      secretKey: password,
    })

    const data: S3Data = {} as S3Data
    data.retention = fileRetention
    data.prefix = defaultPrefix
    data.client = client
    data.bucket = bucket

    // List objects in the bucket with prefix
    const stream = client.listObjectsV2(bucket, defaultPrefix, true, "")
    const files: S3File[] = []

    return new Promise((resolve, reject) => {
      stream.on("data", obj => {
        if (obj.name) {
          files.push({
            name: obj.name.replace(`${defaultPrefix}/`, ""),
            lastModified: obj.lastModified?.toISOString(),
            size: obj.size,
          })
        }
      })

      stream.on("end", () => {
        data.files = files
        data.filesNames = files.map(file => file.name)
        resolve(data)
      })

      stream.on("error", error => {
        console.log(
          `::: S3: ERROR => Error listing objects: ${JSON.stringify(error)}`
        )
        reject(error)
      })
    })
  } catch (error) {
    console.log(
      `::: S3: ERROR => Error initializing S3 client: ${JSON.stringify(error)}`
    )
    throw error
  }
}

export default s3Data
