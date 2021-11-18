import {Connection} from "typeorm";

import request from "supertest"

import { app } from "../../../../app"

import createConnection from "../../../../database"


let connection: Connection

describe("Authenticate User Controller", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to authenticate a user", async () => {
    const userData = {
      name: "Unit Test",
      email: "unit.test@example.com",
      password: "1234"
    }

    await request(app).post("/api/v1/users").send(userData)

    const response = await request(app).post("/api/v1/sessions").send({
      email: userData.email,
      password: userData.password
    })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("token")
  })

  it("should not be able to authenticate an inexistent user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "inexistent.user@example.com",
      password: "1234"
    })

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      message: "Incorrect email or password"
    })
  })

  it("should not be able to authenticate an user with incorrect password", async () => {
    const userData = {
      name: "Unit Test",
      email: "unit.test@example.com",
      password: "1234"
    }

    await request(app).post("/api/v1/users").send(userData)

    const response = await request(app).post("/api/v1/sessions").send({
      email: userData.email,
      password: "incorrect.password"
    })

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      message: "Incorrect email or password"
    })
  })
})
