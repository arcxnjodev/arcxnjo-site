const axios = require('axios');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { Pool } = require('pg');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

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

app.use(express.json({ limit: '1mb' }));

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

const MB = 1024 * 1024;
const FREE_UPLOAD_LIMIT_MB = 25;
const PRO_VIDEO_UPLOAD_LIMIT_MB = 50;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: PRO_VIDEO_UPLOAD_LIMIT_MB * MB,
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

async function requireAdmin(req, res, next) {
  try {
    const userResult = await pool.query(
      "SELECT id, email, COALESCE(role, 'user') AS role FROM users WHERE id = $1 LIMIT 1",
      [req.userId]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const ownerBypassEmail = (process.env.OWNER_BYPASS_EMAIL || '')
      .trim()
      .toLowerCase();

    const email = String(user.email || '').trim().toLowerCase();
    const role = String(user.role || 'user').trim().toLowerCase();

    const isAllowed =
      ['admin', 'owner', 'staff'].includes(role) ||
      (ownerBypassEmail && email === ownerBypassEmail);

    if (!isAllowed) {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    req.adminUser = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error.message);
    return res.status(500).json({ error: 'Failed to verify admin access.' });
  }
}

function cleanCommunityTemplatePayload(body = {}) {
  const name = String(body.name || '').trim().slice(0, 80);
  const description = String(body.description || '').trim().slice(0, 500);
  const previewImage = String(body.previewImage || body.preview_image || '')
    .trim()
    .slice(0, 500);
  const htmlCode = String(body.htmlCode || body.html_code || '').trim();
  const cssCode = String(body.cssCode || body.css_code || '').trim();
  const jsCode = String(body.jsCode || body.js_code || '').trim();

  return {
    name,
    description,
    previewImage,
    htmlCode: htmlCode.slice(0, 120000),
    cssCode: cssCode.slice(0, 120000),
    jsCode: jsCode.slice(0, 120000),
  };
}

/* =========================================================
   DISCORD HELPERS
========================================================= */

const discordPresenceCache = new Map();
const discordUserCache = new Map();

function normalizeDiscordUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    global_name: user.globalName || user.global_name || user.username,
    avatar: user.avatar || null,
  };
}

function normalizeActivity(activity) {
  if (!activity) return null;

  return {
    name: activity.name || '',
    type: activity.type,
    details: activity.details || null,
    state: activity.state || null,
    created_at: activity.createdTimestamp || null,
  };
}

function normalizeSpotify(activity) {
  if (!activity) return null;

  let albumArtUrl = null;

  try {
    if (activity.assets && typeof activity.assets.largeImageURL === 'function') {
      albumArtUrl = activity.assets.largeImageURL({ size: 128 });
    }
  } catch {
    albumArtUrl = null;
  }

  return {
    song: activity.details || '',
    artist: activity.state || '',
    album: activity.assets?.largeText || '',
    album_art_url: albumArtUrl,
  };
}

function savePresence(presence) {
  if (!presence?.userId) return;

  const user = presence.user || presence.member?.user;

  if (user) {
    discordUserCache.set(presence.userId, normalizeDiscordUser(user));
  }

  const activities = Array.isArray(presence.activities)
    ? presence.activities
    : [];

  const spotifyActivity = activities.find(
    (activity) =>
      activity.type === ActivityType.Listening &&
      activity.name?.toLowerCase() === 'spotify'
  );

  const filteredActivities = activities
    .filter((activity) => activity.type !== ActivityType.Custom)
    .filter(
      (activity) =>
        !(
          activity.type === ActivityType.Listening &&
          activity.name?.toLowerCase() === 'spotify'
        )
    )
    .map(normalizeActivity)
    .filter(Boolean);

  discordPresenceCache.set(presence.userId, {
    discord_status: presence.status || 'offline',
    activities: filteredActivities,
    spotify: normalizeSpotify(spotifyActivity),
    updated_at: new Date().toISOString(),
  });
}

function parseDiscordFlags(flags = 0) {
  const badges = [];

  const badgeMap = [
    { bit: 1 << 0, id: 'staff', label: 'Discord Staff' },
    { bit: 1 << 1, id: 'partner', label: 'Partner' },
    { bit: 1 << 2, id: 'hypesquad-events', label: 'HypeSquad Events' },
    { bit: 1 << 3, id: 'bug-hunter-1', label: 'Bug Hunter' },
    { bit: 1 << 6, id: 'hypesquad-bravery', label: 'House Bravery' },
    { bit: 1 << 7, id: 'hypesquad-brilliance', label: 'House Brilliance' },
    { bit: 1 << 8, id: 'hypesquad-balance', label: 'House Balance' },
    { bit: 1 << 9, id: 'early-supporter', label: 'Early Supporter' },
    { bit: 1 << 14, id: 'bug-hunter-2', label: 'Bug Hunter Gold' },
    { bit: 1 << 17, id: 'early-dev', label: 'Early Verified Bot Developer' },
    { bit: 1 << 18, id: 'moderator-alumni', label: 'Moderator Alumni' },
    { bit: 1 << 22, id: 'active-developer', label: 'Active Developer' },
  ];

  badgeMap.forEach((badge) => {
    if ((flags & badge.bit) === badge.bit) {
      badges.push(badge);
    }
  });

  return badges;
}

function cleanDiscordUsername(value) {
  const clean = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 18);

  return clean.length >= 3 ? clean : `user${Date.now().toString().slice(-6)}`;
}

async function generateUniqueUsername(baseUsername) {
  const base = cleanDiscordUsername(baseUsername);
  let username = base;
  let attempt = 0;

  while (true) {
    const existing = await pool.query(
      'SELECT id FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1',
      [username]
    );

    if (existing.rows.length === 0) {
      return username;
    }

    attempt += 1;
    username = `${base}${attempt}`.slice(0, 20);
  }
}

async function saveDiscordProfileMetadata(userId, discordUser) {
  await pool.query(
    `UPDATE user_profiles
     SET discord_id = $1,
         discord_premium_type = $2,
         discord_public_flags = $3,
         discord_banner = $4,
         discord_accent_color = $5,
         discord_avatar_decoration = $6::jsonb,
         discord_collectibles = $7::jsonb,
         discord_primary_guild = $8::jsonb
     WHERE user_id = $9`,
    [
      discordUser.id,
      discordUser.premium_type || 0,
      discordUser.public_flags || 0,
      discordUser.banner || null,
      discordUser.accent_color || null,
      JSON.stringify(discordUser.avatar_decoration_data || null),
      JSON.stringify(discordUser.collectibles || null),
      JSON.stringify(discordUser.primary_guild || null),
      userId,
    ]
  );
}

async function findOrCreateUserFromDiscord(discordUser) {
  const existingByDiscord = await pool.query(
    `
    SELECT u.id, u.username, u.email
    FROM users u
    INNER JOIN user_profiles up ON up.user_id = u.id
    WHERE up.discord_id = $1
    LIMIT 1
    `,
    [discordUser.id]
  );

  if (existingByDiscord.rows.length > 0) {
    const user = existingByDiscord.rows[0];
    await saveDiscordProfileMetadata(user.id, discordUser);
    return user;
  }

  const discordEmail =
    discordUser.email || `discord_${discordUser.id}@arcxnjo.local`;

  const existingByEmail = await pool.query(
    'SELECT id, username, email FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
    [discordEmail]
  );

  if (existingByEmail.rows.length > 0) {
    const user = existingByEmail.rows[0];
    await saveDiscordProfileMetadata(user.id, discordUser);
    return user;
  }

  const username = await generateUniqueUsername(
    discordUser.global_name ||
      discordUser.username ||
      `discord${String(discordUser.id).slice(-5)}`
  );

  const randomPassword = await bcrypt.hash(
    `${discordUser.id}-${Date.now()}-${JWT_SECRET}`,
    10
  );

  const createdUser = await pool.query(
    'INSERT INTO users (username, email, password_hash, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, username, email',
    [username, discordEmail, randomPassword]
  );

  const user = createdUser.rows[0];

  const avatarUrl = discordUser.avatar
    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${
        discordUser.avatar.startsWith('a_') ? 'gif' : 'png'
      }?size=256`
    : 'https://cdn-icons-png.flaticon.com/512/219/219986.png';

  await pool.query(
    `INSERT INTO user_profiles (
      user_id,
      profile_image,
      banner_image,
      banner_type,
      theme_color,
      bio,
      profile_badges,
      discord_id,
      discord_premium_type,
      discord_public_flags,
      discord_banner,
      discord_accent_color,
      discord_avatar_decoration,
      discord_collectibles,
      discord_primary_guild
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12, $13::jsonb, $14::jsonb, $15::jsonb)`,
    [
      user.id,
      avatarUrl,
      '',
      'image',
      '#5865F2',
      '',
      '[]',
      discordUser.id,
      discordUser.premium_type || 0,
      discordUser.public_flags || 0,
      discordUser.banner || null,
      discordUser.accent_color || null,
      JSON.stringify(discordUser.avatar_decoration_data || null),
      JSON.stringify(discordUser.collectibles || null),
      JSON.stringify(discordUser.primary_guild || null),
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
    [user.id]
  );

  await pool.query(
    'INSERT INTO user_stats (user_id, profile_views) VALUES ($1, 0)',
    [user.id]
  );

  return user;
}

/* =========================================================
   DISCORD BOT
========================================================= */

let discordClient = null;

if (process.env.DISCORD_BOT_TOKEN) {
  discordClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildPresences,
    ],
  });

  discordClient.once('ready', async () => {
    console.log(`Discord bot logged in as ${discordClient.user.tag}`);

    try {
      if (process.env.DISCORD_GUILD_ID) {
        const guild = await discordClient.guilds.fetch(process.env.DISCORD_GUILD_ID);

        await guild.members.fetch();

        guild.members.cache.forEach((member) => {
          if (member?.user) {
            discordUserCache.set(member.user.id, normalizeDiscordUser(member.user));
          }
        });

        guild.presences.cache.forEach((presence) => {
          savePresence(presence);
        });

        console.log(`Loaded Discord guild cache for ${guild.name}`);
      } else {
        console.warn('DISCORD_GUILD_ID not set. Guild presence cache skipped.');
      }
    } catch (error) {
      console.error('Discord guild cache error:', error.message);
    }
  });

  discordClient.on('presenceUpdate', (oldPresence, newPresence) => {
    savePresence(newPresence);
  });

  discordClient.login(process.env.DISCORD_BOT_TOKEN).catch((error) => {
    console.error('Discord bot login error:', error.message);
  });
} else {
  console.warn('DISCORD_BOT_TOKEN not set. Discord presence disabled.');
}

/* =========================================================
   AUTH
========================================================= */

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
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
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

/* =========================================================
   STRIPE CHECKOUT
========================================================= */

const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

app.post('/api/create-checkout-session', async (req, res) => {
  const { plan } = req.body;

  if (!stripe) {
    return res.status(500).json({
      error: 'Stripe is not configured.',
    });
  }

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
    const frontendUrl = process.env.FRONTEND_URL || 'https://arcxnjo.com.br';

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${frontendUrl}/success`,
      cancel_url: `${frontendUrl}/cancel`,
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

/* =========================================================
   PROFILE ME
========================================================= */

app.get('/api/profile/me', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      `
      SELECT
        username,
        email,
        COALESCE(plan, 'free') AS plan,
        COALESCE(role, 'user') AS role
      FROM users
      WHERE id = $1
      `,
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

    const user = userResult.rows[0] || {};
    const profile = profileResult.rows[0] || {};

    const ownerBypassEmail = (process.env.OWNER_BYPASS_EMAIL || '')
      .trim()
      .toLowerCase();

    const isOwnerBypass =
      ownerBypassEmail &&
      String(user.email || '').trim().toLowerCase() === ownerBypassEmail;

    return res.json({
      username: user.username || '',
      email: user.email || '',
      plan: user.plan || 'free',
      role: user.role || 'user',
      owner_bypass: Boolean(isOwnerBypass),
      ...profile,
      socialMedia,
    });
  } catch (error) {
    console.error('Profile me error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/* =========================================================
   BADGES
========================================================= */

app.put('/api/profile/badges', authenticateToken, async (req, res) => {
  const { badges } = req.body;

  const freeBadges = ['open-dm', 'music', 'anime'];
  const proBadges = ['verified', 'premium', 'vip', 'og'];
  const manualBadges = ['developer', 'staff', 'founder'];

  try {
    const userResult = await pool.query(
      `
      SELECT
        COALESCE(u.plan, 'free') AS plan,
        u.email,
        COALESCE(up.profile_badges, '[]'::jsonb) AS profile_badges
      FROM users u
      LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE u.id = $1
      `,
      [req.userId]
    );

    const row = userResult.rows[0] || {};
    const plan = row.plan || 'free';
    const email = String(row.email || '').trim().toLowerCase();
    const currentBadges = Array.isArray(row.profile_badges)
      ? row.profile_badges
      : [];

    const ownerBypassEmail = (process.env.OWNER_BYPASS_EMAIL || '')
      .trim()
      .toLowerCase();

    const isOwnerBypass = ownerBypassEmail && email === ownerBypassEmail;

    let editableAllowed = [...freeBadges];

    if (plan === 'pro') {
      editableAllowed = [...editableAllowed, ...proBadges];
    }

    if (isOwnerBypass) {
      editableAllowed = [...freeBadges, ...proBadges, ...manualBadges];
    }

    const requestedBadges = Array.isArray(badges)
      ? [...new Set(badges.map((badge) => String(badge).trim().toLowerCase()))]
      : [];

    const invalidBadges = requestedBadges.filter(
      (badge) => !editableAllowed.includes(badge)
    );

    if (invalidBadges.length > 0) {
      return res.status(403).json({
        error: 'You cannot use one or more selected badges.',
      });
    }

    let finalBadges = requestedBadges;

    if (!isOwnerBypass) {
      const existingManualBadges = currentBadges.filter((badge) =>
        manualBadges.includes(String(badge).toLowerCase())
      );

      finalBadges = [...new Set([...existingManualBadges, ...requestedBadges])];
    }

    if (finalBadges.length > 3) {
      return res.status(400).json({
        error: 'You can have a maximum of 3 badges total.',
      });
    }

    await pool.query(
      'UPDATE user_profiles SET profile_badges = $1::jsonb WHERE user_id = $2',
      [JSON.stringify(finalBadges), req.userId]
    );

    return res.json({
      message: 'Badges updated successfully!',
      badges: finalBadges,
      owner_bypass: Boolean(isOwnerBypass),
    });
  } catch (error) {
    console.error('Badge update error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/* =========================================================
   DISCORD OAUTH - CONNECT EXISTING ACCOUNT
========================================================= */

app.get('/api/auth/discord', async (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  if (
    !process.env.DISCORD_CLIENT_ID ||
    !process.env.DISCORD_CLIENT_SECRET ||
    !process.env.DISCORD_REDIRECT_URI
  ) {
    return res.status(500).json({
      error: 'Discord OAuth environment variables are missing.',
    });
  }

  try {
    const decoded = jwt.verify(String(token), JWT_SECRET);

    const oauthState = jwt.sign(
      {
        userId: decoded.userId,
        type: 'discord_oauth',
      },
      JWT_SECRET,
      { expiresIn: '10m' }
    );

    const redirect =
      `https://discord.com/oauth2/authorize` +
      `?client_id=${encodeURIComponent(process.env.DISCORD_CLIENT_ID)}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(process.env.DISCORD_REDIRECT_URI)}` +
      `&scope=${encodeURIComponent('identify')}` +
      `&state=${encodeURIComponent(oauthState)}`;

    return res.redirect(redirect);
  } catch (err) {
    console.error('Discord auth start error:', err.message);
    return res.status(403).json({ error: 'Invalid token' });
  }
});

/* =========================================================
   DISCORD OAUTH - LOGIN / REGISTER
========================================================= */

app.get('/api/auth/discord/login', async (req, res) => {
  if (
    !process.env.DISCORD_CLIENT_ID ||
    !process.env.DISCORD_CLIENT_SECRET ||
    !process.env.DISCORD_REDIRECT_URI
  ) {
    return res.status(500).json({
      error: 'Discord OAuth environment variables are missing.',
    });
  }

  try {
    const oauthState = jwt.sign(
      {
        type: 'discord_login',
        mode: req.query.popup === '1' ? 'popup' : 'redirect',
      },
      JWT_SECRET,
      { expiresIn: '10m' }
    );

    const redirect =
      `https://discord.com/oauth2/authorize` +
      `?client_id=${encodeURIComponent(process.env.DISCORD_CLIENT_ID)}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(process.env.DISCORD_REDIRECT_URI)}` +
      `&scope=${encodeURIComponent('identify email')}` +
      `&state=${encodeURIComponent(oauthState)}`;

    return res.redirect(redirect);
  } catch (error) {
    console.error('Discord login start error:', error.message);
    return res.status(500).json({ error: 'Failed to start Discord login.' });
  }
});

/* =========================================================
   DISCORD CALLBACK
========================================================= */

app.get('/api/auth/discord/callback', async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;

  if (!code || !state) {
    return res.status(400).send('Missing code or state');
  }

  try {
    const decodedState = jwt.verify(String(state), JWT_SECRET);

    const tokenResponse = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: String(code),
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const discordUser = userResponse.data;

    if (decodedState.type === 'discord_login') {
      const user = await findOrCreateUserFromDiscord(discordUser);

      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      if (discordClient?.isReady()) {
        try {
          const fetchedUser = await discordClient.users.fetch(discordUser.id);
          discordUserCache.set(discordUser.id, normalizeDiscordUser(fetchedUser));
        } catch (error) {
          console.error('Discord user cache after login error:', error.message);
        }
      }

      const frontendUrl = process.env.FRONTEND_URL || 'https://arcxnjo.com.br';

      if (decodedState.mode === 'popup') {
        return res.send(`
          <!doctype html>
          <html>
            <head>
              <title>Discord Login</title>
            </head>
            <body style="background:#111;color:white;font-family:Arial;display:flex;align-items:center;justify-content:center;height:100vh;">
              <p>Login successful. You can close this window.</p>
              <script>
                window.opener?.postMessage(
                  {
                    type: "ARCXNJO_DISCORD_LOGIN_SUCCESS",
                    token: ${JSON.stringify(token)},
                    user: ${JSON.stringify({
                      id: user.id,
                      username: user.username,
                      email: user.email,
                    })}
                  },
                  ${JSON.stringify(frontendUrl)}
                );
                window.close();
              </script>
            </body>
          </html>
        `);
      }

      return res.redirect(
        `${frontendUrl}/login?discord_token=${encodeURIComponent(
          token
        )}&username=${encodeURIComponent(user.username)}`
      );
    }

    if (decodedState.type !== 'discord_oauth' || !decodedState.userId) {
      return res.status(403).send('Invalid OAuth state');
    }

    const userId = decodedState.userId;

    await saveDiscordProfileMetadata(userId, discordUser);

    if (discordClient?.isReady()) {
      try {
        const fetchedUser = await discordClient.users.fetch(discordUser.id);
        discordUserCache.set(discordUser.id, normalizeDiscordUser(fetchedUser));
      } catch (error) {
        console.error('Discord user cache after OAuth error:', error.message);
      }
    }

    const frontendUrl = process.env.FRONTEND_URL || 'https://arcxnjo.com.br';

    return res.redirect(`${frontendUrl}/panel?discord=connected`);
  } catch (err) {
    console.error('Discord OAuth error:', err.response?.data || err.message);
    return res.status(500).send('Discord auth failed');
  }
});

/* =========================================================
   DISCORD PRESENCE ROUTE
========================================================= */

app.get('/api/discord-presence/:discordId', async (req, res) => {
  const { discordId } = req.params;

  try {
    let discordUser = discordUserCache.get(discordId) || null;
    let isGuildMember = false;
    let serverBoosted = false;
    let serverBoostSince = null;
    let serverRole = null;

    let premiumType = 0;
    let publicFlags = 0;
    let discordBanner = null;
    let discordAccentColor = null;
    let avatarDecoration = null;
    let collectibles = null;
    let primaryGuild = null;

    try {
      const dbResult = await pool.query(
        `SELECT
          discord_premium_type,
          discord_public_flags,
          discord_banner,
          discord_accent_color,
          discord_avatar_decoration,
          discord_collectibles,
          discord_primary_guild
         FROM user_profiles
         WHERE discord_id = $1
         LIMIT 1`,
        [discordId]
      );

      const row = dbResult.rows[0] || {};

      premiumType = row.discord_premium_type || 0;
      publicFlags = row.discord_public_flags || 0;
      discordBanner = row.discord_banner || null;
      discordAccentColor = row.discord_accent_color || null;
      avatarDecoration = row.discord_avatar_decoration || null;
      collectibles = row.discord_collectibles || null;
      primaryGuild = row.discord_primary_guild || null;
    } catch (dbError) {
      console.error('Discord metadata lookup error:', dbError.message);
    }

    if (discordClient?.isReady()) {
      try {
        const user = await discordClient.users.fetch(discordId);
        discordUser = normalizeDiscordUser(user);
        discordUserCache.set(discordId, discordUser);
      } catch (error) {
        console.error('Discord user fetch error:', error.message);
      }

      if (process.env.DISCORD_GUILD_ID) {
        try {
          const guild = await discordClient.guilds.fetch(process.env.DISCORD_GUILD_ID);
          const member = await guild.members.fetch(discordId);

          isGuildMember = Boolean(member);
          serverBoosted = Boolean(member.premiumSince);
          serverBoostSince = member.premiumSince
            ? member.premiumSince.toISOString()
            : null;

          if (member?.presence) {
            savePresence(member.presence);
          }

          if (member?.user) {
            discordUser = normalizeDiscordUser(member.user);
            discordUserCache.set(discordId, discordUser);
          }

          const topRole = member.roles.cache
            .filter((role) => role.name !== '@everyone')
            .filter((role) => !role.managed)
            .sort((a, b) => b.position - a.position)
            .first();

          if (topRole) {
            serverRole = {
              id: topRole.id,
              name: topRole.name,
              color:
                topRole.hexColor && topRole.hexColor !== '#000000'
                  ? topRole.hexColor
                  : '#a855f7',
              icon: topRole.icon || null,
              unicode_emoji: topRole.unicodeEmoji || null,
            };
          }
        } catch (error) {
          isGuildMember = false;
        }
      }
    }

    const presence = discordPresenceCache.get(discordId) || {
      discord_status: 'offline',
      activities: [],
      spotify: null,
      updated_at: null,
    };

    return res.json({
      debug_version: 'discord-profile-login-v4',
      success: true,
      monitored: isGuildMember,

      discord_user: discordUser,
      discord_status: presence.discord_status,
      activities: presence.activities,
      spotify: presence.spotify,
      updated_at: presence.updated_at,

      nitro: premiumType > 0,
      premium_type: premiumType,

      server_boosted: serverBoosted,
      server_boost_since: serverBoostSince,

      server_role: serverRole,

      public_flags: publicFlags,
      discord_badges: parseDiscordFlags(publicFlags),

      banner: discordBanner,
      accent_color: discordAccentColor,
      avatar_decoration: avatarDecoration,
      collectibles,
      primary_guild: primaryGuild,
    });
  } catch (error) {
    console.error('Discord presence route error:', error.message);

    return res.status(500).json({
      success: false,
      error: 'Failed to load Discord presence.',
    });
  }
});


/* =========================================================
   COMMUNITY TEMPLATES
========================================================= */

app.post('/api/community/templates', authenticateToken, async (req, res) => {
  const payload = cleanCommunityTemplatePayload(req.body);

  if (!payload.name) {
    return res.status(400).json({ error: 'Template name is required.' });
  }

  if (!payload.htmlCode) {
    return res.status(400).json({ error: 'HTML code is required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO community_templates (
        creator_user_id,
        name,
        description,
        preview_image,
        html_code,
        css_code,
        js_code,
        status,
        is_public
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', false)
      RETURNING
        id,
        name,
        description,
        preview_image,
        html_code,
        css_code,
        js_code,
        status,
        rejection_reason,
        is_public,
        created_at,
        approved_at`,
      [
        req.userId,
        payload.name,
        payload.description,
        payload.previewImage,
        payload.htmlCode,
        payload.cssCode,
        payload.jsCode,
      ]
    );

    return res.status(201).json({
      message: 'Template sent for approval!',
      template: result.rows[0],
    });
  } catch (error) {
    console.error('Community template create error:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/community/templates/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        name,
        description,
        preview_image,
        html_code,
        css_code,
        js_code,
        status,
        rejection_reason,
        is_public,
        created_at,
        approved_at
       FROM community_templates
       WHERE creator_user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.userId]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Community templates me error:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/community/templates/public', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        ct.id,
        ct.name,
        ct.description,
        ct.preview_image,
        ct.html_code,
        ct.css_code,
        ct.js_code,
        ct.status,
        ct.is_public,
        ct.created_at,
        ct.approved_at,
        u.username AS creator_username
       FROM community_templates ct
       LEFT JOIN users u ON u.id = ct.creator_user_id
       WHERE ct.status = 'approved'
       AND ct.is_public = true
       ORDER BY ct.approved_at DESC NULLS LAST, ct.created_at DESC
       LIMIT 60`
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Public community templates error:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/community/templates', authenticateToken, requireAdmin, async (req, res) => {
  const status = String(req.query.status || 'pending').trim().toLowerCase();

  const allowedStatuses = ['pending', 'approved', 'rejected', 'all'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status filter.' });
  }

  try {
    const params = [];
    let whereClause = '';

    if (status !== 'all') {
      params.push(status);
      whereClause = 'WHERE ct.status = $1';
    }

    const result = await pool.query(
      `SELECT
        ct.id,
        ct.creator_user_id,
        ct.name,
        ct.description,
        ct.preview_image,
        ct.html_code,
        ct.css_code,
        ct.js_code,
        ct.status,
        ct.rejection_reason,
        ct.is_public,
        ct.created_at,
        ct.approved_at,
        u.username AS creator_username,
        u.email AS creator_email
       FROM community_templates ct
       LEFT JOIN users u ON u.id = ct.creator_user_id
       ${whereClause}
       ORDER BY
        CASE ct.status
          WHEN 'pending' THEN 0
          WHEN 'approved' THEN 1
          ELSE 2
        END,
        ct.created_at DESC
       LIMIT 100`,
      params
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Admin community templates fetch error:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/community/templates/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const templateId = Number(req.params.id);
  const status = String(req.body.status || '').trim().toLowerCase();
  const rejectionReason = String(req.body.rejectionReason || req.body.rejection_reason || '')
    .trim()
    .slice(0, 500);

  const allowedStatuses = ['pending', 'approved', 'rejected'];

  if (!Number.isInteger(templateId) || templateId <= 0) {
    return res.status(400).json({ error: 'Invalid template id.' });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid template status.' });
  }

  if (status === 'rejected' && !rejectionReason) {
    return res.status(400).json({ error: 'Rejection reason is required.' });
  }

  try {
    const result = await pool.query(
      `UPDATE community_templates
       SET status = $1,
           rejection_reason = $2,
           is_public = $3,
           approved_at = CASE WHEN $1 = 'approved' THEN NOW() ELSE approved_at END
       WHERE id = $4
       RETURNING
        id,
        name,
        description,
        preview_image,
        html_code,
        css_code,
        js_code,
        status,
        rejection_reason,
        is_public,
        created_at,
        approved_at`,
      [
        status,
        status === 'rejected' ? rejectionReason : '',
        status === 'approved',
        templateId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found.' });
    }

    return res.json({
      message:
        status === 'approved'
          ? 'Template approved!'
          : status === 'rejected'
          ? 'Template rejected.'
          : 'Template moved to pending.',
      template: result.rows[0],
    });
  } catch (error) {
    console.error('Admin community template status error:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/community/templates/:id', authenticateToken, requireAdmin, async (req, res) => {
  const templateId = Number(req.params.id);

  if (!Number.isInteger(templateId) || templateId <= 0) {
    return res.status(400).json({ error: 'Invalid template id.' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM community_templates WHERE id = $1 RETURNING id',
      [templateId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found.' });
    }

    return res.json({ message: 'Template deleted.' });
  } catch (error) {
    console.error('Admin community template delete error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/* =========================================================
   GUESTBOOK
========================================================= */

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

/* =========================================================
   PUBLIC PROFILE
========================================================= */

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

/* =========================================================
   PROFILE SETTINGS
========================================================= */

app.put('/api/profile/social-media', authenticateToken, async (req, res) => {
  const allowedPlatforms = [
    'snapchat',
    'youtube',
    'discord',
    'spotify',
    'instagram',
    'x',
    'twitter',
    'tiktok',
    'telegram',
    'soundcloud',
    'paypal',
    'github',
    'roblox',
    'cashapp',
    'venmo',
    'playstation',
    'xbox',
    'applemusic',
    'gitlab',
    'twitch',
    'reddit',
    'vk',
    'steam',
    'kick',
    'pinterest',
    'facebook',
    'threads',
    'patreon',
    'signal',
    'bitcoin',
    'ethereum',
    'litecoin',
    'solana',
    'email',
    'website',
    'linkedin',
  ];

  const legacyLinks = [
    { platform: 'instagram', url: req.body.instagram, displayOrder: 1 },
    { platform: 'x', url: req.body.x, displayOrder: 2 },
    { platform: 'youtube', url: req.body.youtube, displayOrder: 3 },
    { platform: 'twitch', url: req.body.twitch, displayOrder: 4 },
    { platform: 'kick', url: req.body.kick, displayOrder: 5 },
    { platform: 'discord', url: req.body.discord, displayOrder: 6 },
    { platform: 'linkedin', url: req.body.linkedIn || req.body.linkedin, displayOrder: 7 },
  ];

  const rawLinks = Array.isArray(req.body.links) ? req.body.links : legacyLinks;

  const seen = new Set();
  const cleanLinks = [];

  rawLinks.forEach((link, index) => {
    const platform = String(link.platform || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '');

    const url = String(link.url || '').trim().slice(0, 500);

    if (!platform || !url) return;
    if (!allowedPlatforms.includes(platform)) return;
    if (seen.has(platform)) return;

    seen.add(platform);

    cleanLinks.push({
      platform,
      url,
      displayOrder: Number(link.displayOrder || index + 1),
    });
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM user_links WHERE user_id = $1', [req.userId]);

    for (let index = 0; index < cleanLinks.length; index += 1) {
      const link = cleanLinks[index];

      await client.query(
        `INSERT INTO user_links (user_id, platform, url, display_order)
         VALUES ($1, $2, $3, $4)`,
        [req.userId, link.platform, link.url, link.displayOrder || index + 1]
      );
    }

    await client.query('COMMIT');

    return res.json({
      message: 'Links saved successfully!',
      links: cleanLinks,
    });
  } catch (error) {
    await client.query('ROLLBACK');

    console.error('Links save error:', error);
    return res.status(500).json({ error: error.message });
  } finally {
    client.release();
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

  const cleanUsername = String(username || '').trim().toLowerCase();
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
  const { profileTemplate, profileEffect, customCursorUrl } = req.body;

  const cleanCustomCursorUrl = String(customCursorUrl || '').trim();

  if (
    cleanCustomCursorUrl &&
    !cleanCustomCursorUrl.startsWith('http://') &&
    !cleanCustomCursorUrl.startsWith('https://') &&
    !cleanCustomCursorUrl.startsWith('/')
  ) {
    return res.status(400).json({
      error: 'Invalid cursor URL.',
    });
  }
  
  const allowedTemplates = [
    'neon-purple',
    'cyber-glass',
    'minimal-dark',
    'red-glow',
    'blue-ice',
    'pro-scroll',
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
  `UPDATE user_profiles
   SET profile_template = $1,
       profile_effect = $2,
       custom_cursor_url = $3
   WHERE user_id = $4`,
  [profileTemplate, profileEffect, cleanCustomCursorUrl, req.userId]
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

/* =========================================================
   UPLOAD
========================================================= */

app.post(
  '/api/upload',
  authenticateToken,
  (req, res, next) => {
    upload.single('file')(req, res, (error) => {
      if (error) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            error: 'File is too large. Maximum size is 50MB.',
          });
        }

        return res.status(400).json({
          error: error.message || 'Upload failed.',
        });
      }

      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }

      const userResult = await pool.query(
        "SELECT COALESCE(plan, 'free') AS plan FROM users WHERE id = $1",
        [req.userId]
      );

      const plan = userResult.rows[0]?.plan || 'free';
      const isVideo = req.file.mimetype.startsWith('video/');

      const maxUploadMb =
        isVideo && plan === 'pro'
          ? PRO_VIDEO_UPLOAD_LIMIT_MB
          : FREE_UPLOAD_LIMIT_MB;

      if (req.file.size > maxUploadMb * MB) {
        return res.status(413).json({
          error: isVideo
            ? `Video upload limit is ${maxUploadMb}MB for your plan.`
            : `File upload limit is ${maxUploadMb}MB.`,
        });
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
  }
);

/* =========================================================
   SERVER START
========================================================= */

const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});