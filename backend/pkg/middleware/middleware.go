package middleware

import (
	"backend/pkg/controllers"
	"fmt"
	"net/http"
)

func IsAuthentificate(next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, stat := controllers.IsAuthenticated(r)
		// fmt.Println("Middleware", stat)
		if stat {
			next.ServeHTTP(w, r)
		} else {
			fmt.Println("User is not authentificate middleware")
			controllers.StatusUnauthorized(w)
		}
	})
}

func IsAuthentificated(next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, stat := controllers.IsAuthenticated(r)
		if stat {
			next.ServeHTTP(w, r)
		} else {
			controllers.RespondJSON(w, http.StatusUnauthorized, "User is not authentificate middleware", false)
		}
	})
}

func IfUserCanLoginOrRegister(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, stat := controllers.IsAuthenticated(r)
		// fmt.Println("Middleware Login and Register", stat)
		if !stat {
			next.ServeHTTP(w, r)
		} else {
			fmt.Println("User is authentificate middleware log and register")
			controllers.StatusUnauthorized(w)
		}
	})
}
