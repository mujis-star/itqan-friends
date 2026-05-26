/*
  ITQAN profile editor and admin profile manager.
  Include after the main page script, upload-support.js, and login-state-fix.js.
*/
(function () {
  if (!window.firebase || typeof db === "undefined") {
    console.error("Firebase/Firestore is not available for profile-tabs.js.");
    return;
  }

  const PUBLIC_COLLECTION = "publicProfiles";

  function esc(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function profileId(nameOrUsername) {
    return String(nameOrUsername || "profile")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function linesToArray(value) {
    return String(value || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function arrayToLines(value) {
    return Array.isArray(value) ? value.join("\n") : "";
  }

  function profileDocId(data) {
    return profileId(data.username || data.name || data.email);
  }

  async function publishProfile(userId, data) {
    const publicData = {
      uid: userId || "",
      name: data.name || "",
      username: data.username || "",
      role: data.role || "member",
      wing: data.wing || "General",
      details: data.details || "",
      achievements: Array.isArray(data.achievements) ? data.achievements : [],
      contact: data.contact || "",
      photoUrl: data.photoUrl || "",
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection(PUBLIC_COLLECTION).doc(profileDocId(publicData)).set(publicData, { merge: true });

    if (publicData.name) {
      await db.collection(PUBLIC_COLLECTION).doc(profileId(publicData.name)).set(publicData, { merge: true });
    }
  }

  function profileEditorHtml(data, prefix) {
    return `
      <div class="dash-sec itqan-profile-editor" style="margin-top:1.2rem">
        <h4><i class="fas fa-id-badge"></i> Profile Details</h4>
        <div class="fg">
          <label>About Me</label>
          <textarea class="fi" id="${prefix}Details" rows="4" style="resize:vertical" placeholder="Write a short profile...">${esc(data.details)}</textarea>
        </div>
        <div class="fg">
          <label>Achievements</label>
          <textarea class="fi" id="${prefix}Achievements" rows="4" style="resize:vertical" placeholder="One achievement per line">${esc(arrayToLines(data.achievements))}</textarea>
        </div>
        <div class="fg">
          <label>Contact / Social Link</label>
          <input class="fi" id="${prefix}Contact" value="${esc(data.contact)}" placeholder="@username or link">
        </div>
        <div class="fg">
          <label>Profile Photo URL</label>
          <input class="fi" id="${prefix}Photo" value="${esc(data.photoUrl)}" placeholder="https://...">
        </div>
        <button class="btn btn-cyan btn-sm" onclick="saveMyProfile()"><i class="fas fa-save"></i> Save Profile</button>
      </div>
    `;
  }

  window.saveMyProfile = async function saveMyProfile() {
    if (!auth.currentUser || !currentUserData) {
      showToast("Please log in first.", "error");
      return;
    }

    const updates = {
      details: document.getElementById("myProfileDetails").value.trim(),
      achievements: linesToArray(document.getElementById("myProfileAchievements").value),
      contact: document.getElementById("myProfileContact").value.trim(),
      photoUrl: document.getElementById("myProfilePhoto").value.trim(),
    };

    try {
      await db.collection("users").doc(auth.currentUser.uid).set(updates, { merge: true });
      currentUserData = { ...currentUserData, ...updates };
      await publishProfile(auth.currentUser.uid, currentUserData);
      showToast("Profile saved!", "success");
    } catch (error) {
      console.error(error);
      showToast(error.message || "Could not save profile.", "error");
    }
  };

  function addProfileEditorToDashboard() {
    const body = document.getElementById("dashBody");
    if (!body || !currentUserData || body.querySelector(".itqan-profile-editor")) return;
    body.insertAdjacentHTML("beforeend", profileEditorHtml(currentUserData, "myProfile"));
  }

  const originalOpenDashboard = window.openDashboard;
  window.openDashboard = function patchedOpenDashboard() {
    if (typeof originalOpenDashboard === "function") originalOpenDashboard();
    setTimeout(addProfileEditorToDashboard, 0);
  };

  function addAdminProfileTab() {
    const tabs = document.querySelector(".admin-tabs");
    const body = document.querySelector(".admin-bd");
    if (!tabs || !body || document.getElementById("adminTabProfiles")) return;

    const btn = document.createElement("button");
    btn.className = "admin-tbtn";
    btn.innerHTML = '<i class="fas fa-id-badge"></i> Profiles';
    btn.onclick = () => showAdminProfilesTab();
    tabs.appendChild(btn);

    const panel = document.createElement("div");
    panel.className = "admin-tc";
    panel.id = "adminTabProfiles";
    panel.innerHTML = `
      <h3 style="color:var(--text);margin-bottom:1rem"><i class="fas fa-id-badge" style="color:var(--cyan);margin-right:8px"></i> Manage Profiles</h3>
      <div class="adm-il" id="adminProfileList"></div>
    `;
    body.appendChild(panel);
  }

  window.showAdminProfilesTab = async function showAdminProfilesTab() {
    document.querySelectorAll(".admin-tbtn").forEach((button) => button.classList.remove("active"));
    document.querySelectorAll(".admin-tc").forEach((panel) => panel.classList.remove("active"));
    const buttons = Array.from(document.querySelectorAll(".admin-tbtn"));
    const profileButton = buttons.find((button) => button.textContent.trim().includes("Profiles"));
    if (profileButton) profileButton.classList.add("active");
    document.getElementById("adminTabProfiles").classList.add("active");
    await renderAdminProfiles();
  };

  async function renderAdminProfiles() {
    const list = document.getElementById("adminProfileList");
    if (!list) return;
    list.innerHTML = '<div class="mag-empty"><i class="fas fa-spinner fa-spin"></i><p>Loading profiles...</p></div>';

    try {
      const snap = await db.collection("users").orderBy("name").get();
      if (snap.empty) {
        list.innerHTML = '<div class="mag-empty"><i class="fas fa-user-slash"></i><p>No users found.</p></div>';
        return;
      }

      list.innerHTML = "";
      snap.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        list.insertAdjacentHTML(
          "beforeend",
          `<div class="adm-ir">
            <div class="adm-ii">
              <h4>${esc(data.name || data.username || "Unnamed")}</h4>
              <p>${esc(data.role || "member")} · ${esc(data.wing || "General")}</p>
            </div>
            <div class="adm-ia">
              <button class="btn btn-sm btn-cyan" onclick="editAdminProfile('${esc(doc.id)}')"><i class="fas fa-edit"></i> Edit</button>
            </div>
          </div>`
        );
      });
    } catch (error) {
      console.error(error);
      list.innerHTML = `<div class="mag-empty"><i class="fas fa-exclamation-circle"></i><p>${esc(error.message || "Could not load profiles.")}</p></div>`;
    }
  }

  window.editAdminProfile = async function editAdminProfile(userId) {
    const ref = db.collection("users").doc(userId);
    const doc = await ref.get();
    if (!doc.exists) return;
    const data = { id: userId, ...doc.data() };

    const details = prompt(`About ${data.name || data.username}:`, data.details || "");
    if (details === null) return;
    const achievements = prompt("Achievements, one per line:", arrayToLines(data.achievements));
    if (achievements === null) return;
    const contact = prompt("Contact / social link:", data.contact || "");
    if (contact === null) return;
    const photoUrl = prompt("Profile photo URL:", data.photoUrl || "");
    if (photoUrl === null) return;

    const updates = {
      details: details.trim(),
      achievements: linesToArray(achievements),
      contact: contact.trim(),
      photoUrl: photoUrl.trim(),
    };

    try {
      const merged = { ...data, ...updates };
      await ref.set(updates, { merge: true });
      await publishProfile(userId, merged);
      showToast("Profile updated.", "success");
      renderAdminProfiles();
    } catch (error) {
      console.error(error);
      showToast(error.message || "Could not update profile.", "error");
    }
  };

  const originalOpenAdminPanel = window.openAdminPanel;
  window.openAdminPanel = function patchedOpenAdminPanel() {
    if (typeof originalOpenAdminPanel === "function") originalOpenAdminPanel();
    setTimeout(addAdminProfileTab, 0);
  };

  async function findPublicProfile(name) {
    const direct = await db.collection(PUBLIC_COLLECTION).doc(profileId(name)).get();
    if (direct.exists) return direct.data();

    const userQuery = await db.collection("users").where("name", "==", name).limit(1).get();
    if (!userQuery.empty) return userQuery.docs[0].data();

    return null;
  }

  const originalShowProfile = window.showProfile;
  window.showProfile = async function patchedShowProfile(name, position, description, photo) {
    if (typeof originalShowProfile === "function") {
      originalShowProfile(name, position, description, photo);
    }

    try {
      const profile = await findPublicProfile(name);
      if (!profile) return;

      const modalDescription = document.getElementById("modalDescription");
      const modalDetails = document.getElementById("modalDetails");
      const modalContactInfo = document.getElementById("modalContactInfo");
      const modalPhoto = document.getElementById("modalPhoto");
      const placeholder = document.getElementById("photoPlaceholder");

      if (modalDescription && profile.details) modalDescription.textContent = profile.details;
      if (modalDetails) {
        const achievements = Array.isArray(profile.achievements) ? profile.achievements : [];
        modalDetails.innerHTML = achievements.length
          ? `<h4>Achievements</h4><ul>${achievements.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`
          : '<h4>Achievements</h4><ul><li>No achievements added yet.</li></ul>';
      }
      if (modalContactInfo) {
        modalContactInfo.innerHTML = `<h4>Contact</h4><div class="ct-item"><i class="fas fa-at"></i><span>${esc(profile.contact || "Not added yet")}</span></div>`;
      }
      if (profile.photoUrl && modalPhoto && placeholder) {
        modalPhoto.src = profile.photoUrl;
        modalPhoto.style.display = "block";
        placeholder.style.display = "none";
      }
    } catch (error) {
      console.error("Could not load public profile:", error);
    }
  };
})();
