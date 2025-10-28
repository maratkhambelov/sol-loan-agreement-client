import bs58 from "bs58";
import * as web3 from "@solana/web3.js";
import { Contract } from "@/src/entities/Contract/model";

export const fetchContracs = (
  connection: web3.Connection,
  programId: string,
  userPubKey: web3.PublicKey,
  itemPubKey: web3.PublicKey,
) => {
  const fetchRawData = async () => {
    const offset = 32 + 32;
    const accounts = await connection.getProgramAccounts(
      new web3.PublicKey(programId),
      {
        filters: [
          {
            memcmp: {
              offset: offset,
              bytes: bs58.encode(itemPubKey.toBuffer()),
            },
          },
        ],
      },
    );

    return accounts.map((account) => account.pubkey);
  };

  const serializeItems = async (accountPubKeys: web3.PublicKey[]) => {
    if (accountPubKeys.length === 0) {
      return [];
    }

    const accounts = await connection.getMultipleAccountsInfo(accountPubKeys);

    const base58UserPubKey = userPubKey.toBase58();
    const filteredAccounts = accounts.reduce((accum: Contract[], account) => {
      const contract = Contract.deserialize(account?.data);

      const contractLenderPubkey = contract?.lender.toBase58();
      const contractBorrowerPubkey = contract?.borrower.toBase58();
      if (
        !contract ||
        (contractLenderPubkey !== base58UserPubKey &&
          contractBorrowerPubkey !== base58UserPubKey)
      ) {
        return accum;
      }

      return [...accum, contract];
    }, []);
    return filteredAccounts;
  };

  return fetchRawData().then(serializeItems);
};
