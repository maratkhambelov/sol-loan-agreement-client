import { PublicKey } from "@solana/web3.js";
import * as web3 from "@solana/web3.js";

import { Contract } from "../model";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const generateTerminateContractTx = (
  signerKey: PublicKey,
  contractKey: PublicKey,
  itemKey: PublicKey,
  programId: string,
) => {
  const buffer = Contract.serialize(3);

  const instruction = new web3.TransactionInstruction({
    keys: [
      {
        pubkey: signerKey,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: contractKey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: itemKey,
        isSigner: false,
        isWritable: true,
      },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      {
        pubkey: web3.SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    data: buffer,
    programId: new web3.PublicKey(programId),
  });

  const transaction = new web3.Transaction().add(instruction);
  return transaction;
};
