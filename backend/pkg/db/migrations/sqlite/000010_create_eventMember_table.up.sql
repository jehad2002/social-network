CREATE TABLE IF NOT EXISTS EventMember (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId INTEGER,
    EventId INTEGER,
    Status INTEGER
);