// lib/mongodb.ts
import { MongoClient, MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const options: MongoClientOptions = {
  // SSL/TLS configuration - simplified for Windows
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  // Connection pool settings - more conservative
  maxPoolSize: 5,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 0, // No timeout
  connectTimeoutMS: 20000,
  heartbeatFrequencyMS: 10000,
  // Retry settings
  retryWrites: true,
  retryReads: true,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

interface GlobalMongoCache {
  conn?: Promise<MongoClient>;
}

declare const globalThis: {
  mongoCache: GlobalMongoCache;
} & typeof global;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so the connection persists
  if (!globalThis.mongoCache) {
    globalThis.mongoCache = {};
  }

  if (!globalThis.mongoCache.conn) {
    client = new MongoClient(uri, options);
    globalThis.mongoCache.conn = client.connect();
  }
  clientPromise = globalThis.mongoCache.conn;
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
