// frontend/lib/mongodb.ts
import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI!
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!uri) {
    throw new Error("Please add MONGODB_URI to .env.local")
}

if (process.env.NODE_ENV === "development") {
    // In development, use a global variable to preserve connection across hot reloads
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options)
        global._mongoClientPromise = client.connect()
    }
    clientPromise = global._mongoClientPromise
} else {
    // In production, create a new connection
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
}

export default clientPromise
