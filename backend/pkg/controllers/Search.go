package controllers

import (
	"backend/pkg/db/sqlite"
	"backend/pkg/sqlrequest"
	"encoding/json"
	"log"
	"net/http"
	"strings"
)

// هيكل بيانات العنصر المشترك بين المستخدمين والمجموعات
type SearchResult struct {
	ID     int    `json:"id"`
	Name   string `json:"name"`
	Avatar string `json:"avatar"`
	Type   string `json:"type"` // نوع العنصر: "user" أو "group"
}

// دالة البحث في قاعدة البيانات
func SearchHandler(w http.ResponseWriter, r *http.Request) {
	// الاتصال بقاعدة البيانات
	db, err := sqlite.Connect()
	if err != nil {
		log.Fatalf("❌ فشل الاتصال بقاعدة البيانات: %v", err)
		return
	}
	defer db.Close() // إغلاق الاتصال بعد الانتهاء

	w.Header().Set("Content-Type", "application/json")

	query := r.URL.Query().Get("query")
	if query == "" {
		json.NewEncoder(w).Encode([]SearchResult{})
		return
	}

	query = strings.ToLower(query)

	// 🔹 البحث عن المستخدمين
	users, err := sqlrequest.SearchUsers(db, query)
	if err != nil {
		log.Println("❌ خطأ في البحث عن المستخدمين:", err)
		http.Error(w, "Failed to search users", http.StatusInternalServerError)
		return
	}

	// 🔹 البحث عن المجموعات
	groups, err := sqlrequest.SearchGroups(db, query)
	if err != nil {
		log.Println("❌ خطأ في البحث عن المجموعات:", err)
		http.Error(w, "Failed to search groups", http.StatusInternalServerError)
		return
	}

	// 🔹 دمج النتائج
	var results []SearchResult
	for _, user := range users {
		results = append(results, SearchResult{
			ID:     user.ID,
			Name:   user.Name,
			Avatar: user.Avatar,
			Type:   "user",
		})
	}

	for _, group := range groups {
		results = append(results, SearchResult{
			ID:     group.ID,
			Name:   group.Name,
			Type:   "group",
		})
	}

	// إرسال النتيجة
	if err := json.NewEncoder(w).Encode(results); err != nil {
		log.Println("❌ خطأ في ترميز JSON:", err)
		http.Error(w, "Failed to encode results", http.StatusInternalServerError)
	}
}
