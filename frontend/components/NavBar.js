"use client";
import{ useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "../app/styles/navbar.module.css";
import cookie from "js-cookie";
import fetcher from "@/utils/fetcher";
import { getConnectedUser } from "./DataHandlerProfil";
import React from "react";
import Notification from "./Notifications";
import Link from "next/link"

export default function NavBar({ toggleChat }) {
  //const userId = localStorage.getItem("id");
  const [userId, setUserId] = useState(null);
  const router = useRouter();
  getConnectedUser()
    .then(user => {
      setUserId(user.userId)
    })
    .catch(error => {
      console.error("Errrrrr55 :", error);
    });

    //console.log("user id", userId);
  const btnRef = React.useRef()

  function handleclickProfil() {
    //const userId = user.Id;
    const requestOptions = {
      credentials: "include",
    };
    fetch(`http://localhost:8080/profil?id=${userId}`, requestOptions)
      .then((response) => {
        if (response.status == 401){return
          router.push("/login")

        }
        if (!response.ok) {
          throw new Error("Err login");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Response1 :", data);
        router.push(`/profil?id=${userId}`)
      })
      .catch((error) => {
        console.error("Err :", error);
      });
  }

  const [currentImage, setCurrentImage] = useState(null);

  const handleImageClick = (imageSrc) => {
    setCurrentImage(imageSrc);
    let route = imageSrc.split("_")[0].split("/")[1]
    router.push(`/${route}`)
    console.log("route", route);
  };
  const pathname = usePathname()
  return (
    <>
      <div className={styles.navBarDiv}>
        <div className={styles.container}>
          <div className={styles.app}>
            <div className={styles.home}>
                <Link href="/home">
                  {pathname == "/home" ? 
                    <img src="../home_white.svg" /> 
                  :
                    <img src="../home_icon.svg"/> 
                  }
                </Link>
            </div>
            <div className={styles.groups}>
                <Link href="/groups">
                  {pathname == "/groups" ? 
                    <img src="../group_white.svg" /> 
                  :
                    <img src="../group.svg"/> 
                  }
                </Link>
            </div>
            <div className={styles.note}>
                <Link href="/createpost">
                  {pathname == "/createpost" ? 
                    <img src="../post_white.svg" /> 
                  :
                    <img src="../createpost_icon.svg"/> 
                  }
                </Link>
            </div>
            <div className={styles.notification}>
              <Notification />
            </div>
            <div className={styles.user}>
                <Link href={`/profil?id=${userId}`}>
                  {pathname == "/profil" ? 
                    <img src="../user_white.svg" /> 
                  :
                    <img src="../user_icon.svg"/> 
                  }
                </Link>
            </div>
            <div className={styles.chat}> 
              <Link href="/chat">
                    {pathname == "/chat" ? 
                      <img src="../chat_white.svg" /> 
                    :
                      <img src="../chat_icon.svg"/> 
                    }
              </Link>
            </div>
          </div>
          <div className={styles.logout}>
            <Logout />
          </div>
        </div>
      </div>
    </>
  );
}

function Logout() {
  const router = useRouter();

  const handleLogout = async () => {
    let cookieValue = cookie.get("session_token")
    // console.log("cookieValue", cookieValue);
    cookie.remove("session_token");
    fetcher.post("/logout", cookieValue)
    router.push("/login");
  };

  return (
    <button onClick={handleLogout}>
      <img src="../logout_icon.svg" />
    </button>
  );
}
