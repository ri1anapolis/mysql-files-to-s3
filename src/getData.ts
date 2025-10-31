import mysql, { FieldPacket } from "mysql2/promise"

interface ConnectionParameters {
  database: string
  host: string
  [key: string]: any
}

interface QueryResult {
  rows: any[]
  fields: FieldPacket[]
  error: any
}

async function getData({
  query,
  connectionParameters,
}: {
  query: string
  connectionParameters: ConnectionParameters
}): Promise<QueryResult | undefined> {
  const { database, host } = connectionParameters
  try {
    const connection = await mysql.createConnection(connectionParameters)
    console.log(`::: MySQL: Connected to server "${host}"!`)

    const [rows, fields] = (await connection.execute(query)) as [
      any[],
      FieldPacket[]
    ]
    console.log(
      `::: MySQL: Collected ${rows.length} items from the "${database}" database!`
    )

    return { rows, fields, error: null }
  } catch (error) {
    console.error(`::: MySQL: ERROR => ${error}`)
    return { rows: [], fields: [], error }
  } finally {
    console.log(`::: MySQL: Disconnected from server "${host}"!`)
  }
}

export default getData
