/*
  ITQAN upload support
  Include this file after your existing page script, and add the
  firebase-storage-compat.js script before your page script.
*/
(function () {
  const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
  const MAX_PDF_SIZE = 30 * 1024 * 1024;

  function getStorage() {
    if (!window.firebase || !firebase.storage) {
      throw new Error("Firebase Storage is not loaded. Add firebase-storage-compat.js before upload-support.js.");
    }

    return firebase.storage();
  }

  function slug(value) {
    return String(value || "file")
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function imageFileToDataUrl(file, maxWidth = 1600, quality = 0.78) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Could not read image file."));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("Could not load image file."));
        img.onload = () => {
          const scale = Math.min(1, maxWidth / img.width);
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          if (dataUrl.length > 950000) {
            reject(new Error("Image is too large. Please choose a smaller image."));
            return;
          }
          resolve(dataUrl);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
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

    if (file.type.startsWith("image/")) {
      return imageFileToDataUrl(file);
    }

    if (folder === "publications") {
      throw new Error("PDF upload needs Firebase Storage. For now, use an online PDF link.");
    }

    const stamp = Date.now();
    const name = slug(file.name);
    const ref = getStorage().ref(`${folder}/${stamp}-${name}`);
    const task = ref.put(file, { contentType: file.type });

    const snapshot = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        try {
          task.cancel();
        } catch (error) {}
        reject(new Error("Upload timed out. Check Firebase Storage rules and bucket setup."));
      }, 20000);

      task.on(
        "state_changed",
        (snapshot) => {
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          const galleryButton = document.querySelector("#addGalleryForm .btn");
          const magButton = document.querySelector("#addMagForm .btn");
          const activeButton = galleryButton?.disabled ? galleryButton : magButton?.disabled ? magButton : null;
          if (activeButton) activeButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading ${percent}%`;
        },
        (error) => {
          clearTimeout(timeout);
          reject(error);
        },
        () => {
          clearTimeout(timeout);
          resolve(task.snapshot);
        }
      );
    });

    return snapshot.ref.getDownloadURL();
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
