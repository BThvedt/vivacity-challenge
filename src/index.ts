import "./config" // make sure all the env vars are loaded first
import dbClient from "./db"
import app from "./app"

const port = process.env.PORT || 3000

const server = app.listen(port, async () => {
  try {
    await dbClient.connect() // test connection
    console.log(
      `[server]: Server is running at http://localhost:${port} and database is connected`
    )
  } catch (e) {
    console.log("There was an error connecting to the database")
  }
})

process.on("SIGINT", async () => {
  console.log("SIGINT: Connection closed, server shutting down.")
  await dbClient.end()
  server.close()
})
