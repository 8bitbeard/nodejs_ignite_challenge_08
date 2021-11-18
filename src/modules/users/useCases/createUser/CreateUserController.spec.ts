import { Connection } from "typeorm"

import request from "supertest"

import createConnection from "../../../../database"
import { app } from "../../../../app"

let connection: Connection

describe("Create User Controller", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Unit Test",
      email: "unit.test@example.com",
      password: "1234"
    })

    expect(response.status).toBe(201)
  })

  it("should not be able to create a new user with an already user email", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Unit Test",
      email: "unit.test@example.com",
      password: "1234"
    })

    const response = await request(app).post("/api/v1/users").send({
      name: "Unit Test",
      email: "unit.test@example.com",
      password: "1234"
    })

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      message: 'User already exists'
    })
  })
})
