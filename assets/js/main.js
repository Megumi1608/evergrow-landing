(() => {
  let storedMotion = null;
  try { storedMotion = window.localStorage.getItem("evergrow-motion"); } catch (error) { storedMotion = null; }
  const reduceMotion = storedMotion ? storedMotion === "off" : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const motionToggle = document.getElementById("motionToggle");
  if (motionToggle) {
    motionToggle.textContent = `Chuyển động: ${reduceMotion ? "tắt" : "bật"}`;
    motionToggle.setAttribute("aria-pressed", String(!reduceMotion));
    motionToggle.addEventListener("click", () => {
      try { window.localStorage.setItem("evergrow-motion", reduceMotion ? "on" : "off"); } catch (error) {}
      window.location.reload();
    });
  }
  const hasGsap = Boolean(window.gsap && window.ScrollTrigger);
  const head = document.getElementById("siteHead");
  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  /* Header */
  /* Mobile menu */
  let menuOpen = false;
  function setMenu(open, restoreFocus = true) {
    menuOpen = open;
    mobileMenu.classList.toggle("is-open", open);
    menuBtn.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
    mobileMenu.setAttribute("aria-hidden", String(!open));
    head.classList.toggle("is-menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    mobileMenu.inert = !open;
    if (open) {
      window.setTimeout(() => mobileMenu.querySelector("a").focus(), 60);
    } else if (restoreFocus) {
      menuBtn.focus();
    }
  }
  mobileMenu.inert = true;
  menuBtn.addEventListener("click", () => setMenu(!menuOpen));
  mobileMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false, false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOpen) setMenu(false);
  });

  function scrollToTarget(target) {
    if (!target) return;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    if (link.classList.contains("skip")) return;
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      scrollToTarget(target);
      if (window.history && history.pushState) history.pushState(null, "", href);
    });
  });

  /* Service rows prefill the quote note */
  const noteField = document.getElementById("note");
  document.querySelectorAll("[data-service]").forEach((link) => {
    link.addEventListener("click", () => {
      if (!noteField) return;
      const line = `Cần báo giá: ${link.dataset.service}.`;
      if (!noteField.value.includes(line)) {
        noteField.value = `${line}\n${noteField.value}`.trim();
      }
    });
  });

  /* Route finder */
  const origins = {
    hp: { label: "Hải Phòng", mode: "sea" },
    cm: { label: "Cái Mép", mode: "sea" },
    cl: { label: "Cát Lái", mode: "sea" },
    nb: { label: "Nội Bài", mode: "air" },
    tsn: { label: "Tân Sơn Nhất", mode: "air" },
    hn: { label: "Hữu Nghị", mode: "road" }
  };

  const destinations = {
    cn: { label: "Trung Quốc", port: "Thượng Hải", time: { sea: "5–8 ngày", air: "1–2 ngày", road: "2–4 ngày" } },
    asean: { label: "ASEAN", port: "Singapore", time: { sea: "5–10 ngày", air: "1–3 ngày", road: "3–7 ngày" } },
    jp: { label: "Nhật Bản", port: "Tokyo", time: { sea: "6–10 ngày", air: "1–2 ngày", road: "Không áp dụng" } },
    kr: { label: "Hàn Quốc", port: "Busan", time: { sea: "5–9 ngày", air: "1–2 ngày", road: "Không áp dụng" } },
    eu: { label: "EU", port: "Rotterdam", time: { sea: "30–38 ngày", air: "2–4 ngày", road: "Không áp dụng" } },
    us: { label: "Hoa Kỳ", port: "Los Angeles", time: { sea: "24–40 ngày", air: "2–4 ngày", road: "Không áp dụng" } },
    me: { label: "Trung Đông", port: "Jebel Ali", time: { sea: "16–24 ngày", air: "2–4 ngày", road: "Không áp dụng" } },
    au: { label: "Úc", port: "Sydney", time: { sea: "14–22 ngày", air: "2–4 ngày", road: "Không áp dụng" } }
  };

  const commodityLabels = {
    electronics: "Điện tử",
    garment: "Dệt may",
    agri: "Nông sản",
    machinery: "Máy móc"
  };

  const reasons = {
    air: "Hàng gấp hoặc giá trị cao nên đi hàng không. Evergrow giữ chỗ theo chuyến bay và khai trước khi hàng đến sân bay.",
    road: "Đường bộ qua cửa khẩu phù hợp hàng đi Trung Quốc và ASEAN. Kiểm tra loại hàng và giấy phép trước khi đóng xe.",
    roadsea: "Hàng đi đường bộ sang Trung Quốc rồi chuyển tàu tại cảng đầu tiên. Evergrow ghép hai chặng dưới một booking.",
    sea: "Đường biển phù hợp lô hàng lớn và không gấp. Evergrow giữ chỗ FCL hoặc ghép LCL tại cảng khởi hành."
  };

  const cargoNotes = {
    electronics: "Hàng điện tử cần đóng gói chống ẩm và kiểm tra chứng nhận hợp quy nếu có.",
    garment: "Hàng dệt may cần đối chiếu số lượng, mã HS và nhãn xuất xứ trước khi khai.",
    agri: "Nông sản cần kiểm dịch thực vật và điều kiện nhiệt độ phù hợp; Evergrow xác nhận với hãng trước khi đặt chỗ.",
    machinery: "Máy móc có thể cần flat rack hoặc open top nếu vượt kích thước container."
  };

  const modeLabels = {
    sea: "Đường biển · FCL",
    air: "Hàng không · AWB",
    road: "Đường bộ · xe tải",
    roadsea: "Đường bộ + đường biển"
  };

  const state = { commodity: "electronics", origin: "hp", destination: "eu" };
  const result = document.getElementById("result");
  const resultMode = document.getElementById("resultMode");
  const resultTime = document.getElementById("resultTime");
  const resultWhy = document.getElementById("resultWhy");
  const resultDocs = document.getElementById("resultDocs");
  const routeOrigin = document.getElementById("routeOrigin");
  const routeDest = document.getElementById("routeDest");
  const originSelect = document.getElementById("origin");
  const destinationSelect = document.getElementById("destination");
  const commodityButtons = document.querySelectorAll("[data-commodity]");
  const routeLine = document.getElementById("routeLine");

  function buildPlan() {
    const origin = origins[state.origin];
    const destination = destinations[state.destination];
    let mode = "sea";
    if (origin.mode === "air") mode = "air";
    if (origin.mode === "road") {
      mode = state.destination === "cn" || state.destination === "asean" ? "road" : "roadsea";
    }

    const timeKey = mode === "roadsea" ? "sea" : mode;
    let time = destination.time[timeKey];
    if (mode === "roadsea") time = `~3 ngày + ${destination.time.sea}`;

    const transportDoc = mode === "air"
      ? "Vận đơn hàng không (AWB)"
      : mode === "road"
        ? "Giấy vận chuyển đường bộ"
        : "Vận đơn (B/L)";

    const docs = ["Hóa đơn thương mại", "Packing list", transportDoc, "Tờ khai hải quan"];

    if (state.destination === "eu") docs.push("C/O EUR.1");
    if (state.destination === "cn" || state.destination === "asean") docs.push("C/O ưu đãi (nếu có)");
    if (state.destination === "us") docs.push("C/O và thông tin FDA (nếu có)");
    if (state.commodity === "agri") docs.push("Giấy kiểm dịch thực vật");
    if (state.commodity === "electronics") docs.push("Chứng nhận hợp quy (nếu có)");
    if (state.commodity === "machinery") docs.push("Catalogue và thông số kỹ thuật");

    return {
      origin,
      destination,
      mode,
      time,
      docs: docs.slice(0, 6),
      why: `${reasons[mode]} ${cargoNotes[state.commodity]}`
    };
  }

  let lastPlan = null;

  function renderPlan(animate) {
    const plan = buildPlan();
    resultMode.textContent = modeLabels[plan.mode];
    resultTime.textContent = plan.time;
    resultWhy.textContent = plan.why;
    routeOrigin.textContent = plan.origin.label;
    routeDest.textContent = `${plan.destination.port}, ${plan.destination.label}`;
    resultDocs.replaceChildren(...plan.docs.map((doc) => {
      const li = document.createElement("li");
      li.textContent = doc;
      return li;
    }));

    if (animate && hasGsap && !reduceMotion) {
      gsap.fromTo(result, { opacity: 0.55, y: 7 }, { opacity: 1, y: 0, duration: 0.34, ease: "power2.out" });
      if (routeLine) {
        const length = routeLine.getTotalLength();
        routeLine.style.strokeDasharray = String(length);
        routeLine.style.strokeDashoffset = String(length);
        gsap.to(routeLine, { strokeDashoffset: 0, duration: 0.7, ease: "power3.out", clearProps: "strokeDasharray,strokeDashoffset" });
      }
    }
    lastPlan = plan;
  }

  commodityButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.commodity = button.dataset.commodity;
      commodityButtons.forEach((other) => {
        const active = other === button;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-pressed", String(active));
      });
      renderPlan(true);
    });
  });

  originSelect.addEventListener("change", () => {
    state.origin = originSelect.value;
    renderPlan(true);
  });
  destinationSelect.addEventListener("change", () => {
    state.destination = destinationSelect.value;
    renderPlan(true);
  });

  renderPlan(false);

  /* Send the chosen route into the quote form */
  const routeField = document.getElementById("route");
  const cargoSelect = document.getElementById("cargo");
  const formStatus = document.getElementById("formStatus");
  document.getElementById("useRoute").addEventListener("click", () => {
    if (!lastPlan) renderPlan(false);
    routeField.value = `${lastPlan.origin.label} → ${lastPlan.destination.port}, ${lastPlan.destination.label}`;
    if (cargoSelect) cargoSelect.value = state.commodity;
    if (formStatus) formStatus.textContent = "Đã điền tuyến. Kiểm tra thông tin và gửi yêu cầu.";
    scrollToTarget(document.getElementById("lien-he"));
    window.setTimeout(() => routeField.focus({ preventScroll: true }), reduceMotion ? 0 : 650);
  });

  /* Quote form: opens the visitor's mail client with the message filled in */
  const quoteForm = document.getElementById("quoteForm");
  quoteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(quoteForm);
    const lines = [
      `Tên: ${data.get("name") || ""}`,
      `Công ty: ${data.get("company") || ""}`,
      `Email: ${data.get("email") || ""}`,
      `Điện thoại: ${data.get("phone") || ""}`,
      `Tuyến: ${data.get("route") || ""}`,
      `Loại hàng: ${commodityLabels[data.get("cargo")] || data.get("cargo") || ""}`,
      "",
      "Ghi chú:",
      data.get("note") || ""
    ];
    const subject = `Yêu cầu báo giá: ${data.get("route") || "tuyến mới"}`;
    const href = `mailto:hello@evergrow.vn?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
    formStatus.textContent = "Đang mở ứng dụng email của bạn…";
    window.location.href = href;
    window.setTimeout(() => {
      formStatus.textContent = "Nếu ứng dụng email không mở, viết trực tiếp tới hello@evergrow.vn.";
    }, 1400);
  });

  /* Ship sailing the Đi → Đến route: viewBox is 1200x80, stretched to the box */
  const routePath = document.querySelector(".showcase__routePath");
  const routeShip = document.getElementById("routeShip");
  const routeBox = document.querySelector(".showcase__route");
  const routeLength = routePath ? routePath.getTotalLength() : 0;
  let shipScaleX = 1;
  let shipScaleY = 1;
  let shipProgress = 0;

  const measureRoute = () => {
    if (!routeBox) return;
    const rect = routeBox.getBoundingClientRect();
    shipScaleX = rect.width / 1200;
    shipScaleY = rect.height / 80;
  };

  const placeShip = (progress) => {
    if (!routePath || !routeShip) return;
    shipProgress = Math.min(1, Math.max(0, progress));
    const point = routePath.getPointAtLength(routeLength * shipProgress);
    const ahead = routePath.getPointAtLength(Math.min(routeLength, routeLength * shipProgress + 6));
    const angle = (Math.atan2((ahead.y - point.y) * shipScaleY, (ahead.x - point.x) * shipScaleX) * 180) / Math.PI;
    routeShip.style.setProperty("--ship-x", `${point.x * shipScaleX}px`);
    routeShip.style.setProperty("--ship-y", `${point.y * shipScaleY}px`);
    routeShip.style.setProperty("--ship-rot", `${angle}deg`);
    routeShip.style.opacity = "1";
  };

  if (routePath && routeShip) {
    measureRoute();
    placeShip(0);
    window.addEventListener("resize", () => {
      measureRoute();
      placeShip(shipProgress);
    });
    window.addEventListener("load", () => {
      measureRoute();
      placeShip(shipProgress);
    });
  }

  /* Motion */
  if (hasGsap && !reduceMotion) {
    gsap.registerPlugin(ScrollTrigger);

    const splitHeading = (heading) => {
      if (heading.dataset.split === "true") return [];
      const words = heading.textContent.trim().split(/\s+/);
      heading.innerHTML = words
        .map((word) => `<span class="split-word"><span class="split-word__inner">${word}</span></span>`)
        .join(" ");
      heading.dataset.split = "true";
      return heading.querySelectorAll(".split-word__inner");
    };

    document.querySelectorAll("h2, .step__title").forEach((heading) => {
      const words = splitHeading(heading);
      if (!words.length) return;
      gsap.from(words, {
        yPercent: 115,
        duration: 0.75,
        stagger: 0.03,
        ease: "expo.out",
        scrollTrigger: { trigger: heading, start: "top 88%", once: true }
      });
    });

    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
    intro
      .from(".brand, .nav a, .head-cta, .menu-btn", { y: -14, opacity: 0, duration: 0.7, stagger: 0.05 }, 0)
      .from(".hero__title", { y: 48, opacity: 0, duration: 1.2 }, 0.15)
      .from(".hero__lead", { y: 20, opacity: 0, duration: 0.85 }, 0.95)
      .from(".hero__scroll", { opacity: 0, duration: 0.6 }, 1.2);

    gsap.to(".hero__title", {
      yPercent: -16,
      scale: 0.96,
      ease: "none",
      immediateRender: false,
      scrollTrigger: { start: 0, end: () => window.innerHeight, scrub: 0.6 }
    });
    gsap.to(".hero__lead, .hero__scroll", {
      y: -24,
      opacity: 0,
      ease: "none",
      immediateRender: false,
      scrollTrigger: { start: 0, end: () => window.innerHeight, scrub: 0.6 }
    });

    const drift = document.querySelector(".js-drift img");
    if (drift) {
      gsap.fromTo(drift, { yPercent: -5, scale: 1.12 }, {
        yPercent: 5,
        scale: 1.12,
        ease: "none",
        scrollTrigger: { trigger: ".js-drift", start: "top bottom", end: "bottom top", scrub: 0.6 }
      });
      gsap.fromTo(".js-drift .figure__frame", { clipPath: "inset(10% 0 10% 0)" }, {
        clipPath: "inset(0% 0 0% 0)",
        duration: 1.3,
        ease: "expo.out",
        scrollTrigger: { trigger: ".js-drift", start: "top 82%", once: true }
      });
    }

    document.querySelectorAll(".figure__frame img").forEach((image) => {
      if (image.closest(".js-drift")) return;
      gsap.from(image, {
        scale: 1.06,
        duration: 1.2,
        ease: "expo.out",
        clearProps: "transform",
        scrollTrigger: { trigger: image.closest("figure"), start: "top 85%", once: true }
      });
    });

    document.querySelectorAll(".figure__cap").forEach((caption) => {
      gsap.from(caption, {
        y: 14,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: caption, start: "top 92%", once: true }
      });
    });

    const slideIn = (selector, trigger) => {
      const items = gsap.utils.toArray(selector);
      if (!items.length) return;
      gsap.from(items, {
        x: -22,
        opacity: 0.4,
        duration: 0.9,
        stagger: 0.08,
        ease: "expo.out",
        scrollTrigger: { trigger, start: "top 82%", once: true }
      });
    };
    slideIn(".service-list > li", ".service-list");
    slideIn(".steps > li", ".steps");

    gsap.from(".gateway-gallery figure", {
      clipPath: "inset(0 0 20% 0)",
      duration: 1.05,
      stagger: 0.1,
      ease: "expo.out",
      scrollTrigger: { trigger: ".gateway-gallery", start: "top 85%", once: true }
    });
    gsap.from(".gateway-gallery img", {
      scale: 1.12,
      duration: 1.2,
      stagger: 0.09,
      ease: "expo.out",
      clearProps: "transform",
      scrollTrigger: { trigger: ".gateway-gallery", start: "top 85%", once: true }
    });

    if (routePath) {
      const pinStage = window.matchMedia("(min-width: 901px)").matches;
      gsap.set(routePath, { strokeDasharray: routeLength, strokeDashoffset: routeLength });
      gsap.set(".showcase__leaf", { opacity: 0, scale: 0.35, transformOrigin: "center" });
      const routeTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".showcase__stage",
          start: pinStage ? "top 22%" : "top 82%",
          end: pinStage ? "+=70%" : "bottom 18%",
          scrub: 0.6,
          pin: pinStage,
          anticipatePin: 1
        }
      });
      routeTimeline
        .to(routePath, { strokeDashoffset: 0, ease: "none", duration: 1 })
        .to(".showcase__leaf", { opacity: 1, scale: 1, duration: 0.02, ease: "power2.out" }, 0.98);
      if (routeShip) {
        const updateShip = () => {
          const progress = routeTimeline.scrollTrigger ? routeTimeline.scrollTrigger.progress : 0;
          // stop short of the end so the arrival leaf stays readable beside the hull
          placeShip(progress * 0.95);
        };
        routeTimeline.eventCallback("onUpdate", updateShip);
        updateShip();
      }
    }

    document.querySelectorAll(".qa").forEach((item) => {
      gsap.from(item, {
        y: 18,
        opacity: 0.55,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: item, start: "top 92%", once: true }
      });
    });

    gsap.from(".contact__info", {
      y: 26,
      opacity: 0.4,
      duration: 0.9,
      ease: "expo.out",
      scrollTrigger: { trigger: ".contact__grid", start: "top 85%", once: true }
    });
    gsap.from(".quote", {
      y: 40,
      opacity: 0.5,
      duration: 1,
      ease: "expo.out",
      scrollTrigger: { trigger: ".contact__grid", start: "top 85%", once: true }
    });

    gsap.from(".footer__word", {
      yPercent: 22,
      scale: 0.94,
      opacity: 0.35,
      duration: 1.15,
      ease: "expo.out",
      scrollTrigger: { trigger: ".footer", start: "top 78%", once: true }
    });

    document.querySelectorAll("[data-reveal]").forEach((element) => {
      gsap.from(element, {
        y: 26,
        opacity: 0.45,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: { trigger: element, start: "top 88%", once: true }
      });
    });

    document.querySelectorAll("[data-reveal-group]").forEach((group) => {
      const items = group.querySelectorAll(":scope > [data-reveal-item]:not(h2)");
      if (!items.length) return;
      gsap.from(items, {
        y: 24,
        opacity: 0.45,
        duration: 0.78,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: { trigger: group, start: "top 88%", once: true }
      });
    });

    window.addEventListener("load", () => ScrollTrigger.refresh());
    window.setTimeout(() => ScrollTrigger.refresh(), 1000);
  }
})();
