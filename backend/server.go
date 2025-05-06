package main

import (
	"backend/pkg/controllers"
	"backend/pkg/db/sqlite"
	"backend/pkg/route"
	"log"
)

func main() {
	//using gorotine to message
	go controllers.HandleMessages()
	db, err := sqlite.Connect()
	if err != nil {
		log.Fatalf("err : %v", err)
	}
	defer db.Close()
	//file, err := os.ReadFile("./pkg/db/migrations/sqlite/insert_init_schema.sql")
	//if err != nil {
	//	log.Fatal(err)
	//}

	//if _, err := db.Exec(string(file)); err != nil {
	//	return
	//}
	err = sqlite.RunMigrations(db)
	if err != nil {
		log.Fatalf("err migrations : %v", err)
	}

	log.Println("Migrations application success")
	route.Route()
	// http.ListenAndServe(":8080", nil)

}
