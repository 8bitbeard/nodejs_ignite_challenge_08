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

  it("should be able to return the logged user profile data", async () => {
    const userData = {
      name: "Unit Test",
      email: "unit.test@example.com",
      password: "1234"
    }

    await request(app).post("/api/v1/users").send(userData)

    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: userData.email,
      password: userData.password
    })

    const { token } = tokenResponse.body

    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("id")
    expect(response.body.name).toBe(userData.name)
    expect(response.body.email).toBe(userData.email)
    expect(response.body).toHaveProperty("created_at")
    expect(response.body).toHaveProperty("updated_at")
  })

  it("should not be able to call the endpoint unauthenticated", async () => {
    const response = await request(app).get("/api/v1/profile")

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      message: "JWT token is missing!"
    })

  })
})
