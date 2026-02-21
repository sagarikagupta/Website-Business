/* =============================================================
   MAGIC WEBSITE GENERATOR  —  generator.js
   Uses Google Gemini 1.5 Flash via the public REST API.
   Falls back to built-in demo templates when API is unavailable.
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

    /* ── Gemini API call ─────────────────────────────────── */
    const MODELS = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b',
        'gemini-2.0-flash-lite',
    ];

    function buildPrompt(description) {
        return `You are an expert web developer. Generate a COMPLETE, self-contained, single-file HTML website for the following business:

"${description}"

Requirements:
- Output ONLY valid HTML — no markdown, no explanations, no code fences.
- All CSS inside a <style> tag in <head>. No external stylesheets except Google Fonts (allowed).
- All JS inside a <script> tag before </body>. No external scripts.
- Modern, professional design with a sophisticated color palette.
- Sections: hero with business name & tagline, about/services area, simple contact CTA.
- Smooth animations and hover effects. Fully responsive.
- Real convincing copy — NO Lorem ipsum.
- Start output with <!DOCTYPE html>.`;
    }

    function extractHTML(text) {
        const match = text.match(/```(?:html)?\s*([\s\S]*?)```/i);
        if (match) return match[1].trim();
        const trimmed = text.trim();
        if (/^<!DOCTYPE/i.test(trimmed) || /^<html/i.test(trimmed)) return trimmed;
        return trimmed;
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

    /* ── Demo templates ──────────────────────────────────── */
    function buildDemo(description) {
        const d = description.toLowerCase();
        const isFood = /(restaurant|cafe|coffee|bakery|pizza|sushi|food|bar|bistro|diner)/i.test(d);
        const isTech = /(saas|software|app|tech|ai|startup|analytics|platform|dashboard|api)/i.test(d);
        const isCreative = /(photographer|photo|studio|design|creative|art|fashion|music)/i.test(d);
        const isFitness = /(gym|fitness|yoga|wellness|spa|health|personal trainer)/i.test(d);

        const title = description.length > 60 ? description.slice(0, 57) + '…' : description;

        if (isFood) return foodDemo(title);
        if (isTech) return techDemo(title);
        if (isCreative) return creativeDemo(title);
        if (isFitness) return fitnessDemo(title);
        return genericDemo(title);
    }

    function foodDemo(title) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--gold:#C9963E;--dark:#0E0C0A;--bg:#1A1714;--text:#F5EFE6;}
body{font-family:'Inter',sans-serif;background:var(--dark);color:var(--text);line-height:1.6}
nav{position:fixed;top:0;left:0;right:0;z-index:99;padding:20px 48px;display:flex;justify-content:space-between;align-items:center;background:rgba(14,12,10,.85);backdrop-filter:blur(12px);border-bottom:1px solid rgba(201,150,62,.2)}
.logo{font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700;color:var(--gold)}
.nav-links{display:flex;gap:28px;list-style:none}
.nav-links a{color:rgba(245,239,230,.7);font-size:.88rem;letter-spacing:.5px;text-decoration:none;transition:.3s}
.nav-links a:hover{color:var(--gold)}
.hero{min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;position:relative;overflow:hidden;padding:0 24px}
.hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 40%,rgba(201,150,62,.15),transparent 70%),linear-gradient(180deg,#0E0C0A 0%,#1A1714 100%)}
.hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(201,150,62,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201,150,62,.04) 1px,transparent 1px);background-size:60px 60px}
.hero-content{position:relative;z-index:1;max-width:700px}
.hero-eyebrow{display:inline-block;color:var(--gold);font-size:.75rem;font-weight:500;letter-spacing:4px;text-transform:uppercase;margin-bottom:24px;padding:6px 20px;border:1px solid rgba(201,150,62,.4);border-radius:100px}
h1{font-family:'Playfair Display',serif;font-size:clamp(2.8rem,7vw,5.5rem);font-weight:900;line-height:1.05;letter-spacing:-1px;margin-bottom:20px}
h1 em{font-style:italic;color:var(--gold)}
.hero-sub{font-size:1.1rem;color:rgba(245,239,230,.6);max-width:480px;margin:0 auto 40px;font-weight:300}
.btn-gold{display:inline-flex;align-items:center;gap:10px;background:var(--gold);color:#0E0C0A;font-weight:700;font-size:.95rem;padding:14px 32px;border-radius:100px;border:none;cursor:pointer;text-decoration:none;transition:.35s}
.btn-gold:hover{background:#daa94a;transform:translateY(-2px);box-shadow:0 8px 32px rgba(201,150,62,.4)}
.btn-outline{display:inline-flex;align-items:center;gap:10px;background:transparent;color:var(--gold);font-weight:600;font-size:.95rem;padding:14px 32px;border-radius:100px;border:1px solid rgba(201,150,62,.5);cursor:pointer;text-decoration:none;transition:.35s;margin-left:12px}
.btn-outline:hover{background:rgba(201,150,62,.1);transform:translateY(-2px)}
section{padding:100px 24px}
.container{max-width:1100px;margin:0 auto}
.section-label{font-size:.72rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:14px}
h2{font-family:'Playfair Display',serif;font-size:clamp(2rem,4vw,3rem);font-weight:700;line-height:1.15;letter-spacing:-.5px;margin-bottom:16px}
.menu-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;margin-top:52px}
.menu-card{background:#1A1714;border:1px solid rgba(201,150,62,.15);border-radius:16px;padding:32px;transition:.35s}
.menu-card:hover{border-color:rgba(201,150,62,.5);transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,.5)}
.menu-icon{font-size:2.4rem;margin-bottom:16px}
.menu-card h3{font-family:'Playfair Display',serif;font-size:1.25rem;margin-bottom:10px;color:var(--gold)}
.menu-card p{font-size:.9rem;color:rgba(245,239,230,.6);line-height:1.7}
.menu-price{margin-top:14px;font-size:1.1rem;font-weight:700;color:var(--gold)}
.cta-section{background:linear-gradient(135deg,#1A1714,rgba(201,150,62,.08));border:1px solid rgba(201,150,62,.2);border-radius:24px;text-align:center;padding:80px 40px;margin-top:60px}
.cta-section h2{margin-bottom:12px}
.cta-section p{color:rgba(245,239,230,.6);margin-bottom:36px;max-width:460px;margin-left:auto;margin-right:auto}
footer{text-align:center;padding:40px 24px;border-top:1px solid rgba(255,255,255,.06);font-size:.82rem;color:rgba(245,239,230,.35)}
</style>
</head>
<body>
<nav>
  <div class="logo">✦ ${title.split(' ').slice(0, 3).join(' ')}</div>
  <ul class="nav-links">
    <li><a href="#">Menu</a></li>
    <li><a href="#">About</a></li>
    <li><a href="#">Reservations</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
</nav>
<section class="hero">
  <div class="hero-bg"></div><div class="hero-grid"></div>
  <div class="hero-content">
    <div class="hero-eyebrow">✦ Est. 2024 · Fine Dining</div>
    <h1>Where Every Dish<br>Tells a <em>Story</em></h1>
    <p class="hero-sub">Crafted with seasonal ingredients and passionate artistry, each plate is a journey you'll remember long after the last bite.</p>
    <div>
      <a href="#" class="btn-gold">Reserve a Table →</a>
      <a href="#" class="btn-outline">View Menu</a>
    </div>
  </div>
</section>
<section id="menu" style="background:#0E0C0A">
  <div class="container">
    <div class="section-label">Our Signature</div>
    <h2>Crafted to Perfection</h2>
    <div class="menu-grid">
      <div class="menu-card"><div class="menu-icon">🥩</div><h3>Pan-Seared Duck Breast</h3><p>Sous-vide duck with cherry reduction, parsnip purée, and micro-herb garnish.</p><div class="menu-price">$38</div></div>
      <div class="menu-card"><div class="menu-icon">🦞</div><h3>Butter-Poached Lobster</h3><p>Maine lobster, saffron beurre blanc, spring pea risotto, and crispy shallots.</p><div class="menu-price">$52</div></div>
      <div class="menu-card"><div class="menu-icon">🌿</div><h3>Heritage Beetroot Tartare</h3><p>Golden and chioggia beets, whipped goat cheese, candied walnuts, and elderflower.</p><div class="menu-price">$22</div></div>
      <div class="menu-card"><div class="menu-icon">🍫</div><h3>Valrhona Chocolate Dome</h3><p>Dark chocolate mousse, salted caramel core, hazelnut praline, and gold leaf.</p><div class="menu-price">$18</div></div>
    </div>
    <div class="cta-section">
      <div class="section-label">Reservations</div>
      <h2>Join Us for an Unforgettable Evening</h2>
      <p>We take reservations for intimate dinners of 2 to private dining parties of 20. Book your table online or call us directly.</p>
      <a href="tel:+12125550001" class="btn-gold">Book a Table →</a>
    </div>
  </div>
</section>
<footer>© 2025 ${title.split(' ').slice(0, 3).join(' ')} · All rights reserved · Made with ❤️ by NexusStudio</footer>
<script>
document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));
window.addEventListener('scroll',()=>{document.querySelector('nav').style.background=window.scrollY>50?'rgba(14,12,10,0.98)':'rgba(14,12,10,0.85)';});
</script>
</body></html>`;
    }

    function techDemo(title) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0A0E1A;--card:#111827;--accent:#3B6EF8;--accent-light:#5A8BFF;--text:#F0F4FF;--muted:#6B7A99;}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);line-height:1.6}
nav{position:fixed;top:0;left:0;right:0;z-index:99;padding:0 48px;height:64px;display:flex;align-items:center;justify-content:space-between;background:rgba(10,14,26,.8);backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,.06)}
.logo{font-size:1.15rem;font-weight:800;letter-spacing:-.3px}
.logo span{color:var(--accent)}
.nav-link{color:var(--muted);font-size:.88rem;font-weight:500;text-decoration:none;margin-left:24px;transition:.3s}
.nav-link:hover{color:var(--text)}
.btn-nav{background:var(--accent);color:#fff;padding:8px 20px;border-radius:8px;font-weight:600;font-size:.88rem;text-decoration:none;margin-left:16px;transition:.3s}
.btn-nav:hover{background:var(--accent-light);box-shadow:0 0 20px rgba(59,110,248,.4)}
.hero{min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:120px 24px 80px;position:relative;overflow:hidden}
.hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse 70% 60% at 50% 30%,rgba(59,110,248,.18),transparent 70%),var(--bg)}
.hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(59,110,248,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(59,110,248,.04) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black,transparent 80%)}
.hero-content{position:relative;z-index:1;max-width:800px}
.hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(59,110,248,.12);border:1px solid rgba(59,110,248,.35);color:var(--accent-light);font-size:.75rem;font-weight:600;padding:6px 16px;border-radius:100px;margin-bottom:28px;letter-spacing:.5px;text-transform:uppercase}
.hero-badge::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--accent-light);animation:blink 2s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
h1{font-size:clamp(2.8rem,6vw,4.8rem);font-weight:900;line-height:1.05;letter-spacing:-2px;margin-bottom:20px}
.grad{background:linear-gradient(135deg,#3B6EF8,#818CF8,#5AFFFF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero-sub{font-size:1.1rem;color:var(--muted);max-width:540px;margin:0 auto 40px}
.hero-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.btn-p{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:#fff;font-weight:700;font-size:.95rem;padding:14px 28px;border-radius:12px;text-decoration:none;transition:.35s;box-shadow:0 4px 20px rgba(59,110,248,.35)}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(59,110,248,.5);background:var(--accent-light)}
.btn-s{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.06);color:var(--text);font-weight:600;font-size:.95rem;padding:14px 28px;border-radius:12px;text-decoration:none;border:1px solid rgba(255,255,255,.1);transition:.35s}
.btn-s:hover{background:rgba(255,255,255,.1);transform:translateY(-2px)}
.stats{display:flex;gap:48px;justify-content:center;margin-top:72px;flex-wrap:wrap}
.stat-n{font-size:2rem;font-weight:900;color:var(--accent-light);letter-spacing:-1px}
.stat-l{font-size:.75rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px}
section{padding:100px 24px}.container{max-width:1100px;margin:0 auto}
.features{background:#0D1120}
.feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-top:56px}
.feat-card{background:var(--card);border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:32px;transition:.35s}
.feat-card:hover{border-color:rgba(59,110,248,.4);transform:translateY(-6px);box-shadow:0 20px 40px rgba(0,0,0,.4),0 0 40px rgba(59,110,248,.1)}
.feat-icon{width:48px;height:48px;border-radius:10px;background:rgba(59,110,248,.12);border:1px solid rgba(59,110,248,.3);display:flex;align-items:center;justify-content:center;font-size:1.4rem;margin-bottom:20px}
.feat-card h3{font-size:1.05rem;font-weight:700;margin-bottom:10px}
.feat-card p{font-size:.88rem;color:var(--muted);line-height:1.7}
.cta-s{text-align:center;background:linear-gradient(135deg,#111827,#0D1529);border:1px solid rgba(59,110,248,.2);border-radius:24px;padding:80px 40px;margin-top:60px}
.cta-s h2{font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;letter-spacing:-.5px;margin-bottom:12px}
.cta-s p{color:var(--muted);margin-bottom:36px;max-width:420px;margin-left:auto;margin-right:auto}
footer{text-align:center;padding:40px 24px;border-top:1px solid rgba(255,255,255,.05);font-size:.82rem;color:var(--muted)}
</style>
</head>
<body>
<nav>
  <div class="logo">⚡ <span>Nexora</span></div>
  <div>
    <a href="#" class="nav-link">Product</a>
    <a href="#" class="nav-link">Pricing</a>
    <a href="#" class="nav-link">Docs</a>
    <a href="#" class="btn-nav">Get Started Free →</a>
  </div>
</nav>
<section class="hero">
  <div class="hero-bg"></div><div class="hero-grid"></div>
  <div class="hero-content">
    <div class="hero-badge">🚀 Now in public beta</div>
    <h1>Automate the Work.<br><span class="grad">Scale the Vision.</span></h1>
    <p class="hero-sub">The AI-powered platform that eliminates repetitive tasks so your team can focus on what actually matters — building your product.</p>
    <div class="hero-btns">
      <a href="#" class="btn-p">Start for Free →</a>
      <a href="#" class="btn-s">Watch Demo ▶</a>
    </div>
    <div class="stats">
      <div><div class="stat-n">10k+</div><div class="stat-l">Active Users</div></div>
      <div><div class="stat-n">99.9%</div><div class="stat-l">Uptime SLA</div></div>
      <div><div class="stat-n">4.9★</div><div class="stat-l">G2 Rating</div></div>
    </div>
  </div>
</section>
<section class="features" id="features">
  <div class="container">
    <div style="text-align:center;margin-bottom:8px;font-size:.75rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--accent-light)">Core Features</div>
    <h2 style="font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;letter-spacing:-.5px;text-align:center;margin-bottom:4px">Built for Modern Teams</h2>
    <p style="text-align:center;color:var(--muted);max-width:480px;margin:0 auto">Everything you need to automate workflows, collaborate at scale, and ship faster than ever before.</p>
    <div class="feat-grid">
      <div class="feat-card"><div class="feat-icon">🤖</div><h3>AI Automation</h3><p>Auto-classify, route, and process documents without writing a single rule. The model learns from your team's behavior.</p></div>
      <div class="feat-card"><div class="feat-icon">⚡</div><h3>Real-Time Sync</h3><p>Every action propagates instantly across your entire organization. No caching delays, no stale data, ever.</p></div>
      <div class="feat-card"><div class="feat-icon">🔐</div><h3>Enterprise Security</h3><p>SOC 2 Type II certified. End-to-end encryption, SSO, audit logs, and granular role-based permissions.</p></div>
      <div class="feat-card"><div class="feat-icon">📊</div><h3>Deep Analytics</h3><p>Understand exactly where bottlenecks occur. Custom dashboards, automated reports, and anomaly detection.</p></div>
      <div class="feat-card"><div class="feat-icon">🔌</div><h3>500+ Integrations</h3><p>Connect Slack, Notion, Salesforce, Jira, and everything else your stack already uses in minutes, not months.</p></div>
      <div class="feat-card"><div class="feat-icon">🌐</div><h3>Global Edge Network</h3><p>Sub-50ms response times worldwide. Deployed across 35 regions with automatic failover and geo-routing.</p></div>
    </div>
    <div class="cta-s">
      <h2>Ready to move faster?</h2>
      <p>Join thousands of teams who've cut manual work by 80% in their first month.</p>
      <a href="#" class="btn-p">Start Free — No Credit Card →</a>
    </div>
  </div>
</section>
<footer>© 2025 Nexora Inc. · All rights reserved · Built with ❤️ by NexusStudio</footer>
<script>document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));</script>
</body></html>`;
    }

    function creativeDemo(title) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#F9F6F0;color:#1A1714;line-height:1.6}
nav{position:fixed;top:0;left:0;right:0;z-index:99;padding:24px 48px;display:flex;justify-content:space-between;align-items:center;mix-blend-mode:multiply}
.logo{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:600;letter-spacing:2px;text-transform:uppercase}
.nav-links{display:flex;gap:32px}
.nav-links a{color:rgba(26,23,20,.6);font-size:.82rem;letter-spacing:1px;text-transform:uppercase;text-decoration:none;transition:.3s}
.nav-links a:hover{color:#1A1714}
.hero{display:grid;grid-template-columns:1fr 1fr;min-height:100vh;overflow:hidden}
.hero-left{background:#1A1714;display:flex;align-items:flex-end;padding:80px 60px;position:relative;overflow:hidden}
.hero-left::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 60% at 30% 40%,rgba(201,150,62,.2),transparent)}
.hero-text{position:relative;z-index:1}
.hero-eyebrow{color:rgba(245,239,230,.45);font-size:.72rem;letter-spacing:3px;text-transform:uppercase;margin-bottom:20px}
.hero-left h1{font-family:'Cormorant Garamond',serif;font-size:clamp(3rem,6vw,5rem);font-weight:400;line-height:1.05;color:#F5EFE6;margin-bottom:24px}
.hero-left h1 em{font-style:italic;color:#C9963E}
.hero-left p{color:rgba(245,239,230,.55);font-size:.95rem;max-width:380px;margin-bottom:36px}
.btn-cream{display:inline-flex;align-items:center;gap:10px;background:#F5EFE6;color:#1A1714;font-weight:500;font-size:.88rem;letter-spacing:.5px;padding:13px 28px;border-radius:100px;text-decoration:none;transition:.35s}
.btn-cream:hover{background:#fff;transform:translateY(-2px)}
.hero-right{background:#E8E0D4;display:grid;grid-template-rows:1fr 1fr;gap:4px;padding:4px}
.hero-img-top,.hero-img-bottom{background:#C4BAB0;display:flex;align-items:center;justify-content:center;font-size:4rem;opacity:.4}
section{padding:100px 60px}.container{max-width:1100px;margin:0 auto}
.work-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:56px}
.work-card{background:#E8E0D4;aspect-ratio:3/4;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:3.5rem;opacity:.5;transition:.35s;cursor:pointer}
.work-card:hover{opacity:.9;transform:scale(1.02)}
.about-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;margin-top:60px}
.about-img{background:#C4BAB0;aspect-ratio:4/5;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:5rem;opacity:.4}
.about-text h2{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,4vw,3rem);font-weight:400;line-height:1.15;margin-bottom:20px}
.about-text p{color:rgba(26,23,20,.6);font-size:.95rem;margin-bottom:16px}
.contact-s{text-align:center;padding:100px 60px;background:#1A1714;color:#F5EFE6}
.contact-s h2{font-family:'Cormorant Garamond',serif;font-size:clamp(2.5rem,5vw,4rem);font-weight:400;margin-bottom:16px}
.contact-s p{color:rgba(245,239,230,.55);margin-bottom:36px}
footer{text-align:center;padding:32px 24px;border-top:1px solid rgba(0,0,0,.08);font-size:.78rem;color:rgba(26,23,20,.4)}
@media(max-width:768px){.hero{grid-template-columns:1fr;}.hero-right{display:none;}.work-grid{grid-template-columns:1fr 1fr;}.about-grid{grid-template-columns:1fr;}}
</style>
</head>
<body>
<nav>
  <div class="logo">Studio</div>
  <div class="nav-links">
    <a href="#">Work</a><a href="#">About</a><a href="#">Process</a><a href="#">Contact</a>
  </div>
</nav>
<div class="hero">
  <div class="hero-left">
    <div class="hero-text">
      <div class="hero-eyebrow">Creative Studio · Est. 2024</div>
      <h1>Crafting <em>Visuals</em><br>That Move People</h1>
      <p>Award-winning photography and visual direction for brands and individuals who demand nothing less than extraordinary.</p>
      <a href="#" class="btn-cream">View Portfolio →</a>
    </div>
  </div>
  <div class="hero-right">
    <div class="hero-img-top">📷</div>
    <div class="hero-img-bottom">🎨</div>
  </div>
</div>
<section style="background:#F9F6F0">
  <div class="container">
    <div style="font-size:.72rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(26,23,20,.45)">Selected Work</div>
    <h2 style="font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,4vw,3rem);font-weight:400;margin-top:12px">Recent Projects</h2>
    <div class="work-grid">
      <div class="work-card">🌹</div>
      <div class="work-card" style="grid-row:span 2;aspect-ratio:3/8">🍂</div>
      <div class="work-card">🌊</div>
      <div class="work-card">🌿</div>
      <div class="work-card">✨</div>
    </div>
  </div>
</section>
<section style="background:#EDEAE4">
  <div class="container">
    <div class="about-grid">
      <div class="about-img">👁️</div>
      <div class="about-text">
        <div style="font-size:.72rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(26,23,20,.45);margin-bottom:16px">About</div>
        <h2>Where Art Meets<br>Intentionality</h2>
        <p>With over a decade of experience shooting for editorial, commercial, and fine-art clients, I bring a deeply considered eye to every frame.</p>
        <p>Every project begins with listening — understanding your vision — then translating it into imagery that resonates far beyond the first glance.</p>
        <a href="#" class="btn-cream" style="background:#1A1714;color:#F5EFE6;margin-top:8px">Work With Me →</a>
      </div>
    </div>
  </div>
</section>
<div class="contact-s">
  <div style="font-size:.72rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(245,239,230,.35);margin-bottom:20px">Let's Connect</div>
  <h2>Have a project<br>in <em>mind?</em></h2>
  <p>I'd love to hear about it. Reach out and let's make something beautiful together.</p>
  <a href="mailto:hello@studio.com" class="btn-cream">Send a Message →</a>
</div>
<footer>© 2025 Creative Studio · All rights reserved · Built with ❤️ by NexusStudio</footer>
<script>document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));</script>
</body></html>`;
    }

    function fitnessDemo(title) {
        return genericDemo(title, '💪', '#00C9A7', 'Wellness', 'Transform Your Body,<br><em>Transform Your Life</em>', 'Expert coaching, science-backed programming, and a community that keeps you accountable — everything you need to hit your goals.');
    }

    function genericDemo(title, icon = '🚀', accent = '#3B6EF8', type = 'Business', headline = 'We Help Businesses<br><em>Grow Smarter</em>', sub = 'Professional services tailored to your goals. We bring strategy, creativity, and execution —  so you can focus on what you do best.') {
        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0B0F1A;--card:#131929;--accent:${accent};--text:#EEF2FF;--muted:#7480a0}
body{font-family:'Plus Jakarta Sans',sans-serif;background:var(--bg);color:var(--text)}
nav{position:fixed;top:0;left:0;right:0;z-index:99;padding:0 48px;height:64px;display:flex;align-items:center;justify-content:space-between;background:rgba(11,15,26,.85);backdrop-filter:blur(14px);border-bottom:1px solid rgba(255,255,255,.06)}
.logo{font-size:1.1rem;font-weight:800}
.logo-dot{color:var(--accent)}
nav a{color:var(--muted);font-size:.86rem;font-weight:500;text-decoration:none;margin-left:24px;transition:.3s}
nav a:hover{color:var(--text)}
.btn-a{background:var(--accent);color:#fff;padding:9px 22px;border-radius:10px;font-weight:700!important;color:#fff!important;transition:.3s!important;margin-left:16px!important}
.btn-a:hover{filter:brightness(1.15);box-shadow:0 0 24px rgba(59,110,248,.4)}
.hero{min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:120px 24px 80px;position:relative}
.hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse 65% 55% at 50% 35%,rgba(59,110,248,.16),transparent 68%),var(--bg)}
.hero-content{position:relative;z-index:1;max-width:760px}
.chip{display:inline-flex;align-items:center;gap:6px;background:rgba(59,110,248,.12);border:1px solid rgba(59,110,248,.3);color:#7B9FFF;font-size:.72rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:5px 14px;border-radius:100px;margin-bottom:28px}
h1{font-size:clamp(2.6rem,6vw,4.6rem);font-weight:800;line-height:1.08;letter-spacing:-2px;margin-bottom:20px}
h1 em{font-style:normal;background:linear-gradient(135deg,var(--accent),#9FFFDB);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero-p{font-size:1.05rem;color:var(--muted);max-width:500px;margin:0 auto 40px;line-height:1.75}
.btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.b1{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:#fff;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;transition:.35s;box-shadow:0 4px 20px rgba(59,110,248,.3)}
.b1:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(59,110,248,.5)}
.b2{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.06);color:var(--text);font-weight:600;padding:14px 28px;border-radius:12px;text-decoration:none;border:1px solid rgba(255,255,255,.1);transition:.35s}
.b2:hover{background:rgba(255,255,255,.1);transform:translateY(-2px)}
section{padding:100px 24px}
.container{max-width:1100px;margin:0 auto}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:20px;margin-top:52px}
.card{background:var(--card);border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:30px;transition:.35s}
.card:hover{border-color:rgba(59,110,248,.4);transform:translateY(-5px);box-shadow:0 20px 40px rgba(0,0,0,.4)}
.ci{font-size:2rem;margin-bottom:16px}
.card h3{font-size:1rem;font-weight:700;margin-bottom:8px}
.card p{font-size:.86rem;color:var(--muted);line-height:1.7}
.cta{text-align:center;background:linear-gradient(135deg,var(--card),rgba(59,110,248,.07));border:1px solid rgba(59,110,248,.2);border-radius:20px;padding:72px 40px;margin-top:56px}
.cta h2{font-size:clamp(1.8rem,4vw,2.6rem);font-weight:800;letter-spacing:-.5px;margin-bottom:12px}
.cta p{color:var(--muted);margin-bottom:32px;max-width:400px;margin-left:auto;margin-right:auto}
footer{text-align:center;padding:36px 24px;border-top:1px solid rgba(255,255,255,.05);font-size:.8rem;color:var(--muted)}
</style>
</head>
<body>
<nav>
  <div class="logo">${icon} <span class="logo-dot">${title.split(' ')[0]}</span></div>
  <div>
    <a href="#">Services</a>
    <a href="#">About</a>
    <a href="#">Results</a>
    <a href="#" class="btn-a">Get Started →</a>
  </div>
</nav>
<section class="hero">
  <div class="hero-bg"></div>
  <div class="hero-content">
    <div class="chip">✦ ${type} · Trusted by 500+ clients</div>
    <h1>${headline}</h1>
    <p class="hero-p">${sub}</p>
    <div class="btns">
      <a href="#" class="b1">Start Today →</a>
      <a href="#" class="b2">See Our Work</a>
    </div>
  </div>
</section>
<section style="background:#0D1120">
  <div class="container">
    <h2 style="font-size:clamp(1.8rem,4vw,2.4rem);font-weight:800;letter-spacing:-.5px;text-align:center;margin-bottom:4px">What We Offer</h2>
    <p style="text-align:center;color:var(--muted);max-width:460px;margin:0 auto">Comprehensive solutions designed to deliver measurable results from day one.</p>
    <div class="grid">
      <div class="card"><div class="ci">🎯</div><h3>Strategic Planning</h3><p>Data-driven strategy that aligns every initiative with your core business objectives and growth targets.</p></div>
      <div class="card"><div class="ci">⚡</div><h3>Rapid Execution</h3><p>From concept to launch in record time. Our agile process removes bottlenecks and keeps momentum high.</p></div>
      <div class="card"><div class="ci">📈</div><h3>Growth Analytics</h3><p>Real-time dashboards and weekly reports so you always know exactly what's working and what needs adjusting.</p></div>
      <div class="card"><div class="ci">🤝</div><h3>Dedicated Support</h3><p>A senior team member assigned to your account, available when you need them — not just during business hours.</p></div>
    </div>
    <div class="cta">
      <h2>Let's build something great</h2>
      <p>Book a free 30-minute strategy call. No pitches — just honest advice about what would actually move the needle for you.</p>
      <a href="#" class="b1">Book Free Consultation →</a>
    </div>
  </div>
</section>
<footer>© 2025 ${title.split(' ').slice(0, 2).join(' ')} · All rights reserved · Built with ❤️ by NexusStudio</footer>
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

        /* ── Try real AI first (if key available) ─────────── */
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
                    break;
                }
            }

            /* Key present but all models failed — fall through to demo */
            const isQuotaErr = lastErr?.status === 429
                || (lastErr?.message || '').toLowerCase().includes('quota');
            if (!isQuotaErr) {
                /* Non-quota error — surface it */
                setStatus(`❌ ${lastErr?.message || 'API error'}`, 'error');
                previewWrap.style.display = 'none';
                setLoading(false);
                return;
            }
            /* Quota error — fall through to demo mode */
        }

        /* ── Demo mode ───────────────────────────────────── */
        setStatus('✦ Building demo preview…');
        await new Promise(r => setTimeout(r, 1200)); /* brief dramatic pause */
        showPreview(buildDemo(description));
        setStatus(apiKey
            ? '🎨 Demo preview shown — your API key hit its rate limit. The real AI generator will kick in automatically once quota resets (usually < 60 sec).'
            : '🎨 Demo preview! Add a free Gemini API key above for a fully custom AI-generated site tailored to your exact description.',
            'success');
        setLoading(false);
    }

})();
