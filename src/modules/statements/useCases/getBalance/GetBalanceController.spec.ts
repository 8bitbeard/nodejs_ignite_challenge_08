import {Connection} from "typeorm";

import request from "supertest"

import { app } from "../../../../app"

import createConnection from "../../../../database"


let connection: Connection

describe("Create Statement Controller", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to get the balance of the logged in user", async () => {
    const userData = {
      name: "Integration Test",
      email: "integration.test@example.com",
      password: "1234"
    }

    await request(app).post("/api/v1/users").send(userData)

    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: userData.email,
      password: userData.password
    })

    const { token } = tokenResponse.body

    const statementData = {
      amount: 10.25,
      description: "Integration Test Description"
    }

    await request(app).post("/api/v1/statements/deposit").send(statementData).set({
      Authorization: `Bearer ${token}`
    })

    const response = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("statement")
    expect(response.body.statement.length).toBe(1)
    expect(response.body.balance).toBe(statementData.amount)
  })

  it("should not be able to get the balance without informing a token", async () => {
    const response = await request(app).get("/api/v1/statements/balance")

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      message: "JWT token is missing!"
    })
  })
})
