"use client";
export const dynamicParams = true;
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Textarea,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { MdPerson, MdEvent, MdCreate, MdGroup } from "react-icons/md";
import EventCard from "@/components/EventCard";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import { AddIcon } from "@chakra-ui/icons";
import ErrorPage from "@/components/ErrorPage";
import PostCard from "@/components/PostCard";
import fetcher from "@/utils/fetcher";
import { toBase64 } from "@/utils/convert";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import NavBarr from "@/components/NavBarr";
// import { MdGroup } from "react-icons/md";
import { useGetData } from "@/useRequest";
// import { useParams } from "react-router-dom";

const GroupHeader = ({
  friends,
  groupName,
  groupDescription,
  slug,
  groupId,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    title: "",
    content: "",
  });
  const toast = useToast();
  const [themeColor, setThemeColor] = useState(null);
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setThemeColor(theme);
  }, []); 
  const handleAddMember = async (idRequested, idGroup) => {
    try {
      const response = await fetch("http://localhost:8080/api/addGroupMember", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `groupId=${idGroup}&idRequested=${idRequested}`,
      });

      const data = await response.json();
      // console.log(data);
      if (data.status == "Requested") {
        console.log("Successfully requested group");
        toast({
          title: "Oh Yess!!!",
          position: "top-center",
          description: "Waiting his acceptation ⏳⏳⏳",
          status: "success",
          duration: 3000,
          isClosable: false,
        });
      } else if (data.status == "Nope") {
        toast({
          title: "Oh noo!!!",
          position: "top-center",
          description: "He has already been added wait his response...",
          status: "error",
          duration: 3000,
          isClosable: false,
        });
        return;
      } else {
        toast({
          title: "Oh noo!!!",
          position: "top-center",
          description: "He is already member of the group",
          status: "error",
          duration: 3000,
          isClosable: false,
        });
        return;
      }
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const [formData, setFormData] = useState({
    postText: "",
    image: null,
    postVisibility: slug,
  });

  const handleDataChange = (event) => {
    const { type, name, value } = event.target;
    if (type === "file") {
      const file = event.target.files[0];
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
 
  const handleSubmitPost = async (event) => {
    event.preventDefault();
    let imageName;
    if (formData.image) {
      imageName = formData.image.name;
      formData.image = await toBase64(formData.image);
    }
    formData.imageName = imageName;

    fetcher.post("/createpostgroup", formData).then((response) => {
      if (response.status == 200) {
        console.log("data sended");
        setIsPostModalOpen(false);
        // GroupDetail(slug)
        setFormData({
          postText: "",
          image: null,
          postVisibility: slug,
        });
      } else {
        toast({
          title: "OH NO!!!",
          position: "top-center",
          description: "You are not a member of this group",
          status: "error",
          duration: 3000,
          isClosable: false,
          containerStyle: {
            backgroundColor: themeColor == "dark" ? "#2d2d2d" : "#fff",
            color: themeColor == "dark" ? "#fff" : "#333",
            border: "1px solid",
            borderColor: themeColor == "dark" ? "#444" : "#ccc",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          }
        });
        console.log("error", response);
      }
    });
  };

  const handleEventDetailsChange = (e) => {
    const { name, value } = e.target;
    setEventDetails({ ...eventDetails, [name]: value });
  };

  const handleSubmitEvent = async () => {
    console.log("Event details:", eventDetails, slug);

    try {
      const eventDetailsWithSlug = { ...eventDetails, slug };
      const response = await fetch("http://localhost:8080/api/createEvent", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(eventDetailsWithSlug),
      });

      const data = await response.json();
      console.log("Response from server:", data);

      if (data.status != "Created") {
        toast({
          title: "Oh no!!!",
          position: "top-center",
          description: "You are not member of this group",
          status: "error",
          duration: 3000,
          isClosable: false,
        });
      } else {
        toast({
          title: "Oh Yess!!!",
          position: "top-center",
          description: "Event created ...",
          status: "success",
          duration: 3000,
          isClosable: false,
        });

        setIsModalOpen(false);

        setEventDetails("");
        onClose();
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      console.log("Group ID:", groupId); // للتحقق من القيمة قبل الاستدعاء

      const response = await fetch(
        `http://localhost:8080/api/members?id=${groupId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.error("Server Response:", await response.text()); // استعراض رسالة الخطأ
        throw new Error("Failed to fetch members");
      }

      const data = await response.json();
      console.log("Fetched Data:", data); // للتحقق من النتيجة
      setMembers(data);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const openPopup = () => {
    setIsOpen(true);
    fetchMembers();
  };

  const closePopup = () => setIsOpen(false);

  return (
    <>
    <Flex
      direction="column"
      align="center"
      justify="center"
      w="100%"
      mt="60px"
      position="relative"
      overflow="hidden"
      background="linear-gradient(to right, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"
      backgroundSize="cover"
      backgroundPosition="center"
      color="white"
      py="40px"
      px={{ base: "20px", md: "40px" }}
      textAlign="center"
      borderRadius={{ base: "0", md: "10px" }}
      mb={"50px"}
    >
      <Menu position="absolute" right="20px" top="20px" marginLeft={"700px"}>
        <MenuButton
          as={Button}
          rightIcon={<MdPerson />}
          mb={20}
          variant="outline"
          color="white"
          className="AddMember"
        >
          Add Member
        </MenuButton>
        <MenuList bg={"grey"}>
          {friends && (
            <>
              {Object.values(friends).map((friend) => (
                <MenuItem
                  key={friend.id}
                  justifyContent="space-between"
                  bg={"grey"}
                >
                  <Box>{friend.firstName}</Box>
                  <Box>
                    <FaPlus
                      style={{ cursor: "pointer" }}
                      onClick={() => handleAddMember(friend.id, slug)}
                    />
                  </Box>
                </MenuItem>
              ))}
            </>
          )}
        </MenuList>
      </Menu>

      <Heading as="h1" size="2xl" mb="2">
        {groupName}
      </Heading>
      <Heading as="h2" size="md" mb="4">
        {groupDescription}
      </Heading>
      <Flex justify="center" flexWrap="wrap" maxW="600px" m="0 auto" className="GroupButton__st">
        <Button
          leftIcon={<MdCreate />}
          onClick={() => setIsPostModalOpen(true)}
          colorScheme="green"
      
        >
          Create Post
        </Button>
        <Button
          leftIcon={<MdGroup />}
          onClick={openPopup}
          colorScheme="red"
          style={{ marginLeft: "5px" }}
      
        >
          View Members
        </Button>
        <Button
          leftIcon={<MdEvent />}
          onClick={() => setIsModalOpen(true)}
          colorScheme="blue"
          mr={{ base: "0", md: "4" }}
          mb={{ base: "4", md: "0" }}
          marginLeft={"5px"}
        >
          Create Event
        </Button>
      </Flex>
      <>
        <Modal isOpen={isOpen} onClose={closePopup} size="2xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader
              style={{
                color: "#000",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              Group Members
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {loading ? (
                <Spinner size="lg" />
              ) : (
                <>
                  {/* <strong style={{ color: "#000", marginBottom: "20px" }}>Members Of Group:</strong> */}
                  {members.length > 0 ? (
                    members.map((member) => (
                      <a
                        href={`/profil?id=${member.Id}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          color: "#000",
                          gap: "10px",
                          marginBottom: "10px",
                          textDecoration: "none",
                        }}
                        key={member.Id}
                      >
                        <img
                          src={
                            member.Avatar != ""
                              ? `../images/users/${member.Avatar}`
                              : "../user_icon.svg"
                          }
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                          }}
                        />
                        {member.Name}
                      </a>
                    ))
                  ) : (
                    <p>No members found.</p>
                  )}
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={closePopup}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
      <Modal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)}className='BOX_CreatPOST'>
        <ModalOverlay />
        <ModalContent backgroundColor="gray.800"     bg={themeColor === "dark" ? "#1a202c" : "#fff"} 
    color={themeColor === "dark" ? "#fff" : "#000"}>
          <ModalHeader>Create Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              type="hidden"
              name="postVisibility"
              value={formData.postVisibility}
              onChange={handleDataChange}
              // mb={2}
            />
            <Textarea
              placeholder="Content"
              name="postText"
              value={formData.postText}
              onChange={handleDataChange}
              mb={2}
            />

            <FormControl id="profile">
              <FormLabel>Add an image in your post </FormLabel>
              <Flex align="center">
                <Input
                  type="file"
                  accept="image/*"
                  name="image"
                  id="image-upload"
                  onChange={handleDataChange}
                  display="none"
                />
                <label htmlFor="image-upload">
                  <Button
                    as="span"
                    colorScheme="teal"
                    rounded="full"
                    cursor="pointer"
                    mr="2"
                    p="0"
                    _hover={{ bg: "teal.500" }}
                  >
                    <AddIcon boxSize={4} />
                  </Button>
                </label>
                {formData.image && <Text ml="2">{formData.image.name}</Text>}
              </Flex>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={"10px"} onClick={() => setIsPostModalOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleSubmitPost}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent backgroundColor="gray.800"  bg={themeColor === "dark" ? "#1a202c" : "#fff"} 
    color={themeColor === "dark" ? "#fff" : "#000"}>
          <ModalHeader>Create Event</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Title"
              name="title"
              value={eventDetails.title}
              onChange={handleEventDetailsChange}
              mb={2}
            />
            <Textarea
              placeholder="Description"
              name="description"
              value={eventDetails.description}
              onChange={handleEventDetailsChange}
              mb={2}
            />
            <Input
              type="datetime-local"
              name="dateTime"
              value={eventDetails.dateTime}
              onChange={handleEventDetailsChange}
              mb={2}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" onClick={handleSubmitEvent}>
              Create
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
    {themeColor == "light" && (
        <style jsx global>{`
          p {
            color: #000;
          }
            .AddMember:hover {
              color: #000;
            }
        `}</style>
      )}
        {themeColor == "dark" && (
        <style jsx global>{`
            .AddMember:hover {
              color: #000;
            }
        `}</style>
      )}
    </>

  );
};

const GroupDetail = ({ params }) => {
  const [user, setUser] = useState(null);
  const useGet = useGetData("/api/");
    useEffect(() => {
      if (useGet.datas) {
        if ('status' in useGet.datas && (useGet.datas.status === 401 || useGet.datas.status === 500)) {
          router.push('/login')
        } else if ('Id' in useGet.datas) {
          setUser(useGet.datas)
          setLoading(false)
        }
      }
    }, [useGet.datas])
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupEvents, setGroupEvents] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postGroup, setPostGroup] = useState([]);
  const [errorStatus, setErrorStatus] = useState(null);
  const [notAllowed, setNotAllowed] = useState(false);
  const router = useRouter();
  const groupId = params.slug;
  const toast = useToast();
  const [themeColor, setThemeColor] = useState(null);
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setThemeColor(theme);
  }, []); 
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const groupId = params.slug;
        const response = await fetch(
          `http://localhost:8080/api/groupsdata/${groupId}`,
          {
            credentials: "include",
          }
        );
        if (response.status === 401) {
          setNotAllowed(true);
        } else if (response.status == 404) {
          setErrorStatus(response.statusText);
        } else if (response.status == 400) {
          setErrorStatus(response.statusText);
        } else if (response.status == 500) {
          setErrorStatus(response.statusText);
        }
        const data = await response.json();
        if (data.status == "nope" || !data) {
          setLoading(false);
        }
        setLoading(false);
      } catch (error) {
        // setError(error.message);
      }
    };

    fetchGroupData();
  }, [params.slug]);

  const use = useGetData(`/api/groupsdata/${groupId}`);

  useEffect(() => {
    if (use.datas) {
      if (use.datas.status === "Not allowed") {
        toast({
          title: "Oh noo!!!",
          position: "top-center",
          description: "You don't have access. Please Join first",
          status: "error",
          duration: 3000,
          isClosable: false,
        });
        router.push("/groups");
        return;
      }

      setGroupName(use.datas.datas.name);
      setGroupDescription(use.datas.datas.description);
      setGroupEvents(use.datas.events);

      const allUsers = [];

      if (use.datas.friends.followers) {
        allUsers.push(...use.datas.friends.followers);
      }
      if (use.datas.friends.followings) {
        allUsers.push(...use.datas.friends.followings);
      }

      const userMap = {};

      allUsers.forEach((user) => {
        if (!userMap[user.Use.Id]) {
          userMap[user.Use.Id] = {
            id: user.Use.Id,
            firstName: user.Use.FirstName,
          };
        }
      });

      setFriends(userMap);
      console.log("frieeends1 ", userMap);
      // console.log("frieeends2 ",use.datas.friends);

      // setLoading(false);
      setPostGroup(use.datas.datas.PostGroup);
    }
  }, [use.datas]);
  if (notAllowed) {
    router.push("/login");
    return;
  }
  if (errorStatus) {
    return <ErrorPage message={errorStatus} />;
  }
  return (<>
    <div className="min-h-screen flex flex-col">
      {loading ? (
        <Spinner
          size="xl"
          color="red"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      ) : (
        <>
          <NavBarr User ={user}/>
          <GroupHeader
            groupName={groupName}
            groupDescription={groupDescription}
            slug={params.slug}
            friends={friends}
            groupId={groupId}
          />
          <Tabs isFitted variant="enclosed">
            <TabList mb="1em">
              <Tab className="Howada" 
    color={themeColor == "dark" ? "#fff" : "#000"}>Posts</Tab>
              <Tab className="Howada" color={themeColor == "dark" ? "#fff" : "#000"}>Events</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                {postGroup &&
                  postGroup.map((post , index) => (
                    <PostCard post={post} key={index} currentUserId={user?.Id}/>
                  ))}
              </TabPanel>
              <TabPanel>
                <Flex flexWrap="wrap" justifyContent="center">
                  {groupEvents &&
                    groupEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        title={event.title}
                        description={event.description}
                        date={event.dateTime}
                        id={event.id}
                      />
                    ))}
                </Flex>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </>
      )}
    </div>
    {themeColor == "light" && (
        <style jsx global>{`
          p {
            color: #000;
          }
            .Howada {
              color: #000;
            }
        `}</style>
      )}
    </>
    
  );
};

export default GroupDetail;
