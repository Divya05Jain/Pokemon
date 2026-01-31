INSERT INTO weakness (type1, type2, factor) VALUES
  ((SELECT id FROM pokemon_type WHERE name = 'fire'), (SELECT id FROM pokemon_type WHERE name = 'fire'), 1),
  ((SELECT id FROM pokemon_type WHERE name = 'fire'), (SELECT id FROM pokemon_type WHERE name = 'water'), 0.5),
  ((SELECT id FROM pokemon_type WHERE name = 'fire'), (SELECT id FROM pokemon_type WHERE name = 'grass'), 2),
  ((SELECT id FROM pokemon_type WHERE name = 'water'), (SELECT id FROM pokemon_type WHERE name = 'fire'), 2),
  ((SELECT id FROM pokemon_type WHERE name = 'water'), (SELECT id FROM pokemon_type WHERE name = 'water'), 1),
  ((SELECT id FROM pokemon_type WHERE name = 'water'), (SELECT id FROM pokemon_type WHERE name = 'grass'), 0.5),
  ((SELECT id FROM pokemon_type WHERE name = 'grass'), (SELECT id FROM pokemon_type WHERE name = 'fire'), 0.5),
  ((SELECT id FROM pokemon_type WHERE name = 'grass'), (SELECT id FROM pokemon_type WHERE name = 'water'), 2),
  ((SELECT id FROM pokemon_type WHERE name = 'grass'), (SELECT id FROM pokemon_type WHERE name = 'grass'), 1)
ON CONFLICT (type1, type2) DO NOTHING;
