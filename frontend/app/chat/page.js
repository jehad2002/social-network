"use client"
import DiscussionList from "@/components/DiscussionList"
//import Chat from "@/components/DiscussionOpened"
import EmptyPage from "@/components/EmptyPage"
import NavBarr from "@/components/NavBarr"
import { useGetData } from "@/useRequest"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const chatPage = () => {
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
        loading ? (
            <EmptyPage />
        ) : (
            <>
                <NavBarr User={user} />
                <div className="wrapper">
                    <DiscussionList />
                </div>
                {themeColor == "light" && (
      <style jsx global>{`
      body {
        background: #fff;
      }
      p {
        color: #000 !important;
      }
      h4 ,h1 ,h2 ,h3 ,h5 ,h6{ 
        color: #000 !important;
      }
      label {
        color: #000 !important;
      }
      input {
        color: #000;
      }
      textarea {
        color: #000;
      }
      button {
        color: #000;
      }
        div:not(.bubble) {
           color: #000;
           background: #fff !important;
        }
        header {
        filter: invert(1);
        }
        .top {
            background: gray !important;
            color: #fff !important;
        }
            .bubble {
                color: #000 !important;
                background: #d9d9d9 !important;
            }
                .bubble::before {
                    background: #d9d9d9 !important;
                }
        .send {
            filter: invert(1);
        }
      `}
    </style>
    )}
            </>
        )
    )
}

export default chatPage
