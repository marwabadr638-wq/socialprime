const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- API ROUTES ---

// 1. Auth & Profiles (Handled mostly via Supabase directly in frontend, but we can verify here)
app.post('/api/auth/verify', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) return res.status(401).json({ error: error.message });
    
    res.json({ user });
});

// 2. Database API for CMS (Blogs, Testimonials, FAQs)
// Get all blogs
app.get('/api/database/blogs', async (req, res) => {
    const { data, error } = await supabase.from('blog_posts').select('*').order('order_index', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Create a blog (Admin)
app.post('/api/database/blogs', async (req, res) => {
    // In a real scenario, verify admin token here
    const { title, content, image_url, order_index } = req.body;
    const { data, error } = await supabase.from('blog_posts').insert([{ title, content, image_url, order_index }]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// 3. Payment / Purchases (Stub)
app.post('/api/payment/success', async (req, res) => {
    const { user_id, course_id, amount } = req.body;
    // Verify payment from Tap/Gammal Tech SDK here in future
    const { data, error } = await supabase.from('purchases').insert([{ user_id, course_id, amount }]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, data });
});

// Check course access
app.get('/api/courses/:course_id/access', async (req, res) => {
    const { course_id } = req.params;
    const user_id = req.headers['x-user-id']; // In production, verify JWT
    const preview = req.query.preview;

    if (preview === 'admin_password') { // Placeholder admin password
        return res.json({ access: true, admin: true });
    }

    if (!user_id) return res.status(401).json({ access: false, message: 'Unauthorized' });

    const { data, error } = await supabase.from('purchases').select('*').eq('user_id', user_id).eq('course_id', course_id).single();
    if (error || !data) return res.json({ access: false });
    
    res.json({ access: true });
});

// Serve frontend paths
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'admin.html'));
});

// Catch all for 404
app.use((req, res) => {
    res.status(404).send('Page not found');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
