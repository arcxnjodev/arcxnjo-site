export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    };
    
    // Rota de registro
    if (path === '/api/register' && request.method === 'POST') {
      try {
        const { username, email, password } = await request.json();
        
        const existing = await env.DB.prepare(
          'SELECT id FROM users WHERE email = ? OR username = ?'
        ).bind(email, username).first();
        
        if (existing) {
          return new Response(JSON.stringify({ error: 'User already exists' }), { status: 400, headers });
        }
        
        const result = await env.DB.prepare(
          'INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, datetime("now")) RETURNING id'
        ).bind(username, email, password).run();
        
        const userId = result.results[0].id;
        
        await env.DB.prepare(
          `INSERT INTO user_profiles (user_id, profile_image, banner_image, banner_type, theme_color) 
           VALUES (?, ?, ?, ?, ?)`
        ).bind(userId, 'https://cdn-icons-png.flaticon.com/512/219/219986.png', '', 'image', '#5865F2').run();
        
        return new Response(JSON.stringify({ message: 'User created successfully!' }), { status: 201, headers });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400, headers });
      }
    }
    
    // Rota de login
    if (path === '/api/login' && request.method === 'POST') {
      try {
        const { email, password } = await request.json();
        
        const user = await env.DB.prepare(
          'SELECT * FROM users WHERE email = ?'
        ).bind(email).first();
        
        if (!user || user.password_hash !== password) {
          return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401, headers });
        }
        
        const token = btoa(`${user.id}:${user.username}:${Date.now()}`);
        
        return new Response(JSON.stringify({ 
          token, 
          user: { id: user.id, username: user.username, email: user.email } 
        }), { status: 200, headers });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
      }
    }
    
    // Rota para buscar perfil público
    if (path.startsWith('/api/profile/') && request.method === 'GET') {
      try {
        const username = path.replace('/api/profile/', '');
        
        const user = await env.DB.prepare(
          'SELECT id, username FROM users WHERE username = ?'
        ).bind(username).first();
        
        if (!user) {
          return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers });
        }
        
        const profile = await env.DB.prepare(
          'SELECT * FROM user_profiles WHERE user_id = ?'
        ).bind(user.id).first();
        
        return new Response(JSON.stringify({
          username: user.username,
          profile: profile,
          socialMedia: {}
        }), { status: 200, headers });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
      }
    }
    
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
  }
};