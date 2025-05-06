CREATE TABLE IF NOT EXISTS MembershipRequests (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    GroupID INTEGER,
    GroupName TEXT,
    GroupCreator INTEGER,
    RequesterID INTEGER,
    RequesterName TEXT,
    Status INTEGER,
    RequestDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);