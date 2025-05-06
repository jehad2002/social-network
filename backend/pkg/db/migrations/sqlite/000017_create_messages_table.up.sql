CREATE TABLE IF NOT EXISTS Message (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Expediteur INTEGER,
    Destinataire INTEGER,
    DestinataireType TEXT, 
    GroupeID INTEGER,
    Contenue TEXT,
    Date DATETIME,
    Lu BOOLEAN DEFAULT 0,
    FOREIGN KEY (Expediteur) REFERENCES User(id),
    FOREIGN KEY (Destinataire) REFERENCES User(id),
    FOREIGN KEY (GroupeID) REFERENCES Groups(id)
);