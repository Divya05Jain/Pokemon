CREATE TABLE IF NOT EXISTS pokemon_type (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS pokemon (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type UUID NOT NULL REFERENCES pokemon_type(id) ON DELETE RESTRICT,
  image TEXT,
  power INTEGER NOT NULL CHECK (power >= 10 AND power <= 100),
  life INTEGER NOT NULL CHECK (life >= 50 AND life <= 100)
);

CREATE TABLE IF NOT EXISTS weakness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type1 UUID NOT NULL REFERENCES pokemon_type(id) ON DELETE CASCADE,
  type2 UUID NOT NULL REFERENCES pokemon_type(id) ON DELETE CASCADE,
  factor DECIMAL(4,2) NOT NULL,
  UNIQUE(type1, type2)
);

CREATE TABLE IF NOT EXISTS team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_pokemon (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
  pokemon_id UUID NOT NULL REFERENCES pokemon(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position >= 1 AND position <= 6),
  UNIQUE(team_id, position)
);

CREATE INDEX idx_team_pokemon_team ON team_pokemon(team_id);
CREATE INDEX idx_pokemon_type ON pokemon(type);
CREATE INDEX idx_weakness_types ON weakness(type1, type2);
