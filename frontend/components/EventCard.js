import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Stack,
  Button,
  Image,
  AspectRatio,
} from "@chakra-ui/react";

const 
EventCard = ({ title, description, date, id }) => {
  function parseISOString(dateString) {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return null;
    } else {
      return date;
    }
  }
  const dateTime = parseISOString(date);

  const formatDate = (dateTime) => {
    if (!dateTime) return "";

    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    return dateTime.toLocaleDateString(undefined, options);
  };

  const [acceptedToGo, setAcceptedToGo] = useState(false);
  const [responseSend, setResponseSend] = useState(false);

  useEffect(() => {
    const acceptedState = localStorage.getItem(`event_${id}_accepted`);
    if (acceptedState) {
      setAcceptedToGo(acceptedState === "true");
    }
  }, [id]);

  const sendResponseToAPI = async (respond) => {
    try {
      console.log("seeeeend to backend ", respond, id);
      const response = await fetch("http://localhost:8080/api/RespEvent", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ respond, id }),
      });

      const status = await response.json();
      localStorage.setItem(`event_${id}_accepted`, status.status === "success");
      setAcceptedToGo(status.status === "success");
      setResponseSend(true)

    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  return (
    <Box
      maxW="sm"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      m="2"
    >
      <Flex direction="column">
        <AspectRatio ratio={16 / 9}>
          <Image
            src="https://images.unsplash.com/photo-1535276811207-1bcae679870e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Event"
            objectFit="cover"
          />
        </AspectRatio>
        <Flex p="6" direction="column" alignItems="center">
          <Heading as="h4" size="md" mt="1" textAlign="center">
            {title}
          </Heading>
          <Text
            mt={2}
            color="gray.600"
            fontSize="sm"
            lineHeight="normal"
            textAlign="center"
          >
            {description}
          </Text>
        </Flex>
        <Box borderTopWidth="1px" p="4">
          <Stack direction="row" spacing={6} justify="flex-end">
            <Text
              mt={2}
              color="gray.600"
              fontSize="sm"
              lineHeight="normal"
              textAlign="center"
            >
              {formatDate(dateTime)}
            </Text>
            {!acceptedToGo && !responseSend &&(
              <>
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={() => sendResponseToAPI("not going")}
                >
                  Not Going
                </Button>
                <Button
                  size="sm"
                  colorScheme="green"
                  onClick={() => sendResponseToAPI("going")}
                >
                  Going
                </Button>
              </>
            )}
            {acceptedToGo && responseSend && (
              <div>
                <p>You accepted to go.</p>
              </div>
            )}
            {!acceptedToGo && responseSend && (
              <div>
                <p>You declined to go.</p>
              </div>
            )}
          </Stack>
        </Box>
      </Flex>
    </Box>
  );
};

export default EventCard;