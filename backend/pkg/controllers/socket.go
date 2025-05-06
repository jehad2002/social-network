package controllers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Client struct {
	Conn *websocket.Conn
	ID   int            
}

// Message structure
type Message struct {
	Text             string `json:"text"`
	SenderId         int    `json:"senderId"`
	SenderName       string `json:"senderName"`
	SenderAvatar     string `json:"senderAvatar"`
	RecipientId      int    `json:"recipientId"`
	DestinataireType string `json:"destinataireType"`
	GroupId          int    `json:"groupId"`
	Timestamp        string `json:"timestamp"`
}

var (
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
// map to save client
	clients   = make(map[*Client]bool)
	clientsMu sync.RWMutex 
	clientMessages   = make(map[*Client]Message)
	clientMessagesMu sync.RWMutex 
	broadcast = make(chan Message)
)

func HandleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	client := &Client{Conn: ws}
// close the chanel
	clientsMu.Lock()
	clients[client] = true
	clientsMu.Unlock()

	for {
		var msg Message
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("Error: %v", err)
			clientsMu.Lock()
			delete(clients, client)
			clientsMu.Unlock()
			break
		}

		clientMessagesMu.Lock()
		clientMessages[client] = msg
		clientMessagesMu.Unlock()

		log.Printf("Message received: %+v", msg)

		broadcast <- msg
	}
}

func HandleMessages() {
	for {
		msg := <-broadcast
		err := InsertMessage(msg)
		if err != nil {
			log.Printf("Error inserting message: %v", err)
			continue
		}
		senderName, avatar, err := GetNicknameByID(msg.SenderId)
		if err != nil {
			log.Printf("Error getting sender nickname: %v", err)
			senderName = "Unknown"
		}
		clientsMu.RLock()
		for client := range clients {
			msgWithSenderName := Message{
				Text:             msg.Text,
				SenderId:         msg.SenderId,
				SenderName:       senderName,
				SenderAvatar:     avatar,
				RecipientId:      msg.RecipientId,
				DestinataireType: msg.DestinataireType,
				GroupId:          msg.GroupId,
				Timestamp:        msg.Timestamp,
			}
			err := client.Conn.WriteJSON(msgWithSenderName)
			if err != nil {
				log.Printf("Error: %v", err)
				client.Conn.Close()
				clientsMu.RUnlock()
				clientsMu.Lock()
				delete(clients, client)
				clientsMu.Unlock()
				break
			}
		}
		clientsMu.RUnlock()
	}
}

func GetOldMessagesHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var requestData struct {
		SenderID         int    `json:"senderId"`
		RecipientID      int    `json:"recipientId"`
		DestinataireType string `json:"recipientType"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	senderID := requestData.SenderID
	recipientID := requestData.RecipientID
	recipientType := requestData.DestinataireType

	messages, err := GetOldMessages(senderID, recipientID, recipientType)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Error fetching old messages", http.StatusInternalServerError)
		return
	}

	messagesJSON, err := json.Marshal(messages)
	if err != nil {
		http.Error(w, "Error encoding messages to JSON", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	w.Write(messagesJSON)
}
