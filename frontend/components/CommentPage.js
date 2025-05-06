'use client'
import { useRef, useState } from "react"
import { Box, Flex, Image, Text, IconButton, Badge, Avatar, useToast } from "@chakra-ui/react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { fetchWithBody } from "@/ComponentDatas/fetchDatas";


const CommentPage = ({ comment }) => {
  const toast = useToast()
  const [isLikeComment, setIsLikeComment] = useState(comment.IsLike);
  const [numLikes, setNumLikes] = useState(comment.NumLikes);

  const updateLike = async () => {
    var newIsLikeComment;
    var newNumLikes;
    if (isLikeComment) {
      newIsLikeComment = false
      newNumLikes = numLikes - 1
    } else {
      newIsLikeComment = true
      newNumLikes = numLikes + 1
    }

    const body = JSON.stringify({
      postId: 0,
      commentId: comment.Id,
    })
    try {
      const datas = await fetchWithBody("action", body);
      if (datas.success) {
        toast({ title: 'React Comment', position: 'top-center', description: datas.message, status: 'success', duration: 1000, isClosable: false })
        setIsLikeComment(newIsLikeComment);
        setNumLikes(newNumLikes);
        // console.log("SUCCESS: ", datas.message);
      } else {
        toast({ title: 'React Comment', position: 'top-center', description: datas.message, status: 'error', duration: 1000, isClosable: false })
        // console.log("FAILED: ", datas.message);
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Box borderWidth="1px" mb={1} backgroundColor={"rgb(91, 99, 126)"} borderRadius="lg" overflow="hidden" pt={4} pl={4} pr={4} boxSize={"80%"}>
      <Flex alignItems="center" >
        <Avatar src={`../images/users/${comment.AvatarUser !== `` ? comment.AvatarUser : `default.png`}`} size={"sm"} />
        <Box ml={2}>
          <Text fontWeight="bold" fontSize={"10px"}>{comment.NickName}</Text>
        </Box>
      </Flex>
      <Flex mb={1} mt={1}>
        <Badge colorScheme='blue' fontSize='0.6em'>{comment.DateFormat}</Badge>
      </Flex>
      <Text textAlign="justify" fontSize={12}>
        {comment.commentText}
      </Text>
      {
        comment.imageName !== `` ? (
          <Flex justifyContent={"center"} mt={2}>
            <Image
              src={`../${comment.imageName.replace(/.*public[\\/]/, '').replace(/\\/g, '/')}`}
              boxSize="100%"
              height="auto"
            />
          </Flex>
        ) : (
          <></>
        )
      }
      <Flex mt={1} ml={"20px"} alignItems="center" justifyContent={"right"}>
      </Flex>
    </Box>
  );
};
export default CommentPage;
