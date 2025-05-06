package sqlrequest

import (
	Models "backend/pkg/models"
	"backend/pkg/utils"
	"database/sql"
	"fmt"
	"log"
	"time"
)

func InsertPost(db *sql.DB, post Models.Posts) (int, error) {

	query, err := db.Prepare(`INSERT INTO Post(Content, ImagePath, Date, UserId, VisibilityPost) VALUES(?,?,?,?,COALESCE(NULLIF(?, ''), 'public'))`)
	if err != nil {
		return 0, err
	}
	datePost := time.Now().Format("2006-01-02 15:04:05")

	result, err := query.Exec(post.Content, post.ImagePath, datePost, post.UserId, post.Visibility)
	if err != nil {
		return 0, err
	}
	lastId, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	return int(lastId), nil
}

func PostOrEventVisiblity(db *sql.DB, PostOrEventId, UserId int, table string) error {

	var query string
	if table == "PostVisibility" {
		query = "INSERT INTO PostVisibility(PostId, Visibility) VALUES(?,?)"
	} else if table == "EventVisibility" {
		query = "INSERT INTO EventVisibility(EventId, UserId) VALUES(?,?)"
	}
	result, err := db.Exec(query, PostOrEventId, UserId)
	if err != nil {
		return err
	}

	n, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if n == 0 {
		return fmt.Errorf("no rows")
	}

	return nil
}

func SavePostOrEventVisibility(db *sql.DB, IdPostOrEvent int, UsersId []int, table string) error {

	for _, idUser := range UsersId {
		if errInsert := PostOrEventVisiblity(db, IdPostOrEvent, idUser, table); errInsert != nil {
			return errInsert
		}
	}
	return nil
}

func GetAllPost(db *sql.DB, idUser, meOryou int, postCanSee []string, boul bool) ([]Models.Posts, error) {

	var visibilityValues []interface{}
	visibilityValues = append(visibilityValues, idUser, meOryou, "public") 

	for _, group := range postCanSee {
		visibilityValues = append(visibilityValues, group)
	}
	visibilityValues = append(visibilityValues, idUser, "1", "follower")
	// fmt.Println("wweeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", visibilityValues)
	var query string
	if boul {
		query = `
			SELECT DISTINCT Post.Id, Post.Content, Post.ImagePath, Post.Date, Post.UserId, Post.VisibilityPost 
			FROM Post 
			LEFT JOIN PostVisibility ON Post.Id = PostVisibility.PostId 
			LEFT JOIN Follow f ON Post.UserID = f.Following
			WHERE Post.UserID = ? OR PostVisibility.Visibility = ? OR Post.VisibilityPost IN (?` + utils.GeneratePlaceholders(len(postCanSee)) + `) 
				OR (Post.UserID IN (SELECT Following FROM Follow WHERE Follower = ? AND Type = ?) AND Post.VisibilityPost = ?)
			ORDER BY Post.Date DESC
		`
	} else {
		query = `
			SELECT DISTINCT Post.Id, Post.Content, Post.ImagePath, Post.Date, Post.UserId, Post.VisibilityPost 
			FROM Post 
			LEFT JOIN PostVisibility ON Post.Id = PostVisibility.PostId 
			LEFT JOIN Follow f ON Post.UserID = f.Following
			WHERE Post.UserID = ? AND (PostVisibility.Visibility = ? OR Post.VisibilityPost IN (?` + utils.GeneratePlaceholders(len(postCanSee)) + `) 
					OR (Post.UserID IN (SELECT Following FROM Follow WHERE Follower = ? AND Type = ?) AND Post.VisibilityPost = ?)
				)
			ORDER BY Post.Date DESC
		`
	}
	querytest, err := db.Prepare(query)
	if err != nil {
		fmt.Println("err prepare", err)
		return []Models.Posts{}, err
	}
	rows, err := querytest.Query(visibilityValues...)
	if err != nil {
		fmt.Println("Err query", err.Error())
		return []Models.Posts{}, err
	}
	defer rows.Close()

	var posts []Models.Posts
	for rows.Next() {
		var post Models.Posts
		err := rows.Scan(&post.Id, &post.Content, &post.ImagePath, &post.DatePosted, &post.UserId, &post.Visibility)
		if err != nil {
			fmt.Println("err row", err.Error())
			return []Models.Posts{}, err
		}
		posts = append(posts, post)
	}

	return posts, nil
}

func GetPostById(db *sql.DB, Id int) (Models.Posts, error) {
	query := "SELECT * FROM Post WHERE Id = ?"
	var post Models.Posts
	rows := db.QueryRow(query, Id)
	err := rows.Scan(&post.Id, &post.Content, &post.ImagePath, &post.DatePosted, &post.UserId, &post.Visibility)
	if err == sql.ErrNoRows {
		return post, err
	}
	return post, nil
}

func GetPostByUserId(db *sql.DB, userId int) []Models.Posts {
	query := "SELECT * FROM Post WHERE UserId= ? ORDER BY Date DESC"
	rows, err := db.Query(query, userId)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	var posts []Models.Posts
	for rows.Next() {
		var post Models.Posts
		err := rows.Scan(&post.Id, &post.Content, &post.ImagePath, &post.DatePosted, &post.UserId, &post.Visibility)
		if err != nil {
			log.Fatal(err)
		}
		posts = append(posts, post)
	}

	return posts
}
