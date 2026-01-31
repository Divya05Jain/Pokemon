const express = require('express');
const { supabase } = require('../supabase');

const router = express.Router();

async function getFactor(attackerTypeId, defenderTypeId) {
  const { data } = await supabase
    .from('weakness')
    .select('factor')
    .eq('type1', attackerTypeId)
    .eq('type2', defenderTypeId)
    .single();
  return Number(data?.factor ?? 1);
}

router.post('/simulate', async (req, res) => {
  try {
    const { team1Id, team2Id } = req.body;
    if (!team1Id || !team2Id) return res.status(400).json({ error: 'team1Id and team2Id required' });

    const { data: t1Members } = await supabase
      .from('team_pokemon')
      .select('position, pokemon(*)')
      .eq('team_id', team1Id)
      .order('position');
    const { data: t2Members } = await supabase
      .from('team_pokemon')
      .select('position, pokemon(*)')
      .eq('team_id', team2Id)
      .order('position');

    if (!t1Members?.length || !t2Members?.length) {
      return res.status(400).json({ error: 'Both teams must have 6 pokemons' });
    }

    const team1 = t1Members.map((m) => ({ ...m.pokemon, position: m.position }));
    const team2 = t2Members.map((m) => ({ ...m.pokemon, position: m.position }));

    const rounds = [];
    let idx1 = 0;
    let idx2 = 0;
    let p1 = { ...team1[0], currentLife: team1[0].life };
    let p2 = { ...team2[0], currentLife: team2[0].life };

    const pushRound = (before, after, desc) => {
      rounds.push({
        description: desc,
        team1Pokemon: before.p1,
        team2Pokemon: before.p2,
        afterRound: { team1Pokemon: after.p1, team2Pokemon: after.p2 },
      });
    };

    while (idx1 < team1.length && idx2 < team2.length) {
      p1 = { ...(p1.id ? p1 : team1[idx1]), currentLife: p1.currentLife ?? team1[idx1].life };
      p2 = { ...(p2.id ? p2 : team2[idx2]), currentLife: p2.currentLife ?? team2[idx2].life };

      const factor1on2 = await getFactor(p1.type, p2.type);
      const factor2on1 = await getFactor(p2.type, p1.type);
      const damageToP2 = Math.floor(p1.power * factor1on2);
      const damageToP1 = Math.floor(p2.power * factor2on1);

      const life1Before = p1.currentLife;
      const life2Before = p2.currentLife;
      p1.currentLife = Math.max(0, p1.currentLife - damageToP1);
      p2.currentLife = Math.max(0, p2.currentLife - damageToP2);

      pushRound(
        {
          p1: { id: p1.id, name: p1.name, life: life1Before, power: p1.power },
          p2: { id: p2.id, name: p2.name, life: life2Before, power: p2.power },
        },
        {
          p1: { id: p1.id, name: p1.name, life: p1.currentLife, power: p1.power },
          p2: { id: p2.id, name: p2.name, life: p2.currentLife, power: p2.power },
        },
        `Round: ${p1.name} vs ${p2.name}. Damage: ${damageToP1} to ${p1.name}, ${damageToP2} to ${p2.name}.`
      );

      if (p1.currentLife <= 0 && p2.currentLife <= 0) {
        idx1++;
        idx2++;
        p1 = team1[idx1];
        p2 = team2[idx2];
      } else if (p1.currentLife <= 0) {
        idx1++;
        p1 = team1[idx1];
        if (p1) p1 = { ...p1, currentLife: p1.life };
      } else if (p2.currentLife <= 0) {
        idx2++;
        p2 = team2[idx2];
        if (p2) p2 = { ...p2, currentLife: p2.life };
      }
    }

    const winner = idx2 >= team2.length ? 'team1' : idx1 >= team1.length ? 'team2' : null;
    res.json({
      winner,
      rounds,
      team1Remaining: Math.max(0, team1.length - idx1),
      team2Remaining: Math.max(0, team2.length - idx2),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
