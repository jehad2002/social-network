package sqlrequest

import (
	"database/sql"
	"fmt"
)

func IsFollower(db *sql.DB, follower int, following int) (bool, error) {
	query := "SELECT COUNT(*) FROM Follow WHERE Follower = ? AND Following = ?"
	var count int
	err := db.QueryRow(query, follower, following).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("err followers : %v", err)
	}
	return count > 0, nil
}

func GetFollowType(db *sql.DB, follower int, following int) (int, error) {
	var followType int
	if following == follower {
		return 0, nil
	}
	query := "SELECT Type FROM Follow WHERE Follower = ? AND Following = ?"
	row := db.QueryRow(query, follower, following)
	err := row.Scan(&followType)
	if err != nil {
		return 0, err
	}
	return followType, nil
}
