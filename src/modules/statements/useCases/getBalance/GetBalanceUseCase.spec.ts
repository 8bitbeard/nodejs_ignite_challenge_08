import {InMemoryUsersRepository} from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import {CreateUserUseCase} from "../../../users/useCases/createUser/CreateUserUseCase"
import {InMemoryStatementsRepository} from "../../repositories/in-memory/InMemoryStatementsRepository"
import {GetBalanceError} from "./GetBalanceError"
import {GetBalanceUseCase} from "./GetBalanceUseCase"

let inMemoryStatementsRepository: InMemoryStatementsRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let getBalanceUseCase: GetBalanceUseCase
let createUserUseCase: CreateUserUseCase

describe("Get Balance Use Case", () => {

  beforeEach(async() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository()
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository)
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })

  it("should be able to return the balance and all the operations done by a user", async () => {
    const userData = {
      name: "Unit Test",
      email: "unit.test@example.com",
      password: "1234"
    }
    const user = await createUserUseCase.execute(userData)
    const user_id = user.id as string

    const userBalance = await getBalanceUseCase.execute({ user_id })

    expect(userBalance).toHaveProperty("statement")
    expect(userBalance).toHaveProperty("balance")

  })

  it("should not be able to return the balance and all the operations done by an inexistent user", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "123456" })
    }).rejects.toBeInstanceOf(GetBalanceError)
  })
})

