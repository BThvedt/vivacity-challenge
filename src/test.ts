import "./config" // make sure all the env vars are loaded first
import app from "./app"
import request from "supertest"
import { Server } from "http"
import dbClient from "./db"
// import { Applicant } from "./types"
import TypesTI from "./types-ti" // this package provides runtime type checks
import { createCheckers } from "ts-interface-checker"

const { Applicant: isApplicant } = createCheckers(TypesTI)

let server: Server
beforeAll(async () => {
  server = app.listen(4000, async () => {
    try {
      await dbClient.connect()
    } catch {
      console.log("DB could not connect for the tests!")
    }
  })
})

afterAll(async () => {
  await dbClient.end()
  server.close()
})

describe("/awesome/applicante Routes", () => {
  test("emptying database...", async () => {
    const { rows } = await dbClient.query("DELETE FROM users")
    expect(rows).toEqual([])
  })

  test("POST creates applicant if empty", async () => {
    const res = await request(server)
      .post("/awesome/applicant")
      .send({
        firstname: "awesome",
        lastname: "applicant",
        email: "awesome@applicant.com",
        info: "an awesome applicant"
      })
      .set("Content-Type", "application/json")

    expect(res.statusCode).toBe(201)
    expect(res.header["content-type"]).toBe("application/json; charset=utf-8")

    try {
      isApplicant.check(res.body)
    } catch (e) {
      console.error("Response failed type check")
      throw new Error()
    }
  })

  test("POST updates applicant if not empty", async () => {
    const res = await request(server)
      .post("/awesome/applicant")
      .send({
        firstname: "awesome",
        lastname: "applicant two",
        email: "awesome@applicant.com",
        info: "an awesome applicant"
      })
      .set("Content-Type", "application/json")

    expect(res.statusCode).toBe(201)
    expect(res.header["content-type"]).toBe("application/json; charset=utf-8")

    expect(res.body.lastname).toBe("applicant two")

    try {
      isApplicant.check(res.body)
    } catch (e) {
      console.error("Response failed type check")
      throw new Error()
    }
  })

  test("Get retrieves applicant", async () => {
    const res = await request(server).get("/awesome/applicant")

    expect(res.statusCode).toBe(200)
    expect(res.header["content-type"]).toBe("application/json; charset=utf-8")

    try {
      isApplicant.check(res.body)
    } catch (e) {
      console.error("Response failed type check")
      throw new Error()
    }
  })

  test("PUT updates applicant", async () => {
    const updatedInfo = {
      firstname: "awesome updated",
      lastname: "applicant updated",
      email: "awesome@applicanUpdated.com",
      info: "updated"
    }

    const res = await request(server)
      .put("/awesome/applicant")
      .send(updatedInfo)
      .set("Content-Type", "application/json")

    expect(res.statusCode).toBe(201)
    expect(res.header["content-type"]).toBe("application/json; charset=utf-8")

    let { id, created_on, ...restOfResponse } = res.body

    expect(typeof id).toBe("number")
    expect(new Date(created_on).getTime()).not.toBeNaN()

    expect(restOfResponse).toEqual(updatedInfo)
  })

  test("DELETE deletes applicant", async () => {
    const res = await request(server).delete("/awesome/applicant")
    expect(res.statusCode).toBe(200)

    const { rows } = await dbClient.query("SELECT * FROM users")
    expect(rows).toEqual([])
  })

  test("Put fails when database is empty", async () => {
    const updatedInfo = {
      firstname: "this should fail",
      lastname: "this should fail",
      email: "email@email.com",
      info: "this should fail"
    }

    const res = await request(server)
      .put("/awesome/applicant")
      .send(updatedInfo)
      .set("Content-Type", "application/json")

    expect(res.statusCode).toBe(500)
  })
})
