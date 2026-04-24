const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  password: 'l4b4reda0789', // ALTERE PARA SUA SENHA
  host: 'localhost',
  port: 5432,
  database: 'guns_clone'
});

// Testar conexão com o banco
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erro ao conectar no PostgreSQL:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectado ao PostgreSQL');
  release();
});

// Rota de registro
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
      [username, email, hashedPassword]
    );
    
    const userId = result.rows[0].id;
    
    await pool.query(
      `INSERT INTO user_profiles (user_id, profile_image, banner_image, banner_type, theme_color) 
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, 'https://cdn-icons-png.flaticon.com/512/219/219986.png', '', 'image', '#5865F2']
    );
    
    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota de login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id, username: user.username }, 'seu_secret_jwt_2024', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});