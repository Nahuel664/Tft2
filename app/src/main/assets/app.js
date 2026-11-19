const $=id=>document.getElementById(id),esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const KN={c:'Objeto',a:'Artefacto',r:'Radiante',e:'Emblema'},TN={S:'Plata',G:'Oro',P:'Prismático'};
const champs=CH.split('\n').map(l=>l.split('|')[0]);
const ITL={c:(IT[0][1]+';'+IT[1][1]).split(';'),a:IT[2][1].split(';'),r:IT[3][1].split(';'),e:IT[4][1].split(';').map(x=>'Emblema de '+x)};
const augT={};for(const t of'SGP')AG[t].split(';').forEach(s=>{const n=s.split('~')[0];if(!augT[n])augT[n]=t});
const dl=(id,a)=>`<datalist id="${id}">${a.map(x=>`<option value="${esc(x)}">`).join('')}</datalist>`;
$('dls').innerHTML=dl('dl-ch',champs)+dl('dl-c',ITL.c)+dl('dl-a',ITL.a)+dl('dl-r',ITL.r)+dl('dl-e',ITL.e)+dl('dl-ag',Object.keys(augT));
const KEY='tft-libreta-v2';let db={comps:[],tips:[],cfg:{}};
try{const s=localStorage.getItem(KEY);if(s)db=Object.assign(db,JSON.parse(s))}catch(e){}
db.cfg=Object.assign({sc:1,res:false},db.cfg);
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(db));return true}catch(e){alert('No hay espacio. Quita imágenes o haz copia de seguridad.');return false}};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);
let tab='c',btab='c',dr=null,bo='';
const isB=()=>location.hash==='#burbuja'||location.hash==='#vista';
const chip=(c,n,x)=>`<span class="ch ${c}">${c==='k-r'?'✦ ':''}${esc(n)}${x||''}</span>`;
const tierH=r=>`<div class="tier ${r}">${r||'·'}</div>`;

function render(){
 const b=isB();document.body.className=b?'bb':'';
 $('hd').style.display=(!b&&(tab==='c'||tab==='t'||tab==='k'))?'':'none';$('fab').style.display=(!b&&tab!=='s'&&tab!=='k')?'':'none';
 $('bar').style.display=b?'flex':'none';
 b?bubble():editor();
}
function editor(){
 const T=[['c','Comps'],['t','Consejos'],['k','Catálogo'],['s','Ajustes']];
 $('nav').innerHTML=T.map(t=>`<button data-a="tab" data-v="${t[0]}" aria-selected="${t[0]===tab}">${t[1]}</button>`).join('');
 const q=$('q').value.trim().toLowerCase();let h='';
 if(tab==='c'){
  const r=db.comps.filter(c=>!q||(c.t+' '+c.ch.map(x=>x.n).join(' ')).toLowerCase().includes(q));
  h=r.map(c=>`<div class="card"><div class="r">${tierH(c.r)}<span class="nm">${esc(c.t)}</span></div><div class="sub">${esc(c.ch.map(x=>x.n).join(' · '))}</div>${c.ag.length?`<div class="sub">${c.ag.length} aumentos · ${c.ch.reduce((n,x)=>n+x.it.length,0)} objetos</div>`:''}${c.img?`<img class="im" src="${c.img}">`:''}${c.n?`<div class="sub" style="white-space:pre-wrap">${esc(c.n)}</div>`:''}<div><button class="lnk" data-a="ed" data-id="${c.id}">Editar</button><button class="lnk" data-a="dup" data-id="${c.id}">Duplicar</button><button class="lnk d" data-a="del" data-id="${c.id}">Borrar</button></div></div>`).join('');
 }else if(tab==='t'){
  const r=db.tips.filter(c=>!q||(c.t+' '+c.n).toLowerCase().includes(q));
  h=r.map(c=>`<div class="card"><div class="nm">${esc(c.t)}</div>${c.img?`<img class="im" src="${c.img}">`:''}<div class="sub" style="white-space:pre-wrap">${esc(c.n)}</div><button class="lnk" data-a="ed" data-id="${c.id}">Editar</button><button class="lnk d" data-a="del" data-id="${c.id}">Borrar</button></div>`).join('');
 }else if(tab==='k'){h=catalog()}else{
  h=`<h3>Burbuja flotante (solo lectura)</h3><label>Tamaño del contenido: ${db.cfg.sc.toFixed(1)}×</label><input type="range" id="rg" min="0.6" max="2" step="0.1" value="${db.cfg.sc}">
  <label><input type="checkbox" id="rs" style="width:auto" ${db.cfg.res?'checked':''}> Modo resumido</label>
  <div class="r2"><button class="btn p" data-a="bub">Iniciar burbuja flotante</button><button class="btn" data-a="prev">Previsualizar</button></div>
  <h3>Copia de seguridad</h3><textarea id="bt" style="min-height:110px"></textarea>
  <div class="r2"><button class="btn" data-a="exp">Exportar</button><button class="btn p" data-a="imp">Importar</button></div>`;
 }
 $('app').innerHTML=h||'<div class="empty">Aún no hay nada. Pulsa «+ Añadir».</div>';
}
const CHF=CH.split('\n').map(l=>{const p=l.split('|');return{n:p[0],c:+p[1],t:p[2].split(','),u:p[3]||''}});
const TRF=TR.split('\n').map(l=>{const p=l.split('|');return{n:p[0],k:p[1],b:p[2],d:p[3]}});
const AUGL=[];for(const t of'SGP')AG[t].split(';').forEach(s=>{const m=s.split('~');AUGL.push({n:m[0],t,x:m[1]||''})});
const KB={B:'Banda',C:'Clase',U:'Único'};
const CF={c:[['','Todos'],['1','1 oro'],['2','2'],['3','3'],['4','4'],['5','5'],['7','7'],['u','🔒 Desbloqueables']],t:[['','Todos'],['B','Bandas'],['C','Clases'],['U','Únicos']],i:[],a:[['','Todos'],['S','Plata'],['G','Oro'],['P','Prismático'],['E','Emblema'],['T','Rasgo'],['H','Héroe']]};
let ck='c',cf='',co='';
function catalog(){
 const q=$('q').value.trim().toLowerCase();
 const sub=[['c','Campeones'],['t','Rasgos'],['i','Objetos'],['a','Aumentos']];
 let h=`<div style="overflow-x:auto;white-space:nowrap">${sub.map(x=>`<button class="ch${ck===x[0]?' on':''}" data-a="ck" data-v="${x[0]}">${x[1]}</button>`).join('')}</div>`;
 if(CF[ck].length)h+=`<div style="overflow-x:auto;white-space:nowrap">${CF[ck].map(x=>`<button class="ch${cf===x[0]?' on':''}" data-a="cf" data-v="${x[0]}">${x[1]}</button>`).join('')}</div>`;
 if(ck==='c'){
  const r=CHF.filter(c=>(!cf||(cf==='u'?c.u:String(c.c)===cf))&&(!q||(c.n+' '+c.t.join(' ')).toLowerCase().includes(q)));
  h+=r.map(c=>`<div class="card"><div class="r" data-a="co" data-v="c:${esc(c.n)}"><span class="nm">${esc(c.n)}${c.u?' 🔒':''}</span><span class="sub">${c.c} oro</span></div><div class="sub">${esc(c.t.join(' · '))}</div>${co==='c:'+c.n?`<div>${c.t.map(t=>`<button class="ch" data-a="go" data-v="t:${esc(t)}">${esc(t)}</button>`).join('')}${c.u?`<div class="sub">Desbloqueo: ${esc(c.u)}</div>`:''}</div>`:''}</div>`).join('');
 }else if(ck==='t'){
  const r=TRF.filter(t=>(!cf||t.k===cf)&&(!q||(t.n+' '+t.d).toLowerCase().includes(q)));
  h+=r.map(t=>{const cs=CHF.filter(c=>c.t.includes(t.n));return`<div class="card"><div class="r" data-a="co" data-v="t:${esc(t.n)}"><span class="nm">${esc(t.n)}</span><span class="sub">${KB[t.k]} · ${esc(t.b)}</span></div><div class="sub">${esc(t.d)}</div>${co==='t:'+t.n?`<div>${cs.map(c=>`<button class="ch" data-a="go" data-v="c:${esc(c.n)}">${esc(c.n)} (${c.c})</button>`).join('')}</div>`:''}</div>`}).join('');
 }else if(ck==='i'){
  h+=IT.map(g=>{const r=g[1].split(';').filter(x=>!q||x.toLowerCase().includes(q));return r.length?`<h3>${g[0]}</h3>${r.map(x=>`<span class="ch">${esc(x)}</span>`).join('')}`:''}).join('')+`<div class="sub" style="margin-top:12px">Las listas marcadas como parciales vienen de fuentes de la PBE y pueden cambiar.</div>`;
 }else{
  const r=AUGL.filter(a=>(!cf||a.t===cf||a.x===cf)&&(!q||a.n.toLowerCase().includes(q)));
  h+=`<div class="sub">${r.length} aumentos</div>`+r.map(a=>`<span class="ch t-${a.t}">${esc(a.n)}</span>`).join('');
 }
 return h;
}
function bubble(){
 const sc=db.cfg.sc,res=db.cfg.res;$('app').style.fontSize=(13*sc)+'px';$('hd').style.display='none';
 const T=[['c','Comps'],['o','Objetos'],['a','Aumentos'],['t','Tips']];
 $('nav').innerHTML=T.map(t=>`<button data-a="bt" data-v="${t[0]}" aria-selected="${t[0]===btab}">${t[1]}</button>`).join('');
 $('bar').innerHTML=`<button data-a="sz" data-v="-0.1">A−</button><button data-a="sz" data-v="0.1">A+</button><button data-a="rs">${res?'Detalle':'Resumen'}</button>${location.hash==='#vista'?'<button data-a="back">← Editor</button>':''}`;
 let h='';
 if(btab==='c')h=db.comps.map(c=>`<div class="card"><div class="r" data-a="xp" data-id="${c.id}">${tierH(c.r)}<span class="nm">${esc(c.t)}</span></div><div class="sub">${esc(c.ch.map(x=>x.n).join(' · '))}</div>${bo===c.id&&!res?`${c.n?`<div class="sub" style="white-space:pre-wrap">${esc(c.n)}</div>`:''}${c.img?`<img class="im" src="${c.img}">`:''}`:''}</div>`).join('');
 else if(btab==='o'){
  const m={};db.comps.forEach(c=>c.ch.forEach(x=>x.it.forEach(i=>{(m[x.n]=m[x.n]||[]).push([i,c.t])})));
  h=Object.keys(m).sort().map(n=>{const seen={};return`<div class="card"><div class="nm">${esc(n)}</div>${m[n].filter(([i,c])=>res?(seen[i.n]?0:seen[i.n]=1):1).map(([i,c])=>chip('k-'+i.k,i.n,res?'':` <small class="sub">${esc(c)}</small>`)).join('')}</div>`}).join('');
 }else if(btab==='a')h=db.comps.filter(c=>c.ag.length).map(c=>`<div class="card"><div class="r">${tierH(c.r)}<span class="nm">${esc(c.t)}</span></div>${c.ag.map(a=>chip('t-'+a.t,a.n)).join('')}</div>`).join('');
 else h=db.tips.map(c=>`<div class="card"><div class="nm">${esc(c.t)}</div>${res?'':`<div class="sub" style="white-space:pre-wrap">${esc(c.n)}</div>${c.img?`<img class="im" src="${c.img}">`:''}`}</div>`).join('');
 $('app').innerHTML=h||'<div class="empty">Sin datos en esta sección.</div>';
}
function form(){
 const d=dr,C=d.k==='c';
 let h=`<h3>${d.old?'Editar':'Nueva'} ${C?'comp':'consejo'}</h3><label>Nombre</label><input data-f="t" maxlength="80" value="${esc(d.t)}">`;
 if(C)h+=`<label>Nivel</label><select data-f="r">${['','S','A','B','C'].map(x=>`<option value="${x}" ${x===d.r?'selected':''}>${x||'Sin nivel'}</option>`).join('')}</select>`;
 h+=`<label>Notas y consejos</label><textarea data-f="n">${esc(d.n)}</textarea><label>Imagen</label>${d.img?`<img class="im" src="${d.img}"><button class="lnk d" data-a="noimg">Quitar imagen</button>`:''}<input type="file" id="fi" accept="image/*">`;
 if(C){
  h+=`<h3>Campeones y objetos</h3>`+d.ch.map((c,i)=>`<div class="cr"><div class="r2"><input data-ci="${i}" list="dl-ch" placeholder="Campeón" value="${esc(c.n)}"><button class="lnk d" data-a="rmc" data-i="${i}">✕</button></div><div>${c.it.map((x,j)=>chip('k-'+x.k,x.n,`<b data-a="rmi" data-i="${i}" data-j="${j}">✕</b>`)).join('')}</div><div class="r2"><select data-ik="${i}">${Object.keys(KN).map(k=>`<option value="${k}" ${k===(c.k0||'c')?'selected':''}>${KN[k]}</option>`).join('')}</select><input id="ii${i}" list="dl-${c.k0||'c'}" placeholder="Objeto"><button class="btn" data-a="addi" data-i="${i}">+</button></div></div>`).join('')+`<button class="btn" data-a="addc">+ Campeón</button>`;
  h+=`<h3>Aumentos</h3><div>${d.ag.map((a,j)=>chip('t-'+a.t,a.n,`<b data-a="rmag" data-j="${j}">✕</b>`)).join('')}</div><div class="r2"><select id="agt">${Object.keys(TN).map(k=>`<option value="${k}">${TN[k]}</option>`).join('')}</select><input id="agn" list="dl-ag" placeholder="Aumento"><button class="btn" data-a="addag">+</button></div>`;
 }
 return h+`<div class="r2" style="margin-top:14px"><button class="btn" data-a="cx">Cancelar</button><button class="btn p" data-a="sv">Guardar</button></div>`;
}
const redo=()=>{$('fm').innerHTML=form()};
function shrink(file,cb){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,700/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',.7))};im.src=r.result};r.readAsDataURL(file)}
document.addEventListener('input',e=>{const t=e.target;if(!dr)return;if(t.dataset.f)dr[t.dataset.f]=t.value;if(t.dataset.ci)dr.ch[+t.dataset.ci].n=t.value});
document.addEventListener('change',e=>{const t=e.target;
 if(t.dataset.ik){const c=dr.ch[+t.dataset.ik];c.k0=t.value;$('ii'+t.dataset.ik).setAttribute('list','dl-'+t.value)}
 else if(t.id==='fi'&&t.files[0])shrink(t.files[0],u=>{dr.img=u;redo()});
 else if(t.id==='rg'){db.cfg.sc=+t.value;save();render()}else if(t.id==='rs'){db.cfg.res=t.checked;save()}});
$('q').oninput=render;addEventListener('hashchange',render);
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,i=+b.dataset.i,j=+b.dataset.j,v=b.dataset.v,id=b.dataset.id;
 const arr=()=>tab==='c'?db.comps:db.tips;
 if(a==='tab'){tab=v;render();scrollTo(0,0)}
 else if(a==='bt'){btab=v;render();scrollTo(0,0)}
 else if(a==='xp'){bo=bo===id?'':id;render()}
 else if(a==='sz'){db.cfg.sc=Math.min(2,Math.max(.6,+(db.cfg.sc+ +v).toFixed(1)));save();render()}
 else if(a==='rs'){db.cfg.res=!db.cfg.res;save();render()}
 else if(a==='ck'){ck=v;cf='';co='';render()}
 else if(a==='cf'){cf=v;render()}
 else if(a==='co'){co=co===v?'':v;render()}
 else if(a==='go'){ck=v[0];cf='';co=v;$('q').value='';render();scrollTo(0,0)}
 else if(a==='bub'){if(window.Android&&Android.bubble)Android.bubble();else alert('La burbuja flotante funciona solo en la app instalada.')}
 else if(a==='prev')location.hash='#vista';
 else if(a==='back')location.hash='';
 else if(a==='nw'){dr={k:tab,id:uid(),t:'',r:'',n:'',img:'',ch:[],ag:[]};$('sh').classList.add('on');redo()}
 else if(a==='ed'){dr=JSON.parse(JSON.stringify(arr().find(x=>x.id===id)));dr.old=1;$('sh').classList.add('on');redo()}
 else if(a==='dup'){const o=JSON.parse(JSON.stringify(arr().find(x=>x.id===id)));o.id=uid();o.t+=' (copia)';db.comps.unshift(o);save();render()}
 else if(a==='del'){if(confirm('¿Borrar?')){const k=tab==='c'?'comps':'tips';db[k]=db[k].filter(x=>x.id!==id);save();render()}}
 else if(a==='cx'){dr=null;$('sh').classList.remove('on')}
 else if(a==='noimg'){dr.img='';redo()}
 else if(a==='addc'){dr.ch.push({n:'',it:[]});redo()}
 else if(a==='rmc'){dr.ch.splice(i,1);redo()}
 else if(a==='addi'){const n=$('ii'+i).value.trim();if(n){dr.ch[i].it.push({k:dr.ch[i].k0||'c',n});redo()}}
 else if(a==='rmi'){dr.ch[i].it.splice(j,1);redo()}
 else if(a==='addag'){const n=$('agn').value.trim();if(n){dr.ag.push({n,t:augT[n]||$('agt').value});redo()}}
 else if(a==='rmag'){dr.ag.splice(j,1);redo()}
 else if(a==='sv'){
  if(!dr.t.trim()){alert('Ponle un nombre.');return}
  const o=JSON.parse(JSON.stringify(dr));delete o.old;o.t=o.t.trim();
  if(o.ch){o.ch=o.ch.filter(c=>c.n.trim());o.ch.forEach(c=>delete c.k0)}
  const k=o.k==='c'?'comps':'tips',old=db[k].slice(),p=db[k].findIndex(x=>x.id===o.id);
  if(p>=0)db[k][p]=o;else db[k].unshift(o);
  if(save()){dr=null;$('sh').classList.remove('on');render()}else db[k]=old;
 }
 else if(a==='exp')$('bt').value=JSON.stringify(db);
 else if(a==='imp'){try{const d=JSON.parse($('bt').value);if(!Array.isArray(d.comps)||!Array.isArray(d.tips))throw 0;
  d.comps.forEach(c=>{c.id=c.id||uid();c.k='c';c.ch=c.ch||[];c.ag=c.ag||[];c.ch.forEach(x=>x.it=x.it||[])});d.tips.forEach(c=>{c.id=c.id||uid();c.k='t'});
  db={comps:d.comps,tips:d.tips,cfg:Object.assign({sc:1,res:false},d.cfg)};save();render()}catch(x){alert('La copia no es válida.')}}
});
addEventListener('storage',e=>{if(e.key===KEY&&e.newValue&&isB()){try{const d=JSON.parse(e.newValue);db.comps=d.comps||[];db.tips=d.tips||[];db.cfg=Object.assign({sc:1,res:false},d.cfg);render()}catch(x){}}});
render();
