CREATE TABLE IF NOT EXISTS sessions (
	"token"	text NOT NULL,
	"id"	integer NOT NULL,
	PRIMARY KEY("token")
    FOREIGN KEY("id") REFERENCES User(Id)
);