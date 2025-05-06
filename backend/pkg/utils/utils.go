package utils

import (
	"fmt"
	"strconv"
	"time"
)

func AbregerNombreLikesOrComment(likes int) string {
	if likes < 1000 {
		return strconv.Itoa(likes) 
	} else if likes < 1000000 {
		return fmt.Sprintf("%.1fk", float64(likes)/1000)
	} else if likes < 1000000000 {
		return fmt.Sprintf("%.1fM", float64(likes)/1000000)
	}
	return strconv.Itoa(likes)
}

func FormatDate(dbDate time.Time) string {
	currentTime := time.Now()
	diff := currentTime.Sub(dbDate)
	var formattedDate string
	if diff.Hours() > 24 {
		days := int(diff.Hours() / 24)
		formattedDate = fmt.Sprintf("%d day ago", days)
	} else if diff.Hours() >= 1 {
		hours := int(diff.Hours())
		formattedDate = fmt.Sprintf("%d h ago", hours)
	} else if diff.Minutes() >= 1 {
		minutes := int(diff.Minutes())
		formattedDate = fmt.Sprintf("%d mn ago", minutes)
	} else {
		formattedDate = "less than a minute ago"
	}
	return formattedDate
}
