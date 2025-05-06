// package sqlite

// import (
// 	"database/sql"
// 	"fmt"

// 	"github.com/golang-migrate/migrate/v4"
// 	"github.com/golang-migrate/migrate/v4/database/sqlite"
// 	_ "github.com/golang-migrate/migrate/v4/source/file"
// 	_ "github.com/mattn/go-sqlite3"
// )

// func Connect() (*sql.DB, error) {
// 	db, err := sql.Open("sqlite3", "./pkg/db/database.db")
// 	if err != nil { 
// 		return nil, err
// 	}
// 	return db, nil
// }

// func RunMigrations(db *sql.DB) error {
// 	const migrationsPath = "pkg/db/migrations/sqlite"
// 	driver, err := sqlite.WithInstance(db, &sqlite.Config{})
// 	if err != nil {
// 		return nil
// 	}
// 	m, err := migrate.NewWithDatabaseInstance(
// 		"file://"+migrationsPath,
// 		"sqlite3", driver)
// 	if err != nil {
// 		return fmt.Errorf("impossible migration : %v", err)
// 	}
// 	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
// 		return fmt.Errorf("err migrations 1111111111111 : %v", err)
// 	}

// 	// if err := m.Down(); err != nil && err != migrate.ErrNoChange {
// 	// 	return fmt.Errorf("err in migrations : %v", err)
// 	// }
// 	return nil
// }


package sqlite

import (
	"database/sql"
	"fmt"
	"os"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite"
	_ "github.com/golang-migrate/migrate/v4/source/file" // إضافة الاستيراد للمصدر 'file'
	_ "modernc.org/sqlite" // استخدام modernc/sqlite
)

// Connect to the SQLite database.
func Connect() (*sql.DB, error) {
	// Ensure the database file exists and open it.
	// Check if the file exists, if not, create it.
	if _, err := os.Stat("./pkg/db/database.db"); os.IsNotExist(err) {
		// If the database file doesn't exist, create it (this creates an empty database).
		file, err := os.Create("./pkg/db/database.db")
		if err != nil {
			return nil, fmt.Errorf("error creating database file: %v", err)
		}
		defer file.Close()
		fmt.Println("Database file created.")
	}

	// Now, attempt to open the database file
	db, err := sql.Open("sqlite", "./pkg/db/database.db") // Use the modernc/sqlite driver
	if err != nil {
		return nil, fmt.Errorf("error opening database: %v", err)
	}
	return db, nil
}

// Run database migrations
func RunMigrations(db *sql.DB) error {
	const migrationsPath = "pkg/db/migrations/sqlite"
	driver, err := sqlite.WithInstance(db, &sqlite.Config{})
	if err != nil {
		return fmt.Errorf("error initializing database driver: %v", err)
	}

	m, err := migrate.NewWithDatabaseInstance(
		"file://"+migrationsPath, // تحديد مسار ملفات الهجرة
		"sqlite3", driver)
	if err != nil {
		return fmt.Errorf("error creating migration instance: %v", err)
	}

	// Apply migrations
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("error running migrations: %v", err)
	}

	return nil
}
