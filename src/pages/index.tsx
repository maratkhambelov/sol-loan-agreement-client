import {Center, Box, Heading, FormControl, FormLabel, Input, Button} from "@chakra-ui/react"
import type { NextPage } from "next"
import Head from "next/head"
// import { AppBar } from "../components/AppBar"
// import { MovieList } from "../components/MovieList"
// import { Form } from "../components/Form"
import styles from "../styles/Home.module.css"
import {FormEvent, useCallback, useState} from "react";
import {useWallet} from "@solana/wallet-adapter-react";

const Home: NextPage = () => {
    const { publicKey, sendTransaction } = useWallet()


    const [nameItem, setNameItem] = useState<string>()
    const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!publicKey) {
            alert("Please connect your wallet!")
            return
        }

        
    }, [publicKey])
    return (
        <div className={styles.App}>
            <Head>
                <title>Solana Loan Agreement</title>
            </Head>
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
                        <form onSubmit={(e) => handleSubmit(e)}>
                            <FormControl isRequired>
                                <FormLabel color="gray.200">Имя предмета</FormLabel>
                                <Input
                                    id="title"
                                    color="gray.400"
                                    onChange={(event) =>
                                        setNameItem(event.currentTarget.value)
                                    }
                                />
                            </FormControl>
                            <Button width="full" mt={4} type="submit">
                                Submit Review
                            </Button>
                        </form>
                    </Box>
                    {/*    <Form />*/}
                {/*    <Heading as="h1" size="l" color="white" ml={4} mt={8}>*/}
                {/*        Existing Reviews*/}
                {/*    </Heading>*/}
                {/*    <MovieList />*/}
                </Box>
            </Center>
        </div>
    )
}

export default Home
