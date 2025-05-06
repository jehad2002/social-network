package sqlrequest

import (
	"backend/pkg/db/sqlite"
	Models "backend/pkg/models"
	"database/sql"
	"fmt"
)

func GetFollowUser(userID int, connectedUserID int, follower bool) []Models.UserFollow {
	db, err := sqlite.Connect()
	if err != nil {
		return nil
	}
	defer db.Close()
	var query string
	if follower {
		query = "SELECT u.*, f.Id as FollowId, f.Type FROM User u JOIN Follow f ON u.Id = f.Follower WHERE f.Following = ? AND f.Type = 1"
	} else {
		query = "SELECT u.*, f.Id as FollowId, f.Type FROM User u JOIN Follow f ON u.Id = f.Following WHERE f.Follower = ? AND f.Type = 1"
	}
	rows, err := db.Query(query, userID)
	if err != nil {
		return nil
	}
	defer rows.Close()
	var users []Models.UserFollow
	for rows.Next() {
		var user Models.User
		var followId int
		var followType int
		err := rows.Scan(&user.Id, &user.FirstName, &user.LastName, &user.NickName, &user.Avatar, &user.DateOfBirth, &user.AboutMe, &user.Email, &user.Password, &user.Profil, &followId, &followType)
		if err != nil {
			return nil
		}
		//fmt.Println("", followType)
		isfollower, err := IsFollower(db, connectedUserID, user.Id)
		if err != nil {
			fmt.Println("errrrrrrrrrrrrrrrrrrrrrrrrrrrrrr4444444444444444444444444: ", err)
		}
		userFollow := Models.UserFollow{
			Use:         user,
			FollowId:    followId,
			Status:      followType,
			IsFollowing: isfollower,
		}
		users = append(users, userFollow)
	}
	return users
}

func InsertFollow(db *sql.DB, follower, following, status int) (int64, error) {
	stmt, err := db.Prepare("INSERT INTO Follow(Follower, Following, Type) VALUES(?, ?, ?)")
	if err != nil {
		return -1, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(follower, following, status)
	if err != nil {
		return -1, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return -1, err
	}

	return id, nil
}

func DeleteFollow(db *sql.DB, followerID int, followingID int) error {
	query := "DELETE FROM Follow WHERE Follower = ? AND Following = ?"

	_, err := db.Exec(query, followerID, followingID)
	if err != nil {
		return err
	}

	return nil
}

func IsFollowing(db *sql.DB, FollowerId, FollowingId int) int {
	query := "SELECT * FROM Follow WHERE Follower =? AND Following =?"
	rows, err := db.Query(query, FollowerId, FollowingId)
	if err != nil {
		return -1
	}
	defer rows.Close()
	for rows.Next() {
		var follow Models.Follow
		err := rows.Scan(&follow.ID, &follow.Follower, &follow.Following, &follow.Type)
		if err != sql.ErrNoRows {
			return follow.Type
		}
	}
	return -1
}
