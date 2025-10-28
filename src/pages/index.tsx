import {
  Center,
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Switch,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "./Home.module.css";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  ContractItem,
  fetchContractItems,
  generateAddContractItemTx,
} from "@/src/entities/ContractItem";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ContractItemCard } from "@/src/entities/ContractItem/ui/ContractItemCard";
import { generateSignContractTx } from "@/src/entities/Contract/lib";
import { traceTransaction } from "@/src/shared/lib";
import * as web3 from "@solana/web3.js";
import { ContractCard } from "@/src/entities/Contract/ui/ContractCard";
import { Contract } from "@/src/entities/Contract/model";
import { fetchContracs } from "@/src/entities/Contract/lib/fetchContracs";
import { generateCompleteContractTx } from "@/src/entities/Contract/lib/generateCompleteContractTx";
import { PublicKey } from "@solana/web3.js";
import { generateTerminateContractTx } from "@/src/entities/Contract/lib/generateTerminateContractTx";

const LOAN_AGREEMENT_PROGRAM_ID =
  "38mMTwwvYXodz27VG8JZLaGpwNPiJt5tfwQBF9guK1Jg";

enum ModeContractItems {
  Available = "AVALAIBLE",
  Mine = "MINE",
}

const Home: NextPage = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [nameItem, setNameItem] = useState<string>();
  const [selectedItem, setSelectedItem] = useState<ContractItem | null>(null);
  const [contractItems, setContractItems] = useState<ContractItem[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [modeContractItems, setModeContractItems] = useState<ModeContractItems>(
    ModeContractItems.Mine,
  );

  const filteredContractItems = useMemo(() => {
    if (!publicKey) {
      return [];
    }
    if (modeContractItems === ModeContractItems.Mine) {
      const filteredContractrs = contractItems.filter((item) => {
        return item.owner.equals(publicKey) && Boolean(item.user);
      });
      return filteredContractrs;
    }
    if (modeContractItems === ModeContractItems.Available) {
      return contractItems.filter((item) => {
        return !item.owner.equals(publicKey);
      });
    }
    return [];
  }, [contractItems, modeContractItems, publicKey]);

  const handleFetchContractItems = useCallback(() => {
    if (!publicKey) {
      return;
    }
    return fetchContractItems(
      connection,
      LOAN_AGREEMENT_PROGRAM_ID,
      publicKey,
    ).then((contractItems) => {
      setContractItems(contractItems);
    });
  }, [connection, publicKey]);

  const handleFetchContracts = useCallback(
    (itemPubKey: web3.PublicKey) => {
      if (!publicKey) {
        return;
      }
      return fetchContracs(
        connection,
        LOAN_AGREEMENT_PROGRAM_ID,
        publicKey,
        itemPubKey,
      ).then((data) => {
        setContracts(data);
      });
    },
    [connection, publicKey],
  );

  const handleSignContract = useCallback(async () => {
    if (!publicKey || !selectedItem) {
      return;
    }
    const transaction = await generateSignContractTx(
      publicKey,
      {
        lender: selectedItem.owner,
        item: selectedItem.publicKey(LOAN_AGREEMENT_PROGRAM_ID),
        deposit: 100,
      },
      LOAN_AGREEMENT_PROGRAM_ID,
    );

    traceTransaction(() => sendTransaction(transaction, connection));
  }, [connection, publicKey, selectedItem, sendTransaction]);

  const handleAddItem = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!publicKey) {
        alert("Please connect your wallet!");
        return;
      }
      if (!nameItem) {
        alert("Please add Item!");
        return;
      }

      const transaction = generateAddContractItemTx(
        new ContractItem({ name: nameItem, owner: publicKey }),
        LOAN_AGREEMENT_PROGRAM_ID,
      );

      await traceTransaction(() => {
        return sendTransaction(transaction, connection);
      });
    },
    [connection, nameItem, publicKey, sendTransaction],
  );

  const hasActiveContract = useMemo(() => {
    if (!contracts.length) {
      return false;
    }
    return contracts.some((contract) => contract.status === 1);
  }, [contracts]);

  const handleCompleteContract = useCallback(
    (contractKey: PublicKey, itemKey: PublicKey) => {
      if (!publicKey) {
        return;
      }

      const transaction = generateCompleteContractTx(
        publicKey,
        contractKey,
        itemKey,
        LOAN_AGREEMENT_PROGRAM_ID,
      );

      void traceTransaction(() => {
        return sendTransaction(transaction, connection);
      });
    },
    [connection, publicKey, sendTransaction],
  );

  const handleTerminateContract = useCallback(
    (contractKey: PublicKey, itemKey: PublicKey) => {
      if (!publicKey) {
        return;
      }

      const transaction = generateTerminateContractTx(
        publicKey,
        contractKey,
        itemKey,
        LOAN_AGREEMENT_PROGRAM_ID,
      );

      void traceTransaction(() => {
        return sendTransaction(transaction, connection);
      });
    },
    [connection, publicKey, sendTransaction],
  );

  return (
    <div className={styles.App}>
      <Head>
        <title>Solana Loan Agreement</title>
      </Head>
      <div className={styles.AppHeader}>
        <WalletMultiButton />
      </div>
      <Center>
        <Box>
          <Heading as="h1" size="l" color="white" ml={4} mt={8}>
            Smart Contract Займа
          </Heading>
          <Box
            p={4}
            display={{ md: "flex" }}
            maxWidth="32rem"
            borderWidth={1}
            margin={2}
            justifyContent="center"
          >
            <form onSubmit={(e) => handleAddItem(e)}>
              <FormControl isRequired>
                <FormLabel color="gray.200">Имя предмета</FormLabel>
                <Input
                  id="title"
                  color="gray.400"
                  onChange={(event) => setNameItem(event.currentTarget.value)}
                />
              </FormControl>
              <Button width="full" mt={4} type="submit">
                Создать предмет
              </Button>
            </form>
          </Box>
          <Box
            display={{ md: "flex" }}
            gap={"72px"}
            justifyContent={"space-between"}
          >
            <Box
              display={{ md: "flex" }}
              gap={"medium"}
              flexDirection={"column"}
            >
              {/*<Heading as="h1" size="l" color="white" ml={4} mt={8}>*/}
              {/*  Доступные предметы*/}
              {/*</Heading>*/}
              <Switch
                isChecked={modeContractItems === ModeContractItems.Mine}
                onChange={(e) => {
                  setModeContractItems(
                    e.target.checked
                      ? ModeContractItems.Mine
                      : ModeContractItems.Available,
                  );
                }}
              ></Switch>
              <Text as={"span"} color="white">
                {"Только вещи в собственности"}
              </Text>
              <Button
                onClick={() => {
                  void handleFetchContractItems();
                }}
              >
                Загрузить
              </Button>
              <Box
                display={{ md: "flex" }}
                gap={"small"}
                flexDirection={"column"}
              >
                {publicKey &&
                  filteredContractItems.map((contractItem) => (
                    <ContractItemCard
                      key={contractItem.name}
                      item={contractItem}
                      onClick={() => {
                        handleFetchContracts(
                          contractItem.publicKey(LOAN_AGREEMENT_PROGRAM_ID),
                        )?.then(() => {
                          setSelectedItem(contractItem);
                        });
                      }}
                    />
                  ))}
              </Box>
            </Box>
            {selectedItem && (
              <Box
                display={{ md: "flex" }}
                gap={"small"}
                flexDirection={"column"}
              >
                <Heading as="h1" size="l" color="white" ml={4} mt={8}>
                  {selectedItem.name}:
                </Heading>
                {modeContractItems === ModeContractItems.Available && (
                  <Button
                    isDisabled={hasActiveContract}
                    onClick={() => {
                      void handleSignContract();
                    }}
                  >
                    Создать контракт c {selectedItem.name}
                  </Button>
                )}
                <div>
                  {publicKey &&
                    Boolean(contracts.length) &&
                    Boolean(selectedItem) && (
                      <div>
                        {contracts.map((contract) => (
                          <div key={contract.status.toString()}>
                            <ContractCard
                              key={contract
                                .publicKey(LOAN_AGREEMENT_PROGRAM_ID)
                                .toString()
                                .slice(0, 10)}
                              contract={contract}
                              CompleteButton={
                                contract.lender.equals(publicKey) ? (
                                  <Button
                                    size={"xs"}
                                    variant={"solid"}
                                    onClick={() => {
                                      handleCompleteContract(
                                        contract.publicKey(
                                          LOAN_AGREEMENT_PROGRAM_ID,
                                        ),
                                        contract.item,
                                      );
                                    }}
                                  >
                                    Complete
                                  </Button>
                                ) : (
                                  <>{null}</>
                                )
                              }
                              TerminateButton={
                                contract.lender.equals(publicKey) ? (
                                  <Button
                                    size={"xs"}
                                    onClick={() => {
                                      handleTerminateContract(
                                        contract.publicKey(
                                          LOAN_AGREEMENT_PROGRAM_ID,
                                        ),
                                        contract.item,
                                      );
                                    }}
                                  >
                                    Terminate
                                  </Button>
                                ) : (
                                  <>{null}</>
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </Box>
            )}
          </Box>
        </Box>
      </Center>
    </div>
  );
};

export default Home;
