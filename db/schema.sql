-- Database: carma (create manually or: CREATE DATABASE carma;)
SET NAMES utf8mb4;
USE carma;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS session_events;
DROP TABLE IF EXISTS game_sessions;
DROP TABLE IF EXISTS answer_options;
DROP TABLE IF EXISTS clues;
DROP TABLE IF EXISTS mission_stops;
DROP TABLE IF EXISTS missions;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS game_modes;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE game_modes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL,
  description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE locations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  slug VARCHAR(128) NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  region VARCHAR(128) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE missions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  mode_id INT UNSIGNED NOT NULL,
  slug VARCHAR(128) NOT NULL,
  title VARCHAR(255) NOT NULL,
  intro_text TEXT NOT NULL,
  difficulty ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
  CONSTRAINT fk_missions_mode FOREIGN KEY (mode_id) REFERENCES game_modes (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE clues (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question TEXT NOT NULL,
  scripture_ref VARCHAR(255) DEFAULT NULL,
  clue_type ENUM('scripture', 'geography', 'parable', 'history') NOT NULL DEFAULT 'scripture',
  is_finale TINYINT(1) NOT NULL DEFAULT 0,
  time_limit_sec INT UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE mission_stops (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  mission_id INT UNSIGNED NOT NULL,
  step_order INT UNSIGNED NOT NULL,
  location_id INT UNSIGNED NOT NULL,
  clue_id INT UNSIGNED NOT NULL,
  UNIQUE KEY uq_mission_step (mission_id, step_order),
  CONSTRAINT fk_stops_mission FOREIGN KEY (mission_id) REFERENCES missions (id) ON DELETE CASCADE,
  CONSTRAINT fk_stops_location FOREIGN KEY (location_id) REFERENCES locations (id),
  CONSTRAINT fk_stops_clue FOREIGN KEY (clue_id) REFERENCES clues (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE answer_options (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  clue_id INT UNSIGNED NOT NULL,
  location_id INT UNSIGNED DEFAULT NULL,
  option_text VARCHAR(512) NOT NULL,
  is_correct TINYINT(1) NOT NULL DEFAULT 0,
  sort_order TINYINT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_options_clue FOREIGN KEY (clue_id) REFERENCES clues (id) ON DELETE CASCADE,
  CONSTRAINT fk_options_location FOREIGN KEY (location_id) REFERENCES locations (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE game_sessions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  mission_id INT UNSIGNED NOT NULL,
  current_step INT UNSIGNED NOT NULL DEFAULT 0,
  score INT NOT NULL DEFAULT 0,
  status ENUM('active', 'complete') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_session_mission FOREIGN KEY (mission_id) REFERENCES missions (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_sessions_mission ON game_sessions (mission_id);
