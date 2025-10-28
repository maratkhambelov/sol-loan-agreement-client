import * as borsh from "@project-serum/borsh";
import { PublicKey } from "@solana/web3.js";

export class ContractItem {
  name: string;
  owner: PublicKey;
  user?: PublicKey;

  constructor({
    name,
    owner,
    user,
  }: {
    name: string;
    owner: PublicKey;
    user?: PublicKey;
  }) {
    this.name = name;
    this.owner = owner;
    this.user = user;
  }

  publicKey(program_id: string): PublicKey {
    return PublicKey.findProgramAddressSync(
      [this.owner.toBuffer(), Buffer.from(this.name)],
      new PublicKey(program_id),
    )[0];
  }

  borshInstructionSchema = borsh.struct([
    borsh.u8("variant"),
    borsh.str("name"),
  ]);

  static borshAccountSchema = borsh.struct<{
    is_initialized: boolean;
    name: string;
    owner: PublicKey;
    user?: PublicKey;
  }>([
    borsh.bool("is_initialized"),
    borsh.str("name"),
    borsh.publicKey("owner"),
    borsh.publicKey("user"),
  ]);

  serialize(instruction: number): Buffer {
    const buffer = Buffer.alloc(1000);
    this.borshInstructionSchema.encode(
      { ...this, variant: instruction },
      buffer,
    );
    return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer));
  }

  static deserialize(buffer?: Buffer): ContractItem | null {
    if (!buffer) {
      return null;
    }

    try {
      const { name, owner, user } = this.borshAccountSchema.decode(buffer);
      return new ContractItem({ name, owner, user });
    } catch (e) {
      return null;
    }
  }
}
