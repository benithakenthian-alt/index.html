/* ================================================================
   ELLA — Espace des Filles | app.js v2
================================================================ */

// ──────────────────────────────────────────
// ÉTAT GLOBAL
// ──────────────────────────────────────────
let users    = JSON.parse(localStorage.getItem('ella-users') || '[]');
let currentUser = null;
let shareTarget = '';

const QUOTES = [
  {t:'Une femme avec une voix est, par définition, une femme forte.', a:'— Melinda Gates'},
  {t:'Il n\'y a rien de plus beau qu\'une fille qui sait ce qu\'elle veut et qui va le chercher.', a:'— Serena Williams'},
  {t:'Je suis une femme. Je suis puissante. J\'ai des droits. Je les défendrai.', a:'— Malala Yousafzai'},
  {t:'L\'éducation est l\'arme la plus puissante pour changer le monde.', a:'— Nelson Mandela'},
  {t:'Ne laisse personne te dire que tu ne peux pas le faire — surtout pas toi-même.', a:'— Nike / Marcy Blum'},
  {t:'Le code est la langue la plus démocratique du monde.', a:'— Ada Lovelace (adaptée)'},
];

// ──────────────────────────────────────────
// PARTICULES / ÉTOILES
// ──────────────────────────────────────────
(function initStars() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function mkStar() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + .2,
      a: Math.random(),
      da: (Math.random() * .004 + .001) * (Math.random() < .5 ? 1 : -1)
    };
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.a = Math.max(0, Math.min(1, s.a + s.da));
      if (s.a <= 0 || s.a >= 1) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,170,255,${s.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); stars = Array.from({length:80}, mkStar); });
  resize();
  stars = Array.from({length:80}, mkStar);
  draw();
})();

// ──────────────────────────────────────────
// NAVIGATION PAGES
// ──────────────────────────────────────────
function goTo(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const p = document.getElementById(id);
  p.classList.add('active');
  window.scrollTo(0, 0);
}

// ──────────────────────────────────────────
// PÉTALES DE BIENVENUE
// ──────────────────────────────────────────
function spawnPetals() {
  const wrap = document.getElementById('welcome-petals');
  if (!wrap) return;
  wrap.innerHTML = '';
  const emojis = ['🌸','🌷','✨','💜','🌺','⭐','🌼'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.classList.add('petal');
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.left  = Math.random() * 100 + 'vw';
    p.style.setProperty('--dur',   (4 + Math.random() * 6) + 's');
    p.style.setProperty('--delay', (Math.random() * 4) + 's');
    wrap.appendChild(p);
  }
}

// ──────────────────────────────────────────
// AFFICHER / MASQUER MOT DE PASSE
// ──────────────────────────────────────────
function togglePwd(inputId, btn) {
  const inp = document.getElementById(inputId);
  inp.type  = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁' : '🙈';
}

// ──────────────────────────────────────────
// CONNEXION
// ──────────────────────────────────────────
function doLogin() {
  const prenom = v('l-prenom');
  const mdp    = v('l-mdp');
  const err    = document.getElementById('l-error');

  if (!prenom || !mdp) { err.textContent = '⚠️ Merci de remplir tous les champs.'; return; }

  const user = users.find(u => u.prenom.toLowerCase() === prenom.toLowerCase() && u.mdp === mdp);
  if (!user) {
    err.textContent = '❌ Prénom ou mot de passe incorrect. Pas encore de compte ?';
    return;
  }
  err.textContent = '';
  loginSuccess(user);
}

// ──────────────────────────────────────────
// INSCRIPTION
// ──────────────────────────────────────────
function doRegister() {
  const nom    = v('r-nom');
  const prenom = v('r-prenom');
  const age    = v('r-age');
  const ville  = v('r-ville');
  const mdp    = v('r-mdp');
  const mdp2   = v('r-mdp2');
  const err    = document.getElementById('r-error');

  if (!nom || !prenom || !mdp) { err.textContent = '⚠️ Nom, prénom et mot de passe sont requis.'; return; }
  if (mdp.length < 4)           { err.textContent = '⚠️ Le mot de passe doit avoir au moins 4 caractères.'; return; }
  if (mdp !== mdp2)             { err.textContent = '⚠️ Les mots de passe ne correspondent pas.'; return; }

  const exists = users.find(u => u.prenom.toLowerCase() === prenom.toLowerCase());
  if (exists) { err.textContent = '⚠️ Un compte avec ce prénom existe déjà. Connecte-toi !'; return; }

  const newUser = { nom, prenom, age: age || '', ville: ville || '', mdp };
  users.push(newUser);
  localStorage.setItem('ella-users', JSON.stringify(users));
  err.textContent = '';
  loginSuccess(newUser);
}

function loginSuccess(user) {
  currentUser = user;

  // Page bienvenue
  const initial = user.prenom.charAt(0).toUpperCase();
  setText('welcome-avatar', initial);
  setText('welcome-name', 'Bonjour, ' + user.prenom + ' ! ');
  setText('welcome-city', user.ville ?  user.ville : '');
  spawnPetals();
  goTo('page-welcome');
}

function goToApp() {
  if (!currentUser) { goTo('page-splash'); return; }
  // Mettre à jour la UI de l'app
  const initial = currentUser.prenom.charAt(0).toUpperCase();
  const fullName = currentUser.prenom + ' ' + currentUser.nom;
  setText('sb-avatar',      initial);
  setText('sb-name',        fullName);
  setText('sb-city',        currentUser.ville || '—');
  setText('topbar-avatar',  initial);
  setText('hh-greeting',    'Bonjour, ' + currentUser.prenom );

  // Citation du jour
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  setText('qod-text',   q.t);
  setText('qod-author', q.a);

  goTo('page-app');
  openSec('home', document.querySelector('[data-sec=home]'));
}

// ──────────────────────────────────────────
// DÉCONNEXION
// ──────────────────────────────────────────
function doLogout() {
  currentUser = null;
  document.getElementById('l-prenom').value = '';
  document.getElementById('l-mdp').value    = '';
  document.getElementById('l-error').textContent = '';
  closeSidebar();
  goTo('page-splash');
  toast('À bientôt ! ');
}

// ──────────────────────────────────────────
// NAVIGATION SIDEBAR
// ──────────────────────────────────────────
function openSidebar()  {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sb-overlay').classList.add('visible');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sb-overlay').classList.remove('visible');
}

function openSec(name, btn) {
  document.querySelectorAll('.sec').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sb-item').forEach(b => b.classList.remove('active'));
  const sec = document.getElementById('sec-' + name);
  if (sec) sec.classList.add('active');
  if (btn) btn.classList.add('active');
  // Retirer badge discussions
  if (name === 'discussions') {
    const b = document.getElementById('badge-discussions');
    if (b) b.textContent = '';
  }
  const titles = { home:'Accueil', discussions:'Discussions', temoignages:'Témoignages', droits:'Mes Droits', talents:'Vitrine Talents', code:'Apprendre à Coder' };
  setText('topbar-title', titles[name] || name);
  const main = document.querySelector('.app-main');
  if (main) main.scrollTo(0, 0);
  closeSidebar();
}

// ──────────────────────────────────────────
// FILTRES CHIPS
// ──────────────────────────────────────────
function filterChip(btn, topic) {
  btn.closest('.topic-chips').querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#chat-feed .cmsg').forEach(m => {
    m.style.display = (topic === 'all' || m.dataset.topic === topic) ? '' : 'none';
  });
}

function filterTalents(btn, domain) {
  btn.closest('.topic-chips').querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#talents-grid .tlcard').forEach(c => {
    c.style.display = (domain === 'all' || c.dataset.domain === domain) ? '' : 'none';
  });
}

// ──────────────────────────────────────────
// CHAT DISCUSSIONS
// ──────────────────────────────────────────
function sendMsg() {
  const input = document.getElementById('chat-input');
  const topic = document.getElementById('chat-topic').value;
  const txt   = input.value.trim();
  if (!txt) return;

  const feed = document.getElementById('chat-feed');
  const now  = new Date().toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});
  const who  = currentUser ? currentUser.prenom : 'Moi';
  const initial = who.charAt(0).toUpperCase();

  const msg = document.createElement('div');
  msg.classList.add('cmsg', 'me');
  msg.dataset.topic = topic;
  msg.innerHTML = `
    <div class="cm-bub">
      <div class="cm-who">${escH(who)} <span class="cm-t">${now}</span></div>
      <div class="cm-txt">${escH(txt)}</div>
    </div>
    <div class="cm-av" style="background:linear-gradient(135deg,#7c3aed,#c026d3)">${escH(initial)}</div>
  `;
  feed.appendChild(msg);
  input.value = '';
  feed.scrollTop = feed.scrollHeight;

  // Auto-réponse bienveillante
  setTimeout(() => {
    const reps = [
      'Merci pour ton partage ! ', 'Ensemble on est plus fortes ',
      'Super message ! Tu inspires. ', 'Belle réflexion ',
      'Je suis d\'accord avec toi ! ', 'Merci d\'être là avec nous '
    ];
    const auto = document.createElement('div');
    auto.classList.add('cmsg', 'other');
    auto.dataset.topic = topic;
    auto.innerHTML = `
      <div class="cm-av" style="background:linear-gradient(135deg,#be185d,#ec4899)">E</div>
      <div class="cm-bub">
        <div class="cm-who">RiseFille  <span class="cm-t">${new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</span></div>
        <div class="cm-txt">${reps[Math.floor(Math.random()*reps.length)]}</div>
      </div>
    `;
    feed.appendChild(auto);
    feed.scrollTop = feed.scrollHeight;
  }, 1500);
}

document.getElementById('chat-input').addEventListener('keydown', e => { if (e.key === 'Enter') sendMsg(); });

// ──────────────────────────────────────────
// APERÇU PHOTO
// ──────────────────────────────────────────
function previewImg(input, previewId) {
  const file = input.files[0];
  const prev = document.getElementById(previewId);
  if (!file || !prev) return;
  const reader = new FileReader();
  reader.onload = e => { prev.src = e.target.result; prev.style.display = 'block'; };
  reader.readAsDataURL(file);
}

// ──────────────────────────────────────────
// FORMULAIRES COLLAPSIBLES
// ──────────────────────────────────────────
function toggleForm(id) {
  const el = document.getElementById(id);
  if (el.style.display === 'none') {
    el.style.display = 'block';
    el.scrollIntoView({behavior:'smooth', block:'start'});
  } else {
    el.style.display = 'none';
  }
}

// ──────────────────────────────────────────
// PUBLIER TÉMOIGNAGE
// ──────────────────────────────────────────
function pubTemo() {
  const titre = v('tf-titre');
  const texte = v('tf-texte');
  const cat   = document.getElementById('tf-cat').value;
  const prev  = document.getElementById('tf-prev');

  if (!titre || !texte) { toast('⚠️ Titre et texte sont requis.'); return; }

  const who     = currentUser ? currentUser.prenom + ' ' + currentUser.nom : 'Utilisatrice';
  const ville   = currentUser ? currentUser.ville : '';
  const initial = who.charAt(0).toUpperCase();
  const now     = 'À l\'instant';

  const catLabels = {parcours:'🎓 Parcours', courage:' Courage', famille:' Famille', reve:' Rêves', discrimination:' Discrimination'};
  const catClasses = {parcours:'cat-parcours', courage:'cat-courage', famille:'cat-famille', reve:'cat-reve', discrimination:'cat-discrimination'};

  const article = document.createElement('article');
  article.classList.add('tcard');
  let photoHTML = '';
  if (prev && prev.style.display !== 'none') {
    photoHTML = `<img src="${prev.src}" class="tc-photo" alt="Photo témoignage"/>`;
  }
  article.innerHTML = `
    <div class="tcard-hd">
      <div class="tc-av" style="background:linear-gradient(135deg,#7c3aed,#ec4899)">${escH(initial)}</div>
      <div class="tc-meta"><strong>${escH(who)}</strong><span>${ville ? escH(ville)+' · ' : ''}${now}</span></div>
      <span class="tcat-badge ${catClasses[cat]}">${catLabels[cat]}</span>
    </div>
    <h3 class="tc-title">${escH(titre)}</h3>
    <p class="tc-body">${escH(texte)}</p>
    ${photoHTML}
    <div class="tc-acts">
      <button class="act-btn like-btn" onclick="toggleLike(this)"><span class="lk-heart">🤍</span><span class="lk-n">0</span> J'aime</button>
      <button class="act-btn" onclick="toggleComments(this)">💬 <span>0</span> Commentaires</button>
      <button class="act-btn" onclick="openShare('témoignage de ${escH(who)}')">🔗 Partager</button>
    </div>
    <div class="comments-wrap" style="display:none">
      <div class="cmnt-compose">
        <input type="text" placeholder="Ajouter un commentaire..." class="cmnt-input" onkeydown="if(event.key==='Enter')addCmt(this)"/>
        <button onclick="addCmt(this.previousElementSibling)">→</button>
      </div>
    </div>
  `;

  const list = document.getElementById('temo-list');
  list.insertBefore(article, list.firstChild);

  // Reset form
  document.getElementById('tf-titre').value = '';
  document.getElementById('tf-texte').value = '';
  if (prev) { prev.style.display = 'none'; prev.src = ''; }
  document.getElementById('tf-photo').value = '';
  document.getElementById('temo-form-wrap').style.display = 'none';
  toast('Ton témoignage a été publié ');
}

// ──────────────────────────────────────────
// PUBLIER TALENT
// ──────────────────────────────────────────
function pubTalent() {
  const nom    = v('tl-nom');
  const slogan = v('tl-slogan');
  const desc   = v('tl-desc');
  const domaine= document.getElementById('tl-domaine').value;
  const age    = v('tl-age');
  const ville  = v('tl-ville');
  const prev   = document.getElementById('tl-prev');

  if (!nom || !desc) { toast('⚠️ Nom et description sont requis.'); return; }

  const initial = nom.charAt(0).toUpperCase();
  const domainLabels = {art:' Art',musique:' Musique',danse:' Danse',ecriture:' Écriture',sport:' Sport',cuisine:' Cuisine',mode:' Mode',entrepreneuriat:' Entrepreneuriat',sciences:' Sciences',autre:'✨ Autre'};

  let imgHTML = '';
  if (prev && prev.style.display !== 'none') {
    imgHTML = `<div class="tlc-img-wrap"><img src="${prev.src}" class="tlc-img" alt="Talent"/><div class="tlc-domain">${domainLabels[domaine]}</div></div>`;
  }

  const card = document.createElement('div');
  card.classList.add('tlcard');
  card.dataset.domain = domaine;
  card.innerHTML = `
    ${imgHTML}
    <div class="tlc-body">
      <div class="tlc-head">
        <div class="tlc-av" style="background:linear-gradient(135deg,#7c3aed,#ec4899)">${escH(initial)}</div>
        <div><div class="tlc-name">${escH(nom)}</div><div class="tlc-loc">${ville ? escH(ville) : ''}${age ? ' · '+escH(age)+' ans' : ''}</div></div>
      </div>
      ${slogan ? `<p class="tlc-slogan">"${escH(slogan)}"</p>` : ''}
      <p class="tlc-desc">${escH(desc)}</p>
      <div class="tc-acts">
        <button class="act-btn like-btn" onclick="toggleLike(this)"><span class="lk-heart">🤍</span><span class="lk-n">0</span> J'aime</button>
        <button class="act-btn" onclick="toggleComments(this)">💬 0</button>
        <button class="act-btn" onclick="openShare('talent de ${escH(nom)}')">🔗</button>
      </div>
      <div class="comments-wrap" style="display:none">
        <div class="cmnt-compose">
          <input type="text" placeholder="Commenter..." class="cmnt-input" onkeydown="if(event.key==='Enter')addCmt(this)"/>
          <button onclick="addCmt(this.previousElementSibling)">→</button>
        </div>
      </div>
    </div>
  `;

  const grid = document.getElementById('talents-grid');
  grid.insertBefore(card, grid.firstChild);

  // Reset
  ['tl-nom','tl-age','tl-ville','tl-slogan','tl-desc'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
  if (prev) { prev.style.display='none'; prev.src=''; }
  document.getElementById('tl-photo').value='';
  document.getElementById('talent-form-wrap').style.display='none';
  toast('Ton talent brille dans la vitrine ! ');
}

// ──────────────────────────────────────────
// LIKES
// ──────────────────────────────────────────
function toggleLike(btn) {
  const liked = btn.classList.toggle('liked');
  const n     = btn.querySelector('.lk-n');
  const heart = btn.querySelector('.lk-heart');
  const count = parseInt(n.textContent) || 0;
  n.textContent = liked ? count + 1 : Math.max(0, count - 1);
  heart.textContent = liked ? '❤️' : '🤍';
  if (liked) toast('Vous avez aimé ce contenu ');
}

// ──────────────────────────────────────────
// COMMENTAIRES
// ──────────────────────────────────────────
function toggleComments(btn) {
  const card = btn.closest('.tcard, .tlcard');
  const wrap = card ? card.querySelector('.comments-wrap') : null;
  if (wrap) {
    wrap.style.display = wrap.style.display === 'none' ? 'flex' : 'none';
    if (wrap.style.display !== 'none') {
      wrap.style.flexDirection = 'column';
      wrap.style.gap = '.6rem';
    }
  }
}

function addCmt(input) {
  const txt = input.value.trim();
  if (!txt) return;
  const wrap  = input.closest('.comments-wrap');
  const who   = currentUser ? currentUser.prenom : 'Moi';
  const cmnt  = document.createElement('div');
  cmnt.classList.add('cmnt');
  cmnt.innerHTML = `<strong>${escH(who)} :</strong> ${escH(txt)}`;
  wrap.insertBefore(cmnt, input.parentElement);
  input.value = '';
}

// ──────────────────────────────────────────
// DROITS — FLIP CARD
// ──────────────────────────────────────────
function flipDroit(card) {
  card.classList.toggle('flipped');
}

// ──────────────────────────────────────────
// PARTAGE
// ──────────────────────────────────────────
function openShare(label) {
  shareTarget = label;
  setText('share-label', 'Partager : ' + label);
  document.getElementById('share-modal-bg').style.display = 'flex';
}

function closeShare() {
  document.getElementById('share-modal-bg').style.display = 'none';
}

function doShare(type) {
  const url  = window.location.href;
  const text = 'Regarde ce ' + shareTarget + ' sur RiseFille ! ' + url;
  if (type === 'whatsapp') {
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  } else if (type === 'facebook') {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank');
  } else if (type === 'copy') {
    navigator.clipboard.writeText(url).then(() => toast('Lien copié ! ')).catch(() => toast('Lien: ' + url));
  }
  closeShare();
}

// ──────────────────────────────────────────
// TOAST
// ──────────────────────────────────────────
function toast(msg) {
  const wrap = document.getElementById('toast-wrap');
  const el   = document.createElement('div');
  el.classList.add('toast');
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .4s';
    el.style.opacity    = '0';
    setTimeout(() => el.remove(), 400);
  }, 2800);
}

// ──────────────────────────────────────────
// UTILITAIRES
// ──────────────────────────────────────────
function v(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function setText(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}

function escH(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
