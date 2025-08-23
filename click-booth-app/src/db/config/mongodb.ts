import { MongoClient } from "mongodb";
const uri = process.env.DATABASE_URI as string;

console.log(uri);

const client = new MongoClient(uri);

export const database = client.db("click-booth");
