import { Client } from "minio"
import { daysBetweenDates } from "./utils/daysBetweenDates.js"
import { LocalDataRow } from "./types/shared.js"
import { S3Data } from "./s3Data.js"

/**
 * Service for managing remote file retention policies
 * Handles deletion of outdated files based on retention rules
 */

/**
 * Determines if a file should be deleted based on retention policy
 */
interface FileDeletionRule {
  isOutdated: boolean
  isNotInLocal: boolean
}

/**
 * Processes individual file for potential deletion
 */
class FileRetentionProcessor {
  private readonly localFiles: Set<string>
  private readonly retentionDays: number
  private readonly prefix: string
  private readonly client: Client
  private readonly bucket: string

  constructor(
    localData: LocalDataRow[],
    retentionDays: number,
    prefix: string,
    client: Client,
    bucket: string
  ) {
    this.localFiles = new Set(localData.map(row => `${row.id}.pdf`))
    this.retentionDays = retentionDays
    this.prefix = prefix
    this.client = client
    this.bucket = bucket
  }

  /**
   * Check if file meets deletion criteria
   */
  private async evaluateDeletionCriteria(file: {
    name: string
    lastModified: string | undefined
    size: number | undefined
  }): Promise<FileDeletionRule> {
    const isOutdated = await this.checkFileAge(file)
    const isNotInLocal = !this.localFiles.has(file.name)

    return { isOutdated, isNotInLocal }
  }

  /**
   * Extract file ID from filename
   */
  private extractFileId(fileName: string): string | null {
    const match = fileName.match(/^([a-zA-Z0-9_]+)\.(pdf|rtf)$/)
    return match ? match[1] || null : null
  }

  /**
   * Check if file is older than retention period
   */
  private async checkFileAge(file: {
    name: string
    lastModified: string | undefined
  }): Promise<boolean> {
    try {
      if (!file.lastModified) return false

      const dateStr = file.lastModified.split("T")[0]
      if (!dateStr) return false

      const fileDate = new Date(dateStr).getTime()
      const now = Date.now()
      const daysOld = daysBetweenDates(now, fileDate)

      return daysOld >= this.retentionDays
    } catch (error) {
      console.warn(`Failed to check age for file ${file.name}:`, error)
      return false
    }
  }

  /**
   * Delete file and return its ID if successful
   */
  private async deleteFile(file: { name: string }): Promise<string | null> {
    try {
      const objectName = `${this.prefix}/${file.name}`
      await this.client.removeObject(this.bucket, objectName)
      console.log(
        `::: S3: The "${objectName}" file was removed from cloud storage.`
      )
      return this.extractFileId(file.name)
    } catch (error) {
      console.warn(`Failed to delete file ${file.name}:`, error)
      return null
    }
  }

  /**
   * Process single file for retention check
   */
  async processFile(file: {
    name: string
    lastModified: string | undefined
    size: number | undefined
  }): Promise<string | null> {
    const { isOutdated, isNotInLocal } = await this.evaluateDeletionCriteria(
      file
    )

    // File should be deleted if it's outdated AND not in local data
    if (isOutdated && isNotInLocal) {
      return await this.deleteFile(file)
    }

    return null
  }
}

/**
 * Main retention processing function
 */
const remoteFileRetention = async (
  localData: LocalDataRow[],
  s3Data: S3Data
): Promise<string[]> => {
  const { retention, prefix, files, client, bucket } = s3Data
  const processor = new FileRetentionProcessor(
    localData,
    retention,
    prefix,
    client,
    bucket
  )

  // Process all files in parallel for better performance
  const deletionResults = await Promise.all(
    files.map(file => processor.processFile(file))
  )

  // Filter and return only successful deletions
  return deletionResults.filter((id): id is string => !!id && id.length > 0)
}

export default remoteFileRetention
