import * as borsh from "@project-serum/borsh";
import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";

export class Contract {
  lender: PublicKey;
  borrower: PublicKey;
  item: PublicKey;
  escrow_account: PublicKey;
  expected_amount: number;
  status: number;

  constructor({
    lender,
    borrower,
    item,
    escrow_account,
    expected_amount,
    status,
  }: {
    lender: PublicKey;
    borrower: PublicKey;
    item: PublicKey;
    escrow_account: PublicKey;
    expected_amount: number;
    status: number;
  }) {
    this.lender = lender;
    this.borrower = borrower;
    this.item = item;
    this.escrow_account = escrow_account;
    this.expected_amount = expected_amount;
    this.status = status;
  }

  publicKey(program_id: string): PublicKey {
    return PublicKey.findProgramAddressSync(
      [this.borrower.toBuffer(), this.lender.toBuffer(), this.item.toBuffer()],
      new PublicKey(program_id),
    )[0];
  }

  static borshInstructionSchema = borsh.struct([
    borsh.u8("variant"),
    borsh.u64("deposit"),
  ]);

  static borshAccountSchema = borsh.struct<{
    is_initialized: boolean;
    name: string;
    owner: PublicKey;
    user?: PublicKey;
  }>([
    borsh.publicKey("lender"),
    borsh.publicKey("borrower"),
    borsh.publicKey("item"),
    borsh.publicKey("escrow_account"),
    borsh.u64("expected_amount"),
    borsh.u64("status"),
  ]);

  static serialize(instruction: number, payload?: { amount: number }): Buffer {
    const buffer = Buffer.alloc(1000);
    const optionalPayload = payload
      ? { deposit: new BN(payload.amount, 8, "le") }
      : undefined;
    this.borshInstructionSchema.encode(
      { ...optionalPayload, variant: instruction },
      buffer,
    );
    return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer));
  }

  static deserialize(buffer?: Buffer): Contract | null {
    if (!buffer) {
      return null;
    }

    try {
      const {
        lender,
        borrower,
        item,
        escrow_account,
        expected_amount,
        status,
      } = this.borshAccountSchema.decode(buffer);

      return new Contract({
        lender,
        borrower,
        item,
        escrow_account,
        expected_amount: new BN(expected_amount).toNumber(),
        status: new BN(status).toNumber(),
      });
    } catch (e) {
      // console.log("Deserialization error:", e);
      // console.log(buffer);
      return null;
    }
  }
}
