(function () {
  const BACKEND =
    typeof API_BASE_URL !== "undefined"
      ? API_BASE_URL
      : "https://itqan-backend.onrender.com";

  function toast(message, type = "success") {
    if (typeof showToast === "function") {
      showToast(message, type);
    } else {
      alert(message);
    }
  }

  function esc(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function getBackendMagazines() {
    const response = await fetch(`${BACKEND}/magazines`);
    if (!response.ok) {
      throw new Error(`Backend magazines failed: ${response.status}`);
    }
    const data = await response.json();
    return (data || []).map((item) => ({
      ...item,
      _source: item.storage || "google-drive",
    }));
  }

  async function getFirestoreMagazinesFallback() {
    if (typeof db === "undefined") return [];

    try {
      const snap = await db.collection("magazines").orderBy("createdAt", "desc").get();
      const items = [];
      snap.forEach((doc) => {
        const item = doc.data() || {};
        items.push({
          id: doc.id,
          title: item.title || "Untitled",
          type: item.type || "magazine",
          description: item.description || "",
          coverUrl: item.coverUrl || item.imageUrl || "",
          pdfUrl: item.pdfUrl || "",
          _source: "firebase-fallback",
        });
      });
      return items;
    } catch (error) {
      console.warn("Firestore fallback failed:", error);
      return [];
    }
  }

  window.getPersistentMagazineItems = async function getPersistentMagazineItems() {
    let backendItems = [];
    let firebaseItems = [];

    try {
      backendItems = await getBackendMagazines();
    } catch (error) {
      console.error("Backend magazine load failed:", error);
    }

    firebaseItems = await getFirestoreMagazinesFallback();

    const seen = new Set();
    return [...backendItems, ...firebaseItems].filter((item) => {
      const key = `${item.title || ""}|${item.coverUrl || ""}|${item.pdfUrl || ""}`;
      if (!item.title || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  window.loadPublicMags = async function loadPublicMags() {
    try {
      const magazines = await window.getPersistentMagazineItems();

      const grid = document.getElementById("publicMagGrid");
      const empty = document.getElementById("magazinesEmpty");

      if (!magazines.length) {
        if (empty) empty.style.display = "block";
        if (grid) grid.innerHTML = "";
        return;
      }

      if (empty) empty.style.display = "none";

      if (grid) {
        grid.innerHTML = magazines
          .map(
            (mag) => `
              <div class="mag-card">
                <img class="mag-cover" src="${mag.coverUrl || "logo.png"}" alt="${esc(
              mag.title
            )}" loading="lazy" onerror="this.src='logo.png'">
                <div class="mag-body">
                  <span class="mag-badge ${esc(mag.type || "magazine")}">
                    ${mag.type === "tabloid" ? "Tabloid" : "Magazine"}
                  </span>
                  <h3>${esc(mag.title)}</h3>
                  <p>${esc(mag.description || "")}</p>
                  ${
                    mag.pdfUrl
                      ? `<button class="btn btn-cyan btn-sm" onclick="window.open('${mag.pdfUrl}', '_blank')">Read Now</button>`
                      : `<button class="btn btn-outline btn-sm" disabled>No PDF</button>`
                  }
                </div>
              </div>
            `
          )
          .join("");
      }
    } catch (error) {
      console.error("Load publications failed:", error);
    }
  };

  window.loadAdminMags = async function loadAdminMags() {
    try {
      const magazines = await window.getPersistentMagazineItems();
      const list = document.getElementById("adminMagList");
      if (!list) return;

      if (!magazines.length) {
        list.innerHTML =
          '<p style="color:var(--muted);font-size:.88rem">No publications yet.</p>';
        return;
      }

      list.innerHTML = magazines
        .map(
          (mag) => `
            <div class="adm-ir">
              <div style="display:flex;align-items:center;gap:12px;min-width:0">
                <img src="${mag.coverUrl || "logo.png"}" alt="" style="width:46px;height:58px;object-fit:cover;border-radius:8px;background:var(--bg2)" onerror="this.src='logo.png'">
                <div style="min-width:0">
                  <strong>${esc(mag.title)}</strong>
                  <span style="margin-left:10px;font-size:.72rem;color:var(--muted);text-transform:capitalize">${esc(
                    mag.type || "magazine"
                  )}</span><br>
                  <small style="color:var(--muted)">
                    ${mag._source === "firebase-fallback" ? "Firebase fallback" : "Google Drive storage"}
                  </small>
                </div>
              </div>
              <button class="del-btn" onclick="deleteMagazineItem('${mag.id}')">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          `
        )
        .join("");
    } catch (error) {
      console.error("Load admin publications failed:", error);
    }
  };

  window.uploadMagazineToBackend = async function uploadMagazineToBackend() {
    const title = document.getElementById("magTitle")?.value.trim();
    const type = document.getElementById("magType")?.value || "magazine";
    const description = document.getElementById("magDesc")?.value.trim() || "";
    const coverFile = document.getElementById("magCoverFile")?.files?.[0];
    const pdfFile = document.getElementById("magPdfFile")?.files?.[0];

    if (!title) {
      toast("Please enter a title", "error");
      return;
    }

    if (!coverFile) {
      toast("Please select a cover image", "error");
      return;
    }

    const progressDiv = document.getElementById("magUploadProgress");
    const progressBar = document.getElementById("magProgressBar");
    const statusText = document.getElementById("magStatus");

    if (progressDiv) progressDiv.style.display = "block";
    if (progressBar) progressBar.value = 25;
    if (statusText) {
      statusText.textContent = "Uploading publication to backend / Google Drive...";
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("type", type);
    formData.append("description", description);
    formData.append("cover", coverFile);
    if (pdfFile) formData.append("pdf", pdfFile);

    try {
      const response = await fetch(`${BACKEND}/upload-magazine`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Upload failed");
      }

      if (progressBar) progressBar.value = 100;
      if (statusText) statusText.textContent = "Saved to Google Drive!";

      toast("Publication uploaded to Google Drive successfully!", "success");

      document.getElementById("magTitle").value = "";
      document.getElementById("magDesc").value = "";
      document.getElementById("magCoverFile").value = "";
      document.getElementById("magPdfFile").value = "";

      if (progressDiv) {
        setTimeout(() => {
          progressDiv.style.display = "none";
        }, 600);
      }

      await window.loadPublicMags();
      await window.loadAdminMags();

      if (typeof loadAdminStats === "function") {
        await loadAdminStats();
      }
    } catch (error) {
      console.error("Publication upload failed:", error);
      toast("Upload failed: " + (error.message || error), "error");
      if (progressDiv) progressDiv.style.display = "none";
    }
  };

  window.deleteMagazineItem = async function deleteMagazineItem(id) {
    if (!confirm("Delete this publication?")) return;

    try {
      const response = await fetch(`${BACKEND}/delete-magazine/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Delete failed");
      }

      toast("Publication deleted", "success");

      await window.loadPublicMags();
      await window.loadAdminMags();

      if (typeof loadAdminStats === "function") {
        await loadAdminStats();
      }
    } catch (error) {
      toast("Error deleting: " + error.message, "error");
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
      if (typeof window.loadPublicMags === "function") window.loadPublicMags();
      if (typeof window.loadAdminMags === "function") window.loadAdminMags();
    }, 500);
  });

  console.log("✅ Google Drive backend magazine upload override loaded");
})();
