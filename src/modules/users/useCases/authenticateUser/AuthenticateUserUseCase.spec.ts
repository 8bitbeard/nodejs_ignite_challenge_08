import {InMemoryUsersRepository} from "../../repositories/in-memory/InMemoryUsersRepository"
import {CreateUserUseCase} from "../createUser/CreateUserUseCase"
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import {IncorrectEmailOrPasswordError} from "./IncorrectEmailOrPasswordError"

let inMemoryUsersRepository: InMemoryUsersRepository
let authenticateUserUseCase: AuthenticateUserUseCase
let createUserUseCase: CreateUserUseCase

describe("Authenticate User Use Case", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })

  it("should be able to authenticate a existing user", async () => {
    const userData = {
      name: "Unit Test",
      email: "unit.test@example.com",
      password: "1234"
    }

    const user = await createUserUseCase.execute(userData)

    const session = await authenticateUserUseCase.execute({
      email: userData.email,
      password: userData.password
    })

    expect(session).toHaveProperty("user")
    expect(session).toHaveProperty("token")
    expect(session.user.id).toBe(user.id)
    expect(session.user.name).toBe(user.name)
    expect(session.user.email).toBe(user.email)

  })

  it("should not be able to authenticate an inexistent user", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "inexistent@example.com",
        password: "1234"
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it("should not be able to authenticate a user with incorrect password", async () => {
    const userData = {
      name: "Unit Test",
      email: "unit.test@example.com",
      password: "1234"
    }

    await createUserUseCase.execute(userData)

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: userData.email,
        password: "4321"
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})
