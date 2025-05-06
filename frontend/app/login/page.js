"use client"
import React, { useEffect, useState } from 'react';
import LoginForm from '../../components/LoginForm';
import { useRouter } from 'next/navigation';
import { useGetData } from '@/useRequest';
import EmptyPage from '@/components/EmptyPage';

const Login = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true);

  const useGet = useGetData("/api/")
  useEffect(() => {
    if (useGet.datas) {
      if ('Id' in useGet.datas) {
        router.push('/home')
      }else if ('status' in useGet.datas && (useGet.datas.status === 401 || useGet.datas.status === 500)) {
        setLoading(false)
      }
    }
  }, [useGet.datas])
  return (
    loading ? (
      <EmptyPage />
    ) : (
      <LoginForm />
    )
  )
};

export default Login;