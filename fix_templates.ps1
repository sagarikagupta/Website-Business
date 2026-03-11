# Read the file
$file = Join-Path $PSScriptRoot 'generator.js'
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

# ── FOOD: Replace the entire function body (the return template literal) ──────
# We replace from the Lora font import line through the closing }
$oldFood = @'
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
<footer>© 2025 ${n} · Built with ❤️ by Vezalo</footer>
<script>document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));</script>
</body></html>`
'@

$newFood = @'
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--cream:#FAF6EE;--rust:#C14B2A;--brown:#2C1A0E;--warm:#7A4F35;--bd:#E8DDD0;--dk:#1A0E06}
body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--brown)}
nav{position:sticky;top:0;z-index:99;padding:0 48px;height:64px;display:flex;align-items:center;justify-content:space-between;background:var(--dk);border-bottom:1px solid #3A2010}
.logo{font-family:'Lora',serif;font-size:1.3rem;font-weight:600;color:var(--cream)}
nav a{color:rgba(250,246,238,.6);font-size:.85rem;text-decoration:none;margin-left:24px;transition:.2s}
nav a:hover{color:var(--cream)}
.btn-r{background:var(--rust);color:#fff;padding:9px 22px;border-radius:4px;font-weight:500;font-size:.85rem;text-decoration:none;display:inline-block;margin-left:16px}
.hero{background:var(--dk);min-height:88vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:100px 48px;position:relative;overflow:hidden}
.hero::before{content:'🍽';position:absolute;font-size:22rem;opacity:.05;top:50%;left:50%;transform:translate(-50%,-50%)}
.h-eye{font-size:.7rem;letter-spacing:4px;text-transform:uppercase;color:var(--rust);font-weight:500;margin-bottom:20px}
.hero h1{font-family:'Lora',serif;font-size:clamp(3rem,8vw,6.5rem);font-weight:700;line-height:.95;color:var(--cream);letter-spacing:-1px;margin-bottom:20px}
.hero h1 em{font-style:italic;color:var(--rust)}
.hero p{font-size:1.05rem;color:rgba(250,246,238,.6);max-width:480px;line-height:1.85;font-weight:300;margin-bottom:36px}
.hbtns{display:flex;gap:12px;justify-content:center}
.b-rust{background:var(--rust);color:#fff;padding:13px 28px;border-radius:4px;font-weight:500;text-decoration:none;font-size:.9rem;display:inline-block}
.b-out{border:1px solid rgba(250,246,238,.25);color:rgba(250,246,238,.8);padding:12px 28px;border-radius:4px;font-weight:400;text-decoration:none;font-size:.9rem;display:inline-block}
.menu-s{padding:80px 48px;background:var(--cream)}
.container{max-width:1100px;margin:0 auto}
.sh{text-align:center;margin-bottom:48px}
.sh-tag{font-size:.68rem;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:var(--rust);margin-bottom:10px;display:block}
.sh h2{font-family:'Lora',serif;font-size:clamp(2rem,4vw,3rem);font-weight:700;letter-spacing:-.3px}
.mcols{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:1px solid var(--bd)}
.mcol{border-right:1px solid var(--bd)}
.mcol:last-child{border-right:none}
.mcol-hd{background:var(--dk);color:var(--cream);padding:16px 24px;font-family:'Lora',serif;font-size:.85rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;text-align:center}
.mi{padding:18px 24px;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;align-items:flex-start;gap:14px;transition:.2s}
.mi:last-child{border-bottom:none}
.mi:hover{background:#FFF9F2}
.mi-name{font-family:'Lora',serif;font-size:.92rem;font-weight:600;margin-bottom:3px}
.mi-desc{font-size:.75rem;color:var(--warm);line-height:1.5}
.mi-price{font-size:.92rem;font-weight:600;color:var(--rust);white-space:nowrap}
.reviews{padding:64px 48px;background:#FFF9F2;border-top:1px solid var(--bd)}
.rg{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.rc{background:var(--cream);border:1px solid var(--bd);padding:24px}
.stars{color:var(--rust);font-size:.85rem;margin-bottom:10px}
.rc blockquote{font-family:'Lora',serif;font-size:.9rem;font-style:italic;line-height:1.7;color:var(--brown);margin-bottom:12px}
.rc-name{font-size:.75rem;font-weight:600;color:var(--warm);letter-spacing:.5px;text-transform:uppercase}
.cta-bar{background:var(--rust);color:#fff;text-align:center;padding:64px 32px}
.cta-bar h2{font-family:'Lora',serif;font-size:clamp(1.8rem,4vw,2.6rem);color:#fff;margin-bottom:10px}
.cta-bar p{opacity:.85;max-width:420px;margin:0 auto 28px;font-weight:300;line-height:1.75}
.b-cream{background:var(--cream);color:var(--rust);padding:13px 32px;border-radius:4px;font-weight:600;font-size:.92rem;text-decoration:none;display:inline-block}
footer{background:var(--dk);color:rgba(250,246,238,.3);text-align:center;padding:28px 24px;font-size:.78rem}
@media(max-width:768px){.mcols{grid-template-columns:1fr}.rg{grid-template-columns:1fr}}
</style></head><body>
<nav><div class="logo">🍽 ${n}</div><div><a href="#">Menu</a><a href="#">Story</a><a href="#">Events</a><a href="#" class="btn-r">Reserve →</a></div></nav>
<div class="hero">
<div class="h-eye">Farm to Table · Open Daily · Est. 2019</div>
<h1>Where Every<br>Dish Tells<br>a <em>Story</em></h1>
<p>Seasonal ingredients, sourced within 50 miles. Every plate crafted with honesty, technique, and a deep love for real food.</p>
<div class="hbtns"><a href="#" class="b-rust">Reserve a Table →</a><a href="#" class="b-out">View Full Menu</a></div>
</div>
<section class="menu-s"><div class="container">
<div class="sh"><span class="sh-tag">Our Menu</span><h2>Crafted Fresh, Every Single Day</h2></div>
<div class="mcols">
<div class="mcol"><div class="mcol-hd">✦ Starters</div>
<div class="mi"><div><div class="mi-name">Heritage Burrata</div><div class="mi-desc">Heirloom tomatoes, basil oil, aged balsamic</div></div><div class="mi-price">$18</div></div>
<div class="mi"><div><div class="mi-name">Tuna Tartare</div><div class="mi-desc">Sesame, avocado, pickled ginger, crispy nori</div></div><div class="mi-price">$22</div></div>
<div class="mi"><div><div class="mi-name">Soup du Jour</div><div class="mi-desc">Ask your server for today's seasonal selection</div></div><div class="mi-price">$14</div></div>
</div>
<div class="mcol"><div class="mcol-hd">✦ Mains</div>
<div class="mi"><div><div class="mi-name">Duck Confit</div><div class="mi-desc">Puy lentils, roasted carrots, orange gremolata</div></div><div class="mi-price">$36</div></div>
<div class="mi"><div><div class="mi-name">Pan-Seared Sea Bass</div><div class="mi-desc">Fennel purée, samphire, caper brown butter</div></div><div class="mi-price">$42</div></div>
<div class="mi"><div><div class="mi-name">Wild Mushroom Risotto</div><div class="mi-desc">Porcini broth, truffle oil, aged Parmigiano</div></div><div class="mi-price">$28</div></div>
</div>
<div class="mcol"><div class="mcol-hd">✦ Desserts</div>
<div class="mi"><div><div class="mi-name">Crème Brûlée</div><div class="mi-desc">Madagascar vanilla, caramelised crust</div></div><div class="mi-price">$14</div></div>
<div class="mi"><div><div class="mi-name">Chocolate Fondant</div><div class="mi-desc">Valrhona 70%, salted caramel, vanilla cream</div></div><div class="mi-price">$16</div></div>
<div class="mi"><div><div class="mi-name">Cheese Board</div><div class="mi-desc">Three seasonal selections with fig jam, crackers</div></div><div class="mi-price">$22</div></div>
</div>
</div>
</div></section>
<section class="reviews"><div class="container">
<div class="sh" style="margin-bottom:32px"><span class="sh-tag">Guest Reviews</span><h2>What People Are Saying</h2></div>
<div class="rg">
<div class="rc"><div class="stars">★★★★★</div><blockquote>"The duck confit was unlike anything I've had in the city. The atmosphere is warm, the staff genuinely care."</blockquote><div class="rc-name">— Sarah M., via Google</div></div>
<div class="rc"><div class="stars">★★★★★</div><blockquote>"We celebrated our anniversary here and it exceeded every expectation. The tasting menu was a journey. We'll be back."</blockquote><div class="rc-name">— James & Priya T.</div></div>
<div class="rc"><div class="stars">★★★★★</div><blockquote>"Best brunch spot in the neighbourhood by a mile. The burrata alone is worth the visit. Booked three weeks in a row."</blockquote><div class="rc-name">— @foodie.notes</div></div>
</div>
</div></section>
<div class="cta-bar"><h2>Join Us for Dinner</h2><p>Walk-ins welcome at the bar. Reservations strongly recommended for tables, especially on weekends.</p><a href="#" class="b-cream">Reserve Your Table →</a></div>
<footer>© 2025 ${n} · Built with ❤️ by Vezalo</footer>
<script>document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));</script>
</body></html>`
'@

if ($content.Contains($oldFood)) {
    $content = $content.Replace($oldFood, $newFood)
    Write-Host "FOOD: replaced successfully"
} else {
    Write-Host "FOOD: NOT FOUND - checking partial..."
    Write-Host ($content.IndexOf('Farm to Table'))
}

[System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
Write-Host "Done."
