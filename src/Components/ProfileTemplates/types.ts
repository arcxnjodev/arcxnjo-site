export type ProfileEffect = "none" | "stars" | "snow" | "sparkles" | "hearts";

export type GuestbookEntry = {
  id: number;
  visitor_name: string;
  message: string;
  created_at: string;
};

export type CommunityTemplate = {
  id: number;
  name: string;
  description?: string;
  preview_image?: string;
  html_code: string;
  css_code?: string;
  js_code?: string;
  status?: string;
  is_public?: boolean;
  created_at?: string;
  approved_at?: string | null;
  creator_username?: string;
};

export type ProfileData = {
  username: string;
  profile: {
    profile_image?: string;
    banner_image?: string;
    banner_video?: string;
    banner_type?: string;
    theme_color?: string;
    bio?: string;
    display_name?: string;
    profile_template?: string;
    community_template_id?: number | null;
    profile_effect?: ProfileEffect;
    profile_badges?: string[];
    music_url?: string;
    music_title?: string;
    location?: string;
    status_text?: string;
    discord_id?: string;
    custom_cursor_url?: string;
  };
  communityTemplate?: CommunityTemplate | null;
  socialMedia: Record<string, string>;
  stats: {
    profile_views: number;
  };
};

export type TemplateStyle = {
  overlay: string;
  card: string;
  avatar: string;
  username: string;
  handle: string;
  bio: string;
  views: string;
  icon: string;
  audioButton: string;
  audioPanel: string;
  sliderAccent: string;
  infoCard: string;
  infoIcon: string;
  guestbookForm: string;
};

export type ProfileTemplateProps = {
  data: ProfileData;
  username: string;
  apiUrl: string;
  discordData: any;
};
