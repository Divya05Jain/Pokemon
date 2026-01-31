CREATE OR REPLACE FUNCTION insert_team(team_name TEXT, pokemon_ids UUID[])
RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE new_team_id UUID; i INT;
BEGIN
  IF array_length(pokemon_ids, 1) != 6 THEN RAISE EXCEPTION 'Team must have exactly 6 pokemons'; END IF;
  INSERT INTO team (name) VALUES (team_name) RETURNING id INTO new_team_id;
  FOR i IN 1..6 LOOP
    INSERT INTO team_pokemon (team_id, pokemon_id, position) VALUES (new_team_id, pokemon_ids[i], i);
  END LOOP;
  RETURN new_team_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_teams_with_power()
RETURNS TABLE (team_id UUID, team_name TEXT, team_power BIGINT, created_at TIMESTAMPTZ)
LANGUAGE sql STABLE AS $$
  SELECT t.id AS team_id, t.name AS team_name, COALESCE(SUM(p.power), 0)::BIGINT AS team_power, t.created_at
  FROM team t
  LEFT JOIN team_pokemon tp ON tp.team_id = t.id
  LEFT JOIN pokemon p ON p.id = tp.pokemon_id
  GROUP BY t.id, t.name, t.created_at
  ORDER BY team_power DESC;
$$;
