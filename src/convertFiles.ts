import { exec } from "child_process"

const convertFiles = async (localFolder: string): Promise<void> => {
  const { stdout: converter, stderr: noConverter } = await exec(`which soffice`)

  if (noConverter) throw Error(`Could not find LibreOffice!`)

  if (!converter) throw Error(`Could not find LibreOffice converter path!`)
  const converterPath = converter.toString().trim()

  try {
    const { stderr: conversionErr } = await exec(
      `${converterPath} --headless --convert-to pdf --outdir ${localFolder} ${localFolder}/*.rtf`
    )
    console.log(`::: Application: Generated PDF files.`)

    if (conversionErr)
      console.log(
        `::: Application: WARNING => File Conversion: ${conversionErr
          .toString()
          .trim()}`
      )
  } catch (error) {
    /* do nothing */
  }
}

export default convertFiles
