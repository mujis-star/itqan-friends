// ITQAN Friends v2 Features

document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
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


// --- Animated Stats Counter ---
async function initStatsCounter() {
    const stats = document.querySelectorAll(".hero-stat-num");
    if (!stats.length) return;
    
    try {
        const res = await fetch("data/stats.json");
        const data = await res.json();
        
        // Update DOM with fetched target values
        if (stats[0]) stats[0].setAttribute("data-target", data.members || 0);
        if (stats[1]) stats[1].setAttribute("data-target", data.events || 0);
        if (stats[2]) stats[2].setAttribute("data-target", data.years || 0);
        if (stats[3]) stats[3].setAttribute("data-target", data.achievements || 0);
    } catch (e) {
        console.warn("Could not load stats.json, using fallback values", e);
    }
    
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
