import {Connection} from "typeorm";

import request from "supertest"

import { app } from "../../../../app"

import createConnection from "../../../../database"


let connection: Connection

describe("Get Statement Operation Controller", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to get the informations of a deposit statement from the logged user", async () => {
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

    const statementResponse = await request(app).post("/api/v1/statements/deposit").send(statementData).set({
      Authorization: `Bearer ${token}`
    })

    const response = await request(app).get("/api/v1/statements/" + statementResponse.body.id).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(statementResponse.body.id)
    expect(response.body.user_id).toBe(statementResponse.body.user_id)
    expect(response.body.description).toBe(statementResponse.body.description)
    expect(response.body.amount).toBe(statementResponse.body.amount)
    expect(response.body.type).toBe(statementResponse.body.type)
    expect(response.body.created_at).toBe(statementResponse.body.created_at)
    expect(response.body.updated_at).toBe(statementResponse.body.updated_at)
  })

  it("should be able to get the informations of a withdraw statement from the logged user", async () => {
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

    const statementResponse = await request(app).post("/api/v1/statements/withdraw").send(statementData).set({
      Authorization: `Bearer ${token}`
    })

    const response = await request(app).get("/api/v1/statements/" + statementResponse.body.id).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(statementResponse.body.id)
    expect(response.body.user_id).toBe(statementResponse.body.user_id)
    expect(response.body.description).toBe(statementResponse.body.description)
    expect(response.body.amount).toBe(statementResponse.body.amount)
    expect(response.body.type).toBe(statementResponse.body.type)
    expect(response.body.created_at).toBe(statementResponse.body.created_at)
    expect(response.body.updated_at).toBe(statementResponse.body.updated_at)
  })

  it("should not be able to get the informations of a inexistent statement", async () => {
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

    const response = await request(app).get("/api/v1/statements/7d0fed2e-34ce-4024-af11-834b93569d22").set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(404)
    expect(response.body).toMatchObject({
      message: 'Statement not found'
    })
  })

  it("should not be able to get the informations of a statement without beign logged", async () => {
    const response = await request(app).get("/api/v1/statements/7d0fed2e-34ce-4024-af11-834b93569d22")

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      message: 'JWT token is missing!'
    })
  })
})
