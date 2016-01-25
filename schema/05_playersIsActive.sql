
-- Immediately called sproc to get aroung MySQL stupidity
DELIMITER $$
CREATE PROCEDURE Alter_Table()
BEGIN
    DECLARE _count INT;
    SET _count = (  SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE   TABLE_NAME = 'players' AND 
                            COLUMN_NAME = 'isActive');
    IF _count = 0 THEN
        ALTER TABLE players
            ADD COLUMN isActive TINYINT(1) NOT NULL DEFAULT 1;
    END IF;
END $$
DELIMITER ;

CALL Alter_Table;
DROP PROCEDURE Alter_Table;

-- `settings` is a bitmasked field, where 1 denotes active
-- user, and other values don't matter anymore
UPDATE players
SET isActive = (settings & 1);
