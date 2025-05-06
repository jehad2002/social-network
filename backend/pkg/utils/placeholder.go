package utils

func GeneratePlaceholders(n int) string {
	placeholders := ""
	if n != 0 {
		placeholders += ","
	}
	for i := 0; i < n; i++ {
		if i != 0 {
			placeholders += ","
		}
		placeholders += "?"
	}
	return placeholders
}
