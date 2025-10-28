import { PublicKey, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import * as web3 from "@solana/web3.js";

import { Contract } from "../model";
import { AccountLayout, TOKEN_PROGRAM_ID } from "@solana/spl-token";

type ContractForm = {
  lender: PublicKey;
  deposit: number;
  item: PublicKey;
};

export const generateSignContractTx = async (
  signerKey: PublicKey,
  contractForm: ContractForm,
  programId: string,
) => {
  const buffer = Contract.serialize(1, { amount: contractForm.deposit });

  const [pda_contract] = web3.PublicKey.findProgramAddressSync(
    [
      signerKey.toBuffer(),
      contractForm.lender.toBuffer(),
      contractForm.item.toBuffer(),
    ],
    new web3.PublicKey(programId),
  );

  const escrowKeypair = new web3.Keypair();

  // const expected_escrow_lamports =
  //   await connection.getMinimumBalanceForRentExemption(AccountLayout.span);
  // const space = 128;
  // const rentExemptionAmount =
  //   await connection.getMinimumBalanceForRentExemption(space);

  // console.log(space);
  // console.log(rentExemptionAmount);
  // console.log(expected_escrow_lamports + contractForm.deposit);
  // 1. Создание эскроу-аккаунта, который будет хранить средства заемщика
  // const createEscrowAccountIx = web3.SystemProgram.createAccount({
  //   space: AccountLayout.span,
  //   lamports: await connection.getMinimumBalanceForRentExemption(
  //     AccountLayout.span,
  //   ),
  //   fromPubkey: signerKey,
  //   newAccountPubkey: new web3.Keypair().publicKey,
  //   programId: TOKEN_PROGRAM_ID,
  // });
  //
  // // 2. Перевод средств заемщика на эскроу-аккаунт
  // const transferToEscrowIx = web3.SystemProgram.transfer({
  //   fromPubkey: signerKey,
  //   toPubkey: escrowKeypair.publicKey,
  //   lamports: contractForm.deposit, // Сумма займа
  // });

  const createContractAccountinstruction = new web3.TransactionInstruction({
    keys: [
      {
        pubkey: signerKey,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: pda_contract,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: contractForm.lender,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: contractForm.item,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: escrowKeypair.publicKey,
        isSigner: false,
        isWritable: true,
      },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
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
  // Подписываем транзакцию нужными ключами

  const transaction = new web3.Transaction().add(
    // createEscrowAccountIx,
    // transferToEscrowIx,
    createContractAccountinstruction,
  );
  return transaction;
};
