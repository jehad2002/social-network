package controllers

import (
	"backend/pkg/db/sqlite"
	Models "backend/pkg/models"
	"backend/pkg/sqlrequest"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

func HandleProfil(w http.ResponseWriter, r *http.Request) {
	db, err := sqlite.Connect()
	if err != nil {
		RespondJSON(w, http.StatusInternalServerError, "err profile :", false)
		return
	}
	usersession, _ := IsAuthenticated(r)
	// if !stat {
	// 	RespondJSON(w, http.StatusUnauthorized, "Access to this resource is Unauthorized. Please ensure you have the required permissions or credentials to access it.", false)
	// 	return
	// }
	// session, _ := IsAuthenticated(r)

	// fmt.Println("Voici la session du user connecte ", session)

	// fmt.Println("userrrrrrrrrr")
	// Récupérer l'ID de l'utilisateur à partir des paramètres de requête
	//setCorsHeaders(w)

	userIDParam := r.URL.Query().Get("id")
	if userIDParam == "" {
		// http.Error(w, "Missing user ID", http.StatusBadRequest)
		// return
		RespondJSON(w, http.StatusBadRequest, "Missing user Id", false)
		return
	}

	// Convertir l'ID de l'utilisateur en un entier
	userId, err := strconv.Atoi(userIDParam)
	if err != nil {
		// http.Error(w, "Invalid user ID", http.StatusBadRequest)
		// return
		RespondJSON(w, http.StatusBadRequest, "Invalid user Id", false)
		return
	}

	// database, _ := sqlite.Connect()
	user, _ := Models.GetUserByID(db, userId)
	if user.Id == 0 {
		// http.Error(w, "Can not recup the user", http.StatusBadRequest)
		RespondJSON(w, http.StatusBadRequest, "Can not recup the user", false)
		return
	}
	connectedUserID := usersession.IdUser
	// fmt.Println(user.FirstName, connectedUserID, userId)
	isfollowing, err := sqlrequest.IsFollower(db, connectedUserID, userId)
	if err != nil {
		// fmt.Println("e: ", err)
		RespondJSON(w, http.StatusInternalServerError, " 1 er", false)
		return
	}

	status, err := sqlrequest.GetFollowType(db, connectedUserID, userId)
	if err != nil {
		// fmt.Println("err type: ", err)
		// RespondJSON(w, http.StatusInternalServerError, "err in type", false)
		// return
	}

	isfollowingstatus := Models.IsFollowingStatus{
		Ok:     isfollowing,
		Status: status,
	}
	posts, imagesPath := GetPostsByUser(w, r, userId)

	data := Models.UserData{
		User:         user,
		Posts:        posts,
		Followers:    sqlrequest.GetFollowUser(userId, connectedUserID, true),
		Following:    sqlrequest.GetFollowUser(userId, connectedUserID, false),
		IsFollowing:  isfollowingstatus,
		ImagesPosted: imagesPath,
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		// http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
		// return
		RespondJSON(w, http.StatusInternalServerError, "Error encoding JSON", false)
		return

	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

/*/
func GetFollowers(w http.ResponseWriter, r *http.Request) {
	// setCorsHeaders(w)
	id := r.URL.Query().Get("userId")
	userID, err := strconv.Atoi(id)
	log.Println("TESTTTT: ",userID)
	// fmt.Println("User string id: ",id)
	// test, _ := IsAuthenticated(r)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	follow := userData{
		Followers: getFollowUser(userID, true),
		Following: getFollowUser(userID, false),
	}

	// fmt.Println("followers ", follow)

	json.NewEncoder(w).Encode(follow)
}

func getFollowUser(userID int, connectedUserID int, follower bool) []UserFollow {
	db, err := sqlite.Connect()
	if err != nil {
		return nil
	}
	defer db.Close()

	// 	var query string
	// 	if follower {
	// 		query = "SELECT u.*, f.Id as FollowId, f.Type FROM User u JOIN Follow f ON u.Id = f.Follower WHERE f.Following = ?"
	// 	} else {
	// 		query = "SELECT u.*, f.Id as FollowId, f.Type FROM User u JOIN Follow f ON u.Id = f.Following WHERE f.Follower = ?"
	// 	}
	// 	rows, err := db.Query(query, userID)
	// 	if err != nil {
	// 		return nil
	// 	}
	// 	defer rows.Close()

	var users []UserFollow
	for rows.Next() {
		var user Models.User
		var followId int
		var followType int
		err := rows.Scan(&user.Id, &user.FirstName, &user.LastName, &user.NickName, &user.Avatar, &user.DateOfBirth, &user.AboutMe, &user.Email, &user.Password, &user.Profil, &followId, &followType)
		if err != nil {
			return nil
		}
		isfollower, err := sqlrequest.IsFollower(db, connectedUserID, user.Id)
		if err != nil {
			fmt.Println("une erreur s'est produit: ", err)
		}
		userFollow := UserFollow{
			Use:         user,
			FollowId:    followId,
			Status:      followType,
			IsFollowing: isfollower,
		}
		users = append(users, userFollow)
	}
	return users
}
/*/

func HandleFollow(w http.ResponseWriter, r *http.Request) {
	db, err := sqlite.Connect()
	if err != nil {
		fmt.Println("Can't connect to database.")
		return
	}
	defer db.Close()
	session, _ := IsAuthenticated(r)

	// fmt.Println("session user connecte ", session)
	userID := session.IdUser
	id := r.URL.Query().Get("id")
	status := r.URL.Query().Get("status")
	profil := r.URL.Query().Get("profil")
	followingID, _ := strconv.Atoi(id)
	stat, err := strconv.Atoi(status)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}
	isfollower, err := sqlrequest.IsFollower(db, userID, followingID)
	if stat == 1 {
		_, err = sqlrequest.InsertFollow(db, userID, followingID, stat)
	} else {
		// fmt.Println("suppression", userID, followingID, isfollower, stat, profil)
		if isfollower {
			err = sqlrequest.DeleteFollow(db, userID, followingID)
		} else if profil == "private" {
			_, err = sqlrequest.InsertFollow(db, userID, followingID, stat)
		}
	}
	if err != nil {
		http.Error(w, "Error updating follow status", http.StatusInternalServerError)
		return
	}
	type Data struct {
		Status string
	}

	data := Data{
		Status: "ok",
	}
	jsonData, err := json.Marshal(data)
	if err != nil {
		http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func GetTypeByID(id int) (int, error) {
	db, err := sqlite.Connect()
	if err != nil {
		return 0, err
	}
	defer db.Close()

	var followType int
	err = db.QueryRow("SELECT Type FROM Follow WHERE Id = ?", id).Scan(&followType)
	if err != nil {
		return 0, err
	}

	return followType, nil
}

// to use with the update follow handle
// err = updateFollowStatus(followID, id, statusFollow)
// func updateFollowStatus(follower, following, status int) error {
// 	db, err := sqlite.Connect()
// 	if err != nil {
// 		return err
// 	}
// 	defer db.Close()

// 	query := "UPDATE Follow SET Type = ? WHERE Follower = ? AND Following = ?"
// 	_, err = db.Exec(query, status, follower, following)
// 	if err != nil {
// 		return err
// 	}

// 	fmt.Println("Successfully updated status to", status, "for follow ID", follower)
// 	return nil
// }

func UpdateProfile(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	aboutMe := r.URL.Query().Get("aboutMe")
	profil := r.URL.Query().Get("profil")

	//fmt.Println("USer IDDDD", id, aboutMe, profil)

	Id, err := strconv.Atoi(id)
	if err != nil {
		fmt.Println("Error while converting", err)
		return
	}

	if profil == "true" {
		profil = "private"
	} else {
		profil = "public"
	}

	err = UpdateUserProfile(Id, aboutMe, profil)
	if err != nil {
		http.Error(w, "Error updating User profil", http.StatusInternalServerError)
		return
	}

	type Data struct {
		Status string
	}

	data := Data{
		Status: "ok",
	}
	jsonData, err := json.Marshal(data)
	if err != nil {
		http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func UpdateUserProfile(userID int, aboutMe, profil string) error {
	db, err := sqlite.Connect()
	if err != nil {
		return err
	}
	defer db.Close()
	//fmt.Println(userID, profil, aboutMe)
	//query := "UPDATE User SET AboutMe = ?, Profil = ? WHERE Id = ?"
	query := "UPDATE User SET AboutMe = ?, Profil = ? WHERE Id = ?"
	_, err = db.Exec(query, aboutMe, profil, userID)
	if err != nil {
		return err
	}
	//fmt.Println("updated seccessfully")
	return nil
}

func GetConnectedUserID(w http.ResponseWriter, r *http.Request) {
	session, _ := IsAuthenticated(r)

	// fmt.Println("err user connecte ", session)
	userID := session.IdUser
	type UserData struct {
		UserID int `json:"userId"`
		User   Models.User
	}
	db, err := sqlite.Connect()
	if err != nil {
		fmt.Println("Faild to connect to the database: ", err)
		return
	}
	user, er := sqlrequest.GetUserById(db, userID)
	if er != nil {
		fmt.Println("Faild to get connected user: ", er)
	}

	userData := UserData{
		UserID: userID,
		User:   user,
	}

	jsonData, err := json.Marshal(userData)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}
