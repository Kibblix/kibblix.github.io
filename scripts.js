// --- Page navigation ---
const pages = document.querySelectorAll('.page');
const links = document.querySelectorAll('[data-page]');
function showPage() {
  const destination = location.hash === '#projects' ? 'projects' : 'home';
  pages.forEach(page => { page.hidden = page.id !== destination; });
  links.forEach(link => link.classList.toggle('active', link.dataset.page === destination));
}
addEventListener('hashchange', showPage);
showPage();

// --- Light / dark theme ---
const themeSelect = document.querySelector('#theme');
const stored = localStorage.getItem('kibblix-theme');
const initial = stored === 'dark' ? 'dark' : 'light';
document.body.dataset.theme = initial;
themeSelect.value = initial;
themeSelect.addEventListener('change', () => {
  document.body.dataset.theme = themeSelect.value;
  localStorage.setItem('kibblix-theme', themeSelect.value);
});

// --- Animated background: slow geometric network + tiny floating specks ---
const canvas = document.querySelector('#background');
const ctx = canvas.getContext('2d');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let W = 0, H = 0, dpr = 1, points = [], lastTime = 0;
const rand = (min, max) => min + Math.random() * (max - min);

function setup() {
  W = innerWidth; H = innerHeight;
  dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(W*dpr);
  canvas.height = Math.round(H*dpr);
  canvas.style.width = W+'px'; canvas.style.height = H+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const count = Math.max(24, Math.min(75, Math.ceil((W*H)/23000)));
  points = Array.from({length:count}, () => ({
    x:rand(-W*.2,W*1.2), y:rand(-H*.2,H*1.2),
    vx:rand(-.11,.11),vy:rand(-.08,.08),
    size:rand(.3,1.5), triangle:Math.random()<.11
  }));
  paint();
}
function paint(t=0) {
  const dark = document.body.dataset.theme === 'dark';
  ctx.clearRect(0,0,W,H);
  ctx.lineWidth = .65;
  // Long, barely visible crossing lines, like the reference website.
  for (let i=0;i<points.length;i++) {
    let p=points[i];
    for (let step of [7,17,29]) {
      let q=points[(i+step)%points.length];
      if (i >= (i+step)%points.length) continue;
      ctx.strokeStyle = dark ? 'rgba(176,192,235,.065)' : 'rgba(94,100,139,.085)';
      ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
    }
    ctx.fillStyle = dark ? 'rgba(220,225,252,.38)' : 'rgba(64,70,90,.43)';
    if (p.triangle) {
      ctx.beginPath();ctx.moveTo(p.x,p.y-p.size*2);ctx.lineTo(p.x+p.size*2,p.y+p.size*2);ctx.lineTo(p.x-p.size*2,p.y+p.size*2);ctx.closePath();ctx.strokeStyle=ctx.fillStyle;ctx.stroke();
    } else { ctx.fillRect(p.x,p.y,p.size,p.size); }
  }
}
function animate(t) {
  const delta = Math.min((t-lastTime || 16)/16.67, 2); lastTime=t;
  points.forEach(p=>{
    p.x+=p.vx*delta; p.y+=p.vy*delta;
    if(p.x>W*1.25)p.x=-W*.25;
    if(p.x<-W*.25)p.x=W*1.25;
    if(p.y>H*1.25)p.y=-H*.25;
    if(p.y<-H*.25)p.y=H*1.25;
  });
  paint(t);
  if (!reduceMotion.matches) requestAnimationFrame(animate);
}
addEventListener('resize', setup);
new MutationObserver(()=>paint()).observe(document.body,{attributes:true,attributeFilter:['data-theme']});
setup();
if (!reduceMotion.matches) requestAnimationFrame(animate);
