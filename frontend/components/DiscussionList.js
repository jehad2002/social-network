"use client"
import React, { useState, useEffect } from "react";
// import Chat from "./DiscussionOpened";
import { getConnectedUser } from "./DataHandlerProfil";
import { useGetData } from "@/useRequest";
import DiscussionOpened from "./DiscussionOpened";
// const apiUrl = `http://localhost:8080/api/usersgroups`;
const oldMessagesUrl = `http://localhost:8080/api/oldmessages`;
export default function DiscussionList() {
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUserType, setSelectedUserType] = useState(null);
    const [selectedUserName, setSelectedUserName] = useState(null);
    const [data, setData] = useState({ users: [], groups: [] });
    const [filteredData, setFilteredData] = useState({ users: [], groups: [] });
    const [oldMessages, setOldMessages] = useState([]);


    const dataUse = useGetData("/api/usersgroups")
    useEffect(() =>{
        if (dataUse.datas){
            setData(dataUse.datas);
            setFilteredData(dataUse.datas);
        }
    }, [dataUse.datas])
    const [connectedUser, setConnectedUser] = useState(null);

    useEffect(() => {
        getConnectedUser()
            .then(user => {
                if (user) {
                    setConnectedUser(user.User);
                }
            })
            .catch(error => {
                console.error("Error fetching connected user:", error);
            });
    }, []);

    const handleChatClick = async (id, type, name) => {
        setSelectedUserId(id);
        setSelectedUserType(type);
        setSelectedUserName(name);
        setOldMessages([]);

        console.log('userId   ', id);

        try {
            const response = await fetch(oldMessagesUrl, {                                           
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    senderId: connectedUser.Id,
                    recipientId: id,
                    recipientType: type,
                }),
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const messages = await response.json();
            console.log(messages, "meess")
            setOldMessages(messages);
        } catch (error) {
            console.error('Error fetching old messages:', error);
        }
    };

    return (
        <>
            <div className="left-div">
                <ul className="people">
                    {(!filteredData.users || !filteredData.groups || filteredData.users.length === 0) && (
                        <p></p>
                    )}
                    {filteredData.users && filteredData.users.map((user) => (
                        <li key={user.id} className="person">
                            <img src={user.avatar} className="user" />
                            <p
                                onClick={() => handleChatClick(user.id, "Friend", user.name)}
                            >
                                {user.name}
                            </p>
                        </li>
                    ))}
                </ul>
                <hr />
                <ul className="people">
                    {filteredData.groups && filteredData.groups.map((group) => (
                        <li key={group.id} className="person">
                            <img src={group.imageUrl} className="user" />
                            <p
                                onClick={() => handleChatClick(group.id, "Group", group.name)}
                            >
                                {group.name}
                            </p>
                        </li>
                    ))}
                    
                </ul>
            </div>
        
            {selectedUserId && (
                <DiscussionOpened
                    interlocutor={selectedUserId}
                    type={selectedUserType}
                    nameChat={selectedUserName}
                    oldMessages={oldMessages}
                />
            )}
        </>
    );
}