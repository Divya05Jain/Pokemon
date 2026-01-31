const express = require('express');
const { supabase } = require('../supabase');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pokemon')
      .select('id, name, image, power, life, type')
      .order('name');
    if (error) throw error;

    const typeIds = [...new Set((data || []).map((p) => p.type).filter(Boolean))];
    const typeMap = {};
    if (typeIds.length > 0) {
      const { data: types, error: typesErr } = await supabase
        .from('pokemon_type')
        .select('id, name')
        .in('id', typeIds);
      if (!typesErr && types) types.forEach((t) => (typeMap[t.id] = t));
    }
    const result = (data || []).map((p) => ({
      ...p,
      pokemon_type: p.type ? typeMap[p.type] || null : null,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pokemon')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Not found' });
    if (data.type) {
      const { data: typeRow } = await supabase
        .from('pokemon_type')
        .select('id, name')
        .eq('id', data.type)
        .single();
      data.pokemon_type = typeRow || null;
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { name, type, image, power, life } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (type !== undefined) updates.type = type;
    if (image !== undefined) updates.image = image;
    if (power !== undefined) {
      const p = Number(power);
      if (p < 10 || p > 100) return res.status(400).json({ error: 'Power must be 10-100' });
      updates.power = p;
    }
    if (life !== undefined) {
      const l = Number(life);
      if (l < 50 || l > 100) return res.status(400).json({ error: 'Life must be 50-100' });
      updates.life = l;
    }
    const { data, error } = await supabase.from('pokemon').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
