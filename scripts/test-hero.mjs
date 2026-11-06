import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
class Node {
  constructor(name=''){this.className=name;this.listeners={};this.style={setProperty:(k,v)=>this.style[k]=v};this.complete=true;this.naturalWidth=100;this.offsetHeight=900;this.offsetWidth=900;this.src='assets/hero/01.webp';this.classList={contains:k=>this.className.split(' ').includes(k),add:k=>{if(!this.classList.contains(k))this.className+=' '+k},toggle:(k,on)=>{this.className=this.className.split(' ').filter(x=>x!==k).concat(on?[k]:[]).join(' ')}};}
  dataset={};addEventListener(k,fn){this.listeners[k]=fn}setAttribute(k,v){this[k]=v}decode(){return Promise.resolve()}
}
async function fixture(reduced=false,failImages=false){
 const hero=new Node('immersive-hero'),header=new Node('home-header'),title=new Node(),message=new Node(),layers=[new Node('hero-slide is-current'),new Node('hero-slide')],events={},timers=new Map();let id=0;
 const doc={hidden:false,querySelector:s=>s==='.immersive-hero'?hero:header,addEventListener:(k,fn)=>events[k]=fn};
 const logo=new Node('heroLogo');logo.classList.remove=k=>logo.classList.toggle(k,false);
 hero.querySelector=s=>s==='.heroTitle span'?title:s==='.heroLogo'?logo:message;hero.querySelectorAll=()=>layers;
 const denied=new Set(failImages?Array.from({length:9},(_,i)=>'assets/hero/'+String(i+2).padStart(2,'0')+'.webp'):[]);class Image{get src(){return this.url}set src(v){this.url=v;queueMicrotask(()=>denied.has(v)?this.onerror?.():this.onload?.())}decode(){return Promise.resolve()}}
 const context={document:doc,Image,matchMedia:()=>({matches:reduced,addEventListener(){}}),performance:{now:()=>100},setTimeout:(fn,ms)=>{timers.set(++id,{fn,ms});return id},clearTimeout:i=>timers.delete(i),addEventListener:(k,fn)=>events[k]=fn,requestAnimationFrame:fn=>fn(),scrollY:0};
 vm.runInNewContext(fs.readFileSync(new URL('../dist/safety.js',import.meta.url),'utf8'),context);
 vm.runInNewContext(fs.readFileSync(new URL('../dist/hero.js',import.meta.url),'utf8'),context);
 const flush=async()=>{for(let i=0;i<30;i++)await Promise.resolve()};await flush();
 const fire=async ms=>{const found=[...timers].find(([,t])=>t.ms===ms);assert.ok(found,'Timer '+ms);timers.delete(found[0]);await found[1].fn();await flush()};
 return{hero,header,title,logo,layers,events,timers,doc,denied,context,fire,flush};
}
const f=await fixture();assert.equal(f.header.inert,true);assert.ok(!f.hero.classList.contains('is-message'));await f.fire(12500);assert.ok(f.hero.classList.contains('is-message'));assert.match(f.title.textContent,/La visión detrás/);await f.fire(8500);assert.ok(!f.hero.classList.contains('is-message'));await f.fire(12500);assert.match(f.title.textContent,/Cada detalle/);await f.fire(8500);await f.fire(12500);assert.match(f.title.textContent,/Espacios que inspiran/);await f.fire(8500);await f.fire(12500);assert.match(f.title.textContent,/La visión detrás/,'Phrase cycle repeats');
for(let i=0;i<10;i++){await f.fire(6000);assert.equal(f.layers.filter(x=>x.classList.contains('is-current')).length,1,'Outgoing image remains visible');assert.equal(f.layers.filter(x=>x.classList.contains('is-entering')).length,1);await f.fire(1250);assert.equal(f.layers.filter(x=>x.classList.contains('is-current')).length,1);}
assert.ok(f.layers.some(x=>x.src==='assets/hero/01.webp'&&x.classList.contains('is-current')),'Loop returns to first of ten');
f.doc.hidden=true;f.events.visibilitychange();assert.ok(![...f.timers.values()].some(t=>t.ms===6000),'Hidden page pauses autoplay');f.doc.hidden=false;f.events.visibilitychange();assert.ok([...f.timers.values()].some(t=>t.ms===6000));
f.context.scrollY=560;f.events.scroll();assert.equal(f.header.inert,false);assert.ok(f.header.classList.contains('is-visible'));assert.ok(Number(f.hero.style['--intro-opacity'])<.01);
const taps=await fixture();taps.logo.listeners.click();assert.equal(taps.logo['aria-pressed'],'true');await taps.fire(3000);assert.equal(taps.logo['aria-pressed'],'false');taps.logo.listeners.click();taps.logo.listeners.click();assert.equal(taps.logo['aria-pressed'],'false');assert.ok(![...taps.timers.values()].some(t=>t.ms===3000));taps.logo.listeners.click();await taps.fire(12500);assert.equal(taps.logo.disabled,true);assert.equal(taps.logo['aria-pressed'],'false');await taps.fire(8500);assert.equal(taps.logo.disabled,false);
const r=await fixture(true);assert.equal([...r.timers.values()].some(t=>t.ms===6000),false,'Reduced motion starts paused');
const failure=await fixture(false,true);await failure.fire(6000);assert.equal(failure.layers.filter(x=>x.classList.contains('is-entering')).length,0);assert.ok(failure.layers.some(x=>x.src==='assets/hero/01.webp'&&x.classList.contains('is-current')),'Image errors never clear current layer');
console.log('Hero checks passed: alternating logo and three phrases, ten-image loop, overlapping crossfade, visibility, scroll, reduced motion and failed assets.');
