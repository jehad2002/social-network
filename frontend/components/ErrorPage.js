'use client'
import { Flex, Text, Button } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
const ErrorPage = ({ message }) => {
  const router = useRouter()
  return (
    <Flex
      minH="90vh"
      align="center"
      justify="center"
      // bg="gray.100"
      direction="column"
    >
      <Text color="white" fontSize="2xl" mb={4}>
        Error: <span style={{color:"red"}}>{message}</span>
      </Text>
      <Button colorScheme='red' onClick={() => router.push("/home")}>Go Home</Button>
    </Flex>
  );
};

export default ErrorPage;