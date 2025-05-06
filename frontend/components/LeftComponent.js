"use client";
import React, { useState, useEffect } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Button,
  Text,
  Link,
  Flex,
  Box,
  Avatar,
  useToast,
} from "@chakra-ui/react";
import { MdGroup } from "react-icons/md";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcherSwr } from "@/ComponentDatas/fetchDatas";
import NextLink from "next/link";

function AddGroupPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [groups, setGroups] = useState([]);
  const router = useRouter();
  const toast = useToast()

  const fetchGroups = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/groups", {
        credentials: "include",
      });
      console.log("fetgroupdata", response);
      if (response.status == 401) {
        router.push("/login");
        return;
      }
      const data = await response.json();
      const groupNames = data.map((group) => group.name);

      setGroups(groupNames);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);

  const handleSubmit = async () => {
    console.log("Submitting data:", groupName, description);

    try {
      const formData = new FormData();
      formData.append("groupName", groupName);
      formData.append("description", description);

      const response = await fetch("http://localhost:8080/api/groups", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      console.log("Response from server:", data);

      setGroups([...groups, data.newGroup]);

      setGroupName("");
      setDescription("");
      onClose();
      toast({ title: 'Creation Group', position: 'top-center', description: "Group Created", status: 'success', duration: 3000, isClosable: false })

    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  return (
    <>
      <Text>
        Or create it{" "}
        <Link
          color="blue.400"
          _hover={{ color: "purple.500" }}
          onClick={onOpen}
          className="Link_createGroup"
        >
          here
        </Link>
      </Text>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent backgroundColor="gray.800">
          <ModalHeader>Create Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Group Name</FormLabel>
              <Input
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Description</FormLabel>
              <Input
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={handleSubmit}>
              Confirm
            </Button>
            <Button colorScheme="red" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default function LeftComponent() {
  const toast = useToast()

  const { data: groups, error } = useSWR(
    "http://localhost:8080/api/groups",
    fetcherSwr, { refreshInterval: 100 }
  );

  if (error) return <div>Error fetching groups</div>;
  console.log("groupp datas", groups);

  const handleJoinGroup = async (groupId, groupCreator) => {
    console.log(`Joined group with id ${groupId}, creator ${groupCreator}`);

    try {
      const response = await fetch("http://localhost:8080/api/joingroup", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `groupId=${groupId}&groupCreator=${groupCreator}`,
      });

      const data = await response.json();
      console.log("dataaaaas", data);
      if (data.status === "Requested") {
        console.log("Successfully requested group");
        toast({ title: 'Joining Group', position: 'top-center', description: "Requested", status: 'success', duration: 3000, isClosable: false })

      }
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  return (
      <Box
        w={{ base: "100%", md: "60%" }}
        h={{ base: "100%", md: "60%" }}
        p={4}
        mr={{ md: 4 }}
        borderWidth="1px"
        borderRadius="md"
        mt={{ base: 10 }}
      >
        <h2>Join communities</h2>
        <Box mb="1rem" />
        <ul style={{ listStyle: "none", padding: 0 }}>
          {groups && groups.length > 0 ? (
            groups.map((group) => (
              <li
                key={group.Group.id}
                style={{
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  borderBottom: "1px solid",
                  borderColor: "gray.200",
                  paddingBottom: "8px",
                  justifyContent: "space-between",
                }}
              >
                <Flex flexDirection="row" alignItems="center">
                  <Avatar icon={<MdGroup />} bg="black" size="sm" mr={2} />
                      <Text noOfLines={1}>{group.Group.name}</Text>
                </Flex>
                {!group.IsMember && !group.RequestedToJoin ? (
                  <Button
                    size="sm"
                    color="white"
                    onClick={() =>
                      handleJoinGroup(group.Group.id, group.Group.group_creator)

                    }
                    colorScheme="red"
                  >
                    Join
                  </Button>
                ) : group.RequestedToJoin ? (
                  <Button size="sm" color="white" colorScheme="red">
                      Requested
                  </Button>
                ) : (
                  <Button size="sm" color="white" colorScheme="grey.800">
                    <NextLink href={`/groups/${group.Group.id}`} passHref>
                      View
                    </NextLink>
                  </Button>
                )}
              </li>
            ))
          ) : (
            <li>No groups available</li>
          )}
          <AddGroupPopup />
        </ul>
      </Box>
  );
}