const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET || 'seu_secret_jwt_2024';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const allowedFileTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: JPG, PNG, WEBP, GIF, MP4, WEBM.'));
    }
  },
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.userId = decoded.userId;
    next();
  });
}

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
      `INSERT INTO user_profiles (user_id, profile_image, banner_image, banner_type, theme_color, bio)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        'https://cdn-icons-png.flaticon.com/512/219/219986.png',
        '',
        'image',
        '#5865F2',
        '',
      ]
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

    return res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(400).json({ error: error.message });
  }
});

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-checkout-session', async (req, res) => {
  const { plan } = req.body;

  const prices = {
    pro: process.env.STRIPE_PRICE_PRO_ID,
  };

  const priceId = prices[plan];

  if (!priceId) {
    return res.status(400).json({
      error: 'Invalid plan.',
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
    });

    return res.json({
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);

    return res.status(500).json({
      error: error.message || 'Failed to create checkout session.',
    });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/*
  IMPORTANT:
  This route must come before /api/profile/:username.
  Otherwise Express treats "me" as a public username.
*/
app.get('/api/profile/me', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT username FROM users WHERE id = $1',
      [req.userId]
    );

    const profileResult = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [req.userId]
    );

    const linksResult = await pool.query(
      'SELECT platform, url FROM user_links WHERE user_id = $1 ORDER BY display_order',
      [req.userId]
    );

    const socialMedia = {};

    linksResult.rows.forEach((link) => {
      socialMedia[link.platform] = link.url;
    });

    return res.json({
      username: userResult.rows[0]?.username || '',
      ...profileResult.rows[0],
      socialMedia,
    });
  } catch (error) {
    console.error('Profile me error:', error);
    return res.status(500).json({ error: error.message });
  }
});

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

    linksResult.rows.forEach((link) => {
      socialMedia[link.platform] = link.url;
    });

    return res.json({
      username: user.username,
      profile: profileResult.rows[0],
      socialMedia,
      stats: statsResult.rows[0],
    });
  } catch (error) {
    console.error('Public profile error:', error);
    return res.status(500).json({ error: error.message });
  }
});

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
      END
      WHERE user_id = $8
      AND platform IN ('instagram', 'x', 'youtube', 'twitch', 'kick', 'discord', 'linkedin')`,
      [
        instagram || '',
        x || '',
        youtube || '',
        twitch || '',
        kick || '',
        discord || '',
        linkedIn || '',
        req.userId,
      ]
    );

    return res.json({ message: 'Social media saved successfully!' });
  } catch (error) {
    console.error('Social media save error:', error);
    return res.status(500).json({ error: error.message });
  }
});

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

    return res.json({ message: 'Profile images saved successfully!' });
  } catch (error) {
    console.error('Profile images save error:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/profile/bio', authenticateToken, async (req, res) => {
  const { bio } = req.body;

  try {
    await pool.query('UPDATE user_profiles SET bio = $1 WHERE user_id = $2', [
      bio || '',
      req.userId,
    ]);

    return res.json({ message: 'Bio updated successfully!' });
  } catch (error) {
    console.error('Bio update error:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/profile/appearance', authenticateToken, async (req, res) => {
  const { profileTemplate } = req.body;

  const allowedTemplates = [
    'neon-purple',
    'cyber-glass',
    'minimal-dark',
    'red-glow',
    'blue-ice',
  ];

  if (!allowedTemplates.includes(profileTemplate)) {
    return res.status(400).json({ error: 'Invalid profile template.' });
  }

  try {
    await pool.query(
      'UPDATE user_profiles SET profile_template = $1 WHERE user_id = $2',
      [profileTemplate, req.userId]
    );

    return res.json({ message: 'Appearance updated successfully!' });
  } catch (error) {
    console.error('Appearance update error:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'arcxnjo/profile-media',
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await uploadToCloudinary();

    return res.json({
      url: result.secure_url,
      mimetype: req.file.mimetype,
      publicId: result.public_id,
      resourceType: result.resource_type,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);

    return res.status(500).json({
      error: error.message || 'Upload failed.',
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});