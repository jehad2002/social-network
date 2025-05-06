CREATE TABLE IF NOT EXISTS Chat (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    SenderId INTEGER,
    TargetId INTEGER,
    Content TEXT,
    CreatedDate DATE,
    CreatedTime TIME,
    FOREIGN KEY (SenderId) REFERENCES User(Id),
    FOREIGN KEY (TargetId) REFERENCES User(Id)
);