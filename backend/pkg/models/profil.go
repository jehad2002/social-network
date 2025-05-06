package Models

import (
	"database/sql"
	"fmt"
)

type Data struct {
	Name       string `json:"name"`
	Email      string `json:"email"`
	Username   string `json:"username"`
	Profil     string `json:"profil"`
	Biographie string `json:"biographie"`
}

type IsFollowingStatus struct {
	Ok     bool `json:"ok"`
	Status int  `json:"status"`
}

type UserData struct {
	User         User
	Posts        []PostDatas
	Followers    []UserFollow `json:"followers"`
	Following    []UserFollow `json:"following"`
	IsFollowing  IsFollowingStatus
	ImagesPosted []string
}

func GetUsers(db *sql.DB) ([]User, error) {
	rows, err := db.Query("SELECT * FROM User")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []User

	for rows.Next() {
		var user User
		err := rows.Scan(&user.Id, &user.FirstName, &user.LastName, &user.NickName, &user.Avatar, &user.DateOfBirth, &user.AboutMe, &user.Email, &user.Password)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

func GetUserByID(db *sql.DB, userID int) (User, error) {
	row := db.QueryRow("SELECT * FROM User WHERE Id = ?", userID)

	var user User
	err := row.Scan(&user.Id, &user.FirstName, &user.LastName, &user.NickName, &user.Avatar, &user.DateOfBirth, &user.AboutMe, &user.Email, &user.Password, &user.Profil)
	if err != nil {
		fmt.Println(" error while scanning user", err)
		return User{}, err
	}

	return user, nil
}
