const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pokemonRoutes = require('./routes/pokemon');
const teamRoutes = require('./routes/teams');
const battleRoutes = require('./routes/battle');
const typesRoutes = require('./routes/types');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const { supabase } = require('./supabase');
    const { error } = await supabase.from('pokemon_type').select('id').limit(1);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.use('/api/pokemon', pokemonRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/battle', battleRoutes);
app.use('/api/types', typesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
