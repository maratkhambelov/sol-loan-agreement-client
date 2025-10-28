import { Box, HStack, Spacer, Stack, Text } from "@chakra-ui/react";
import { FC, ReactElement } from "react";
import { Contract } from "../../model";

export interface CardProps {
  contract: Contract;
  CompleteButton?: ReactElement;
  TerminateButton?: ReactElement;
}

const statusDisableDict = new Map([
  [0, true],
  [1, false],
  [2, true],
]);

const statusDict = new Map([
  [0, "Uninitialized"],
  [1, "Active"],
  [2, "Closed"],
]);

export const ContractCard: FC<CardProps> = ({
  contract,
  CompleteButton,
  TerminateButton,
}) => {
  return (
    <Box
      p={4}
      display={{ md: "flex" }}
      maxWidth="32rem"
      borderWidth={1}
      margin={2}
      // _hover={
      //   {
      //     // cursor: statusDisableDict.get(contract.status) ? "default" : "pointer",
      //     // background: statusDisableDict.get(contract.status)
      //     //   ? "inherit"
      //     //   : "gray.900",
      //   }
      // }
    >
      <Stack
        w="full"
        align={{ base: "center", md: "stretch" }}
        textAlign={{ base: "center", md: "left" }}
        mt={{ base: 4, md: 0 }}
        ml={{ md: 6 }}
        mr={{ md: 6 }}
      >
        <HStack>
          <Text
            fontWeight="bold"
            textTransform="uppercase"
            fontSize="lg"
            letterSpacing="wide"
            color="gray.200"
          >
            {statusDict.get(contract.status)}
          </Text>
          {CompleteButton}
          {TerminateButton}
          <Spacer />
        </HStack>
      </Stack>
    </Box>
  );
};
// export const ContractCard = () => {
//   return null;
// };
