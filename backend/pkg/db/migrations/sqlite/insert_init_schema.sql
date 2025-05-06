CREATE TABLE IF NOT EXISTS User (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    FirstName VARCHAR(50),
    LastName VARCHAR(30),
    Nickname VARCHAR(30),
    Avatar VARCHAR(40),
    DateofBirth DATE,
    AboutMe VARCHAR(250),
    Email VARCHAR(100),
    Password VARCHAR(50),
    Profil VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS Category (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Libelle VARCHAR(50),
    Icon VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS Post (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Content TEXT,
    ImagePath VARCHAR(100),
    Date DATETIME,
    UserId INTEGER,
    VisibilityPost VARCHAR(50),
    FOREIGN KEY (UserId) REFERENCES User(Id)
);

CREATE TABLE IF NOT EXISTS PostVisibility (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    PostId INTEGER,
    Visibility INTEGER,
    FOREIGN KEY (PostId) REFERENCES Post(Id),
    FOREIGN KEY (Visibility) REFERENCES User(Id)
);

CREATE TABLE IF NOT EXISTS PostCategory (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    PostId INTEGER,
    CategoryId INTEGER,
    FOREIGN KEY (PostId) REFERENCES Post(Id),
    FOREIGN KEY (CategoryId) REFERENCES Category(Id)
);

CREATE TABLE IF NOT EXISTS Comment (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Content TEXT,
    ImagePath VARCHAR(100),
    Date DATETIME,
    PostId INTEGER,
    UserId INTEGER,
    FOREIGN KEY (PostId) REFERENCES Post(Id),
    FOREIGN KEY (UserId) REFERENCES User(Id)
);

CREATE TABLE IF NOT EXISTS Action (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Status INTEGER,
    UserId INTEGER,
    PostId INTEGER,
    CommentId INTEGER,
    FOREIGN KEY (UserId) REFERENCES User(Id),
    FOREIGN KEY (PostId) REFERENCES Post(Id),
    FOREIGN KEY (CommentId) REFERENCES Comment(Id)
);

CREATE TABLE IF NOT EXISTS Chat (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    SenderId INTEGER,
    TargetId INTEGER,
    Content TEXT,
    CreatedDate DATE,
    Type TEXT,
    FOREIGN KEY (SenderId) REFERENCES User(Id),
    FOREIGN KEY (TargetId) REFERENCES User(Id)
);

CREATE TABLE IF NOT EXISTS Event (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Title VARCHAR(100),
    Description TEXT,
    UserId INTEGER,
    GroupId INTEGER,
    Date DATE
);

CREATE TABLE IF NOT EXISTS EventMember (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    UserId INTEGER,
    EventId INTEGER,
    Status INTEGER
);

CREATE TABLE IF NOT EXISTS EventVisibility(
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    EventID INTERGER,
    UserId INTERGER,
    FOREIGN KEY(EventID) REFERENCES Event(ID),
    FOREIGN KEY(UserId) REFERENCES User(Id)
);

CREATE TABLE IF NOT EXISTS Follow (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Follower INTEGER,
    Following INTEGER,
    Type INTEGER
);

CREATE TABLE IF NOT EXISTS Groups (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name VARCHAR(50),
    Group_Creator TEXT,
    Creation_Date DATE,
    Description TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
	"token"	text NOT NULL,
	"id"	integer NOT NULL,
	PRIMARY KEY("token")
    FOREIGN KEY("id") REFERENCES User(Id)
);

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

CREATE TABLE IF NOT EXISTS groupMembers (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    GroupID INTEGER,
    UserID INTEGER,
    FOREIGN KEY (GroupID) REFERENCES Groups(Id),
    FOREIGN KEY (UserID) REFERENCES User(Id)
);

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

-- -- SQLite
-- INSERT INTO User (FirstName, LastName, Nickname, Avatar, DateofBirth, AboutMe, Email, Password, Profil)
-- VALUES 
--     ('Jehad', 'alami', 'jealami', 'avatar1.jpg', '2002-11-14', 'About Jehad', 'jehadalami11@example.com', 'password1', 'user'),
--     ('Jehan', 'alami', 'jeje', 'avatar2.jpg', '1992-06-23', 'About Jehan', 'jehan@example.com', 'password2', 'user'),
--     ('noor', 'no', 'noor1', 'avatar3.jpg', '2000-11-20', 'About noor', 'noor@example.com', 'password3', 'user'),
--     ('ahmad', 'al', 'ahm-al', 'avatar4.jpg', '2009-09-29', 'About ahmad', 'ahmad@example.com', 'password4', 'user'),
--     ('mahmood', 'al', 'mah-al', 'avatar5.jpg', '2009-09-29', 'About mahmood', 'mahmood@example.com', 'password5', 'user');

-- INSERT INTO Follow (Follower, Following, Type)
-- SELECT 
--     u1.Id AS FollowerId, 
--     u2.Id AS FollowingId,
--     1 AS Type 
-- FROM User u1
-- CROSS JOIN User u2
-- WHERE u1.Id != u2.Id;

--INSERT INTO Follow (Follower, Following, Type) VALUES
--(1, 3, 1),  -- Utilisateur d'ID 1 suit l'utilisateur d'ID 2
--(3, 1, 1),  -- Utilisateur d'ID 1 suit l'utilisateur d'ID 3
--(1, 2, 1),  -- Utilisateur d'ID 2 suit l'utilisateur d'ID 1
--(4, 3, 1);  -- Utilisateur d'ID 2 suit l'utilisateur d'ID 1

CREATE TABLE IF NOT EXISTS Message (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Expediteur INTEGER,
    Destinataire INTEGER,
    DestinataireType TEXT, 
    GroupeID INTEGER, 
    Contenue TEXT,
    Date DATETIME,
    Lu BOOLEAN DEFAULT 0,
    Type TEXT,
    FOREIGN KEY (Expediteur) REFERENCES User(id),
    FOREIGN KEY (Destinataire) REFERENCES User(id),
    FOREIGN KEY (GroupeID) REFERENCES Groups(id)
);

CREATE TABLE IF NOT EXISTS AddMemberRequests (
    RequestID INTEGER PRIMARY KEY AUTOINCREMENT,
    GroupID INTEGER,
    RequesterID INTEGER,
    RequestedID INTEGER,
    Status INTEGER,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (GroupID) REFERENCES Groups(Id),
    FOREIGN KEY (RequesterID) REFERENCES User(Id),
    FOREIGN KEY (RequestedID) REFERENCES User(Id)
)