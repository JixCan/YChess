const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

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

const JWT_SECRET = 'sHSGUDSKDHWu7267*D'

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

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const userResult = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, rating',
      [username, hashedPassword]
    );

    const user = userResult.rows[0];
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);

    res.json({ token, user });
  } catch (err) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

// Вход пользователя
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = userResult.rows[0];

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, rating: user.rating } });
  } else {
    res.status(400).json({ error: 'Invalid username or password' });
  }
});

// Обновление рейтинга
app.post('/api/update-rating', async (req, res) => {
  const { userId, newRating } = req.body;

  try {
    await pool.query('UPDATE users SET rating = $1 WHERE id = $2', [newRating, userId]);
    await pool.query('INSERT INTO ratings (user_id, rating) VALUES ($1, $2)', [userId, newRating]);

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to update rating' });
  }
});

// Эндпоинт для получения истории рейтинга пользователя
app.get('/api/user-ratings/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      'SELECT rating, timestamp FROM ratings WHERE user_id = $1 ORDER BY timestamp ASC',
      [userId]
    );

    res.json(result.rows); // Отправляем данные рейтингов в формате JSON
  } catch (err) {
    console.error('Ошибка при получении рейтингов:', err);
    res.status(500).json({ error: 'Ошибка при получении рейтингов' });
  }
});

// Получение текущего рейтинга пользователя
app.get('/api/user-rating/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query('SELECT rating FROM users WHERE id = $1', [userId]);
    if (result.rows.length > 0) {
      res.json({ rating: result.rows[0].rating });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve user rating' });
  }
});

app.get('/api/chesscom/puzzles/:username', async (req, res) => {
  const { username } = req.params;
  const url = `https://www.chess.com/callback/member/stats/${username}`;

  try {
      const response = await fetch(url);
      if (!response.ok) {
          return res.status(404).json({ error: 'User not found or request failed' });
      }

      const data = await response.json();
      const tacticsData = data.stats.find((stat) => stat.key === 'tactics');

      if (!tacticsData) {
          return res.status(404).json({ error: 'No puzzle data found for this user' });
      }

      const puzzleStats = {
          games: tacticsData.gameCount || 0,
          rating: tacticsData.stats.rating || 0,
      };

      res.json(puzzleStats);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});


// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
