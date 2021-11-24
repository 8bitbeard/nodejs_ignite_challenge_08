interface ITransferOperationDTO {
  user_id: string;
  description: string;
  amount: number;
  receiver_id?: string;
}

export { ITransferOperationDTO }
