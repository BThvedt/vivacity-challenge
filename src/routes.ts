import { Router } from "express"
import dbClient from "./db"
import { Applicant } from "./types"

const router = Router()

router.get("/helloWorld", async (req, res) => {
  res.send("Hello World")
})

router.get("/awesome/applicant", async (req, res) => {
  try {
    // there should only be 1 "user" I could use limit 1 here but .. there's only 1 anyway
    const { rows } = await dbClient.query("SELECT * FROM users")

    if (rows[0]) {
      res.status(200).json(rows[0])
    } else {
      res.send("The awesome applicant does not exist in the database!")
    }
  } catch (e) {
    console.log("THERE IS AN ERROR !!! ")
    console.error(e)

    res.status(500).send("Something went wrong getting the awesome applicant")
  }
})

router.post("/awesome/applicant", async (req, res) => {
  let { firstname, lastname, email, info } = req.body

  // I would  use some more sophisticated validation in a real project
  if (!firstname || !lastname || !email || !info) {
    res
      .status(500)
      .send({ error: "Need a firstname, lastname, email, and info" })
  }

  try {
    // should only be one record in the database
    const { rows } = await dbClient.query("SELECT * FROM users")

    if (rows[0]) {
      const { id } = rows[0]

      // don't have to set created on
      const query =
        "UPDATE users SET firstname = $1, lastname = $2, email = $3, info = $4 WHERE id = $5 RETURNING *"

      const { rows: updatedRows } = await dbClient.query(query, [
        firstname,
        lastname,
        email,
        info,
        id
      ])

      res.status(201).json(updatedRows[0])
    } else {
      const now = new Date()
      const query =
        "INSERT INTO users (firstname, lastname, email, created_on, info) VALUES ($1, $2, $3, $4, $5) RETURNING *"
      const { rows } = await dbClient.query(query, [
        firstname,
        lastname,
        email,
        now,
        info
      ])
      res.status(201).json(rows[0])
    }
  } catch (e) {
    console.error(e)
    res.status(500).send("Something went wrong creating the user")
  }
})

router.put("/awesome/applicant", async (req, res) => {
  try {
    let { firstname, lastname, email, info } = req.body

    const { rows }: { rows: Applicant[] } = await dbClient.query(
      "SELECT * FROM users"
    )

    if (rows[0]) {
      const { id } = rows[0]

      let updatedInfo = { ...rows[0], firstname, lastname, email, info }

      const query =
        "UPDATE users SET firstname = ($1), lastname = ($2), email = ($3), info = ($4) WHERE id = ($5) RETURNING *"

      let { rows: updateedRows } = await dbClient.query(query, [
        updatedInfo.firstname,
        updatedInfo.lastname,
        updatedInfo.email,
        updatedInfo.info,
        id
      ])

      res.status(201).json(updateedRows[0])
    } else {
      res
        .status(500)
        .send(
          "Cannot update the awesome applicant, they do not exist in the database!"
        )
    }
  } catch (e) {
    console.error(e)
    res.status(500).send("Something went wrong updating the awesome applicant")
  }
})

// works!
router.delete("/awesome/applicant", async (req, res) => {
  try {
    const query = "DELETE FROM users"
    await dbClient.query(query)

    res.status(200).send("User Deleted!")
  } catch (e) {
    console.error(e)
    res.status(500).send("Something went deleting the awesome applicant")
  }
})

export default router
