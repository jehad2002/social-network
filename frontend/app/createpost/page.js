"use client"
import PostForm from "../../components/PostForm.js";;
import { Flex, Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import NavBarr from "@/components/NavBarr.js";
import EmptyPage from "@/components/EmptyPage.js";
import { useRouter } from "next/navigation.js";
import { useGetData } from "@/useRequest";


export default function Page() {
  const router = useRouter()
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const useGet = useGetData("/api/")
  useEffect(() => {
    if (useGet.datas) {
      if ('status' in useGet.datas && (useGet.datas.status === 401 || useGet.datas.status === 500)) {
        router.push('/login')
      }else if ('Id' in useGet.datas) {
        setUser(useGet.datas)
        setLoading(false)
      }
    }
  }, [useGet.datas])
  return (
    loading ? (
      <EmptyPage />
    ) : (
      <>
        <NavBarr User={user} />
        <Box
          p={4}
          mx={{ md: 4 }}
          borderColor="gray.200"
          borderRadius="md"
          mt={"60px"}
        >
          <PostForm />
        </Box>
      </>
    )
  );
}
