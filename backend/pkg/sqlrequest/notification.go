package sqlrequest

import (
	"backend/pkg/db/sqlite"
	Models "backend/pkg/models"
	"database/sql"
	"log"
	"time"
)

func InsertNotification(db *sql.DB, notif Models.Notification) error {
	query := "INSERT INTO Notifications(SenderId, TargetId, Type, Accepted, Viewed, CreatedDate) (?,?,?,?,?,?)"
	if _, err := db.Exec(query, notif.SenderId, notif.TargetId, notif.Type, false, false, time.Now()); err != nil {
		log.Printf("Failed to insert notification %s", err)
		return err
	}
	return nil
}

func RetrieveNotifications(db *sql.DB) ([]Models.Notification, error) {
	query := "SELECT * FROM Notifications "
	rows, err := db.Query(query)
	if err != nil {
		log.Printf("Failed to retrieve notifications %s", err)
		return []Models.Notification{}, err
	}
	var notifs []Models.Notification
	for rows.Next() {
		var notif Models.Notification
		err := rows.Scan(&notif.Id, &notif.SenderId, &notif.TargetId, &notif.Type, &notif.Accepted, &notif.Viewed, &notif.CreatedDate)
		if err != nil {
			log.Printf("Row scaned failed %s", err)
		}
		notifs = append(notifs, notif)
	}
	return notifs, nil
}

func UpdateFollowStatus(follower, following, status int) error {
	db, err := sqlite.Connect()
	if err != nil {
		return err
	}
	defer db.Close()

	query := "UPDATE Follow SET Type = ? WHERE Follower = ? AND Following = ?"
	_, err = db.Exec(query, status, follower, following)
	if err != nil {
		return err
	}

	log.Println("Successfully updated status to", status, "for follow ID", follower)
	return nil
}

func RetrieveFollowersNotifications(following int) ([]Models.UserFollow, error) {
	db, err := sqlite.Connect()
	if err != nil {
		log.Println("Failed to connect the database engine: ", err)
	}
	query := "SELECT u.*, f.Id as FollowId, f.Type FROM User u JOIN Follow f ON u.Id = f.Follower WHERE f.Following = ? AND f.Type = ?"

	rows, err := db.Query(query, following, 0)
	if err != nil {
		log.Printf("Failed to retrieve the followers notifications %s", err)
		return []Models.UserFollow{}, err
	}
	defer db.Close()
	var followerNotifs []Models.UserFollow
	for rows.Next() {
		var user Models.User
		var followId int
		var followType int
		err := rows.Scan(&user.Id, &user.FirstName, &user.LastName, &user.NickName, &user.Avatar, &user.DateOfBirth, &user.AboutMe, &user.Email, &user.Password, &user.Profil, &followId, &followType)
		if err != nil {
			log.Printf("Row scaned failed %s", err)
		}
		isfollower, _ := IsFollower(db, following, user.Id)
		userFollow := Models.UserFollow{
			Use:         user,
			FollowId:    followId,
			Status:      followType,
			IsFollowing: isfollower,
		}
		// users = append(users, userFollow)
		followerNotifs = append(followerNotifs, userFollow)
	}
	return followerNotifs, nil
}

func DeleteFollowNotif(userId, follow int) error {
	db, err := sqlite.Connect()
	if err != nil {
		log.Println("Failed to connect to the database: ", err)
		return err
	}
	query := "DELETE FROM Follow WHERE Follower = ? AND Following = ?"
	if _, err = db.Exec(query, follow, userId); err != nil {
		log.Println("Failed to delete the follower: ", err)
		return err
	}
	return nil
}


func RetrieveAddMemberNotifications(following int) ([]Models.AddMembers, error) {
	db, err := sqlite.Connect()
	if err != nil {
		log.Println("Failed to connect the database engine: ", err)
	}
	query := "SELECT u.*, A.RequestID as RequestedID, A.Status, A.GroupID, g.Name FROM User u JOIN AddMemberRequests A ON u.Id = A.RequesterID JOIN Groups g ON g.Id = A.GroupID WHERE A.RequestedID = ? AND A.Status = ?"

	rows, err := db.Query(query, following, 0)
	if err != nil {
		log.Printf("Failed to retrieve the followers notifications %s", err)
		return []Models.AddMembers{}, err
	}
	defer db.Close()
	var memberNotifs []Models.AddMembers
	for rows.Next() {
		var user Models.User
		var memberId int
		var groupId int
		var memberStatus int
		var groupName string
		err := rows.Scan(&user.Id, &user.FirstName, &user.LastName, &user.NickName, &user.Avatar, &user.DateOfBirth, &user.AboutMe, &user.Email, &user.Password, &user.Profil, &memberId, &memberStatus,&groupId, &groupName)
		if err != nil {
			log.Printf("Row scaned failed %s", err)
		}
		// isfollower, _ := IsFollower(db, following, user.Id)
		userMember := Models.AddMembers{
			User:         user,
			MemberId: memberId,
			Status: memberStatus,
			GroupId: groupId,
			GroupName: groupName,
		}
		// users = append(users, userFollow)
		memberNotifs = append(memberNotifs, userMember)
	}
	return memberNotifs, nil
}

func UpdateAddMamberStatus(requester, requested, status int) error {
	db, err := sqlite.Connect()
	if err != nil {
		return err
	}
	defer db.Close()

	query := "UPDATE AddMemberRequests SET Status = ? WHERE RequesterID = ? AND RequestedID = ?"
	_, err = db.Exec(query, status, requester, requested)
	if err != nil {
		return err
	}

	log.Println("Successfully updated status of AddMember to", status)
	return nil
}

func DeleteAddMemberNotif(member, userId int) error {
	db, err := sqlite.Connect()
	if err != nil {
		log.Println("Failed to connect to the database: ", err)
		return err
	}
	query := "DELETE FROM AddMemberRequests WHERE RequesterID = ? AND RequestedID = ?"
	if _, err = db.Exec(query, member, userId); err != nil {
		log.Println("Failed to delete the addMember: ", err)
		return err
	}
	return nil
}

func RetrieveMembershipNotifications(creator int) ([]Models.Membership, error) {
	db, err := sqlite.Connect()
	if err != nil {
		log.Println("Failed to connect the database engine: ", err)
	}
	query := "SELECT u.*, M.GroupID, M.GroupName, M.Status FROM User u JOIN MembershipRequests M ON u.Id = M.RequesterID WHERE M.GroupCreator = ? AND M.Status = ?"

	rows, err := db.Query(query, creator, 0)
	if err != nil {
		log.Printf("Failed to retrieve the followers notifications %s", err)
		return []Models.Membership{}, err
	}
	defer db.Close()
	var membershipNotifs []Models.Membership
	for rows.Next() {
		var user Models.User
		var membershipStatus int
		var groupId int
		var groupName string
		err := rows.Scan(&user.Id, &user.FirstName, &user.LastName, &user.NickName, &user.Avatar, &user.DateOfBirth, &user.AboutMe, &user.Email, &user.Password, &user.Profil, &groupId, &groupName, &membershipStatus)
		if err != nil {
			log.Printf("Row scaned failed %s", err)
		}
		// isfollower, _ := IsFollower(db, following, user.Id)
		userMember := Models.Membership{
			User:         user,
			Status: membershipStatus,
			GroupId: groupId,
			GroupName: groupName,
		}
		// users = append(users, userFollow)
		membershipNotifs = append(membershipNotifs, userMember)
	}
	return membershipNotifs, nil
}

func UpdateMambershipStatus(membershipId, requested, status int) error {
	db, err := sqlite.Connect()
	if err != nil {
		return err
	}
	defer db.Close()

	query := "UPDATE MembershipRequests SET Status = ? WHERE RequesterID = ? AND GroupCreator = ?"
	_, err = db.Exec(query, status, membershipId, requested)
	if err != nil {
		return err
	}

	log.Println("Successfully updated status of Membership to", status)
	return nil
}

func DeleteMembershipNotif(membership, userId int) error {
	db, err := sqlite.Connect()
	if err != nil {
		log.Println("Failed to connect to the database: ", err)
		return err
	}
	query := "DELETE FROM MembershipRequests WHERE RequesterID = ? AND GroupCreator = ?"
	if _, err = db.Exec(query, membership, userId); err != nil {
		log.Println("Failed to delete the membership: ", err)
		return err
	}
	return nil
}

func RetrieveEvenNotifications(user int) ([]Models.EventNotif, error) {
	db, err := sqlite.Connect()
	if err != nil {
		log.Println("Failed to connect the database engine: ", err)
	}
	query := "SELECT u.*, E.* FROM User u JOIN Event E ON u.Id = E.UserID JOIN groupMembers g ON g.GroupID = E.GroupId LEFT JOIN EventMember EM ON EM.EventId = E.ID AND EM.UserId = g.UserID WHERE g.UserID = ? AND EM.UserId IS NULL"
	rows, err := db.Query(query, user)
	if err != nil {
		log.Printf("Failed to retrieve the events notifications %s", err)
		return []Models.EventNotif{}, err
	}
	defer db.Close()
	var eventNotifs []Models.EventNotif
	for rows.Next() {
		var user Models.User
		var event Models.EventDetails
		err := rows.Scan(&user.Id, &user.FirstName, &user.LastName, &user.NickName, &user.Avatar, &user.DateOfBirth, &user.AboutMe, &user.Email, &user.Password, &user.Profil, &event.Id, &event.Title, &event.Description, &event.UserId, &event.GroupId, &event.DateTime)
		if err != nil {
			log.Printf("Row scaned failed %s", err)
		}
		// isfollower, _ := IsFollower(db, following, user.Id)
		userMember := Models.EventNotif{
			User:         user,
			Event: event,
		}
		// users = append(users, userFollow)
		eventNotifs = append(eventNotifs, userMember)
	}
	return eventNotifs, nil
}
// type User struct {
// 	Id          int
// 	FirstName   string
// 	LastName    string
// 	NickName    string
// 	Avatar      string
// 	DateOfBirth string
// 	AboutMe     string
// 	Email       string
// 	Password    string
// 	Profil      string
// }