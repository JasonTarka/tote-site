CREATE TABLE positions (
	id			INT		PRIMARY KEY	AUTO_INCREMENT,
	`name`		VARCHAR(20),
	sortOrder	INT		NOT NULL	DEFAULT 99
);

INSERT INTO positions(`name`, sortOrder) VALUES
	('Host', 1), -- 1
	('Player', 6), -- 2
	('Lights', 2), -- 3
	('Front of House', 3), -- 4
	('Sound', 4), -- 5
	('Producer', 5); -- 6
