"use client"
import Home from "../../components/Home.js";
import { useRouter } from "next/navigation.js";
import { useEffect, useState } from "react";
import { urlBase } from "@/utils/url.js";
import EmptyPage from "@/components/EmptyPage.js";
import NavBarr from "@/components/NavBarr.js";
// import '../styles/home.css'; 
;


export default function HomePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    const checkLogin = async () => {
        const response = await fetch(urlBase, {
            method: 'GET',
            credentials: 'include',
        })
        let stat = await response.json()
        if ('status' in stat && (stat.status === 401 || stat.status === 500)) {
            router.push('/login')
        } else if ('Id' in stat) {
            setUser(stat)
            setLoading(false)
        }
    }
    useEffect(() => {
        checkLogin()
    }, [])
    return (
        loading ? (
            <EmptyPage />
        ) : (
            <>
                <NavBarr User ={user} />
                <Home />
            </>
        )
    )
}