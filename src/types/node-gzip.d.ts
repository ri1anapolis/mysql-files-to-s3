declare module "node-gzip" {
  export function ungzip(data: Buffer | Uint8Array): Promise<string>
}
