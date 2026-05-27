// ===== CUSTOM CURSOR WITH GLOW EFFECT =====
(function initCustomCursor() {
    // Only run on desktop (not on touch devices)
    if ('ontouchstart' in window || window.innerWidth <= 768) {
        return;
    }
    
    // Create cursor elements
    const cursor = document.createElement('div');
    const follower = document.createElement('div');
    const cursorGlow = document.createElement('div');
    
    // Style the main cursor dot
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background: #00F0FF;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        transition: width 0.2s ease, height 0.2s ease;
        box-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
    `;
    
    // Style the follower (outer ring)
    follower.className = 'custom-cursor-follower';
    follower.style.cssText = `
        position: fixed;
        width: 30px;
        height: 30px;
        border: 1.5px solid rgba(0, 240, 255, 0.4);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9998;
        transform: translate(-50%, -50%);
        transition: transform 0.12s ease-out, width 0.2s ease, height 0.2s ease;
        box-shadow: 0 0 15px rgba(0, 240, 255, 0.2);
    `;
    
    // Style the glow effect
    cursorGlow.className = 'custom-cursor-glow';
    cursorGlow.style.cssText = `
        position: fixed;
        width: 60px;
        height: 60px;
        background: radial-gradient(circle, rgba(0, 240, 255, 0.15), transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9997;
        transform: translate(-50%, -50%);
        transition: transform 0.08s linear;
        opacity: 0;
    `;
    
    document.body.appendChild(cursor);
    document.body.appendChild(follower);
    document.body.appendChild(cursorGlow);
    
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    let glowX = 0, glowY = 0;
    
    // Throttled mousemove for better performance
    let ticking = false;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Update cursor dot immediately
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
        
        // Update glow
        glowX = mouseX;
        glowY = mouseY;
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top = glowY + 'px';
        cursorGlow.style.opacity = '1';
        
        if (!ticking) {
            requestAnimationFrame(() => {
                followerX = mouseX;
                followerY = mouseY;
                follower.style.left = followerX + 'px';
                follower.style.top = followerY + 'px';
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        follower.style.opacity = '0';
        cursorGlow.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        follower.style.opacity = '1';
        cursorGlow.style.opacity = '1';
    });
    
    // Hover effects on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .btn, .feat-card, .about-card, .cc, .wc, .media-tab, .acc-hdr, .nav-links a, .auth-user-btn');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.width = '16px';
            cursor.style.height = '16px';
            cursor.style.background = '#FF3366';
            cursor.style.boxShadow = '0 0 20px rgba(255, 51, 102, 0.6)';
            
            follower.style.width = '45px';
            follower.style.height = '45px';
            follower.style.borderColor = 'rgba(255, 51, 102, 0.6)';
            follower.style.borderWidth = '2px';
            
            cursorGlow.style.width = '90px';
            cursorGlow.style.height = '90px';
            cursorGlow.style.background = 'radial-gradient(circle, rgba(255, 51, 102, 0.2), transparent 70%)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.width = '8px';
            cursor.style.height = '8px';
            cursor.style.background = '#00F0FF';
            cursor.style.boxShadow = '0 0 10px rgba(0, 240, 255, 0.5)';
            
            follower.style.width = '30px';
            follower.style.height = '30px';
            follower.style.borderColor = 'rgba(0, 240, 255, 0.4)';
            follower.style.borderWidth = '1.5px';
            
            cursorGlow.style.width = '60px';
            cursorGlow.style.height = '60px';
            cursorGlow.style.background = 'radial-gradient(circle, rgba(0, 240, 255, 0.15), transparent 70%)';
        });
    });
    
    // Special effect for clickable elements
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousedown', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
            follower.style.transform = 'translate(-50%, -50%) scale(0.8)';
        });
        btn.addEventListener('mouseup', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            follower.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });
})();
