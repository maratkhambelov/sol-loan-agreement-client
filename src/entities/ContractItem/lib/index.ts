import {PublicKey} from "@solana/web3.js";
import * as web3 from "@solana/web3.js"

import {ContractItem} from "./model";

export const  AddContractItemtransaction = (signerKey: PublicKey, contractItem: ContractItem, programId: string) => {
    const buffer = contractItem.serialize(0)
    const transaction = new web3.Transaction()

    const [pda] =  web3.PublicKey.findProgramAddressSync(
        [contractItem.owner.toBuffer(), Buffer.from(contractItem.name)],
        new web3.PublicKey(programId)
    )

    const instruction = new web3.TransactionInstruction({
        keys: [
            {
                pubkey: signerKey,
                isSigner: true,
                isWritable: false,
            },
            {
                pubkey: pda,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: web3.SystemProgram.programId,
                isSigner: false,
                isWritable: false,
            },
        ],
        data: buffer,
        programId: new web3.PublicKey(programId),
    })

    transaction.add(instruction)

    return transaction
}