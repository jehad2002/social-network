package controllers

import (
	"backend/pkg/db/sqlite"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"
)

var HelpUserID int

type GroupMember struct {
	UserChatID int    `json:"UserChatId"`
	Name       string `json:"name"`
}

type Group struct {
	Id           int           `json:"id"`
	Name         string        `json:"name"`
	GroupCreator int           `json:"group_creator"`
	CreationDate time.Time     `json:"creation"`
	Description  string        `json:"description"`
	ImageURL     string        `json:"imageUrl"`
	Members      []GroupMember `json:"members"`
}

type UserChat struct {
	Id     int    `json:"id"`
	Name   string `json:"name"`
	Email  string `json:"email"`
	Avatar string `json:"avatar"`
	Status string `json:"status"`
}

type UserGroupData struct {
	Users  []UserChat `json:"users"`
	Groups []Group    `json:"groups"`
}

func GetFollowerschat(userID int) ([]UserChat, error) {
	var followers []UserChat
	db, err := sqlite.Connect()
	if err != nil {
		return nil, err
	}
	defer db.Close()
// the query to get the data 
	query := `
        SELECT u.Id, u.FirstName, u.LastName, u.Email, u.Avatar
        FROM User u
        INNER JOIN Follow f ON u.Id = f.Following
        WHERE f.Follower = ?
    `
// to run the query and get the data result
	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	connectedUsers := make(map[int]bool)

	clientsMu.RLock()
	for client := range clients {
		connectedUsers[client.ID] = true
	}
	clientsMu.RUnlock()
// to see if user is connected or not in websocket

///////////////////////////////////////////////////////////////////////
	for rows.Next() {
		var follower UserChat
		var id int
		var firstName, lastName, email, avatar string
		err := rows.Scan(&id, &firstName, &lastName, &email, &avatar)
		if err != nil {
			return nil, err
		}
		follower.Id = id
		follower.Name = fmt.Sprintf("%s %s", firstName, lastName)
		follower.Email = email
		if avatar == "" {
			follower.Avatar = "../images/users/default.png"
		} else {
			follower.Avatar = "../images/users/" + avatar
		}
// to read res the queery and save in userchat the var 
///////////////////////////////////////////////////////////////////////
// defult image
		_, ok := connectedUsers[id]
		if ok {
			follower.Status = "available"
		} else {
			follower.Status = "inactive"
		}

		followers = append(followers, follower)
	}

	query = `
        SELECT u.Id, u.FirstName, u.LastName, u.Email, u.Avatar
        FROM User u
        INNER JOIN Follow f ON u.Id = f.Follower
        WHERE f.Following = ? AND Type = 1
    `

	rows, err = db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var follower UserChat
		var id int
		var firstName, lastName, email, avatar string
		err := rows.Scan(&id, &firstName, &lastName, &email, &avatar)
		if err != nil {
			return nil, err
		}
		follower.Id = id
		follower.Name = fmt.Sprintf("%s %s", firstName, lastName)
		follower.Email = email
		if avatar == "" {
			follower.Avatar = "../images/users/default.png"
		} else {
			follower.Avatar = "../images/users/" + avatar
		}

		_, ok := connectedUsers[id]
		if ok {
			follower.Status = "available"
		} else {
			follower.Status = "inactive"
		}

		alreadyExists := false
		for _, existingFollower := range followers {
			if existingFollower.Id == id {
				alreadyExists = true
				break
			}
		}
		if !alreadyExists {
			followers = append(followers, follower)
		}
	}

	//fmt.Println(followers, "iiciii")
	return followers, nil
}

func GetGroupsChat(userID int) ([]Group, error) {
	var groups []Group
	//fmt.Println(userID)
	db, err := sqlite.Connect()
	if err != nil {
		return nil, fmt.Errorf("error opening database connection: %v", err)
	}
	defer db.Close()

	query := `
        SELECT DISTINCT g.Id, g.Name
        FROM Groups g
        INNER JOIN groupMembers gm ON g.Id = gm.GroupID
        WHERE gm.UserID = ?
    `

	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("error querying database: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var group Group
		err := rows.Scan(&group.Id, &group.Name)
		if err != nil {
			return nil, fmt.Errorf("error scanning row: %v", err)
		}
		group.ImageURL = "../group_white.svg"

		groups = append(groups, group)
	}

	return groups, nil
}

func GetUsersAndGroupsHandler(w http.ResponseWriter, r *http.Request) {
	userSession, stat := IsAuthenticated(r)
	HelpUserID = userSession.IdUser
	if !stat {
		fmt.Println("User is not authenticated")
		StatusUnauthorized(w)
		return
	}

	followers, err := GetFollowerschat(HelpUserID)
	if err != nil {
		fmt.Println("Error retrieving followers:", err)
		StatusInternalServerError(w)
		return
	}

	groups, err := GetGroupsChat(HelpUserID)
	if err != nil {
		fmt.Println("Error retrieving groups:", err)
		StatusInternalServerError(w)
		return
	}

	userGroupData := struct {
		Users  []UserChat `json:"users"`
		Groups []Group    `json:"groups"`
	}{
		Users:  followers,
		Groups: groups,
	}
	//fmt.Println("icicicici", userGroupData)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userGroupData)
}

func InsertMessage(msg Message) error {
	db, err := sqlite.Connect()
	if err != nil {
		return err
	}
	defer db.Close()

	currentTime := time.Now().Format("2006-01-02 15:04:05")
	var groupeID int

	if msg.DestinataireType == "Friend" {
		groupeID = 0 
	} else {
		groupeID = msg.GroupId 
	}

	query := "INSERT INTO Message (Expediteur, Destinataire, DestinataireType, GroupeID, Contenue, Date, Lu) VALUES (?, ?, ?, ?, ?, ?, ?)"
	stmt, err := db.Prepare(query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(msg.SenderId, msg.RecipientId, msg.DestinataireType, groupeID, msg.Text, currentTime, false)
	if err != nil {
		return err
	}

	fmt.Println("Message inserted successfully")
	return nil
}

func GetOldMessages(senderID, recipientID int, recipientType string) ([]Message, error) {
	var messages []Message

	db, err := sqlite.Connect()
	if err != nil {
		return nil, err
	}
	defer db.Close()

	var query string
	if recipientType == "Friend" {
		query = `
            SELECT m.Contenue, m.Expediteur, u.FirstName, u.Avatar,m.Destinataire, m.DestinataireType, 0 AS GroupeID, m.Date
            FROM Message m
            JOIN User u ON m.Expediteur = u.ID
            WHERE (m.Expediteur = ? AND m.Destinataire = ?) OR (m.Expediteur = ? AND m.Destinataire = ?)
            ORDER BY m.Date ASC
        `
	} else if recipientType == "Group" {
		//fmt.Println(recipientID, " avant ici")
		query = `
			SELECT DISTINCT m.Contenue, m.Expediteur, u.FirstName, u.Avatar,m.Destinataire, m.DestinataireType, m.GroupeID, m.Date
			FROM Message m
			JOIN User u ON m.Expediteur = u.ID
			JOIN groupMembers gm ON gm.UserID = ? AND gm.GroupID = m.GroupeID
			WHERE m.DestinataireType = 'Group' AND m.GroupeID = ?
			ORDER BY m.Date ASC
		`
	} else {
		return nil, errors.New("recipient type not supported")
	}

	rows, err := db.Query(query, senderID, recipientID, recipientID, senderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var msg Message
		var groupId int 
		err := rows.Scan(&msg.Text, &msg.SenderId, &msg.SenderName, &msg.SenderAvatar,&msg.RecipientId, &msg.DestinataireType, &groupId, &msg.Timestamp)
		if err != nil {
			return nil, err
		}
		msg.GroupId = groupId 
		messages = append(messages, msg)
	}

	// fmt.Println(recipientID, " apres  ici")
	// fmt.Println(messages)

	return messages, nil
}

func GetNicknameByID(userID int) (string, string,error) {
	var (
		nickname string
		avatar string
	)
	db, err := sqlite.Connect()
	if err != nil {
		return "", "",err
	}
	defer db.Close()

	query := `SELECT FirstName, Avatar FROM User WHERE Id = ?`

	err = db.QueryRow(query, userID).Scan(&nickname, &avatar)
	if err != nil {
		return "", "",err
	}

	return nickname, avatar,nil
}
