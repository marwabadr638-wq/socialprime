require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Only initialize if keys are present to avoid crash on startup with placeholders
let supabase = null;
if (supabaseUrl && supabaseUrl !== 'placeholder' && supabaseKey && supabaseKey !== 'placeholder') {
    supabase = createClient(supabaseUrl, supabaseKey);
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to inject Supabase
app.use((req, res, next) => {
    req.supabase = supabase;
    next();
});

// API Routes
app.get('/api/services', async (req, res) => {
    if (!req.supabase) return res.status(500).json({ error: 'Supabase not configured' });
    const { data, error } = await req.supabase.from('services').select('*').order('created_at', { ascending: true });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

app.get('/api/specialists', async (req, res) => {
    if (!req.supabase) return res.status(500).json({ error: 'Supabase not configured' });
    const { data, error } = await req.supabase.from('specialists').select('*').order('created_at', { ascending: true });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

app.get('/api/courses', async (req, res) => {
    if (!req.supabase) return res.status(500).json({ error: 'Supabase not configured' });
    const { data, error } = await req.supabase.from('courses').select('*').order('created_at', { ascending: true });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

app.get('/api/testimonials', async (req, res) => {
    if (!req.supabase) return res.status(500).json({ error: 'Supabase not configured' });
    const { data, error } = await req.supabase.from('testimonials').select('*').order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

app.get('/api/sections', async (req, res) => {
    if (!req.supabase) return res.status(500).json({ error: 'Supabase not configured' });
    const { data, error } = await req.supabase.from('sections_visibility').select('*');
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Serve frontend pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// For any other route, return index.html for basic SPA or just 404
app.get('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
