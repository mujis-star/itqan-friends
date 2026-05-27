// ===== OPTIMIZED CUSTOM CURSOR - NO LAG =====
(function initCustomCursor() {
    // Only run on desktop (not on touch devices)
    if ('ontouchstart' in window || window.innerWidth <= 768) {
        return;
    }
    
    // Create cursor elements only once
    const cursor = document.createElement('div');
    const follower = document.createElement('div');
    
    cursor.className = 'custom-cursor';
    follower.className = 'custom-cursor-follower';
    
    cursor.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background: #00F0FF;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        transition: width 0.2s, height 0.2s;
    `;
    
    follower.style.cssText = `
        position: fixed;
        width: 30px;
        height: 30px;
        border: 1.5px solid rgba(0, 240, 255, 0.3);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9998;
        transform: translate(-50%, -50%);
        transition: transform 0.15s ease-out, width 0.2s, height 0.2s;
    `;
    
    document.body.appendChild(cursor);
    document.body.appendChild(follower);
    
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    
    // Throttled mousemove event
    let ticking = false;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        if (!ticking) {
            requestAnimationFrame(() => {
                cursor.style.left = mouseX + 'px';
                cursor.style.top = mouseY + 'px';
                ticking = false;
            });
            ticking = true;
        }
        
        followerX = mouseX;
        followerY = mouseY;
        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';
    });
    
    // Hover effects on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .btn, .feat-card, .about-card, .cc, .wc, .media-tab, .acc-hdr');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.width = '16px';
            cursor.style.height = '16px';
            follower.style.width = '45px';
            follower.style.height = '45px';
            follower.style.borderColor = 'rgba(0, 240, 255, 0.6)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.width = '8px';
            cursor.style.height = '8px';
            follower.style.width = '30px';
            follower.style.height = '30px';
            follower.style.borderColor = 'rgba(0, 240, 255, 0.3)';
        });
    });
    
    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        follower.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        follower.style.opacity = '1';
    });
})();
