import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { TransferOperationError } from "../transferOperation/TransferOperationError"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { OperationType } from "../../enums/OperationType"
import { TransferOperationUseCase } from "./TransferOperationUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryStatementsRepository: InMemoryStatementsRepository
let createUserUseCase: CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase
let transferOperationUseCase: TransferOperationUseCase

describe("Transfer Operation UseCase", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
    transferOperationUseCase = new TransferOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
  })

  it("should be able to create a new transfer transaction", async () => {
    const userSenderData = {
      name: "Sender User Test",
      email: "sender.user@example.com",
      password: "1234"
    }

    const userReceiverData = {
      name: "Receiver User Test",
      email: "receiver.user@example.com",
      password: "1234"
    }

    const senderUser = await createUserUseCase.execute(userSenderData)
    const receiverUser = await createUserUseCase.execute(userReceiverData)
    const sender_user_id = senderUser.id as string
    const receiver_user_id = receiverUser.id as string

    const depositData = {
      user_id: sender_user_id,
      type: 'deposit' as OperationType,
      amount: 15.29,
      description: "Test Deposit"
    }

    const transferData = {
      user_id: sender_user_id,
      receiver_id: receiver_user_id,
      amount: 5.29,
      description: "Test Transfer"
    }

    await createStatementUseCase.execute(depositData)
    const transferStatement = await transferOperationUseCase.execute(transferData)

    expect(transferStatement).toHaveProperty("id")
    expect(transferStatement.user_id).toBe(transferData.user_id)
    expect(transferStatement.type).toBe("sent_transfer")
    expect(transferStatement.amount).toBe(transferData.amount)
    expect(transferStatement.description).toBe(transferData.description)
  })

  it("should not e able to create a new transfer with an inexitent user", () => {
    const transferData = {
      user_id: "123123",
      receiver_id: "1231234",
      amount: 5.29,
      description: "Test Transfer"
    }

    expect(async () => {
      await transferOperationUseCase.execute(transferData)
    }).rejects.toBeInstanceOf(TransferOperationError.SenderUserNotFound)
  })

  it("should not e able to create a new transfer to an inexitent user", async () => {
    const userSenderData = {
      name: "Sender User Test",
      email: "sender.user@example.com",
      password: "1234"
    }

    const senderUser = await createUserUseCase.execute(userSenderData)
    const sender_user_id = senderUser.id as string

    const depositData = {
      user_id: sender_user_id,
      type: 'deposit' as OperationType,
      amount: 5.29,
      description: "Test Deposit"
    }

    const transferData = {
      user_id: sender_user_id,
      receiver_id: "123456",
      amount: 15.29,
      description: "Test Transfer"
    }

    await createStatementUseCase.execute(depositData)

    expect(async () => {
      await transferOperationUseCase.execute(transferData)
    }).rejects.toBeInstanceOf(TransferOperationError.ReceiverUserNotFound)
  })

  it("should not be able to create a new transfer with an bigger value than the actual balance", async () => {
    const userSenderData = {
      name: "Sender User Test",
      email: "sender.user@example.com",
      password: "1234"
    }

    const userReceiverData = {
      name: "Receiver User Test",
      email: "receiver.user@example.com",
      password: "1234"
    }

    const senderUser = await createUserUseCase.execute(userSenderData)
    const receiverUser = await createUserUseCase.execute(userReceiverData)
    const sender_user_id = senderUser.id as string
    const receiver_user_id = receiverUser.id as string

    const depositData = {
      user_id: sender_user_id,
      type: 'deposit' as OperationType,
      amount: 5.29,
      description: "Test Deposit"
    }

    const transferData = {
      user_id: sender_user_id,
      receiver_id: receiver_user_id,
      amount: 15.29,
      description: "Test Transfer"
    }

    await createStatementUseCase.execute(depositData)

    expect(async () => {
      await transferOperationUseCase.execute(transferData)
    }).rejects.toBeInstanceOf(TransferOperationError.InsufficientFunds)
  })
})

