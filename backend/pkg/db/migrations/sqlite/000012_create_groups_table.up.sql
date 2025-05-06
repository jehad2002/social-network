CREATE TABLE IF NOT EXISTS Groups (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name VARCHAR(50),
    Group_Creator TEXT,
    Creation_Date DATE,
    Description TEXT
);