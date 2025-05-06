package controllers

import (
	"backend/pkg/db/sqlite"
	Models "backend/pkg/models"
	"backend/pkg/sqlrequest"
	"encoding/json"
	"net/http"
)
// http post to request for like ...

// is auth for user
func ActionPost(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		db, err := sqlite.Connect()
		if err != nil {
			RespondJSON(w, http.StatusInternalServerError, "errrrrrrrrrrrrrrrr", false)
			return
		}
// to recive the data from the user
		var actionData Models.ActionData
		if err := json.NewDecoder(r.Body).Decode(&actionData); err != nil {
			RespondJSON(w, http.StatusBadRequest, "Error JSON", false)
			return
		}
		usersession, stat := IsAuthenticated(r)
		if !stat {
			RespondJSON(w, http.StatusUnauthorized, "Access to this resource is Unauthorized. Please ensure you have the required permissions or credentials to access it.", false)
			return
		}
		defer db.Close()
		act, _ := sqlrequest.GetActionByUser(db, actionData.PostId, actionData.CommentId, usersession.User.ID)
		if act.Id != 0 {
			_, err := sqlrequest.DeleteAction(db, act)
			if err != nil {
				RespondJSON(w, http.StatusBadRequest, "Failed to react", false)
			} else {
				RespondJSON(w, http.StatusOK, "Success to react", true)
			}
		} else {
			act.PostId = actionData.PostId
			act.UserId = usersession.User.ID
			act.CommentId = actionData.CommentId
			_, err := sqlrequest.InsertAction(db, act)
			if err != nil {
				RespondJSON(w, http.StatusBadRequest, "Failed to react", false)
			} else {
				RespondJSON(w, http.StatusOK, "Success to react", true)
			}
		}
	}
}
