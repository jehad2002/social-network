'use client'
import { useRef, useState, useEffect } from "react"
import { Box, Flex, Image, Text, IconButton, Modal, ModalOverlay, ModalContent, useDisclosure, Avatar, Badge, useToast } from "@chakra-ui/react";
import { AiOutlineHeart, AiOutlineComment, AiFillEdit, AiFillHeart } from "react-icons/ai";
import fetcher from "@/utils/fetcher";
import {toBase64} from "@/utils/convert";
import styles from "../app/styles/createpost.module.css"
import { fetchWithBody } from "@/ComponentDatas/fetchDatas";
import { useRouter } from "next/navigation";
import { CheckIcon, MinusIcon, RepeatIcon } from "@chakra-ui/icons";
// import { useRouter } from "next/navigation";

const PostPage = ({ post, user }) => {
  const toast = useToast()
  const router = useRouter()
  const [isLikePost, setIsLikePost] = useState(post.IsLike);
  const [numLikes, setNumLikes] = useState(post.NumLikes);

  const updateLike = async () => {
    var newIsLikePost;
    var newNumLikes;
    if (isLikePost) {
      newIsLikePost = false
      newNumLikes = numLikes - 1
    } else {
      newIsLikePost = true
      newNumLikes = numLikes + 1
    }


    const body = JSON.stringify({
      postId: post.Id,
      commentId: 0,
    })
    try {
      const datas = await fetchWithBody("action", body);
      if (datas.success) {
        toast({ title: 'React Post', position: 'top-center', description: datas.message, status: 'success', duration: 1000, isClosable: false })
        setIsLikePost(newIsLikePost);
        setNumLikes(newNumLikes);
        // console.log("SUCCESS: ", datas.message);
      } else {
        // console.log("FAILED: ", datas.message);
        toast({ title: 'React Post', position: 'top-center', description: datas.message, status: 'error', duration: 1000, isClosable: false })

      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={4} mb={4}>
      <Flex alignItems="center" mb={2}>
        <Avatar
          src={`../images/users/${post.UserAvatar !== `` ? post.UserAvatar : `default.png`}`}
          onClick={() => {
            if (post.UserId !== 0) {
              router.push(`/profil/?id=${post.UserId}`)
            }
          }}
          cursor={"pointer"} />
        <Box ml='3'>
          <Text fontWeight="bold">{post.NickName}</Text>
        </Box>
        {
          post.Follow === -2 ? (
            // Is my post
            <></>
          ) : (
            post.Follow === -1 ? (
              <Box ml='3'>
                {/* Not following  */}
                <Badge colorScheme='red'><MinusIcon /></Badge>
              </Box>
            ) : (
              post.Follow === 0 ? (
                <Box ml='3'>
                  {/* In Progress  */}
                  <Badge colorScheme='blue'><RepeatIcon /></Badge>
                </Box>
              ) : (
                <Box ml='3'>
                  {/* Already  */}
                  <Badge colorScheme='whatsapp' size={"5px"}><CheckIcon /></Badge>
                </Box>
              )
            )
          )
        }
      </Flex>
      <Flex mb={2}>
        <Badge colorScheme='blue'>{post.DatePosted}</Badge>
      </Flex>
      <Text mt={2} textAlign="justify">
        {post.postText}
      </Text>
      {
        post.imageName !== `` ? (
          <Flex justifyContent={"center"} mt={2}>
            <Image
              src={`../${post.imageName.replace(/.*public[\\/]/, '').replace(/\\/g, '/')}`}
              boxSize="100%"
              height="auto"
            />
          </Flex>
        ) : (
          <></>
        )
      }
      <Flex alignItems="center" mt={1}>
        <IconButton
          aria-label="Like"
          icon={isLikePost ? (<AiFillHeart />) : (<AiOutlineHeart />)}
          colorScheme={isLikePost ? `red` : `gray`}
          variant="ghost"
          size="lg"
          mr={2}
          onClick={updateLike}
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
        />
        <Text fontSize="sm" color="gray.600">
          {post.NumComments}
        </Text>
        <Flex ml={"20px"} alignItems="center" justifyContent={"right"}>
          <ModalCreateComment user={user} PostId={post.Id} />
        </Flex>
      </Flex>
    </Box>
  );
};
export default PostPage;

const ModalCreateComment = ({ user, PostId }) => {

  const { isOpen, onOpen, onClose } = useDisclosure();

  const fileInputRef = useRef(null);
  const handleIconClick = () => {
    fileInputRef.current.click();
  };

  // useEffect(() =>{
  //   const textarea = document.querySelector('textarea');
  //   textarea.addEventListener('input', () => {
  //       const maxLength = 500;
  //       if (textarea.value.length > maxLength) {
  //           textarea.value = textarea.value.slice(0, maxLength); 
  //       }
        
  //       textarea.style.height = 'auto';
  //       textarea.style.height = textarea.scrollHeight + 'px';
  //   });
  // }, [])

  const handleRemoveImage = () => {  
    setFormData(prev => ({
      ...prev,
      image: null 
    }));
  };

  const [formData, setFormData] = useState({
    CommentText: "",
    postId: PostId,
    userId: user.Id,
    image: null,
    postVisibility: "",
  })

  const handleDataChange = (event) => {
    const { type, name, value } = event.target;

    if (type === "file") {
      const file = event.target.files[0];
      setFormData(prev => ({
        ...prev,
        image: file 
      }));
    }
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  const handleSubmit = async (event) => {
    // const router = useRouter();
    event.preventDefault()
    let imageName
    if (formData.image) {
      imageName = formData.image.name
      formData.image = await toBase64(formData.image)
    }
    formData.imageName = imageName

    fetcher.post("/createcomment", formData).then(response => {
      if (response.status == 200) {
        console.log("data sended")
        setFormData(prev => ({
          ...prev,
          CommentText: "",
          image: null,
          postVisibility: "",
        }))
        onClose()
      } else {
        console.log("error", response.status);
      }
    })
    // console.log("formData", formData);
  }

  return (
    <>
      <IconButton
        aria-label="Like"
        icon={<AiFillEdit />}
        colorScheme="gray"
        variant="ghost"
        size="lg"
        mr={2}
        onClick={onOpen}
      />

      <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={undefined} size="xl" finalFocusRef={undefined}>
        <ModalOverlay />
        <ModalContent>
          <div className={styles.divForm}>
            <div className={styles.postForm}>
              <img 
              src={`../images/users/${user.Avatar !== `` ? user.Avatar : `default.png`}`}
              className={styles.userPhoto} />
              <span className={styles.userName}>{user.NickName}</span>
              <form onSubmit={handleSubmit} method="post" encType="multipart/form-data" id={styles.formPost}>
                <textarea id="post-content" name="CommentText" rows="1" className={styles.textarea} placeholder="Enter your comment here..." value={formData.CommentText || ""} onChange={handleDataChange} ></textarea>
                <input type="file" name="image" accept="image/*" className={styles.imageInput} ref={fileInputRef} onChange={handleDataChange} />
                {formData.image && (
                  <div className={styles.imageContainer}>
                    <img src={URL.createObjectURL(formData.image)} alt="selected" className={styles.selectedImage} />
                    <span className={styles.removeIcon} onClick={handleRemoveImage}>&times;</span>
                  </div>
                )}
                <img src="../photo.png" className={styles.galerie} onClick={handleIconClick} />
                <div className={styles.postVisibility}>
                  <div className={styles.select}>
                    <button id={styles.publier} type="submit" onClick={handleSubmit} >Publish</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
};
