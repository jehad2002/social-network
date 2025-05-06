package controllers

import (
	"backend/pkg/db/sqlite"
	Models "backend/pkg/models"
	SqlRequest "backend/pkg/sqlrequest"
	"encoding/json"
	"log"
	"net/http"
)

func NotificationHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Yess enter....")
	// notif := Models.Notification{
	// 	SenderId: 1,
	// 	TargetId: 3,
	// 	Type: 0,
	// }
	db, err := sqlite.Connect()
	if err != nil {
		log.Printf("Failed to connect to the database engine %s", err)
	}
	// if err := SqlRequest.InsertNotification(db, notif); err != nil {
	// 	log.Printf("Insert failed %s", err)
	// }
	var notifications []Models.Notification
	notifications, _ = SqlRequest.RetrieveNotifications(db)

	jsonData, _ := json.Marshal(notifications)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonData)
}
