// ITQAN Friends v2 Features

document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    initHeroParticles();
    initStatsCounter();
    loadAchievements();
});

// --- Theme Toggle ---
function initThemeToggle() {
    const themeBtn = document.getElementById('themeToggle');
    if (!themeBtn) return;
    const icon = themeBtn.querySelector('i');
    
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    
    if (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) {
        document.documentElement.setAttribute('data-theme', 'light');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
    
    themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'light') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    });
}

// --- Hero Particles Animation ---
function initHeroParticles() {
    const canvas = document.getElementById("heroParticles");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    let particles = [];
    const maxParticles = 40;
    let animationFrameId;
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener("resize", resize);
    resize();
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
            this.color = `rgba(217, 70, 239, ${Math.random() * 0.5 + 0.1})`; // cyan-ish
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        // Draw connecting lines
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(217, 70, 239, ${0.15 - dist/1000})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        
        animationFrameId = requestAnimationFrame(animate);
    }
    
    // Pause animation when tab is inactive to save CPU
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            cancelAnimationFrame(animationFrameId);
        } else {
            animate();
        }
    });
    
    animate();
}

// --- Animated Stats Counter ---
function initStatsCounter() {
    const stats = document.querySelectorAll(".hero-stat-num");
    if (!stats.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute("data-target"));
                animateValue(entry.target, 0, target, 2000);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => observer.observe(stat));
    
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start) + (end > 10 ? "+" : "");
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
}

// --- Load Achievements from JSON ---
async function loadAchievements() {
    const grid = document.getElementById("achievementsGrid");
    const emptyState = document.getElementById("achievementsEmpty");
    if (!grid || !emptyState) return;
    
    try {
        const res = await fetch("data/achievements.json");
        const data = await res.json();
        const achievements = data.achievements || [];
        
        if (achievements.length === 0) {
            grid.style.display = "none";
            emptyState.style.display = "flex";
            return;
        }
        
        emptyState.style.display = "none";
        grid.style.display = "grid";
        
        grid.innerHTML = achievements.map(item => `
            <div class="achievement-card">
                <div class="achievement-year">${escapeHTML(item.year)}</div>
                <h3 class="achievement-title">${escapeHTML(item.title)}</h3>
                <div class="achievement-meta">
                    <span class="achievement-category"><i class="fas fa-tag"></i> ${escapeHTML(item.category)}</span>
                    <span class="achievement-date"><i class="far fa-calendar-alt"></i> ${escapeHTML(item.date)}</span>
                </div>
                <p class="achievement-desc">${escapeHTML(item.description)}</p>
                ${item.gallery ? `<a href="#media" onclick="switchMediaTab('gallery')" class="achievement-link">View Gallery &rarr;</a>` : ''}
            </div>
        `).join("");
        
    } catch (err) {
        console.error("Failed to load achievements:", err);
        grid.style.display = "none";
        emptyState.style.display = "flex";
    }
}

function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
