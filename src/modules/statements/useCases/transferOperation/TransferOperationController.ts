import { Request, Response } from "express";
import {container} from "tsyringe";
import { TransferMap } from "../../mappers/TransferMap";
import {TransferOperationUseCase} from "./TransferOperationUseCase";

class TransferOperationController {

  async execute(request: Request, response: Response): Promise<Response> {

    const { user_id: receiver_id } = request.params;
    const { id: user_id } = request.user;
    const { amount, description } = request.body;

    const transferOperationUseCase = container.resolve(TransferOperationUseCase)

    const statement = await transferOperationUseCase.execute({
      user_id,
      receiver_id,
      amount,
      description
    });

    const statementDTO = TransferMap.toDTO(statement);

    return response.status(201).json(statementDTO);

  }

}

export { TransferOperationController }
