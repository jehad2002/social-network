package sqlrequest

import (
	"database/sql"
	"log"
	"strings"
)

// User Struct مطابق لتعريف المستخدم في قاعدة البيانات
type User struct {
	ID     int
	Name   string
	Avatar string
}

// Group Struct لتعريف المجموعات
type Group struct {
	ID     int
	Name   string
	Avatar string
}

// SearchUsers يستقبل قاعدة البيانات والبحث عن مستخدمين
func SearchUsers(db *sql.DB, searchQuery string) ([]User, error) {
	searchQuery = strings.ToLower(searchQuery) // تحويل إلى حروف صغيرة لتحسين الأداء

	query := "SELECT Id, CONCAT(FirstName, ' ', LastName) AS Name, Avatar FROM User WHERE LOWER(CONCAT(FirstName, ' ', LastName)) LIKE ?"
	rows, err := db.Query(query, "%"+searchQuery+"%")
	if err != nil {
		log.Println("❌ Failed to execute search query:", err)
		return nil, err
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var user User
		if err := rows.Scan(&user.ID, &user.Name, &user.Avatar); err != nil {
			log.Println("❌ Failed to scan row:", err)
			continue // ✅ تجاوز الصف الفاسد بدلًا من إيقاف البحث بالكامل
		}
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		log.Println("❌ Error during row iteration:", err)
		return nil, err
	}

	return users, nil
}

// SearchGroups البحث عن المجموعات
func SearchGroups(db *sql.DB, query string) ([]Group, error) {
	rows, err := db.Query("SELECT id, name FROM Groups WHERE LOWER(name) LIKE ?", "%"+query+"%")
	if err != nil {
		log.Println("❌ خطأ في تنفيذ استعلام البحث عن المجموعات:", err)
		return nil, err
	}
	defer rows.Close() // ✅ تأكد من وضع `defer` بعد `db.Query` مباشرة

	var groups []Group
	for rows.Next() {
		var group Group
		if err := rows.Scan(&group.ID, &group.Name); err != nil {
			log.Println("❌ خطأ في جلب بيانات المجموعة:", err)
			continue // ✅ تجاوز الصف الفاسد بدلاً من إيقاف البحث
		}
		groups = append(groups, group)
	}

	return groups, nil
}
