/*
  ITQAN desktop cursor.
  Include after your page scripts. It only runs on mouse/trackpad devices.
*/
(function () {
  if (!window.matchMedia("(pointer: fine) and (min-width: 769px)").matches) return;

  const ring = document.createElement("div");
  const dot = document.createElement("div");
  ring.className = "itqan-cursor";
  dot.className = "itqan-cursor-dot";
  document.body.append(ring, dot);

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let ringX = x;
  let ringY = y;

  window.addEventListener("mousemove", (event) => {
    x = event.clientX;
    y = event.clientY;
    dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
  });

  document.addEventListener("mouseover", (event) => {
    if (event.target.closest("a, button, input, select, textarea, .about-card, .gallery-item, .acc-hdr, .auth-user-btn")) {
      document.body.classList.add("itqan-cursor-active");
    }
  });

  document.addEventListener("mouseout", (event) => {
    if (event.target.closest("a, button, input, select, textarea, .about-card, .gallery-item, .acc-hdr, .auth-user-btn")) {
      document.body.classList.remove("itqan-cursor-active");
    }
  });

  function animate() {
    ringX += (x - ringX) * 0.18;
    ringY += (y - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animate);
  }

  animate();
})();

