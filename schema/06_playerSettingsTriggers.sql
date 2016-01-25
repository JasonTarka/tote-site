DROP TRIGGER IF EXISTS insert_settings;
DROP TRIGGER IF EXISTS update_settings;
DROP TRIGGER IF EXISTS player_insert_settings;
DROP TRIGGER IF EXISTS player_update_settings;

DELIMITER //
CREATE TRIGGER player_insert_settings
BEFORE INSERT ON players
FOR EACH ROW
BEGIN
	IF NEW.isActive = 1 THEN
		SET NEW.settings = NEW.settings | 1;
	ELSE
		SET NEW.settings = NEW.settings &~ 1;
	END IF;
END
;//
DELIMITER ;

DELIMITER //
CREATE TRIGGER player_update_settings
BEFORE UPDATE ON players
FOR EACH ROW
BEGIN
	IF NEW.isActive = 1 THEN
		SET NEW.settings = NEW.settings | 1;
	ELSE
		SET NEW.settings = NEW.settings &~ 1;
	END IF;
END
;//
DELIMITER ;