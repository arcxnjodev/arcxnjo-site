const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');
const fs = require('fs');

const app = express();
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuração do banco de dados
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:L4b4reda0789@@ep-cool-forest-123456.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

// Configuração de upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Middleware de autenticação
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }
  
  jwt.verify(token, 'seu_secret_jwt_2024', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.userId = decoded.userId;
    next();
  });
}

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
    
    await pool.query(
      `INSERT INTO user_links (user_id, platform, url, display_order) VALUES 
       ($1, 'instagram', '', 1),
       ($1, 'x', '', 2),
       ($1, 'youtube', '', 3),
       ($1, 'twitch', '', 4),
       ($1, 'kick', '', 5),
       ($1, 'discord', '', 6),
       ($1, 'linkedin', '', 7)`,
      [userId]
    );
    
    await pool.query(
      'INSERT INTO user_stats (user_id, profile_views) VALUES ($1, 0)',
      [userId]
    );
    
    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota de login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      'seu_secret_jwt_2024',
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email 
      } 
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para buscar perfil público
app.get('/api/profile/:username', async (req, res) => {
  const { username } = req.params;
  
  try {
    const userResult = await pool.query(
      'SELECT id, username FROM users WHERE username = $1',
      [username]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    const profileResult = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [user.id]
    );
    
    const linksResult = await pool.query(
      'SELECT platform, url FROM user_links WHERE user_id = $1 AND url != $2 ORDER BY display_order',
      [user.id, '']
    );
    
    const statsResult = await pool.query(
      'SELECT profile_views FROM user_stats WHERE user_id = $1',
      [user.id]
    );
    
    await pool.query(
      'UPDATE user_stats SET profile_views = profile_views + 1 WHERE user_id = $1',
      [user.id]
    );
    
    const socialMedia = {};
    linksResult.rows.forEach(link => {
      socialMedia[link.platform] = link.url;
    });
    
    res.json({
      username: user.username,
      profile: profileResult.rows[0],
      socialMedia,
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para buscar perfil do usuário logado
app.get('/api/profile/me', authenticateToken, async (req, res) => {
  try {
    const profileResult = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [req.userId]
    );
    
    const linksResult = await pool.query(
      'SELECT platform, url FROM user_links WHERE user_id = $1 ORDER BY display_order',
      [req.userId]
    );
    
    const socialMedia = {};
    linksResult.rows.forEach(link => {
      socialMedia[link.platform] = link.url;
    });
    
    res.json({
      ...profileResult.rows[0],
      socialMedia
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para salvar redes sociais
app.put('/api/profile/social-media', authenticateToken, async (req, res) => {
  const { instagram, x, youtube, twitch, kick, discord, linkedIn } = req.body;
  
  try {
    await pool.query(
      `UPDATE user_links SET url = CASE platform
        WHEN 'instagram' THEN $1
        WHEN 'x' THEN $2
        WHEN 'youtube' THEN $3
        WHEN 'twitch' THEN $4
        WHEN 'kick' THEN $5
        WHEN 'discord' THEN $6
        WHEN 'linkedin' THEN $7
      END WHERE user_id = $8 AND platform IN ('instagram', 'x', 'youtube', 'twitch', 'kick', 'discord', 'linkedin')`,
      [instagram || '', x || '', youtube || '', twitch || '', kick || '', discord || '', linkedIn || '', req.userId]
    );
    
    res.json({ message: 'Social media saved successfully!' });
  } catch (error) {
    console.error('Erro ao salvar social media:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para salvar imagens do perfil
app.put('/api/profile/images', authenticateToken, async (req, res) => {
  const { profileImage, bannerImage, bannerVideo, bannerType } = req.body;
  
  try {
    await pool.query(
      `UPDATE user_profiles SET 
        profile_image = COALESCE($1, profile_image),
        banner_image = COALESCE($2, banner_image),
        banner_video = COALESCE($3, banner_video),
        banner_type = COALESCE($4, banner_type)
      WHERE user_id = $5`,
      [profileImage, bannerImage, bannerVideo, bannerType, req.userId]
    );
    
    res.json({ message: 'Profile images saved successfully!' });
  } catch (error) {
    console.error('Erro ao salvar imagens:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para upload de arquivos
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  const fileUrl = `http://localhost:3001/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Iniciar servidor
app.listen(3001, () => {
  console.log('🚀 Server running on port 3001');
});