'use client';
import {
  Box,
  Flex,
  Image,
  Text,
  IconButton,
  Avatar,
  Badge,
  useToast,
} from '@chakra-ui/react';
import {
  AiOutlineHeart,
  AiOutlineComment,
  AiFillHeart,
} from 'react-icons/ai';
import { MinusIcon, CheckIcon, RepeatIcon, DeleteIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { fetchWithBody } from '@/ComponentDatas/fetchDatas';

const PostCard = ({ post, currentUserId }) => {
  const toast = useToast();
  const router = useRouter();
  const [isLikePost, setIsLikePost] = useState(post.IsLike);
  const [numLikes, setNumLikes] = useState(post.NumLikes);
  const loginID = localStorage.getItem("id");
  
  
  const updateLike = async () => {
    const newIsLikePost = !isLikePost;
    const newNumLikes = isLikePost ? numLikes - 1 : numLikes + 1;

    const body = JSON.stringify({
      postId: post.Id,
      commentId: 0,
    });

    try {
      const datas = await fetchWithBody('action', body);
      if (datas.success) {
        toast({
          title: 'React Post',
          position: 'top-center',
          description: datas.message,
          status: 'success',
          duration: 1000,
          isClosable: false,
        });
        setIsLikePost(newIsLikePost);
        setNumLikes(newNumLikes);
      } else {
        toast({
          title: 'React Post',
          position: 'top-center',
          description: datas.message,
          status: 'error',
          duration: 1000,
          isClosable: false,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };
  let USERID = post.UserId;
  if (post.UserId === 0) {
    USERID = currentUserId;
  }
  const handleDelete = async () => {
    const confirmed = confirm('Are you sure you want to delete this post?');
    if (!confirmed) return;

    const body = JSON.stringify({ postId: post.Id });

    try {
      const res = await fetchWithBody('deletePost', body); // Your Go API endpoint
      if (res.success) {
        toast({
          title: 'Post deleted',
          description: res.message,
          status: 'success',
          duration: 2000,
          isClosable: true,
          position: 'top-center',
        });
        router.refresh(); // Or navigate to another page if needed
      } else {
        toast({
          title: 'Delete failed',
          description: res.message,
          status: 'error',
          duration: 2000,
          isClosable: true,
          position: 'top-center',
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Something went wrong',
        status: 'error',
        duration: 2000,
        isClosable: true,
        position: 'top-center',
      });
    }
  };

  return (
    <Box borderBottom="1px" borderBottomColor="darkgrey" overflow="hidden" p={4} mb={4} style={{ width: '70%', margin: 'auto' }}>
      <Flex alignItems="center" mb={2}>
        <Avatar
          src={`../images/users/${post.UserAvatar !== '' ? post.UserAvatar : 'default.png'}`}
          onClick={() => {
            if (post.UserId !== 0) {
              router.push(`/profil/?id=${post.UserId}`);
            }
          }}
          cursor={'pointer'}
        />
        <Box ml="3">
          <Text fontWeight="bold">{post.NickName}</Text>
        </Box>
        {post.Follow === -2 ? null : (
          <Box ml="3">
            {post.Follow === -1 ? (
              <Badge colorScheme="red">
                <MinusIcon />
              </Badge>
            ) : post.Follow === 0 ? (
              <Badge colorScheme="blue">
                <RepeatIcon />
              </Badge>
            ) : (
              <Badge colorScheme="whatsapp">
                <CheckIcon />
              </Badge>
            )}
          </Box>
        )}
      </Flex>

      <Flex mb={2}>
        <Badge colorScheme="blue">{post.DatePosted}</Badge>
      </Flex>

      <Text mt={2} textAlign="justify">
        {post.postText}
      </Text>

      {post.imageName !== '' && (
        <Flex justifyContent={'center'} mt={2}>
          <Image
            src={`../${post.imageName.replace(/.*public[\\/]/, '').replace(/\\/g, '/')}`}
            boxSize="50%"
            height="auto"
            datatype={post.UserId}

          />
        </Flex>
      )}

      <Flex alignItems="center" mt={1}>
        <IconButton
          aria-label="Like"
          icon={isLikePost ? <AiFillHeart /> : <AiOutlineHeart />}
          colorScheme={isLikePost ? 'red' : 'gray'}
          variant="ghost"
          size="lg"
          mr={2}
          onClick={updateLike}
          className={"outBtn"}
        />
        <Text fontSize="sm" color="gray.600">
          {numLikes}
        </Text>

        <IconButton
          aria-label="Comment"
          icon={<AiOutlineComment />}
          colorScheme="gray"
          variant="ghost"
          size="lg"
          ml={4}
          mr={2}
          onClick={() => router.push(`/posts/${post.Id}`)}
        />
        <Text fontSize="sm" color="gray.600">
          {post.NumComments}
        </Text>

        {loginID == USERID && (
          <IconButton
            aria-label="Delete"
            icon={<DeleteIcon />}
            colorScheme="red"
            variant="ghost"
            size="lg"
            ml={4}
            onClick={handleDelete}
            className={"outBtn"}
          />
        )}
      </Flex>
    </Box>
  );
};

export default PostCard;
