    const stamp = Date.now();
    const name = slug(file.name);
    const ref = storage.ref(`${folder}/${stamp}-${name}`);
    const task = await ref.put(file, { contentType: file.type });
    return task.ref.getDownloadURL();
  }

  function setBusy(selector, busy, text) {
    const button = document.querySelector(selector);
    if (!button) return;
    if (busy) {
      button.dataset.oldText = button.innerHTML;
      button.disabled = true;
      button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
    } else {
      button.disabled = false;
      if (button.dataset.oldText) button.innerHTML = button.dataset.oldText;
    }
  }

  function installUploadFields() {
    setLabelText("galImageUrl", "Upload Image *");
    replaceUrlInput("galImageUrl", "Upload gallery image", "image/*");

    setLabelText("magCover", "Upload Cover Image *");
    replaceUrlInput("magCover", "Upload magazine cover", "image/*");

    setLabelText("magPdfUrl", "Upload PDF / File");
    replaceUrlInput("magPdfUrl", "Upload publication file", "application/pdf,image/*");
  }

  async function addGalleryUploadItem() {
    const file = document.getElementById("galImageUrl")?.files?.[0];
    const cap = document.getElementById("galCaption")?.value.trim() || "";

    try {
      setBusy("#addGalleryForm .btn", true, "Uploading...");
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
      console.error("Gallery upload failed:", e);
      showToast(e.message || e.code || "Upload failed.", "error");
    } finally {
      setBusy("#addGalleryForm .btn", false);
    }
  }

  async function addMagazineUploadItem() {
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
      setBusy("#addMagForm .btn", true, "Uploading...");
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
      console.error("Publication upload failed:", e);
      showToast(e.message || e.code || "Upload failed.", "error");
    } finally {
      setBusy("#addMagForm .btn", false);
    }
  }

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
    window.addGalleryItem = addGalleryUploadItem;
    window.addMagItem = addMagazineUploadItem;

    const galleryButton = document.querySelector("#addGalleryForm .btn");
    if (galleryButton) {
      galleryButton.onclick = addGalleryUploadItem;
    }

    const magButton = document.querySelector("#addMagForm .btn");
    if (magButton) {
      magButton.onclick = addMagazineUploadItem;
    }

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
