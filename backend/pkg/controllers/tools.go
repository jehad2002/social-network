package controllers

import (
	Models "backend/pkg/models"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"golang.org/x/crypto/bcrypt"
)

const (
	sessionCookieName = "session_token"
	sessionDuration   = 3600 * time.Second
)

func WriteResponse(w http.ResponseWriter, status string) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"status":"` + status + `"}`))
}

func HandleError(err error, task string) {
	if err != nil {
		log.Printf("Error While %s | more=> %v\n", task, err)
	}
}

func IsAuthenticated(r *http.Request) (Models.Session, bool) {
	c, err := r.Cookie(sessionCookieName)
	if err == nil {
		// fmt.Println("Errcookies", err.Error())
		sessionToken := c.Value
		// fmt.Println("rCoockie", c)
		userSession, exists := IfSessionExist(sessionToken)
		if exists {
			return userSession, true
		}
	}
	return Models.Session{}, false
}

func IsAuthenticatedTest(r *http.Request) bool {
	c, err := r.Cookie(sessionCookieName)
	if err == nil {
		sessionToken := c.Value
		_, exists := IfSessionExist(sessionToken)
		if exists {
			return true
		}
	}
	return false
}

func IsExpired(expiry time.Time) bool {
	return time.Now().After(expiry)
}

func StatusBadRequest(w http.ResponseWriter, text string) {
	w.WriteHeader(http.StatusBadRequest)
	WriteResponse(w, "Bad Request")
}

func StatusNotFound(w http.ResponseWriter, text string) {
	w.WriteHeader(http.StatusNotFound)
	WriteResponse(w, "Not Found")
}

func StatusUnauthorized(w http.ResponseWriter) {
	w.WriteHeader(http.StatusUnauthorized)
	WriteResponse(w, "Unauthorized")
}

func StatusInternalServerError(w http.ResponseWriter) {
	w.WriteHeader(http.StatusInternalServerError)
	WriteResponse(w, "Internal Server Error")
}

func saveFile(file multipart.File, filePath string) error {
	dir := filepath.Dir(filePath)

	if _, err := os.Stat(dir); os.IsNotExist(err) {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return err
		}
	}

	destination, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer destination.Close()

	_, err = io.Copy(destination, file)
	if err != nil {
		return err
	}

	return nil
}

func CheckCredentials(email, password string) (Models.Users, bool) {
	users := GetUsers()
	var hashedPassword string

	for _, user := range users {
		hashedPassword = user.Password

		err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))

		if user.Email == email && err == nil {
			return user, true
		}
	}

	return Models.Users{}, false
}
