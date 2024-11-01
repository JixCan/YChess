const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 5000;

app.use(cors({
  origin: 'http://localhost:3000',  // Укажите точный адрес фронтенда
  credentials: true                 // Позволяет отправлять куки
}));

app.use(express.json());
app.use(cookieParser());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'chess_puzzles',
  password: 'sigma',
  port: 5432,
});

const SECRET_KEY = 'sigma';
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'ychessconfmail@gmail.com',
    pass: 'ychessconfmailnotsigma'
  }
});

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
  const { username, mail, password } = req.body;
  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE mail = $1', [mail]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Почта уже зарегистрирована' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ mail }, SECRET_KEY, { expiresIn: '1d' });

    await pool.query(
      'INSERT INTO users (username, mail, password, token) VALUES ($1, $2, $3, $4)',
      [username, mail, hashedPassword, token]
    );

    const confirmationLink = `http://localhost:${PORT}/api/confirm-email?token=${token}`;
    await transporter.sendMail({
      to: mail,
      subject: 'Подтверждение почты',
      text: `Нажмите на ссылку для подтверждения почты: ${confirmationLink}`,
    });

    res.json({ message: 'Пользователь зарегистрирован. Проверьте почту для подтверждения.' });
  } catch (error) {
    console.error('Ошибка регистрации:', error.stack);  // Вывод полной информации об ошибке
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});


// Подтверждение почты
app.get('/api/confirm-email', async (req, res) => {
  const { token } = req.query;
  try {
    const { mail } = jwt.verify(token, SECRET_KEY);
    await pool.query('UPDATE users SET is_confirmed = TRUE WHERE mail = $1', [mail]);
    res.json({ message: 'Почта подтверждена' });
  } catch (error) {
    console.error('Ошибка подтверждения почты:', error);
    res.status(500).json({ error: 'Ошибка подтверждения почты' });
  }
});

// Вход пользователя
app.post('/api/login', async (req, res) => {
  const { mail, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE mail = $1', [mail]);
    const user = userResult.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Неверные почта или пароль' });
    }
    if (!user.is_confirmed) {
      return res.status(400).json({ error: 'Подтвердите почту для входа' });
    }

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.json({ message: 'Вход выполнен успешно' });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка входа' });
  }
});

// Обновление профиля
app.put('/api/profile', async (req, res) => {
  const { username, lichess_username, chesscom_username } = req.body;
  const token = req.cookies.token;

  try {
    const { id } = jwt.verify(token, SECRET_KEY);
    await pool.query(
      'UPDATE users SET username = $1, lichess_username = $2, chesscom_username = $3 WHERE id = $4',
      [username, lichess_username, chesscom_username, id]
    );
    res.json({ message: 'Профиль обновлен' });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ error: 'Ошибка обновления профиля' });
  }
});

// Выход
app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Выход выполнен' });
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

// Маршрут для получения информации о пользователе по ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        const user = userResult.rows[0];
      
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
      
        res.json(user);
    } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        res.status(500).json({ error: 'Ошибка при получении данных пользователя' });
    }
});

// Маршрут для получения рейтингов Chess.com пользователя по user_id
app.get('/api/chesscom-ratings/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const chesscomRatingsResult = await pool.query(
            'SELECT * FROM chesscom_ratings WHERE user_id = $1 ORDER BY timestamp DESC',
            [userId]
        );
      
        res.json(chesscomRatingsResult.rows);
    } catch (error) {
        console.error('Ошибка при получении рейтингов Chess.com:', error);
        res.status(500).json({ error: 'Ошибка при получении рейтингов Chess.com' });
    }
});

// Маршрут для получения рейтингов Lichess пользователя по user_id
app.get('/api/lichess-ratings/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const lichessRatingsResult = await pool.query(
            'SELECT * FROM lichess_ratings WHERE user_id = $1 ORDER BY timestamp DESC',
            [userId]
        );
      
        res.json(lichessRatingsResult.rows);
    } catch (error) {
        console.error('Ошибка при получении рейтингов Lichess:', error);
        res.status(500).json({ error: 'Ошибка при получении рейтингов Lichess' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
