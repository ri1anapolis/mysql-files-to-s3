import { exec } from "child_process"

const deleteLocalFiles = async (
  localFolder: string,
  fileExtension: string
): Promise<void> => {
  const illegalPaths =
    /^\/(bin|boot|dev|etc|home|lib|lib64|media|mnt|opt|proc|root|run|sbin|sys|usr|var)?(\/)?$/

  if (localFolder.match(illegalPaths))
    throw Error(`::: Application: WARNING => Illegal path to remove files.`)

  try {
    await exec(`rm ${localFolder}/*.${fileExtension}`)
    console.log(
      `::: Application: Removed all ${fileExtension.toUpperCase()} files.`
    )
  } catch (error) {
    // do nothing
  }
}

export default deleteLocalFiles
