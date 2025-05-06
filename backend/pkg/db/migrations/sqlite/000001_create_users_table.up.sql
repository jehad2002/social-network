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