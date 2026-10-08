(function () {
  "use strict";

  document.documentElement.classList.add("reveal-ready");

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // sticky header shadow
  const header = document.querySelector("[data-header]");
  const toTop = document.querySelector("[data-to-top]");
  const onScroll = () => {
    const y = window.scrollY;
    if (header) {
      header.classList.toggle("is-scrolled", y > 8);
    }
    if (toTop) {
      toTop.hidden = y < 900;
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // mobile menu
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const setMenu = (open) => {
    if (!menuToggle || !mobileMenu) {
      return;
    }
    mobileMenu.hidden = !open;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
    menuToggle
      .querySelector("[data-menu-icon-open]")
      .classList.toggle("hidden", open);
    menuToggle
      .querySelector("[data-menu-icon-close]")
      .classList.toggle("hidden", !open);
  };
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      setMenu(mobileMenu.hidden);
    });
    mobileMenu.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        setMenu(false);
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !mobileMenu.hidden) {
        setMenu(false);
        menuToggle.focus();
      }
    });
    window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => {
      if (e.matches) {
        setMenu(false);
      }
    });
  }

  // active nav link while scrolling (scroll spy)
  const navLinks = document.querySelectorAll("[data-nav-link]");
  const sections = Array.from(navLinks)
    .map((link) => link.getAttribute("href").split("#")[1])
    .filter((id, i, arr) => id && arr.indexOf(id) === i)
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          const id = entry.target.id;
          navLinks.forEach((link) => {
            const active = link.getAttribute("href") === "/#" + id;
            link.classList.toggle("is-active", active);
            if (active) {
              link.setAttribute("aria-current", "true");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((section) => {
      spy.observe(section);
    });
  }

  // reveal on scroll
  const revealItems = document.querySelectorAll("[data-reveal]");
  if (!reduceMotion && "IntersectionObserver" in window) {
    const reveal = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    revealItems.forEach((item) => {
      // stagger siblings in grids/lists
      const parent = item.parentElement;
      const siblings = Array.from(parent.children).filter((el) =>
        el.hasAttribute("data-reveal")
      );
      const index = siblings.indexOf(item);
      if (index > 0) {
        item.style.setProperty("--reveal-delay", Math.min(index, 5) * 70 + "ms");
      }
      reveal.observe(item);
    });
  } else {
    revealItems.forEach((item) => {
      item.classList.add("is-visible");
    });
  }

  // portfolio filter
  const gallery = document.querySelector("[data-gallery]");
  const filterGroup = document.querySelector("[data-gallery-filter]");
  const galleryStatus = document.querySelector("[data-gallery-status]");
  const galleryItems = Array.from(
    document.querySelectorAll("[data-gallery] .gallery-item")
  );

  if (filterGroup && gallery) {
    filterGroup.addEventListener("click", (e) => {
      const button = e.target.closest("[data-filter]");
      if (!button) {
        return;
      }
      const filter = button.dataset.filter;

      filterGroup.querySelectorAll("[data-filter]").forEach((btn) => {
        btn.setAttribute("aria-pressed", String(btn === button));
      });

      let visible = 0;
      galleryItems.forEach((item) => {
        const show = filter === "all" || item.dataset.category === filter;
        item.hidden = !show;
        item.classList.remove("is-entering");
        if (show) {
          visible += 1;
          if (!reduceMotion) {
            // restart the entrance animation
            void item.offsetWidth;
            item.classList.add("is-entering");
          }
        }
      });

      if (galleryStatus) {
        galleryStatus.textContent =
          "Menampilkan " + visible + " foto " + button.textContent.trim();
      }
    });
  }

  // lightbox
  const dialog = document.querySelector("[data-lightbox-dialog]");
  if (dialog && typeof dialog.showModal === "function" && gallery) {
    const img = dialog.querySelector("[data-lightbox-img]");
    const caption = dialog.querySelector("[data-lightbox-caption]");
    const counter = dialog.querySelector("[data-lightbox-counter]");
    let current = [];
    let index = 0;
    let opener = null;

    const show = (i) => {
      index = (i + current.length) % current.length;
      const link = current[index];
      img.src = link.getAttribute("href");
      img.alt = link.dataset.caption || "";
      img.width = Number(link.dataset.width) || 1280;
      img.height = Number(link.dataset.height) || 1920;
      caption.textContent = link.dataset.caption || "";
      counter.textContent = index + 1 + " / " + current.length;

      // preload neighbours for snappy navigation
      [index - 1, index + 1].forEach((n) => {
        const neighbour = current[(n + current.length) % current.length];
        if (neighbour) {
          new Image().src = neighbour.getAttribute("href");
        }
      });
    };

    gallery.addEventListener("click", (e) => {
      const link = e.target.closest("[data-lightbox]");
      if (!link) {
        return;
      }
      e.preventDefault();
      current = Array.from(gallery.querySelectorAll("[data-lightbox]")).filter(
        (a) => !a.closest(".gallery-item").hidden
      );
      opener = link;
      show(current.indexOf(link));
      dialog.showModal();
    });

    dialog
      .querySelector("[data-lightbox-prev]")
      .addEventListener("click", () => {
        show(index - 1);
      });
    dialog
      .querySelector("[data-lightbox-next]")
      .addEventListener("click", () => {
        show(index + 1);
      });
    dialog
      .querySelector("[data-lightbox-close]")
      .addEventListener("click", () => {
        dialog.close();
      });

    dialog.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        show(index - 1);
      }
      if (e.key === "ArrowRight") {
        show(index + 1);
      }
    });

    // click on the dark area closes
    dialog.addEventListener("click", (e) => {
      if (
        e.target === dialog ||
        e.target.classList.contains("lightbox-inner")
      ) {
        dialog.close();
      }
    });

    dialog.addEventListener("close", () => {
      img.removeAttribute("src");
      if (opener) {
        opener.focus();
      }
    });

    // swipe on touch devices
    let touchX = null;
    dialog.addEventListener(
      "touchstart",
      (e) => {
        touchX = e.touches[0].clientX;
      },
      { passive: true }
    );
    dialog.addEventListener(
      "touchend",
      (e) => {
        if (touchX === null) {
          return;
        }
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) {
          show(dx > 0 ? index - 1 : index + 1);
        }
        touchX = null;
      },
      { passive: true }
    );
  }

  // keep the copyright year current
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  // whatsapp click tracking (works when GA4 / Meta Pixel is added later)
  document.addEventListener("click", (e) => {
    const cta = e.target.closest("[data-wa-cta]");
    if (!cta) {
      return;
    }
    const location = cta.dataset.waCta;
    if (typeof window.gtag === "function") {
      window.gtag("event", "whatsapp_click", { cta_location: location });
    }
    if (typeof window.fbq === "function") {
      window.fbq("track", "Contact", { cta_location: location });
    }
  });
})();
