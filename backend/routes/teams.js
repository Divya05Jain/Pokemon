const express = require('express');
const { supabase } = require('../supabase');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('get_teams_with_power');
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data: team, error: teamErr } = await supabase.from('team').select('*').eq('id', req.params.id).single();
    if (teamErr || !team) return res.status(404).json({ error: 'Team not found' });
    const { data: members, error: memErr } = await supabase
      .from('team_pokemon')
      .select('position, pokemon ( id, name, image, power, life, pokemon_type ( name ) )')
      .eq('team_id', req.params.id)
      .order('position');
    if (memErr) throw memErr;
    team.members = (members || []).sort((a, b) => a.position - b.position);
    team.power = (members || []).reduce((sum, m) => sum + (m.pokemon?.power || 0), 0);
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, pokemonIds } = req.body;
    if (!name || !Array.isArray(pokemonIds) || pokemonIds.length !== 6) {
      return res.status(400).json({ error: 'Team must have name and exactly 6 pokemon IDs' });
    }
    const { data, error } = await supabase.rpc('insert_team', {
      team_name: name,
      pokemon_ids: pokemonIds,
    });
    if (error) throw error;
    const { data: team } = await supabase.from('team').select('*').eq('id', data).single();
    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
