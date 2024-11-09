const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'sigma';

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Настройка базы данных
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'chess_puzzles',
  password: 'sigma',
  port: 5432,
});

// Настройка Nodemailer
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'ychessconfmail@gmail.com',
    pass: 'ychessconfmailnotsigma' 
  }
});

// Маршрут для регистрации с подтверждением по электронной почте
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });

    // Сохраняем пользователя с флагом подтверждения email_verified = false
    await pool.query(
      'INSERT INTO users (email, password_hash, email_verified) VALUES ($1, $2, $3)',
      [email, hashedPassword, false]
    );

    // Генерация ссылки подтверждения
    const verificationLink = `http://localhost:5000/verify?token=${verificationToken}`;

    // Отправка письма с подтверждением
    await transporter.sendMail({
      from: 'ychessconfmail@gmail.com',
      to: email,
      subject: 'Подтверждение регистрации',
      text: `Подтвердите ваш адрес электронной почты, перейдя по следующей ссылке: ${verificationLink}`,
    });

    res.status(201).json({ message: 'Пользователь зарегистрирован. Проверьте почту для подтверждения.' });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
});

// Маршрут для подтверждения по электронной почте
app.get('/verify', async (req, res) => {
  const { token } = req.query;
  try {
    const { email } = jwt.verify(token, SECRET_KEY);
    const result = await pool.query('UPDATE users SET email_verified = true WHERE email = $1 RETURNING *', [email]);

    if (result.rowCount === 0) {
      return res.status(400).json({ error: 'Не удалось подтвердить почту' });
    }

    res.json({ message: 'Почта подтверждена. Теперь вы можете войти.' });
  } catch (error) {
    console.error('Ошибка при подтверждении почты:', error);
    res.status(500).json({ error: 'Ошибка при подтверждении почты' });
  }
});

// Маршрут для входа с проверкой подтверждения почты
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (user && await bcrypt.compare(password, user.password_hash)) {
      if (!user.email_verified) {
        return res.status(401).json({ error: 'Пожалуйста, подтвердите почту перед входом' });
      }

      const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true }).json({ message: 'Успешный вход' });
    } else {
      res.status(401).json({ error: 'Неверные учетные данные' });
    }
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ error: 'Ошибка при входе' });
  }
});

// Маршрут для выхода
app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Успешный выход' });
});

// Пример защищенного маршрута
app.get('/cabinet', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Не авторизован' });

    const decoded = jwt.verify(token, SECRET_KEY);
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) return res.status(401).json({ message: 'Не авторизован' });

    res.json({ message: 'Добро пожаловать в личный кабинет' });
  } catch (error) {
    console.error('Ошибка проверки токена:', error);
    res.status(500).json({ error: 'Ошибка при доступе к личному кабинету' });
  }
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
