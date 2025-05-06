"use client"
import Home from '@/components/Home'
import LoginForm from '@/components/LoginForm'
import { ChakraProvider } from "@chakra-ui/react";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { urlBase } from '@/utils/url';
import EmptyPage from '@/components/EmptyPage';
import theme from './theme';

import './styles/chat.css';

import NavBarr from '@/components/NavBarr';

export default function MyApp() {

  const router = useRouter()
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(false);


  const checkIfUserIsLogIn = async () => {
    const response = await fetch(urlBase, {
      method: 'GET',
      credentials: 'include',
    })
    let stat = await response.json()
    if ('status' in stat) {
      router.push('/login')
    } else if ('Id' in stat) {
      setUser(stat)
      setIsLoggedIn(true)
      setLoading(false)
    }
  }

  const [showChat, setShowChat] = useState(false);
  const toggleChat = () => {
    setShowChat(!showChat);
  };

  useEffect(() => {
    checkIfUserIsLogIn()
  }, [])
  return (
    <ChakraProvider theme={theme}>
      {
        loading ? (
          <EmptyPage />
        ) : (
          isLoggedIn ? (
            <>
              <NavBarr User={user} />
              <Home />
            </>
          ) : (
            <LoginForm />
          )
        )
      }
    </ChakraProvider>
  )
}