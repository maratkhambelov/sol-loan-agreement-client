import bs58 from "bs58";
import * as web3 from "@solana/web3.js";
import { ContractItem } from "../model";

export const fetchContractItems = (
  connection: web3.Connection,
  programId: string,
  userPubKey: web3.PublicKey,
) => {
  const fetchRawData = async (search = "") => {
    const offset = 4 + 6 + 1 + 32 + 1 + 4;
    console.log(userPubKey?.toJSON());
    const accounts = await connection.getProgramAccounts(
      new web3.PublicKey(programId),
      // {
      //   dataSlice: { offset: 0, length: offset + 20 },
      //   filters:
      //     search === ""
      //       ? [
      //           {
      //             memcmp: {
      //               offset: 4,
      //               bytes: bs58.encode(Buffer.from("review")),
      //             },
      //           },
      //         ]
      //       : [
      //           {
      //             memcmp: {
      //               offset: offset,
      //               bytes: bs58.encode(Buffer.from(search)),
      //             },
      //           },
      //         ],
      // },
    );

    return accounts.map((account) => account.pubkey);
  };

  const serializeContractItems = async (accountPubKeys: web3.PublicKey[]) => {
    if (accountPubKeys.length === 0) {
      return [];
    }

    const accounts = await connection.getMultipleAccountsInfo(accountPubKeys);

    const base58UserPubKey = userPubKey.toBase58();
    return accounts.reduce((accum: ContractItem[], account) => {
      const contractItem = ContractItem.deserialize(account?.data);

      const contractItemOwnerPubkey = contractItem?.owner.toBase58();
      if (!contractItem || contractItemOwnerPubkey === base58UserPubKey) {
        return accum;
      }

      // const nameLength = dataBuffer.readUInt32LE(1); // Read length of name (4 bytes)
      // const offset = 1 + 4 + nameLength; // 1 byte for is_initialized + 4 bytes for name length + nameLength

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
