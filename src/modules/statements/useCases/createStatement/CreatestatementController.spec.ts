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

  it("should be able to create a new deposit statement with a logged user", async () => {
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

    const response = await request(app).post("/api/v1/statements/deposit").send(statementData).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("id")
    expect(response.body).toHaveProperty("user_id")
    expect(response.body.description).toBe(statementData.description)
    expect(response.body.amount).toBe(statementData.amount)
    expect(response.body.type).toBe("deposit")
    expect(response.body).toHaveProperty("created_at")
    expect(response.body).toHaveProperty("updated_at")
  })

  it("should be able to create a new withdraw statement with a logged user", async () => {
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

    const statementDepositData = {
      amount: 10.25,
      description: "Integration Test Description"
    }

    const statementWithdrawData = {
      amount: 7.25,
      description: "Integration Test Description"
    }

    await request(app).post("/api/v1/statements/deposit").send(statementDepositData).set({
      Authorization: `Bearer ${token}`
    })

    const response = await request(app).post("/api/v1/statements/withdraw").send(statementWithdrawData).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("id")
    expect(response.body).toHaveProperty("user_id")
    expect(response.body.description).toBe(statementWithdrawData.description)
    expect(response.body.amount).toBe(statementWithdrawData.amount)
    expect(response.body.type).toBe("withdraw")
    expect(response.body).toHaveProperty("created_at")
    expect(response.body).toHaveProperty("updated_at")
  })

  it("should not be able to withdraw an amount bigger than the current account balance", async () => {
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

    const statementWithdrawData = {
      amount: 150.00,
      description: "Integration Test Description"
    }

    const response = await request(app).post("/api/v1/statements/withdraw").send(statementWithdrawData).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      message: "Insufficient funds"
    })
  })

  it("should not be able to call the deposit statement endpoint unauthenticated", async () => {
    const statementDepositData = {
      amount: 10.25,
      description: "Integration Test Description"
    }
    const response = await request(app).get("/api/v1/statements/deposit").set(statementDepositData)

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      message: "JWT token is missing!"
    })
  })

  it("should not be able to call the withdraw statement endpoint unauthenticated", async () => {
    const statementWithdrawData = {
      amount: 7.25,
      description: "Integration Test Description"
    }

    const response = await request(app).get("/api/v1/statements/withdraw").set(statementWithdrawData)

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      message: "JWT token is missing!"
    })
  })
})
