import {InMemoryUsersRepository} from "../../repositories/in-memory/InMemoryUsersRepository"
import {CreateUserUseCase} from "../createUser/CreateUserUseCase"
import {ShowUserProfileError} from "./ShowUserProfileError"
import {ShowUserProfileUseCase} from "./ShowUserProfileUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository
let showUserProfileUseCase: ShowUserProfileUseCase
let createUserUseCase: CreateUserUseCase

describe("Show User Profile Use Case", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository)
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })

  it("should be able to return the user profile data", async () => {
    const userData = {
      name: "Unit Test",
      email: "unit.test@example.com",
      password: "1234"
    }
    const user = await createUserUseCase.execute(userData)

    const profile = await showUserProfileUseCase.execute(user.id as string)

    expect(profile).toHaveProperty("id")
    expect(profile).toHaveProperty("name")
    expect(profile).toHaveProperty("email")

  })

  it("should not be able to return the user profile data for an inexistent user", async () => {
    expect(async() => {
      await showUserProfileUseCase.execute("123455")
    }).rejects.toBeInstanceOf(ShowUserProfileError)

  })
})
