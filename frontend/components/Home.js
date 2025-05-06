"use client";
import React, { useEffect, useState } from "react";
import { Flex, Box, Spinner } from "@chakra-ui/react";
import PostCard from "./PostCard";
import { useRouter } from "next/navigation";
import ErrorPage from "./ErrorPage";
import { useGetData } from "@/useRequest";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [errorPage, setErrorPage] = useState("");
  const [posts, setPosts] = useState([])
  const url = "posts"
  const router = useRouter()
  const [showChat, setShowChat] = useState(true);
  const toggleChat = () => {
    setShowChat(!showChat);
  };
  const useGet = useGetData("/api/posts")

  useEffect(() => {
    if (useGet.datas) {
      if (useGet.datas.status === 401) {
        console.log(useGet.datas.message);
        router.push("/login")
        return
      }
      if (useGet.datas.status === 500 || useGet.datas.status === 400 || useGet.datas.status === 404) {
        setErrorPage(useGet.datas.message);
        return
      }
      setPosts(useGet.datas);
      setLoading(false)
    }
  }, [useGet.datas])

  return (
    <div className="min-h-screen flex justify-center">
      <Content posts={posts} loading={loading} errorPage={errorPage} flex="1" />
    </div>
  );
};
export const Content = ({ posts, loading, errorPage }) => {
  const showChat = true
  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      align={{ base: "center", md: "flex-start" }}
      justify="center"
      w="100%"
      flex="1"
      overflowY="auto"
      mt="60px"
    >
      <Box
        w={{ base: "100%", md: "60%" }}
        p={4}
        mx={{ md: 4 }}
        borderRadius="md"
        //ml={{ md: 250 }}
      >
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
          errorPage !== "" ? (
            <ErrorPage message={errorPage} />
          ) : (
            posts && posts.map((post, index) => (
              <PostCard key={index}
                post={post}
                currentUserId={post.UserId}
              />
            )))
        )}
      </Box>
      
    </Flex>
  );
};

export default Home;