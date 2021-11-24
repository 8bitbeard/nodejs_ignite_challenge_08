import { AppError } from "../../../../shared/errors/AppError";

export namespace CreateStatementError {
  export class InsufficientFunds extends AppError {
    constructor() {
      super('Insufficient funds', 400);
    }
  }

  export class UserNotFound extends AppError {
    constructor() {
      super('User not found!', 404);
    }
  }
}
