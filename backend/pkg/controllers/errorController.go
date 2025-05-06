package controllers

import (
	"encoding/json"
	"net/http"
)

type Response struct {
	Status  int    `json:"status"`
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func RespondJSON(w http.ResponseWriter, status int, message string, success bool) {
	response := Response{
		Status:  status,
		Success: success,
		Message: message,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(response)
}

func RespondJSONWithoutWrite(w http.ResponseWriter, status int, message string, success bool) {
	response := Response{
		Status:  status,
		Success: success,
		Message: message,
	}

	w.Header().Set("Content-Type", "application/json")
	// w.WriteHeader(status)
	json.NewEncoder(w).Encode(response)
}
