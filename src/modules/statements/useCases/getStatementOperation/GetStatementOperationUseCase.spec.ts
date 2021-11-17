import {InMemoryUsersRepository} from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import {CreateUserUseCase} from "../../../users/useCases/createUser/CreateUserUseCase"
import {InMemoryStatementsRepository} from "../../repositories/in-memory/InMemoryStatementsRepository"
import {CreateStatementUseCase} from "../createStatement/CreateStatementUseCase"
import {GetStatementOperationError} from "./GetStatementOperationError"
import {GetStatementOperationUseCase} from "./GetStatementOperationUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryStatementsRepository: InMemoryStatementsRepository
let getStatementOperationUseCase: GetStatementOperationUseCase
let createUserUseCase: CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Statement Operation UseCase", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
  })

  it("should be able to get the informations of a given statement", async () => {
    const userData = {
      name: "Unit Test",
      email: "unit.test@example.com",
      password: "1234"
    }

    const user = await createUserUseCase.execute(userData)
    const user_id = user.id as string

    const statementData = {
      user_id,
      type: 'deposit' as OperationType,
      amount: 5.29,
      description: "Test Deposit"
    }

    const statement = await createStatementUseCase.execute(statementData)
    const statement_id = statement.id as string;

    const statementInfo = await getStatementOperationUseCase.execute({ user_id, statement_id })

    expect(statementInfo.id).toBe(statement.id)
    expect(statementInfo.user_id).toBe(user.id)
    expect(statementInfo.type).toBe(statement.type)
    expect(statementInfo.amount).toBe(statement.amount)
    expect(statementInfo.description).toBe(statement.description)
  })

  it("should not be able to get the informations of a statement for a inexistent user", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({ user_id: "1234", statement_id: "1234" })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

  it("should not be able to get the informations of an inexistent statement", async () => {
    const userData = {
      name: "Unit Test",
      email: "unit.test@example.com",
      password: "1234"
    }

    const user = await createUserUseCase.execute(userData)
    const user_id = user.id as string

    expect(async () => {
      await getStatementOperationUseCase.execute({ user_id, statement_id: "1234" })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
})
