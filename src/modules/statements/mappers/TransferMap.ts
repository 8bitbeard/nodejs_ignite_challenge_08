import { Statement } from "../entities/Statement";

export class TransferMap {
  static toDTO({ id, user_id, amount, description, type, created_at, updated_at }: Statement) {
    return {
      id,
      sender_id: user_id,
      amount: Number(amount),
      description,
      type,
      created_at,
      updated_at
    }
  }
}
