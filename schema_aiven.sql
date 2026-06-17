-- =============================================
-- SCHEMA COMPLETO - arcxnjo.com.br
-- Importar no Aiven PostgreSQL
-- =============================================

-- SEQUENCES
CREATE SEQUENCE IF NOT EXISTS users_id_seq;
CREATE SEQUENCE IF NOT EXISTS user_profiles_id_seq;
CREATE SEQUENCE IF NOT EXISTS user_links_id_seq;
CREATE SEQUENCE IF NOT EXISTS user_stats_id_seq;
CREATE SEQUENCE IF NOT EXISTS guestbook_entries_id_seq;
CREATE SEQUENCE IF NOT EXISTS link_clicks_id_seq;
CREATE SEQUENCE IF NOT EXISTS profile_view_events_id_seq;
CREATE SEQUENCE IF NOT EXISTS community_templates_id_seq;
CREATE SEQUENCE IF NOT EXISTS community_template_likes_id_seq;
CREATE SEQUENCE IF NOT EXISTS user_community_template_overrides_id_seq;

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY DEFAULT nextval('users_id_seq'),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  plan TEXT DEFAULT 'free',
  role TEXT DEFAULT 'user',
  spotify_connected BOOLEAN DEFAULT false,
  spotify_access_token TEXT,
  spotify_refresh_token TEXT,
  spotify_display_on_profile BOOLEAN DEFAULT true
);

-- USER_PROFILES
CREATE TABLE IF NOT EXISTS user_profiles (
  id INTEGER PRIMARY KEY DEFAULT nextval('user_profiles_id_seq'),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_image TEXT,
  banner_image TEXT,
  banner_type TEXT DEFAULT 'image',
  theme_color TEXT DEFAULT '#5865F2',
  banner_video TEXT,
  music_url TEXT,
  bio TEXT DEFAULT '',
  profile_template TEXT DEFAULT 'neon-purple',
  display_name TEXT DEFAULT '',
  music_title TEXT DEFAULT '',
  location TEXT DEFAULT '',
  status_text TEXT DEFAULT '',
  profile_effect TEXT DEFAULT 'none',
  profile_badges JSONB DEFAULT '[]',
  discord_id TEXT,
  discord_username TEXT DEFAULT '',
  discord_global_name TEXT DEFAULT '',
  discord_avatar TEXT DEFAULT '',
  discord_premium_type INTEGER DEFAULT 0,
  discord_primary_guild JSONB,
  discord_public_flags INTEGER DEFAULT 0,
  discord_banner TEXT,
  discord_accent_color INTEGER,
  discord_avatar_decoration JSONB,
  discord_collectibles JSONB,
  custom_cursor_url TEXT DEFAULT '',
  community_template_id INTEGER,
  previous_profile_template VARCHAR(50)
);

-- USER_LINKS
CREATE TABLE IF NOT EXISTS user_links (
  id INTEGER PRIMARY KEY DEFAULT nextval('user_links_id_seq'),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT,
  display_order INTEGER DEFAULT 0
);

-- USER_STATS
CREATE TABLE IF NOT EXISTS user_stats (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_views INTEGER DEFAULT 0
);

-- GUESTBOOK_ENTRIES
CREATE TABLE IF NOT EXISTS guestbook_entries (
  id INTEGER PRIMARY KEY DEFAULT nextval('guestbook_entries_id_seq'),
  profile_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  visitor_name VARCHAR(32) NOT NULL,
  message VARCHAR(180) NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- LINK_CLICKS
CREATE TABLE IF NOT EXISTS link_clicks (
  id INTEGER PRIMARY KEY DEFAULT nextval('link_clicks_id_seq'),
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  clicked_at TIMESTAMP DEFAULT now()
);

-- PROFILE_VIEW_EVENTS
CREATE TABLE IF NOT EXISTS profile_view_events (
  id INTEGER PRIMARY KEY DEFAULT nextval('profile_view_events_id_seq'),
  profile_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  visitor_key TEXT NOT NULL,
  last_viewed_at TIMESTAMP DEFAULT now()
);

-- COMMUNITY_TEMPLATES
CREATE TABLE IF NOT EXISTS community_templates (
  id INTEGER PRIMARY KEY DEFAULT nextval('community_templates_id_seq'),
  creator_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(80) NOT NULL,
  description TEXT DEFAULT '',
  preview_image TEXT DEFAULT '',
  html_code TEXT NOT NULL,
  css_code TEXT DEFAULT '',
  js_code TEXT DEFAULT '',
  status VARCHAR(20) DEFAULT 'pending',
  rejection_reason TEXT DEFAULT '',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  approved_at TIMESTAMP,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  uses_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false
);

-- COMMUNITY_TEMPLATE_LIKES
CREATE TABLE IF NOT EXISTS community_template_likes (
  id INTEGER PRIMARY KEY DEFAULT nextval('community_template_likes_id_seq'),
  template_id INTEGER NOT NULL REFERENCES community_templates(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);

-- USER_COMMUNITY_TEMPLATE_OVERRIDES
CREATE TABLE IF NOT EXISTS user_community_template_overrides (
  id INTEGER PRIMARY KEY DEFAULT nextval('user_community_template_overrides_id_seq'),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  community_template_id INTEGER REFERENCES community_templates(id) ON DELETE CASCADE,
  html_code TEXT DEFAULT '',
  css_code TEXT DEFAULT '',
  js_code TEXT DEFAULT '',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- INDEXES
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_links_user_id ON user_links(user_id);
CREATE INDEX IF NOT EXISTS idx_guestbook_profile_user_id ON guestbook_entries(profile_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_view_events_profile_user_id ON profile_view_events(profile_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profile_view_events_unique ON profile_view_events(profile_user_id, visitor_key);
CREATE UNIQUE INDEX IF NOT EXISTS idx_community_template_likes_unique ON community_template_likes(template_id, user_id);
