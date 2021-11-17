import {InMemoryUsersRepository} from "../../repositories/in-memory/InMemoryUsersRepository"
import {CreateUserError} from "./CreateUserError"
import {CreateUserUseCase} from "./CreateUserUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase

describe("Create User Use Case", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })

  it("should be able to create a new user", async () => {
    const userData = {
      name: "Unit Test",
      email: "unit.test@example.com",
      password: "1234"
    }

    const user = await createUserUseCase.execute(userData)

    expect(user).toHaveProperty("id")
  })

  it("should not be able to create a new user with an already used e-mail", async() => {
    const userData = {
      name: "Unit Test",
      email: "unit.test@example.com",
      password: "1234"
    }
    await createUserUseCase.execute(userData)

    expect(async() => {
      await createUserUseCase.execute(userData)
    }).rejects.toBeInstanceOf(CreateUserError)
  })
})
