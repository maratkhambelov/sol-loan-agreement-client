import bs58 from "bs58";
import * as web3 from "@solana/web3.js";
import { ContractItem } from "../model";

export const fetchContractItems = (
  connection: web3.Connection,
  programId: string,
  userPubKey: web3.PublicKey,
) => {
  const fetchRawData = async (search = "") => {
    const accounts = await connection.getProgramAccounts(
      new web3.PublicKey(programId),
    );

    return accounts.map((account) => account.pubkey);
  };

  const serializeContractItems = async (accountPubKeys: web3.PublicKey[]) => {
    if (accountPubKeys.length === 0) {
      return [];
    }

    const accounts = await connection.getMultipleAccountsInfo(accountPubKeys);

    return accounts.reduce((accum: ContractItem[], account) => {
      const contractItem = ContractItem.deserialize(account?.data);

      if (!contractItem) {
        return accum;
      }

      return [...accum, contractItem];
    }, []);
  };

  return fetchRawData().then(serializeContractItems);
};

// accounts.sort((a, b) => {
//     const lengthA = a.account.data.readUInt32LE(0)
//     const lengthB = b.account.data.readUInt32LE(0)
//     const dataA = a.account.data.slice(offset, offset + lengthA)
//     const dataB = b.account.data.slice(offset, offset + lengthB)
//     return dataA.compare(dataB)
// })
// const nameLength = dataBuffer.readUInt32LE(1); // Read length of name (4 bytes)
// const offset = 1 + 4 + nameLength; // 1 byte for is_initialized + 4 bytes for name length + nameLength
