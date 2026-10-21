(() => {
  "use strict";

  // ---------- Demo script ----------
  // Each step: the question belong asks and the multiple-choice answers.
  // ack = belong's reaction to that answer, trait = what it learns.
  // voice/voiceTrait = the path used by the mic button or a typed answer.
  const STEPS = [
    {
      q: "Hi. I'm belong, your social discovery agent. By getting to know your personality and preferences, I'll suggest the most compatible people and activities in London for you.\nI'm curious—if it were a soft rainy evening in London, would you find yourself more drawn to a bustling pub filled with overlapping conversations, or a quiet living room where only the sound of rain reaches the windows?",
      voice: "hi belong, i am wyatt, nice to meet you. well, i would say.. prefer my quiet living room",
      options: [
        { label: "A bustling pub full of overlapping conversations", ack: "Love that energy. You clearly draw life from the buzz of a room.", trait: "lively, open energy" },
        { label: "A quiet living room with only the sound of rain", ack: "That's insightful. People with that preference often value meaningful connection over small talk.", trait: "quiet depth", def: true },
        { label: "A cosy café with a book and a few familiar faces", ack: "A lovely middle ground—comfort first, with just enough company.", trait: "calm, familiar comfort" },
        { label: "A small live music bar, somewhere in between", ack: "Nice. A little atmosphere, but still room to actually talk.", trait: "atmosphere with room to talk" }
      ]
    },
    {
      q: "How do you usually like to spend your weekends in London—among familiar faces or discovering new corners alone?",
      voice: "i would like to discover a new corners alone",
      options: [
        { label: "Discovering new corners alone", ack: "I love that.", trait: "finding new corners on your own", def: true },
        { label: "Among familiar faces", ack: "A steady circle is precious, especially in a city this big.", trait: "a close, steady circle" },
        { label: "A bit of both, depending on the week", ack: "A good balance—you keep your roots but stay curious.", trait: "a balance of the familiar and the new" },
        { label: "Trying new things with new people", ack: "Brilliant. You're open to the city's surprises.", trait: "fresh encounters" }
      ]
    },
    {
      q: "One more: when you step into a new corner of the city, what catches your attention first?",
      voice: "the design and the music, definitely. i really love old vinyl records",
      voiceTrait: "thoughtfully designed spaces and analog sound",
      options: [
        { label: "The design of the space", trait: "thoughtfully designed spaces", def: true },
        { label: "The music playing", trait: "music that sets the mood" },
        { label: "The people around me", trait: "the stories people carry" },
        { label: "The food and drink", trait: "small, well-made details" },
        { label: "The light and the view", trait: "light, views and quiet corners" }
      ]
    },
    {
      q: (t, name) => `${name ? `Thank you, ${name}. ` : ""}I'm starting to see you clearly. You're drawn to **${t[0]}**, **${t[1]}**, and **${t[2]}**.\nA small gathering around a shared passion is the best way to turn that into real connection. Shall I arrange an activity and a group for you?`,
      voice: "okay please arrange a activity and group.",
      options: [
        { label: "Yes, please arrange an activity and a group", ack: "Wonderful.", def: true },
        { label: "How does it work?", ack: "I'll find a small group whose personalities fit yours, choose a place and time that suit everyone, and take care of the booking. All you need to do is say yes. And if it clicks, I'll keep the same group meeting regularly as your circle.\nShall I go ahead?", repeat: true }
      ]
    },
    {
      q: "I'll design a meeting for you. Which **area** in London do you prefer, and what **time** usually works best for you?",
      voice: "shoreditch or hackney would be great, and saturday evening works best for me",
      final: true,
      options: [
        { label: "Shoreditch or Hackney · Saturday evening", area: "east", def: true },
        { label: "Mayfair or Kensington · Saturday afternoon to night", area: "west" },
        { label: "South Bank · Sunday afternoon", area: "south" },
        { label: "Anywhere central · Weekday evenings", area: "central" }
      ]
    }
  ];

  // ---------- Proposals, by area ----------
  // Two kinds of gathering fit the demo persona; the venue and time follow the chosen area.
  const KINDS = {
    main: {
      title: (p) => `[ The Analog Listening Session — ${p} ]`,
      history: (p) => `Analog Listening Session in ${p}`,
      activity: "Sharing a curated list of records and the stories they evoke in a private listening room.",
      circle: "The Analog Circle",
      members: [
        ["Clara", "Interior designer · restores old turntables"],
        ["James", "Architect · collects 70s jazz pressings"],
        ["Noor", "UX researcher · loves ambient music"],
        ["Oliver", "Photographer · shoots empty spaces"],
        ["Yuna", "Product manager · new to London"]
      ],
      group: "You will be joined by five other individuals who share your appreciation for minimalism, architectural detail, and the quiet warmth of analog sound in a fast-paced city.",
      ask: "Does this feel like the right way to spend your London weekend?"
    },
    alt: {
      title: (p) => `[ Quiet Design Walk — ${p} ]`,
      history: (p) => `Quiet Design Walk in ${p}`,
      circle: "The Detail Walkers",
      members: [
        ["Ella", "Furniture maker · loves mid-century design"],
        ["Marcus", "Architecture student · sketches buildings"],
        ["Rin", "Ceramicist · notices every material"],
        ["Hugo", "Lighting designer · quiet observer"]
      ],
      group: "You will be joined by four others who notice the details—light, materials, and the stories behind everyday objects—and who prefer a long conversation to a loud room.",
      ask: "Would you like this one instead?"
    }
  };

  const AREAS = {
    east: {
      label: "Shoreditch & Hackney",
      main: { place: "Dalston", where: "Brilliant Corners, Dalston (Reserved listening corner)", day: 6, time: "7:30 PM" },
      alt: { place: "Hoxton", where: "Museum of the Home, Hoxton", day: 6, time: "3:00 PM",
        activity: "A slow walk through 400 years of London living rooms, then a coffee nearby to share what caught your eye." }
    },
    west: {
      label: "Mayfair & Kensington",
      main: { place: "Kensington", where: "Partner listening room, Kensington Church Street", day: 6, time: "6:00 PM" },
      alt: { place: "Kensington", where: "Design Museum, Kensington High Street", day: 6, time: "4:30 PM",
        activity: "A slow walk through the Design Museum's permanent collection, then a short stroll through Holland Park to share what caught your eye." }
    },
    south: {
      label: "the South Bank",
      main: { place: "South Bank", where: "'Spiritland', Royal Festival Hall (Reserved Alcove)", day: 0, time: "4:00 PM" },
      alt: { place: "South Bank", where: "Hayward Gallery, Southbank Centre", day: 0, time: "2:00 PM",
        activity: "An unhurried visit to the Hayward Gallery, then a walk along the Thames to talk it through." }
    },
    central: {
      label: "central London",
      main: { place: "Soho", where: "Partner listening room, Soho", day: 4, time: "7:30 PM" },
      alt: { place: "Bloomsbury", where: "British Museum, Bloomsbury (Friday late opening)", day: 5, time: "6:00 PM",
        activity: "A quiet evening wander through the British Museum's late opening, focusing on a few favourite objects." }
    }
  };

  const LINE_MATCHING = "Perfect. One moment please. I'm finding exactly the right space and soul for you in London...";
  const LINE_ALT = "Of course. Here's another gathering I think would suit you just as well.";
  const LINE_DONE = "I'll be here whenever you need me. Enjoy your first gathering with your new circle.";
  const proposalSpeech = (p) => `Here's what I found for you. ${p.title.replace(/[\[\]]/g, "")}, this ${p.dayName}. ${p.ask}`;
  const confirmText = (p, name) => {
    const when = p.items.find(([k]) => k === "When")[1];
    return `Wonderful${name ? ", " + name : ""}. Your seat is reserved for **${when}**.\nThis group is now your circle, **${p.circle}**. After ${p.dayName} I'll check in to hear how it felt, and I'll keep the circle going with a new gathering about every two weeks.`;
  };

  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function buildProposal(area, kind) {
    const a = AREAS[area][kind], k = KINDS[kind];
    return {
      title: k.title(a.place),
      history: k.history(a.place),
      circle: k.circle,
      day: a.day,
      dayName: DAY_NAMES[a.day],
      items: [
        ["Activity", a.activity || k.activity],
        ["When", `This ${DAY_NAMES[a.day]}, ${a.time}`],
        ["Where", a.where],
        ["Group", `${k.members.length + 1} people (including you)`]
      ],
      members: k.members,
      group: k.group,
      ask: k.ask
    };
  }

  // ---------- Dates (kept relative to today so the demo never looks stale) ----------
  function weekdayBefore(weekday, weeksBack) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    while (d.getDay() !== weekday) d.setDate(d.getDate() - 1);
    d.setDate(d.getDate() - 7 * weeksBack);
    return d;
  }
  function nextWeekday(weekday) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    while (d.getDay() !== weekday) d.setDate(d.getDate() + 1);
    return d;
  }
  const shortDate = (d) => `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, "0")}. ${String(d.getDate()).padStart(2, "0")}`;
  const longDate = (d) => d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  // ---------- Circles in History ----------
  // Each circle is a group belong keeps meeting. Gatherings carry the user's
  // own reflection, summarized by belong.
  function baseCircles() {
    const g = (weekday, weeksBack, time, data) => {
      const d = weekdayBefore(weekday, weeksBack);
      return Object.assign({ d: shortDate(d), when: `${longDate(d)} · ${time}` }, data);
    };
    return [
      {
        name: "Night Listeners",
        cadence: "every 2 weeks",
        members: [
          ["Maya", "Architect · collects Blue Note records"],
          ["Tom", "Sound engineer · plays double bass"],
          ["Priya", "Product designer · new to London"],
          ["Daniel", "Teacher · quiet, sharp sense of humour"]
        ],
        gatherings: [
          g(6, 0, "9:00 PM", {
            t: "Late Night Jazz in Shoreditch", n: 2,
            where: "Nightjar, City Road, Shoreditch",
            activity: "An intimate late-night set from a jazz trio, with time to talk between sets.",
            reflection: {
              summary: "I went in a little tired and expected to stay for one set. I stayed for three. Seeing the same faces again made it easy to skip the small talk, and it was the first time in a while I felt properly listened to.",
              highlights: [
                "Maya and I picked up our conversation from the vinyl swap",
                "Tom recommended a record shop in Dalston I want to visit",
                "The bar was a bit loud in the first set; the corner table worked better"
              ],
              keep: ["Maya", "Tom"],
              learned: "The second gathering felt warmer than the first. I'll keep this circle going and pick quieter seating next time."
            }
          }),
          g(6, 2, "2:00 PM", {
            t: "Vinyl Swap in Hoxton", n: 1,
            where: "Love Vinyl, Hoxton Street",
            activity: "Everyone brought two records to trade, and the story behind one of them.",
            reflection: {
              summary: "I almost didn't come. Having a record in my hand gave me something to talk about straight away, and by the end we were already planning what to listen to next time.",
              highlights: [
                "Traded a Bill Evans record with Maya",
                "Daniel's story about his dad's record collection stayed with me",
                "Two hours felt just right"
              ],
              keep: ["Maya", "Tom", "Daniel"],
              learned: "Having an object to share breaks the ice for you. I suggested the same group meet again in two weeks."
            }
          })
        ]
      },
      {
        name: "Heath Walkers",
        cadence: "every 3 weeks",
        members: [
          ["Hannah", "Nurse · early riser, loves birdwatching"],
          ["Leo", "Data analyst · training for a half marathon"],
          ["Sofia", "PhD student · moved from Lisbon last year"]
        ],
        gatherings: [
          g(0, 1, "8:00 AM", {
            t: "Hampstead Heath Morning Walk", n: 1,
            where: "Parliament Hill entrance, Hampstead Heath",
            activity: "A slow 90-minute walk across the Heath, ending with coffee at the Lido café.",
            reflection: {
              summary: "Walking side by side made conversation feel natural. Nobody had to fill the silence. It was early, but the view from Parliament Hill made it worth it, and I left feeling calmer than I had all week.",
              highlights: [
                "Sofia and I swapped tips on settling into London",
                "Hannah pointed out birds I'd never noticed",
                "Would prefer a slightly later start next time"
              ],
              keep: ["Sofia"],
              learned: "Outdoor, side-by-side activities suit you well. The next walk starts at 10 AM."
            }
          })
        ]
      },
      {
        name: "Bloomsbury Readers",
        cadence: "monthly",
        members: [
          ["Grace", "Editor · reads mostly poetry"],
          ["Sam", "Software engineer · into science fiction"],
          ["Aiko", "Illustrator · sketches while she reads"],
          ["Ben", "Civil servant · history buff"]
        ],
        gatherings: [
          g(6, 4, "2:00 PM", {
            t: "Quiet Reading in Bloomsbury", n: 1,
            where: "London Review Cake Shop, Bloomsbury",
            activity: "An hour of silent reading together, then a short chat about what everyone was reading.",
            reflection: {
              summary: "My first belong gathering. I was nervous, but the silent hour took the pressure off. By the time we started talking, it already felt like we had shared something.",
              highlights: [
                "Grace lent me a poetry collection I'm still reading",
                "Liked that there was no pressure to talk at first",
                "Could have used a little more time for the chat afterwards"
              ],
              keep: ["Grace", "Aiko"],
              learned: "A quiet start helps you settle in. I'll keep that format for first meetings."
            }
          })
        ]
      }
    ];
  }

  // ---------- Elements ----------
  const $ = (id) => document.getElementById(id);
  const splash = $("splash"), chat = $("chat"), messages = $("messages");
  const form = $("composer"), input = $("input"), mic = $("micBtn");
  const settingsBtn = $("settingsBtn"), settingsMenu = $("settingsMenu");
  const drawer = $("drawer"), scrim = $("scrim"), historyEl = $("history");
  const detail = $("detail"), detailBody = $("detailBody");
  const voiceBtn = $("voiceBtn");
  const dock = $("dock"), bigMic = $("bigMic"), caption = $("caption"), voiceStatus = $("voiceStatus"), switchBtn = $("switchBtn");

  // ---------- State ----------
  let step = 0;
  let busy = false;
  let userName = "";
  let phase = "chat"; // chat | proposal | done
  let area = "east";
  let currentKind = "main";
  let usedAlt = false;
  let traits = [];
  let circles = baseCircles();
  let typingTimer = null;
  let inputMode = "voice"; // voice | type
  let speakOn = true;
  let lastSpeech = Promise.resolve();

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // ---------- Voice output (talk mode) ----------
  const synth = window.speechSynthesis;
  let voice = null;
  function pickVoice() {
    if (!synth) return;
    const vs = synth.getVoices();
    const prefer = ["Google UK English Female", "Serena", "Kate", "Martha", "Stephanie", "Microsoft Libby", "Microsoft Sonia"];
    voice = vs.find((v) => prefer.some((p) => v.name.includes(p))) ||
      vs.find((v) => v.lang === "en-GB") ||
      vs.find((v) => v.lang && v.lang.startsWith("en")) || null;
  }
  if (synth) { pickVoice(); synth.onvoiceschanged = pickVoice; }
  // belong's voice: every scripted line is pre-recorded (audio/<key>.mp3).
  // Anything not recorded (e.g. a different typed name) falls back to browser speech.
  const cleanSpeech = (text) => text.replace(/\*\*/g, "").replace(/[\[\]]/g, "").replace(/\s+/g, " ").trim();
  function audioKey(text) {
    let h = 0x811c9dc5;
    const s = cleanSpeech(text);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(16).padStart(8, "0");
  }
  const player = new Audio();
  player.preload = "auto";
  let speechSeq = 0;
  let stopCurrent = null;
  const SILENT = "data:audio/wav;base64,UklGRmQGAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YUAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

  function lastAvatar() {
    const rows = messages.querySelectorAll(".row.agent");
    return rows.length ? rows[rows.length - 1].querySelector(".avatar") : null;
  }
  function speak(text) {
    hush();
    if (!speakOn) { lastSpeech = Promise.resolve(); return lastSpeech; }
    const seq = ++speechSeq;
    const av = lastAvatar();
    lastSpeech = new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return; done = true;
        av && av.classList.remove("speaking");
        player.onended = player.onerror = player.onplaying = null;
        if (stopCurrent === finish) stopCurrent = null;
        resolve();
      };
      stopCurrent = finish;
      player.onplaying = () => av && av.classList.add("speaking");
      player.onended = finish;
      player.onerror = () => {
        if (seq !== speechSeq) return finish();
        browserSpeak(text, av).then(finish);
      };
      player.src = `audio/${audioKey(text)}.mp3`;
      const p = player.play();
      if (p && p.catch) p.catch(() => { if (seq === speechSeq && !done) browserSpeak(text, av).then(finish); });
    });
    return lastSpeech;
  }
  function browserSpeak(text, av) {
    if (!synth || !speakOn) return Promise.resolve();
    const clean = cleanSpeech(text);
    const u = new SpeechSynthesisUtterance(clean);
    if (voice) { u.voice = voice; u.lang = voice.lang; } else { u.lang = "en-GB"; }
    return new Promise((resolve) => {
      let done = false;
      const finish = () => { if (done) return; done = true; av && av.classList.remove("speaking"); resolve(); };
      u.onstart = () => av && av.classList.add("speaking");
      u.onend = u.onerror = finish;
      setTimeout(finish, 1500 + clean.length * 75);
      synth.speak(u);
    });
  }
  function hush() {
    speechSeq++;
    if (stopCurrent) stopCurrent();
    try { player.pause(); } catch (e) {}
    if (synth) synth.cancel();
    const av = lastAvatar(); av && av.classList.remove("speaking");
  }

  // Every line belong can say, for pre-recording. Mirrors the flow below.
  window.__belongLines = () => {
    const out = new Set();
    const add = (t) => out.add(cleanSpeech(t));
    add(qText(0, [], ""));
    for (let i = 0; i < 2; i++) {
      for (const o of STEPS[i].options) add((o.ack ? o.ack + " " : "") + qText(i + 1, [], ""));
    }
    const t0 = STEPS[0].options.map((o) => o.trait);
    const t1 = STEPS[1].options.map((o) => o.trait);
    const t2 = STEPS[2].options.map((o) => o.trait).concat(STEPS[2].voiceTrait);
    const t0Typed = (STEPS[0].options.find((o) => o.def) || {}).trait;
    for (const a of t0) for (const b of t1) for (const c of t2) {
      add(qText(3, [a, b, c], ""));
      if (a === t0Typed) add(qText(3, [a, b, c], "Wyatt"));
    }
    for (const o of STEPS[3].options) add(o.repeat ? o.ack : o.ack + " " + qText(4, [], ""));
    add(LINE_MATCHING); add(LINE_ALT); add(LINE_DONE);
    for (const ar of Object.keys(AREAS)) for (const kind of ["main", "alt"]) {
      const p = buildProposal(ar, kind);
      add(proposalSpeech(p));
      add(confirmText(p, "")); add(confirmText(p, "Wyatt"));
    }
    return [...out].map((text) => ({ key: audioKey(text), text }));
  };


  // ---------- Voice dock ----------
  function setMic(state) {
    dock.dataset.state = state; // busy | listening | talking
    voiceStatus.textContent =
      state === "listening" ? "Listening\u2026 tap the mic to answer" :
      state === "talking" ? "" :
      (speakOn ? "belong is speaking\u2026" : "belong is thinking\u2026");
  }
  // Called when belong has finished a turn: once it stops talking, the mic turns on.
  function agentDone() {
    busy = false;
    const myTurn = lastSpeech;
    myTurn.then(() => {
      if (!busy && lastSpeech === myTurn && inputMode === "voice" && !typingTimer) setMic("listening");
    });
  }
  function setInputMode(m) {
    inputMode = m;
    dock.classList.toggle("voice", m === "voice");
    dock.classList.toggle("type", m === "type");
    switchBtn.setAttribute("aria-label", m === "voice" ? "Switch to typing" : "Switch to voice");
    stopTyping();
    caption.textContent = "";
    if (m === "type") {
      setSpeakOn(false);
      if (window.matchMedia("(hover: hover)").matches) input.focus();
    } else {
      setSpeakOn(true);
      setMic(busy ? "busy" : "listening");
    }
  }

  // ---------- Rendering ----------
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
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
    b.innerHTML = fmt(text);
    scrollDown();
    speak(text);
    return b;
  }

  async function runMatching() {
    const steps = [
      "Reading your personality signals",
      `Finding spaces in ${AREAS[area].label}`,
      "Matching compatible people",
      "Reserving the best time slot"
    ];
    const b = addRow("agent", '<div class="matching">' +
      steps.map((s) => `<div class="step"><span class="dot"></span>${escapeHtml(s)}</div>`).join("") + "</div>");
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

  function proposalHtml(p) {
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

  async function showProposal(kind) {
    currentKind = kind;
    const p = buildProposal(area, kind);
    const b = addRow("agent", '<span class="typing"><span></span><span></span><span></span></span>');
    await sleep(900);
    b.innerHTML = proposalHtml(p);
    b.querySelectorAll(".chip").forEach((c) => c.addEventListener("click", () => {
      if (busy) return;
      send(c.dataset.act === "yes" ? "Yes, count me in." : "Could you show me another option?");
    }));
    phase = "proposal";
    scrollDown();
    speak(proposalSpeech(p));
  }

  function disableChips() {
    messages.querySelectorAll(".chip").forEach((c) => (c.disabled = true));
  }

  // ---------- Flow ----------
  function qText(i, t, name) {
    const q = STEPS[i].q;
    return typeof q === "function" ? q(t, name) : q;
  }
  function questionText(i) { return qText(i, traits, userName); }

  // Render the multiple-choice answers under belong's question.
  function showChoices(i, exclude = []) {
    const opts = STEPS[i].options.filter((o) => !exclude.includes(o));
    const row = document.createElement("div");
    row.className = "choices";
    const letters = "ABCDE";
    opts.forEach((o, k) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice";
      btn.innerHTML = `<span class="letter">${letters[k]}</span><span>${escapeHtml(o.label)}</span>`;
      btn.addEventListener("click", () => {
        if (busy) return;
        answer(o.label, o);
      });
      btn.style.animationDelay = (k * 70) + "ms";
      row.appendChild(btn);
    });
    messages.appendChild(row);
    scrollDown();
  }
  function closeChoices() {
    messages.querySelectorAll(".choices:not(.closed)").forEach((c) => {
      c.classList.add("closed");
      c.querySelectorAll("button").forEach((b) => (b.disabled = true));
    });
  }

  async function start() {
    busy = true;
    await sleep(500);
    await agentSay(questionText(0), { think: 900 });
    showChoices(0);
    agentDone();
  }

  function captureName(text) {
    const m = text.match(/\b(?:i am|i'm|im|my name is|this is)\s+([a-z][a-z'-]{1,20})/i);
    if (m && !/^(a|an|the|so|very|really|not|fine|good|okay|ok)$/i.test(m[1])) {
      userName = m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
    }
  }
  function areaFromText(text) {
    if (/mayfair|kensington|chelsea|notting/i.test(text)) return "west";
    if (/south ?bank|waterloo|southwark/i.test(text)) return "south";
    if (/central|soho|covent|bloomsbury|anywhere|weekday/i.test(text)) return "central";
    return "east";
  }

  // Typed text and mic input go here; choice buttons call answer() directly.
  function send(text) {
    text = (text || "").trim();
    if (!text || busy) return;
    if (phase === "chat") {
      const s = STEPS[step];
      const def = s.options.find((o) => o.def) || s.options[0];
      answer(text, { ack: def.ack, trait: s.voiceTrait || def.trait, area: s.final ? areaFromText(text) : undefined, typed: true });
    } else {
      answerAfterChat(text);
    }
  }

  async function answer(text, opt) {
    busy = true;
    hush();
    setMic("busy");
    caption.textContent = "";
    stopTyping();
    closeChoices();
    addRow("user", fmt(text));
    input.value = "";

    const s = STEPS[step];
    if (opt.typed && step === 0) captureName(text);

    if (opt.repeat) {
      await agentSay(opt.ack);
      showChoices(step, s.options.filter((o) => o.repeat));
      agentDone();
      return;
    }

    if (opt.trait) traits[step] = opt.trait;

    if (s.final) {
      area = opt.area || "east";
      await agentSay(LINE_MATCHING);
      await sleep(400);
      await runMatching();
      await showProposal("main");
      agentDone();
      return;
    }

    step++;
    const lead = opt.ack ? opt.ack + " " : "";
    await agentSay(lead + questionText(step));
    showChoices(step);
    agentDone();
  }

  async function answerAfterChat(text) {
    busy = true;
    hush();
    setMic("busy");
    caption.textContent = "";
    stopTyping();
    addRow("user", fmt(text));
    input.value = "";

    if (phase === "proposal") {
      disableChips();
      const wantsAlt = !usedAlt && /another|other|different|else|no\b|not really|alternative/i.test(text);
      if (wantsAlt) {
        usedAlt = true;
        await agentSay(LINE_ALT, { think: 700 });
        await showProposal("alt");
      } else {
        await confirmPlan();
      }
    } else {
      await agentSay(LINE_DONE, { think: 700 });
    }
    agentDone();
  }

  async function confirmPlan() {
    const p = buildProposal(area, currentKind);
    await agentSay(confirmText(p, userName), { think: 900 });
    addUpcoming(p);
    phase = "done";
  }

  // ---------- History ----------
  function avatarStack(members) {
    return `<span class="stack">${members.slice(0, 3).map(([n]) => `<span class="m-av xs">${initials(n)}</span>`).join("")}</span>`;
  }
  function renderHistory(highlight) {
    historyEl.innerHTML = circles.map((c, ci) => `
      <li class="circle ${c.name === highlight ? "new" : ""}">
        <div class="circle-head">
          <div>
            <div class="c-name">${escapeHtml(c.name)}${c.isNew ? '<span class="c-new">New</span>' : ""}</div>
            <div class="c-meta">You + ${c.members.length} · ${escapeHtml(c.cadence)}</div>
          </div>
          ${avatarStack(c.members)}
        </div>
        <ul class="gatherings">
          ${c.gatherings.map((g, gi) => `
            <li class="gathering" data-c="${ci}" data-g="${gi}" tabindex="0" role="button">
              <span class="q">”</span>
              <div class="info">
                <div class="t">${escapeHtml(g.t)}</div>
                <div class="meta"><span class="city">Gathering ${g.n}</span><span class="date ${g.upcoming ? "up" : ""}">${g.upcoming ? "Upcoming" : g.d}</span></div>
              </div>
            </li>`).join("")}
        </ul>
      </li>`).join("").replace(/\n\s*/g, "");
    historyEl.querySelectorAll(".gathering").forEach((li) => {
      const open = () => {
        const c = circles[+li.dataset.c];
        openDetail(c, c.gatherings[+li.dataset.g]);
      };
      li.addEventListener("click", open);
      li.addEventListener("keydown", (e) => { if (e.key === "Enter") open(); });
    });
  }
  function addUpcoming(p) {
    const date = nextWeekday(p.day);
    const get = (k) => (p.items.find(([key]) => key === k) || [])[1];
    const time = (get("When") || "").split(",").pop().trim();
    circles.unshift({
      name: p.circle,
      cadence: "every 2 weeks",
      isNew: true,
      members: p.members,
      gatherings: [{
        t: p.history, n: 1, upcoming: true,
        d: shortDate(date),
        when: `${longDate(date)} · ${time}`,
        where: get("Where"),
        activity: get("Activity")
      }]
    });
    renderHistory(p.circle);
  }

  function initials(n) { return n.slice(0, 1).toUpperCase(); }

  function openDetail(c, h) {
    const members = c.members.map(([n, tag]) => `
      <li><span class="m-av">${initials(n)}</span><div><div class="m-name">${escapeHtml(n)}</div><div class="m-tag">${escapeHtml(tag)}</div></div></li>`).join("");
    let reflection;
    if (h.reflection) {
      const r = h.reflection;
      reflection = `
        <section class="d-card reflect">
          <h3>My reflection <span class="d-sub">summarized by belong</span></h3>
          <p class="r-summary">${escapeHtml(r.summary)}</p>
          <h4>What stood out</h4>
          <ul class="r-list">${r.highlights.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
          <h4>Staying in touch with</h4>
          <div class="r-keep">${r.keep.map((n) => `<span class="keep-chip"><span class="m-av sm">${initials(n)}</span>${escapeHtml(n)}</span>`).join("")}</div>
          <div class="r-learned"><span class="avatar sm">b</span><p><strong>What belong learned</strong><br>${escapeHtml(r.learned)}</p></div>
        </section>`;
    } else {
      reflection = `
        <section class="d-card reflect empty">
          <h3>My reflection</h3>
          <p class="r-summary">After the gathering, belong will check in with you and summarize your reflection here.</p>
        </section>`;
    }
    detailBody.innerHTML = `
      <div class="d-hero">
        ${h.upcoming ? '<span class="badge">Upcoming</span>' : '<span class="badge past">Met</span>'}
        <h2>${escapeHtml(h.t)}</h2>
        <p>${escapeHtml(h.activity || "")}</p>
      </div>
      <section class="d-card circle-card">
        <div class="cc-top">
          <div>
            <div class="cc-label">Your circle</div>
            <div class="cc-name">${escapeHtml(c.name)}</div>
          </div>
          <span class="cc-count">Gathering ${h.n}</span>
        </div>
        <p class="cc-note">${h.upcoming
          ? "Your first gathering together. If it clicks, belong will keep this circle meeting " + escapeHtml(c.cadence) + "."
          : "belong keeps this circle meeting " + escapeHtml(c.cadence) + " and suggests the next gathering after each one."}</p>
      </section>
      <section class="d-card">
        <div class="d-row"><span class="d-k">When</span><span class="d-v">${escapeHtml(h.when || h.d)}</span></div>
        <div class="d-row"><span class="d-k">Where</span><span class="d-v">${escapeHtml(h.where || "London")}</span></div>
        <div class="d-row"><span class="d-k">Group</span><span class="d-v">${c.members.length + 1} people (including you)</span></div>
      </section>
      <section class="d-card">
        <h3>${h.upcoming ? "Who you'll meet" : "Who you met"}</h3>
        <ul class="members">${members}</ul>
      </section>
      ${reflection}`.replace(/\n\s*/g, "");
    closeDrawer();
    detail.classList.add("open");
    detail.setAttribute("aria-hidden", "false");
    detailBody.scrollTop = 0;
  }
  function closeDetail(reopen = true) {
    if (!detail.classList.contains("open")) return;
    detail.classList.remove("open");
    detail.setAttribute("aria-hidden", "true");
    if (reopen) openDrawer();
  }

  // ---------- Mic (simulated voice input for the demo) ----------
  function currentSuggestion() {
    if (phase === "proposal") return "yes, that sounds perfect!";
    if (phase === "done") return "thank you, belong!";
    return STEPS[step] ? STEPS[step].voice : "";
  }
  function stopTyping() {
    clearInterval(typingTimer);
    typingTimer = null;
    mic.classList.remove("listening");
  }
  // Simulated speech: the scripted answer appears as a live caption (voice)
  // or in the text box (typing), then is sent.
  function simulateVoice() {
    if (busy) return;
    if (typingTimer) {
      stopTyping();
      caption.textContent = "";
      if (inputMode === "voice") setMic("listening");
      return;
    }
    const text = currentSuggestion();
    if (!text) return;
    hush();
    const voiceUI = inputMode === "voice";
    const out = (t) => { if (voiceUI) caption.textContent = t; else { input.value = t; input.scrollLeft = input.scrollWidth; } };
    if (voiceUI) setMic("talking"); else mic.classList.add("listening");
    out("");
    let i = 0;
    typingTimer = setTimeout(() => {
      typingTimer = setInterval(() => {
        out(text.slice(0, ++i));
        if (i >= text.length) {
          clearInterval(typingTimer);
          typingTimer = null;
          setTimeout(() => { mic.classList.remove("listening"); send(text); }, 550);
        }
      }, 32);
    }, 350);
  }

  // ---------- UI wiring ----------
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
  function setSpeakOn(on) {
    speakOn = on;
    voiceBtn.classList.toggle("off", !on);
    voiceBtn.setAttribute("aria-pressed", String(on));
    voiceBtn.setAttribute("aria-label", on ? "Mute belong's voice" : "Unmute belong's voice");
    if (!on) hush();
  }

  function reset() {
    hush();
    stopTyping();
    step = 0; busy = false; userName = ""; phase = "chat"; traits = [];
    area = "east"; currentKind = "main"; usedAlt = false;
    circles = baseCircles();
    renderHistory();
    messages.innerHTML = "";
    input.value = "";
    closeSettings(); closeDetail(false); closeDrawer();
    setInputMode("voice");
    chat.hidden = true;
    splash.hidden = false;
    splash.classList.remove("leaving");
  }

  $("beginBtn").addEventListener("click", async () => {
    // Playing something inside the tap unlocks audio on mobile browsers.
    if (synth) synth.speak(new SpeechSynthesisUtterance(""));
    try { player.src = SILENT; const p = player.play(); if (p && p.catch) p.catch(() => {}); } catch (e) {}
    splash.classList.add("leaving");
    await sleep(420);
    splash.hidden = true;
    chat.hidden = false;
    setInputMode("voice");
    setMic("busy");
    start();
  });

  bigMic.addEventListener("click", simulateVoice);
  switchBtn.addEventListener("click", () => setInputMode(inputMode === "voice" ? "type" : "voice"));
  form.addEventListener("submit", (e) => { e.preventDefault(); send(input.value); });
  mic.addEventListener("click", simulateVoice);
  voiceBtn.addEventListener("click", () => {
    setSpeakOn(!speakOn);
    if (dock.dataset.state === "busy") setMic("busy");
  });

  $("menuBtn").addEventListener("click", openDrawer);
  $("closeDrawer").addEventListener("click", closeDrawer);
  $("detailBack").addEventListener("click", () => closeDetail(true));
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
    if (e.key === "Escape") {
      if (detail.classList.contains("open")) closeDetail(true);
      else { closeDrawer(); closeSettings(); }
    }
  });

  renderHistory();
})();
