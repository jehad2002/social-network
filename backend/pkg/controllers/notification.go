package controllers

import (
	Models "backend/pkg/models"
	"backend/pkg/sqlrequest"
	"encoding/json"
	"log"
	"net/http"
	// "strconv"
)

type IncommigRequestType struct {
	Type              string `json:"type"`
	Status            int    `json:"status"`
	FollowId          int    `json:"followId"`
	MemberId          int    `json:"memberId"`
	GroupId           int    `json:"groupId"`
	MembershipId      int    `json:"membershipId"`
	GroupIdMembership int    `json:"groupIdMembership"`
}

func HandleFollowUser(w http.ResponseWriter, r *http.Request) {
	userId := getUserConnectId(r)
	var typeUpdate IncommigRequestType
	if err := json.NewDecoder(r.Body).Decode(&typeUpdate); err != nil {
		log.Println("Failed to decode the update type data: ", err)
		return
	}
	if typeUpdate.Type == "updateFollower" && typeUpdate.FollowId != 0 {
		if err := sqlrequest.UpdateFollowStatus(typeUpdate.FollowId, userId, typeUpdate.Status); err != nil {
			http.Error(w, "Failed to update the follow user", http.StatusInternalServerError)
			return
		}
	} else if typeUpdate.Type == "updateAddMember" && typeUpdate.MemberId != 0 {
		log.Println("Type Update data: ", typeUpdate.Type)
		if err := sqlrequest.UpdateAddMamberStatus(typeUpdate.MemberId, userId, typeUpdate.Status); err != nil {
			http.Error(w, "Failed to update the follow user", http.StatusInternalServerError)
			return
		}
		if err := AddMemberToGroup(typeUpdate.GroupId, userId); err != nil {
			http.Error(w, "Failed to add the member in to the group", http.StatusInternalServerError)
			return
		}
	} else if typeUpdate.Type == "updateMembership" && typeUpdate.MembershipId != 0 {
		log.Println("Type Update data: ", typeUpdate.Type)
		if err := sqlrequest.UpdateMambershipStatus(typeUpdate.MembershipId, userId, typeUpdate.Status); err != nil {
			http.Error(w, "Failed to update the follow user", http.StatusInternalServerError)
			return
		}
		if err := AddMemberToGroup(typeUpdate.GroupIdMembership, typeUpdate.MembershipId); err != nil {
			http.Error(w, "Failed to add the member in to the group", http.StatusInternalServerError)
			return
		}
	}
}
func GetFollowersNotifs(w http.ResponseWriter, r *http.Request) {
	userId := getUserConnectId(r)
	var userFollowers []Models.UserFollow
	userFollowers, err := sqlrequest.RetrieveFollowersNotifications(userId)
	if err != nil {
		http.Error(w, "Failed to retrieve the followers user", http.StatusInternalServerError)
		return
	}
	jsonData, err := json.Marshal(userFollowers)
	if err != nil {
		log.Println("Failed to convert data into json format: ", err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}
func HandleDeleteFollower(w http.ResponseWriter, r *http.Request) {
	// id := r.URL.Query().Get("id")
	userId := getUserConnectId(r)
	var typeDelete IncommigRequestType
	if err := json.NewDecoder(r.Body).Decode(&typeDelete); err != nil {
		log.Println("Failed to decode the request data type: ", err)
		return
	}
	//fmt.Println("typeDelete typeDelete typeDelete typeDelete ", typeDelete)
	if typeDelete.Type == "deleteFollow" && typeDelete.FollowId != 0 {
		if err := sqlrequest.DeleteFollowNotif(userId, typeDelete.FollowId); err != nil {
			http.Error(w, "Failed to retrieve the followers user", http.StatusInternalServerError)
			return
		}
	} else if typeDelete.Type == "deleteAddMember" && typeDelete.MemberId != 0 {
		if err := sqlrequest.DeleteAddMemberNotif(typeDelete.MemberId, userId); err != nil {
			http.Error(w, "Failed to retrieve the followers user", http.StatusInternalServerError)
			return
		}
	} else if typeDelete.Type == "deleteMembership" && typeDelete.MembershipId != 0 {
		if err := sqlrequest.DeleteMembershipNotif(typeDelete.MembershipId, userId); err != nil {
			http.Error(w, "Failed to delete the membership user", http.StatusInternalServerError)
			return
		}
	}
}
func GetAddMemberNotifs(w http.ResponseWriter, r *http.Request) {
	userId := getUserConnectId(r)
	var addMembers []Models.AddMembers
	addMembers, err := sqlrequest.RetrieveAddMemberNotifications(userId)
	if err != nil {
		http.Error(w, "Failed to retrieve the addMembers user ", http.StatusInternalServerError)
		return
	}
	log.Println(addMembers)
	jsonData, err := json.Marshal(addMembers)
	if err != nil {
		log.Println("Failed to convert data into json format: ", err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}
func GetRequestMembershipNotifs(w http.ResponseWriter, r *http.Request) {
	// fmt.Println("jsonDataaaa ")

	userId := getUserConnectId(r)
	var addMembers []Models.Membership
	addMembers, err := sqlrequest.RetrieveMembershipNotifications(userId)
	if err != nil {
		http.Error(w, "Failed to retrieve the addMembers user ", http.StatusInternalServerError)
		return
	}
	log.Println(addMembers)
	jsonData, err := json.Marshal(addMembers)
	if err != nil {
		log.Println("Failed to convert data into json format: ", err)
	}
	// fmt.Println("jsonData: ", jsonData)
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}
func GetEventNotifs(w http.ResponseWriter, r *http.Request) {

	userId := getUserConnectId(r)
	var events []Models.EventNotif
	events, err := sqlrequest.RetrieveEvenNotifications(userId)
	if err != nil {
		http.Error(w, "Failed to retrieve the events user ", http.StatusInternalServerError)
		return
	}
	jsonData, err := json.Marshal(events)
	if err != nil {
		log.Println("Failed to convert data into json format: ", err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}
func getUserConnectId(r *http.Request) int {
	usersession, stat := IsAuthenticated(r)
	if !stat {
		// RespondJSON(w, http.StatusUnauthorized, "Access to this resource is Unauthorized. Please ensure you have the required permissions or credentials to access it.", false)
		return 0
	}
	return usersession.User.ID
}
