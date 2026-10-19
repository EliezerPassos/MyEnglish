const BLOCKS=[
  {k:'b1',t:'1. Escuta ativa',min:[15,10],d:'Um episódio curto no seu nível: 1ª vez com legenda em inglês, 2ª sem.',href:'https://www.bbc.co.uk/learningenglish',hl:'BBC 6 Minute English'},
  {k:'b2',t:'2. Shadowing',min:[10,5],d:'Pegue 1 a 2 min do mesmo áudio e repita junto, imitando o ritmo.',href:'https://learningenglish.voanews.com/',hl:'VOA Learning English'},
  {k:'b3',t:'3. Anki',min:[10,5],d:'Revise seus cartões e crie frases novas com o que ouviu hoje.',href:'https://apps.ankiweb.net/',hl:'Anki'},
  {k:'b4',t:'4. Fala',min:[15,10],d:'Narre seu dia, grave um áudio ou converse com alguém ou com IA de voz.'},
  {k:'b5',t:'5. Curso',min:[10,0],d:'Uma lição do MEC Idiomas.',href:'https://mecidiomas.mec.gov.br/',hl:'MEC Idiomas'}
];
const FOCUS=['Revisão: revise o Anki e regrave o áudio de segunda para comparar.','Rotina e trabalho: descreva sua semana num áudio de 2 minutos.','Pronúncia: faça um shadowing mais longo e grave para comparar.','Conversa: uma conversa no HelloTalk, Tandem ou com IA de voz.','Contar histórias: conte algo que aconteceu ontem, no passado.','Conversa: segunda conversa da semana, sobre um tema novo.','Imersão leve: um episódio de série com legenda em inglês, anotando 10 frases.'];
const PHASES=[
  {n:'Fase 1 · Base',w:[1,4],goal:'Meta: se apresentar e falar da sua rotina por 2 minutos sem travar.'},
  {n:'Fase 2 · Destravar',w:[5,12],goal:'Meta: conversar 10 minutos sobre temas comuns (trabalho, família, planos).'},
  {n:'Fase 3 · Fluência',w:[13,24],goal:'Meta: entender 80% de um vídeo nativo e conversar 20 minutos sem pensar em português.'}
];
const MILES=[
  {k:'m1',t:'Dia 1: gravar o áudio inicial e fazer o teste de nível'},
  {k:'m2',t:'Semana 4: regravar o áudio e checar a meta da fase 1'},
  {k:'m3',t:'Semana 12: primeira conversa de 10 minutos com outra pessoa'},
  {k:'m4',t:'Semana 24: conversa de 20 minutos e vídeo nativo sem legenda'}
];
const TOTAL_DAYS=168;

const pad=n=>String(n).padStart(2,'0');
const key=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const toKey=x=>typeof x==='string'?x:key(x);
const diffDays=(a,b)=>Math.round((parse(toKey(b))-parse(toKey(a)))/864e5);
const todayKey=()=>key(new Date());

let state={start:todayKey(),phase:1,days:{},short:{},miles:{},reminder:null};
let viewKey=todayKey();
let saver=null;

function isShort(k){return !!state.short[k]}
function required(k){return isShort(k)?BLOCKS.slice(0,4):BLOCKS}
function status(k){
  const d=state.days[k]||{};
  const req=required(k);
  const n=req.filter(b=>d[b.k]).length;
  const any=BLOCKS.some(b=>d[b.k]);
  if(n===req.length) return 'c';
  return any?'p':'';
}
function streak(){
  let d=new Date();
  if(status(key(d))!=='c') d=addDays(d,-1);
  let s=0;
  while(status(key(d))==='c'){s++;d=addDays(d,-1)}
  return s;
}

function fmtDate(k){
  return parse(k).toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});
}

let render=function(){
  const tk=todayKey();
  if(diffDays(state.start,tk)<0) state.start=tk;
  const dayNum=Math.min(diffDays(state.start,tk)+1,TOTAL_DAYS);
  document.getElementById('streak').textContent=streak();
  document.getElementById('total').textContent=Object.keys(state.days).filter(k=>status(k)==='c').length;
  document.getElementById('dayn').textContent=dayNum;
  document.getElementById('dayn-l').textContent='dia de '+TOTAL_DAYS;

  // day panel
  const off=diffDays(viewKey,tk);
  document.getElementById('day-title').textContent=off===0?'Hoje':off===1?'Ontem':'Dia anterior';
  document.getElementById('day-date').textContent=fmtDate(viewKey);
  document.getElementById('prev').disabled=diffDays(state.start,viewKey)<=0;
  document.getElementById('next').disabled=off<=0;
  document.getElementById('focus').innerHTML='';
  const fb=document.createElement('b');fb.textContent='Foco do dia';
  document.getElementById('focus').append(fb,document.createTextNode(FOCUS[parse(viewKey).getDay()]));
  const sh=isShort(viewKey);
  document.getElementById('m-full').setAttribute('aria-pressed',String(!sh));
  document.getElementById('m-short').setAttribute('aria-pressed',String(sh));

  const ul=document.getElementById('tasks');ul.innerHTML='';
  const d=state.days[viewKey]||{};
  BLOCKS.forEach((b,i)=>{
    const li=document.createElement('li');
    const opt=sh&&b.k==='b5';
    li.className='task'+(d[b.k]?' done':'')+(opt?' optional':'');
    const lab=document.createElement('label');
    const inp=document.createElement('input');inp.type='checkbox';inp.id='cb-'+b.k;inp.checked=!!d[b.k];
    inp.addEventListener('change',()=>toggle(b.k,inp.checked));
    const box=document.createElement('span');box.className='box';
    const txt=document.createElement('span');txt.style.minWidth='0';
    const t=document.createElement('div');t.className='t';t.textContent=b.t;
    const ds=document.createElement('div');ds.className='d';ds.textContent=b.d+' ';
    if(b.href){const a=document.createElement('a');a.href=b.href;a.target='_blank';a.rel='noopener';a.textContent=b.hl+' ↗';a.addEventListener('click',e=>e.stopPropagation());ds.append(a)}
    txt.append(t,ds);
    const m=document.createElement('span');m.className='min';m.textContent=opt?'opcional':(sh?b.min[1]:b.min[0])+' min';
    lab.append(inp,box,txt,m);li.append(lab);ul.append(li);
  });
  document.getElementById('banner').hidden=status(viewKey)!=='c';

  // phase
  const ph=PHASES[state.phase-1];
  const ps=document.getElementById('phases');ps.innerHTML='';
  PHASES.forEach((p,i)=>{const el=document.createElement('div');el.textContent=p.n;if(i===state.phase-1)el.className='on';ps.append(el)});
  document.getElementById('goal').textContent=ph.goal;
  const week=Math.floor((dayNum-1)/7)+1;
  const span=ph.w[1]-ph.w[0]+1;
  const pct=Math.max(0,Math.min(100,((week-ph.w[0]+1)/span)*100));
  document.getElementById('ph-bar').style.width=pct+'%';
  document.getElementById('ph-note').textContent='Você está na semana '+Math.min(week,24)+' de 24. Sugestão para esta fase: semanas '+ph.w[0]+' a '+ph.w[1]+'. Só avance quando bater a meta.';
  document.getElementById('ph-next').hidden=state.phase>=3;
  document.getElementById('ph-back').hidden=state.phase<=1;

  // heatmap
  const heat=document.getElementById('heat');heat.innerHTML='';
  const s=parse(state.start);
  const monday=addDays(s,-((s.getDay()+6)%7));
  for(let i=0;i<25*7;i++){
    const dd=addDays(monday,i);const k=key(dd);
    const sp=document.createElement('span');
    const before=diffDays(state.start,k)<0, future=diffDays(tk,k)>0;
    sp.className=before?'f':future?'f':status(k);
    if(before) sp.style.visibility='hidden';
    if(k===tk) sp.classList.add('today');
    sp.title=fmtDate(k);
    heat.append(sp);
  }

  // milestones
  const ml=document.getElementById('miles');ml.innerHTML='';
  MILES.forEach(m=>{
    const li=document.createElement('li');const lab=document.createElement('label');
    const inp=document.createElement('input');inp.type='checkbox';inp.id='mi-'+m.k;inp.checked=!!state.miles[m.k];
    inp.addEventListener('change',()=>{state.miles[m.k]=inp.checked;changed()});
    const sp=document.createElement('span');sp.textContent=m.t;
    lab.append(inp,sp);li.append(lab);ml.append(li);
  });
}

function toggle(k,v){
  const d=Object.assign({},state.days[viewKey]);
  if(v) d[k]=true; else delete d[k];
  if(Object.keys(d).length) state.days[viewKey]=d; else delete state.days[viewKey];
  changed();
}
function changed(){render();saver&&saver.queue()}

document.getElementById('prev').onclick=()=>{viewKey=key(addDays(parse(viewKey),-1));render()};
document.getElementById('next').onclick=()=>{viewKey=key(addDays(parse(viewKey),1));render()};
document.getElementById('m-full').onclick=()=>{delete state.short[viewKey];changed()};
document.getElementById('m-short').onclick=()=>{state.short[viewKey]=true;changed()};
document.getElementById('ph-next').onclick=()=>{if(state.phase<3){state.phase++;changed()}};
document.getElementById('ph-back').onclick=()=>{if(state.phase>1){state.phase--;changed()}};

function makeSaver(write){
  let timer=null,busy=false,again=false;
  async function run(){
    if(busy){again=true;return}
    busy=true;
    try{await write(JSON.parse(JSON.stringify(state)));note('Progresso salvo.')}
    catch(e){note('Não consegui salvar agora. Tente marcar de novo em instantes.')}
    busy=false;
    if(again){again=false;run()}
  }
  return {queue(){clearTimeout(timer);timer=setTimeout(run,700)}};
}
function note(t){document.getElementById('save-note').textContent=t}
function merge(saved){
  if(saved&&typeof saved==='object'){
    state=Object.assign({start:todayKey(),phase:1,days:{},short:{},miles:{},reminder:null},saved);
  }
}

const STORE_KEY='inglesapp-progresso';
function load(){
  try{const raw=localStorage.getItem(STORE_KEY);if(raw)merge(JSON.parse(raw))}catch(e){}
}
saver=makeSaver(async s=>{
  localStorage.setItem(STORE_KEY,JSON.stringify(s));
  await syncForWorker();
});

// O service worker não lê o localStorage: guardamos um resumo no Cache para o lembrete.
async function syncForWorker(){
  if(!('caches' in window)) return;
  try{
    const c=await caches.open('inglesapp-estado');
    const summary={doneToday:status(todayKey())==='c',today:todayKey(),reminder:state.reminder||null};
    await c.put('./estado.json',new Response(JSON.stringify(summary),{headers:{'Content-Type':'application/json'}}));
  }catch(e){}
}

// Lembrete diário
const remBtn=document.getElementById('rem-on');
const remTime=document.getElementById('rem-time');
const remNote=document.getElementById('rem-note');
function renderReminder(){
  if(state.reminder){remTime.value=state.reminder;}
  const perm=('Notification' in window)?Notification.permission:'unsupported';
  if(perm==='unsupported'){remNote.textContent='Este navegador não mostra notificações. Use um alarme do celular no horário escolhido.';remBtn.disabled=true;return}
  if(state.reminder&&perm==='granted'){
    remBtn.textContent='Salvar horário';
    remNote.textContent='Lembrete ativo às '+state.reminder+'. Ele só aparece se o dia ainda não estiver concluído.';
  }else if(perm==='denied'){
    remNote.textContent='As notificações estão bloqueadas. Libere nas configurações do navegador para este site.';
  }else{
    remNote.textContent='Instale o app na tela inicial antes de ativar, para o lembrete funcionar melhor.';
  }
}
remBtn.onclick=async()=>{
  if(!('Notification' in window)) return;
  const perm=await Notification.requestPermission();
  if(perm!=='granted'){renderReminder();return}
  state.reminder=remTime.value||'20:00';
  changed();
  const reg=await navigator.serviceWorker?.ready;
  let periodic=false;
  try{
    if(reg&&'periodicSync' in reg){
      await reg.periodicSync.register('lembrete-ingles',{minInterval:60*60*1000});
      periodic=true;
    }
  }catch(e){}
  renderReminder();
  if(!periodic) remNote.textContent+=' Neste aparelho o lembrete aparece quando o app é aberto; para um aviso no horário exato, use também um alarme do celular.';
  reg?.showNotification('inglêsAPP',{body:'Lembrete ativado para as '+state.reminder+'.',icon:'icons/icon-192.png',badge:'icons/icon-192.png'});
};

// Ao abrir: se já passou do horário e o dia não está feito, avisa dentro do app
function inAppNudge(){
  const el=document.getElementById('nudge');
  if(!state.reminder){el.hidden=true;return}
  const [h,m]=state.reminder.split(':').map(Number);
  const now=new Date();
  el.hidden=!(now.getHours()*60+now.getMinutes()>=h*60+m&&status(todayKey())!=='c');
}

// Backup
document.getElementById('bk-export').onclick=async()=>{
  const txt=JSON.stringify(state);
  try{await navigator.clipboard.writeText(txt);note('Backup copiado. Cole num lugar seguro (e-mail, notas).')}
  catch(e){document.getElementById('bk-text').value=txt;document.getElementById('bk-text').select();note('Copie o texto do backup na caixa abaixo.')}
};
document.getElementById('bk-import').onclick=()=>{
  const v=document.getElementById('bk-text').value.trim();
  if(!v){note('Cole o texto do backup na caixa antes de restaurar.');return}
  try{merge(JSON.parse(v));changed();note('Backup restaurado.')}
  catch(e){note('Esse texto não é um backup válido do inglêsAPP.')}
};

const _render=render;
render=function(){_render();renderReminder();inAppNudge()};

load();
render();
syncForWorker();
note('Seu progresso fica salvo neste aparelho.');
if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js').catch(()=>{})}
