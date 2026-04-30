const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { Pool } = require('pg');
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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET || 'seu_secret_jwt_2024';

const allowedFileTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/webm',
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
      cb(
        new Error(
          'Invalid file type. Allowed: JPG, PNG, WEBP, GIF, MP4, WEBM, MP3, WAV, OGG.'
        )
      );
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
      `INSERT INTO user_profiles (
        user_id,
        profile_image,
        banner_image,
        banner_type,
        theme_color,
        bio,
        profile_badges
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        'https://cdn-icons-png.flaticon.com/512/219/219986.png',
        '',
        'image',
        '#5865F2',
        '',
        '[]',
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
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
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
      "SELECT username, COALESCE(plan, 'free') AS plan, COALESCE(role, 'user') AS role FROM users WHERE id = $1",
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
      plan: userResult.rows[0]?.plan || 'free',
      role: userResult.rows[0]?.role || 'user',
      ...profileResult.rows[0],
      socialMedia,
    });
  } catch (error) {
    console.error('Profile me error:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/profile/badges', authenticateToken, async (req, res) => {
  const { badges } = req.body;

  const freeBadges = ['gamer', 'music', 'anime', 'open-dm', 'artist', 'developer'];
  const proBadges = ['premium', 'supporter', 'vip'];
  const staffBadges = ['dev', 'staff', 'verified', 'founder', 'official'];

  try {
    const userResult = await pool.query(
      "SELECT COALESCE(plan, 'free') AS plan, COALESCE(role, 'user') AS role FROM users WHERE id = $1",
      [req.userId]
    );

    const plan = userResult.rows[0]?.plan || 'free';
    const role = userResult.rows[0]?.role || 'user';

    let allowedBadges = [...freeBadges];

    if (plan === 'pro') {
      allowedBadges = [...allowedBadges, ...proBadges];
    }

    if (['dev', 'staff', 'founder', 'admin'].includes(role)) {
      allowedBadges = [...allowedBadges, ...proBadges, ...staffBadges];
    }

    const uniqueBadges = Array.isArray(badges)
      ? [...new Set(badges.map((badge) => String(badge).trim().toLowerCase()))]
      : [];

    if (uniqueBadges.length > 3) {
      return res.status(400).json({
        error: 'You can select a maximum of 3 badges.',
      });
    }

    const invalidBadges = uniqueBadges.filter(
      (badge) => !allowedBadges.includes(badge)
    );

    if (invalidBadges.length > 0) {
      return res.status(403).json({
        error: 'You cannot use one or more selected badges.',
      });
    }

    await pool.query(
      'UPDATE user_profiles SET profile_badges = $1::jsonb WHERE user_id = $2',
      [JSON.stringify(uniqueBadges), req.userId]
    );

    return res.json({
      message: 'Badges updated successfully!',
      badges: uniqueBadges,
    });
  } catch (error) {
    console.error('Badge update error:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/profile/:username/guestbook', async (req, res) => {
  const { username } = req.params;

  try {
    const userResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const userId = userResult.rows[0].id;

    const guestbookResult = await pool.query(
      `SELECT id, visitor_name, message, created_at
       FROM guestbook_entries
       WHERE profile_user_id = $1
       ORDER BY created_at DESC
       LIMIT 30`,
      [userId]
    );

    return res.json(guestbookResult.rows);
  } catch (error) {
    console.error('Guestbook fetch error:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/profile/:username/guestbook', async (req, res) => {
  const { username } = req.params;
  const { visitorName, message } = req.body;

  const cleanVisitorName = (visitorName || '').trim().slice(0, 32);
  const cleanMessage = (message || '').trim().slice(0, 180);

  if (!cleanVisitorName || !cleanMessage) {
    return res.status(400).json({
      error: 'Visitor name and message are required.',
    });
  }

  try {
    const userResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const profileUserId = userResult.rows[0].id;

    const insertResult = await pool.query(
      `INSERT INTO guestbook_entries (profile_user_id, visitor_name, message)
       VALUES ($1, $2, $3)
       RETURNING id, visitor_name, message, created_at`,
      [profileUserId, cleanVisitorName, cleanMessage]
    );

    return res.status(201).json({
      message: 'Guestbook entry created successfully!',
      entry: insertResult.rows[0],
    });
  } catch (error) {
    console.error('Guestbook create error:', error);
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

app.put('/api/profile/username', authenticateToken, async (req, res) => {
  const { username } = req.body;

  const cleanUsername = String(username || '')
    .trim()
    .toLowerCase();

  const usernameRegex = /^[a-z0-9._-]{3,20}$/;

  if (!usernameRegex.test(cleanUsername)) {
    return res.status(400).json({
      error:
        'Username must be 3-20 characters and can only contain letters, numbers, dots, underscores, and hyphens.',
    });
  }

  try {
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND id != $2',
      [cleanUsername, req.userId]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'Username is already taken.',
      });
    }

    await pool.query('UPDATE users SET username = $1 WHERE id = $2', [
      cleanUsername,
      req.userId,
    ]);

    const token = jwt.sign(
      {
        userId: req.userId,
        username: cleanUsername,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Username updated successfully!',
      username: cleanUsername,
      token,
    });
  } catch (error) {
    console.error('Username update error:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/profile/appearance', authenticateToken, async (req, res) => {
  const { profileTemplate, profileEffect } = req.body;

  const allowedTemplates = [
    'neon-purple',
    'cyber-glass',
    'minimal-dark',
    'red-glow',
    'blue-ice',
  ];

  const allowedEffects = ['none', 'stars', 'snow', 'sparkles', 'hearts'];

  if (!allowedTemplates.includes(profileTemplate)) {
    return res.status(400).json({ error: 'Invalid profile template.' });
  }

  if (!allowedEffects.includes(profileEffect)) {
    return res.status(400).json({ error: 'Invalid profile effect.' });
  }

  try {
    await pool.query(
      'UPDATE user_profiles SET profile_template = $1, profile_effect = $2 WHERE user_id = $3',
      [profileTemplate, profileEffect, req.userId]
    );

    return res.json({ message: 'Appearance updated successfully!' });
  } catch (error) {
    console.error('Appearance update error:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/profile/display-name', authenticateToken, async (req, res) => {
  const { displayName } = req.body;

  try {
    await pool.query(
      'UPDATE user_profiles SET display_name = $1 WHERE user_id = $2',
      [displayName || '', req.userId]
    );

    return res.json({ message: 'Display name updated successfully!' });
  } catch (error) {
    console.error('Display name update error:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/profile/music', authenticateToken, async (req, res) => {
  const { musicUrl, musicTitle } = req.body;

  try {
    await pool.query(
      'UPDATE user_profiles SET music_url = $1, music_title = $2 WHERE user_id = $3',
      [musicUrl || '', musicTitle || '', req.userId]
    );

    return res.json({ message: 'Music updated successfully!' });
  } catch (error) {
    console.error('Music update error:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/profile/details', authenticateToken, async (req, res) => {
  const { location, statusText } = req.body;

  try {
    await pool.query(
      'UPDATE user_profiles SET location = $1, status_text = $2 WHERE user_id = $3',
      [location || '', statusText || '', req.userId]
    );

    return res.json({ message: 'Profile details updated successfully!' });
  } catch (error) {
    console.error('Profile details update error:', error);
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