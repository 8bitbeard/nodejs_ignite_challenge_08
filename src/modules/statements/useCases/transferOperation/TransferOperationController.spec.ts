import {Connection} from "typeorm";

import request from "supertest"

import { app } from "../../../../app"

import createConnection from "../../../../database"

import { v4 as uuidV4 } from "uuid"


let connection: Connection

describe("Transfer Operation Controller", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to create a new transfer statement with a logged user", async () => {
    const userData = {
      name: "Integration Test",
      email: "integration.test@example.com",
      password: "1234"
    }

    const senderUser = {
      name: "Receiver User",
      email: "receiver.user@example.com",
      password: "1234"
    }

    await request(app).post("/api/v1/users").send(userData)
    await request(app).post("/api/v1/users").send(senderUser)

    const receiverUserToken = await request(app).post("/api/v1/sessions").send({
      email: senderUser.email,
      password: senderUser.password
    })

    const { id } = receiverUserToken.body.user

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

    const transferData = {
      amount: 5.25,
      description: "Integration Test Transfer Description"
    }

    const response = await request(app).post("/api/v1/statements/transfers/" + id).send(transferData).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("id")
    expect(response.body).toHaveProperty("sender_id")
    expect(response.body.description).toBe(transferData.description)
    expect(response.body.amount).toBe(transferData.amount)
    expect(response.body.type).toBe("sent_transfer")
    expect(response.body).toHaveProperty("created_at")
    expect(response.body).toHaveProperty("updated_at")
  })

  it("should not be able to transfer an amount bigger than the current account balance", async () => {
    const userData = {
      name: "Integration Test",
      email: "integration.test@example.com",
      password: "1234"
    }

    const senderUser = {
      name: "Receiver User",
      email: "receiver.user@example.com",
      password: "1234"
    }

    await request(app).post("/api/v1/users").send(userData)
    await request(app).post("/api/v1/users").send(senderUser)

    const receiverUserToken = await request(app).post("/api/v1/sessions").send({
      email: senderUser.email,
      password: senderUser.password
    })

    const { id } = receiverUserToken.body.user

    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: userData.email,
      password: userData.password
    })

    const { token } = tokenResponse.body

    const transferData = {
      amount: 150,
      description: "Integration Test Transfer Description"
    }

    const response = await request(app).post("/api/v1/statements/transfers/" + id).send(transferData).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      message: "Insufficient funds"
    })
  })

  it("should not be able create a new transfer statement to an inexistent user", async () => {
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

    const transferData = {
      amount: 150,
      description: "Integration Test Transfer Description"
    }

    const response = await request(app).post("/api/v1/statements/transfers/" + uuidV4()).send(transferData).set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(404)
    expect(response.body).toMatchObject({
      message: "Receiver user not found!"
    })
  })

  it("should not be able to call the transfer statement endpoint unauthenticated", async () => {
    const userData = {
      name: "Integration Test",
      email: "integration.test@example.com",
      password: "1234"
    }

    const senderUser = {
      name: "Receiver User",
      email: "receiver.user@example.com",
      password: "1234"
    }

    await request(app).post("/api/v1/users").send(userData)
    await request(app).post("/api/v1/users").send(senderUser)

    const receiverUserToken = await request(app).post("/api/v1/sessions").send({
      email: senderUser.email,
      password: senderUser.password
    })

    const { id } = receiverUserToken.body.user

    const transferData = {
      amount: 150,
      description: "Integration Test Transfer Description"
    }

    const response = await request(app).post("/api/v1/statements/transfers/" + id).send(transferData)

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      message: "JWT token is missing!"
    })
  })

  // it("should not be able to call the deposit statement endpoint unauthenticated", async () => {
  //   const statementDepositData = {
  //     amount: 10.25,
  //     description: "Integration Test Description"
  //   }
  //   const response = await request(app).get("/api/v1/statements/deposit").set(statementDepositData)

  //   expect(response.status).toBe(401)
  //   expect(response.body).toMatchObject({
  //     message: "JWT token is missing!"
  //   })
  // })

  // it("should not be able to call the withdraw statement endpoint unauthenticated", async () => {
  //   const statementWithdrawData = {
  //     amount: 7.25,
  //     description: "Integration Test Description"
  //   }

  //   const response = await request(app).get("/api/v1/statements/withdraw").set(statementWithdrawData)

  //   expect(response.status).toBe(401)
  //   expect(response.body).toMatchObject({
  //     message: "JWT token is missing!"
  //   })
  // })
})
