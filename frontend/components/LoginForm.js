'use client'
import React, { useEffect, useState } from "react";
import { Input, Button, Box, Heading, Text, useToast } from '@chakra-ui/react';
import Link from "next/link"
import { useRouter } from "next/navigation";
import cookie from "js-cookie";
import { fetchDatas } from "@/ComponentDatas/fetchDatas";
import EmptyPage from "./EmptyPage";


const LoginForm = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true);
  const toast = useToast()
    const [themeColor, setThemeColor] = useState(null);
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setThemeColor(theme);
  }, []); 

  useEffect(() => {
    const checkIfUserIsLogIn = async () => {
      try {
        const stat = await fetchDatas("");
        if (stat.status === 200) {
          router.push("/home")
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error(error);
      }
    };
    checkIfUserIsLogIn()
  }, [])
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    try {
      const response = await fetch("http://localhost:8080/api/login", {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await response.json();
      if (data.status == "success") {
        cookie.set("session_token", data.token);
        localStorage.setItem('id', data.id);
        router.push('/home')
      } else {
        console.error('Login failed');
        console.log("failed to log in");
        toast({ title: 'Login', position: 'top-center', description: 'Login failed!!! Check your password or email', status: 'error', duration: 3000, isClosable: false })

      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  return (
    <>
      {loading ? (
        <EmptyPage />
      ) : (
        <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.800">
          <Box bg="gray.900" p={8} rounded="md" boxShadow="md" w="md">
            <Heading as="h2" size="xl" textAlign="center" mb={6} color="gray.200">Login</Heading>
            <form onSubmit={handleSubmit}>
              <Box mb={4}>
                <label htmlFor="email" className="text-gray-400 block mb-2">
                  Email
                </label>
                <Input
                  type="text"
                  id="email"
                  placeholder="Your email or username"
                  bg="gray.800"
                  border="1px"
                  borderColor="gray.700"
                  rounded="md"
                  px={4}
                  py={2}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Box>
              <Box mb={4}>
                <label htmlFor="password" className="text-gray-400 block mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  id="password"
                  placeholder="Your password"
                  bg="gray.800"
                  border="1px"
                  borderColor="gray.700"
                  rounded="md"
                  px={4}
                  py={2}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Box>
              <Button
                type="submit"
                colorScheme="blue"
                rounded="md"
                py={2}
                w="100%"
                _hover={{ bg: 'blue.600' }}
                transitionDuration="300"
              >
                Login
              </Button>
            </form>
            <Text mt={2} color="gray.400" textAlign="center">
              If you want to register{" "}
              <Link href="/register" style={{ color: "rgb(66, 165, 245)" }}>
                click here.
              </Link>
            </Text>
          </Box>
        </Box>
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
          div:not(.LOLb2a) {
            color: #000 !important;
            background: #fff !important;
          }
            input:focus {
              background: transparent !important;
            }
          svg[stroke="currentColor"] {
            filter: invert(1);
          }
        `}</style>
      )}
    </>
  );  
};

export default LoginForm;