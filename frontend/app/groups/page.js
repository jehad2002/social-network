"use client"
import LeftComponent from "@/components/LeftComponent";
import React, { useEffect, useState } from "react";
import { Flex, Box } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useGetData } from "@/useRequest";
import NavBarr from "@/components/NavBarr";
import EmptyPage from "@/components/EmptyPage";

const Group = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [themeColor, setThemeColor] = useState(null);
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setThemeColor(theme);
  }, []); 
  const useGet = useGetData("/api/")
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
  return (
    <>
  {loading ? (
      <EmptyPage />
    ) : (
      <>
        <NavBarr User={user} />
        <div className="min-h-screen flex justify-center">
          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "center", md: "flex-start" }}
            justify="center"
            w="100%"
            flex="1"
            overflowY="auto"
            mt="30px"
          >

            <Box
              w={{ base: "100%", md: "60%" }}
              p={4}
              mx={{ md: 4 }}
              borderColor="gray.200"
              borderRadius="md"
              ml={{ md: 250 }}
            >
              <LeftComponent />
            </Box>

          </Flex>
        </div>
      </>
    )}
      {themeColor == "light" && (
        <style jsx global>{`
          body {
            background: #fff;
          }
          p {
            color: #000;
          }
          h4 , h1 , h2 , h3 , h5 , h6{
            color: #000 !important;
          }
          label {
            color: #000 !important;
          }
          input {
            color: #000;
             background: transparent !important;
          }
          textarea {
            color: #000;
          }
          button {
            color: #000;
          }
          div:not(.GroupButton__st) {
            color: #000 !important;
            background: #fff !important;
          }
            input:focus {
              background: transparent !important;
            }
              header {
                filter: invert(1);
              }
          button[aria-label="Close"] {
          filter: invert(1);
        }
          a:not(.Link_createGroup ) {
            color: #000 !important;
          } 
            button {
              color: #fff !important;
            }
              h4 ,h1 ,h2 ,h3 ,h5 ,h6 {
                filter: invert(1);
              }
        `}</style>
      )}
    </>
  );
};

export default Group;
