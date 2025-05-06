"use client";
import { fetchDatas } from "@/ComponentDatas/fetchDatas";
import CommentPage from "@/components/CommentPage";
import PostPage from "@/components/PostPage";
import { Box, Flex, Skeleton, Spinner, Stack } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ErrorPage from "@/components/ErrorPage";
import { useGetData } from "@/useRequest";
import NavBarr from "@/components/NavBarr";

export default function Post({ params }) {
  const router = useRouter()
  const [loading, setLoading] = useState("true");
  const [errorPage, setErrorPage] = useState("");
  const [post, setPost] = useState([])
  const [user, setUser] = useState(null)
  const [comments, setComments] = useState([])
  const postId = params.slug;

  const useGet = useGetData(`/api/post/${postId}`)
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
      setComments(useGet.datas.Post.Comments);
      setPost(useGet.datas.Post);
      setUser(useGet.datas.User);
      setLoading(false)
    }
  }, [useGet.datas])
  return (
    <>
      {!loading && errorPage === "" && (<NavBarr User={user} />)}
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
          ml={{ md: 250 }}
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
          ) : errorPage !== "" ? (
            <ErrorPage message={errorPage} />
          ) : (
            <>
              <PostPage
                post={post}
                user={user}
              />
              {comments && comments.map((comment, index) => (
                <CommentPage key={index}
                  comment={comment}
                />
              ))}
            </>
          )
          }
        </Box>
        <Box
          w={{ base: "100%", md: "25%" }}
          p={4}
          ml={{ md: 4 }}
          borderColor="gray.200"
          borderRadius="md"
        >
        </Box>
      </Flex>
    </>
  );
}