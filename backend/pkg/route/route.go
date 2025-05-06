package route

import (
	"backend/pkg/controllers"
	"backend/pkg/middleware"
	"fmt"
	"log"
	"net/http"
)

var (
	PORT = "8080"
)

func Route() {
	colorGreen := "\033[32m"
	colorBlue := "\033[34m"
	colorYellow := "\033[33m"
	fmt.Println(string(colorBlue), "[SERVER_INFO] : Starting local Server...")

	// -------------//-------------//-------------//-------------//-------------//-------------

	http.HandleFunc("/search", controllers.SearchHandler) 
	http.HandleFunc("/api/", controllers.HomeHandler)
	http.Handle("/api/posts", (middleware.IsAuthentificated(http.HandlerFunc(controllers.GetAllPostHandler))))
	http.Handle("/api/post/", (middleware.IsAuthentificated(http.HandlerFunc(controllers.GetPostById))))
	http.Handle("/api/createpost", (middleware.IsAuthentificated(http.HandlerFunc(controllers.CreatePost))))
	http.Handle("/api/createpostgroup", (middleware.IsAuthentificate(http.HandlerFunc(controllers.CreatePostGroup))))
	http.Handle("/api/createcomment", (middleware.IsAuthentificate(http.HandlerFunc(controllers.CreateComment))))
	http.Handle("/api/logout", (middleware.IsAuthentificate(http.HandlerFunc(controllers.HandleLogout))))
	http.Handle("/api/groups", (middleware.IsAuthentificate(http.HandlerFunc(controllers.CreateGroup))))
	http.Handle("/api/members", middleware.IsAuthentificate(http.HandlerFunc(controllers.GetGroupMembers)))
	http.Handle("/api/groupsdata/", (middleware.IsAuthentificate(http.HandlerFunc(controllers.GetGroupsDatas))))
	http.Handle("/api/createEvent", (middleware.IsAuthentificate(http.HandlerFunc(controllers.CreateEvent))))
	http.Handle("/api/joingroup", (middleware.IsAuthentificate(http.HandlerFunc(controllers.JoinGroup))))
	http.Handle("/api/joinGroupResp", (middleware.IsAuthentificate(http.HandlerFunc(controllers.JoinGroupResp))))
	http.Handle("/api/action", (middleware.IsAuthentificate(http.HandlerFunc(controllers.ActionPost))))
	http.Handle("/api/connectedUser", (middleware.IsAuthentificate(http.HandlerFunc(controllers.GetConnectedUserID))))
	http.Handle("/profil", (http.HandlerFunc(controllers.HandleProfil)))
	// http.HandleFunc("/api/delete-post", AuthMiddleware(controllers.DeletePostHandler))
	http.Handle("/api/deletePost", middleware.IsAuthentificated(http.HandlerFunc(controllers.DeletePostHandler)))
	//http.Handl("/api/user/followers", (middleware.IsAuthentificate(http.HandlerFunc(controllers.GetFollowers))))
	http.Handle("/api/data/follow", (middleware.IsAuthentificate(http.HandlerFunc(controllers.HandleFollow))))
	http.Handle("/api/data/updateProfil", (middleware.IsAuthentificate(http.HandlerFunc(controllers.UpdateProfile))))
	http.Handle("/api/addGroupMember", (middleware.IsAuthentificate(http.HandlerFunc(controllers.AddGroupMember))))
	http.Handle("/api/usersgroups", (middleware.IsAuthentificate(http.HandlerFunc(controllers.GetUsersAndGroupsHandler))))
	http.Handle("/api/oldmessages", (middleware.IsAuthentificate(http.HandlerFunc(controllers.GetOldMessagesHandler))))
	http.Handle("/ws", (middleware.IsAuthentificate(http.HandlerFunc(controllers.HandleConnections))))
	//---------------------------------// Login adn Register //-------------------------------------//
	// http.HandleFunc("/api/register", controllers.RegisterHandler)
	// http.HandleFunc("/api/login", controllers.LoginHandler)
	// http.HandleFunc("/api/logout", controllers.HandleLogout)
	// http.HandleFunc("/api/groups", controllers.CreateGroup)
	// http.HandleFunc("/api/groupsdata/", controllers.GetGroupsDatas)
	// http.HandleFunc("/api/createEvent", controllers.CreateEvent)
	// http.HandleFunc("/api/joingroup", controllers.JoinGroup)
	// http.HandleFunc("/api/joinGroupResp", controllers.JoinGroupResp)
	// http.HandleFunc("/api/action", controllers.ActionPost)
	// http.HandleFunc("/api/connectedUser", controllers.GetConnectedUserID)
	// http.HandleFunc("/profil", controllers.HandleProfil)
	// //http.HandleFunc("/api/user/followers", controllers.GetFollowers)
	// http.HandleFunc("/api/data/follow", controllers.HandleFollow)
	// http.HandleFunc("/api/data/updateProfil", controllers.UpdateProfile)
	// http.HandleFunc("/api/addGroupMember", controllers.AddGroupMember)

	// handle the notifications route
	http.HandleFunc("/api/data/followersNotifs", controllers.GetFollowersNotifs)
	http.HandleFunc("/api/data/updateFollower", controllers.HandleFollowUser)
	http.HandleFunc("/api/data/deleteFollower", controllers.HandleDeleteFollower)
	http.HandleFunc("/api/data/addMembersNotifs", controllers.GetAddMemberNotifs)
	http.HandleFunc("/api/data/requestMembershipNotifs", controllers.GetRequestMembershipNotifs)
	http.HandleFunc("/api/data/getEventNotifs", controllers.GetEventNotifs)
	http.Handle("/api/RespEvent", (middleware.IsAuthentificate(http.HandlerFunc(controllers.EventResponse))))

	// ##################""
	http.Handle("/api/login", middleware.IfUserCanLoginOrRegister(http.HandlerFunc(controllers.LoginHandler)))
	http.Handle("/api/register", middleware.IfUserCanLoginOrRegister(http.HandlerFunc(controllers.RegisterHandler)))
	//http.Handle("/api/authUser", middleware.IfUserCanLoginOrRegister(http.HandlerFunc(controllers.GetConnectedUser)))
	// -------------//-------------//-------------//-------------//-------------//-------------

	// Appliquer le middleware CORS
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		http.DefaultServeMux.ServeHTTP(w, r)
	})

	fmt.Println(string(colorGreen), "[SERVER_READY] : on http://localhost: "+PORT+"✅ ") 
	fmt.Println(string(colorYellow), "[SERVER_INFO] : To stop the program : Ctrl + c \033[00m")
	err := http.ListenAndServe(":"+PORT, handler)
	if err != nil {
		log.Fatal(err)
	}
}
