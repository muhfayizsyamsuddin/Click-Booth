// import { MongoClient } from "mongodb";
// const uri = process.env.DATABASE_URI as string;

// const client = new MongoClient(uri);

// export const database = client.db("click-booth");


// DOCKER COMPOSE
import { MongoClient } from "mongodb";

// Berikan string koneksi tiruan (fallback) agar Next.js tidak mengamuk saat di-build Docker
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/fake-db-for-build";
const dbName = process.env.MONGODB_DB_NAME || "click-booth-db";

const client = new MongoClient(uri);

// Ini akan tetap mengekspor variabel yang sama persis seperti kodingan lama Anda
export const database = client.db(dbName);