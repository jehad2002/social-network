package controllers

import (
	"backend/pkg/db/sqlite"
	"backend/pkg/sqlrequest"
	"encoding/json"
	"net/http"
)

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	userSession, stat := IsAuthenticated(r)
	if !stat {
		RespondJSON(w, http.StatusUnauthorized, "Access to this resource is Unauthorized. Please ensure you have the required permissions or credentials to access it.", false)
		return
	}
	db, err := sqlite.Connect()
	if err != nil {
		RespondJSON(w, http.StatusInternalServerError, "erreur lors de la connexion à la base de données", false)
		return
	}
	user, _ := sqlrequest.GetUserById(db, userSession.IdUser)
	if user.Id == 0 {
		RespondJSON(w, http.StatusNotFound, "Failed to get User !!!", false)
		return
	}
	// change the data to json // send the data to the user
	jsonDatas, _ := json.Marshal(user)
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonDatas)
}
