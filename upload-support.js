/*
  ITQAN upload support
  Include this file after your existing page script, and add the
  firebase-storage-compat.js script before your page script.
*/
(function () {
  if (!window.firebase || !firebase.storage) {
    console.error("Firebase Storage is not loaded. Add firebase-storage-compat.js first.");
    return;
  }

  const storage = firebase.storage();
  const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
  const MAX_PDF_SIZE = 30 * 1024 * 1024;

  function slug(value) {
    return String(value || "file")
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function replaceUrlInput(id, label, accept) {
    const oldInput = document.getElementById(id);
    if (!oldInput) return null;

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.className = oldInput.className;
    fileInput.id = id;
    fileInput.accept = accept;
    if (oldInput.required) fileInput.required = true;
    fileInput.setAttribute("aria-label", label);
    oldInput.replaceWith(fileInput);
    return fileInput;
  }

  function setLabelText(inputId, text) {
    const input = document.getElementById(inputId);
    const label = input && input.closest(".fg") && input.closest(".fg").querySelector("label");
    if (label) label.textContent = text;
  }

  async function uploadFile(file, folder, maxSize, allowedTypes) {
    if (!file) throw new Error("Please choose a file.");
    if (file.size > maxSize) throw new Error("File is too large.");
    if (allowedTypes && !allowedTypes.some((type) => file.type.startsWith(type))) {
      throw new Error("Unsupported file type.");
    }

    const stamp = Date.now();
    const name = slug(file.name);
    const ref = storage.ref(`${folder}/${stamp}-${name}`);
    const task = await ref.put(file, { contentType: file.type });
    return task.ref.getDownloadURL();
  }

  function installUploadFields() {
    setLabelText("galImageUrl", "Upload Image *");
    replaceUrlInput("galImageUrl", "Upload gallery image", "image/*");

    setLabelText("magCover", "Upload Cover Image *");
    replaceUrlInput("magCover", "Upload magazine cover", "image/*");

    setLabelText("magPdfUrl", "Upload PDF / File");
    replaceUrlInput("magPdfUrl", "Upload publication file", "application/pdf,image/*");
  }

  window.addGalleryItem = async function addGalleryItem() {
    const file = document.getElementById("galImageUrl")?.files?.[0];
    const cap = document.getElementById("galCaption")?.value.trim() || "";

    try {
      const imageUrl = await uploadFile(file, "gallery", MAX_IMAGE_SIZE, ["image/"]);
      await db.collection("gallery").add({
        imageUrl,
        caption: cap,
        uploadedBy: currentUserData?.name || "Admin",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      document.getElementById("galImageUrl").value = "";
      document.getElementById("galCaption").value = "";
      showToast("Photo uploaded!", "success");
      loadAdminGallery();
      loadPublicGallery();
    } catch (e) {
      showToast(e.message || "Upload failed.", "error");
    }
  };

  window.addMagItem = async function addMagItem() {
    const type = document.getElementById("magType").value;
    const title = document.getElementById("magTitle").value.trim();
    const coverFile = document.getElementById("magCover")?.files?.[0];
    const pubFile = document.getElementById("magPdfUrl")?.files?.[0];
    const desc = document.getElementById("magDesc").value.trim();

    if (!title) {
      showToast("Title is required.", "error");
      return;
    }

    try {
      const coverUrl = await uploadFile(coverFile, "publication-covers", MAX_IMAGE_SIZE, ["image/"]);
      const pdfUrl = pubFile
        ? await uploadFile(pubFile, "publications", MAX_PDF_SIZE, ["application/pdf", "image/"])
        : "";

      await db.collection("magazines").add({
        type,
        title,
        coverUrl,
        pdfUrl,
        description: desc,
        uploadedBy: currentUserData?.name || "Admin",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      document.getElementById("magTitle").value = "";
      document.getElementById("magCover").value = "";
      document.getElementById("magPdfUrl").value = "";
      document.getElementById("magDesc").value = "";
      showToast("Publication uploaded!", "success");
      loadAdminMags();
      loadPublicMags();
    } catch (e) {
      showToast(e.message || "Upload failed.", "error");
    }
  };

  const originalRenderPublicGallery = window.renderPublicGallery;
  window.renderPublicGallery = function renderPublicGallery() {
    const grid = document.getElementById("publicGalleryGrid");
    const empty = document.getElementById("galleryEmpty");
    if (!grid) {
      if (typeof originalRenderPublicGallery === "function") originalRenderPublicGallery();
      return;
    }

    if (!galleryCache.length) {
      grid.innerHTML = "";
      empty.style.display = "block";
      return;
    }

    empty.style.display = "none";
    grid.innerHTML = "";
    galleryCache.forEach((item, i) => {
      grid.innerHTML += `<div class="gallery-item" onclick="openLightbox(${i})"><img src="${item.imageUrl}" alt="${item.caption || ""}" loading="lazy"><div class="gallery-ov"><h4>${item.caption || ""}</h4></div></div>`;
    });
  };

  window.openLightbox = function openLightbox(i) {
    lbIdx = i;
    if (!galleryCache.length) return;

    document.getElementById("lightboxImg").src = galleryCache[i].imageUrl;
    document.getElementById("lightboxCaption").textContent = galleryCache[i].caption || "";
    document.getElementById("lightbox").classList.add("active");

    document.querySelector(".lightbox-prev").style.display = galleryCache.length > 1 ? "flex" : "none";
    document.querySelector(".lightbox-next").style.display = galleryCache.length > 1 ? "flex" : "none";
  };

  function boot() {
    installUploadFields();
    if (typeof loadPublicGallery === "function") loadPublicGallery();
    if (typeof loadPublicMags === "function") loadPublicMags();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
