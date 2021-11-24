import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement } from "../../entities/Statement";
import { OperationType } from "../../enums/OperationType";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { ITransferOperationDTO } from "./ITransferOperationDTO";
import { CreateStatementError } from "./TransferOperationError";


@injectable()
class TransferOperationUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ user_id, receiver_id, amount, description }: ITransferOperationDTO ): Promise<Statement> {
    const senderUser = await this.usersRepository.findById(user_id);

    if(!senderUser) {
      throw new CreateStatementError.UserNotFound();
    }

    const receiverUser = await this.usersRepository.findById(receiver_id as string);

    if(!receiverUser) {
      throw new CreateStatementError.UserNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({ user_id })

    if(amount > balance) {
      throw new CreateStatementError.InsufficientFunds();
    }

    await this.statementsRepository.create({
      user_id: receiver_id as string,
      type: "received_transfer" as OperationType,
      amount,
      description
    });

    const statementOperation = await this.statementsRepository.create({
      user_id,
      type: "sent_transfer" as OperationType,
      amount,
      description
    });

    return statementOperation;
  }

}

export { TransferOperationUseCase }
