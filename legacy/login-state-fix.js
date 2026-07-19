/*
  ITQAN login display safety patch.
  Include after the main page script. It keeps the header in sync even when
  the Firestore user profile is missing or blocked by rules.
*/
(function () {
  if (!window.firebase || !firebase.auth) {
    console.error("Firebase Auth is not loaded.");
    return;
  }

  function initials(name) {
    return String(name || "User")
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function usernameFromUser(user) {
    return (user.email || "").replace("@itqan.org", "") || "user";
  }

  function setLoggedOutHeader() {
    const authArea = document.getElementById("authArea");
    if (!authArea) return;
    authArea.innerHTML = `<button class="auth-btn auth-btn-login" onclick="openAuthModal('login')">Login</button><button class="auth-btn auth-btn-register" onclick="openAuthModal('register')">Register</button>`;
  }

  function setLoggedInHeader(data) {
    const authArea = document.getElementById("authArea");
    if (!authArea) return;
    const firstName = String(data.name || data.username || "Account").split(" ")[0];
    authArea.innerHTML = `<button class="auth-user-btn" onclick="openDashboard()"><div class="avatar-sm">${initials(data.name || data.username)}</div>${firstName}</button>`;
  }

  async function readUserProfile(user) {
    const username = usernameFromUser(user);
    const fallback = {
      name: username,
      username,
      email: user.email || `${username}@itqan.org`,
      role: "member",
      wing: "General",
      hasAuth: true,
    };

    if (typeof db === "undefined") return fallback;

    try {
      const userRef = db.collection("users").doc(user.uid);
      const doc = await userRef.get();
      if (doc.exists) return { ...fallback, ...doc.data(), hasAuth: true };

      const query = await db.collection("users").where("username", "==", username).limit(1).get();
      if (!query.empty) {
        const linkedProfile = { ...fallback, ...query.docs[0].data(), hasAuth: true };
        await userRef.set(linkedProfile, { merge: true });
        return linkedProfile;
      }

      const adminQuery = await db.collection("users").where("role", "==", "admin").limit(1).get();
      const firstAdminProfile = {
        ...fallback,
        name: fallback.name.charAt(0).toUpperCase() + fallback.name.slice(1),
        role: adminQuery.empty ? "admin" : "member",
        wing: adminQuery.empty ? "All" : "General",
        hasAuth: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      await userRef.set(firstAdminProfile, { merge: true });
      if (adminQuery.empty && typeof showToast === "function") {
        showToast("First logged-in user is now Admin.", "success");
      }

      return firstAdminProfile;
    } catch (error) {
      console.error("Could not read user profile:", error);
      if (typeof showToast === "function") {
        showToast("Logged in, but profile data could not be loaded.", "info");
      }
    }

    return fallback;
  }

  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      try {
        currentUserData = null;
      } catch (error) {}
      setLoggedOutHeader();
      return;
    }

    const data = await readUserProfile(user);
    try {
      currentUserData = data;
    } catch (error) {}
    setLoggedInHeader(data);
  });
})();
