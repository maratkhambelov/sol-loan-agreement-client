import { Box, HStack, Spacer, Stack, Text } from "@chakra-ui/react";
import { FC } from "react";
import { ContractItem } from "../model";

export interface CardProps {
  item: ContractItem;
  onClick?: () => void;
}

export const ContractItemCard: FC<CardProps> = ({ item, onClick }) => {
  return (
    <Box
      p={4}
      display={{ md: "flex" }}
      maxWidth="32rem"
      borderWidth={1}
      margin={2}
      _hover={{
        cursor: "pointer",
        background: "gray.900",
      }}
      onClick={onClick}
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
            {item.name}
          </Text>
          <Spacer />
        </HStack>
      </Stack>
    </Box>
  );
};
