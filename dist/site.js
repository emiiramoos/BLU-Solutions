'use strict';
const one = selector => document.querySelector(selector);
const all = selector => [...document.querySelectorAll(selector)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
function moveTo(element) {
  element.scrollIntoView({behavior: reduced.matches ? 'instant' : 'smooth'});
}
const ribbon = one('.ticker>div');
for (let i = 0; ribbon && i < 2; i++) {
  const text = document.createElement('span');
  text.textContent = 'Habitaciones     ·     Restaurantes     ·     Gimnasios     ·     Outdoor     ·     Señalamientos     ·     Proyectos a medida     ·     '.repeat(2);
  text.setAttribute('aria-hidden','true');
  ribbon.append(text);
}
let products = [];let selectedModel='';
let area = 'Todos';
let limit = 12; let category='',collection='',catalogSource='';
const clean = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function showDetail(p) {
  selectedModel=p.model||'';
  one('#photo').src = p.image;
  one('#photo').alt = p.name;
  one('#line').textContent = p.area + ' · ' + p.category;
  one('#name').textContent = p.name;
  one('#desc').textContent = p.description;
  one('#specs').replaceChildren();
  for(const [title,values] of [['Características',p.features],['Materiales',p.materials],['Opciones y acabados',p.options]]){
    if(!values?.length)continue;
    const section=document.createElement('section'),h=document.createElement('h4'),ul=document.createElement('ul');h.textContent=title;
    values.forEach(value=>{const li=document.createElement('li');li.textContent=value;ul.append(li)});section.append(h,ul);one('#specs').append(section);
  }
  one('#sourceNote').textContent=[p.brand,p.model,p.collection,p.imageKind==='technical-drawing'?'Ilustración técnica del fabricante':'',p.sources?.length?'Fuentes: '+p.sources.map(x=>x.file.replace('.pdf','')+' · pág. '+x.page).join('; '):p.sourcePage?'BH Fitness Pro 2026 · pág. '+p.sourcePage:''].filter(Boolean).join(' · ');
  one('#detail').showModal();
}
function render() {
  const term = clean(one('#search').value.trim());
  const matches = products.filter(p => (area === 'Todos' || area === p.area) && (!category||category===p.category) && (!collection||collection===p.collection) && (!catalogSource||p.sourceLabels?.includes(catalogSource)) && clean([p.name,p.model,p.brand,p.category,p.collection,p.area].filter(Boolean).join(' ')).includes(term));
  one('#products').replaceChildren(...matches.slice(0,limit).map(p => {
    const btn = document.createElement('button');
    btn.className = 'piece';
    const img = document.createElement('img');
    img.src = p.image; img.loading = 'lazy'; img.alt = '';
    const label = document.createElement('small'); label.textContent = p.area + ' / ' + p.category;
    const title = document.createElement('strong'); title.textContent = p.name;
    btn.append(img,label,title);if(p.imageKind==='technical-drawing'){const note=document.createElement('span');note.className='imageKind';note.textContent='Ilustración técnica';btn.append(note)}
    btn.onclick = () => showDetail(p);
    return btn;
  }));
  one('#count').textContent = matches.length ? Math.min(limit,matches.length) + ' de ' + matches.length + ' piezas' : 'Sin coincidencias. Pruebe con otro nombre o área.';
  one('#more').hidden = matches.length <= limit;
}
function choose(value) {
  area = value; limit = 12;category='';collection='';catalogSource='';updateFilters();
  all('.tabs button').forEach(btn => btn.setAttribute('aria-pressed',String(btn.textContent === area)));
  render();
}
function updateFilters(){
 const subset=products.filter(p=>area==='Todos'||p.area===area);
 for(const [id,key,label] of [['category','category','Todos los tipos'],['collection','collection','Todas las colecciones'],['catalogSource','sourceLabels','Todos los catálogos']]){
  const el=one('#'+id);el.replaceChildren(new Option(label,''));[...new Set(subset.flatMap(p=>p[key]||[]))].sort((a,b)=>a.localeCompare(b,'es')).forEach(x=>el.add(new Option(x,x)));
 }
 one('#collectionLabel').hidden=area!=='Outdoor';one('#catalogLabel').hidden=area!=='Outdoor';
}
if (one('#products')) {
for(const id of ['category','collection','catalogSource'])one('#'+id).onchange=e=>{if(id==='category')category=e.target.value;if(id==='collection')collection=e.target.value;if(id==='catalogSource')catalogSource=e.target.value;limit=12;render()};
all('.tabs button').forEach(btn => btn.onclick = () => choose(btn.textContent));
all('[data-select]').forEach(btn => btn.onclick = () => {
  one('#search').value = ''; choose(btn.dataset.select); moveTo(one('#piezas'));
});
one('#search').oninput = () => {limit=9; render()};
one('#more').onclick = () => {limit += 12; render()};
fetch('assets/catalog.json').then(r => {if (!r.ok) throw Error(); return r.json()}).then(data => {products=data;updateFilters();render()}).catch(() => {one('#count').textContent='No se pudo cargar el catálogo. Actualice la página para reintentar.'});
}
one('#ask').onclick = () => {
  location.href='contacto.html?pieza='+encodeURIComponent([one('#name').textContent,selectedModel].filter(Boolean).join(' · '));
};
all('.close').forEach(btn => btn.onclick = () => btn.closest('dialog').close());
all('[data-legal]').forEach(btn => btn.onclick = () => {
  ['privacidad','terminos'].forEach(id => document.getElementById(id).hidden = id !== btn.dataset.legal);
  one('#legal').showModal();
});
if (one('#brief')) one('#brief').onsubmit = event => {
  event.preventDefault();
  const f = new FormData(event.target);
  const body = ['Buen día, equipo de BLU Solutions.', '', 'Soy ' + f.get('nombre') + ', de ' + f.get('empresa') + '.', 'Tipo de negocio: ' + f.get('tipo'), 'Etapa: ' + f.get('etapa'), 'Ciudad: '+ f.get('ciudad'), 'Correo de contacto: '+f.get('correo'), '', f.get('necesidad')].join('\n');
  location.href = 'mailto:manuel.agosto@blusolutions.com.mx?subject=' + encodeURIComponent('Consulta de equipamiento · ' + f.get('empresa')) + '&body=' + encodeURIComponent(body);
  one('#formstatus').textContent = 'Revise el borrador en su aplicación de correo. Si no se abrió, puede escribirnos al correo de contacto.';
};
const menu = one('.menuToggle');
menu.onclick=()=>{ const open=menu.getAttribute('aria-expanded')!=='true'; menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');one('header').classList.toggle('menuOpen',open); };
all('nav a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menú');one('header').classList.remove('menuOpen')}));
addEventListener('keydown',e=>{if(e.key==='Escape'){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menú');one('header').classList.remove('menuOpen')}});
const selected=new URLSearchParams(location.search).get('pieza');
if(selected && one('#needs')) one('#needs').value='Me interesa: '+selected.slice(0,200)+'.';
const reveals=all('.story p,.stepList article');
if(!reduced.matches && 'IntersectionObserver' in window){
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});
reveals.forEach(e=>{e.classList.add('reveal');observer.observe(e)});
}
const list=one('.stepList');
if(list){const steps=[...list.querySelectorAll('article')];let ticking=false;const progress=()=>{ticking=false;let active=0;steps.forEach((step,i)=>{if(step.getBoundingClientRect().top<innerHeight*.57)active=i});steps.forEach((step,i)=>{step.classList.toggle('current',i===active);step.classList.toggle('completed',i<active)})};addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(progress)}},{passive:true});progress()}
const slide=one('#contactSlide');
if(slide&&!reduced.matches){const scenes=[['assets/habitaciones.webp','Habitación equipada'],['assets/restaurante.webp','Restaurante'],['assets/gym.webp','Gimnasio'],['assets/nardi-terrace.webp','Terraza con mobiliario Nardi']];let i=0;setInterval(()=>{if(document.hidden)return;slide.style.opacity='0';setTimeout(()=>{i=(i+1)%scenes.length;slide.onload=()=>slide.style.opacity='1';slide.onerror=()=>slide.style.opacity='1';slide.src=scenes[i][0];slide.alt=scenes[i][1]},650)},6500)}
if(!reduced.matches&&'IntersectionObserver' in window){const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('isVisible');revealObserver.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -20px 0px'});all('.sectionhead,.area,.storyVisual,.story>div,.invitation h2,.invitation a,.contact h2,.person').forEach(el=>{el.classList.add('softReveal');revealObserver.observe(el)})}
all('.catalogMenu').forEach(detail=>{document.addEventListener('click',e=>{if(!detail.contains(e.target))detail.open=false});detail.addEventListener('keydown',e=>{if(e.key==='Escape')detail.open=false})});
