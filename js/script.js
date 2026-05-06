// ==========================================
// TASHAFI PLATFORM - MAIN SCRIPT
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Theme Toggle (Dark / Light Mode) ---
    // Make sure we select the toggle button safely
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;

    // Apply saved theme immediately
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        htmlEl.setAttribute('data-theme', currentTheme);
        updateThemeIcon(currentTheme);
        updateLogos(currentTheme);
    } else {
        updateLogos('light');
    }

    if (themeToggleBtn) {
        // Direct click event
        themeToggleBtn.onclick = function() {
            let theme = htmlEl.getAttribute('data-theme');
            if (theme === 'dark') {
                htmlEl.removeAttribute('data-theme'); // light is default
                localStorage.setItem('theme', 'light');
                updateThemeIcon('light');
                updateLogos('light');
            } else {
                htmlEl.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                updateThemeIcon('dark');
                updateLogos('dark');
            }
        };
    } else {
        console.warn("Theme toggle button not found in DOM.");
    }

    function updateThemeIcon(theme) {
        if (!themeToggleBtn) return;
        const icon = themeToggleBtn.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fa-solid fa-sun';
        } else {
            icon.className = 'fa-solid fa-moon';
        }
    }

    function updateLogos(theme) {
        const navLogo = document.querySelector('.nav-logo');
        const heroLogo = document.querySelector('.hero-logo-anim');
        const logoSrc = theme === 'dark' ? 'assets/tashafi-v3.png' : 'assets/tashafi-v2.png';
        
        if(navLogo) navLogo.src = logoSrc;
        if(heroLogo) heroLogo.src = logoSrc;
    }

    // --- Scroll Animations (Fade-in) ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in, .reveal').forEach(el => {
        observer.observe(el);
    });

    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Auth System (Supabase) ---
    const SUPABASE_URL = 'https://ufzwhitosnshpqxcqigf.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmendoaXRvc25zaHBxeGNxaWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTc0NzIsImV4cCI6MjA5MzA3MzQ3Mn0.zdVjzMkw6K5wegE2wImbAUEkYbtD2Hu2CwMrO0aDuOs';
    
    // Assign supabase globally
    try {
        if (window.supabase) {
            window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
    } catch (e) {
        console.warn("Supabase not initialized properly.");
    }

});

// Global session function needed by payment-service.js
async function getSession() {
    if(!window.supabaseClient) return null;
    const { data, error } = await window.supabaseClient.auth.getSession();
    if(error) {
        console.error("Error getting session:", error);
        return null;
    }
    return data.session;
}
