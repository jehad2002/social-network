"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import cookie from "js-cookie";
import fetcher from "@/utils/fetcher";
import Notification from "./Notifications";
import Link from "next/link";
import styles from "../app/styles/navbar.module.css";

export default function NavBarr({ User }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState({ users: [], groups: [] });
  const [showResults, setShowResults] = useState(false);
  const [theme, setTheme] = useState("light"); // Theme state
  const searchTimeout = useRef(null);
  const dropdownRef = useRef();
 
  useEffect(() => {
    // Check localStorage for saved theme on load
    const savedTheme = localStorage.getItem("theme");
 
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
      document.body.style.backgroundColor = savedTheme === "light" ? "#fff" : "#333";
      document.querySelector(".container").style.backgroundColor = savedTheme == "light" ? "#fff" : "#333";
      document.querySelector(".search-input").style.backgroundColor = savedTheme === "light" ? "#f0f2f5" : "#494949";
      document.querySelector(".search-input").style.color = savedTheme === "light" ? "#333" : "#fff";
      document.querySelectorAll("p").forEach((p) => {
        p.style.color = savedTheme === "light" ? "#333" : "#fff";
      });
      document.querySelectorAll("h4 ,h1 ,h2 ,h3 ,h5 ,h6").forEach((h)=> {
        h.style.color = savedTheme === "light" ? "#000" : "#fff";
      })
      document.querySelectorAll("label").forEach((label)=> {
        label.style.color = savedTheme === "light" ? "#000" : "#fff";
      })
      document.querySelectorAll("input , textarea").forEach((ele)=> {
        ele.style.color = savedTheme === "light" ? "#000" : "#fff";
      })
      document.querySelectorAll("div:not(.bubble, .GroupButton__st)").forEach((ele)=> {
        ele.style.color = savedTheme === "light" ? "#000" : "#fff";
        ele.style.backgroundColor = savedTheme === "light" ? "#fff" : "#333";
      })
      if (document.querySelector("header")) {
        document.querySelector("header").style.filter = savedTheme === "light" ? "invert(1)" : "";
      }
      const ClassTheme = localStorage.getItem("theme");
      if (ClassTheme) {
        const el = document.querySelector(`.${ClassTheme}`);
        if (el) {
          el.classList.add(savedTheme);
          el.classList.remove(ClassTheme);
        }
      }
    }
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      if (value.trim() !== "") {
        fetch(`http://localhost:8080/search?query=${value}`)
          .then((res) => res.json())
          .then((data) => {
            console.log("🔹 Raw Data from Server:", data);
    
            const users = data.filter((item) => item.type === "user");
            const groups = data.filter((item) => item.type === "group");

            setSearchResults({ users, groups });
            setShowResults(true);
          })
          .catch((err) => {
            console.error("❌ Search error:", err);
            setSearchResults({ users: [], groups: [] });
          });
      } else {
        setSearchResults({ users: [], groups: [] });
        setShowResults(false);
      }
    }, 300);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    window.location.reload();
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme); // Save theme to localStorage
    document.documentElement.setAttribute("data-theme", newTheme); // Change theme
    document.body.style.backgroundColor = newTheme === "light" ? "#fff" : "#333";
    document.querySelector(".container").style.backgroundColor = newTheme == "light" ? "#fff" : "#333";
    document.querySelector(".search-input").style.backgroundColor = newTheme === "light" ? "#f0f2f5" : "#494949";
    document.querySelector(".search-input").style.color = newTheme === "light" ? "#333" : "#fff";
    document.querySelectorAll("p").forEach((p) => {
      p.style.color = newTheme === "light" ? "#000" : "#fff";
    });
    document.querySelectorAll("h4 ,h1 ,h2 ,h3 ,h5 ,h6").forEach((h)=> {
      h.style.color = newTheme === "light" ? "#000" : "#fff";
    })
    document.querySelectorAll("label").forEach((label)=> {
      label.style.color = newTheme === "light" ? "#000" : "#fff";
    })
    document.querySelectorAll("input , textarea").forEach((ele)=> {
      ele.style.color = newTheme === "light" ? "#000" : "#fff";
    })
    document.querySelectorAll("div:not(.bubble, .GroupButton__st)").forEach((ele)=> {
      ele.style.color = newTheme === "light" ? "#000" : "#fff";
      ele.style.backgroundColor = newTheme === "light" ? "#fff" : "#000";
    })
   if (document.querySelector("header")) {
    document.querySelector("header").style.filter = newTheme === "light" ? "invert(1)" : "";
   }
   if (document.querySelector("img.send")) {
    document.querySelector("img.send").style.filter = newTheme === "light" ? "invert(1)" : "";
   }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className={`${styles.navBarDiv}`}>
        <div className="container">
          <div className="left-icons">
            <Link href="/home">
              <img
                src={pathname === "/home" ? "../home_white.svg" : "../home_icon.svg"}
                className="icon"
              />
            </Link>
            <Link href="/groups">
              <img
                src={pathname === "/groups" ? "../group_white.svg" : "../group.svg"}
                className="icon"
              />
            </Link>
            <Link href="/createpost">
              <img
                src={pathname === "/createpost" ? "../post_white.svg" : "../createpost_icon.svg"}
                className="icon"
              />
            </Link>
            <div className="icon">
              <Notification />
            </div>
            <Link href={`/profil?id=${User?.Id}`}>
              <img
                src={pathname === "/profil" ? "../user_white.svg" : "../user_icon.svg"}
                className="icon"
              />
            </Link>
            <Link href="/chat">
              <img
                src={pathname === "/chat" ? "../chat_white.svg" : "../chat_icon.svg"}
                className="icon"
              />
            </Link>
          </div>

          <div className="right-section">
            <div className="search-wrapper" ref={dropdownRef}>
              <input
                type="text"
                placeholder="Search..."
                className="search-input"
                value={searchTerm}
                onChange={handleSearchChange}
              />

              {showResults && (searchResults?.users?.length > 0 || searchResults?.groups?.length > 0) && (
                <div className="search-results">
                  {searchResults?.users?.length > 0 && (
                    <div className="search-category">
                      <strong style={{ color: "#000" }}>👤 Users</strong>
                      {searchResults.users.map((user, index) => (
                        <div
                          key={`user-${index}`}
                          className="search-item"
                          onClick={() => {
                            router.push(`/profil?id=${user.id}`);
                            setSearchTerm("");
                            setShowResults(false);
                          }}
                        >
                          <img
                            src={user.avatar ? `../images/users/${user.avatar}` : "../user_icon.svg"}
                            alt="avatar"
                            className="avatar"
                          />
                          <span>{user.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults?.groups?.length > 0 && (
                    <div className="search-category">
                      <strong style={{ color: "#000" }}>📢 Groups</strong>
                      {searchResults.groups.map((group, index) => (
                        <div
                          key={`group-${index}`}
                          className="search-item"
                          onClick={() => {
                            router.push(`/groups/${group.id}`);
                            setSearchTerm("");
                            setShowResults(false);
                          }}
                        >
                          <img
                            src={group.avatar || "../group.svg"}
                            alt="group avatar"
                            className="avatar"
                          />
                          <span>{group.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              className="logout-button"
              onClick={() => {
                cookie.remove("session_token");
                fetcher.post("/logout", cookie.get("session_token"));
                router.push("/login");
              }}
            >
              <img src="../logout_icon.svg" />
            </button>
            {/* Theme Toggle Button */}
            <button onClick={toggleTheme} className="theme-toggle">
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 16px;
          background-color: #fff;
          border-bottom: 1px solid #ccc;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
        }

        .left-icons {
          display: flex;
          gap: 18px;
          align-items: center;
        }

        .icon {
          width: 28px;
          height: 28px;
          cursor: pointer;
        }

        .right-section {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .search-wrapper {
          position: relative;
        }

        .search-input {
          padding: 6px 12px;
          border-radius: 9999px;
          border: 1px solid #ddd;
          background-color: #f0f2f5;
          font-size: 14px;
          width: 200px;
          transition: all 0.3s ease;
          color: #000;
        }

        .search-input:focus {
          outline: none;
          background: #fff;
          box-shadow: 0 0 0 2px rgba(24, 119, 242, 0.2);
        }

        .search-results {
          position: absolute;
          top: 38px;
          left: 0;
          background: #fff;
          border: 1px solid #ccc;
          border-radius: 8px;
          width: 100%;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          max-height: 200px;
          overflow-y: auto;
          z-index: 999;
        }

        .search-category {
          margin-top: 10px;
          padding: 5px;
          border-bottom: 1px solid #ddd;
        }

        .search-item {
          padding: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: background 0.2s ease;
          color: #000;
        }

        .search-item:hover {
          background-color: #f2f2f2;
        }

        .avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
        }
        .logout-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .logout-button img {
          width: 26px;
          height: 26px;
        }

        .theme-toggle {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
        }
      `}
      </style>
    </>
  );
}
