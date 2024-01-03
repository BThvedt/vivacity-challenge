import { Client } from "pg"

const dbClient = new Client({
  host: process.env.HOST,
  port: +process.env.DB_PORT!,
  database: process.env.DB,
  user: process.env.DB_USER,
  password: process.env.DB_PASS
})

export default dbClient
