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
	"strconv"
	"strings"
)

func CreatePost(w http.ResponseWriter, r *http.Request) {
	db, err := sqlite.Connect()
	if err != nil {
		log.Fatalf("err about creat post : %v", err)
		StatusInternalServerError(w)
		return
	}
	usersession, stat := IsAuthenticated(r)
	if !stat {
		fmt.Println("User is not authentificate 1 2 3 ")
		StatusUnauthorized(w)
		return
	}

	if r.Method == http.MethodGet {
		// fmt.Println("username", usersession.User)
		followers := sqlrequest.GetFollowUser(usersession.User.ID, usersession.User.ID, true)

		// fmt.Println("follower", followers)
		newDataPostForm := Models.PostFormData{
			UserInfo: usersession.User,
			Follower: followers,
		}

		jsonData, err := json.Marshal(newDataPostForm)
		if err != nil {
			fmt.Println("Erreur lors du Marshal", err.Error())
			StatusInternalServerError(w)
			return
		}
		// fmt.Println("jsonData", jsonData)
		w.Header().Set("Content-Type", "application/json")
		_, err = w.Write(jsonData)
		if err != nil {
			fmt.Println("Err json", err.Error())
			StatusInternalServerError(w)
		}

	} else if r.Method == http.MethodPost {
		data, err := io.ReadAll(r.Body)
		if err != nil {
			fmt.Println("Error1", err)
			StatusInternalServerError(w)
			return
		}

		var newPostData = Models.Posts{}
		err = json.Unmarshal(data, &newPostData)
		if err != nil {
			fmt.Println("Error2", err.Error())
			StatusInternalServerError(w)
			return
		}
		// fmt.Println("dataPost", newPostData)
		err = utils.ValidatePost(newPostData)
		if err != nil {
			fmt.Println("Bad Post")
			StatusBadRequest(w, err.Error())
			return
		}
		var (
			imagePath string
			imageName string
		)
		if len(newPostData.Image) != 0 {
			imagePath, err = utils.CreateImagePath("../frontend/public/images/posts", newPostData.Image)
			if err != nil {
				fmt.Println("Err creat image", err)
				StatusInternalServerError(w)
				return
			}
			imageName = strings.Split(imagePath, "/")[len(strings.Split(imagePath, "/"))-1]
		}
		newPostData.ImagePath = imageName
		newPostData.UserId = usersession.User.ID

		idNewPost, errInsert := sqlrequest.InsertPost(db, newPostData)
		if errInsert != nil {
			fmt.Println("Errooooooooooooooooooo 11111111111111", errInsert.Error())
			StatusInternalServerError(w)
			return
		}
		if len(newPostData.UserSelected) != 0 {
			errInsert = sqlrequest.SavePostOrEventVisibility(db, idNewPost, newPostData.UserSelected, "PostVisibility")
			if errInsert != nil {
				fmt.Println("Errooooooooooooooooooo22222222222222222", errInsert.Error())
				StatusInternalServerError(w)
				return
			}
		}
	}
}

func CreatePostGroup(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		db, err := sqlite.Connect()
		if err != nil {
			log.Fatalf("err creat post group : %v", err)
			StatusInternalServerError(w)
			return
		}
		usersession, stat := IsAuthenticated(r)
		if !stat {
			fmt.Println("User is not authentificate postgroup")
			StatusUnauthorized(w)
			return
		}

		data, err := io.ReadAll(r.Body)
		if err != nil {
			fmt.Println("Error1", err)
			StatusInternalServerError(w)
			return
		}

		var newPostData = Models.Posts{}
		err = json.Unmarshal(data, &newPostData)
		if err != nil {
			fmt.Println("Error2", err.Error())
			StatusInternalServerError(w)
			return
		}

		id, err := strconv.Atoi(newPostData.Visibility)
		if err != nil {
			fmt.Println("Error while converting", err)
			return
		}

		isMember, err := IsMemberOfGroup(usersession.User.ID, id)
		if err != nil {
			fmt.Println("Error:", err)
			return
		}

		if !isMember {
			fmt.Println("User is not a member of the group")
			w.WriteHeader(http.StatusUnauthorized)
			WriteResponse(w, "Not allowed")
			return
		}
		// fmt.Println("dataPost", newPostData)
		err = utils.ValidatePost(newPostData)
		if err != nil {
			fmt.Println("Bad Post")
			StatusBadRequest(w, err.Error())
			return
		}
		var (
			imagePath string
			imageName string
		)
		if len(newPostData.Image) != 0 {
			imagePath, err = utils.CreateImagePath("../frontend/public/images/posts", newPostData.Image)
			if err != nil {
				fmt.Println("Err in the image", err)
				StatusInternalServerError(w)
				return
			}
			imageName = strings.Split(imagePath, "/")[len(strings.Split(imagePath, "/"))-1]
		}
		newPostData.ImagePath = imageName
		newPostData.UserId = usersession.User.ID

		_, errInsert := sqlrequest.InsertPost(db, newPostData)
		if errInsert != nil {
			fmt.Println("Err a in 1", errInsert.Error())
			StatusInternalServerError(w)
			return
		}
		//fmt.Println("Idpostgroup", idNewPost)
	}
}

func GetAllPostHandler(w http.ResponseWriter, r *http.Request) {
	db, err := sqlite.Connect()
	if err != nil {
		RespondJSON(w, http.StatusInternalServerError, "err post handler", false)
		return
	}
	usersession, _ := IsAuthenticated(r)
	// if !stat {
	// 	RespondJSON(w, http.StatusUnauthorized, "Access to this resource is Unauthorized. Please ensure you have the required permissions or credentials to access it.", false)
	// 	return
	// }
	defer db.Close()
	//fmt.Println(usersession.User.ID)
	groupId, err := sqlrequest.GetUserGroups(db, usersession.User.ID)
	if err != nil {
		RespondJSON(w, http.StatusInternalServerError, "Error getting Group Id", false)
		return
	}

	var postsDatas []Models.PostDatas
	posts, err := sqlrequest.GetAllPost(db, usersession.User.ID, usersession.User.ID, groupId, true)
	if err != nil {
		RespondJSON(w, http.StatusInternalServerError, "Error getting Posts", false)
		return
	}
	for _, post := range posts {
		var postData Models.PostDatas
		postData.Id = post.Id
		postData.Content = post.Content
		postData.ImagePath = post.ImagePath
		userPost, _ := sqlrequest.GetUserById(db, post.UserId)
		if userPost.Id == 0 {
			postData.UserId = 0
			postData.NickName = "Unknown"
			postData.UserAvatar = "default.png"
		} else {
			postData.UserId = userPost.Id
			postData.NickName = userPost.FirstName + " " + userPost.LastName
			postData.UserAvatar = userPost.Avatar
		}
		if usersession.User.ID == userPost.Id {
			postData.Follow = -2
		} else {
			postData.Follow = sqlrequest.IsFollowing(db, usersession.User.ID, userPost.Id)
		}
		postData.NumLikes, postData.IsLike = sqlrequest.GetAction(db, post.Id, 0, usersession.User.ID)
		postData.NumComments = utils.AbregerNombreLikesOrComment(len(sqlrequest.GetCommentByIdPost(db, post.Id)))
		postData.DatePosted = utils.FormatDate(post.DatePosted)
		postsDatas = append(postsDatas, postData)
	}

	jsonDatas, _ := json.Marshal(postsDatas)
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonDatas)
}

func GetPostById(w http.ResponseWriter, r *http.Request) {
	db, err := sqlite.Connect()
	if err != nil {
		RespondJSON(w, http.StatusInternalServerError, "err in ID post", false)
		return
	}
	usersession, stat := IsAuthenticated(r)
	if !stat {
		RespondJSON(w, http.StatusUnauthorized, "Access to this resource is Unauthorized. Please ensure you have the required permissions or credentials to access it.", false)
		return
	}
	userId := utils.GetIdOfUrl(r, "api/post")
	if userId == 0 {
		RespondJSON(w, http.StatusBadRequest, "Post parameter invalide !!!", false)
		return
	}
	defer db.Close()
	post, errP := sqlrequest.GetPostById(db, userId)
	if errP != nil {
		RespondJSON(w, http.StatusNotFound, "Post for identifier "+strconv.Itoa(userId)+" doesn't exist !!!", false)
		return
	}
	var postData Models.PostDatas
	postData.Id = post.Id
	postData.Content = post.Content
	postData.ImagePath = post.ImagePath
	userPost, _ := sqlrequest.GetUserById(db, post.UserId)
	if userPost.Id == 0 {
		postData.UserId = 0
		postData.NickName = "Unknown"
		postData.UserAvatar = "default.png"
	} else {
		postData.UserId = userPost.Id
		postData.NickName = userPost.FirstName + " " + userPost.LastName
		postData.UserAvatar = userPost.Avatar
	}
	if usersession.User.ID == userPost.Id {
		postData.Follow = -2
	} else {
		postData.Follow = sqlrequest.IsFollowing(db, usersession.User.ID, userPost.Id)
	}
	var nLike = 0
	nLike, postData.IsLike = sqlrequest.GetAction(db, post.Id, 0, usersession.User.ID)
	postData.NumLikes, postData.IsLike = sqlrequest.GetAction(db, post.Id, 0, usersession.User.ID)
	postData.DatePosted = utils.FormatDate(post.DatePosted)
	postData.NumComments = utils.AbregerNombreLikesOrComment(len(sqlrequest.GetCommentByIdPost(db, post.Id)))
	CommentsByPost := sqlrequest.GetCommentByIdPost(db, postData.Id)
	nLike++
	for _, c := range CommentsByPost {
		var commentDatas Models.CommentDatas
		commentDatas.Id = c.Id
		commentDatas.Content = c.Content
		commentDatas.ImagePath = c.ImagePath
		commentDatas.DateFormat = utils.FormatDate(c.Date)
		userComment, _ := sqlrequest.GetUserById(db, c.UserId)
		if userComment.Id == 0 {
			commentDatas.NickName = "Unknown"
			commentDatas.AvatarUser = "default.png"
		} else {
			commentDatas.NickName = userComment.FirstName + " " + userComment.LastName
			commentDatas.AvatarUser = userComment.Avatar
		}
		commentDatas.NumLikes, commentDatas.IsLike = sqlrequest.GetAction(db, 0, c.Id, usersession.User.ID)
		postData.Comments = append(postData.Comments, commentDatas)
	}
	userInfos, _ := sqlrequest.GetUserById(db, usersession.User.ID)
	datas := struct {
		Post Models.PostDatas
		User Models.User
	}{
		Post: postData,
		User: userInfos,
	}
	jsonDatas, _ := json.Marshal(datas)
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonDatas)
}

func GetPostsByUser(w http.ResponseWriter, r *http.Request, userId int) ([]Models.PostDatas, []string) {
	db, _ := sqlite.Connect()
	// if err != nil {
	// 	log.Fatalf("err : %v", err)
	// }
	usersession, stat := IsAuthenticated(r)
	if !stat {
		fmt.Println("User is not authentificate getallpost")
		StatusUnauthorized(w)
		return nil, nil
	}
	defer db.Close()
	var postsDatas []Models.PostDatas
	var imagesPosted []string
	groupId, err := sqlrequest.GetUserGroups(db, usersession.User.ID)
	if err != nil {
		RespondJSON(w, http.StatusInternalServerError, "Error getting Group Id", false)
		return nil, nil
	}
	// posts := sqlrequest.GetPostByUserId(db, userId)
	posts, err := sqlrequest.GetAllPost(db, userId, usersession.User.ID, groupId, false)
	if err != nil {
		RespondJSON(w, http.StatusInternalServerError, "Error getting Posts", false)
		return nil, nil
	}
	for _, post := range posts {
		var postData Models.PostDatas
		postData.Id = post.Id
		postData.Content = post.Content
		postData.ImagePath = post.ImagePath
		userPost, _ := sqlrequest.GetUserById(db, userId)
		if userPost.Id == 0 {
			postData.UserId = 0
			postData.NickName = "Unknown"
			postData.UserAvatar = "default.png"
		} else {
			postData.UserId = userPost.Id
			postData.NickName = userPost.FirstName + " " + userPost.LastName
			postData.UserAvatar = userPost.Avatar
		}
		if usersession.User.ID == userPost.Id {
			postData.Follow = -2
		} else {
			postData.Follow = sqlrequest.IsFollowing(db, usersession.User.ID, userPost.Id)
		}
		postData.NumLikes, postData.IsLike = sqlrequest.GetAction(db, post.Id, 0, 1)
		postData.NumComments = utils.AbregerNombreLikesOrComment(len(sqlrequest.GetCommentByIdPost(db, post.Id)))
		if postData.ImagePath != "" {
			imagesPosted = append(imagesPosted, postData.ImagePath)
		}
		postsDatas = append(postsDatas, postData)
	}
	return postsDatas, imagesPosted
}
