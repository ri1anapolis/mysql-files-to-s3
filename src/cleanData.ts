import rtfHeader from "./utils/rtfHeaderRaw.js"

const cleanData = (_buffer_: Buffer): string => {
  // The RTF files got from database not work well on linux!
  // They have some charset problems because the RTF version.
  // As I could not convert these files to any newer/compatible RTF version
  //   I needed to make some hacks to assure the file will open nicely!
  // The hacks are:
  //   1. remove all images, because it causing problems with the charset;
  //   2. remove some tags were causing some format problems to the text;
  //   3. insert a compatible header.
  // These hacks are intended only to this use case, so you may need change
  //   them as necessary to fit other use cases!
  return `${rtfHeader}${_buffer_
    .toString()
    .replace(/\\bin([\s\S\n]*?)\\par/g, "")
    .replace(/{\\pict.*/g, "")
    .replace(/\{?\\(listlevel)([\s\S\n]*?)\}\}/g, "")
    .replace(/\{\\\*\\fldrslt([\s\S\n]*?)\}\}/g, "")
    .replace(/\\(f[1-9]|(cl)?cbpat[0-9]{2}|cf[0-9]+)/g, `\\f0`)
    .replace(/\\listid.*/g, "")
    .replace(/\{\\rtf.*/, "")}`
}

export default cleanData
