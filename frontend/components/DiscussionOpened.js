"use client"
import React, { useState, useEffect, useRef } from 'react';
import InputEmoji from "react-input-emoji";
import { formatDate } from "@/utils/convert";
import { getConnectedUser } from "./DataHandlerProfil";

const wsUrl = `ws://localhost:8080/ws`;

const DiscussionOpened = ({ interlocutor, type, nameChat, oldMessages }) => {
    const [ws, setWs] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageData, setMessageData] = useState({
        text: "",
        image: null
    });

    const [connectedUser, setConnectedUser] = useState(null);

    useEffect(() => {
        getConnectedUser()
            .then(user => {
                console.log("errr user :", user);
                if (user) {
                    setConnectedUser(user.User);
                }
            })
            .catch(error => {
                console.error("Error fetching connected user:", error);
            });
    }, []);

    useEffect(() => {
        if (Array.isArray(oldMessages) && oldMessages.length > 0) {
            setMessages(oldMessages);
        }
    }, [oldMessages]);

    useEffect(() => {
        if (connectedUser) {
            const socket = new WebSocket(wsUrl);
            socket.onopen = () => console.log("Conn WebSocket.");
            socket.onclose = () => console.log("Conn WebSocket .");
            socket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                console.log("Message received:", message);
                setMessages(prevMessages => {
                    const messageExists = prevMessages.some(msg => msg.timestamp === message.timestamp);
                    if (!messageExists) {
                        return [...prevMessages, message];
                    }
                    return prevMessages;
                });
            };
            setWs(socket);
        }
    }, [connectedUser]);
    // console.log("connc", connectedUser);
    const sendMessage = () => {
        if (ws && connectedUser) {
            const messageDataToSend = {
                text: messageData.text,
                senderId: connectedUser?.Id,
                senderAvatar: connectedUser?.Avatar,
                senderName: connectedUser?.FirstName,
                recipientId: interlocutor,
                destinataireType: type,
                groupId: type === "Friend" ? 0 : interlocutor,
                timestamp: new Date().toISOString(),
            };
            ws.send(JSON.stringify(messageDataToSend));
            setMessageData({ ...messageData, text: "" });

            const messageExists = messages.some(msg => msg.text === messageData.text && msg.timestamp === messageDataToSend.timestamp);
            if (!messageExists) {
                setMessages(prevMessages => [...prevMessages, messageDataToSend]); 
            }
        }
    };

    const handleMsgChange = (text) => {
        setMessageData(prev => ({
            ...prev,
            text: text
        }));
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <>
            {interlocutor !== undefined ? (
                <div className="right-div">
            <div className="top">
                <span className="name">{type === "Group" ? `Group ${nameChat}` : `Friend ${nameChat}`}</span>
           </div>

                    <div className="chat">
                        {messages.map((message, index) => (
                            ((message.recipientId === interlocutor && message.senderId === connectedUser?.Id) ||
                                (message.recipientId === connectedUser?.Id && message.senderId === interlocutor)) &&
                                message.destinataireType === type ? (
                                <div key={index} className={`message ${message.senderId === connectedUser?.Id ? "right" : "left"}`}>
                                    <div className='message-block'>
                                        {message.senderId === interlocutor ? 
                                                message.senderAvatar !== "" ?
                                                <img src={"../images/users/"+message.senderAvatar} className='sender-photo' alt="Sender" /> 
                                                : 
                                                <img src='../images/users/default.png' className='sender-photo' alt="Sender" /> 
                                            : 
                                            null
                                        }
                                        <div className={`bubble ${message.senderId === connectedUser?.Id ? 'me' : 'you'}`}>
                                            <p>{message.text}</p>
                                        </div>
                                    </div>
                                    <span className="name">{message.senderId === connectedUser?.Id ? "Me" : message.senderName}</span>
                                    <span className="your-date">{formatDate(message.timestamp)}</span>
                                </div>
                            ) : (
                                (message.destinataireType === "Group" && message.groupId === interlocutor && type === "Group") ? (
                                    <div key={index} className={`message ${message.senderId === connectedUser?.Id ? "right" : "left"}`}>
                                        <div className='message-block'>
                                            {message.senderId !== connectedUser?.Id ? 
                                                message.senderAvatar !== "" ?
                                                <img src={"../images/users/"+message.senderAvatar} className='sender-photo' alt="Sender" />  
                                                :
                                                <img src='../images/users/default.png' className='sender-photo' alt="Sender" /> 
                                            : null
                                            }
                                            <div className={`bubble ${message.senderId === connectedUser?.Id ? 'me' : 'you'}`}>
                                                <p>{message.text}</p>
                                            </div>
                                        </div>
                                        <span className="name">{message.senderId === connectedUser?.Id ? "Me" : message.senderName}</span>
                                        <span className="your-date">{formatDate(message.timestamp)}</span>
                                    </div>
                                ) : null
                            )
                        ))}
                    </div>
                    <div className="write" onKeyDown={handleKeyPress}>
                        <div style={{ width: "90%" }}  >
                            <InputEmoji
                                value={messageData.text}
                                onChange={handleMsgChange}
                                cleanOnEnter
                                placeholder="Type a message"
                            />
                        </div>
                        <img src="../send.svg" className='send sendLOLL' onClick={sendMessage} alt="Send" />
                    </div>
                </div>
            ) : null}
        </>
    );
};

export default DiscussionOpened;      