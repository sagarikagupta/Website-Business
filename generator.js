/* =============================================================
   MAGIC WEBSITE GENERATOR  —  generator.js
   Uses Google Gemini 1.5 Flash via the public REST API.
   Falls back to built-in demo templates when API is unavailable.
   Each demo template has a completely distinct visual identity.
   ============================================================= */

(function () {
  'use strict';

  /* ── DOM refs ─────────────────────────────────────────── */
  const section = document.getElementById('generator');
  if (!section) return;

  const descInput = document.getElementById('gen-desc');
  const generateBtn = document.getElementById('gen-btn');
  const keyInput = document.getElementById('gen-api-key');
  const keyToggle = document.getElementById('gen-key-toggle');
  const keyRow = document.getElementById('gen-key-row');
  const statusEl = document.getElementById('gen-status');
  const previewWrap = document.getElementById('gen-preview-wrap');
  const previewFrame = document.getElementById('gen-iframe');
  const polishCard = document.getElementById('gen-polish-card');
  const exampleBtns = document.querySelectorAll('.gen-example');
  const keyEye = document.getElementById('gen-key-eye');

  const LS_KEY = 'nexus_gemini_api_key';
  let isGenerating = false;

  /* ── Init ─────────────────────────────────────────────── */
  const savedKey = localStorage.getItem(LS_KEY) || '';
  if (savedKey) keyInput.value = savedKey;

  keyInput.addEventListener('input', () => {
    const k = keyInput.value.trim();
    if (k) localStorage.setItem(LS_KEY, k);
    else localStorage.removeItem(LS_KEY);
  });

  keyToggle.addEventListener('click', () => {
    const open = keyRow.classList.toggle('open');
    keyToggle.textContent = open ? '▲ Hide API Key' : '▼ Set Gemini API Key';
  });

  keyEye.addEventListener('click', () => {
    const isPass = keyInput.type === 'password';
    keyInput.type = isPass ? 'text' : 'password';
    keyEye.textContent = isPass ? '🙈' : '👁️';
  });

  exampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      descInput.value = btn.dataset.prompt;
      descInput.focus();
    });
  });

  descInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generate(); }
  });

  generateBtn.addEventListener('click', generate);

  /* ── UI helpers ──────────────────────────────────────── */
  function setStatus(msg, type = '') {
    statusEl.textContent = msg;
    statusEl.className = 'gen-status' + (type ? ` gen-status--${type}` : '');
    statusEl.style.display = msg ? 'block' : 'none';
  }

  function setLoading(on) {
    isGenerating = on;
    generateBtn.disabled = on;
    generateBtn.innerHTML = on
      ? '<span class="gen-spinner"></span> Generating…'
      : '<span>✨</span> Generate';
    if (on) {
      previewWrap.classList.add('loading');
      previewWrap.classList.remove('ready');
      polishCard.classList.remove('visible');
    }
  }

  function showPreview(html) {
    previewFrame.srcdoc = html;
    previewWrap.classList.remove('loading');
    previewWrap.classList.add('ready');
    setTimeout(() => {
      polishCard.classList.add('visible');
      polishCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 600);
  }

  /* ── Gemini API ──────────────────────────────────────── */
  const MODELS = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-2.0-flash-lite',
  ];

  function buildPrompt(desc) {
    return `You are an expert web developer. Generate a COMPLETE, self-contained, single-file HTML website for the following business:

"${desc}"

Requirements:
- Output ONLY valid HTML — no markdown, no explanations, no code fences.
- All CSS inside a <style> tag in <head>. Only Google Fonts is allowed as external resource.
- All JS inside a <script> tag before </body>. No external scripts.
- Modern, professional design with a colour palette appropriate for the business type.
- Must include: hero with the business name & tagline, about/services section, contact CTA.
- Smooth animations and hover effects. Fully responsive (mobile-first).
- Real convincing copy — absolutely NO Lorem ipsum.
- Start your output with <!DOCTYPE html>.`;
  }

  function extractHTML(text) {
    const match = text.match(/```(?:html)?\s*([\s\S]*?)```/i);
    if (match) return match[1].trim();
    const t = text.trim();
    if (/^<!DOCTYPE/i.test(t) || /^<html/i.test(t)) return t;
    return t;
  }

  async function callGemini(apiKey, model, prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 8192 },
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const e = new Error(err?.error?.message || `HTTP ${res.status}`);
      e.status = res.status;
      throw e;
    }
    return res.json();
  }

  /* ================================================================
     DEMO TEMPLATES — each has a completely different visual identity:
     Food       → Warm light-mode, cream/terracotta, serif typeface
     Tech/SaaS  → Light-mode, white bg, bold violet/purple accent
     Creative   → Brutalist black & white with single red accent
     Fitness    → High-energy lime green on near-black
     Generic    → Bright white, coral/orange, Outfit sans-serif
  ================================================================ */


  function buildDemo(description) {
    const d = description.toLowerCase();
    // Word boundaries prevent substring matches (e.g. 'ai' inside 'hair')
    const isBeauty = /(\bsalon\b|\bbeauty\b|\bhair\b|\bnail\b|\bmakeup\b|skincare|\bbarber\b|aesthetic|cosmetic|\blash\b|\bbrow\b)/i.test(d);
    const isFood = /(restaurant|\bcafe\b|coffee|bakery|pizza|sushi|\bfood\b|bistro|diner|\btaco\b|burger)/i.test(d);
    const isTech = /(\bsaas\b|software|\bapp\b|\btech\b|\bai\b|startup|analytics|platform|dashboard|\bapi\b)/i.test(d);
    const isCreative = /(photographer|\bphoto\b|\bstudio\b|design|creative|\bfilm\b|branding|fashion|\bmusic\b)/i.test(d);
    const isFitness = /(\bgym\b|fitness|\byoga\b|wellness|\bspa\b|\bhealth\b|trainer|pilates|crossfit)/i.test(d);
    const isRealty = /(real estate|realtor|\bproperty\b|\bhomes\b|mortgage|apartment|realty|housing|\bcondo\b)/i.test(d);
    const isLaw = /(\blaw\b|lawyer|attorney|\blegal\b|\bfirm\b|counsel|litigation|solicitor|paralegal)/i.test(d);
    const isEdu = /(\bschool\b|tutor|education|academy|coaching|learning|\bcourse\b|university|college|\bteach\b)/i.test(d);
    const isTravel = /(\btravel\b|\btours?\b|\bhotel\b|resort|\bvacation\b|adventure|\bhostel\b|airbnb|tourism|\btrip\b|\bfly\b|flights?)/i.test(d);
    const isPet = /(\bpet\b|\bdog\b|\bcat\b|veterinary|\bvet\b|grooming|kennel|\bpuppy\b|\bkitten\b|\banimal\b)/i.test(d);
    const isFinance = /(\bfinance\b|financial|accounting|bookkeeping|\btax\b|investing|\bwealth\b|\bfund\b|\bstock\b|\bbudget\b|\bauditing\b)/i.test(d);
    const isWedding = /(\bwedding\b|\bevent\b|\bplanner\b|\bvenue\b|\bflorist\b|celebration|\bparty\b|\bbridal\b|ceremony)/i.test(d);

    const title = description.length > 60 ? description.slice(0, 57) + '…' : description;
    if (isBeauty) return beautyDemo(title);
    if (isFood) return foodDemo(title);
    if (isTech) return techDemo(title);
    if (isCreative) return creativeDemo(title);
    if (isFitness) return fitnessDemo(title);
    if (isRealty) return realtyDemo(title);
    if (isLaw) return lawDemo(title);
    if (isEdu) return eduDemo(title);
    if (isTravel) return travelDemo(title);
    if (isPet) return petDemo(title);
    if (isFinance) return financeDemo(title);
    if (isWedding) return weddingDemo(title);
    return genericDemo(title);
  }


  /* ─── FOOD: warm cream/terracotta light-mode ──────────── */
  function foodDemo(t) {
    const n = t.split(' ').slice(0, 3).join(' ');
    return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${t}</title>
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--cream:#FAF6EE;--rust:#C14B2A;--brown:#2C1A0E;--warm:#7A4F35;--border:#E8DDD0}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--brown)}
nav{position:sticky;top:0;z-index:99;padding:0 48px;height:64px;display:flex;align-items:center;justify-content:space-between;background:var(--cream);border-bottom:1px solid var(--border)}
.logo{font-family:'Lora',serif;font-size:1.3rem;font-weight:600}
nav a{color:var(--warm);font-size:.88rem;text-decoration:none;margin-left:24px;transition:.2s}
nav a:hover{color:var(--rust)}
.btn-r{background:var(--rust);color:#fff;padding:9px 22px;border-radius:6px;font-weight:500;font-size:.88rem;text-decoration:none;display:inline-block;margin-left:16px}
.hero{display:grid;grid-template-columns:1fr 1fr;min-height:88vh}
.hl{padding:80px 64px;display:flex;flex-direction:column;justify-content:center;gap:20px}
.eye{font-size:.72rem;letter-spacing:3px;text-transform:uppercase;color:var(--rust);font-weight:500}
.hl h1{font-family:'Lora',serif;font-size:clamp(2.6rem,5.5vw,4.2rem);font-weight:600;line-height:1.08;letter-spacing:-.5px}
.hl h1 em{font-style:italic;color:var(--rust)}
.hl p{font-size:1rem;color:var(--warm);max-width:400px;font-weight:300;line-height:1.85}
.btns{display:flex;gap:12px}
.b-r{background:var(--rust);color:#fff;padding:12px 24px;border-radius:6px;font-weight:500;text-decoration:none;font-size:.9rem;display:inline-block}
.b-o{border:1.5px solid var(--rust);color:var(--rust);padding:11px 24px;border-radius:6px;font-weight:500;text-decoration:none;font-size:.9rem;display:inline-block}
.hr{background:#8B5E3C;display:flex;align-items:flex-end;padding:36px;font-size:8rem;opacity:.3;position:relative}
.badge{position:absolute;bottom:40px;right:40px;font-size:initial;opacity:1;background:var(--cream);padding:14px 20px;border-radius:10px}
.badge strong{font-family:'Lora',serif;font-size:1.1rem;display:block;color:var(--brown)}
.badge span{font-size:.78rem;color:var(--warm)}
.menu-s{padding:88px 48px;background:#FFF9F2;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.container{max-width:1100px;margin:0 auto}
.tag{font-size:.7rem;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:var(--rust);display:block;margin-bottom:10px}
h2{font-family:'Lora',serif;font-size:clamp(1.9rem,3.5vw,2.8rem);font-weight:600;line-height:1.15;margin-bottom:12px}
.sub{color:var(--warm);font-weight:300;max-width:480px;margin-bottom:40px}
.mgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:0;border:1px solid var(--border)}
.mi{padding:28px;border-right:1px solid var(--border);border-bottom:1px solid var(--border);transition:.2s}
.mi:hover{background:var(--cream)}
.mi h3{font-family:'Lora',serif;font-size:1.05rem;font-weight:600;margin:8px 0 6px}
.mi p{font-size:.84rem;color:var(--warm);line-height:1.65}
.price{margin-top:12px;font-size:1rem;font-weight:600;color:var(--rust)}
.cta-bar{background:var(--rust);color:#fff;text-align:center;padding:60px 32px}
.cta-bar h2{font-family:'Lora',serif;color:#fff;margin-bottom:8px}
.cta-bar p{opacity:.85;max-width:400px;margin:0 auto 28px;font-weight:300}
.b-cream{background:var(--cream);color:var(--rust);padding:13px 32px;border-radius:6px;font-weight:600;font-size:.95rem;text-decoration:none;display:inline-block}
footer{background:var(--brown);color:rgba(250,246,238,.45);text-align:center;padding:28px 24px;font-size:.78rem}
@media(max-width:768px){.hero{grid-template-columns:1fr}.hr{display:none}.hl{padding:48px 24px}}
</style></head><body>
<nav><div class="logo">🍽 ${n}</div><div><a href="#">Menu</a><a href="#">About</a><a href="#">Events</a><a href="#" class="btn-r">Reserve →</a></div></nav>
<div class="hero">
<div class="hl"><div class="eye">Farm to Table · Open Daily</div><h1>Food Made<br>with <em>Love</em><br>& Craft</h1><p>Seasonal ingredients, honest cooking, and a dining room that feels like home. Every dish tells the story of where it came from.</p><div class="btns"><a href="#" class="b-r">Reserve a Table</a><a href="#" class="b-o">Full Menu</a></div></div>
<div class="hr"><span>🍜</span><div class="badge"><strong>⭐ 4.9 Rating</strong><span>From 800+ reviews</span></div></div>
</div>
<section class="menu-s"><div class="container">
<span class="tag">Our Menu</span><h2>Crafted Fresh, Every Day</h2><p class="sub">Our chefs source locally and cook from scratch. The menu changes with the seasons.</p>
<div class="mgrid">
<div class="mi"><span style="font-size:1.6rem">🥗</span><h3>Heritage Burrata</h3><p>Heirloom tomatoes, basil oil, aged balsamic, toasted sourdough</p><div class="price">$18</div></div>
<div class="mi"><span style="font-size:1.6rem">🦆</span><h3>Duck Confit</h3><p>Slow-cooked leg, Puy lentils, roasted carrots, orange gremolata</p><div class="price">$36</div></div>
<div class="mi"><span style="font-size:1.6rem">🐟</span><h3>Pan-Seared Sea Bass</h3><p>Fennel purée, samphire, caper brown butter, lemon zest</p><div class="price">$42</div></div>
<div class="mi"><span style="font-size:1.6rem">🍮</span><h3>Vanilla Crème Brûlée</h3><p>Madagascar vanilla, caramelised crust, fresh strawberries</p><div class="price">$14</div></div>
</div></div></section>
<div class="cta-bar"><h2>Join Us Tonight</h2><p>Walk-ins welcome, but reservations are recommended on weekends.</p><a href="#" class="b-cream">Reserve Your Table →</a></div>
<footer>© 2025 ${n} · Built with ❤️ by NexusStudio</footer>
<script>document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));</script>
</body></html>`;
  }

  /* ─── TECH: white light-mode, violet accent, bold Syne ── */
  function techDemo(t) {
    const n = t.split(' ')[0];
    return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${t}</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Inter:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--w:#fff;--bg:#F7F5FF;--v:#7C3AED;--vd:#5B21B6;--txt:#0F0A1E;--mu:#6B7280;--bd:#E5E7EB}
body{font-family:'Inter',sans-serif;background:var(--w);color:var(--txt)}
nav{position:sticky;top:0;z-index:99;padding:0 48px;height:64px;display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,.9);backdrop-filter:blur(12px);border-bottom:1px solid var(--bd)}
.logo{font-family:'Syne',sans-serif;font-size:1.2rem;font-weight:800}
.logo-v{color:var(--v)}
nav a{color:var(--mu);font-size:.86rem;font-weight:500;text-decoration:none;margin-left:22px;transition:.2s}
nav a:hover{color:var(--txt)}
.btn-v{background:var(--v);color:#fff;padding:9px 20px;border-radius:8px;font-weight:600;font-size:.86rem;text-decoration:none;margin-left:14px;display:inline-block}
.hero{max-width:1100px;margin:0 auto;padding:110px 48px 90px;text-align:center;position:relative}
.hero::before{content:'';position:absolute;top:-180px;left:50%;transform:translateX(-50%);width:800px;height:800px;border-radius:50%;background:radial-gradient(circle,rgba(124,58,237,.1),transparent 65%);pointer-events:none}
.chip{display:inline-flex;align-items:center;gap:8px;background:var(--bg);border:1px solid rgba(124,58,237,.25);color:var(--v);font-size:.72rem;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:5px 14px;border-radius:100px;margin-bottom:28px}
h1{font-family:'Syne',sans-serif;font-size:clamp(3rem,7vw,5.5rem);font-weight:800;line-height:.96;letter-spacing:-3px;margin-bottom:18px}
.hv{color:var(--v)}
.sub{font-size:1.05rem;color:var(--mu);max-width:500px;margin:0 auto 40px;line-height:1.75;font-weight:300}
.hbtns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.b1{display:inline-block;background:var(--txt);color:#fff;font-weight:700;padding:14px 26px;border-radius:10px;text-decoration:none;transition:.3s;font-size:.92rem}
.b1:hover{background:var(--v);transform:translateY(-2px)}
.b2{display:inline-block;background:transparent;color:var(--txt);border:1.5px solid var(--bd);font-weight:600;padding:13px 26px;border-radius:10px;text-decoration:none;transition:.3s;font-size:.92rem}
.b2:hover{border-color:var(--v);color:var(--v)}
.pills-strip{margin-top:64px;padding-top:40px;border-top:1px solid var(--bd);text-align:center}
.pills-strip p{font-size:.72rem;text-transform:uppercase;letter-spacing:2px;color:var(--mu);margin-bottom:16px}
.pills{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.pill{background:var(--bg);border:1px solid var(--bd);border-radius:8px;padding:7px 18px;font-size:.8rem;font-weight:600;color:var(--mu)}
.feats{padding:100px 48px;background:var(--bg)}
.container{max-width:1100px;margin:0 auto}
.sh{text-align:center;margin-bottom:52px}
.sh h2{font-family:'Syne',sans-serif;font-size:clamp(2rem,4vw,2.8rem);font-weight:800;letter-spacing:-1px;margin-top:8px}
.fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px}
.fc{background:var(--w);border:1px solid var(--bd);border-radius:14px;padding:28px;transition:.3s}
.fc:hover{border-color:rgba(124,58,237,.4);transform:translateY(-4px);box-shadow:0 12px 36px rgba(124,58,237,.1)}
.fn{font-family:'Syne',sans-serif;font-size:2.2rem;font-weight:800;color:var(--bg);-webkit-text-stroke:2px rgba(124,58,237,.4);margin-bottom:12px}
.fc h3{font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;margin-bottom:8px}
.fc p{font-size:.85rem;color:var(--mu);line-height:1.7}
.cta{background:var(--txt);border-radius:20px;padding:72px 40px;text-align:center;margin-top:48px}
.cta h2{font-family:'Syne',sans-serif;font-size:clamp(1.8rem,4vw,2.6rem);font-weight:800;color:#fff;letter-spacing:-1px;margin-bottom:12px}
.cta p{color:rgba(255,255,255,.5);margin-bottom:32px;max-width:400px;margin-left:auto;margin-right:auto}
.bw{background:#fff;color:var(--txt);font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;display:inline-block;font-size:.92rem}
footer{text-align:center;padding:36px 24px;border-top:1px solid var(--bd);font-size:.78rem;color:var(--mu)}
</style></head><body>
<nav><div class="logo"><span class="logo-v">◈</span> ${n}</div><div><a href="#">Product</a><a href="#">Pricing</a><a href="#">Docs</a><a href="#" class="btn-v">Start free →</a></div></nav>
<div class="hero" style="position:relative">
<div class="chip">✦ Trusted by 10,000+ teams</div>
<h1>Stop doing<br><span class="hv">boring work.</span></h1>
<p class="sub">The automation platform that handles your repetitive workflows so your team can focus on what actually moves the needle.</p>
<div class="hbtns"><a href="#" class="b1">Try free — no card →</a><a href="#" class="b2">Watch demo ▶</a></div>
<div class="pills-strip"><p>Used by teams at</p><div class="pills"><span class="pill">Dropbox</span><span class="pill">Notion</span><span class="pill">Linear</span><span class="pill">Vercel</span><span class="pill">Loom</span></div></div>
</div>
<section class="feats"><div class="container">
<div class="sh"><span style="font-size:.7rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--v)">Features</span><h2>Everything in one place</h2></div>
<div class="fg">
<div class="fc"><div class="fn">01</div><h3>Smart Automation</h3><p>Set rules once, let the platform handle the rest. Our AI learns from your team's patterns over time.</p></div>
<div class="fc"><div class="fn">02</div><h3>Real-Time Sync</h3><p>Every action is instantly synced across your whole team. No refresh needed, no conflicts, ever.</p></div>
<div class="fc"><div class="fn">03</div><h3>400+ Integrations</h3><p>Connects with Slack, Linear, HubSpot, and your custom APIs right out of the box.</p></div>
<div class="fc"><div class="fn">04</div><h3>Deep Analytics</h3><p>Know exactly where time is being lost with AI-generated workflow recommendations.</p></div>
</div>
<div class="cta"><h2>Ready to move faster?</h2><p>10,000+ teams already use ${n}. Start your 14-day free trial — no credit card needed.</p><a href="#" class="bw">Start free trial →</a></div>
</div></section>
<footer>© 2025 ${n} · Built with ❤️ by NexusStudio</footer>
<script>document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));</script>
</body></html>`;
  }

  /* ─── CREATIVE: brutalist B&W, one red accent ─────────── */
  function creativeDemo(t) {
    const n = t.split(' ').slice(0, 2).join(' ');
    return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${t}</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Space+Mono:ital@0;1&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Space Grotesk',sans-serif;background:#F2F0EC;color:#0D0D0D;cursor:crosshair}
nav{padding:0 40px;height:60px;display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #0D0D0D;background:#F2F0EC;position:sticky;top:0;z-index:99}
.logo{font-family:'Space Mono',monospace;font-size:.95rem;letter-spacing:1px}
ul{display:flex;list-style:none}
ul li a{display:block;color:#0D0D0D;font-size:.8rem;font-weight:500;text-decoration:none;padding:0 16px;height:60px;line-height:60px;border-left:2px solid #0D0D0D;transition:background .2s}
ul li a:hover{background:#0D0D0D;color:#F2F0EC}
.hero{display:grid;grid-template-columns:1fr 1fr;min-height:calc(100vh - 62px);border-bottom:2px solid #0D0D0D}
.hl{padding:64px;border-right:2px solid #0D0D0D;display:flex;flex-direction:column;justify-content:space-between}
.hl h1{font-size:clamp(3.5rem,9vw,7.5rem);font-weight:700;line-height:.9;letter-spacing:-4px;text-transform:uppercase}
.red{color:#D0002A}
.hl p{font-family:'Space Mono',monospace;font-size:.76rem;color:#555;line-height:1.8;max-width:300px;font-style:italic}
.meta{display:flex;gap:28px}
.mi span{display:block;font-size:.62rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#888;margin-bottom:3px}
.mi strong{font-size:.95rem;font-weight:700}
.hr{display:grid;grid-template-rows:1fr 1fr}
.himg{background:#D0D0C8;display:flex;align-items:center;justify-content:center;font-size:4.5rem;opacity:.45;border-bottom:2px solid #0D0D0D;transition:.4s}
.himg:hover{background:#0D0D0D;font-size:6.5rem;opacity:.9}
.himg:last-child{border-bottom:none}
.cta-link{display:block;background:#D0002A;color:#fff;text-align:center;padding:18px;font-weight:700;font-size:.88rem;text-decoration:none;letter-spacing:1px;text-transform:uppercase;transition:.25s;border-top:2px solid #0D0D0D}
.cta-link:hover{background:#AA0020}
.wgrid{display:grid;grid-template-columns:repeat(4,1fr);border-top:2px solid #0D0D0D}
.wb{border-right:2px solid #0D0D0D;padding:36px 28px;transition:.25s}
.wb:last-child{border-right:none}
.wb:hover{background:#0D0D0D;color:#F2F0EC}
.wn{font-family:'Space Mono',monospace;font-size:2rem;color:#CCC;margin-bottom:14px;display:block;transition:.2s}
.wb:hover .wn{color:#555}
.wb h3{font-size:.88rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px}
.wb p{font-family:'Space Mono',monospace;font-size:.7rem;color:#666;line-height:1.7;font-style:italic}
.wb:hover p{color:#AAA}
.cs{background:#0D0D0D;color:#F2F0EC;padding:72px 64px;display:flex;align-items:center;justify-content:space-between;gap:36px;flex-wrap:wrap}
.cs h2{font-size:clamp(1.8rem,4vw,2.8rem);font-weight:700;text-transform:uppercase;letter-spacing:-1px}
.cs h2 span{color:#D0002A}
.bw{border:2px solid #F2F0EC;color:#F2F0EC;padding:13px 26px;font-weight:700;font-size:.86rem;letter-spacing:1px;text-transform:uppercase;text-decoration:none;display:inline-block;transition:.2s}
.bw:hover{background:#F2F0EC;color:#0D0D0D}
footer{padding:20px 40px;border-top:2px solid #0D0D0D;display:flex;justify-content:space-between;font-family:'Space Mono',monospace;font-size:.68rem;color:#888}
@media(max-width:768px){.hero{grid-template-columns:1fr}.hr{display:none}.wgrid{grid-template-columns:1fr 1fr}}
</style></head><body>
<nav><div class="logo">${n.toUpperCase()}</div><ul><li><a href="#">Work</a></li><li><a href="#">About</a></li><li><a href="#">Journal</a></li><li><a href="#">Contact</a></li></ul></nav>
<div class="hero">
<div class="hl"><div><h1>Visual<br>Story<br><span class="red">tell</span><br>ing.</h1></div><p>// Photography & creative direction for brands that refuse to be ordinary.</p><div class="meta"><div class="mi"><span>Since</span><strong>2018</strong></div><div class="mi"><span>Projects</span><strong>240+</strong></div><div class="mi"><span>Awards</span><strong>12</strong></div></div></div>
<div class="hr"><div class="himg">🌑</div><div class="himg">🌿</div></div>
</div>
<a href="#" class="cta-link">↓ View Selected Work (2024)</a>
<div class="wgrid">
<div class="wb"><span class="wn">01</span><h3>Editorial</h3><p>Magazine covers, fashion weeks, and editorial spreads for print and digital.</p></div>
<div class="wb"><span class="wn">02</span><h3>Commercial</h3><p>Campaign photography for consumer brands, launches, and retail.</p></div>
<div class="wb"><span class="wn">03</span><h3>Portrait</h3><p>Intimate portraiture for artists, executives, and musicians. No artificial lighting.</p></div>
<div class="wb"><span class="wn">04</span><h3>Film</h3><p>Medium-format 35mm. Pure analogue — no digital grain filters.</p></div>
</div>
<div class="cs"><div><h2>Have a project<br>in <span>mind?</span></h2><p style="color:rgba(242,240,236,.5);margin-top:8px;font-size:.84rem">I take on 4–6 commissions per quarter.</p></div><a href="mailto:hello@studio.com" class="bw">Get in Touch →</a></div>
<footer><span>© 2025 ${n}</span><span>Built with ❤️ by NexusStudio</span></footer>
<script>document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));</script>
</body></html>`;
  }

  /* ─── FITNESS: lime green on near-black, Oswald ───────── */
  function fitnessDemo(t) {
    const n = t.split(' ').slice(0, 2).join(' ');
    return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${t}</title>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bk:#0A0A0A;--dk:#111;--lime:#C8FB4E;--ld:#A8D630;--w:#fff;--gr:#888;--ca:#1A1A1A}
body{font-family:'Inter',sans-serif;background:var(--bk);color:var(--w);overflow-x:hidden}
nav{padding:0 48px;height:64px;display:flex;align-items:center;justify-content:space-between;background:var(--bk);border-bottom:1px solid #1F1F1F;position:sticky;top:0;z-index:99}
.logo{font-family:'Oswald',sans-serif;font-size:1.4rem;font-weight:700;letter-spacing:2px;text-transform:uppercase}
.logo em{color:var(--lime);font-style:normal}
nav a{color:var(--gr);font-size:.83rem;font-weight:500;text-decoration:none;margin-left:22px;text-transform:uppercase;letter-spacing:.8px;transition:.2s}
nav a:hover{color:var(--w)}
.bl{background:var(--lime);color:var(--bk);padding:10px 22px;border-radius:4px;font-weight:700;font-size:.8rem;text-decoration:none;text-transform:uppercase;letter-spacing:1px;display:inline-block;margin-left:18px}
.hero{min-height:100vh;display:grid;grid-template-columns:1.2fr 1fr;overflow:hidden}
.hl{padding:100px 64px;display:flex;flex-direction:column;justify-content:center;background:var(--bk);position:relative}
.hl::after{content:'';position:absolute;top:0;right:0;width:2px;height:100%;background:var(--lime)}
.htag{font-family:'Oswald',sans-serif;font-size:.7rem;font-weight:500;letter-spacing:4px;text-transform:uppercase;color:var(--lime);margin-bottom:20px}
h1{font-family:'Oswald',sans-serif;font-size:clamp(4rem,9vw,7rem);font-weight:700;line-height:.88;letter-spacing:-1px;text-transform:uppercase;margin-bottom:26px}
.hl{gap:0}
.lh{color:var(--lime)}
.hp{font-size:1rem;color:var(--gr);max-width:400px;margin-bottom:38px;line-height:1.8;font-weight:300}
.hbtns{display:flex;gap:12px}
.bil{background:var(--lime);color:var(--bk);font-weight:700;padding:14px 26px;border-radius:4px;text-decoration:none;font-size:.9rem;text-transform:uppercase;letter-spacing:1px;display:inline-block}
.bgw{border:1.5px solid #2A2A2A;color:var(--w);font-weight:600;padding:13px 26px;border-radius:4px;text-decoration:none;font-size:.9rem;text-transform:uppercase;letter-spacing:.8px;display:inline-block;transition:.2s}
.bgw:hover{border-color:var(--lime);color:var(--lime)}
.hstats{display:flex;gap:36px;margin-top:56px;padding-top:36px;border-top:1px solid #1F1F1F}
.sv{font-family:'Oswald',sans-serif;font-size:2.6rem;font-weight:700;color:var(--lime);line-height:1}
.sl{font-size:.7rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--gr);margin-top:4px}
.hr{background:var(--dk);display:flex;align-items:center;justify-content:center;font-size:9rem;opacity:.22;position:relative}
.hr::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(200,251,78,.07),transparent 60%)}
.progs{padding:90px 48px;background:var(--dk)}
.container{max-width:1100px;margin:0 auto}
.sh{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px;flex-wrap:wrap;gap:14px}
.sh h2{font-family:'Oswald',sans-serif;font-size:clamp(2rem,5vw,3.2rem);font-weight:700;text-transform:uppercase;letter-spacing:-1px}
.sh h2 span{color:var(--lime)}
.pg{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:2px}
.pc{background:var(--ca);padding:30px;transition:.3s;border:2px solid transparent;cursor:pointer}
.pc:hover{border-color:var(--lime);background:#1F1F1F}
.pc h3{font-family:'Oswald',sans-serif;font-size:1.2rem;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin:12px 0 6px}
.pc p{font-size:.82rem;color:var(--gr);line-height:1.65}
.pd{margin-top:14px;display:flex;gap:14px}
.pd span{font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:var(--lime)}
.cbar{background:var(--lime);padding:64px;display:flex;align-items:center;justify-content:space-between;gap:36px;flex-wrap:wrap}
.cbar h2{font-family:'Oswald',sans-serif;font-size:clamp(2rem,5vw,3.2rem);font-weight:700;text-transform:uppercase;color:var(--bk);letter-spacing:-1px;line-height:1}
.cbar p{color:rgba(10,10,10,.65);max-width:340px;margin-bottom:20px}
.bbk{background:var(--bk);color:var(--lime);font-weight:700;padding:14px 28px;border-radius:4px;text-decoration:none;font-size:.9rem;text-transform:uppercase;letter-spacing:1px;display:inline-block}
footer{padding:28px 48px;border-top:1px solid #1A1A1A;display:flex;justify-content:space-between;font-size:.76rem;color:var(--gr)}
@media(max-width:768px){.hero{grid-template-columns:1fr}.hr{display:none}.hl{padding:56px 24px}}
</style></head><body>
<nav><div class="logo"><em>▲</em> ${n.toUpperCase()}</div><div><a href="#">Programs</a><a href="#">Coaches</a><a href="#">Pricing</a><a href="#" class="bl">Join Now</a></div></nav>
<div class="hero">
<div class="hl">
<div class="htag">// Est. 2024 — Results-first fitness</div>
<h1>Train<br>Hard.<br><span class="lh">Live</span><br>Bold.</h1>
<p class="hp">Science-backed programming, expert coaching, and a community that doesn't accept excuses. Your transformation starts on day one.</p>
<div class="hbtns"><a href="#" class="bil">Start Free Trial →</a><a href="#" class="bgw">See Programs</a></div>
<div class="hstats"><div><div class="sv">2K+</div><div class="sl">Members</div></div><div><div class="sv">94%</div><div class="sl">Hit Goals</div></div><div><div class="sv">50+</div><div class="sl">Classes/wk</div></div></div>
</div>
<div class="hr">💪</div>
</div>
<section class="progs"><div class="container">
<div class="sh"><h2>Choose Your <span>Path</span></h2></div>
<div class="pg">
<div class="pc"><span style="font-size:1.8rem">🔥</span><h3>HIIT Burn</h3><p>High-intensity intervals that torch calories for up to 48 hours post-session.</p><div class="pd"><span>45 min</span><span>All levels</span><span>6×/wk</span></div></div>
<div class="pc"><span style="font-size:1.8rem">🏋️</span><h3>Strength Build</h3><p>Progressive overload programming to build functional muscle and lasting power.</p><div class="pd"><span>60 min</span><span>Intermediate</span><span>4×/wk</span></div></div>
<div class="pc"><span style="font-size:1.8rem">🧘</span><h3>Mobility Flow</h3><p>Recovery-focused yoga and mobility work to keep your body performing optimally.</p><div class="pd"><span>45 min</span><span>Beginner</span><span>Daily</span></div></div>
<div class="pc"><span style="font-size:1.8rem">🏃</span><h3>Endurance</h3><p>Running-based cardio programming built around your personal pace and race goals.</p><div class="pd"><span>50 min</span><span>All levels</span><span>5×/wk</span></div></div>
</div></div></section>
<div class="cbar"><div><h2>Ready to<br>Start?</h2><p style="margin-top:8px">First 2 weeks are completely free. No commitment. Just show up and put in the work.</p><a href="#" class="bbk">Start Free — No Card →</a></div></div>
<footer><span>© 2025 ${n}</span><span>Built with ❤️ by NexusStudio</span></footer>
<script>document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));</script>
</body></html>`;
  }

  /* ─── GENERIC: white light-mode, coral/orange, Outfit ─── */
  function genericDemo(t) {
    const n = t.split(' ').slice(0, 2).join(' ');
    return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${t}</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--w:#fff;--bg:#FAFAF8;--c:#F05A28;--cd:#D44A1E;--txt:#1C1C1C;--mu:#767676;--bd:#E8E5E0}
body{font-family:'Outfit',sans-serif;background:var(--bg);color:var(--txt)}
nav{padding:0 48px;height:64px;display:flex;align-items:center;justify-content:space-between;background:var(--w);border-bottom:1px solid var(--bd);position:sticky;top:0;z-index:99}
.logo{font-size:1.2rem;font-weight:800;letter-spacing:-.3px}
nav a{color:var(--mu);font-size:.86rem;font-weight:500;text-decoration:none;margin-left:22px;transition:.2s}
nav a:hover{color:var(--txt)}
.bc{background:var(--c);color:#fff;padding:9px 20px;border-radius:8px;font-weight:600;font-size:.86rem;text-decoration:none;display:inline-block;margin-left:14px}
.hero{background:var(--w);display:grid;grid-template-columns:1.1fr 1fr;gap:72px;align-items:center;padding:100px 48px;max-width:1200px;margin:0 auto}
.htag{display:inline-flex;align-items:center;gap:6px;background:#FEF2EE;color:var(--c);font-size:.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:5px 14px;border-radius:100px;margin-bottom:18px;border:1px solid rgba(240,90,40,.25)}
h1{font-size:clamp(2.6rem,5.5vw,4rem);font-weight:800;line-height:1.05;letter-spacing:-1.5px;margin-bottom:16px}
h1 span{color:var(--c)}
.hp{font-size:1rem;color:var(--mu);max-width:430px;margin-bottom:34px;line-height:1.75}
.hbtns{display:flex;gap:12px;flex-wrap:wrap}
.b1{background:var(--c);color:#fff;font-weight:700;padding:14px 26px;border-radius:10px;text-decoration:none;transition:.3s;font-size:.92rem;display:inline-block}
.b1:hover{background:var(--cd);transform:translateY(-2px)}
.b2{background:transparent;color:var(--txt);border:1.5px solid var(--bd);font-weight:600;padding:13px 26px;border-radius:10px;text-decoration:none;transition:.3s;font-size:.92rem;display:inline-block}
.b2:hover{border-color:var(--c);color:var(--c)}
.hcards{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.hc{background:var(--bg);border:1px solid var(--bd);border-radius:14px;padding:22px;transition:.3s}
.hc:hover{border-color:rgba(240,90,40,.3);transform:translateY(-3px)}
.hc .num{font-size:1.9rem;font-weight:800;color:var(--c);letter-spacing:-1px;line-height:1}
.hc .lbl{font-size:.78rem;color:var(--mu);margin-top:4px}
.hc:first-child{grid-column:span 2;background:var(--c)}
.hc:first-child .num{font-size:2.8rem;color:#fff}
.hc:first-child .lbl{color:rgba(255,255,255,.7);font-size:.88rem;margin-top:6px}
section{padding:90px 48px}
.container{max-width:1100px;margin:0 auto}
.sv{background:var(--bg)}
.sh{text-align:center;margin-bottom:48px}
.sh h2{font-size:clamp(1.9rem,4vw,2.6rem);font-weight:800;margin-top:8px;letter-spacing:-.5px}
.sgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px}
.sc{background:var(--w);border:1px solid var(--bd);border-radius:14px;padding:28px;transition:.3s}
.sc:hover{border-color:rgba(240,90,40,.3);transform:translateY(-4px);box-shadow:0 14px 40px rgba(0,0,0,.06)}
.si{width:42px;height:42px;border-radius:10px;background:#FEF2EE;border:1px solid rgba(240,90,40,.2);display:flex;align-items:center;justify-content:center;font-size:1.1rem;margin-bottom:16px}
.sc h3{font-size:.97rem;font-weight:700;margin-bottom:7px}
.sc p{font-size:.83rem;color:var(--mu);line-height:1.7}
.ctas{background:var(--c);border-radius:20px;padding:72px 56px;text-align:center;margin-top:48px}
.ctas h2{font-size:clamp(1.9rem,4vw,2.6rem);font-weight:800;color:#fff;letter-spacing:-.5px;margin-bottom:10px}
.ctas p{color:rgba(255,255,255,.72);margin-bottom:30px;max-width:400px;margin-left:auto;margin-right:auto}
.bw{background:#fff;color:var(--c);font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;display:inline-block;font-size:.92rem}
footer{text-align:center;padding:32px 24px;border-top:1px solid var(--bd);font-size:.78rem;color:var(--mu)}
@media(max-width:900px){.hero{grid-template-columns:1fr;gap:40px;padding:70px 24px}.hcards{max-width:380px}}
</style></head><body>
<nav><div class="logo">${n}</div><div><a href="#">Services</a><a href="#">About</a><a href="#">Work</a><a href="#" class="bc">Get Started →</a></div></nav>
<div style="background:var(--w)"><div style="max-width:1200px;margin:0 auto">
<div class="hero" style="max-width:100%;margin:0">
<div><div class="htag">⭐ Rated #1 in Client Satisfaction · 2024</div>
<h1>We help your<br>business <span>thrive</span>.</h1>
<p class="hp">Exceptional service, transparent process, and measurable results. We partner with businesses like yours to deliver outcomes — not just deliverables.</p>
<div class="hbtns"><a href="#" class="b1">Start a Project →</a><a href="#" class="b2">See Our Work</a></div></div>
<div class="hcards">
<div class="hc"><div style="font-size:1.8rem;margin-bottom:6px">🏆</div><div class="num">98%</div><div class="lbl">Client Retention Rate</div></div>
<div class="hc"><div class="num">5yr</div><div class="lbl">Avg. Client Relationship</div></div>
<div class="hc"><div class="num">300+</div><div class="lbl">Projects Delivered</div></div>
</div></div></div></div>
<section class="sv"><div class="container">
<div class="sh"><span style="font-size:.7rem;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:var(--c)">What We Do</span><h2>Comprehensive solutions,<br>simply delivered</h2></div>
<div class="sgrid">
<div class="sc"><div class="si">🎯</div><h3>Strategy & Consulting</h3><p>Clear, actionable strategies built around your unique goals and market position.</p></div>
<div class="sc"><div class="si">⚙️</div><h3>Implementation</h3><p>We don't just advise — we execute. On time, on budget, no excuses.</p></div>
<div class="sc"><div class="si">📊</div><h3>Performance Tracking</h3><p>Clear KPIs and weekly progress reports so you always know where things stand.</p></div>
<div class="sc"><div class="si">🤝</div><h3>Ongoing Partnership</h3><p>Long-term relationships, not transactional engagements. Your success is our reputation.</p></div>
</div>
<div class="ctas"><h2>Ready to grow?</h2><p>Book a free 30-minute call. We'll tell you honestly if we're the right fit.</p><a href="#" class="bw">Book Free Consultation →</a></div>
</div></section>
<footer>© 2025 ${n} · All rights reserved · Built with ❤️ by NexusStudio</footer>
<script>document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));</script>
</body></html>`;
  }

  /* ─── REAL ESTATE: warm sand/gold, luxury modern ───────── */
  function realtyDemo(t) {
    const n = t.split(' ').slice(0, 3).join(' ');
    return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${t}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--sand:#F5EFE0;--gold:#B59A6A;--dark:#1C1912;--warm:#3A2E1E;--mid:#6B5B42;--bd:#DDD5C4}
body{font-family:'Jost',sans-serif;background:var(--sand);color:var(--dark)}
nav{position:sticky;top:0;z-index:99;padding:0 60px;height:68px;display:flex;align-items:center;justify-content:space-between;background:rgba(245,239,224,.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--bd)}
.logo{font-family:'Cormorant Garamond',serif;font-size:1.35rem;font-weight:600;letter-spacing:1px}
nav a{color:var(--mid);font-size:.84rem;font-weight:400;text-decoration:none;margin-left:28px;letter-spacing:.5px;transition:.2s}
nav a:hover{color:var(--gold)}
.btn-g{border:1px solid var(--gold);color:var(--gold);padding:9px 22px;font-weight:500;font-size:.82rem;text-decoration:none;letter-spacing:.5px;display:inline-block;margin-left:20px;transition:.25s}
.btn-g:hover{background:var(--gold);color:var(--sand)}
.hero{min-height:92vh;background:#2A2218;display:flex;align-items:center;justify-content:center;text-align:center;position:relative;overflow:hidden;padding:0 32px}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 60% at 50% 40%,rgba(181,154,106,.18),transparent 65%)}
.hero-content{position:relative;z-index:1;max-width:760px}
.hero-label{font-family:'Jost',sans-serif;font-size:.7rem;font-weight:500;letter-spacing:5px;text-transform:uppercase;color:var(--gold);margin-bottom:24px;display:block}
h1{font-family:'Cormorant Garamond',serif;font-size:clamp(3rem,7vw,5.5rem);font-weight:500;line-height:1.05;color:#F5EFE0;margin-bottom:20px;letter-spacing:-.5px}
.hero-sub{font-size:1rem;color:rgba(245,239,224,.55);max-width:480px;margin:0 auto 40px;font-weight:300;line-height:1.85}
.h-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.b-gold{background:var(--gold);color:var(--dark);padding:13px 30px;font-weight:500;letter-spacing:.5px;text-decoration:none;display:inline-block;transition:.25s;font-size:.9rem}
.b-gold:hover{background:#C9AD7E}
.b-out{border:1px solid rgba(245,239,224,.3);color:rgba(245,239,224,.8);padding:12px 30px;font-weight:400;letter-spacing:.5px;text-decoration:none;display:inline-block;transition:.25s;font-size:.9rem}
.b-out:hover{border-color:var(--gold);color:var(--gold)}
.h-stats{display:flex;gap:56px;justify-content:center;margin-top:64px;flex-wrap:wrap}
.hs-v{font-family:'Cormorant Garamond',serif;font-size:2.6rem;font-weight:600;color:var(--gold);line-height:1}
.hs-l{font-size:.7rem;letter-spacing:2px;text-transform:uppercase;color:rgba(245,239,224,.45);margin-top:5px}
.listings{padding:96px 60px;background:var(--sand)}
.container{max-width:1100px;margin:0 auto}
.sh{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:44px;flex-wrap:wrap;gap:14px}
.sh-l{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,4vw,3rem);font-weight:500;letter-spacing:-.3px}
.sh-tag{font-size:.7rem;font-weight:500;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:8px;display:block}
.lgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}
.lcard{background:#fff;border:1px solid var(--bd);overflow:hidden;transition:.35s}
.lcard:hover{transform:translateY(-4px);box-shadow:0 20px 48px rgba(28,25,18,.12)}
.limg{background:#D4C9B0;height:200px;display:flex;align-items:center;justify-content:center;font-size:4rem;opacity:.5;position:relative}
.ltag{position:absolute;top:14px;left:14px;background:var(--gold);color:var(--dark);font-size:.68rem;font-weight:600;letter-spacing:1px;text-transform:uppercase;padding:4px 12px}
.lbody{padding:24px}
.lprice{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:600;margin-bottom:4px;color:var(--dark)}
.laddr{font-size:.82rem;color:var(--mid);margin-bottom:14px}
.lfacts{display:flex;gap:16px;font-size:.78rem;color:var(--mid);border-top:1px solid var(--bd);padding-top:12px;margin-top:12px}
.cta-s{background:#1C1912;text-align:center;padding:80px 60px;margin-top:60px}
.cta-s h2{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,4vw,3rem);font-weight:500;color:var(--sand);margin-bottom:12px}
.cta-s p{color:rgba(245,239,224,.5);margin-bottom:36px;max-width:440px;margin-left:auto;margin-right:auto;font-weight:300}
footer{text-align:center;padding:32px 24px;border-top:1px solid var(--bd);font-size:.78rem;color:var(--mid)}
</style></head><body>
<nav><div class="logo">${n}</div><div><a href="#">Buy</a><a href="#">Sell</a><a href="#">Rentals</a><a href="#">About</a><a href="#" class="btn-g">Contact Agent</a></div></nav>
<div class="hero">
<div class="hero-content">
<span class="hero-label">Luxury Real Estate · Est. 2010</span>
<h1>Find the Home<br>You Deserve</h1>
<p class="hero-sub">Premium properties in the most sought-after neighbourhoods. Expert guidance from first viewing to final close.</p>
<div class="h-btns"><a href="#" class="b-gold">View Listings →</a><a href="#" class="b-out">Book Consultation</a></div>
<div class="h-stats">
<div><div class="hs-v">1,200+</div><div class="hs-l">Properties Sold</div></div>
<div><div class="hs-v">$2.4B</div><div class="hs-l">In Transactions</div></div>
<div><div class="hs-v">98%</div><div class="hs-l">Client Satisfaction</div></div>
</div></div></div>
<section class="listings"><div class="container">
<div class="sh"><div><span class="sh-tag">Featured Properties</span><div class="sh-l">Curated Listings</div></div><a href="#" class="btn-g">All Properties</a></div>
<div class="lgrid">
<div class="lcard"><div class="limg"><span>🏛️</span><span class="ltag">For Sale</span></div><div class="lbody"><div class="lprice">$2,450,000</div><div class="laddr">14 Elmwood Drive, Riverside Heights</div><div class="lfacts"><span>4 Beds</span><span>3 Baths</span><span>3,200 sqft</span></div></div></div>
<div class="lcard"><div class="limg"><span>🏠</span><span class="ltag">Just Listed</span></div><div class="lbody"><div class="lprice">$1,180,000</div><div class="laddr">87 Crestview Lane, Maplewood</div><div class="lfacts"><span>3 Beds</span><span>2 Baths</span><span>1,980 sqft</span></div></div></div>
<div class="lcard"><div class="limg"><span>🏢</span><span class="ltag">Penthouse</span></div><div class="lbody"><div class="lprice">$4,750,000</div><div class="laddr">Apt 42, The Meridian Tower, Downtown</div><div class="lfacts"><span>3 Beds</span><span>3 Baths</span><span>4,100 sqft</span></div></div></div>
</div>
<div class="cta-s"><h2>Ready to Find Your Home?</h2><p>Let one of our senior agents guide you through every step of the process — from discovery to keys in hand.</p><a href="#" class="b-gold">Schedule a Free Consultation →</a></div>
</div></section>
<footer>© 2025 ${n} · All rights reserved · Built with ❤️ by NexusStudio</footer>
<script>document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));</script>
</body></html>`;
  }

  /* ─── BEAUTY/SALON: soft blush rose, elegant serif ───────── */
  function beautyDemo(t) {
    const n = t.split(' ').slice(0, 2).join(' ');
    return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${t}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--blush:#FBF0EC;--rose:#C97B6E;--rose-d:#A85F53;--dusty:#8B6B66;--nude:#F0E0D8;--txt:#2A1C1A;--bd:#E8D5CF}
body{font-family:'Lato',sans-serif;background:var(--blush);color:var(--txt)}
nav{position:sticky;top:0;z-index:99;padding:0 56px;height:66px;display:flex;align-items:center;justify-content:space-between;background:rgba(251,240,236,.95);backdrop-filter:blur(10px);border-bottom:1px solid var(--bd)}
.logo{font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:700;letter-spacing:.5px}
nav a{color:var(--dusty);font-size:.84rem;font-weight:300;text-decoration:none;margin-left:24px;letter-spacing:.8px;transition:.2s;text-transform:uppercase}
nav a:hover{color:var(--rose)}
.btn-rose{background:var(--rose);color:#fff;padding:9px 22px;font-weight:700;font-size:.8rem;text-decoration:none;border-radius:2px;margin-left:18px;letter-spacing:.5px;display:inline-block;transition:.25s}
.btn-rose:hover{background:var(--rose-d)}
.hero{display:grid;grid-template-columns:1fr 1fr;min-height:90vh}
.hl{background:var(--nude);padding:80px 64px;display:flex;flex-direction:column;justify-content:center;gap:20px}
.htag{font-size:.68rem;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:var(--rose)}
.hl h1{font-family:'Playfair Display',serif;font-size:clamp(2.5rem,5vw,4rem);font-weight:700;line-height:1.1;letter-spacing:-.3px}
.hl h1 em{font-style:italic;color:var(--rose)}
.hl p{font-size:.97rem;color:var(--dusty);max-width:400px;line-height:1.85;font-weight:300}
.h-btns{display:flex;gap:12px;flex-wrap:wrap}
.b1{background:var(--rose);color:#fff;padding:13px 26px;font-weight:700;font-size:.88rem;text-decoration:none;border-radius:2px;display:inline-block;transition:.25s;letter-spacing:.5px}
.b1:hover{background:var(--rose-d)}
.b2{border:1px solid var(--bd);color:var(--dusty);padding:12px 26px;font-weight:400;font-size:.88rem;text-decoration:none;border-radius:2px;display:inline-block;transition:.25s;letter-spacing:.5px}
.b2:hover{border-color:var(--rose);color:var(--rose)}
.hr{background:#C4A098;display:flex;align-items:center;justify-content:center;font-size:9rem;opacity:.25}
section{padding:88px 56px}
.container{max-width:1100px;margin:0 auto}
.sh-tag{font-size:.68rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--rose);margin-bottom:12px;display:block}
h2{font-family:'Playfair Display',serif;font-size:clamp(1.9rem,3.5vw,2.8rem);font-weight:700;line-height:1.2;margin-bottom:14px;letter-spacing:-.2px}
.sub{color:var(--dusty);font-weight:300;line-height:1.8;max-width:480px;font-size:.95rem}
.sgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:2px;margin-top:48px}
.sc{background:var(--nude);padding:36px 28px;transition:.3s;cursor:pointer}
.sc:hover{background:#EDD5CB}
.si{font-size:2rem;margin-bottom:14px;display:block}
.sc h3{font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700;margin-bottom:8px}
.sc p{font-size:.84rem;color:var(--dusty);line-height:1.7;font-weight:300}
.sc-price{margin-top:12px;font-size:.9rem;font-weight:700;color:var(--rose)}
.booking{background:var(--rose);text-align:center;padding:80px 40px;margin-top:60px}
.booking h2{font-family:'Playfair Display',serif;color:#fff;margin-bottom:12px}
.booking p{color:rgba(255,255,255,.8);max-width:440px;margin:0 auto 32px;font-weight:300}
.b-cream{background:var(--blush);color:var(--rose-d);padding:13px 32px;font-weight:700;font-size:.9rem;text-decoration:none;border-radius:2px;display:inline-block;letter-spacing:.5px}
footer{text-align:center;padding:32px 24px;border-top:1px solid var(--bd);font-size:.78rem;color:var(--dusty)}
@media(max-width:768px){.hero{grid-template-columns:1fr}.hr{display:none}.hl{padding:56px 24px}}
</style></head><body>
<nav><div class="logo">✦ ${n}</div><div><a href="#">Services</a><a href="#">Gallery</a><a href="#">Prices</a><a href="#" class="btn-rose">Book Now</a></div></nav>
<div class="hero">
<div class="hl">
<div class="htag">Beauty Studio · Est. 2018</div>
<h1>Feel Your<br>Most <em>Beautiful</em></h1>
<p>Precision cuts, flawless colour, and treatments that leave you glowing. Every visit is a moment of calm, confidence, and care.</p>
<div class="h-btns"><a href="#" class="b1">Book an Appointment</a><a href="#" class="b2">Our Services</a></div>
</div>
<div class="hr">🌸</div>
</div>
<section style="background:var(--blush)"><div class="container">
<div style="text-align:center;margin-bottom:4px"><span class="sh-tag">Our Services</span>
<h2>Everything You Need<br>to Shine</h2></div>
<div class="sgrid">
<div class="sc"><span class="si">✂️</span><h3>Cut & Style</h3><p>Precision haircuts and blowouts tailored to your face shape and lifestyle.</p><div class="sc-price">From $75</div></div>
<div class="sc"><span class="si">🎨</span><h3>Colour & Balayage</h3><p>Lived-in colour, bold statements, and everything in between. Corrective colour welcome.</p><div class="sc-price">From $120</div></div>
<div class="sc"><span class="si">💅</span><h3>Nail Art</h3><p>Gels, acrylics, nail art, and full manicure + pedicure treatments.</p><div class="sc-price">From $55</div></div>
<div class="sc"><span class="si">✨</span><h3>Facial & Skin</h3><p>Deep cleanse facials, lash lifts, brow shaping, and full skin therapy packages.</p><div class="sc-price">From $90</div></div>
</div>
<div class="booking"><h2>Ready for a New Look?</h2><p>Book your appointment online in under 60 seconds. We're open 7 days a week.</p><a href="#" class="b-cream">Book Your Appointment →</a></div>
</div></section>
<footer>© 2025 ${n} · All rights reserved · Built with ❤️ by NexusStudio</footer>
<script>document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));</script>
</body></html>`;
  }

  /* ─── LAW: authoritative navy/gold, formal serif ─────────── */
  function lawDemo(t) {
    const n = t.split(' ').slice(0, 3).join(' ');
    return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${t}</title>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--navy:#0D1B2A;--navy-mid:#1B2E42;--gold:#C9A84C;--cream:#F8F5EF;--txt:#1A1A1A;--mu:#5A6272;--bd:#DDD8CF}
body{font-family:'Source Sans 3',sans-serif;background:var(--cream);color:var(--txt);font-size:16px}
nav{position:sticky;top:0;z-index:99;padding:0 60px;height:68px;display:flex;align-items:center;justify-content:space-between;background:var(--navy);border-bottom:1px solid rgba(201,168,76,.2)}
.logo{font-family:'EB Garamond',serif;font-size:1.25rem;font-weight:600;color:#F8F5EF;letter-spacing:.5px}
nav a{color:rgba(248,245,239,.6);font-size:.84rem;font-weight:400;text-decoration:none;margin-left:28px;letter-spacing:.3px;transition:.2s}
nav a:hover{color:var(--gold)}
.btn-g{border:1px solid var(--gold);color:var(--gold);padding:8px 20px;font-weight:500;font-size:.82rem;text-decoration:none;display:inline-block;margin-left:20px;transition:.25s;letter-spacing:.3px}
.btn-g:hover{background:var(--gold);color:var(--navy)}
.hero{background:var(--navy);padding:120px 60px;display:grid;grid-template-columns:1.1fr 1fr;gap:80px;align-items:center}
.hero::before{display:none}
.hl h1{font-family:'EB Garamond',serif;font-size:clamp(2.5rem,5vw,4rem);font-weight:600;line-height:1.1;color:#F8F5EF;margin-bottom:20px;letter-spacing:-.3px}
.hl h1 em{font-style:italic;color:var(--gold)}
.hl p{font-size:1rem;color:rgba(248,245,239,.6);line-height:1.85;max-width:440px;margin-bottom:36px;font-weight:300}
.h-btns{display:flex;gap:14px;flex-wrap:wrap}
.b1{background:var(--gold);color:var(--navy);padding:13px 28px;font-weight:600;font-size:.9rem;text-decoration:none;display:inline-block;transition:.25s}
.b1:hover{background:#DFB95A}
.b2{border:1px solid rgba(248,245,239,.25);color:rgba(248,245,239,.8);padding:12px 28px;font-weight:400;font-size:.9rem;text-decoration:none;display:inline-block;transition:.25s}
.b2:hover{border-color:var(--gold);color:var(--gold)}
.hcard{background:rgba(255,255,255,.05);border:1px solid rgba(201,168,76,.2);padding:36px}
.hc-tag{font-size:.68rem;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:16px;display:block}
.hcard h3{font-family:'EB Garamond',serif;font-size:1.25rem;font-weight:600;color:#F8F5EF;margin-bottom:12px}
.hcard p{font-size:.88rem;color:rgba(248,245,239,.55);line-height:1.75;font-weight:300}
.hcard ul{margin-top:16px;color:rgba(248,245,239,.6);font-size:.84rem;padding-left:16px;line-height:2}
section{padding:96px 60px}
.container{max-width:1100px;margin:0 auto}
.sh-tag{font-size:.68rem;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:12px;display:block}
h2{font-family:'EB Garamond',serif;font-size:clamp(2rem,4vw,3rem);font-weight:600;line-height:1.15;margin-bottom:14px;letter-spacing:-.2px}
.pgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1px;background:var(--bd);margin-top:52px;border:1px solid var(--bd)}
.pc{background:var(--cream);padding:36px 28px;transition:.25s}
.pc:hover{background:#fff}
.pc-n{font-family:'EB Garamond',serif;font-size:.8rem;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--gold);margin-bottom:10px;display:block}
.pc h3{font-family:'EB Garamond',serif;font-size:1.15rem;font-weight:600;margin-bottom:10px}
.pc p{font-size:.86rem;color:var(--mu);line-height:1.72;font-weight:300}
.cta-s{background:var(--navy-mid);padding:80px 60px;text-align:center;margin-top:60px}
.cta-s h2{font-family:'EB Garamond',serif;font-size:clamp(2rem,4vw,3rem);font-weight:600;color:#F8F5EF;margin-bottom:12px}
.cta-s p{color:rgba(248,245,239,.55);margin-bottom:36px;max-width:460px;margin-left:auto;margin-right:auto;font-weight:300}
footer{background:var(--navy);color:rgba(248,245,239,.35);text-align:center;padding:28px 24px;font-size:.78rem}
@media(max-width:900px){.hero{grid-template-columns:1fr;padding:72px 24px}.hcard{display:none}}
</style></head><body>
<nav><div class="logo">${n}</div><div><a href="#">Practice Areas</a><a href="#">Our Team</a><a href="#">Cases</a><a href="#" class="btn-g">Free Consultation</a></div></nav>
<div class="hero">
<div class="hl">
<div style="font-size:.68rem;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:var(--gold);margin-bottom:20px">Counsel · Advocacy · Results</div>
<h1>Trusted Legal<br>Expertise When<br>It Matters <em>Most</em></h1>
<p>Decades of courtroom experience, deep subject-matter expertise, and an unwavering commitment to every client's outcome.</p>
<div class="h-btns"><a href="#" class="b1">Schedule a Consultation</a><a href="#" class="b2">Our Practice Areas</a></div>
</div>
<div class="hcard">
<span class="hc-tag">Why Clients Choose Us</span>
<h3>A reputation built on results</h3>
<p>We bring the full weight of our experience and resources to bear on every matter entrusted to us.</p>
<ul><li>Over 1,200 successful cases</li><li>30+ years combined experience</li><li>Available 24/7 for urgent matters</li><li>No fees unless we win</li></ul>
</div></div>
<section style="background:var(--cream)"><div class="container">
<span class="sh-tag">Practice Areas</span>
<h2>Areas of Expertise</h2>
<p style="color:var(--mu);font-weight:300;max-width:520px;line-height:1.75">Our attorneys have deep, specialist knowledge across the legal areas that matter most to individuals and businesses alike.</p>
<div class="pgrid">
<div class="pc"><span class="pc-n">01</span><h3>Corporate Law</h3><p>Business formation, mergers and acquisitions, contract drafting, and ongoing corporate governance.</p></div>
<div class="pc"><span class="pc-n">02</span><h3>Litigation</h3><p>Aggressive courtroom representation across civil, commercial, and regulatory disputes at all levels.</p></div>
<div class="pc"><span class="pc-n">03</span><h3>Family Law</h3><p>Divorce, child custody, asset division, and protective orders handled with discretion and authority.</p></div>
<div class="pc"><span class="pc-n">04</span><h3>Estate Planning</h3><p>Wills, trusts, probate guidance, and comprehensive succession planning for individuals and families.</p></div>
</div>
<div class="cta-s"><h2>Speak with an Attorney Today</h2><p>Initial consultations are completely confidential and carry no obligation. Let's discuss your situation.</p><a href="#" class="b1">Request a Free Consultation →</a></div>
</div></section>
<footer>© 2025 ${n} · Attorney Advertising · Built with ❤️ by NexusStudio</footer>
<script>document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));</script>
</body></html>`;
  }

  /* ─── EDUCATION: friendly teal on clean white ─────────── */
  function eduDemo(t) {
    const n = t.split(' ').slice(0, 2).join(' ');
    return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${t}</title>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Inter:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--w:#fff;--bg:#F5FBFA;--teal:#0D9488;--teal-l:#14B8A6;--teal-d:#0F766E;--txt:#111827;--mu:#6B7280;--bd:#E5E7EB;--amber:#F59E0B}
body{font-family:'Inter',sans-serif;background:var(--w);color:var(--txt)}
nav{position:sticky;top:0;z-index:99;padding:0 48px;height:64px;display:flex;align-items:center;justify-content:space-between;background:var(--w);border-bottom:1px solid var(--bd);box-shadow:0 1px 8px rgba(0,0,0,.04)}
.logo{font-family:'Nunito',sans-serif;font-size:1.25rem;font-weight:900;letter-spacing:-.3px}
.logo em{color:var(--teal);font-style:normal}
nav a{color:var(--mu);font-size:.87rem;font-weight:500;text-decoration:none;margin-left:22px;transition:.2s}
nav a:hover{color:var(--teal)}
.btn-t{background:var(--teal);color:#fff;padding:9px 20px;border-radius:100px;font-weight:700;font-size:.85rem;text-decoration:none;display:inline-block;margin-left:14px;transition:.25s}
.btn-t:hover{background:var(--teal-d)}
.hero{background:linear-gradient(135deg,var(--bg) 0%,#ECFDF5 100%);padding:100px 48px;text-align:center;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:-200px;right:-200px;width:500px;height:500px;border-radius:50%;background:rgba(13,148,136,.08);pointer-events:none}
.hero::after{content:'';position:absolute;bottom:-150px;left:-150px;width:400px;height:400px;border-radius:50%;background:rgba(245,158,11,.07);pointer-events:none}
.hero-content{position:relative;z-index:1;max-width:720px;margin:0 auto}
.hero-badge{display:inline-flex;align-items:center;gap:8px;background:#ECFDF5;border:1px solid rgba(13,148,136,.3);color:var(--teal);font-size:.75rem;font-weight:700;letter-spacing:.5px;padding:6px 16px;border-radius:100px;margin-bottom:24px}
.hero-badge::before{content:'★';color:var(--amber)}
h1{font-family:'Nunito',sans-serif;font-size:clamp(2.6rem,6vw,4.2rem);font-weight:900;line-height:1.08;letter-spacing:-1.5px;margin-bottom:18px}
.ht{color:var(--teal)}
.hero-sub{font-size:1.05rem;color:var(--mu);max-width:500px;margin:0 auto 40px;line-height:1.75;font-weight:400}
.hero-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.b1{background:var(--teal);color:#fff;font-weight:700;padding:14px 28px;border-radius:100px;text-decoration:none;font-size:.95rem;display:inline-block;transition:.3s;box-shadow:0 4px 16px rgba(13,148,136,.3)}
.b1:hover{background:var(--teal-d);transform:translateY(-2px)}
.b2{background:#fff;color:var(--txt);border:1.5px solid var(--bd);font-weight:600;padding:13px 28px;border-radius:100px;text-decoration:none;font-size:.95rem;display:inline-block;transition:.3s}
.b2:hover{border-color:var(--teal);color:var(--teal)}
.trust{display:flex;gap:32px;justify-content:center;margin-top:60px;flex-wrap:wrap}
.tr{font-size:.82rem;font-weight:600;color:var(--mu);display:flex;align-items:center;gap:6px}
.tr::before{content:'✓';color:var(--teal);font-weight:900}
section{padding:88px 48px}
.container{max-width:1100px;margin:0 auto}
.cgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;margin-top:52px}
.cc{background:var(--w);border:1.5px solid var(--bd);border-radius:20px;overflow:hidden;transition:.35s}
.cc:hover{border-color:var(--teal-l);transform:translateY(-4px);box-shadow:0 16px 40px rgba(13,148,136,.12)}
.cc-top{background:var(--bg);padding:28px;border-bottom:1.5px solid var(--bd)}
.cc-level{font-size:.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--teal);margin-bottom:8px;display:block}
.cc-top h3{font-family:'Nunito',sans-serif;font-size:1.1rem;font-weight:800;margin-bottom:6px}
.cc-top p{font-size:.84rem;color:var(--mu);line-height:1.6}
.cc-body{padding:22px 28px}
.cc-meta{display:flex;gap:14px;flex-wrap:wrap;font-size:.78rem;color:var(--mu);margin-bottom:14px}
.cc-price{font-family:'Nunito',sans-serif;font-size:1.4rem;font-weight:900;color:var(--txt)}
.cc-price span{font-size:.82rem;color:var(--mu);font-weight:400}
.b-teal-sm{background:var(--teal);color:#fff;padding:10px 20px;border-radius:100px;font-weight:700;font-size:.82rem;text-decoration:none;display:inline-block;margin-top:12px;transition:.25s}
.b-teal-sm:hover{background:var(--teal-d)}
.cta-s{background:var(--teal);border-radius:24px;padding:72px 40px;text-align:center;margin-top:48px}
.cta-s h2{font-family:'Nunito',sans-serif;font-size:clamp(1.9rem,4vw,2.8rem);font-weight:900;color:#fff;margin-bottom:12px;letter-spacing:-.5px}
.cta-s p{color:rgba(255,255,255,.8);margin-bottom:32px;max-width:420px;margin-left:auto;margin-right:auto}
.bw{background:#fff;color:var(--teal-d);font-weight:800;padding:14px 30px;border-radius:100px;text-decoration:none;display:inline-block;font-size:.95rem}
footer{text-align:center;padding:36px 24px;border-top:1px solid var(--bd);font-size:.8rem;color:var(--mu)}
</style></head><body>
<nav><div class="logo">📚 <em>${n}</em></div><div><a href="#">Courses</a><a href="#">Tutors</a><a href="#">About</a><a href="#" class="btn-t">Enrol Free →</a></div></nav>
<section class="hero">
<div class="hero-content">
<div class="hero-badge">Rated 4.9/5 by 3,000+ students</div>
<h1>Learn anything.<br>Grow <span class="ht">faster.</span></h1>
<p class="hero-sub">Expert-led courses and personalised tutoring that fit your schedule. From complete beginner to industry-ready in weeks, not years.</p>
<div class="hero-btns"><a href="#" class="b1">Browse Free Courses →</a><a href="#" class="b2">Meet Our Tutors</a></div>
<div class="trust">
<span class="tr">No experience needed</span>
<span class="tr">Learn at your own pace</span>
<span class="tr">Certificate on completion</span>
<span class="tr">Money-back guarantee</span>
</div></div></section>
<section style="background:var(--bg)"><div class="container">
<div style="text-align:center;margin-bottom:4px"><span style="font-size:.7rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--teal)">Courses</span>
<h2 style="font-family:'Nunito',sans-serif;font-size:clamp(1.9rem,4vw,2.5rem);font-weight:900;letter-spacing:-.5px;margin-top:8px">Start learning today</h2>
<p style="color:var(--mu);max-width:480px;margin:8px auto 0">All courses are taught by vetted industry professionals with real-world experience.</p></div>
<div class="cgrid">
<div class="cc"><div class="cc-top"><span class="cc-level">Beginner</span><h3>Web Development Fundamentals</h3><p>HTML, CSS, JavaScript and your first full website from scratch.</p></div><div class="cc-body"><div class="cc-meta"><span>⏱ 24 hours</span><span>💬 English</span><span>🎓 Certificate</span></div><div class="cc-price">Free <span>/ then $29/mo</span></div><a href="#" class="b-teal-sm">Enrol Now →</a></div></div>
<div class="cc"><div class="cc-top"><span class="cc-level">Intermediate</span><h3>Data Science with Python</h3><p>pandas, scikit-learn, visualisation, and real datasets from day one.</p></div><div class="cc-body"><div class="cc-meta"><span>⏱ 40 hours</span><span>💬 English</span><span>🎓 Certificate</span></div><div class="cc-price">$49 <span>/ one-time</span></div><a href="#" class="b-teal-sm">Enrol Now →</a></div></div>
<div class="cc"><div class="cc-top"><span class="cc-level">Advanced</span><h3>UX Design Mastery</h3><p>Figma, design systems, user research, and portfolio-ready case studies.</p></div><div class="cc-body"><div class="cc-meta"><span>⏱ 35 hours</span><span>💬 English</span><span>🎓 Certificate</span></div><div class="cc-price">$69 <span>/ one-time</span></div><a href="#" class="b-teal-sm">Enrol Now →</a></div></div>
</div>
<div class="cta-s"><h2>Ready to start learning?</h2><p>Join over 3,000 students who have already transformed their careers with our courses.</p><a href="#" class="bw">Get Started Free →</a></div>
</div></section>
<footer>© 2025 ${n} · All rights reserved · Built with ❤️ by NexusStudio</footer>
<script>document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));</script>
</body></html>`;
  }

  /* ─── TRAVEL: deep ocean teal gradient, cinematic full-bleed ─── */
  function travelDemo(t) {
    const n = t.split(' ').slice(0, 3).join(' ');
    return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${t}</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Merriweather:ital,wght@0,300;1,300&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--ocean:#006B7D;--teal:#0097A7;--sky:#00BCD4;--sand:#FFF8F0;--coral:#FF6B6B;--white:#fff;--dark:#0A1628;--mu:rgba(255,255,255,.65)}
body{font-family:'Montserrat',sans-serif;background:var(--dark);color:var(--white)}
nav{position:fixed;top:0;left:0;right:0;z-index:99;padding:0 56px;height:70px;display:flex;align-items:center;justify-content:space-between;background:rgba(10,22,40,.0);transition:.4s}
nav.solid{background:rgba(10,22,40,.95);backdrop-filter:blur(12px)}
.logo{font-size:1.2rem;font-weight:900;letter-spacing:1px;color:var(--white)}
.logo span{color:var(--sky)}
nav a{color:rgba(255,255,255,.8);font-size:.84rem;font-weight:500;text-decoration:none;margin-left:24px;transition:.2s}
nav a:hover{color:var(--sky)}
.btn-sky{background:var(--coral);color:#fff;padding:10px 22px;border-radius:100px;font-weight:700;font-size:.82rem;text-decoration:none;display:inline-block;margin-left:16px;transition:.25s}
.btn-sky:hover{background:#e05555}
.hero{min-height:100vh;background:linear-gradient(160deg,#0A1628 0%,#003B4D 35%,#006B7D 65%,#00897B 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:100px 48px 80px;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='30' cy='30' r='1' fill='rgba(255,255,255,.15)'/%3E%3C/svg%3E");opacity:.4}
.hero::after{content:'';position:absolute;bottom:-2px;left:0;right:0;height:120px;background:linear-gradient(transparent,var(--dark))}
.hero-inner{position:relative;z-index:1;max-width:820px}
.h-tag{display:inline-flex;align-items:center;gap:8px;background:rgba(0,188,212,.15);border:1px solid rgba(0,188,212,.35);color:var(--sky);font-size:.72rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:6px 18px;border-radius:100px;margin-bottom:28px}
h1{font-size:clamp(3rem,8vw,6rem);font-weight:900;line-height:.95;letter-spacing:-2px;margin-bottom:16px}
h1 em{font-family:'Merriweather',serif;font-style:italic;font-weight:300;color:var(--sky);display:block;font-size:.75em;letter-spacing:0}
.h-sub{font-size:1.05rem;color:var(--mu);max-width:520px;margin:0 auto 40px;line-height:1.75;font-weight:400}
.h-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.b-coral{background:var(--coral);color:#fff;font-weight:700;padding:15px 32px;border-radius:100px;text-decoration:none;font-size:.95rem;display:inline-block;transition:.3s;box-shadow:0 6px 24px rgba(255,107,107,.35)}
.b-coral:hover{transform:translateY(-2px);box-shadow:0 10px 32px rgba(255,107,107,.45)}
.b-glass{background:rgba(255,255,255,.1);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.2);color:#fff;font-weight:600;padding:14px 30px;border-radius:100px;text-decoration:none;font-size:.95rem;display:inline-block;transition:.3s}
.b-glass:hover{background:rgba(255,255,255,.18)}
.search-bar{background:rgba(255,255,255,.08);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.15);border-radius:16px;padding:20px 28px;display:flex;gap:20px;align-items:center;max-width:680px;margin:48px auto 0;flex-wrap:wrap}
.sb-item{flex:1;min-width:120px}
.sb-item label{display:block;font-size:.65rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--sky);margin-bottom:4px}
.sb-item span{font-size:.9rem;font-weight:600;color:var(--white)}
.sb-divider{width:1px;height:32px;background:rgba(255,255,255,.2)}
.sb-btn{background:var(--coral);color:#fff;padding:12px 24px;border-radius:10px;font-weight:700;font-size:.85rem;text-decoration:none;white-space:nowrap;display:inline-block}
.dests{padding:90px 56px;background:#0D1F35}
.container{max-width:1100px;margin:0 auto}
.sh{text-align:center;margin-bottom:52px}
.sh-tag{font-size:.7rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--sky);margin-bottom:10px;display:block}
h2{font-size:clamp(1.9rem,4vw,2.8rem);font-weight:800;letter-spacing:-.5px;margin-bottom:8px}
.dgrid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
.dc{border-radius:16px;overflow:hidden;position:relative;height:240px;background:linear-gradient(135deg,#004D61,#006B7D);display:flex;align-items:flex-end;padding:20px;transition:.4s;cursor:pointer}
.dc:first-child{grid-row:span 2;height:100%}
.dc:hover{transform:scale(1.02)}
.dc-emoji{position:absolute;top:50%;left:50%;transform:translate(-50%,-60%);font-size:3.5rem;opacity:.5}
.dc-label{position:relative;z-index:1}
.dc-country{font-size:.7rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--sky);margin-bottom:4px}
.dc-name{font-size:1.2rem;font-weight:800;color:#fff}
.dc-price{font-size:.82rem;color:rgba(255,255,255,.6);margin-top:2px}
.cta-s{background:linear-gradient(135deg,var(--ocean),var(--teal));padding:80px 56px;text-align:center}
.cta-s h2{font-size:clamp(2rem,4vw,2.8rem);font-weight:800;margin-bottom:12px;letter-spacing:-.5px}
.cta-s p{color:var(--mu);margin-bottom:36px;max-width:440px;margin-left:auto;margin-right:auto}
footer{background:var(--dark);text-align:center;padding:32px 24px;font-size:.78rem;color:rgba(255,255,255,.3)}
@media(max-width:768px){.dgrid{grid-template-columns:1fr}.dc:first-child{height:240px;grid-row:auto}.search-bar{justify-content:center}}
</style></head><body>
<nav id="nav"><div class="logo">${n.split(' ')[0]}<span>.</span></div><div><a href="#">Destinations</a><a href="#">Tours</a><a href="#">About</a><a href="#" class="btn-sky">Book Now</a></div></nav>
<div class="hero">
<div class="hero-inner">
<div class="h-tag">🌍 250+ Destinations Worldwide</div>
<h1>The World<br><em>Awaits You</em></h1>
<p class="h-sub">Handcrafted itineraries, boutique stays, and experiences you'll be telling stories about for decades. Every journey, perfectly planned.</p>
<div class="h-btns"><a href="#" class="b-coral">Explore Destinations →</a><a href="#" class="b-glass">Watch Our Story ▶</a></div>
<div class="search-bar">
<div class="sb-item"><label>Destination</label><span>Where to?</span></div>
<div class="sb-divider"></div>
<div class="sb-item"><label>Departure</label><span>Pick a date</span></div>
<div class="sb-divider"></div>
<div class="sb-item"><label>Travellers</label><span>2 Adults</span></div>
<a href="#" class="sb-btn">Search</a>
</div>
</div></div>
<section class="dests"><div class="container">
<div class="sh"><span class="sh-tag">Popular Destinations</span><h2>Where will you go next?</h2></div>
<div class="dgrid">
<div class="dc" style="background:linear-gradient(160deg,#004D40,#00695C)"><div class="dc-emoji">🗻</div><div class="dc-label"><div class="dc-country">Japan</div><div class="dc-name">Kyoto & Tokyo</div><div class="dc-price">From $2,890 pp</div></div></div>
<div class="dc" style="background:linear-gradient(160deg,#1A237E,#283593)"><div class="dc-emoji">🏛️</div><div class="dc-label"><div class="dc-country">Greece</div><div class="dc-name">Santorini</div><div class="dc-price">From $1,640 pp</div></div></div>
<div class="dc" style="background:linear-gradient(160deg,#006064,#00838F)"><div class="dc-emoji">🦁</div><div class="dc-label"><div class="dc-country">Kenya</div><div class="dc-name">Masai Mara Safari</div><div class="dc-price">From $3,200 pp</div></div></div>
<div class="dc" style="background:linear-gradient(160deg,#4A148C,#6A1B9A)"><div class="dc-emoji">🕌</div><div class="dc-label"><div class="dc-country">Morocco</div><div class="dc-name">Marrakech & Desert</div><div class="dc-price">From $1,190 pp</div></div></div>
</div>
<div class="cta-s" style="border-radius:20px;margin-top:60px"><h2>Ready for your next adventure?</h2><p>Every itinerary is fully bespoke — built around you, not a template. Talk to a travel specialist today.</p><a href="#" class="b-coral">Plan My Trip →</a></div>
</div></section>
<footer>© 2025 ${n} · All rights reserved · Built with ❤️ by NexusStudio</footer>
<script>
document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));
window.addEventListener('scroll',()=>{document.getElementById('nav').classList.toggle('solid',window.scrollY>60)});
</script>
</body></html>`;
  }

  /* ─── PET CARE: warm amber/yellow, very rounded, playful Poppins ─── */
  function petDemo(t) {
    const n = t.split(' ').slice(0, 2).join(' ');
    return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${t}</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--sun:#FFF3CD;--amber:#F59E0B;--amber-d:#D97706;--brown:#7C2D12;--warm-txt:#451A03;--mid:#92400E;--bg:#FFFBF0;--white:#fff;--bd:#FDE68A}
body{font-family:'Poppins',sans-serif;background:var(--bg);color:var(--warm-txt)}
nav{position:sticky;top:0;z-index:99;padding:0 48px;height:64px;display:flex;align-items:center;justify-content:space-between;background:var(--white);box-shadow:0 2px 16px rgba(245,158,11,.12);border-bottom:2px solid var(--bd)}
.logo{font-size:1.25rem;font-weight:800;color:var(--warm-txt)}
.logo span{color:var(--amber)}
nav a{color:var(--mid);font-size:.87rem;font-weight:500;text-decoration:none;margin-left:22px;transition:.2s}
nav a:hover{color:var(--amber-d)}
.btn-a{background:var(--amber);color:var(--warm-txt);padding:9px 22px;border-radius:100px;font-weight:700;font-size:.84rem;text-decoration:none;display:inline-block;margin-left:14px;transition:.25s}
.btn-a:hover{background:var(--amber-d);color:#fff}
.hero{background:linear-gradient(135deg,var(--sun) 0%,#FFF8DC 50%,#FFFAF0 100%);padding:80px 56px;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;overflow:hidden;position:relative}
.hero::after{content:'🐾';position:absolute;bottom:-20px;right:80px;font-size:180px;opacity:.06;transform:rotate(-15deg)}
.hl{position:relative;z-index:1}
.h-badge{display:inline-flex;align-items:center;gap:6px;background:#FEF3C7;border:2px solid var(--bd);color:var(--amber-d);font-size:.72rem;font-weight:700;letter-spacing:.5px;padding:6px 14px;border-radius:100px;margin-bottom:20px}
h1{font-size:clamp(2.4rem,5vw,3.8rem);font-weight:800;line-height:1.1;letter-spacing:-.5px;margin-bottom:16px;color:var(--warm-txt)}
h1 span{color:var(--amber-d)}
.hp{font-size:.98rem;color:var(--mid);max-width:420px;margin-bottom:32px;line-height:1.8;font-weight:400}
.h-btns{display:flex;gap:12px;flex-wrap:wrap}
.b1{background:var(--amber);color:var(--warm-txt);font-weight:700;padding:14px 26px;border-radius:100px;text-decoration:none;font-size:.9rem;display:inline-block;transition:.25s;box-shadow:0 4px 14px rgba(245,158,11,.3)}
.b1:hover{background:var(--amber-d);color:#fff}
.b2{background:var(--white);color:var(--warm-txt);border:2px solid var(--bd);font-weight:600;padding:13px 26px;border-radius:100px;text-decoration:none;font-size:.9rem;display:inline-block;transition:.25s}
.b2:hover{border-color:var(--amber);color:var(--amber-d)}
.h-stats{display:flex;gap:28px;margin-top:40px;flex-wrap:wrap}
.hs{background:var(--white);border:2px solid var(--bd);border-radius:16px;padding:14px 20px;text-align:center}
.hs-v{font-size:1.5rem;font-weight:800;color:var(--amber-d);display:block;line-height:1}
.hs-l{font-size:.7rem;font-weight:600;color:var(--mid);margin-top:2px}
.hr{background:#FEF9C3;border-radius:24px;display:flex;align-items:center;justify-content:center;font-size:8rem;position:relative;min-height:340px}
.hr span{filter:drop-shadow(0 8px 24px rgba(245,158,11,.3))}
.svcs{padding:80px 56px;background:var(--white)}
.container{max-width:1100px;margin:0 auto}
.sh-tag{font-size:.68rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--amber-d);margin-bottom:10px;display:block}
h2{font-size:clamp(2rem,4vw,2.8rem);font-weight:800;letter-spacing:-.5px;margin-bottom:6px;color:var(--warm-txt)}
.sgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-top:48px}
.sc{background:var(--bg);border:2px solid var(--bd);border-radius:20px;padding:28px;transition:.3s;position:relative;overflow:hidden}
.sc::before{content:attr(data-emoji);position:absolute;bottom:-10px;right:-10px;font-size:4rem;opacity:.1}
.sc:hover{border-color:var(--amber);transform:translateY(-4px);box-shadow:0 12px 32px rgba(245,158,11,.15)}
.sc-icon{font-size:2rem;margin-bottom:14px;display:block}
.sc h3{font-size:1rem;font-weight:700;margin-bottom:8px;color:var(--warm-txt)}
.sc p{font-size:.84rem;color:var(--mid);line-height:1.7}
.sc-price{margin-top:14px;font-weight:700;color:var(--amber-d);font-size:.9rem}
.cta-s{background:var(--amber);border-radius:24px;padding:64px 40px;text-align:center;margin-top:48px}
.cta-s h2{color:var(--warm-txt);margin-bottom:10px}
.cta-s p{color:rgba(124,45,18,.65);max-width:420px;margin:0 auto 28px}
.b-w{background:var(--white);color:var(--amber-d);font-weight:700;padding:14px 28px;border-radius:100px;text-decoration:none;display:inline-block;font-size:.92rem;box-shadow:0 4px 16px rgba(0,0,0,.1)}
footer{text-align:center;padding:32px 24px;border-top:2px solid var(--bd);font-size:.78rem;color:var(--mid)}
@media(max-width:768px){.hero{grid-template-columns:1fr;padding:56px 24px}.hr{display:none}}
</style></head><body>
<nav><div class="logo">🐾 <span>${n}</span></div><div><a href="#">Services</a><a href="#">About</a><a href="#">Gallery</a><a href="#" class="btn-a">Book Today →</a></div></nav>
<div class="hero">
<div class="hl">
<div class="h-badge">⭐ Rated #1 Pet Care in the City</div>
<h1>Your pets deserve<br>the <span>very best</span> care.</h1>
<p class="hp">Loving, professional pet care that gives both you and your furry family members total peace of mind. Boarding, grooming, training — all in one place.</p>
<div class="h-btns"><a href="#" class="b1">Book an Appointment →</a><a href="#" class="b2">Meet Our Team</a></div>
<div class="h-stats">
<div class="hs"><span class="hs-v">5,000+</span><span class="hs-l">Happy Pets</span></div>
<div class="hs"><span class="hs-v">8 yrs</span><span class="hs-l">Experience</span></div>
<div class="hs"><span class="hs-v">4.9★</span><span class="hs-l">Rating</span></div>
</div></div>
<div class="hr"><span>🐶</span></div>
</div>
<section class="svcs"><div class="container">
<div style="text-align:center"><span class="sh-tag">Our Services</span><h2>Tail-wagging good care 🐾</h2></div>
<div class="sgrid">
<div class="sc" data-emoji="🛁"><span class="sc-icon">🛁</span><h3>Grooming</h3><p>Full baths, breed-specific cuts, de-shedding, nail trims, and ear cleaning by certified groomers.</p><div class="sc-price">From $45</div></div>
<div class="sc" data-emoji="🏡"><span class="sc-icon">🏡</span><h3>Boarding</h3><p>Cosy overnight stays with plenty of outdoor time, cuddles, and individual attention.</p><div class="sc-price">From $35/night</div></div>
<div class="sc" data-emoji="🎓"><span class="sc-icon">🎓</span><h3>Training</h3><p>Puppy obedience, behavioural correction, and advanced commands from certified trainers.</p><div class="sc-price">From $60/session</div></div>
<div class="sc" data-emoji="🏃"><span class="sc-icon">🏃</span><h3>Daycare & Walks</h3><p>Daily walks, socialization play time, and supervised daycare while you're at work.</p><div class="sc-price">From $25/day</div></div>
</div>
<div class="cta-s"><h2>Ready to book? 🐾</h2><p>Same-day appointments often available. Call us or book online in 60 seconds.</p><a href="#" class="b-w">Book Online Now →</a></div>
</div></section>
<footer>© 2025 ${n} · All rights reserved · Built with ❤️ by NexusStudio</footer>
<script>document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));</script>
</body></html>`;
  }

  /* ─── FINANCE: forest green on crisp white, IBM Plex, no-nonsense ─── */
  function financeDemo(t) {
    const n = t.split(' ').slice(0, 3).join(' ');
    return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${t}</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Serif:wght@400;500&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--green:#14532D;--green-mid:#166534;--green-l:#16A34A;--mint:#F0FDF4;--white:#fff;--txt:#111827;--mu:#6B7280;--bd:#E5E7EB;--chart:#BBF7D0}
body{font-family:'IBM Plex Sans',sans-serif;background:var(--white);color:var(--txt)}
nav{position:sticky;top:0;z-index:99;padding:0 56px;height:66px;display:flex;align-items:center;justify-content:space-between;background:var(--white);border-bottom:1px solid var(--bd)}
.logo{font-family:'IBM Plex Serif',serif;font-size:1.2rem;font-weight:500;color:var(--green);letter-spacing:-.3px}
nav a{color:var(--mu);font-size:.86rem;font-weight:400;text-decoration:none;margin-left:24px;transition:.2s}
nav a:hover{color:var(--txt)}
.btn-g{background:var(--green);color:#fff;padding:9px 22px;border-radius:6px;font-weight:600;font-size:.84rem;text-decoration:none;display:inline-block;margin-left:16px;transition:.2s}
.btn-g:hover{background:var(--green-mid)}
.hero{background:var(--white);display:grid;grid-template-columns:1.1fr 1fr;gap:80px;align-items:center;padding:100px 56px;max-width:1200px;margin:0 auto}
.htag{display:inline-flex;align-items:center;gap:6px;background:var(--mint);border:1px solid rgba(22,163,74,.3);color:var(--green-l);font-size:.7rem;font-weight:600;letter-spacing:1px;text-transform:uppercase;padding:5px 14px;border-radius:4px;margin-bottom:20px}
h1{font-family:'IBM Plex Serif',serif;font-size:clamp(2.4rem,5vw,3.6rem);font-weight:500;line-height:1.12;letter-spacing:-.5px;margin-bottom:16px;color:var(--txt)}
h1 strong{color:var(--green)}
.hp{font-size:.98rem;color:var(--mu);max-width:440px;margin-bottom:32px;line-height:1.8;font-weight:300}
.h-btns{display:flex;gap:12px;flex-wrap:wrap}
.b1{background:var(--green);color:#fff;font-weight:600;padding:13px 26px;border-radius:6px;text-decoration:none;font-size:.9rem;display:inline-block;transition:.25s}
.b1:hover{background:var(--green-mid)}
.b2{background:transparent;color:var(--txt);border:1px solid var(--bd);font-weight:500;padding:12px 26px;border-radius:6px;text-decoration:none;font-size:.9rem;display:inline-block;transition:.25s}
.b2:hover{border-color:var(--green-l);color:var(--green)}
.chart-card{background:var(--mint);border:1px solid rgba(22,163,74,.2);border-radius:16px;padding:28px}
.chart-hd{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}
.chart-hd h3{font-family:'IBM Plex Serif',serif;font-size:1rem;font-weight:500}
.chart-val{font-size:1.6rem;font-weight:700;color:var(--green);font-family:'IBM Plex Sans',sans-serif}
.chart-up{font-size:.78rem;color:var(--green-l);font-weight:600}
.bars{display:flex;align-items:flex-end;gap:6px;height:80px;margin-bottom:8px}
.bar{flex:1;border-radius:4px 4px 0 0;background:rgba(22,163,74,.2);transition:.3s}
.bar.high{background:var(--green);}
.bar-labels{display:flex;gap:6px;font-size:.65rem;color:var(--mu)}
.bar-labels span{flex:1;text-align:center}
section{padding:88px 56px;background:var(--mint)}
.container{max-width:1100px;margin:0 auto}
.sh-tag{font-size:.68rem;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:var(--green-l);margin-bottom:10px;display:block}
h2{font-family:'IBM Plex Serif',serif;font-size:clamp(1.9rem,3.5vw,2.6rem);font-weight:500;letter-spacing:-.3px;margin-bottom:14px}
.table-card{background:var(--white);border:1px solid var(--bd);border-radius:12px;overflow:hidden;margin-top:48px}
table{width:100%;border-collapse:collapse}
th{background:#F9FAFB;padding:12px 20px;font-size:.78rem;font-weight:600;text-align:left;color:var(--mu);border-bottom:1px solid var(--bd);letter-spacing:.3px;text-transform:uppercase}
td{padding:16px 20px;font-size:.88rem;border-bottom:1px solid #F3F4F6}
tr:last-child td{border-bottom:none}
tr:hover td{background:#F9FAFB}
.badge{background:var(--mint);color:var(--green);font-size:.72rem;font-weight:600;padding:3px 10px;border-radius:100px;border:1px solid rgba(22,163,74,.2)}
.cta-row{background:var(--green);border-radius:16px;padding:56px 48px;display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap;margin-top:48px}
.cta-row h2{font-family:'IBM Plex Serif',serif;color:#fff;font-size:clamp(1.5rem,3vw,2rem);letter-spacing:-.3px;max-width:420px}
.b-w{background:#fff;color:var(--green);font-weight:700;padding:13px 28px;border-radius:6px;text-decoration:none;display:inline-block;font-size:.9rem;white-space:nowrap}
footer{background:var(--white);text-align:center;padding:32px 24px;border-top:1px solid var(--bd);font-size:.78rem;color:var(--mu)}
@media(max-width:900px){.hero{grid-template-columns:1fr;padding:72px 24px}.chart-card{display:none}}
</style></head><body>
<nav><div class="logo">${n}</div><div><a href="#">Services</a><a href="#">About</a><a href="#">Insights</a><a href="#" class="btn-g">Book Consult</a></div></nav>
<div style="background:var(--white)"><div style="max-width:1200px;margin:0 auto"><div class="hero" style="max-width:100%;margin:0">
<div>
<div class="htag">Certified Financial Advisors</div>
<h1>Grow your wealth with <strong>confidence</strong>.</h1>
<p class="hp">Expert financial planning, tax strategy, and investment guidance that turns complex decisions into clear, confident steps forward.</p>
<div class="h-btns"><a href="#" class="b1">Book Free Consultation</a><a href="#" class="b2">Our Services →</a></div>
</div>
<div class="chart-card">
<div class="chart-hd"><div><div style="font-size:.72rem;color:var(--mu);margin-bottom:4px">Portfolio Growth</div><h3>Client Avg. Return</h3></div><div style="text-align:right"><div class="chart-val">+18.4%</div><div class="chart-up">↑ 3.2% vs last year</div></div></div>
<div class="bars">
<div class="bar" style="height:40%"></div><div class="bar" style="height:55%"></div><div class="bar" style="height:45%"></div><div class="bar" style="height:65%"></div><div class="bar" style="height:58%"></div><div class="bar" style="height:78%"></div><div class="bar high" style="height:100%"></div></div>
<div class="bar-labels"><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span><span>Now</span></div>
</div></div></div></div>
<section><div class="container">
<span class="sh-tag">Our Services</span>
<h2>What we can do for you</h2>
<p style="color:var(--mu);font-weight:300;max-width:500px;line-height:1.8">Whether you are starting out or managing significant wealth, we tailor every strategy to your unique financial situation and goals.</p>
<div class="table-card">
<table><thead><tr><th>Service</th><th>Best For</th><th>Frequency</th><th>Status</th></tr></thead><tbody>
<tr><td><strong>Financial Planning</strong></td><td>Individuals & Families</td><td>Annual review</td><td><span class="badge">Available</span></td></tr>
<tr><td><strong>Tax Optimisation</strong></td><td>Business Owners</td><td>Quarterly</td><td><span class="badge">Available</span></td></tr>
<tr><td><strong>Investment Management</strong></td><td>High-Net-Worth Clients</td><td>Monthly reporting</td><td><span class="badge">Available</span></td></tr>
<tr><td><strong>Retirement Planning</strong></td><td>35+ individuals</td><td>Annual review</td><td><span class="badge">Available</span></td></tr>
</tbody></table></div>
<div class="cta-row"><h2>Your financial future starts with one conversation.</h2><a href="#" class="b-w">Schedule Free Consultation →</a></div>
</div></section>
<footer>© 2025 ${n} · Regulated Financial Services · Built with ❤️ by NexusStudio</footer>
<script>document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));</script>
</body></html>`;
  }

  /* ─── WEDDING/EVENTS: champagne & rose gold, flowing romantic serif ─── */
  function weddingDemo(t) {
    const n = t.split(' ').slice(0, 2).join(' ');
    return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${t}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,500;0,600;1,300;1,500&family=Jost:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--champ:#F5E6C8;--rose-gold:#C8997A;--rose-d:#A67A5B;--ivory:#FAF7F2;--txt:#2C1F14;--mu:#8B7355;--bd:#E8D5B7;--blush:#FDF0E8}
body{font-family:'Jost',sans-serif;background:var(--ivory);color:var(--txt)}
nav{position:sticky;top:0;z-index:99;padding:0 56px;height:70px;display:flex;align-items:center;justify-content:space-between;background:rgba(250,247,242,.95);backdrop-filter:blur(8px);border-bottom:1px solid var(--bd)}
.logo{font-family:'Cormorant Garamond',serif;font-size:1.4rem;font-weight:500;letter-spacing:2px;font-style:italic;color:var(--txt)}
nav a{color:var(--mu);font-size:.82rem;font-weight:300;text-decoration:none;margin-left:28px;letter-spacing:1.5px;text-transform:uppercase;transition:.2s}
nav a:hover{color:var(--rose-d)}
.btn-rg{border:1px solid var(--rose-gold);color:var(--rose-gold);padding:9px 22px;font-weight:400;font-size:.8rem;text-decoration:none;display:inline-block;margin-left:20px;letter-spacing:1px;text-transform:uppercase;transition:.25s}
.btn-rg:hover{background:var(--rose-gold);color:var(--ivory)}
.hero{background:var(--blush);padding:0;display:grid;grid-template-columns:1fr 1fr;min-height:90vh;overflow:hidden}
.hl{padding:100px 64px;display:flex;flex-direction:column;justify-content:center;gap:22px;background:linear-gradient(160deg,var(--champ) 0%,var(--blush) 100%)}
.h-eyebrow{font-size:.65rem;font-weight:400;letter-spacing:5px;text-transform:uppercase;color:var(--rose-gold)}
.hl h1{font-family:'Cormorant Garamond',serif;font-size:clamp(3rem,6vw,5rem);font-weight:300;line-height:1.05;letter-spacing:1px;font-style:italic}
.hl h1 strong{font-style:normal;font-weight:600;display:block;font-size:.7em;letter-spacing:3px;text-transform:uppercase;color:var(--rose-d);margin-bottom:6px;font-family:'Jost',sans-serif}
.hl p{font-size:.96rem;color:var(--mu);max-width:390px;line-height:1.9;font-weight:300}
.h-btns{display:flex;gap:12px;flex-wrap:wrap}
.b1{background:var(--rose-gold);color:var(--ivory);padding:13px 28px;font-weight:400;font-size:.86rem;text-decoration:none;display:inline-block;letter-spacing:1px;text-transform:uppercase;transition:.25s}
.b1:hover{background:var(--rose-d)}
.b2{border:1px solid var(--bd);color:var(--mu);padding:12px 28px;font-weight:300;font-size:.86rem;text-decoration:none;display:inline-block;letter-spacing:1px;text-transform:uppercase;transition:.25s}
.b2:hover{border-color:var(--rose-gold);color:var(--rose-gold)}
.hr{background:var(--champ);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:20px;padding:40px;position:relative;overflow:hidden}
.hr::before{content:'✿';position:absolute;top:20px;right:30px;font-size:5rem;color:var(--rose-gold);opacity:.15}
.hr::after{content:'✿';position:absolute;bottom:20px;left:30px;font-size:8rem;color:var(--rose-gold);opacity:.08;transform:rotate(180deg)}
.key-nums{display:flex;flex-direction:column;gap:16px;position:relative;z-index:1}
.kn{background:rgba(250,247,242,.8);border:1px solid var(--bd);padding:18px 28px;text-align:center}
.kn-v{font-family:'Cormorant Garamond',serif;font-size:2.2rem;font-weight:600;color:var(--rose-d);line-height:1}
.kn-l{font-size:.68rem;font-weight:400;letter-spacing:2px;text-transform:uppercase;color:var(--mu);margin-top:4px}
section{padding:88px 56px}
.container{max-width:1100px;margin:0 auto}
.divider{text-align:center;font-size:1.5rem;color:var(--rose-gold);margin:0 auto 40px;letter-spacing:8px}
h2{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,4vw,3rem);font-weight:300;letter-spacing:.5px;font-style:italic;margin-bottom:8px;text-align:center}
.sh-sub{text-align:center;color:var(--mu);font-weight:300;font-size:.9rem;letter-spacing:.5px;max-width:480px;margin:0 auto 48px;line-height:1.85}
.sgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px}
.sc{border:1px solid var(--bd);padding:36px 28px;position:relative;text-align:center;transition:.3s;background:var(--ivory)}
.sc::before{content:attr(data-num);position:absolute;top:14px;right:18px;font-family:'Cormorant Garamond',serif;font-size:.85rem;color:var(--rose-gold);font-style:italic}
.sc:hover{background:var(--blush);border-color:var(--rose-gold)}
.sc-i{font-size:2rem;margin-bottom:14px;display:block}
.sc h3{font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:500;margin-bottom:10px}
.sc p{font-size:.84rem;color:var(--mu);line-height:1.7;font-weight:300}
.cta-banner{background:var(--txt);text-align:center;padding:80px 40px;margin-top:60px}
.cta-banner h2{color:var(--champ);font-style:italic;margin-bottom:10px}
.cta-banner p{color:rgba(245,230,200,.5);margin-bottom:36px;max-width:420px;margin-left:auto;margin-right:auto;font-weight:300;font-size:.92rem;letter-spacing:.3px}
.b-gold{background:var(--rose-gold);color:var(--ivory);padding:14px 32px;font-weight:400;font-size:.88rem;text-decoration:none;letter-spacing:1.5px;text-transform:uppercase;display:inline-block;transition:.25s}
.b-gold:hover{background:var(--rose-d)}
footer{background:var(--ivory);text-align:center;padding:32px 24px;border-top:1px solid var(--bd);font-size:.78rem;color:var(--mu);letter-spacing:.3px}
@media(max-width:768px){.hero{grid-template-columns:1fr}.hr{display:none}.hl{padding:64px 24px}}
</style></head><body>
<nav><div class="logo">${n}</div><div><a href="#">Services</a><a href="#">Gallery</a><a href="#">About</a><a href="#" class="btn-rg">Enquire</a></div></nav>
<div class="hero">
<div class="hl">
<div class="h-eyebrow">Wedding & Event Planning</div>
<h1><strong>Est. 2015</strong>Your Day,<br>Perfectly<br>Curated</h1>
<p>Every detail considered. Every moment crafted. From intimate gatherings to grand celebrations, we bring your vision to life with grace and precision.</p>
<div class="h-btns"><a href="#" class="b1">Begin Your Story</a><a href="#" class="b2">View Portfolio</a></div>
</div>
<div class="hr">
<div class="key-nums">
<div class="kn"><div class="kn-v">580+</div><div class="kn-l">Events Coordinated</div></div>
<div class="kn"><div class="kn-v">10 yr</div><div class="kn-l">Of Excellence</div></div>
<div class="kn"><div class="kn-v">98%</div><div class="kn-l">Would Recommend</div></div>
</div></div>
</div>
<section style="background:var(--ivory)"><div class="container">
<div class="divider">✦ ✦ ✦</div>
<h2>What we create for you</h2>
<p class="sh-sub">From the first consultation to the final dance, every element of your event is handled with exquisite care and attention to detail.</p>
<div class="sgrid">
<div class="sc" data-num="I"><span class="sc-i">💍</span><h3>Wedding Planning</h3><p>Full-service coordination from venue selection to florals, catering, photography, and day-of management.</p></div>
<div class="sc" data-num="II"><span class="sc-i">🌹</span><h3>Floral Design</h3><p>Bespoke floral arrangements, table settings, arches, and installations tailored to your colour palette.</p></div>
<div class="sc" data-num="III"><span class="sc-i">🎂</span><h3>Catering & Cakes</h3><p>Curated menus, dietary-inclusive options, and custom wedding cakes crafted by partner artisans.</p></div>
<div class="sc" data-num="IV"><span class="sc-i">📸</span><h3>Photography & Film</h3><p>Documentary-style photography and cinematic highlight films that capture every emotion authentically.</p></div>
</div>
<div class="cta-banner"><h2>Let's plan something beautiful</h2><p>We take on a limited number of events each season to give every client the attention they deserve.</p><a href="#" class="b-gold">Enquire About Availability</a></div>
</div></section>
<footer>© 2025 ${n} · All rights reserved · Built with ❤️ by NexusStudio</footer>
<script>document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));</script>
</body></html>`;
  }

  /* ── Main generate function ──────────────────────────── */
  async function generate() {
    if (isGenerating) return;

    const description = descInput.value.trim();
    const apiKey = keyInput.value.trim() || localStorage.getItem(LS_KEY) || '';

    if (!description) {
      setStatus('Please describe your business first.', 'error');
      descInput.focus();
      return;
    }

    setStatus('');
    setLoading(true);
    previewWrap.style.display = 'block';
    previewFrame.srcdoc = '';

    /* ── Try real Gemini API first ─────────────────────── */
    if (apiKey) {
      const prompt = buildPrompt(description);
      let lastErr = null;

      for (const model of MODELS) {
        try {
          setStatus(`✦ Generating with ${model}…`);
          const data = await callGemini(apiKey, model, prompt);
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (!rawText) throw new Error('Empty response');
          showPreview(extractHTML(rawText));
          setStatus('✓ AI website generated! Scroll inside the preview to explore.', 'success');
          setLoading(false);
          return;
        } catch (err) {
          lastErr = err;
          const isQuota = err.status === 429
            || (err.message || '').toLowerCase().includes('quota')
            || (err.message || '').toLowerCase().includes('rate');
          if (isQuota && MODELS.indexOf(model) < MODELS.length - 1) continue;
          if (!isQuota) {
            setStatus(`❌ ${lastErr?.message || 'API error'}`, 'error');
            previewWrap.style.display = 'none';
            setLoading(false);
            return;
          }
          break;
        }
      }
    }

    /* ── Demo mode (quota hit or no key) ───────────────── */
    setStatus('✦ Building demo preview…');
    await new Promise(r => setTimeout(r, 800));
    showPreview(buildDemo(description));
    setStatus(apiKey
      ? '🎨 Demo preview shown — API quota reached. Try again shortly, or create a new free API key at aistudio.google.com.'
      : '🎨 Demo preview! Add a free Gemini API key above for a fully custom AI-generated site.',
      'success');
    setLoading(false);
  }

})();

