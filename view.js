/**
 * Modal & File Preview Script with dynamic GSAP
 * © 2025 wazzap.mx
 * Author: Edw. Gonzalez https://github.com/edglz
 * All rights reserved. Exclusive use of wazzap.mx and associates.
 **/

let observer = null;
let container = null;
let containerObserver = null;

// Function to dynamically load GSAP
function loadGsap() {
  return new Promise((resolve, reject) => {
    if (window.gsap) {
      resolve(window.gsap);
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
    script.onload = () => resolve(window.gsap);
    script.onerror = () => reject(new Error("Error loading GSAP"));
    document.head.appendChild(script);
  });
}

function createModal(contentElement, title = "", gsap) {
  const modalBg = document.createElement("div");
  Object.assign(modalBg.style, {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    opacity: "0",
    backdropFilter: "blur(6px)",
  });

  const modalContent = document.createElement("div");
  Object.assign(modalContent.style, {
    background: "#fff",
    borderRadius: "16px",
    maxWidth: "90vw",
    maxHeight: "85vh",
    overflow: "hidden",
    boxShadow: "0 12px 36px rgba(0,0,0,0.2)",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    opacity: "0",
    transform: "scale(0.9)",
  });

  // Header
  const modalHeader = document.createElement("div");
  Object.assign(modalHeader.style, {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #eee",
    backgroundColor: "#f5f5f5",
  });

  if (title) {
    const titleElem = document.createElement("h2");
    titleElem.textContent = title;
    Object.assign(titleElem.style, {
      margin: 0,
      fontSize: "1.25rem",
      fontWeight: "600",
      color: "#333",
      userSelect: "none",
    });
    modalHeader.appendChild(titleElem);
  } else {
    modalHeader.appendChild(document.createElement("div"));
  }

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "&times;";
  Object.assign(closeBtn.style, {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "transparent",
    color: "#555",
    fontSize: "1.8rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "color 200ms ease, background-color 200ms ease",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    lineHeight: "36px",
    padding: "0",
    userSelect: "none",
    textAlign: "center",
    transform: "translateY(-1px)",
  });
  closeBtn.title = "Close";

  if (gsap) {
    closeBtn.addEventListener("mouseenter", () => {
      gsap.to(closeBtn, {
        backgroundColor: "rgba(211,58,58,0.1)",
        color: "#d33a3a",
        scale: 1.1,
        duration: 0.2,
        ease: "power1.out",
      });
    });
    closeBtn.addEventListener("mouseleave", () => {
      gsap.to(closeBtn, {
        backgroundColor: "transparent",
        color: "#555",
        scale: 1,
        duration: 0.2,
        ease: "power1.out",
      });
    });
  } else {
    closeBtn.addEventListener("mouseenter", () => {
      closeBtn.style.color = "#d33a3a";
      closeBtn.style.backgroundColor = "rgba(211, 58, 58, 0.1)";
      closeBtn.style.transform = "scale(1.1)";
    });
    closeBtn.addEventListener("mouseleave", () => {
      closeBtn.style.color = "#555";
      closeBtn.style.backgroundColor = "transparent";
      closeBtn.style.transform = "scale(1)";
    });
  }

  closeBtn.onclick = () => {
    if (gsap) {
      gsap.to([modalBg, modalContent], {
        opacity: 0,
        scale: 0.9,
        duration: 0.3,
        ease: "power1.in",
        onComplete: () => modalBg.remove(),
      });
    } else {
      modalBg.style.opacity = "0";
      setTimeout(() => modalBg.remove(), 300);
    }
  };

  modalHeader.appendChild(closeBtn);

  const modalBody = document.createElement("div");
  Object.assign(modalBody.style, {
    padding: "1rem 1.5rem",
    overflowY: "auto",
    maxHeight: "calc(85vh - 64px)",
  });
  modalBody.appendChild(contentElement);

  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  modalBg.appendChild(modalContent);

  modalBg.onclick = (e) => {
    if (e.target === modalBg) {
      closeBtn.onclick();
    }
  };

  if (gsap) {
    gsap.to(modalBg, {
      opacity: 1,
      duration: 0.3,
      ease: "power1.out",
    });
    gsap.to(modalContent, {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: "back.out(1.7)",
    });
  } else {
    requestAnimationFrame(() => {
      modalBg.style.opacity = "1";
      modalContent.style.opacity = "1";
      modalContent.style.transform = "scale(1)";
    });
  }

  return modalBg;
}

function supportsViewTransitions() {
  return typeof document.startViewTransition === "function";
}

function addViewButton(msgSingle, attachmentLink, gsap) {
  if (msgSingle.querySelector(".btn-view-file")) return;

  const url = attachmentLink.href;
  const ext = url.split(".").pop().toLowerCase();

  if (["mp3", "oga", "wav"].includes(ext)) {
    if (!msgSingle.querySelector("audio.audio-inline-player")) {
      const audioPlayer = document.createElement("audio");
      audioPlayer.controls = true;
      audioPlayer.src = url;
      audioPlayer.className = "audio-inline-player";
      audioPlayer.style.display = "block";
      audioPlayer.style.marginTop = "8px";
      audioPlayer.style.width = "100%";
      audioPlayer.style.borderRadius = "8px";
      audioPlayer.style.boxShadow = "0 1px 5px rgba(0,0,0,0.1)";
      audioPlayer.style.transition = "opacity 400ms ease";
      audioPlayer.style.opacity = "0";

      msgSingle.appendChild(audioPlayer);

      requestAnimationFrame(() => {
        audioPlayer.style.opacity = "1";
      });
    }
    return;
  }

  const viewBtn = document.createElement("button");
  viewBtn.textContent = "View";
  viewBtn.className = "btn-view-file";
  Object.assign(viewBtn.style, {
    marginLeft: "10px",
    padding: "6px 14px",
    cursor: "pointer",
    borderRadius: "6px",
    border: "2px solid #2563eb",
    backgroundColor: "white",
    color: "#2563eb",
    fontWeight: "700",
    fontSize: "0.9rem",
    transition: "all 0.25s ease",
    userSelect: "none",
  });

  if (gsap) {
    viewBtn.addEventListener("mouseenter", () => {
      gsap.to(viewBtn, {
        backgroundColor: "#2563eb",
        color: "#fff",
        boxShadow: "0 4px 8px rgba(37, 99, 235, 0.3)",
        scale: 1.05,
        duration: 0.25,
        ease: "power1.out",
      });
    });
    viewBtn.addEventListener("mouseleave", () => {
      gsap.to(viewBtn, {
        backgroundColor: "white",
        color: "#2563eb",
        boxShadow: "none",
        scale: 1,
        duration: 0.25,
        ease: "power1.out",
      });
    });
  } else {
    viewBtn.addEventListener("mouseenter", () => {
      viewBtn.style.backgroundColor = "#2563eb";
      viewBtn.style.color = "#fff";
      viewBtn.style.boxShadow = "0 4px 8px rgba(37, 99, 235, 0.3)";
      viewBtn.style.transform = "scale(1.05)";
    });
    viewBtn.addEventListener("mouseleave", () => {
      viewBtn.style.backgroundColor = "white";
      viewBtn.style.color = "#2563eb";
      viewBtn.style.boxShadow = "none";
      viewBtn.style.transform = "scale(1)";
    });
  }

  viewBtn.onclick = async () => {
    const contentElement = document.createElement("div");
    Object.assign(contentElement.style, {
      maxWidth: "90vw",
      maxHeight: "80vh",
      borderRadius: "10px",
      overflow: "hidden",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    });

    let previewElement;

    if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
      previewElement = document.createElement("img");
      previewElement.src = url;
      Object.assign(previewElement.style, {
        maxWidth: "100%",
        maxHeight: "80vh",
        borderRadius: "10px",
        objectFit: "contain",
      });
    } else if (["mp4", "mkv", "webm"].includes(ext)) {
      previewElement = document.createElement("video");
      previewElement.controls = true;
      previewElement.src = url;
      Object.assign(previewElement.style, {
        maxWidth: "100%",
        maxHeight: "80vh",
        borderRadius: "10px",
        backgroundColor: "black",
      });
      previewElement.autoplay = true;
    } else if (ext === "pdf") {
      previewElement = document.createElement("iframe");
      previewElement.src = url;
      Object.assign(previewElement.style, {
        width: "90vw",
        height: "80vh",
        border: "none",
        borderRadius: "10px",
      });
    } else if (ext === "txt") {
      previewElement = document.createElement("pre");
      Object.assign(previewElement.style, {
        whiteSpace: "pre-wrap",
        maxHeight: "80vh",
        overflow: "auto",
        background: "#f9fafb",
        padding: "1rem",
        borderRadius: "10px",
        fontFamily: "'Source Code Pro', monospace",
        fontSize: "0.95rem",
        color: "#333",
      });

      try {
        const res = await fetch(url);
        if (res.ok) previewElement.textContent = await res.text();
        else previewElement.textContent = "Error loading text file.";
      } catch {
        previewElement.textContent = "Error loading text file.";
      }
    } else {
      previewElement = document.createElement("p");
      previewElement.textContent = "Cannot preview this file type.";
      Object.assign(previewElement.style, {
        fontStyle: "italic",
        padding: "1rem",
        color: "#666",
      });
    }

    contentElement.appendChild(previewElement);

    if (supportsViewTransitions()) {
      document.startViewTransition(() => {
        const modal = createModal(contentElement, "Preview", gsap);
        document.body.appendChild(modal);
      });
    } else {
      const modal = createModal(contentElement, "Preview", gsap);
      document.body.appendChild(modal);
    }
  };

  const attachmentContainer = attachmentLink.parentElement;
  if (attachmentContainer) {
    attachmentContainer.appendChild(viewBtn);
  }
}

function setupObserver(gsap) {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  container = document.querySelector(".messages-group-inner");
  if (!container) {
    console.warn("Could not find container .messages-group-inner");
    return;
  }
  console.log("Container found:", container);

  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && node.classList.contains("message-wrapper")) {
          const msgSingle = node.querySelector(".messages-single");
          if (msgSingle) {
            const attachmentLink = msgSingle.querySelector(
              ".sms-file-attachment"
            );
            if (attachmentLink) {
              addViewButton(msgSingle, attachmentLink, gsap);
            }
          }
        }
      });
    });
  });

  observer.observe(container, {
    childList: true,
    subtree: true,
  });

  const existingMessages = container.querySelectorAll(
    ".message-wrapper .messages-single"
  );
  existingMessages.forEach((msgSingle) => {
    const attachmentLink = msgSingle.querySelector(".sms-file-attachment");
    if (attachmentLink) {
      addViewButton(msgSingle, attachmentLink, gsap);
    }
  });

  console.log("Observer activated");
}

function setupContainerObserver(gsap) {
  if (containerObserver) {
    containerObserver.disconnect();
    containerObserver = null;
  }
  containerObserver = new MutationObserver(() => {
    setupObserver(gsap);
  });

  const body = document.body;
  container = document.querySelector(".messages-group-inner");
  if (!container) return;

  containerObserver.observe(body, {
    childList: true,
    subtree: true,
  });
}

document.body.addEventListener("click", (e) => {
  const item = e.target.closest(".messages-list--item-v2");
  if (item) {
    setupObserver(window.gsap);
  }
});

(async function () {
  console.info("[*] start load assets");
  const loadScript = () => {
    console.info("[*] start assets in timeout");
    loadGsap()
      .then((gsap) => {
        console.log("GSAP loaded, starting script with animations");
        setupObserver(gsap);
        setupContainerObserver(gsap);
      })
      .catch((err) => {
        console.warn(
          "Failed to load GSAP, running without animations:",
          err
        );
        setupObserver(null);
        setupContainerObserver(null);
      });
  };

  if (document.readyState === 'complete') {
    setTimeout(loadScript, parseFloat(window.MS));
  } else {
    window.addEventListener('load', () => {
      setTimeout(loadScript, parseFloat(window.MS));
    });
  }
})();
