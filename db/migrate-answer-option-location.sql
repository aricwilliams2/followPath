-- Run once on an existing carma database (adds map label support for answer choices).
USE carma;

SET @has_col := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'answer_options'
    AND COLUMN_NAME = 'location_id'
);

SET @ddl := IF(
  @has_col = 0,
  'ALTER TABLE answer_options ADD COLUMN location_id INT UNSIGNED DEFAULT NULL AFTER clue_id',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_fk := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'answer_options'
    AND CONSTRAINT_NAME = 'fk_options_location'
);

SET @fk := IF(
  @has_fk = 0,
  'ALTER TABLE answer_options ADD CONSTRAINT fk_options_location FOREIGN KEY (location_id) REFERENCES locations (id)',
  'SELECT 1'
);
PREPARE stmt FROM @fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
