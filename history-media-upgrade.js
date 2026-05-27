/*
  ITQAN Media Hub popup + Union & Artsfest History redesign.
  Include after the main page script and helper scripts.
*/
(function () {
  const unionYears = [
    {
      year: "2026-27",
      title: "Core Committee",
      status: "Current",
      roles: [
        ["President", "Sayed Hudaif"],
        ["Vice President", "Burhan"],
        ["Secretary", "Muhammed SM"],
        ["Assistant Secretary", "Rashad"],
        ["Treasurer", "Naseem Zayan"],
        ["Financial Manager", "Fuad MA"],
      ],
      notes: ["Auditing Board: Rabeeh and Salah"],
    },
    {
      year: "2025-26",
      title: "Core Committee",
      status: "Previous Year",
      roles: [
        ["President", "Sayed Hudaif"],
        ["Vice President", "Sayed Burhan"],
        ["Secretary", "Muhyuddin Mehroof"],
        ["Assistant Secretary", "Shahzad"],
        ["Treasurer", "Mirsad"],
        ["P.R.O", "Zidan"],
      ],
      notes: [
        "Published 30+ digital tabloids and 10+ digital magazines",
        "Published 30+ handwritten tabloids and 10+ handwritten magazines",
        "Uploaded 40+ status videos",
        "Conducted 400+ programs",
        "Finished 2nd in AHSAS Best Union Award",
      ],
    },
    {
      year: "2024-25",
      title: "Core Committee",
      status: "Past",
      roles: [
        ["President", "Sayed Burhan"],
        ["Vice President", "Sayed Hudaif"],
        ["Secretary", "Zidan"],
        ["Assistant Secretary", "Shahzad"],
        ["Treasurer", "Muhammed VK"],
      ],
      notes: [
        "Conducted 200+ programs",
        "Published 100+ newspapers and 50+ magazines",
        "Completed 60+ courses",
        "Conducted 3 guest talks",
        "Won Best Union Award after being 3 months best union",
      ],
    },
    {
      year: "2023-24",
      title: "Core Committee",
      status: "Founding Phase",
      roles: [
        ["President", "Sayed Burhan"],
        ["Vice President", "Sayed Hudaif"],
        ["Secretary", "Razin"],
        ["Assistant Secretary", "Shahzad"],
        ["Treasurer", "Muhammed VK"],
        ["P.R.O", "Zidan"],
      ],
      notes: [],
    },
  ];

  const artsYears = [
    {
      year: "2026-27",
      title: "Arts Fest Controllers",
      status: "Current",
      roles: [
        ["Controller", "Zidan"],
        ["Controller", "Moosa"],
        ["Controller", "Salah"],
      ],
      notes: [],
    },
    {
      year: "2025-26",
      title: "Arts Fest Leaders",
      status: "Previous Year",
      roles: [
        ["Captain", "Mirsad"],
        ["Captain", "Razin"],
        ["Captain", "Ranif"],
        ["Captain", "Shahzad"],
      ],
      notes: [],
    },
    {
      year: "2024-25",
      title: "Arts Fest Leaders",
      status: "Past",
      roles: [
        ["Controller", "Zidan"],
        ["Controller", "Burhan"],
        ["Captain", "Naseem"],
        ["Captain", "Nuhman"],
        ["Captain", "Fuad MA"],
      ],
      notes: [],
    },
    {
      year: "2023-24",
      title: "Arts Fest Leaders",
      status: "Inaugural",
      roles: [
        ["Controller", "Ranif"],
        ["Controller", "Naseem"],
        ["Controller", "Muzzammil"],
        ["Captain", "Zidan"],
        ["Captain", "Hisham"],
        ["Captain", "Muhyudheen"],
        ["Captain", "Muhammed VK"],
      ],
      notes: [],
    },
  ];

  function esc(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function yearCard(item) {
    const roles = item.roles
      .map(([role, name]) => `<div class="itqan-role-card"><span>${esc(role)}</span><strong>${esc(name)}</strong></div>`)
      .join("");
    const notes = item.notes && item.notes.length
      ? `<div class="itqan-history-subhead">Highlights</div><div class="itqan-achievements">${item.notes.map((note) => `<div class="itqan-achievement">${esc(note)}</div>`).join("")}</div>`
      : "";
    const pillClass = item.status === "Current" ? "itqan-pill" : "itqan-pill previous";

    return `
      <article class="itqan-year-card">
        <div class="itqan-year-head">
          <h4><i class="fas fa-bookmark"></i> ${esc(item.year)} ${esc(item.title)}</h4>
          <span class="${pillClass}">${esc(item.status)}</span>
        </div>
        <div class="itqan-role-grid">${roles}</div>
        ${notes}
      </article>
    `;
  }

  function historyHtml(type) {
    const isUnion = type === "union";
    const data = isUnion ? unionYears : artsYears;
    return `
      <div class="itqan-history-wrap">
        <section class="itqan-history-hero">
          <div>
            <div class="itqan-history-kicker">${isUnion ? "Union Records" : "Arts Fest Records"}</div>
            <h3>${isUnion ? "Committee Timeline" : "Controllers & Leaders Timeline"}</h3>
            <p>${isUnion
              ? "Corrected from the class portfolio: 2026-27 is the current committee, while 2025-26 is now the previous year."
              : "Arts Fest leadership has been reorganized by year using the portfolio data, with 2026-27 marked current."}</p>
          </div>
          <div class="itqan-history-stat">
            <div><strong>${data.length}</strong><span>Recorded Years</span></div>
          </div>
        </section>
        ${data.map(yearCard).join("")}
      </div>
    `;
  }

  function upgradeHistory() {
    const union = document.getElementById("histUnion");
    const arts = document.getElementById("histArtsfest");
    if (union) union.innerHTML = historyHtml("union");
    if (arts) arts.innerHTML = historyHtml("arts");
  }

  function ensureMediaModal() {
    if (document.getElementById("itqanMediaModal")) return;
    document.body.insertAdjacentHTML(
      "beforeend",
      `<div class="itqan-media-modal" id="itqanMediaModal">
        <div class="itqan-media-shell">
          <div class="itqan-media-head">
            <h3 id="itqanMediaTitle">Media Hub</h3>
            <button class="itqan-media-close" type="button" onclick="closeItqanMediaModal()"><i class="fas fa-times"></i></button>
          </div>
          <div class="itqan-media-body" id="itqanMediaBody"></div>
        </div>
      </div>`
    );

    document.getElementById("itqanMediaModal").addEventListener("click", (event) => {
      if (event.target.id === "itqanMediaModal") closeItqanMediaModal();
    });
  }

  function upgradeMediaHub() {
    const mediaHub = document.querySelector(".media-hub");
    if (!mediaHub) return;
    mediaHub.classList.add("itqan-media-upgraded");

    document.querySelectorAll(".media-tab").forEach((tab) => {
      if (!tab.querySelector("span")) tab.innerHTML = tab.innerHTML.replace(/([^>]+)$/, "<span>$1</span>");
    });

    const galleryButton = document.querySelector(".media-tab.t-gal");
    const magButton = document.querySelector(".media-tab.t-mag");
    if (galleryButton) galleryButton.onclick = () => openItqanMediaModal("gallery");
    if (magButton) magButton.onclick = () => openItqanMediaModal("magazines");

    ensureMediaModal();
  }

  window.openItqanMediaModal = function openItqanMediaModal(type) {
    ensureMediaModal();
    const modal = document.getElementById("itqanMediaModal");
    const title = document.getElementById("itqanMediaTitle");
    const body = document.getElementById("itqanMediaBody");
    const source = type === "magazines" ? document.getElementById("mediaMagazines") : document.getElementById("mediaGallery");

    title.innerHTML = type === "magazines"
      ? '<i class="fas fa-newspaper"></i> Magazines & Tabloids'
      : '<i class="fas fa-images"></i> Photo Gallery';
    body.innerHTML = source ? source.innerHTML : "<p>No media found.</p>";
    modal.classList.add("active");
  };

  window.closeItqanMediaModal = function closeItqanMediaModal() {
    const modal = document.getElementById("itqanMediaModal");
    if (modal) modal.classList.remove("active");
  };

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeItqanMediaModal();
  });

  function boot() {
    upgradeHistory();
    upgradeMediaHub();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
