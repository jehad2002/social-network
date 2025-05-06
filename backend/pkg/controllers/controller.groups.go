package controllers

import (
	"backend/pkg/db/sqlite"
	Models "backend/pkg/models"
	"database/sql"
	"fmt"
	"log"
	"time"
)

func addGroupToDB(name, description string, id int) {
	db, err := sqlite.Connect()
	if err != nil {
		HandleError(err, "Fetching database.")
		return
	}

	stmt, err := db.Prepare("INSERT INTO Groups(Name, Group_creator, Creation_date, Description) VALUES (?,?,?,?)")
	if err != nil {
		HandleError(err, "preparing insertion of user")
		return
	}

	res, err := stmt.Exec(name, id, time.Now(), description)
	if err != nil {
		HandleError(err, "Excecuting insertion of user")
		return
	}

	res.RowsAffected()
	log.Printf("group:%s created by:%d \n", name, id)
	db.Close()
}

func GetGroupsAndStuff(id int) Models.Group { 
	var group Models.Group
	// var groups []Models.Group

	db, err := sqlite.Connect()
	if err != nil {
		HandleError(err, "Fetching database.")
		return group
	}

	rows, err := db.Query("SELECT * FROM Groups WHERE id = ?", id)
	if err != nil {
		HandleError(err, "Fetching groups database.")
		return group
	}
	for rows.Next() {
		err := rows.Scan(&group.Id, &group.Name, &group.Group_Creator, &group.Creation_Date, &group.Description)
		if err != nil {
			HandleError(err, "Fetching groups database.")
			return group
		}
		// groups = append(groups, group)
	}
	db.Close()
	return group
}

type GroupWithMembership struct {
	Group    Models.Group
	IsMember bool
	RequestedToJoin bool
}

func GetGroupNamesAndMembership(userID int) ([]GroupWithMembership, error) {
	var groupsWithMembership []GroupWithMembership

	db, err := sqlite.Connect()
	if err != nil {
		return nil, err
	}
	defer db.Close()

	rows, err := db.Query(`
        SELECT 
            g.id, 
            g.name, 
            g.group_creator
        FROM 
            groups AS g
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var groupId int
		var groupName string
		var groupCreator int
		if err := rows.Scan(&groupId, &groupName, &groupCreator); err != nil {
			return nil, err
		}

		isMember, err := IsMemberOfGroup(userID, groupId)
		if err != nil {
			return nil, err
		}

		ok := HasARequest(userID, groupId, "MembershipRequests")

		groupWithMembership := GroupWithMembership{
			Group: Models.Group{
				Id:            groupId,
				Name:          groupName,
				Group_Creator: groupCreator,
			},
			IsMember: isMember,
			RequestedToJoin: ok,
		}

		groupsWithMembership = append(groupsWithMembership, groupWithMembership)
	}

	return groupsWithMembership, nil
}

func CheckIfGroupExists(id int) (bool, error) {
	db, err := sqlite.Connect()
	if err != nil {
		return false, err
	}
	defer db.Close()

	query := "SELECT COUNT(*) FROM Groups WHERE Id = ?"
	var count int
	err = db.QueryRow(query, id).Scan(&count)
	if err != nil {
		return false, err
	}

	if count > 0 {
		return true, nil
	} else {
		return false, nil
	}
}

func CheckIfCreatorIDCorrect(groupID, creatorID int) (bool, error) {
	db, err := sqlite.Connect()
	if err != nil {
		return false, err
	}
	defer db.Close()

	query := "SELECT Group_Creator FROM Groups WHERE Id = ?"
	var storedCreatorID int
	err = db.QueryRow(query, groupID).Scan(&storedCreatorID)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, err
		}
		return false, err
	}

	if storedCreatorID == creatorID {
		return true, nil
	} else {
		return false, nil
	}
}

func SaveMembershipRequest(groupId, requesterId, groupCreator int, groupName string, requesterName string) error {
	db, err := sqlite.Connect()
	if err != nil {
		return err
	}
	defer db.Close()

	query := "INSERT INTO MembershipRequests (GroupID, GroupName, GroupCreator, RequesterID, RequesterName, Status ) VALUES (?, ?, ?, ?, ?, ?)"
	_, err = db.Exec(query, groupId, groupName, groupCreator, requesterId, requesterName, 0)
	if err != nil {
		return err
	}

	return nil
}

func GetGroupNameByID(groupID int) (string, error) {
	db, err := sqlite.Connect()
	if err != nil {
		return "", err
	}
	defer db.Close()

	query := "SELECT Name FROM Groups WHERE Id = ?"

	var groupName string
	err = db.QueryRow(query, groupID).Scan(&groupName)
	if err != nil {
		return "", err
	}

	return groupName, nil
}

func AddMemberToGroup(groupID int, userID int) error {
	db, err := sqlite.Connect()
	if err != nil {
		return err
	}
	defer db.Close()

	query := "INSERT INTO groupMembers (GroupID, UserID) VALUES (?, ?)"

	_, err = db.Exec(query, groupID, userID)
	if err != nil {
		return err
	}

	return nil
}

func GetAllMembershipRequests(userID int) ([]Models.MembershipRequest, error) {
	var requests []Models.MembershipRequest

	db, err := sqlite.Connect()
	if err != nil {
		return nil, err
	}
	defer db.Close()

	query := "SELECT GroupName, RequesterName FROM MembershipRequests WHERE GroupCreator = ?"
	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var request Models.MembershipRequest
		err := rows.Scan(&request.GroupName, &request.User)
		if err != nil {
			return nil, err
		}
		requests = append(requests, request)
	}
	return requests, nil
}

func CheckIfCreator(creatorID int) (bool, error) {
	db, err := sqlite.Connect()
	if err != nil {
		return false, err
	}
	defer db.Close()

	var count int
	query := "SELECT COUNT(*) FROM Groups WHERE Group_Creator = ?"
	err = db.QueryRow(query, creatorID).Scan(&count)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func GetGroupIdByName(groupName string) (int, error) {
	db, err := sqlite.Connect()
	if err != nil {
		return 0, err
	}
	defer db.Close()

	query := "SELECT Id FROM Groups WHERE Name = ?"

	var groupId int
	err = db.QueryRow(query, groupName).Scan(&groupId)
	if err != nil {
		return 0, err
	}

	return groupId, nil
}

func GetUserByUsername(username string) int {
	var user_id int

	db, _ := sqlite.Connect()

	defer db.Close()
	row := db.QueryRow("SELECT Id FROM User WHERE FirstName = ?", username)

	err := row.Scan(&user_id)
	if err != nil {
		return user_id
	}

	db.Close()
	return user_id
}

func IsMemberOfGroup(userID, groupID int) (bool, error) {
	db, err := sqlite.Connect()
	if err != nil {
		return false, err
	}
	defer db.Close()

	query := "SELECT COUNT(*) FROM groupMembers WHERE GroupID = ? AND UserID = ?"
	var count int
	err = db.QueryRow(query, groupID, userID).Scan(&count)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func SaveAddMemberRequest(groupId, requesterId, requestedId int) error {
	db, err := sqlite.Connect()
	if err != nil {
		return err
	}
	defer db.Close()

	query := "INSERT INTO AddMemberRequests (GroupID, RequesterID, RequestedID, Status ) VALUES (?, ?, ?, ?)"
	_, err = db.Exec(query, groupId, requesterId, requestedId, 0)
	if err != nil {
		return err
	}

	return nil
}

func GetAddGroupRequest(userID int) []Models.AddMemberRequest {
	var requests []Models.AddMemberRequest

	db, err := sqlite.Connect()
	if err != nil {
		return nil
	}
	defer db.Close()

	query := "SELECT GroupID, RequesterID FROM AddMemberRequests WHERE RequestedID = ?"
	rows, err := db.Query(query, userID)
	if err != nil {
		return nil
	}
	defer rows.Close()

	for rows.Next() {
		var request Models.AddMemberRequest
		err := rows.Scan(&request.GroupID, &request.User)
		if err != nil {
			return nil
		}
		requests = append(requests, request)
	}
	return requests
}

func HasARequest(idUser, idGroup int, table string) bool {
	db, err := sqlite.Connect()
	if err != nil {
		fmt.Println("Error connecting to database:", err)
		return false
	}
	defer db.Close()

	var query string
	if(table == "MembershipRequests"){
		query = "SELECT 1 FROM MembershipRequests WHERE RequesterID = ? AND GroupID = ? AND Status = 0 LIMIT 1"
	}else{
		query = "SELECT 1 FROM AddMemberRequests WHERE RequestedID = ? AND GroupID = ? LIMIT 1"
	}

	var memberExists bool
	err = db.QueryRow(query, idUser, idGroup).Scan(&memberExists)
	if err != nil && err != sql.ErrNoRows {
		fmt.Println("Error checking membership:", err)
		return false
	}
	return memberExists
}



func SaveEventMembers(eventId, userId, status int) error {
	db, err := sqlite.Connect()
	if err != nil {
		return err
	}
	defer db.Close()

	query := "INSERT INTO EventMember (UserId, EventId, Status) VALUES ( ?, ?, ?)"
	_, err = db.Exec(query, userId, eventId, status)
	if err != nil {
		return err
	}

	return nil
}

// func gotoEvent(idUser, idEvent int) bool {
// 	db, err := sqlite.Connect()
// 	if err != nil {
// 		fmt.Println("Error connecting to database:", err)
// 		return false
// 	}
// 	defer db.Close()

// 	query := "SELECT 1 FROM EventMEmber WHERE UserId = ? AND EventId = ? LIMIT 1"
// 	var memberExists bool
// 	err = db.QueryRow(query, idUser, idEvent).Scan(&memberExists)
// 	if err != nil && err != sql.ErrNoRows {
// 		fmt.Println("Error checking membership:", err)
// 		return false
// 	}
// 	return memberExists
// }