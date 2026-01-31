ALTER TABLE pokemon_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE pokemon ENABLE ROW LEVEL SECURITY;
ALTER TABLE weakness ENABLE ROW LEVEL SECURITY;
ALTER TABLE team ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_pokemon ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for pokemon_type" ON pokemon_type FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for pokemon" ON pokemon FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for weakness" ON weakness FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for team" ON team FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for team_pokemon" ON team_pokemon FOR ALL USING (true) WITH CHECK (true);
