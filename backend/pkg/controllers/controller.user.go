package controllers

import (
	"backend/pkg/db/sqlite"
	Models "backend/pkg/models"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

func GetUsers() []Models.Users {
	var user Models.Users
	var users []Models.Users

	db, err := sqlite.Connect()
	if err != nil {
		HandleError(err, "Fetching database.")
		return nil
	}

	rows, err := db.Query("SELECT * FROM User")
	if err != nil {
		HandleError(err, "Fetching users database.")
		return nil
	}
	for rows.Next() {
		err := rows.Scan(&user.ID, &user.FirstName, &user.LastName, &user.Username, &user.ProfilePhoto, &user.Dob, &user.Bio, &user.Email, &user.Password, &user.Profil)
		if err != nil {
			HandleError(err, "Fetching users database.")
			return users
		}
		users = append(users, user)
	}
	db.Close()
	return users
}

func IfUserExist(email string) (Models.Users, bool) {
	db, err := sqlite.Connect()
	if err != nil {
		HandleError(err, "Fetching database.")
		return Models.Users{}, false
	}
	users := GetUsers()
	// fmt.Println("paaaaaaaaaasssss", users)

	for _, user := range users {
		if user.Email == email {
			return user, true
		}
	}
	db.Close()
	return Models.Users{}, false
}

func CreateUser(email, password, username, firstName, lastName, avatar, dob, bio, profil string) {
	db, err := sqlite.Connect()
	if err != nil {
		HandleError(err, "Fetching database.")
		return
	}

	stmt, err := db.Prepare("INSERT INTO User(FirstName, LastName, Nickname, Avatar, DateofBirth, AboutMe, Email, Password, Profil) values(?, ?, ?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		HandleError(err, "preparing insertion of user")
		return
	}
	res, err := stmt.Exec(firstName, lastName, username, avatar, dob, bio, email, password, profil)
	if err != nil {
		HandleError(err, "Excecuting insertion of user")
		return
	}
	res.RowsAffected()
	log.Printf("email:%s username:%s ; user created\n", email, username)
	db.Close()
}

func GetUserById(id int) string {
	var user string

	db, _ := sqlite.Connect()

	row := db.QueryRow("SELECT FirstName FROM user WHERE Id = ?", id)

	err := row.Scan(&user)
	if err != nil {
		return user
	}

	db.Close()
	return user
}

func GetConnectedUser(w http.ResponseWriter, r *http.Request) {
	session, ok := IsAuthenticated(r)
	if !ok {
		fmt.Println("Aucune connection n'a été trouvé")
	}
	userID := session.IdUser
	//fmt.Println("connected user ", userID)
	type ConnectedUser struct {
		ID int `json:"id"`
	}

	user := ConnectedUser{
		ID: userID,
	}

	jsonData, err := json.Marshal(user)
	if err != nil {
		http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}
