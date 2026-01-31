INSERT INTO pokemon_type (name) VALUES ('fire'), ('water'), ('grass')
ON CONFLICT (name) DO NOTHING;
