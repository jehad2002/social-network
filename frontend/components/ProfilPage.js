'use client'
import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDataHandler, FetchData, getConnectedUser } from "./DataHandlerProfil";
import PostCard from "./PostCard";
import ErrorPage from "./ErrorPage";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Textarea,
  Box,
  Image,
  Flex,
  Heading,
  Text,
  Spinner,
  Radio,
  Lorem
} from '@chakra-ui/react'
import { useGetData } from "@/useRequest";
import NavBar from "./NavBar";
import NavBarr from "./NavBarr";

const ProfilInfo = ({ userInfo, isFollowing }) => {
  const { Id, FirstName, LastName, Email, NickName, Avatar, Profil } = userInfo;
  const [connectedUser, setUserId] = useState(null);
  const [isfollowing, setIsFollowing] = useState(isFollowing);
  getConnectedUser()
  .then(user => {
    setUserId(user.userId)
  })
  .catch(error => {
    console.error("Err11111 :", error);
  });
  return (
    <Flex
      flexDirection={{ base: "column", md: "row" }}
      justifyContent="space-between"
      alignItems="center"
      marginBottom={3}
      padding={4}
    >
      <Box>
        <Heading as="h2" fontSize="2xl" fontWeight="semibold" color="gray.200">{FirstName} {LastName}</Heading>
        {Profil === 'public' || Id == connectedUser || isfollowing ? (
          <>
            <Text fontWeight="semibold" color="gray.200">{Email}</Text>
            <Text fontWeight="semibold" color="gray.200">{NickName}</Text>
          </>
        ) : null}
      </Box>
      <Box>
        <Box
          width={{ base: "12", md: "24" }}
          height={{ base: "12", md: "24" }}
          borderRadius="full"
          bg="gray.200"
          overflow="hidden"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Image
            src={`../images/users/${Avatar !== `` ? Avatar : `default.png`}`}
            alt="Image profile"
            width="full"
            height="full"
            objectFit="cover"
          />
        </Box>
      </Box>
    </Flex>
  );
};

const UsersFollow = ({ user }) => {
  const initialIsFollowing = user.IsFollowing;
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const router = useRouter()
  const handleClik = async () => {
    var status = 1
    if (isFollowing) {
      status = 0
    } else if (user.Profil == 'private') {
      status = 0
    }
    console.log('status ', status);
    setIsFollowing(!isFollowing)
    const url = `http://localhost:8080/api/data/follow?id=${user.Use.Id}&status=${status}&profil=${user.Profil}`;
    await FetchData(url);
  }

  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleProfileClick = () => {
    router.push(`/profil?id=${user.Use.Id}`);
  };

  return (
    <Flex align="center" justify="space-between" p={2} borderBottom="1px solid" borderColor="gray.300">
        <Flex onClick={handleProfileClick} align="center" onClose={onClose}>
          <Image src={`../images/users/${user.Use.Avatar !== `` ? user.Use.Avatar : `default.png`}`} alt={user.Use.FirstName} borderRadius="full" boxSize="30px" />
          <Box ml={2} mr={2}>
            <Text fontSize="sm">{user.Use.FirstName} {user.Use.LastName}</Text>
          </Box>
        </Flex>
      {!isFollowing ? (
        <Button
          variant="outline"
          _hover={{ bg: "purple.500", color: "white" }}
          size="sm"
          onClick={handleClik}
          color={'white'}
        >
          Follow
        </Button>
      ) : user.Status === 1 ? (
        <Button 
        variant="outline" 
        size="sm" 
        onClick={handleClik} 
        color={'white'}
        _hover={{ bg: "purple.500", color: "white" }}
        >
          Following
        </Button>
      ) : (
        <Button 
        variant="outline" 
        size="sm" 
        onClick={handleClik} 
        color={'white'}
        _hover={{ bg: "purple.500", color: "white" }}
        >
          Requested
        </Button>
      )}
    </Flex>
  );
};
const ProfilContent = ({ userData }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef(null);
  const handleOpenModal = () => {
    onOpen();
  };

  //console.log('userdata ', userData);
 
  const [connectedUser, setUserId] = useState(null);
  getConnectedUser()
  .then(user => {
    setUserId(user.userId)
  })
  .catch(error => {
    console.error("Err222222222222 :", error);
  });

  let followersButton = null;
  const [nbreFollowers, setNbreFollowers] = useState(userData.followers  ? userData.followers.length : 0);
  if (nbreFollowers > 0 && ((userData.IsFollowing.ok && userData.IsFollowing.status == "1") || userData.User.Profil=='public' || userData.User.Id == connectedUser)) {
    followersButton = (
      <Button justifyContent={"start"} pl={4} mt={3} ref={btnRef} onClick={handleOpenModal} colorScheme='teal' variant='link'>
        {nbreFollowers} Followers
      </Button>
    );
  }

  return (
    <Box width="full" display="flex" justifyContent="center" padding={4}>
      <Flex direction="column" width="full" color="gray.200">
        {followersButton}
        <Modal onClose={onClose} finalFocusRef={btnRef} isOpen={isOpen} scrollBehavior={'inside'}>
          <ModalOverlay />
          <ModalContent backgroundColor="gray.800">
            <ModalHeader>Followers</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Tabs isFitted variant="enclosed">
                <TabList mb="1em" style={{ position: 'sticky', top: -10, background: 'dark', zIndex: 1 }}>
                  <Tab>Followers</Tab>
                  <Tab>Following</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    {userData && userData.followers && userData.followers.map((follower, index) => (
                      follower.Use.Id != connectedUser ? (
                        <UsersFollow key={index} user={follower} />
                      ) : null
                    ))}
                  </TabPanel>
                  <TabPanel>
                    {userData && userData.following && userData.following.map((followedUser, index) => (
                      followedUser.Use.Id != connectedUser ? (
                        <UsersFollow key={index} user={followedUser} />
                      ) : null
                    ))}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </ModalBody>
            <ModalFooter>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Flex>
    </Box>
  );
};

function Table({ data }) {
  const biographie = data.User.AboutMe;
  const Posts = data.Posts;
  const imagesPosted = data.ImagesPosted;
  const variants = ["solid", "underlined", "bordered", "light"];
  const [one, setOne] = useState('one');
  return (
    <Box className="w-full flex flex-wrap gap-4 text-gray-200">
      <Tabs className="w-full">
        <TabList className="w-full">
          <Tab className="w-1/3">Posts</Tab>
          <Tab className="w-1/3">Photos</Tab>
          <Tab className="w-1/3">About me</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {Posts && Posts.map((post, index) => (
              <PostCard key={index}
                post={post}
                currentUserId={data.User.Id}
              />
            ))}
          </TabPanel>
          <TabPanel>
            <Flex className="w-1/3 h-auto max-h-60 overflow-y-auto">
              {imagesPosted && imagesPosted.map((image, index) => (
                <Box className="h-30" key={index}>
                  <Image
                    src={`../${image.replace(/.*public[\\/]/, '').replace(/\\/g, '/')}`}
                    alt="Dan Abramov"
                    className="object-cover w-full h-full"
                  />
                </Box>
              ))}
            </Flex>

          </TabPanel>
          <TabPanel>
            <p>{biographie}</p>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

const ModalEditProfil = ({ data }) => {
  var profil = false;
  const { Id, FirstName, LastName, AboutMe, Nickname, Profil } = data.User;
  if (Profil == 'public') {
    profil = false
  }
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState(FirstName + " " + LastName);
  const [aboutMe, setAboutMe] = useState(AboutMe);
  const [isPrivateProfile, setIsPrivateProfile] = useState(data.User.Profil === 'private'); 
  const [connectedUser, setUserId] = useState(null);
  getConnectedUser()
  .then(user => {
    setUserId(user.userId)
  })
  .catch(error => {
    console.error("Err3333333333:", error);
  });
  const onSubmit = async (event) => {
    event.preventDefault();
    const url = `http://localhost:8080/api/data/updateProfil?id=${Id}&aboutMe=${aboutMe}&profil=${isPrivateProfile}`;
    await FetchData(url)
    onClose();
    setName(FirstName + " " + LastName);
    setAboutMe(AboutMe);
    if (Profil == 'priate') {
      setIsPrivateProfile(true);
    }
  };
  
  const [isFollowing, setIsFollowing] = useState(data.IsFollowing.ok);
  const [stat, setStatus] = useState(data.IsFollowing.status);
  const handleClik = async () => {
    var status = 1
    if (isFollowing || Profil == 'private') {
      status = 0
    }
    setIsFollowing(!isFollowing)
    setStatus(status)
    const url = `http://localhost:8080/api/data/follow?id=${Id}&status=${status}&profil=${Profil}`;
    await FetchData(url);
  }

  useEffect(() => {
    setStatus(data.IsFollowing.status)
  }, [data.IsFollowing.status]);

  const handleSwitchChange = (e) => {
    setIsPrivateProfile(e.target.checked);
  };

  return (
    <>
      {Id == connectedUser ? (
        <div className="w-full flex justify-center p-4">
          <Button onClick={onOpen} className="w-full rounded bg-gray-50 text-center mt-2">
            Edit Profile
          </Button>
        </div>
      ) : !isFollowing ? (
          <div className="w-full flex p-4">
            <Button onClick={handleClik} className="rounded bg-gray-50 text-center mt-2">
              Follow
            </Button>
          </div>
        ) : stat == 1 ? (
            <div className="w-full flex p-4">
              <Button onClick={handleClik} className="rounded bg-gray-50 text-center mt-2">
                Following
              </Button>
            </div>
        ):(
          <div className="w-full flex p-4">
              <Button onClick={handleClik} className="rounded bg-gray-50 text-center mt-2">
              Requested
              </Button>
            </div>
      )}
    <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={undefined} finalFocusRef={undefined}>
      <ModalOverlay />
      <ModalContent backgroundColor="gray.800">
        <form onSubmit={onSubmit}>
          <ModalHeader>Edit Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                placeholder="First name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>AboutMe</FormLabel>
              <Textarea
                name="biographie"
                placeholder="AboutMe"
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4} display='flex' alignItems='center' justifyContent='space-between'>
              <FormLabel htmlFor='profil-private' mb='0'>
                Profil private
              </FormLabel>
              <Switch
                id='profil-private'
                isChecked={isPrivateProfile}
                onChange={handleSwitchChange}
              />

              <input type="hidden" name="isPrivateProfile" value={isPrivateProfile ? 'private' : 'public'} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" colorScheme="blue" ml={3}>
              Save
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>

    </>
  );
};

const ProfilPage = ({ userId }) => {
  const router = useRouter()
  const [loading, setLoading] = useState("true");
  const [errorPage, setErrorPage] = useState("");
  const [data, setData] = useState("");
  const [userCon, setUserCon] = useState(null);
  const params = useSearchParams()
  const id = params.get('id')

  const useGet = useGetData(`/profil?id=${id}`)

  useEffect(() => {
    if (useGet.datas) {
      if (useGet.datas.status === 401) {
        router.push("/login")
        return
      }
      if (useGet.datas.status === 500 || useGet.datas.status === 400 || useGet.datas.status === 404) {
        setLoading(false)
        setErrorPage(useGet.datas.message)
        return
      }
      setData(useGet.datas)
      //console.log("usetey profilpage", useGet.datas.User);
      setUserCon(useGet.datas.User)
      setLoading(false)
    }
  }, [useGet.datas])

  if (errorPage !== ""){
    return  <ErrorPage message={errorPage} />
  }
  return (
    <>
      <NavBarr />
      <Box
        w={{ base: "100%", md: "60%" }}
        p={4}
        // mx={{ md: 4 }}
        borderColor="gray.200"
        borderRadius="md"
        ml={"auto"}
        mr={"auto"}
        // mt={"70px"}
        mt={20}
        // m={"auto"}
        backgroundColor={"rgb(16,16,16)"}
      >

        <Flex
          minH="85vh"
          w="full"
          justify="center"
        >
          {loading ? (
            <Spinner size='xl' />
          ) :  (
            <>
              <Box
                bg="rgb(16,16,16)"
                w={{ base: "full", sm: "11/12", lg: "3/4", xl: "1/2" }}
                p={4}
                rounded="md"
                shadow="md"
                h="auto"
                flex={{ sm: 1 }}
                flexDir="column"
                justify={{ sm: "space-between" }}
                overflowY={"auto"}
              >
                <Box>
                  {userCon.Profil === 'public' || id == userId || (data.IsFollowing.ok && data.IsFollowing.status == 1) ? (
                    <>
                      <ProfilInfo userInfo={userCon} isFollowing={data.IsFollowing} />
                      <ProfilContent userData={data} />
                      <ModalEditProfil data={data} />
                      <Table data={data} />
                    </>
                  ) : (
                    <>
                      <ProfilInfo userInfo={userCon} />
                      <ProfilContent userData={data} />
                      <ModalEditProfil data={data} />
                    </>
                  )}
                </Box>
              </Box>
            </>
          )
          }
        </Flex>
      </Box>
    </>
  );
};

export default ProfilPage