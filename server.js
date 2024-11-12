const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'sigma';

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Настройка базы данных
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'chess_puzzles',
  password: 'sigma',
  port: 5432,
});


// Маршрут для случайной задачи
app.get('/api/random-puzzle', async (req, res) => {
  try {
    const countResult = await pool.query('SELECT COUNT(*) FROM puzzle_ids');
    const totalCount = parseInt(countResult.rows[0].count, 10);
    const randomIndex = Math.floor(Math.random() * totalCount);
    const idResult = await pool.query('SELECT id FROM puzzle_ids OFFSET $1 LIMIT 1', [randomIndex]);
    const puzzleId = idResult.rows[0].id;
    const puzzleResult = await pool.query('SELECT * FROM puzzles WHERE id = $1', [puzzleId]);
    const randomPuzzle = puzzleResult.rows[0];

    res.json(randomPuzzle);
  } catch (error) {
    console.error('Ошибка при получении задачи:', error);
    res.status(500).json({ error: 'Ошибка при получении задачи' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
