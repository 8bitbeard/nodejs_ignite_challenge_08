import {InMemoryUsersRepository} from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import {CreateUserUseCase} from "../../../users/useCases/createUser/CreateUserUseCase"
import {InMemoryStatementsRepository} from "../../repositories/in-memory/InMemoryStatementsRepository"
import {CreateStatementError} from "./CreateStatementError"
import {CreateStatementUseCase} from "./CreateStatementUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryStatementsRepository: InMemoryStatementsRepository
let createUserUseCase: CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Create Statement UseCase", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
  })

  it("should be able to create a new deposit transaction", async () => {
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
      amount: 15.29,
      description: "Test Deposit"
    }

    const statement = await createStatementUseCase.execute(statementData)

    expect(statement).toHaveProperty("id")
    expect(statement.user_id).toBe(statementData.user_id)
    expect(statement.type).toBe(statementData.type)
    expect(statement.amount).toBe(statementData.amount)
    expect(statement.description).toBe(statementData.description)
  })

  it("should not e able to create a new deposit with an inexitent user", () => {
    const statementData = {
      user_id: "12345",
      type: 'deposit' as OperationType,
      amount: 15.29,
      description: "Test Deposit"
    }

    expect(async () => {
      await createStatementUseCase.execute(statementData)
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it("should be able to create a new withdraw transaction", async () => {
    const userData = {
      name: "Unit Test",
      email: "unit.test@example.com",
      password: "1234"
    }

    const user = await createUserUseCase.execute(userData)
    const user_id = user.id as string

    const statementData = {
      user_id,
      type: 'withdraw' as OperationType,
      amount: 5.29,
      description: "Test Withdraw"
    }

    await createStatementUseCase.execute({
      ...statementData,
      type: 'deposit' as OperationType,
      amount: 10.29
    })
    const statement = await createStatementUseCase.execute(statementData)

    expect(statement).toHaveProperty("id")
    expect(statement.user_id).toBe(statementData.user_id)
    expect(statement.type).toBe(statementData.type)
    expect(statement.amount).toBe(statementData.amount)
    expect(statement.description).toBe(statementData.description)
  })

  it("should not be able to create a new withdraw transaction with an bigger value than the actual balance", async () => {
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
      amount: 15.29,
      description: "Test Withdraw"
    }

    await createStatementUseCase.execute(statementData)

    expect(async () => {
      await createStatementUseCase.execute({
        ...statementData,
        type: 'withdraw' as OperationType,
        amount: 20.29
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
})

