import axios from 'axios';

const api = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://localhost:4000',
  timeout: 10000,
});

const modality = 'DOUBLES';
const throwsPerPlayer = modality === 'TRIPLES' ? 2 : 3;

const createRes = await api.post('/matches', {
  modality,
  targetPoints: 13,
  teamAName: 'Azules',
  teamBName: 'Rojos',
  playersA: ['Ana', 'Ariel'],
  playersB: ['Bruno', 'Bianca'],
});

const matchId = createRes.data.id;
let match = createRes.data;

let scoreA = 0;
let scoreB = 0;
let handNumber = 1;

const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

while (scoreA < 13 && scoreB < 13 && handNumber <= 30) {
  for (const mp of match.players) {
    const nThrows = randomInt(1, throwsPerPlayer);
    for (let i = 0; i < nThrows; i += 1) {
      await api.post(`/matches/${matchId}/throws`, {
        handNumber,
        teamSide: mp.teamSide,
        playerId: mp.playerId,
        throwType: randomChoice(['POINT', 'TIR']),
        effectivenessScore: randomChoice([-2, -1, 0, 1, 2]),
        distanceD: Math.random() > 0.35 ? Number((Math.random() * 12).toFixed(2)) : undefined,
        note: Math.random() > 0.8 ? 'registro random' : undefined,
      });
    }
  }

  const winner = randomChoice(['A', 'B']);
  const remaining = winner === 'A' ? 13 - scoreA : 13 - scoreB;
  const points = Math.min(randomInt(1, 3), remaining);

  await api.post(`/matches/${matchId}/hands/close`, {
    pointsTeam: winner,
    pointsValue: points,
  });

  if (winner === 'A') scoreA += points;
  else scoreB += points;

  handNumber += 1;

  match = (await api.get(`/matches/${matchId}`)).data;
}

if (scoreA < 13 && scoreB < 13) {
  throw new Error('No se alcanzaron 13 puntos en el límite de manos.');
}

await api.post(`/matches/${matchId}/finish`, {
  endReason: 'TARGET_REACHED',
});

const finalMatch = (await api.get(`/matches/${matchId}`)).data;
const performance = (await api.get(`/matches/${matchId}/performance`)).data;

if (finalMatch.status !== 'FINISHED') {
  throw new Error('El partido no quedó en estado FINISHED.');
}

if (!Array.isArray(performance.players) || performance.players.length === 0) {
  throw new Error('El reporte de performance no contiene jugadores.');
}

const playersWithData = performance.players.filter((p) => p.total.n > 0);
if (playersWithData.length === 0) {
  throw new Error('Ningún jugador tiene datos de ejecuciones en el reporte.');
}

console.log('Simulación OK');
console.log(`Match: ${matchId}`);
console.log(`Resultado final: ${scoreA} - ${scoreB}`);
console.log(`Manos jugadas: ${handNumber - 1}`);
console.log(`Jugadores con datos en reporte: ${playersWithData.length}/${performance.players.length}`);
