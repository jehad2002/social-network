package controllers

import (
	"backend/pkg/db/sqlite"
	Models "backend/pkg/models"
	"backend/pkg/sqlrequest"
	"backend/pkg/utils"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
)

func CreateComment(w http.ResponseWriter, r *http.Request) {
	// w to send the response to the user
	// r to recive the data from the user
	db, err := sqlite.Connect()
	if err != nil {
		log.Fatalf("errrrrrrrrrrrrr1 : %v", err)
	}

	if r.Method == http.MethodPost {
		// if the method is post
		data, err := io.ReadAll(r.Body)
		if err != nil {
			fmt.Println("Error1", err)
			return
		}
// change the comment data to newCommentData from json to comment
		var newCommentData = Models.Comment{}
		err = json.Unmarshal(data, &newCommentData)
		if err != nil {
			fmt.Println("Error2", err.Error())
			return
		}
		// fmt.Println(newCommentData)
		// fmt.Println("dataPost", newPostData)
		// err = utils.ValidatePost(newPostData)
		// if err != nil {
		// 	fmt.Println("Bad Post")
		// 	return
		// }
		var (
			imagePath string
			imageName string
		)
		if len(newCommentData.Image) != 0 {
			// if there is an image in the comment
			imagePath, err = utils.CreateImagePath("../frontend/public/images/comments", newCommentData.Image)
			if err != nil {
				fmt.Println("Errorimage", err)
				return
			}
			imageName = strings.Split(imagePath, "/")[len(strings.Split(imagePath, "/"))-1]
		}
		newCommentData.ImagePath = imageName
		fmt.Println("comment data", newCommentData)
		_, errInsert := sqlrequest.CreateComment(db, newCommentData)
		if errInsert != nil {
			fmt.Println("Erroooooooooooooooooooooooooo", errInsert.Error())
			return
		}
	}
}
