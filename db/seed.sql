SET NAMES utf8mb4;
USE carma;

-- Safe to re-run in dev: clear tables this script fills (clears any partial prior seed).
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE mission_results;
TRUNCATE TABLE game_sessions;
TRUNCATE TABLE mission_stops;
TRUNCATE TABLE answer_options;
TRUNCATE TABLE missions;
TRUNCATE TABLE clues;
TRUNCATE TABLE locations;
TRUNCATE TABLE game_modes;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO game_modes (slug, name, description) VALUES
('journey_of_paul', 'Journey of Paul', 'Acts-based trails through the cities Paul knew'),
('kings_kingdoms', 'Kings & Kingdoms', 'Israel''s history from shepherds to exile'),
('prophet_pursuit', 'Prophet Pursuit', 'Follow the prophets and their callings'),
('parable_paths', 'Parable Paths', 'Teachings of Christ — places and meanings');

INSERT INTO locations (name, slug, latitude, longitude, region) VALUES
('Jerusalem', 'jerusalem', 31.768319, 35.213710, 'Judah'),
('Damascus', 'damascus', 33.513000, 36.276000, 'Syria'),
('Antioch (Syria)', 'antioch-syria', 36.202500, 36.161000, 'Syria'),
('Ephesus', 'ephesus', 37.939722, 27.340833, 'Asia Minor'),
('Corinth', 'corinth', 37.938611, 22.927222, 'Greece'),
('Joppa', 'joppa', 32.054900, 34.752200, 'Coast'),
('Nineveh', 'nineveh', 36.359400, 43.152700, 'Assyria'),
('Babylon', 'babylon', 32.535500, 44.427500, 'Mesopotamia'),
('Bethlehem', 'bethlehem', 31.705361, 35.202328, 'Judah'),
('Nazareth', 'nazareth', 32.699635, 35.303546, 'Galilee'),
('Jericho', 'jericho', 31.855833, 35.459167, 'Judah'),
('Mount Carmel', 'mount-carmel', 32.732917, 35.036278, 'Carmel'),
('Mediterranean Sea', 'mediterranean-sea', 35.200000, 18.500000, 'The Great Sea'),
('Red Sea', 'red-sea', 28.200000, 34.650000, 'Sea'),
('Sea of Galilee', 'sea-of-galilee', 32.831111, 35.594444, 'Galilee'),
('Valley of Elah', 'elah-valley', 31.676944, 34.957778, 'Judah'),
('Mount Ararat (region)', 'ararat-region', 39.714167, 44.297778, 'Armenia');

INSERT INTO clues (question, scripture_ref, clue_type, is_finale, time_limit_sec) VALUES
(
  'A sacred scroll was traced from Jerusalem toward a city where Saul encountered the risen Lord on the road. Which city?',
  'Acts 9',
  'scripture',
  0,
  NULL
);

INSERT INTO answer_options (clue_id, option_text, is_correct, sort_order)
(SELECT id, 'Damascus', 1, 0 FROM clues WHERE scripture_ref = 'Acts 9' LIMIT 1)
UNION ALL
(SELECT id, 'Tarsus', 0, 1 FROM clues WHERE scripture_ref = 'Acts 9' LIMIT 1)
UNION ALL
(SELECT id, 'Caesarea', 0, 2 FROM clues WHERE scripture_ref = 'Acts 9' LIMIT 1)
UNION ALL
(SELECT id, 'Athens', 0, 3 FROM clues WHERE scripture_ref = 'Acts 9' LIMIT 1);

INSERT INTO clues (question, scripture_ref, clue_type, is_finale, time_limit_sec) VALUES
(
  'Paul set out from here with Barnabas on the Spirit-led mission recorded in Acts 13.',
  'Acts 13',
  'scripture',
  0,
  NULL
);

INSERT INTO answer_options (clue_id, option_text, is_correct, sort_order)
(SELECT id, 'Antioch (Syria)', 1, 0 FROM clues WHERE scripture_ref = 'Acts 13' LIMIT 1)
UNION ALL
(SELECT id, 'Jerusalem', 0, 1 FROM clues WHERE scripture_ref = 'Acts 13' LIMIT 1)
UNION ALL
(SELECT id, 'Damascus', 0, 2 FROM clues WHERE scripture_ref = 'Acts 13' LIMIT 1)
UNION ALL
(SELECT id, 'Rome', 0, 3 FROM clues WHERE scripture_ref = 'Acts 13' LIMIT 1);

INSERT INTO clues (question, scripture_ref, clue_type, is_finale, time_limit_sec) VALUES
(
  'Paul taught publicly for two years in this major city where the Ephesian uproar unfolded.',
  'Acts 19',
  'scripture',
  0,
  NULL
);

INSERT INTO answer_options (clue_id, option_text, is_correct, sort_order)
(SELECT id, 'Ephesus', 1, 0 FROM clues WHERE scripture_ref = 'Acts 19' LIMIT 1)
UNION ALL
(SELECT id, 'Corinth', 0, 1 FROM clues WHERE scripture_ref = 'Acts 19' LIMIT 1)
UNION ALL
(SELECT id, 'Philippi', 0, 2 FROM clues WHERE scripture_ref = 'Acts 19' LIMIT 1)
UNION ALL
(SELECT id, 'Thessalonica', 0, 3 FROM clues WHERE scripture_ref = 'Acts 19' LIMIT 1);

INSERT INTO clues (question, scripture_ref, clue_type, is_finale, time_limit_sec) VALUES
(
  'Paul teamed with Aquila and Priscilla and wrote earnest letters from this prominent Greek congregation.',
  'Acts 18',
  'scripture',
  0,
  NULL
);

INSERT INTO answer_options (clue_id, option_text, is_correct, sort_order)
(SELECT id, 'Corinth', 1, 0 FROM clues WHERE scripture_ref = 'Acts 18' LIMIT 1)
UNION ALL
(SELECT id, 'Ephesus', 0, 1 FROM clues WHERE scripture_ref = 'Acts 18' LIMIT 1)
UNION ALL
(SELECT id, 'Antioch (Syria)', 0, 2 FROM clues WHERE scripture_ref = 'Acts 18' LIMIT 1)
UNION ALL
(SELECT id, 'Babylon', 0, 3 FROM clues WHERE scripture_ref = 'Acts 18' LIMIT 1);

INSERT INTO clues (question, scripture_ref, clue_type, is_finale, time_limit_sec) VALUES
(
  'The Calling: name the missionary base where prophets and teachers were sent out before Paul sailed westward repeatedly.',
  'Acts 13:1',
  'history',
  1,
  45
);

INSERT INTO answer_options (clue_id, option_text, is_correct, sort_order)
(SELECT id, 'Antioch (Syria)', 1, 0 FROM clues WHERE scripture_ref = 'Acts 13:1' LIMIT 1)
UNION ALL
(SELECT id, 'Jerusalem', 0, 1 FROM clues WHERE scripture_ref = 'Acts 13:1' LIMIT 1)
UNION ALL
(SELECT id, 'Joppa', 0, 2 FROM clues WHERE scripture_ref = 'Acts 13:1' LIMIT 1)
UNION ALL
(SELECT id, 'Ephesus', 0, 3 FROM clues WHERE scripture_ref = 'Acts 13:1' LIMIT 1);

INSERT INTO missions (mode_id, slug, title, intro_text, difficulty)
SELECT id, 'lost-scroll-jerusalem-corinth',
  'The Lost Scroll: Jerusalem to Corinth',
  'A sacred scroll has departed from Jerusalem… rumors place it westward along trails Paul traveled — beginning where the road once blinded a persecutor turned preacher. Follow the Word, chart each stop, and restore what was entrusted to the churches.',
  'medium'
FROM game_modes WHERE slug = 'journey_of_paul' LIMIT 1;

INSERT INTO mission_stops (mission_id, step_order, location_id, clue_id)
SELECT m.id, 0, l.id, c.id
FROM missions m
JOIN locations l ON l.slug = 'damascus'
JOIN clues c ON c.scripture_ref = 'Acts 9'
WHERE m.slug = 'lost-scroll-jerusalem-corinth';

INSERT INTO mission_stops (mission_id, step_order, location_id, clue_id)
SELECT m.id, 1, l.id, c.id
FROM missions m
JOIN locations l ON l.slug = 'antioch-syria'
JOIN clues c ON c.scripture_ref = 'Acts 13'
WHERE m.slug = 'lost-scroll-jerusalem-corinth';

INSERT INTO mission_stops (mission_id, step_order, location_id, clue_id)
SELECT m.id, 2, l.id, c.id
FROM missions m
JOIN locations l ON l.slug = 'ephesus'
JOIN clues c ON c.scripture_ref = 'Acts 19'
WHERE m.slug = 'lost-scroll-jerusalem-corinth';

INSERT INTO mission_stops (mission_id, step_order, location_id, clue_id)
SELECT m.id, 3, l.id, c.id
FROM missions m
JOIN locations l ON l.slug = 'corinth'
JOIN clues c ON c.scripture_ref = 'Acts 18'
WHERE m.slug = 'lost-scroll-jerusalem-corinth';

INSERT INTO mission_stops (mission_id, step_order, location_id, clue_id)
SELECT m.id, 4, l.id, c.id
FROM missions m
JOIN locations l ON l.slug = 'antioch-syria'
JOIN clues c ON c.scripture_ref = 'Acts 13:1'
WHERE m.slug = 'lost-scroll-jerusalem-corinth';

INSERT INTO clues (question, scripture_ref, clue_type, is_finale, time_limit_sec) VALUES
(
  'Jonah tried to flee toward Tarshish from this coastal port.',
  'Jonah 1:3',
  'scripture',
  0,
  NULL
);

INSERT INTO answer_options (clue_id, option_text, is_correct, sort_order)
(SELECT id, 'Joppa', 1, 0 FROM clues WHERE scripture_ref = 'Jonah 1:3' LIMIT 1)
UNION ALL
(SELECT id, 'Nineveh', 0, 1 FROM clues WHERE scripture_ref = 'Jonah 1:3' LIMIT 1)
UNION ALL
(SELECT id, 'Tyre', 0, 2 FROM clues WHERE scripture_ref = 'Jonah 1:3' LIMIT 1)
UNION ALL
(SELECT id, 'Caesarea', 0, 3 FROM clues WHERE scripture_ref = 'Jonah 1:3' LIMIT 1);

INSERT INTO missions (mode_id, slug, title, intro_text, difficulty)
SELECT id, 'prophet-joppa-intro',
  'Prophet Pursuit: The Fleeing Servant',
  'Truth has slipped toward the sea. Track the prophet''s hesitation from port to peril — swift answers honour the voyage.',
  'easy'
FROM game_modes WHERE slug = 'prophet_pursuit' LIMIT 1;

INSERT INTO mission_stops (mission_id, step_order, location_id, clue_id)
SELECT m.id, 0, l.id, c.id
FROM missions m
JOIN locations l ON l.slug = 'joppa'
JOIN clues c ON c.scripture_ref = 'Jonah 1:3'
WHERE m.slug = 'prophet-joppa-intro';

-- --- The Missing Messenger (Parable Paths) ---
INSERT INTO clues (question, scripture_ref, clue_type, is_finale, time_limit_sec) VALUES
(
  'A messenger carrying an important scroll was last seen near the town where Christ was born. Which town is it?',
  'Luke 2 / Micah 5:2',
  'scripture',
  0,
  NULL
);

INSERT INTO answer_options (clue_id, option_text, is_correct, sort_order)
(SELECT id, 'Bethlehem', 1, 0 FROM clues WHERE scripture_ref = 'Luke 2 / Micah 5:2' LIMIT 1)
UNION ALL
(SELECT id, 'Nazareth', 0, 1 FROM clues WHERE scripture_ref = 'Luke 2 / Micah 5:2' LIMIT 1)
UNION ALL
(SELECT id, 'Jericho', 0, 2 FROM clues WHERE scripture_ref = 'Luke 2 / Micah 5:2' LIMIT 1)
UNION ALL
(SELECT id, 'Samaria', 0, 3 FROM clues WHERE scripture_ref = 'Luke 2 / Micah 5:2' LIMIT 1);

INSERT INTO clues (question, scripture_ref, clue_type, is_finale, time_limit_sec) VALUES
(
  'The trail leads to the city where massive walls fell after Israel marched around them. Which city?',
  'Joshua 6',
  'scripture',
  0,
  NULL
);

INSERT INTO answer_options (clue_id, option_text, is_correct, sort_order)
(SELECT id, 'Jericho', 1, 0 FROM clues WHERE scripture_ref = 'Joshua 6' LIMIT 1)
UNION ALL
(SELECT id, 'Jerusalem', 0, 1 FROM clues WHERE scripture_ref = 'Joshua 6' LIMIT 1)
UNION ALL
(SELECT id, 'Babylon', 0, 2 FROM clues WHERE scripture_ref = 'Joshua 6' LIMIT 1)
UNION ALL
(SELECT id, 'Damascus', 0, 3 FROM clues WHERE scripture_ref = 'Joshua 6' LIMIT 1);

INSERT INTO clues (question, scripture_ref, clue_type, is_finale, time_limit_sec) VALUES
(
  'The messenger was spotted in the town where Christ grew up as a child.',
  'Luke 2:51-52',
  'scripture',
  0,
  NULL
);

INSERT INTO answer_options (clue_id, option_text, is_correct, sort_order)
(SELECT id, 'Nazareth', 1, 0 FROM clues WHERE scripture_ref = 'Luke 2:51-52' LIMIT 1)
UNION ALL
(SELECT id, 'Bethlehem', 0, 1 FROM clues WHERE scripture_ref = 'Luke 2:51-52' LIMIT 1)
UNION ALL
(SELECT id, 'Rome', 0, 2 FROM clues WHERE scripture_ref = 'Luke 2:51-52' LIMIT 1)
UNION ALL
(SELECT id, 'Corinth', 0, 3 FROM clues WHERE scripture_ref = 'Luke 2:51-52' LIMIT 1);

INSERT INTO clues (question, scripture_ref, clue_type, is_finale, time_limit_sec) VALUES
(
  'Fire once fell from heaven here when Elijah challenged the prophets of Baal.',
  '1 Kings 18',
  'scripture',
  0,
  NULL
);

INSERT INTO answer_options (clue_id, option_text, is_correct, sort_order)
(SELECT id, 'Mount Carmel', 1, 0 FROM clues WHERE scripture_ref = '1 Kings 18' LIMIT 1)
UNION ALL
(SELECT id, 'Mount Sinai', 0, 1 FROM clues WHERE scripture_ref = '1 Kings 18' LIMIT 1)
UNION ALL
(SELECT id, 'Jerusalem', 0, 2 FROM clues WHERE scripture_ref = '1 Kings 18' LIMIT 1)
UNION ALL
(SELECT id, 'Joppa', 0, 3 FROM clues WHERE scripture_ref = '1 Kings 18' LIMIT 1);

INSERT INTO clues (question, scripture_ref, clue_type, is_finale, time_limit_sec) VALUES
(
  'Final Pursuit: the messenger returned to the city where Christ was crucified and rose again. Name the city.',
  'Matthew 27-28',
  'scripture',
  1,
  45
);

INSERT INTO answer_options (clue_id, option_text, is_correct, sort_order)
(SELECT id, 'Jerusalem', 1, 0 FROM clues WHERE scripture_ref = 'Matthew 27-28' LIMIT 1)
UNION ALL
(SELECT id, 'Bethlehem', 0, 1 FROM clues WHERE scripture_ref = 'Matthew 27-28' LIMIT 1)
UNION ALL
(SELECT id, 'Antioch', 0, 2 FROM clues WHERE scripture_ref = 'Matthew 27-28' LIMIT 1)
UNION ALL
(SELECT id, 'Nineveh', 0, 3 FROM clues WHERE scripture_ref = 'Matthew 27-28' LIMIT 1);

INSERT INTO missions (mode_id, slug, title, intro_text, difficulty)
SELECT id, 'missing-messenger',
  'The Missing Messenger',
  'A witness reported a runner with a sealed scroll — then silence. The trail leads through the towns the Christ-child knew, an ancient wall that fell to shouts and trumpets, Carmel''s flame, and the city of the cross and empty tomb. Move fast; the parchment will not wait.',
  'medium'
FROM game_modes WHERE slug = 'parable_paths' LIMIT 1;

INSERT INTO mission_stops (mission_id, step_order, location_id, clue_id)
SELECT m.id, 0, l.id, c.id FROM missions m
JOIN locations l ON l.slug = 'bethlehem'
JOIN clues c ON c.scripture_ref = 'Luke 2 / Micah 5:2'
WHERE m.slug = 'missing-messenger';

INSERT INTO mission_stops (mission_id, step_order, location_id, clue_id)
SELECT m.id, 1, l.id, c.id FROM missions m
JOIN locations l ON l.slug = 'jericho'
JOIN clues c ON c.scripture_ref = 'Joshua 6'
WHERE m.slug = 'missing-messenger';

INSERT INTO mission_stops (mission_id, step_order, location_id, clue_id)
SELECT m.id, 2, l.id, c.id FROM missions m
JOIN locations l ON l.slug = 'nazareth'
JOIN clues c ON c.scripture_ref = 'Luke 2:51-52'
WHERE m.slug = 'missing-messenger';

INSERT INTO mission_stops (mission_id, step_order, location_id, clue_id)
SELECT m.id, 3, l.id, c.id FROM missions m
JOIN locations l ON l.slug = 'mount-carmel'
JOIN clues c ON c.scripture_ref = '1 Kings 18'
WHERE m.slug = 'missing-messenger';

INSERT INTO mission_stops (mission_id, step_order, location_id, clue_id)
SELECT m.id, 4, l.id, c.id FROM missions m
JOIN locations l ON l.slug = 'jerusalem'
JOIN clues c ON c.scripture_ref = 'Matthew 27-28'
WHERE m.slug = 'missing-messenger';

-- --- Jonah''s Escape Route (Prophet Pursuit) — distinct refs from Jonah 1:3 intro mission ---
INSERT INTO clues (question, scripture_ref, clue_type, is_finale, time_limit_sec) VALUES
(
  'Jonah boarded a ship here while trying to flee from Almighty God''s command.',
  'Jonah 1:3 · ship',
  'scripture',
  0,
  NULL
);

INSERT INTO answer_options (clue_id, option_text, is_correct, sort_order)
(SELECT id, 'Joppa', 1, 0 FROM clues WHERE scripture_ref = 'Jonah 1:3 · ship' LIMIT 1)
UNION ALL
(SELECT id, 'Nineveh', 0, 1 FROM clues WHERE scripture_ref = 'Jonah 1:3 · ship' LIMIT 1)
UNION ALL
(SELECT id, 'Egypt', 0, 2 FROM clues WHERE scripture_ref = 'Jonah 1:3 · ship' LIMIT 1)
UNION ALL
(SELECT id, 'Corinth', 0, 3 FROM clues WHERE scripture_ref = 'Jonah 1:3 · ship' LIMIT 1);

INSERT INTO clues (question, scripture_ref, clue_type, is_finale, time_limit_sec) VALUES
(
  'Almighty God sent Jonah to warn this great city to repent.',
  'Jonah 3',
  'scripture',
  0,
  NULL
);

INSERT INTO answer_options (clue_id, option_text, is_correct, sort_order)
(SELECT id, 'Nineveh', 1, 0 FROM clues WHERE scripture_ref = 'Jonah 3' LIMIT 1)
UNION ALL
(SELECT id, 'Babylon', 0, 1 FROM clues WHERE scripture_ref = 'Jonah 3' LIMIT 1)
UNION ALL
(SELECT id, 'Jerusalem', 0, 2 FROM clues WHERE scripture_ref = 'Jonah 3' LIMIT 1)
UNION ALL
(SELECT id, 'Athens', 0, 3 FROM clues WHERE scripture_ref = 'Jonah 3' LIMIT 1);

INSERT INTO clues (question, scripture_ref, clue_type, is_finale, time_limit_sec) VALUES
(
  'During the storm, Jonah was thrown into this body of water.',
  'Jonah 1:15',
  'scripture',
  0,
  NULL
);

INSERT INTO answer_options (clue_id, option_text, is_correct, sort_order)
(SELECT id, 'Mediterranean Sea', 1, 0 FROM clues WHERE scripture_ref = 'Jonah 1:15' LIMIT 1)
UNION ALL
(SELECT id, 'Red Sea', 0, 1 FROM clues WHERE scripture_ref = 'Jonah 1:15' LIMIT 1)
UNION ALL
(SELECT id, 'Jordan River', 0, 2 FROM clues WHERE scripture_ref = 'Jonah 1:15' LIMIT 1)
UNION ALL
(SELECT id, 'Dead Sea', 0, 3 FROM clues WHERE scripture_ref = 'Jonah 1:15' LIMIT 1);

INSERT INTO missions (mode_id, slug, title, intro_text, difficulty)
SELECT id, 'jonahs-escape-route',
  'Jonah''s Escape Route',
  'The trail leads from a coastal port toward a reluctant prophet''s reckoning — past a great city called to repentance, and into wind-lashed waves. Chase the route heaven refused to let him keep.',
  'easy'
FROM game_modes WHERE slug = 'prophet_pursuit' LIMIT 1;

INSERT INTO mission_stops (mission_id, step_order, location_id, clue_id)
SELECT m.id, 0, l.id, c.id FROM missions m
JOIN locations l ON l.slug = 'joppa'
JOIN clues c ON c.scripture_ref = 'Jonah 1:3 · ship'
WHERE m.slug = 'jonahs-escape-route';

INSERT INTO mission_stops (mission_id, step_order, location_id, clue_id)
SELECT m.id, 1, l.id, c.id FROM missions m
JOIN locations l ON l.slug = 'nineveh'
JOIN clues c ON c.scripture_ref = 'Jonah 3'
WHERE m.slug = 'jonahs-escape-route';

INSERT INTO mission_stops (mission_id, step_order, location_id, clue_id)
SELECT m.id, 2, l.id, c.id FROM missions m
JOIN locations l ON l.slug = 'mediterranean-sea'
JOIN clues c ON c.scripture_ref = 'Jonah 1:15'
WHERE m.slug = 'jonahs-escape-route';

-- --- Kingdom Chase (Kings & Kingdoms) ---
INSERT INTO clues (question, scripture_ref, clue_type, is_finale, time_limit_sec) VALUES
(
  'A young shepherd who became king was born in this town.',
  '1 Samuel 16',
  'scripture',
  0,
  NULL
);

INSERT INTO answer_options (clue_id, option_text, is_correct, sort_order)
(SELECT id, 'Bethlehem', 1, 0 FROM clues WHERE scripture_ref = '1 Samuel 16' LIMIT 1)
UNION ALL
(SELECT id, 'Jericho', 0, 1 FROM clues WHERE scripture_ref = '1 Samuel 16' LIMIT 1)
UNION ALL
(SELECT id, 'Rome', 0, 2 FROM clues WHERE scripture_ref = '1 Samuel 16' LIMIT 1)
UNION ALL
(SELECT id, 'Damascus', 0, 3 FROM clues WHERE scripture_ref = '1 Samuel 16' LIMIT 1);

INSERT INTO clues (question, scripture_ref, clue_type, is_finale, time_limit_sec) VALUES
(
  'King Solomon built the temple in this holy city.',
  '1 Kings 6',
  'scripture',
  0,
  NULL
);

INSERT INTO answer_options (clue_id, option_text, is_correct, sort_order)
(SELECT id, 'Jerusalem', 1, 0 FROM clues WHERE scripture_ref = '1 Kings 6' LIMIT 1)
UNION ALL
(SELECT id, 'Babylon', 0, 1 FROM clues WHERE scripture_ref = '1 Kings 6' LIMIT 1)
UNION ALL
(SELECT id, 'Antioch', 0, 2 FROM clues WHERE scripture_ref = '1 Kings 6' LIMIT 1)
UNION ALL
(SELECT id, 'Samaria', 0, 3 FROM clues WHERE scripture_ref = '1 Kings 6' LIMIT 1);

INSERT INTO clues (question, scripture_ref, clue_type, is_finale, time_limit_sec) VALUES
(
  'God''s people were taken captive into this kingdom after Jerusalem fell.',
  '2 Kings 25',
  'scripture',
  0,
  NULL
);

INSERT INTO answer_options (clue_id, option_text, is_correct, sort_order)
(SELECT id, 'Babylon', 1, 0 FROM clues WHERE scripture_ref = '2 Kings 25' LIMIT 1)
UNION ALL
(SELECT id, 'Egypt', 0, 1 FROM clues WHERE scripture_ref = '2 Kings 25' LIMIT 1)
UNION ALL
(SELECT id, 'Corinth', 0, 2 FROM clues WHERE scripture_ref = '2 Kings 25' LIMIT 1)
UNION ALL
(SELECT id, 'Ephesus', 0, 3 FROM clues WHERE scripture_ref = '2 Kings 25' LIMIT 1);

INSERT INTO missions (mode_id, slug, title, intro_text, difficulty)
SELECT id, 'kingdom-chase',
  'Kingdom Chase',
  'Follow the crown line from David''s fields to Zion''s golden temple — and onward to exile. The messenger''s footprints cut straight through Israel''s story.',
  'medium'
FROM game_modes WHERE slug = 'kings_kingdoms' LIMIT 1;

INSERT INTO mission_stops (mission_id, step_order, location_id, clue_id)
SELECT m.id, 0, l.id, c.id FROM missions m
JOIN locations l ON l.slug = 'bethlehem'
JOIN clues c ON c.scripture_ref = '1 Samuel 16'
WHERE m.slug = 'kingdom-chase';

INSERT INTO mission_stops (mission_id, step_order, location_id, clue_id)
SELECT m.id, 1, l.id, c.id FROM missions m
JOIN locations l ON l.slug = 'jerusalem'
JOIN clues c ON c.scripture_ref = '1 Kings 6'
WHERE m.slug = 'kingdom-chase';

INSERT INTO mission_stops (mission_id, step_order, location_id, clue_id)
SELECT m.id, 2, l.id, c.id FROM missions m
JOIN locations l ON l.slug = 'babylon'
JOIN clues c ON c.scripture_ref = '2 Kings 25'
WHERE m.slug = 'kingdom-chase';

-- --- Fast Lightning Round (Kings & Kingdoms) ---
INSERT INTO clues (question, scripture_ref, clue_type, is_finale, time_limit_sec) VALUES
(
  'Which sea did Moses part?',
  'Exodus 14',
  'scripture',
  0,
  NULL
);

INSERT INTO answer_options (clue_id, option_text, is_correct, sort_order)
(SELECT id, 'Red Sea', 1, 0 FROM clues WHERE scripture_ref = 'Exodus 14' LIMIT 1)
UNION ALL
(SELECT id, 'Dead Sea', 0, 1 FROM clues WHERE scripture_ref = 'Exodus 14' LIMIT 1)
UNION ALL
(SELECT id, 'Sea of Galilee', 0, 2 FROM clues WHERE scripture_ref = 'Exodus 14' LIMIT 1)
UNION ALL
(SELECT id, 'Mediterranean Sea', 0, 3 FROM clues WHERE scripture_ref = 'Exodus 14' LIMIT 1);

INSERT INTO clues (question, scripture_ref, clue_type, is_finale, time_limit_sec) VALUES
(
  'Who built the ark before the flood?',
  'Genesis 6-8',
  'scripture',
  0,
  NULL
);

INSERT INTO answer_options (clue_id, option_text, is_correct, sort_order)
(SELECT id, 'Noah', 1, 0 FROM clues WHERE scripture_ref = 'Genesis 6-8' LIMIT 1)
UNION ALL
(SELECT id, 'Moses', 0, 1 FROM clues WHERE scripture_ref = 'Genesis 6-8' LIMIT 1)
UNION ALL
(SELECT id, 'David', 0, 2 FROM clues WHERE scripture_ref = 'Genesis 6-8' LIMIT 1)
UNION ALL
(SELECT id, 'Peter', 0, 3 FROM clues WHERE scripture_ref = 'Genesis 6-8' LIMIT 1);

INSERT INTO clues (question, scripture_ref, clue_type, is_finale, time_limit_sec) VALUES
(
  'Which giant did David defeat?',
  '1 Samuel 17',
  'scripture',
  0,
  NULL
);

INSERT INTO answer_options (clue_id, option_text, is_correct, sort_order)
(SELECT id, 'Goliath', 1, 0 FROM clues WHERE scripture_ref = '1 Samuel 17' LIMIT 1)
UNION ALL
(SELECT id, 'Pharaoh', 0, 1 FROM clues WHERE scripture_ref = '1 Samuel 17' LIMIT 1)
UNION ALL
(SELECT id, 'Caesar', 0, 2 FROM clues WHERE scripture_ref = '1 Samuel 17' LIMIT 1)
UNION ALL
(SELECT id, 'Herod', 0, 3 FROM clues WHERE scripture_ref = '1 Samuel 17' LIMIT 1);

INSERT INTO clues (question, scripture_ref, clue_type, is_finale, time_limit_sec) VALUES
(
  'Paul was once known by what name?',
  'Acts 13:9',
  'scripture',
  0,
  NULL
);

INSERT INTO answer_options (clue_id, option_text, is_correct, sort_order)
(SELECT id, 'Saul', 1, 0 FROM clues WHERE scripture_ref = 'Acts 13:9' LIMIT 1)
UNION ALL
(SELECT id, 'Simon', 0, 1 FROM clues WHERE scripture_ref = 'Acts 13:9' LIMIT 1)
UNION ALL
(SELECT id, 'Titus', 0, 2 FROM clues WHERE scripture_ref = 'Acts 13:9' LIMIT 1)
UNION ALL
(SELECT id, 'Abram', 0, 3 FROM clues WHERE scripture_ref = 'Acts 13:9' LIMIT 1);

INSERT INTO clues (question, scripture_ref, clue_type, is_finale, time_limit_sec) VALUES
(
  'Which disciple walked on water toward Christ?',
  'Matthew 14',
  'scripture',
  0,
  NULL
);

INSERT INTO answer_options (clue_id, option_text, is_correct, sort_order)
(SELECT id, 'Peter', 1, 0 FROM clues WHERE scripture_ref = 'Matthew 14' LIMIT 1)
UNION ALL
(SELECT id, 'John', 0, 1 FROM clues WHERE scripture_ref = 'Matthew 14' LIMIT 1)
UNION ALL
(SELECT id, 'Matthew', 0, 2 FROM clues WHERE scripture_ref = 'Matthew 14' LIMIT 1)
UNION ALL
(SELECT id, 'Thomas', 0, 3 FROM clues WHERE scripture_ref = 'Matthew 14' LIMIT 1);

INSERT INTO missions (mode_id, slug, title, intro_text, difficulty)
SELECT id, 'lightning-fast-bonus',
  'Fast Lightning Round',
  'Quick draws for bold hearts — seas, giants, disciples, and the name Heaven almost changed. Strike true; momentum is mercy.',
  'easy'
FROM game_modes WHERE slug = 'kings_kingdoms' LIMIT 1;

INSERT INTO mission_stops (mission_id, step_order, location_id, clue_id)
SELECT m.id, 0, l.id, c.id FROM missions m
JOIN locations l ON l.slug = 'red-sea'
JOIN clues c ON c.scripture_ref = 'Exodus 14'
WHERE m.slug = 'lightning-fast-bonus';

INSERT INTO mission_stops (mission_id, step_order, location_id, clue_id)
SELECT m.id, 1, l.id, c.id FROM missions m
JOIN locations l ON l.slug = 'ararat-region'
JOIN clues c ON c.scripture_ref = 'Genesis 6-8'
WHERE m.slug = 'lightning-fast-bonus';

INSERT INTO mission_stops (mission_id, step_order, location_id, clue_id)
SELECT m.id, 2, l.id, c.id FROM missions m
JOIN locations l ON l.slug = 'elah-valley'
JOIN clues c ON c.scripture_ref = '1 Samuel 17'
WHERE m.slug = 'lightning-fast-bonus';

INSERT INTO mission_stops (mission_id, step_order, location_id, clue_id)
SELECT m.id, 3, l.id, c.id FROM missions m
JOIN locations l ON l.slug = 'damascus'
JOIN clues c ON c.scripture_ref = 'Acts 13:9'
WHERE m.slug = 'lightning-fast-bonus';

INSERT INTO mission_stops (mission_id, step_order, location_id, clue_id)
SELECT m.id, 4, l.id, c.id FROM missions m
JOIN locations l ON l.slug = 'sea-of-galilee'
JOIN clues c ON c.scripture_ref = 'Matthew 14'
WHERE m.slug = 'lightning-fast-bonus';

-- Upgrade existing DBs created before answer_options.location_id (safe to re-run)
SET @has_loc_col := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'answer_options'
    AND COLUMN_NAME = 'location_id'
);
SET @ddl := IF(
  @has_loc_col = 0,
  'ALTER TABLE answer_options ADD COLUMN location_id INT UNSIGNED DEFAULT NULL AFTER clue_id',
  'SELECT 1'
);
PREPARE upgrade_stmt FROM @ddl;
EXECUTE upgrade_stmt;
DEALLOCATE PREPARE upgrade_stmt;

-- Extra places used as multiple-choice distractors (map labels)
INSERT INTO locations (name, slug, latitude, longitude, region) VALUES
('Tarsus', 'tarsus', 36.917500, 34.892500, 'Cilicia'),
('Caesarea', 'caesarea', 32.500000, 34.890000, 'Coast'),
('Athens', 'athens', 37.983800, 23.727500, 'Greece'),
('Rome', 'rome', 41.902800, 12.496400, 'Italy'),
('Philippi', 'philippi', 41.011700, 24.287000, 'Macedonia'),
('Thessalonica', 'thessalonica', 40.640100, 22.944400, 'Greece'),
('Tyre', 'tyre', 33.270500, 35.203300, 'Phoenicia'),
('Samaria', 'samaria', 32.213300, 35.162200, 'Samaria'),
('Egypt', 'egypt', 30.044400, 31.235700, 'Egypt'),
('Jordan River', 'jordan-river', 31.839000, 35.545000, 'Jordan'),
('Dead Sea', 'dead-sea', 31.500000, 35.500000, 'Judah'),
('Mount Sinai', 'mount-sinai', 28.539200, 33.975000, 'Sinai');

-- Link each place answer to coordinates (people names stay unlinked — list-only)
UPDATE answer_options ao
INNER JOIN locations l ON l.name = ao.option_text
SET ao.location_id = l.id;

UPDATE answer_options ao
INNER JOIN locations l ON l.slug = 'antioch-syria'
SET ao.location_id = l.id
WHERE ao.option_text = 'Antioch';
