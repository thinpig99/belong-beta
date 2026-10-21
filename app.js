(() => {
  "use strict";

  // ---------- Demo script ----------
  // Each step: what belong says, then the suggested user reply (used by the mic button).
  const SCRIPT = [
    {
      agent: [
        "Hi. I'm belong, your social discovery agent. By getting to know your personality and preferences, I'll suggest the most compatible people and activities in London for you.\nI'm curious—if it were a soft rainy evening in London, would you find yourself more drawn to a bustling pub filled with overlapping conversations, or a quiet living room where only the sound of rain reaches the windows?"
      ],
      suggest: "hi belong, i am wyatt, nice to meet you. well, i would say.. prefer my quiet living room"
    },
    {
      agent: [
        "That's insightful. People with that preference often value meaningful connection over small talk. How do you usually like to spend your weekends in London—among familiar faces or discovering new corners alone?"
      ],
      suggest: "i would like to discover a new corners alone"
    },
    {
      agent: [
        "I love that. One more: when you step into a new corner of the city, what catches your attention first—the **design of the space**, the **music** playing, or the **people** around you?"
      ],
      suggest: "the design and the music, definitely. i really love old vinyl records"
    },
    {
      agent: [
        "{name}I'm starting to see you clearly. You're drawn to **quiet depth**, **thoughtfully designed spaces**, and **analog sound**—and you'd rather share a few real conversations than many loud ones.\nA small, intimate gathering around a shared passion would suit you far better than a crowded event. Shall I arrange an activity and a group for you?"
      ],
      suggest: "okay please arrange a activity and group."
    },
    {
      agent: [
        "Wonderful. I'll design a meeting for you. Which **area** in London do you prefer, and what **time** usually works best for you?"
      ],
      suggest: "mayfair or kensington area would be better, and from saturday afternoon to night would be good"
    },
    {
      agent: ["Perfect. One moment please. I'm finding exactly the right space and soul for you in London..."],
      matching: true,
      proposal: "main",
      suggest: "yes, that sounds perfect!"
    }
  ];

  const PROPOSALS = {
    main: {
      title: "[ The Analog Listening Session — Soho ]",
      history: "Analog Listening Session in Soho",
      items: [
        ["Activity", "Sharing a curated list of records and the stories they evoke in a private listening room."],
        ["When", "This Saturday, 8:00 PM"],
        ["Where", "'Spiritland', Royal Festival Hall (Reserved Alcove)"],
        ["Group", "6 people (including you)"]
      ],
      group: "You will be joined by five other individuals who share your appreciation for minimalism, architectural detail, and the quiet warmth of analog sound in a fast-paced city.",
      ask: "Does this feel like the right way to spend your London weekend?"
    },
    alt: {
      title: "[ Quiet Design Walk — Kensington ]",
      history: "Quiet Design Walk in Kensington",
      items: [
        ["Activity", "A slow walk through the Design Museum's permanent collection, then a short stroll through Holland Park to share what caught your eye."],
        ["When", "This Saturday, 4:30 PM"],
        ["Where", "Design Museum, Kensington High Street"],
        ["Group", "5 people (including you)"]
      ],
      group: "You will be joined by four others who notice the details—light, materials, and the stories behind everyday objects—and who prefer a long conversation to a loud room.",
      ask: "Would you like this one instead?"
    }
  };

  const BASE_HISTORY = [
    { t: "Late Night Jazz in Shoreditch", d: "2024. 05. 12" },
    { t: "Hampstead Heath Morning Walk", d: "2024. 04. 28" },
    { t: "Quiet Reading in Bloomsbury", d: "2024. 03. 15" }
  ];

  // ---------- Elements ----------
  const $ = (id) => document.getElementById(id);
  const splash = $("splash"), chat = $("chat"), messages = $("messages");
  const form = $("composer"), input = $("input"), mic = $("micBtn");
  const settingsBtn = $("settingsBtn"), settingsMenu = $("settingsMenu");
  const drawer = $("drawer"), scrim = $("scrim"), historyEl = $("history");

  // ---------- State ----------
  let step = 0;
  let busy = false;
  let userName = "";
  let phase = "chat"; // chat | proposal | done
  let currentProposal = "main";
  let usedAlt = false;
  let history = BASE_HISTORY.slice();
  let typingTimer = null;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // ---------- Rendering ----------
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function fmt(s) {
    return escapeHtml(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }
  function scrollDown() {
    requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; });
  }
  function addRow(who, html) {
    const row = document.createElement("div");
    row.className = "row " + who;
    if (who === "agent") {
      const av = document.createElement("div");
      av.className = "avatar";
      av.textContent = "b";
      row.appendChild(av);
    }
    const b = document.createElement("div");
    b.className = "bubble";
    b.innerHTML = html;
    row.appendChild(b);
    messages.appendChild(row);
    scrollDown();
    return b;
  }
  async function agentSay(text, { think = 1100 } = {}) {
    const b = addRow("agent", '<span class="typing"><span></span><span></span><span></span></span>');
    await sleep(think + Math.min(text.length * 6, 900));
    const name = userName ? `Thank you, ${userName}. ` : "";
    b.innerHTML = fmt(text.replace("{name}", name));
    scrollDown();
    return b;
  }

  async function runMatching() {
    const steps = [
      "Reading your personality signals",
      "Finding spaces in your preferred area",
      "Matching compatible people",
      "Reserving the best time slot"
    ];
    const b = addRow("agent", '<div class="matching">' +
      steps.map((s) => `<div class="step"><span class="dot"></span>${s}</div>`).join("") + "</div>");
    const els = b.querySelectorAll(".step");
    for (let i = 0; i < els.length; i++) {
      els[i].classList.add("on");
      scrollDown();
      await sleep(850);
      els[i].classList.add("done");
    }
    await sleep(350);
    b.closest(".row").remove();
  }

  function proposalHtml(key) {
    const p = PROPOSALS[key];
    const items = p.items.map(([k, v]) => `<li><strong>${k}</strong>: ${escapeHtml(v)}</li>`).join("");
    const people = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.6"/><path d="M15.5 14.2c2.9.3 5.5 2.6 5.5 5.8"/></svg>';
    return `<div class="proposal">
      <p class="proposal-title">${escapeHtml(p.title)}</p>
      <ul>${items}</ul>
      <div class="group-line">${people}<div><strong>The Belong Group</strong> ${escapeHtml(p.group)}</div></div>
      <p style="margin:10px 0 0">${escapeHtml(p.ask)}</p>
      <div class="choice-row">
        <button class="chip primary" data-act="yes">Yes, count me in</button>
        ${usedAlt ? "" : '<button class="chip" data-act="alt">Show me another</button>'}
      </div>
    </div>`.replace(/\n\s*/g, "");
  }

  async function showProposal(key) {
    currentProposal = key;
    const b = addRow("agent", '<span class="typing"><span></span><span></span><span></span></span>');
    await sleep(900);
    b.innerHTML = proposalHtml(key);
    b.querySelectorAll(".chip").forEach((c) => c.addEventListener("click", () => {
      if (busy) return;
      const act = c.dataset.act;
      send(act === "yes" ? "Yes, count me in." : "Could you show me another option?");
    }));
    phase = "proposal";
    scrollDown();
  }

  function disableChips() {
    messages.querySelectorAll(".chip").forEach((c) => (c.disabled = true));
  }

  // ---------- Flow ----------
  async function start() {
    busy = true;
    await sleep(500);
    await agentSay(SCRIPT[0].agent[0], { think: 900 });
    busy = false;
    focusInput();
  }

  function captureName(text) {
    const m = text.match(/\b(?:i am|i'm|im|my name is|this is)\s+([a-z][a-z'-]{1,20})/i);
    if (m && !/^(a|an|the|so|very|really|not|fine|good|okay|ok)$/i.test(m[1])) {
      userName = m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
    }
  }

  async function send(text) {
    text = text.trim();
    if (!text || busy) return;
    busy = true;
    stopTyping();
    addRow("user", fmt(text));
    input.value = "";

    if (phase === "proposal") {
      disableChips();
      const wantsAlt = !usedAlt && /another|other|different|else|no\b|not really|alternative/i.test(text);
      if (wantsAlt) {
        usedAlt = true;
        await agentSay("Of course. Here's another gathering I think would suit you just as well.", { think: 700 });
        await showProposal("alt");
      } else {
        await confirmPlan();
      }
      busy = false;
      focusInput();
      return;
    }

    if (phase === "done") {
      await agentSay("I'll be here whenever you'd like to discover something new. Enjoy your weekend in London.", { think: 700 });
      busy = false;
      focusInput();
      return;
    }

    if (step === 0) captureName(text);
    step++;
    const s = SCRIPT[step];
    if (s) {
      for (const line of s.agent) await agentSay(line);
      if (s.matching) {
        await sleep(400);
        await runMatching();
        await showProposal("main");
      }
    }
    busy = false;
    focusInput();
  }

  async function confirmPlan() {
    const p = PROPOSALS[currentProposal];
    const when = p.items.find(([k]) => k === "When")[1];
    await agentSay(
      `Wonderful${userName ? ", " + userName : ""}. Your seat is reserved for **${when}**.\nI've introduced you to the group and saved the details to your History. I'll check in after the gathering to learn what felt right—so the next suggestion fits you even better.`,
      { think: 900 }
    );
    addHistory(p.history);
    phase = "done";
  }

  // ---------- History ----------
  function renderHistory(newTitle) {
    historyEl.innerHTML = history.map((h) => `
      <li class="${h.t === newTitle ? "new" : ""}">
        <span class="q">”</span>
        <div class="info">
          <div class="t">${escapeHtml(h.t)}</div>
          <div class="meta"><span class="city">London</span><span class="date">${h.d}</span></div>
        </div>
      </li>`).join("");
  }
  function addHistory(title) {
    const now = new Date();
    const sat = new Date(now);
    sat.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7 || 7));
    const d = `${sat.getFullYear()}. ${String(sat.getMonth() + 1).padStart(2, "0")}. ${String(sat.getDate()).padStart(2, "0")}`;
    history.unshift({ t: title, d });
    renderHistory(title);
  }

  // ---------- Mic (simulated voice input for the demo) ----------
  function currentSuggestion() {
    if (phase === "proposal") return SCRIPT[SCRIPT.length - 1].suggest;
    if (phase === "done") return "thank you, belong!";
    return SCRIPT[step] ? SCRIPT[step].suggest : "";
  }
  function stopTyping() {
    clearInterval(typingTimer);
    typingTimer = null;
    mic.classList.remove("listening");
  }
  function simulateVoice() {
    if (busy) return;
    if (typingTimer) { stopTyping(); return; }
    const text = currentSuggestion();
    if (!text) return;
    mic.classList.add("listening");
    input.value = "";
    let i = 0;
    setTimeout(() => {
      typingTimer = setInterval(() => {
        input.value = text.slice(0, ++i);
        input.scrollLeft = input.scrollWidth;
        if (i >= text.length) {
          clearInterval(typingTimer);
          typingTimer = null;
          setTimeout(() => { mic.classList.remove("listening"); send(input.value); }, 550);
        }
      }, 32);
    }, 450);
  }

  // ---------- UI wiring ----------
  function focusInput() {
    if (window.matchMedia("(hover: hover)").matches) input.focus();
  }

  function openDrawer() {
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    scrim.hidden = false;
    closeSettings();
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    scrim.hidden = true;
  }
  function closeSettings() {
    settingsMenu.hidden = true;
    settingsBtn.setAttribute("aria-expanded", "false");
  }

  function reset() {
    stopTyping();
    step = 0; busy = false; userName = ""; phase = "chat";
    currentProposal = "main"; usedAlt = false;
    history = BASE_HISTORY.slice();
    renderHistory();
    messages.innerHTML = "";
    input.value = "";
    closeSettings(); closeDrawer();
    chat.hidden = true;
    splash.hidden = false;
    splash.classList.remove("leaving");
  }

  $("beginBtn").addEventListener("click", async () => {
    splash.classList.add("leaving");
    await sleep(420);
    splash.hidden = true;
    chat.hidden = false;
    start();
  });

  form.addEventListener("submit", (e) => { e.preventDefault(); send(input.value); });
  mic.addEventListener("click", simulateVoice);

  $("menuBtn").addEventListener("click", openDrawer);
  $("closeDrawer").addEventListener("click", closeDrawer);
  scrim.addEventListener("click", closeDrawer);

  settingsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = settingsMenu.hidden;
    settingsMenu.hidden = !open;
    settingsBtn.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", (e) => {
    if (!settingsMenu.hidden && !settingsMenu.contains(e.target)) closeSettings();
  });
  settingsMenu.querySelectorAll(".dd-item:not(#logoutBtn)").forEach((b) => b.addEventListener("click", closeSettings));
  $("logoutBtn").addEventListener("click", reset);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeDrawer(); closeSettings(); }
  });

  renderHistory();
})();
