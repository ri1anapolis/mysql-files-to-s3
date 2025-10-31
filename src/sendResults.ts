import { MongoClient } from "mongodb"

interface MongoConfig {
  db: string
  collection: string
  connectionParameters: {
    uri: string
    options: any
  }
}

interface DataToProcess {
  _id: string | number
  [key: string]: any
}

async function sendResults(
  dataToAdd: DataToProcess[] | null,
  dataToDelete: (string | number)[] | null,
  mongo: MongoConfig
): Promise<void> {
  const qtyToAdd = !!dataToAdd ? dataToAdd.length : 0
  const qtyToDelete = !!dataToDelete ? dataToDelete.length : 0

  if (qtyToAdd === 0 && qtyToDelete === 0) {
    console.log(`::: Application: No data to send to MongoDB!`)
    return
  }

  const { db, collection, connectionParameters } = mongo
  const { uri, options } = connectionParameters
  const client = new MongoClient(uri, options)

  try {
    await client.connect()
    console.log(`::: MongoDB: Connected to server!`)

    if (qtyToDelete > 0 && dataToDelete) {
      await client
        .db(db)
        .collection(collection)
        .deleteMany({ _id: { $in: dataToDelete } } as any)
      console.log(
        `::: MongoDB: Deleted ${dataToDelete.length} items from "${collection}" collection on "${db}" database!`
      )
    }

    if (qtyToAdd > 0 && dataToAdd) {
      await client
        .db(db)
        .collection(collection)
        .insertMany(dataToAdd as any, { ordered: false })
      console.log(
        `::: MongoDB: Inserted ${dataToAdd.length} items into "${collection}" collection on "${db}" database!`
      )
    }
  } catch (error) {
    console.error(`::: MongoDB: ERROR => ${error}`)
  } finally {
    await client.close()
    console.log(`::: MongoDB: Disconnected from server!`)
  }
}

export default sendResults
