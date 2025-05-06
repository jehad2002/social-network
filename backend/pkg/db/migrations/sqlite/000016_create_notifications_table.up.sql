CREATE TABLE IF NOT EXISTS Notifications (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    SenderId INTEGER,
    TargetId INTEGER,
    Type INTEGER,
    Accepted BOOLEAN,
    Viewed BOOLEAN,
    CreatedDate DATE,
    FOREIGN KEY (SenderId) REFERENCES User(Id),
    FOREIGN KEY (TargetId) REFERENCES User(Id)
);