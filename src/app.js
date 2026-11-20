import { createClient } from '@neon/neon-js';
// Endereço público do banco no Neon (sem credenciais). O acesso aos dados é liberado
// só depois do login e limitado por usuário pelas políticas RLS (ver sql/schema.sql).
const NEON_URL = import.meta.env.VITE_NEON_DATABASE_URL || 'https://ep-curly-silence-b6whyv3k.c-2.sa-east-1.aws.neon.tech/neondb';
let neon = null;
try { neon = createClient(NEON_URL); } catch (e) { console.error(e); }

/* ---------- utilidades ---------- */
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const BRL=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const money=v=>BRL.format(Number(v)||0).replace(/[  ]/g,' ');
const pct=v=>v==null||!isFinite(v)?'—':v.toLocaleString('pt-BR',{maximumFractionDigits:1})+'%';
const fdate=iso=>iso?iso.split('-').reverse().join('/'):'—';
const isoOf=n=>new Date(n*864e5).toISOString().slice(0,10);
const today=()=>{const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
const dnum=iso=>Date.UTC(+iso.slice(0,4),+iso.slice(5,7)-1,+iso.slice(8,10))/864e5;
const ddiff=(a,b)=>dnum(a)-dnum(b);
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const sum=(a,f=x=>x)=>a.reduce((s,x)=>s+(Number(f(x))||0),0);
const days=n=>n==null?'—':n+(Math.abs(n)===1?' dia':' dias');
const fts=ts=>{const d=new Date(ts);return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()+' '+pad(d.getHours())+':'+pad(d.getMinutes())};
const I={
 bank:'<path d="M3 9l9-5 9 5M5 9v9M19 9v9M9 9v9M15 9v9M3 20h18"/>',
 upload:'<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>',
 split:'<path d="M6 3v6a6 6 0 0 0 6 6 6 6 0 0 1 6 6M18 3v6"/>',
 link:'<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>',
 bolt:'<path d="M13 3 5 13h6l-1 8 8-10h-6z"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
 home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 build:'<path d="M4 21V7l8-4 8 4v14"/><path d="M9 21v-5h6v5M9 10h.01M15 10h.01M9 13h.01M15 13h.01"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 coin:'<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.200 1.700 3 2 3 .8 3 2-1.300 2-3 2c-1.400 0-2.500-.5-3-1.500M12 6.500v11"/>',
 cal:'<rect x="3.500" y="5" width="17" height="15.500" rx="2.500"/><path d="M3.500 10h17M8 3v4M16 3v4"/>',
 doc:'<path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2.500v3M12 18.500v3M2.500 12h3M18.500 12h3M5.300 5.300l2.100 2.100M16.600 16.600l2.100 2.100M5.300 18.700l2.100-2.100M16.600 7.400l2.100-2.100"/>',
 edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.500 6.500 4 4"/>',
 trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
 undo:'<path d="M8 6 3 11l5 5"/><path d="M3 11h11a5 5 0 0 1 0 10h-3"/>',
 clip:'<path d="m20 11-8.500 8.500a5 5 0 0 1-7-7L13 4a3.500 3.500 0 0 1 5 5l-8.500 8.500a2 2 0 0 1-3-3L14 7"/>',
 x:'<path d="M6 6l12 12M18 6 6 18"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
 phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
 more:'<circle cx="5" cy="12" r="1.200"/><circle cx="12" cy="12" r="1.200"/><circle cx="19" cy="12" r="1.200"/>',
 down:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>'
};
const ic=n=>`<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${I[n].replace(/(\d)00\b/g,'$1')}</svg>`;

/* ---------- domínio ---------- */
const STATUS={orcamento:'Orçamento',aguardando:'Aguardando aprovação',aprovada:'Aprovada',andamento:'Em andamento',pausada:'Pausada',concluida:'Concluída',cancelada:'Cancelada'};
const CONTRACTED=['aprovada','andamento','pausada','concluida'];
const CATS=['Materiais elétricos','Postes e estruturas','Transformadores','Cabos e condutores','Equipamentos','Mão de obra','Terceirizados','Fretes e transportes','Combustível','Alimentação','Hospedagem','Aluguel de máquinas','Munck e caminhão','Ferramentas','Documentação e projetos','Outros'];
const GROUP={'Materiais elétricos':'Materiais','Postes e estruturas':'Materiais','Transformadores':'Materiais','Cabos e condutores':'Materiais','Mão de obra':'Mão de obra','Equipamentos':'Equipamentos','Aluguel de máquinas':'Equipamentos','Munck e caminhão':'Equipamentos','Ferramentas':'Equipamentos','Fretes e transportes':'Fretes','Terceirizados':'Terceirizados'};
const GROUPS=['Materiais','Mão de obra','Equipamentos','Fretes','Terceirizados','Outras despesas'];
const PAY=['Pix','Boleto','Transferência','Cartão de crédito','Cartão de débito','Dinheiro','Cheque','Faturado'];
const UFS='AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
const PCOL=[
 {k:'laranja',n:'Laranja',bg:'#FEF3EE',bd:'#F8D9CB',fg:'#D9480F'},
 {k:'azul',n:'Azul',bg:'#EFF4FE',bd:'#D6E2FB',fg:'#2F6FDE'},
 {k:'verde',n:'Verde',bg:'#EEF8F2',bd:'#CFEBDB',fg:'#1B9A5E'},
 {k:'ambar',n:'Âmbar',bg:'#FDF7E8',bd:'#F3E3B8',fg:'#B7791F'},
 {k:'petroleo',n:'Petróleo',bg:'#EDF6F7',bd:'#CDE6E9',fg:'#1F8A96'},
 {k:'grafite',n:'Grafite',bg:'#F2F3F5',bd:'#DEE1E6',fg:'#5A5F68'}];
const hashStr=t=>{let h=0;for(const ch of String(t||''))h=(h*31+ch.charCodeAt(0))>>>0;return h};
const pcol=p=>PCOL.find(c=>c.k===(p&&p.color))||PCOL[hashStr(p&&p.id)%PCOL.length];
const dot=p=>`<i class="pdot" style="background:${pcol(p).fg}"></i>`;
const CHART_COLORS=['#F15623','#2F6FDE','#1B9A5E','#D49A1F','#1F8A96','#6B7280','#E8845E','#6A9BEF'];
const DATA_URL=(()=>{try{const u=new URL(NEON_URL);const l=u.hostname.split('.');return `${u.protocol}//${[l[0],'apirest',...l.slice(1)].join('.')}${u.pathname.replace(/\/+$/,'')}/rest/v1`}catch(e){return ''}})();
const shareUrl=t=>`${location.origin}/acompanhar/${t}`;
function newToken(){const a='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789',b=new Uint8Array(32);crypto.getRandomValues(b);return [...b].map(x=>a[x%a.length]).join('')}
let PUB=null,pubErr='';
const COLS=['clients','projects','expenses','receipts','events','documents','audit'];
const blank=()=>({clients:[],projects:[],expenses:[],receipts:[],events:[],documents:[],audit:[],accounts:[],transactions:[],rules:[],settings:{company:'',categories:[]}});

let db=null,user=null,assets=null,downloads=true,myId=null,myName='';
let me=null,authView='login',resetToken='',lastLoad=0;
let canWrite=true,canAdmin=true;
const LIVE=blank();let DEMO=null;let D=LIVE;
let phase='loading'; // loading | db | local
let slow=false, tab='resumo', lastObra=null;
const F={q:'',project:'',cat:'',supplier:'',from:'',to:''};
const PF={q:'',status:'',kind:''};
let charts=[],FOPEN=false;

const allCats=()=>CATS.concat((D.settings.categories||[]).filter(c=>!CATS.includes(c)));
const proj=id=>D.projects.find(p=>p.id===id);
const cli=id=>D.clients.find(c=>c.id===id);
const isDemo=()=>D===DEMO;
const memory=()=>isDemo()||!me;
const clean=o=>JSON.parse(JSON.stringify(o));

const TABLE={clients:'clients',projects:'projects',expenses:'expenses',receipts:'receipts',events:'project_events',documents:'project_documents',audit:'audit_log',accounts:'bank_accounts',transactions:'bank_transactions',rules:'finance_rules'};
function localPut(col,obj){const a=D[col],i=a.findIndex(x=>x.id===obj.id);if(i>=0)a[i]=obj;else a.push(obj);schedule()}
async function put(col,obj){
  if(memory()){localPut(col,obj);return}
  const o=clean(obj),row={id:o.id,data:o};
  if(col==='projects'){row.client_id=o.client_id||null;row.share_token=o.share_token||null}
  else if(col==='transactions'){row.account_id=o.account_id;row.fitid=o.fitid||null}
  else if(col==='accounts'||col==='rules'){}
  else if(!['clients','accounts','rules','transactions'].includes(col))row.project_id=o.project_id||null;
  const {error}=await neon.from(TABLE[col]).upsert(row);
  if(error)throw error;
  localPut(col,o);
}
async function putMany(col,objs){
  if(!objs.length)return;
  if(memory()){objs.forEach(o=>localPut(col,o));return}
  for(let i=0;i<objs.length;i+=200){
    const part=objs.slice(i,i+200).map(o=>{const c=clean(o),row={id:c.id,data:c};if(col==='transactions'){row.account_id=c.account_id;row.fitid=c.fitid||null}return row});
    const {error}=await neon.from(TABLE[col]).upsert(part,{onConflict:'id',ignoreDuplicates:true});
    if(error)throw error;
    objs.slice(i,i+200).forEach(o=>localPut(col,clean(o)));
  }
}
async function del(col,id){
  if(!memory()){const {error}=await neon.from(TABLE[col]).delete().eq('id',id);if(error)throw error}
  D[col]=D[col].filter(x=>x.id!==id);schedule();
}
async function putSettings(s){
  if(memory()){D.settings=s;schedule();return}
  const {error}=await neon.from('settings').upsert({user_id:me.id,data:clean(s)},{onConflict:'user_id'});
  if(error)throw error;
  D.settings=s;schedule();
}
async function loadAll(){
  const cols=Object.keys(TABLE);
  const rs=await Promise.all(cols.map(c=>neon.from(TABLE[c]).select('id,data')).concat([neon.from('settings').select('data')]));
  for(const r of rs)if(r.error)throw r.error;
  cols.forEach((c,i)=>{LIVE[c]=(rs[i].data||[]).map(x=>({...x.data,id:x.id}))});
  const st=(rs[cols.length].data||[])[0];
  LIVE.settings={company:'',categories:[],...(st?st.data:{})};
  lastLoad=Date.now();
}
function log(entity,action,pid,text,eid){
  return put('audit',{id:uid('a'),ts:Date.now(),by:myId||null,entity,action,project_id:pid||null,entity_id:eid||null,text});
}
function errText(e){
  const m=String((e&&e.message)||'');
  if(/JWT|token|401|permission|row-level/i.test(m))return 'Sua sessão expirou ou não tem permissão. Saia e entre de novo.';
  if(/foreign key|violates/i.test(m))return 'Não foi possível salvar: o registro depende de uma obra ou cliente que não existe mais.';
  return 'Não foi possível salvar agora. Verifique a conexão e tente de novo.';
}

/* ---------- cálculos ---------- */
function calc(p){
  const t=today();
  const exps=D.expenses.filter(e=>e.project_id===p.id&&!e.deleted);
  const active=exps.filter(e=>e.status!=='estornada');
  const recs=D.receipts.filter(r=>r.project_id===p.id&&!r.deleted);
  const cost=sum(active,e=>e.amount), received=sum(recs,r=>r.amount);
  const canceled=p.status==='cancelada', done=p.status==='concluida';
  const counted=CONTRACTED.includes(p.status)||canceled;
  // contrato cancelado: vale apenas o que foi efetivamente recebido
  const contracted=canceled?received:(Number(p.contract_value)||0);
  const profit=contracted-cost;
  const margin=contracted>0?profit/contracted*100:null;
  const receivable=Math.max(0,contracted-received);
  const planned=Number(p.planned_cost)||0;
  const costDev=planned>0?cost-planned:null;
  const overCost=planned>0&&cost>planned;
  const pauses=D.events.filter(e=>e.project_id===p.id&&e.type==='pause');
  const notes=D.events.filter(e=>e.project_id===p.id&&e.type!=='pause');
  const plannedDur=p.planned_start&&p.planned_end?ddiff(p.planned_end,p.planned_start)+1:null;
  const endRef=p.real_end||t;
  const realDur=p.real_start?Math.max(0,ddiff(endRef,p.real_start)+1):null;
  const pauseDays=sum(pauses,z=>{const e=z.end||endRef;return Math.max(0,ddiff(e<endRef?e:endRef,z.start))});
  const execDays=realDur==null?null:Math.max(0,realDur-pauseDays);
  const open=!done&&!canceled;
  let delay=0;
  if(p.planned_end){if(p.real_end)delay=Math.max(0,ddiff(p.real_end,p.planned_end));else if(open&&CONTRACTED.includes(p.status))delay=Math.max(0,ddiff(t,p.planned_end))}
  const late=open&&delay>0;
  const remaining=open&&p.planned_end?Math.max(0,ddiff(p.planned_end,t)):null;
  const timeDev=realDur!=null&&plannedDur!=null&&p.real_end?realDur-plannedDur:null;
  const progress=done?100:Math.min(100,Math.max(0,Number(p.progress)||0));
  const byCat={},byGroup=Object.fromEntries(GROUPS.map(g=>[g,0]));
  for(const e of active){byCat[e.category]=(byCat[e.category]||0)+(+e.amount||0);byGroup[GROUP[e.category]||'Outras despesas']+=(+e.amount||0)}
  return {exps,active,recs,cost,received,contracted,counted,canceled,done,open,profit,margin,receivable,planned,costDev,overCost,pauses,notes,plannedDur,realDur,pauseDays,execDays,delay,late,remaining,timeDev,progress,byCat,byGroup,
    pctReceived:contracted>0?received/contracted*100:null};
}
function totals(){
  const ps=D.projects.map(p=>({p,c:calc(p)}));
  const k=ps.filter(x=>x.c.counted);
  const contracted=sum(k,x=>x.c.contracted), costK=sum(k,x=>x.c.cost);
  const expenses=sum(ps,x=>x.c.cost), received=sum(ps,x=>x.c.received);
  const margins=k.filter(x=>x.c.margin!=null).map(x=>x.c.margin);
  return {ps,k,contracted,expenses,received,receivable:sum(k,x=>x.c.receivable),profit:contracted-costK,
    avgMargin:margins.length?sum(margins)/margins.length:null,
    n:ps.length,running:ps.filter(x=>x.p.status==='andamento').length,done:ps.filter(x=>x.c.done).length,late:ps.filter(x=>x.c.late).length};
}
const KIND={obra:{n:'Obra',pl:'Obras',pre:'OBR',novo:'Nova obra'},servico:{n:'Serviço',pl:'Serviços',pre:'SRV',novo:'Novo serviço'},venda:{n:'Venda',pl:'Vendas',pre:'VND',novo:'Nova venda'}};
const kindOf=p=>(p&&KIND[p.kind])?p.kind:'obra';
function nextCode(kind='obra'){
  const y=new Date().getFullYear(),pre=KIND[kind].pre,re=new RegExp('^'+pre+'-(\\d{4})-(\\d+)$');
  const n=Math.max(0,...D.projects.map(p=>{const m=re.exec(p.code||'');return m&&+m[1]===y?+m[2]:0}))+1;
  return `${pre}-${y}-${String(n).padStart(3,'0')}`;
}

/* ---------- dados de demonstração (só em memória) ---------- */
function demoData(){
  const d=blank(),t=dnum(today()),at=n=>isoOf(t+n);
  d.settings.company='Empresa de demonstração';
  d.clients=[['c1','Loteadora Exemplo Ltda. (fictício)','00.000.000/0001-00'],['c2','Frigorífico Modelo S.A. (fictício)','11.111.111/0001-11'],['c3','Fazenda Amostra (fictício)','000.000.000-00']].map(([id,name,doc])=>({id,name,doc,phone:'',whatsapp:'',email:''}));
  const P=(id,n,code,name,client_id,status,cv,pc,ps,pe,rs,re,progress,city)=>d.projects.push({id,code,name,client_id,status,contract_value:cv,planned_cost:pc,planned_start:at(ps),planned_end:at(pe),real_start:rs==null?'':at(rs),real_end:re==null?'':at(re),progress,city,state:'TO',address:'Endereço de exemplo',description:'Dados fictícios para demonstração.',responsible:'Responsável de exemplo',contract_date:at(ps-10),created_at:Date.now()-n});
  const y=new Date().getFullYear();
  P('pd1',4,`OBR-${y}-001`,'Rede de distribuição 13,8 kV, Loteamento Jardim','c1','andamento',480000,350000,-60,40,-58,null,55,'Araguaína');
  P('pd2',3,`OBR-${y}-002`,'Subestação abrigada 300 kVA','c2','andamento',265000,190000,-95,-10,-90,null,80,'Gurupi');
  P('pd3',2,`OBR-${y}-003`,'Instalações elétricas do galpão logístico','c1','concluida',142000,98000,-200,-120,-198,-115,100,'Palmas');
  P('pd4',1,`OBR-${y}-004`,'Extensão de rede rural 34,5 kV','c3','orcamento',310000,240000,20,110,null,null,0,'Colinas');
  const E=[['pd1',-55,'Postes e estruturas','Postes DT 11/300 e 11/600',68400,'Pré-moldados Norte'],['pd1',-50,'Cabos e condutores','Cabo CA 1/0 AWG, 4.200 m',52300,'Condutores Brasil'],['pd1',-44,'Materiais elétricos','Isoladores, chaves e ferragens',31850,'Elétrica Central'],['pd1',-40,'Mão de obra','Equipe de montagem, 1ª quinzena',22400,''],['pd1',-30,'Munck e caminhão','Locação de munck, 12 diárias',14400,'Locadora TO'],['pd1',-26,'Mão de obra','Equipe de montagem, 2ª quinzena',22400,''],['pd1',-20,'Transformadores','Transformadores 75 kVA, 3 un.',41700,'Trafos Sul'],['pd1',-12,'Combustível','Abastecimento da frota',3860,'Posto Avenida'],['pd1',-6,'Alimentação','Refeições da equipe',2940,'Restaurante da Praça'],
   ['pd2',-88,'Documentação e projetos','Projeto e ART',9800,''],['pd2',-80,'Transformadores','Transformador 300 kVA a seco',58900,'Trafos Sul'],['pd2',-74,'Equipamentos','Cubículo de média tensão',64200,'Painéis Industriais'],['pd2',-66,'Cabos e condutores','Cabos de média e baixa tensão',27350,'Condutores Brasil'],['pd2',-60,'Terceirizados','Obra civil da cabine',31500,'Construtora Apoio'],['pd2',-34,'Mão de obra','Montagem eletromecânica',19800,''],['pd2',-22,'Hospedagem','Hospedagem da equipe',4650,'Hotel Central'],['pd2',-15,'Fretes e transportes','Frete do transformador',3900,'Transportes Rápidos'],
   ['pd3',-196,'Materiais elétricos','Eletrocalhas, quadros e disjuntores',38200,'Elétrica Central'],['pd3',-180,'Cabos e condutores','Cabos de baixa tensão',21400,'Condutores Brasil'],['pd3',-160,'Mão de obra','Equipe de instalação',28600,''],['pd3',-140,'Ferramentas','Ferramentas e EPIs',4300,'Casa do Eletricista'],['pd3',-125,'Aluguel de máquinas','Plataforma elevatória',8900,'Locadora TO']];
  d.expenses=E.map(([project_id,o,category,description,amount,supplier],i)=>({id:'ed'+i,project_id,date:at(o),category,description,amount,supplier,payment:i%2?'Boleto':'Pix',responsible:'Responsável de exemplo',notes:'',status:'ativa',attachments:[],created_at:Date.now()+o*864e5}));
  d.receipts=[['pd1',-58,144000,'Entrada de 30%'],['pd1',-20,120000,'2ª medição'],['pd2',-90,79500,'Entrada de 30%'],['pd2',-40,92750,'Medição intermediária'],['pd3',-198,42600,'Entrada'],['pd3',-150,56800,'Medição'],['pd3',-110,42600,'Saldo final']].map(([project_id,o,amount,description],i)=>({id:'rd'+i,project_id,date:at(o),amount,description,method:'Pix',created_at:Date.now()+o*864e5}));
  d.events=[{id:'vd1',project_id:'pd2',type:'pause',start:at(-52),end:at(-38),reason:'Atraso na entrega do cubículo'},{id:'vd2',project_id:'pd1',type:'note',date:at(-45),text:'Locação dos postes concluída'},{id:'vd3',project_id:'pd2',type:'note',date:at(-30),text:'Vistoria da concessionária agendada'}];
  d.audit=d.expenses.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6).map((e,i)=>({id:'ad'+i,ts:Date.now()-i*36e5*7,by:null,entity:'despesa',action:'criou',project_id:e.project_id,text:`Despesa lançada: ${e.description} (${money(e.amount)})`}));
  const y2=new Date().getFullYear();
  d.projects.push({id:'pd5',kind:'servico',code:`SRV-${y2}-001`,name:'Manutenção de quadro elétrico',client_id:'c2',status:'andamento',contract_value:2400,planned_cost:700,real_start:at(-6),progress:0,color:'azul',created_at:Date.now()-5},{id:'pd6',kind:'venda',code:`VND-${y2}-001`,name:'Kit padrão de entrada',client_id:'c3',status:'aprovada',contract_value:5300,planned_cost:2850,real_start:at(-9),progress:0,color:'petroleo',created_at:Date.now()-6});
  d.expenses.push({id:'edx1',project_id:'pd1',date:at(-2),category:'Cabos e condutores',description:'Cabo CA 1/0 AWG, complemento',amount:5000,supplier:'Condutores Brasil',payment:'Pix',responsible:'Responsável de exemplo',status:'ativa',attachments:[],created_at:Date.now()-1});
  d.receipts.push({id:'rdx1',project_id:'pd5',date:at(-3),amount:2400,description:'Serviço concluído',method:'Pix',created_at:Date.now()},{id:'rdx2',project_id:'pd6',date:at(-8),amount:5300,description:'Venda à vista',method:'Pix',created_at:Date.now()});
  d.accounts=[{id:'accd1',key:'demo',bank:'001',acctid:'12345-6',name:'Conta PJ principal',balance:61904.12,balance_date:at(-1),last_import:Date.now()}];
  d.rules=[{id:'rd1',match:'ENERGISA',kind:'empresa',center:'Administrativo',category:'Energia e água'},{id:'rd2',match:'ALUGUEL GALPAO',kind:'empresa',center:'Administrativo',category:'Aluguel'},{id:'rd3',match:'FOLHA PAGAMENTO',kind:'empresa',center:'Pessoal',category:'Salários e encargos'}];
  const T=[[-1,'PIX ENVIADO CONDUTORES BRASIL LTDA',-5000],[-1,'PAG BOLETO ENERGISA TO',-1284.37],[-2,'PIX RECEBIDO LOTEADORA EXEMPLO LTDA',38500],[-2,'POSTO AVENIDA COMBUSTIVEIS',-412.9],[-3,'TED ALUGUEL GALPAO',-3200],[-5,'PIX ENVIADO JOAO S PEREIRA',-1800],[-5,'COMPRA CARTAO CASA DO ELETRICISTA',-689.4],[-6,'FOLHA PAGAMENTO NOV',-9850],[-7,'TRANSF ENTRE CONTAS MESMA TITULARIDADE',-2000],[-9,'TARIFA PACOTE SERVICOS',-89.9]];
  d.transactions=T.map(([o,desc,amount],i)=>({id:'txd'+i,account_id:'accd1',fitid:'d'+i,date:at(o),desc,amount,status:'pendente',imported_at:Date.now()}));
  d.transactions.push({id:'txdc1',account_id:'accd1',fitid:'dc1',date:at(-12),desc:'PAG BOLETO CONTABILIDADE EXEMPLO',amount:-1100,status:'classificado',allocations:[{kind:'empresa',center:'Administrativo',category:'Contabilidade',amount:1100}],classified_at:Date.now()-1e6},{id:'txdc2',account_id:'accd1',fitid:'dc2',date:at(-11),desc:'POSTO AVENIDA COMBUSTIVEIS',amount:-380,status:'classificado',allocations:[{kind:'empresa',center:'Frota',category:'Combustível',amount:380}],classified_at:Date.now()-9e5});
  return d;
}

/* ---------- inicialização ---------- */
async function init(){
  const pm=location.pathname.match(/^\/acompanhar\/([A-Za-z0-9]{24,64})\/?$/);
  if(pm){phase='public';render();loadPublic(pm[1]);return}
  render();
  if(!neon){phase='local';render();return}
  const q=new URLSearchParams(location.search);
  if(q.get('token')){resetToken=q.get('token');authView='nova-senha'}
  try{
    const r=await Promise.race([neon.auth.getSession(),new Promise((_,j)=>setTimeout(()=>j(new Error('timeout')),12000))]);
    const u=r&&r.data&&(r.data.user||(r.data.session&&r.data.session.user));
    if(u&&!resetToken){await enter(u);return}
  }catch(e){console.warn(e)}
  phase='auth';render();
}
async function enter(u){
  me=u;myId=u.id;myName=u.name||'';phase='loading';render();
  const timer=setTimeout(()=>{slow=true;render()},10000);
  try{await loadAll();phase='db'}
  catch(e){console.error(e);me=null;phase='auth';authView='login';toast('Entramos na conta, mas não foi possível carregar os dados. Tente de novo.')}
  clearTimeout(timer);slow=false;render();
}
const AUTH_ERR=[
 [/INVALID_EMAIL_OR_PASSWORD|invalid (email or )?password|invalid credentials|user not found/i,'E-mail ou senha incorretos.'],
 [/USER_ALREADY_EXISTS|already exists|already registered/i,'Já existe uma conta com este e-mail. Entre ou recupere a senha.'],
 [/PASSWORD_TOO_LONG|too long/i,'A senha é longa demais. Use até 128 caracteres.'],
 [/PASSWORD_TOO_SHORT|password.*(short|least)/i,'A senha precisa ter pelo menos 8 caracteres.'],
 [/security requirements|compromised|pwned|breach|weak/i,'Esta senha é fraca ou já apareceu em vazamentos. Use outra, com letras, números e símbolos.'],
 [/INVALID_EMAIL|invalid email/i,'Informe um e-mail válido.'],
 [/EMAIL_NOT_VERIFIED|not verified/i,'Confirme seu e-mail pelo código ou link que enviamos antes de entrar.'],
 [/INVALID_TOKEN|token/i,'O link de recuperação expirou. Peça um novo.'],
 [/too many|rate limit|429/i,'Muitas tentativas seguidas. Aguarde um minuto e tente de novo.'],
 [/failed to fetch|network|load failed/i,'Sem conexão com o servidor. Verifique a internet e tente de novo.']];
const authErr=e=>{const m=[e&&e.code,e&&e.message,e&&e.error&&e.error.message,e&&e.statusText,String(e||'')].filter(Boolean).join(' ');for(const [r,t] of AUTH_ERR)if(r.test(m))return t;return 'Não foi possível concluir agora. Tente de novo em instantes.'};
async function sessionUser(){try{const r=await neon.auth.getSession();return r&&r.data&&(r.data.user||(r.data.session&&r.data.session.user))||null}catch(e){return null}}
async function authCall(fn){let r;try{r=await fn()}catch(e){r={error:e}}if(r&&r.error)throw r.error;return r||{}}

/* ---------- render ---------- */
let raf=0;
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;render()})}
function route(){const h=(location.hash||'').slice(1)||'dashboard';return h.startsWith('obra-')?{page:'obra',id:h.slice(5)}:h.startsWith('clientes-')?{page:'clientedet',id:h.slice(9)}:h.startsWith('cliente-')?{page:'cliente',id:h.slice(8)}:{page:h}}
const NAV=[['dashboard','Dashboard','home'],['obras','Minhas Obras','build'],['clientes','Clientes','user'],['@new-project','Nova Obra','plus'],['despesas','Lançar Despesa','coin'],['financeiro','Financeiro','bank'],['cronograma','Cronograma','cal'],['relatorios','Relatórios','doc'],['configuracoes','Configurações','gear']];
function stackLabels(root){root.querySelectorAll('table.stack').forEach(t=>{const hs=[...t.querySelectorAll('thead th')].map(x=>x.textContent);t.querySelectorAll('tbody tr').forEach(r=>{let i=0;[...r.cells].forEach(c=>{c.dataset.l=c.colSpan>1?'':hs[i]||'';i+=c.colSpan})})});}
function render(){
  if(phase==='public'){document.body.classList.add('cview','pub');document.body.classList.remove('authp');$('#auth').hidden=true;$('#view').innerHTML=vPublic();return}
  const r=route();
  const AU=$('#auth');
  if(phase==='auth'){document.body.classList.add('authp');if(AU.dataset.v!==authView){AU.dataset.v=authView;AU.innerHTML=vAuth()}AU.hidden=false;return}
  AU.hidden=true;AU.dataset.v='';document.body.classList.remove('authp');
  document.body.classList.toggle('ro',!canWrite&&!isDemo());document.body.classList.toggle('cview',r.page==='cliente');
  const on=k=>(r.page===k||(k==='obras'&&r.page==='obra')||(k==='clientes'&&r.page==='clientedet'))?' class="on"':'';
  $('#side').innerHTML=`<div class="brand"><i></i>OBRA&nbsp;<span>CONTROL</span></div>
   <button class="btn primary big" data-act="new-expense" data-w>${ic('plus')} NOVA DESPESA</button>
   <nav class="nav">${NAV.map(([k,l,i])=>k[0]==='@'?`<button data-act="${k.slice(1)}" data-w>${ic(i)}${l}</button>`:`<a href="#${k}"${on(k)}>${ic(i)}${l}</a>`).join('')}</nav>
   ${standalone()?'':`<button class="btn" data-act="install" style="margin:0 6px">${ic('down')} Instalar aplicativo</button>`}<div class="foot">${esc(D.settings.company||'')}${isDemo()?'<br>Modo demonstração':''}${me?`<div class="who">${esc(me.email||'')}</div><button class="btn ghost" style="padding:4px 0;min-height:0" data-act="logout">Sair da conta</button>`:''}</div>`;
  $('#bnav').innerHTML=`<a href="#dashboard"${on('dashboard')}>${ic('home')}Início</a><a href="#obras"${on('obras')}>${ic('build')}Obras</a><button class="plus" data-act="new-expense" data-w aria-label="Nova despesa">${ic('plus')}</button><a href="#despesas"${on('despesas')}>${ic('coin')}Despesas</a><button data-act="more">${ic('more')}Mais</button>`;
  $('#topinfo').textContent=isDemo()?'Demonstração':(D.settings.company||'');
  charts.forEach(c=>c.destroy());charts=[];
  let h='';
  if(isDemo())h+=`<div class="banner demo"><span><b>Modo demonstração.</b> Dados fictícios<span class="lg">, e nada do que você fizer aqui é salvo</span>.</span><button class="btn" data-act="demo-off">Sair<span class="lg"> da demonstração</span></button></div>`;
  else if(phase==='local')h+=`<div class="banner warn"><span><b>Sem conexão com o servidor.</b> O que você lançar agora não será salvo. Recarregue a página para tentar de novo.</span></div>`;
  else if(!canWrite)h+=`<div class="banner warn"><span>Seu acesso é somente leitura. Peça ao dono do aplicativo permissão de colaborador para lançar dados.</span></div>`;
  if(phase==='loading'){h+=`<div class="card empty"><b>Carregando seus dados…</b>${slow?'<span>Ainda não foi possível alcançar o armazenamento. Vou continuar tentando.</span>':''}</div>`}
  else{
    const V={clientes:vClientes,clientedet:()=>vClienteDet(r.id),financeiro:vFin,dashboard:vDash,obras:vObras,despesas:vDespesas,cronograma:vCrono,relatorios:vRel,configuracoes:vConf,obra:()=>vObra(r.id),cliente:()=>vCliente(r.id)};
    h+=(V[r.page]||vDash)();
  }
  $('#view').innerHTML=h;
  if(r.page==='dashboard'||!['obras','clientes','clientedet','despesas','financeiro','cronograma','relatorios','configuracoes','obra','cliente'].includes(r.page))drawCharts();
  stackLabels(document);
  fillNames();
}
const statusPill=p=>`<span class="pill s-${p.status}">${STATUS[p.status]||p.status}</span>`;
const flags=c=>(c.late?`<span class="pill bad">Atrasada ${days(c.delay)}</span>`:'')+(c.overCost?`<span class="pill bad">Custo acima do previsto</span>`:'');
const kpi=(l,v,h='',cls='',icn='')=>`<div class="kpi ${cls}"><span class="l">${icn?`<i class="ki">${ic(icn)}</i>`:''}${l}</span><span class="v">${v}</span>${h?`<span class="h">${h}</span>`:''}</div>`;
const sgn=v=>v<0?'neg':'pos';
function emptyStart(){
  return `<div class="card empty"><b>Nenhuma obra cadastrada ainda</b><span>Cadastre a primeira obra para começar a lançar despesas e acompanhar o lucro real de cada contrato.</span>
  <div class="row" style="justify-content:center"><button class="btn primary" data-act="new-project" data-w>${ic('plus')} Cadastrar primeira obra</button>${isDemo()?'':`<button class="btn" data-act="demo-on">Ver com dados de demonstração</button>`}</div></div>`;
}

/* --- acesso --- */
const FEAT=[['doc','Controle de tarefas e atividades','Saiba o que cada equipe precisa fazer e o que já foi entregue.'],['build','Gestão de obras e despesas','Custos, recebimentos e lucro real de cada obra, separados.'],['coin','Relatórios inteligentes','Resultado financeiro e prazos em PDF e Excel, em poucos cliques.'],['cal','Notificações e lembretes','Avisos de prazo, custo acima do previsto e pendências.']];
function vAuth(){
  const V={
   login:{t:'Entrar na plataforma',s:'Use o mesmo e-mail e senha no computador e no aplicativo.',f:[['email','E-mail','email','voce@empresa.com.br','username'],['password','Senha','password','Sua senha','current-password']],cta:'Entrar',foot:['Ainda não tem conta?','Criar conta','cadastro']},
   cadastro:{t:'Criar conta',s:'Cadastre seu usuário e senha para começar a controlar suas obras.',f:[['name','Nome completo','text','Seu nome','name'],['company','Empresa','text','Nome da empresa','organization'],['email','E-mail','email','voce@empresa.com.br','username'],['password','Senha','password','Mínimo de 8 caracteres','new-password'],['password2','Confirmar senha','password','Repita a senha','new-password']],cta:'Criar conta',foot:['Já tem conta?','Entrar','login']},
   recuperar:{t:'Recuperar senha',s:'Informe o e-mail da sua conta. Enviaremos um link para você criar uma nova senha.',f:[['email','E-mail','email','voce@empresa.com.br','username']],cta:'Enviar link de recuperação',foot:['Lembrou a senha?','Voltar para o login','login']},
   'nova-senha':{t:'Criar nova senha',s:'Escolha a nova senha da sua conta.',f:[['password','Nova senha','password','Mínimo de 8 caracteres','new-password'],['password2','Confirmar nova senha','password','Repita a senha','new-password']],cta:'Salvar nova senha',foot:['','Voltar para o login','login']}
  }[authView];
  const brand=`<div class="brand"><i></i>OBRA&nbsp;<span>CONTROL</span></div>`;
  return `<div class="pitch">${brand}<div class="pm"><h1>Cada obra sob controle, do orçamento ao lucro real.</h1><div class="feats">${FEAT.map(([i,t,d])=>`<div class="ft"><span>${ic(i)}</span><div><b>${t}</b><p>${d}</p></div></div>`).join('')}</div></div><p class="sync">Computador e celular com a mesma conta e os mesmos dados.</p></div>
  <div class="panel"><div class="mhead ${authView==='login'?'hero':''}">${authView==='login'?`${brand}<div class="mt">Suas obras na palma da mão.</div><p class="sync">Mesma conta e mesmos dados do computador</p>`:`<button class="icb" data-act="auth-go" data-id="login" aria-label="Voltar">‹</button>${brand}<span style="width:40px"></span>`}</div>
   <form class="box" data-form="auth" novalidate><div><h2>${V.t}</h2><p class="ink2" style="margin-top:6px">${V.s}</p></div>
   ${V.f.map(([n,l,t,ph,ac])=>`<label class="f" for="au-${n}">${l}<input id="au-${n}" name="${n}" type="${t}" placeholder="${ph}" autocomplete="${ac}"></label>`).join('')}
   ${authView==='login'?`<div class="row" style="justify-content:flex-end"><button type="button" class="lnk" data-act="auth-go" data-id="recuperar">Esqueci minha senha</button></div>`:''}
   <p class="msg" role="alert"></p><button class="btn primary big">${V.cta}</button>
   <p class="ink2 small" style="text-align:center">${V.foot[0]} <button type="button" class="lnk" data-act="auth-go" data-id="${V.foot[2]}">${V.foot[1]}</button></p></form></div>`;
}
async function authSubmit(f){
  const v=vals(f),msg=t=>{$('.msg',f).textContent=t||'';$('.msg',f).style.color=''},b=$('.btn.primary',f);
  const ok=t=>{$('.msg',f).textContent=t;$('.msg',f).style.color='var(--pos)'};
  msg('');
  if(authView!=='nova-senha'&&!/^\S+@\S+\.\S+$/.test(v.email||'')){msg('Informe um e-mail válido.');return}
  if(authView!=='recuperar'&&(v.password||'').length<(authView==='login'?1:8)){msg(authView==='login'?'Informe sua senha.':'A senha precisa ter pelo menos 8 caracteres.');return}
  if((authView==='cadastro'||authView==='nova-senha')&&v.password!==v.password2){msg('As senhas não são iguais.');return}
  if(authView==='cadastro'&&!v.name){msg('Informe seu nome.');return}
  b.disabled=true;
  try{
    if(authView==='login'){
      let u;try{const r=await authCall(()=>neon.auth.signIn.email({email:v.email,password:v.password}));u=r.data&&r.data.user}catch(e){u=await sessionUser();if(!u)throw e}
      u=u||await sessionUser();if(!u)throw new Error('sem sessão');await enter(u)}
    else if(authView==='cadastro'){
      let u;try{const r=await authCall(()=>neon.auth.signUp.email({email:v.email,password:v.password,name:v.name}));u=r.data&&r.data.user}catch(e){u=await sessionUser();if(!u)throw e}
      u=await sessionUser()||null;
      if(!u){authView='login';render();toast('Conta criada. Entre com seu e-mail e senha.');return}
      await enter(u);if(me&&v.company&&!D.settings.company)putSettings({...D.settings,company:v.company}).catch(()=>{})}
    else if(authView==='recuperar'){await authCall(()=>neon.auth.requestPasswordReset({email:v.email,redirectTo:location.origin+'/'}));ok('Se existir uma conta com este e-mail, o link de recuperação foi enviado. Confira também a caixa de spam.')}
    else{await authCall(()=>neon.auth.resetPassword({newPassword:v.password,token:resetToken}));resetToken='';history.replaceState(null,'',location.pathname);authView='login';render();toast('Senha alterada. Entre com a nova senha.')}
  }catch(e){console.warn('auth',e&&e.code,e&&e.message);msg(authErr(e))}
  if(b.isConnected)b.disabled=false;
}

/* --- financeiro --- */
let FT='classificar',SEL=null,FS=null,FACC='',FTQ='',FMON='';
const DEF_CENTERS=['Administrativo','Pessoal','Frota','Impostos e taxas','Financeiro'];
const DEF_CCATS=['Salários e encargos','Pró-labore','Aluguel','Energia e água','Telefonia e internet','Contabilidade','Combustível','Manutenção de veículos','Impostos','Tarifas bancárias','Material de escritório','Seguros','Outros'];
const INC_CATS=['Rendimentos','Outras receitas','Aporte de sócio','Empréstimo'];
const CCAT_CENTER={'Salários e encargos':'Pessoal','Pró-labore':'Pessoal','Combustível':'Frota','Manutenção de veículos':'Frota','Impostos':'Impostos e taxas','Tarifas bancárias':'Financeiro','Seguros':'Administrativo'};
const centers=()=>(D.settings.centers&&D.settings.centers.length)?D.settings.centers:DEF_CENTERS;
const companyCats=()=>(D.settings.company_cats&&D.settings.company_cats.length)?D.settings.company_cats:DEF_CCATS;
const acc=id=>D.accounts.find(a=>a.id===id);
const txOf=id=>D.transactions.find(t=>t.id===id);
const deacc=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase();
const payee=s=>deacc(s).replace(/\b(PIX|TED|DOC|TEF|ENVIADO|RECEBIDO|TRANSF(ERENCIA)?|PAG(TO|AMENTO)?|BOLETO|COMPRA|CARTAO|DEBITO|CREDITO|ELO|VISA|MASTER|EM|DE|DA|DO|PARA|LTDA|ME|EIRELI|S\/?A)\b/g,' ').replace(/[0-9\/\.\-:*]+/g,' ').replace(/\s+/g,' ').trim();
const h32=(t,seed)=>{let h=seed>>>0;for(const ch of String(t)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0}return h.toString(36)};
const txId=(accId,fit)=>'tx_'+h32(accId+'|'+fit,2166136261)+h32(fit+'|'+accId,374761393);
const pending=()=>D.transactions.filter(t=>t.status==='pendente'&&(!FACC||t.account_id===FACC)).sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(a.amount-b.amount));
const destLabel=a=>{if(a.kind==='projeto'){const p=proj(a.project_id);return p?`${p.code} · ${p.name}`:'Cadastro removido'}if(a.kind==='empresa')return `Empresa · ${a.center||''}`;return 'Transferência entre contas'};

function decodeOFX(buf){
  const head=new TextDecoder('latin1').decode(buf.slice(0,600));
  if(/CHARSET:\s*1252|ENCODING:\s*USASCII/i.test(head)&&!/encoding="utf-8"/i.test(head))return new TextDecoder('windows-1252').decode(buf);
  try{return new TextDecoder('utf-8',{fatal:true}).decode(buf)}catch(e){return new TextDecoder('windows-1252').decode(buf)}
}
function parseOFX(text){
  const tag=(src,n)=>{const m=new RegExp('<'+n+'>([^<\\r\\n]*)','i').exec(src);return m?m[1].trim():''};
  const dt=v=>{const m=/^(\d{4})(\d{2})(\d{2})/.exec(v||'');return m?`${m[1]}-${m[2]}-${m[3]}`:''};
  const num=v=>{v=String(v||'').trim();if(/,\d{1,2}$/.test(v)&&!/\.\d{1,2}$/.test(v))v=v.replace(/\./g,'').replace(',','.');return Number(v)};
  const acctid=tag(text,'ACCTID'),bank=tag(text,'BANKID')||tag(text,'ORG');
  const lb=/<LEDGERBAL>([\s\S]*?)(<\/LEDGERBAL>|<AVAILBAL>|<\/STMTRS>)/i.exec(text);
  const bal=lb?num(tag(lb[1],'BALAMT')):null,balDate=lb?dt(tag(lb[1],'DTASOF')):'';
  const txs=text.split(/<STMTTRN>/i).slice(1).map(b=>b.split(/<\/STMTTRN>/i)[0]).map(b=>{
    const name=tag(b,'NAME'),memo=tag(b,'MEMO'),amount=num(tag(b,'TRNAMT')),date=dt(tag(b,'DTPOSTED'));
    const desc=[name,memo].filter((x,i,a)=>x&&a.indexOf(x)===i).join(' · ')||tag(b,'TRNTYPE');
    return {fitid:tag(b,'FITID')||('h'+h32(date+amount+desc,99)),date,amount,desc,type:tag(b,'TRNTYPE')};
  }).filter(t=>t.date&&isFinite(t.amount)&&t.amount!==0);
  return {acctid,bank,bal,balDate,txs};
}
async function finImport(files){
  if(memory()&&!isDemo()){toast('Entre na sua conta para importar extratos.');return}
  let novos=0,rep=0,erro=0,per=[];
  for(const f of files){
    try{
      const o=parseOFX(decodeOFX(await f.arrayBuffer()));
      if(!o.txs.length){erro++;continue}
      const key=(o.bank||'banco')+'|'+(o.acctid||f.name);
      let a=D.accounts.find(x=>x.key===key);
      if(!a){const fin=String(o.acctid||'').replace(/\D/g,'').slice(-4);a={id:'acc_'+h32(key,7)+h32(key,11),key,bank:o.bank||'',acctid:o.acctid||'',name:`Conta ${fin?'final '+fin:(D.accounts.length+1)}`,created_at:Date.now()}}
      const ds=o.txs.map(t=>t.date).sort();
      if(o.bal!=null&&(!a.balance_date||(o.balDate||ds[ds.length-1])>=a.balance_date)){a={...a,balance:o.bal,balance_date:o.balDate||ds[ds.length-1]}}
      a={...a,last_import:Date.now(),last_file:f.name};
      await put('accounts',a);
      const have=new Set(D.transactions.map(t=>t.id)),sig=new Set(D.transactions.filter(t=>t.account_id===a.id).map(t=>t.date+'|'+t.amount+'|'+t.desc));
      const add=[];
      for(const t of o.txs){const id=txId(a.id,t.fitid),sg=t.date+'|'+t.amount+'|'+t.desc;if(have.has(id)||sig.has(sg)){rep++;continue}have.add(id);sig.add(sg);add.push({id,account_id:a.id,fitid:t.fitid,date:t.date,amount:t.amount,desc:t.desc,type:t.type,status:'pendente',imported_at:Date.now(),file:f.name})}
      await putMany('transactions',add);novos+=add.length;per.push([ds[0],ds[ds.length-1]]);
    }catch(e){console.error(e);erro++}
  }
  FT='classificar';SEL=null;FS=null;render();
  const p=per.length?` · período ${fdate(per.map(x=>x[0]).sort()[0])} a ${fdate(per.map(x=>x[1]).sort().pop())}`:'';
  modal({title:'Extrato importado',cancel:'Fechar',body:`<p class="ink2"><b>${novos}</b> ${novos===1?'lançamento novo':'lançamentos novos'} para classificar${p}.</p>${rep?`<p class="small muted">${rep} ${rep===1?'lançamento já existia e foi ignorado':'lançamentos já existiam e foram ignorados'}, então nada foi duplicado.</p>`:''}${erro?`<p class="msg">${erro} ${erro===1?'arquivo não pôde ser lido':'arquivos não puderam ser lidos'}. Confira se é um extrato no formato OFX exportado pelo banco.</p>`:''}`});
}

function suggest(t){
  const out={},debit=t.amount<0,v=Math.abs(t.amount),near=(d)=>Math.abs(ddiff(d,t.date))<=7;
  const linked=new Set(D.transactions.flatMap(x=>(x.allocations||[]).map(a=>a.expense_id||a.receipt_id)).filter(Boolean));
  if(debit){const e=D.expenses.filter(e=>!e.deleted&&e.status!=='estornada'&&!e.bank_tx_id&&!linked.has(e.id)&&Math.abs((+e.amount||0)-v)<0.01&&e.date&&near(e.date)).sort((a,b)=>Math.abs(ddiff(a.date,t.date))-Math.abs(ddiff(b.date,t.date)))[0];if(e)out.link={type:'expense',id:e.id,project_id:e.project_id,category:e.category}}
  else{const r=D.receipts.filter(r=>!r.deleted&&!r.bank_tx_id&&!linked.has(r.id)&&Math.abs((+r.amount||0)-v)<0.01&&r.date&&near(r.date))[0];if(r)out.link={type:'receipt',id:r.id,project_id:r.project_id}}
  const pk=payee(t.desc),dd=deacc(t.desc);
  const rule=D.rules.find(r=>r.match&&dd.includes(deacc(r.match)));
  if(rule)return {...out,src:'regra',rule:rule.id,kind:rule.kind,project_id:rule.project_id,center:rule.center,category:rule.category};
  if(pk){const prev=D.transactions.filter(x=>x.status==='classificado'&&x.allocations&&x.allocations.length===1&&(x.amount<0)===debit&&payee(x.desc)===pk).sort((a,b)=>(b.classified_at||0)-(a.classified_at||0))[0];
    if(prev){const a=prev.allocations[0],p=a.project_id&&proj(a.project_id);if(a.kind!=='projeto'||(p&&!['concluida','cancelada'].includes(p.status)))return {...out,src:'histórico',kind:a.kind,project_id:a.project_id,center:a.center,category:a.category}}}
  if(/TRANSF.{0,20}(ENTRE|MESMA|PROPRIA)|APLICACAO|RESGATE|PAGTO? FATURA|FATURA CART/.test(dd))return {...out,src:'transferência',kind:'transferencia'};
  if(out.link)return {...out,src:'lançamento',kind:'projeto',project_id:out.link.project_id,category:out.link.category};
  if(!debit){const c=D.clients.find(c=>{const w=deacc(c.name).split(/\s+/).filter(x=>x.length>3);return w.length&&w.some(x=>dd.includes(x))});
    if(c){const p=D.projects.filter(p=>p.client_id===c.id&&!['cancelada'].includes(p.status)).map(p=>({p,c:calc(p)})).filter(x=>x.c.receivable>0).sort((a,b)=>b.c.receivable-a.c.receivable)[0];if(p)return {...out,src:'cliente',kind:'projeto',project_id:p.p.id}}}
  return out;
}
function sugPill(t){
  const s=suggest(t);
  if(s.kind==='transferencia')return `<span class="pill">Transferência · não é custo</span>`;
  if(s.kind==='empresa')return `<span class="pill s-aprovada">${s.src==='regra'?'Regra':'Sugestão'}: Empresa · ${esc(s.center||'')}${s.category?' · '+esc(s.category):''}</span>`;
  if(s.kind==='projeto'){const p=proj(s.project_id);if(p)return `<span class="pill k-${kindOf(p)}">${s.link?'Já lançado':t.amount>0?'Recebimento':s.src==='regra'?'Regra':'Sugestão'}: ${esc(p.code)}${s.category?' · '+esc(s.category):''}</span>`}
  return `<span class="pill">Sem sugestão</span>`;
}
function finSelect(id){
  if(!txOf(id))return;finSelectSilent(id);
  if(innerWidth<=820){modal({title:'Classificar lançamento',cancel:'',body:`<div id="fin-panel">${finPanelInner()}</div>`});}
  else{render()}
}
function finSetKind(k){if(!FS)return;if(!FS.ruleTouched)FS.rule=k==='empresa'&&!!FS.ruleText;FS.kind=k;FS.project_id='';FS.category='';FS.useLink=false;FS.quick=false;FS.q='';if(k==='empresa'){FS.center=FS.center||centers()[0]}finPanel()}
function finPanel(){const el=(!M.hidden&&$('#fin-panel',M))||$('#fin-panel');if(el)el.innerHTML=finPanelInner()}
function finField(t){
  const f=t.dataset.fin;
  if(f==='dest'){const v=t.value;if(v.startsWith('c:'))FS.center=v.slice(2);else FS.project_id=v.slice(2);finPanel();return}
  if(f==='cat'){FS.category=t.value;if(FS.kind==='empresa'&&CCAT_CENTER[t.value]&&!FS.centerTouched){FS.center=CCAT_CENTER[t.value];finPanel()}return}
  if(f==='center'){FS.center=t.value;FS.centerTouched=true;return}
  if(f==='supplier'){FS.supplier=t.value;return}
  if(f==='rule'){FS.rule=t.checked;FS.ruleTouched=true;return}
  if(f==='ruletext'){FS.ruleText=t.value;return}
  if(f==='sdest'){FS.splits[+t.dataset.i].dest=t.value;FS.splits[+t.dataset.i].category='';finPanel();return}
  if(f==='scat'){FS.splits[+t.dataset.i].category=t.value;return}
  if(f==='acc'){FACC=t.value;SEL=null;FS=null;render();return}
  if(f==='month'){FMON=t.value;render();return}
}
function activeOf(kind){const t=txOf(SEL)||{};return D.projects.filter(p=>kindOf(p)===kind&&!['concluida','cancelada'].includes(p.status)).map(p=>({p,last:Math.max(p.created_at||0,...D.transactions.filter(x=>(x.allocations||[]).some(a=>a.project_id===p.id)).map(x=>x.classified_at||0))})).sort((a,b)=>b.last-a.last).map(x=>x.p)}
function finDestList(){
  if(FS.kind==='empresa')return centers().map(c=>`<label class="dopt${FS.center===c?' on':''}"><input type="radio" name="fdest" value="c:${esc(c)}" data-fin="dest"${FS.center===c?' checked':''}><span><b>${esc(c)}</b><small>Centro da empresa</small></span></label>`).join('');
  const q=deacc(FS.q);let l=activeOf(FS.kind);
  if(FS.project_id&&!l.some(p=>p.id===FS.project_id)){const p=proj(FS.project_id);if(p)l=[p,...l]}
  if(q)l=l.filter(p=>deacc([p.code,p.name,(cli(p.client_id)||{}).name].join(' ')).includes(q));
  const lim=q?20:5,more=l.length-lim;
  if(!l.length)return `<p class="small muted">${q?'Nada encontrado.':'Nenhum cadastro ativo deste tipo.'} Use o botão abaixo para criar.</p>`;
  return l.slice(0,lim).map(p=>`<label class="dopt${FS.project_id===p.id?' on':''}"><input type="radio" name="fdest" value="p:${p.id}" data-fin="dest"${FS.project_id===p.id?' checked':''}><span><small>${esc(p.code)} · ${esc((cli(p.client_id)||{}).name||'Sem cliente')}</small><b>${esc(p.name)}</b></span></label>`).join('')+(more>0?`<p class="small muted">Mais ${more}. Digite para buscar.</p>`:'');
}
function destOptions(sel,debit){
  const g=(k)=>D.projects.filter(p=>kindOf(p)===k&&!['concluida','cancelada'].includes(p.status));
  return `<option value="">Escolha o destino</option>${Object.keys(KIND).map(k=>`<optgroup label="${KIND[k].pl}">${g(k).map(p=>`<option value="p:${p.id}"${sel==='p:'+p.id?' selected':''}>${esc(p.code+' · '+p.name)}</option>`).join('')}</optgroup>`).join('')}<optgroup label="Empresa">${centers().map(c=>`<option value="c:${esc(c)}"${sel==='c:'+c?' selected':''}>${esc(c)}</option>`).join('')}</optgroup>`;
}
const catOpts=(list,sel)=>`<option value="">Categoria</option>${list.map(c=>`<option${c===sel?' selected':''}>${esc(c)}</option>`).join('')}`;
function finSumHTML(){const t=txOf(SEL),tot=sum(FS.splits,x=>x.amount),dif=Math.abs(t.amount)-tot,ok=Math.abs(dif)<0.005;return `<div id="fin-sum" class="small" style="display:flex;justify-content:space-between;font-weight:600;color:${ok?'var(--pos)':'var(--warn)'}"><span>${ok?'Total dividido igual ao valor do extrato':dif>0?`Falta dividir ${money(dif)}`:`Passou ${money(-dif)} do valor`}</span><span>${money(tot)} de ${money(Math.abs(t.amount))}</span></div>`}
function finToggleSplit(){
  const t=txOf(SEL);FS.split=!FS.split;
  if(FS.split&&!FS.splits.length){const first=FS.kind==='empresa'?(FS.center?'c:'+FS.center:''):(FS.project_id?'p:'+FS.project_id:'');FS.splits=[{dest:first,category:FS.category,amount:Math.abs(t.amount)},{dest:'',category:'',amount:0}]}
  finPanel();
}
function finPanelInner(){
  const t=txOf(SEL);if(!t||!FS)return `<div class="empty"><b>Selecione um lançamento</b><span>Clique em um item da lista para escolher o destino.</span></div>`;
  const debit=t.amount<0,a=acc(t.account_id)||{},lk=FS.link&&(FS.link.type==='expense'?D.expenses.find(e=>e.id===FS.link.id):D.receipts.find(r=>r.id===FS.link.id));
  const kinds=[['obra','Obra'],['servico','Serviço'],['venda','Venda'],['empresa','Empresa']];
  let h=`<div class="fp-head"><div><div class="small muted">${fdate(t.date)} · ${esc(a.name||'Conta')}</div><h2>${esc(t.desc)}</h2></div><div class="fp-val ${debit?'neg':'pos'}">${debit?'−':'+'}${money(Math.abs(t.amount))}</div></div>`;
  if(lk){const lp=proj(lk.project_id);h+=`<div class="fp-link${FS.useLink?' on':''}">${ic('link')}<div><b>${debit?'Despesa já lançada':'Recebimento já lançado'}${lp?' em '+esc(lp.code):''}:</b> ${esc(lk.description||lk.category||'')}, ${money(lk.amount)} em ${fdate(lk.date)}. ${FS.useLink?'Será vinculado, sem criar outro lançamento.':'Vincule para não contar duas vezes.'}</div><button type="button" class="btn" data-act="fin-link">${FS.useLink?'Não vincular':'Vincular'}</button></div>`}
  if(FS.kind==='transferencia'){
    h+=`<div class="banner demo"><span>Marcado como <b>transferência entre contas</b> (aplicação, resgate ou pagamento de fatura). Não entra como receita nem custo.</span><button type="button" class="btn" data-act="fin-kind" data-id="obra">Desfazer</button></div>`;
  }else if(FS.useLink&&lk){
    h+=`<p class="small ink2">Ao confirmar, o lançamento do banco fica ligado ao registro existente. Nada novo é criado.</p>`;
  }else{
    h+=`<div><span class="lbl">Tipo de destino</span><div class="seg2" role="group" aria-label="Tipo de destino">${kinds.map(([k,l])=>`<button type="button" class="${FS.kind===k?'on':''}" data-act="fin-kind" data-id="${k}" aria-pressed="${FS.kind===k}">${l}</button>`).join('')}</div></div>`;
    if(FS.split){
      const cats=d=>d.startsWith('c:')?(debit?companyCats():INC_CATS):(debit?allCats():[]);
      h+=`<div class="fp-split"><div class="row" style="justify-content:space-between"><b>${ic('split')} Dividir entre destinos</b><button type="button" class="lnk" data-act="fin-split">Cancelar divisão</button></div>
      ${FS.splits.map((x,i)=>`<div class="srow"><select data-fin="sdest" data-i="${i}" aria-label="Destino ${i+1}">${destOptions(x.dest,debit)}</select>${cats(x.dest).length?`<select data-fin="scat" data-i="${i}" aria-label="Categoria ${i+1}">${catOpts(cats(x.dest),x.category)}</select>`:''}<input type="text" inputmode="numeric" data-money data-fin="samount" data-i="${i}" value="${x.amount?money(x.amount):''}" placeholder="R$ 0,00" aria-label="Valor ${i+1}">${FS.splits.length>2?`<button type="button" class="icb" data-act="fin-split-del" data-id="${i}" aria-label="Remover parte">${ic('x')}</button>`:''}</div>`).join('')}
      <button type="button" class="lnk" data-act="fin-split-add">${ic('plus')} Adicionar parte</button>${finSumHTML()}</div>`;
    }else{
      h+=`<div><span class="lbl">${FS.kind==='empresa'?'Centro':'Destino'}</span>${FS.kind!=='empresa'?`<div class="srch">${ic('search')}<input type="search" id="fin-q" placeholder="Buscar ${KIND[FS.kind].pl.toLowerCase()} ativas por nome, código ou cliente" value="${esc(FS.q)}" aria-label="Buscar destino"></div>`:''}<div id="fdest-list" class="dlist">${finDestList()}</div>
      ${FS.kind!=='empresa'?(FS.quick?`<div class="fp-quick"><b>${KIND[FS.kind].novo} rápido${FS.kind==='venda'?'a':''}</b><input type="text" id="fq-name" placeholder="Nome, ex.: ${FS.kind==='venda'?'Kit padrão de entrada':FS.kind==='servico'?'Manutenção de quadro':'Rede rural 34,5 kV'}" aria-label="Nome"><input type="text" id="fq-client" list="fq-clients" placeholder="Cliente (escolha ou digite um novo)" aria-label="Cliente"><datalist id="fq-clients">${D.clients.map(c=>`<option value="${esc(c.name)}">`).join('')}</datalist><div class="row"><button type="button" class="btn dark" data-act="fin-quick-save">Criar e usar</button><button type="button" class="btn ghost" data-act="fin-quick">Cancelar</button></div></div>`:`<button type="button" class="lnk acc" data-act="fin-quick">${ic('plus')} Criar ${KIND[FS.kind].n.toLowerCase()} sem sair daqui</button>`):''}</div>`;
      if(debit||FS.kind==='empresa'){const list=FS.kind==='empresa'?(debit?companyCats():INC_CATS):allCats();
        h+=`<div class="g2f"><label class="f" for="fin-cat">Categoria<select id="fin-cat" data-fin="cat">${catOpts(list,FS.category)}</select></label>${debit&&FS.kind!=='empresa'?`<label class="f" for="fin-sup">Fornecedor<input type="text" id="fin-sup" data-fin="supplier" value="${esc(FS.supplier)}"></label>`:''}</div>`}
      else h+=`<p class="small ink2">Será registrado como <b>recebimento</b> no cadastro escolhido.</p>`;
      h+=`<button type="button" class="lnk" data-act="fin-split">${ic('split')} Dividir entre destinos</button>`;
    }
    if(!FS.split)h+=`<label class="chk"><input type="checkbox" data-fin="rule"${FS.rule?' checked':''}> Criar regra: quando aparecer <input type="text" data-fin="ruletext" value="${esc(FS.ruleText)}" aria-label="Texto da regra" style="width:auto;min-height:32px;padding:4px 8px;display:inline-block;max-width:170px"> sugerir este destino</label>`;
  }
  h+=`<p class="msg" id="fin-msg" role="alert"></p><div class="fp-act"><button type="button" class="btn primary big" data-act="fin-confirm">Confirmar e ir para o próximo</button><button type="button" class="btn" data-act="fin-skip">Pular</button></div>
  <div class="row small" style="justify-content:center;gap:16px">${FS.kind!=='transferencia'?`<button type="button" class="lnk" data-act="fin-transfer">É transferência entre contas</button>`:''}<button type="button" class="lnk" data-act="fin-ignore">Ignorar lançamento</button></div>`;
  return h;
}
async function finQuickSave(){
  const P=(!M.hidden&&$('#fin-panel',M))||document,n=($('#fq-name',P)||{}).value||'',cn=(($('#fq-client',P)||{}).value||'').trim(),msg=$('#fin-msg',P);
  if(!n.trim()){if(msg)msg.textContent='Informe o nome.';return}
  try{
    let c=D.clients.find(x=>x.name.toLowerCase()===cn.toLowerCase());
    if(!c&&cn){c={id:uid('c'),name:cn,doc:'',phone:'',whatsapp:'',email:'',created_at:Date.now()};await put('clients',c)}
    const t=txOf(SEL),k=FS.kind;
    const p={id:uid('p'),kind:k,code:nextCode(k),name:n.trim(),client_id:c?c.id:null,status:'andamento',contract_value:0,planned_cost:0,real_start:t.date,progress:0,created_at:Date.now(),updated_at:Date.now(),color:k==='venda'?'petroleo':k==='servico'?'azul':undefined};
    await put('projects',p);await log('obra','criou',p.id,`${KIND[k].n} cadastrada pelo financeiro: ${p.name} (${p.code})`,p.id);
    FS.project_id=p.id;FS.quick=false;finPanel();toast(`${p.code} criado. Complete o valor depois, se quiser.`);
  }catch(e){if(msg)msg.textContent=errText(e)}
}
async function finClassify(t,st){
  const debit=t.amount<0,v=Math.abs(t.amount),allocs=[];
  const mk=async(dest,category,amount,link)=>{
    if(st.kind==='transferencia'){allocs.push({kind:'transferencia',amount});return}
    if(link){const isE=link.type==='expense',col=isE?'expenses':'receipts',rec=(isE?D.expenses:D.receipts).find(x=>x.id===link.id);
      if(rec){await put(col,{...rec,bank_tx_id:t.id,updated_at:Date.now()});allocs.push({kind:'projeto',project_id:rec.project_id,category:rec.category||'',amount,[isE?'expense_id':'receipt_id']:rec.id,linked:true});return}}
    if(dest.startsWith('c:')){allocs.push({kind:'empresa',center:dest.slice(2),category,amount});return}
    const pid=dest.slice(2),p=proj(pid);if(!p)throw new Error('destino');
    if(debit){const e={id:uid('e'),project_id:pid,date:t.date,category:category||'Outros',description:t.desc,amount,supplier:st.supplier||'',payment:'Extrato bancário',responsible:myName||'',notes:'Importado do extrato bancário',status:'ativa',attachments:[],bank_tx_id:t.id,created_at:Date.now(),created_by:myId||null};
      await put('expenses',e);await log('despesa','criou',pid,`Despesa do extrato: ${t.desc} (${money(amount)})`,e.id);allocs.push({kind:'projeto',project_id:pid,category:e.category,amount,expense_id:e.id})}
    else{const r={id:uid('r'),project_id:pid,date:t.date,amount,method:'Transferência',description:t.desc,bank_tx_id:t.id,created_at:Date.now()};
      await put('receipts',r);await log('recebimento','criou',pid,`Recebimento do extrato: ${money(amount)}`,r.id);allocs.push({kind:'projeto',project_id:pid,amount,receipt_id:r.id})}
  };
  if(st.useLink&&st.link)await mk('',null,v,st.link);
  else if(st.kind==='transferencia')await mk('',null,v);
  else if(st.split){for(const x of st.splits)await mk(x.dest,x.category,x.amount)}
  else await mk(st.kind==='empresa'?'c:'+st.center:'p:'+st.project_id,st.category,v);
  await put('transactions',{...t,status:'classificado',allocations:allocs,classified_at:Date.now()});
  if(st.rule&&st.ruleText&&st.ruleText.trim().length>=3&&!st.split&&!st.useLink){const m=st.ruleText.trim(),id='r_'+h32(deacc(m),5);
    await put('rules',{id,match:m,kind:st.kind==='transferencia'?'transferencia':st.kind==='empresa'?'empresa':'projeto',project_id:st.kind==='empresa'||st.kind==='transferencia'?'':st.project_id,center:st.kind==='empresa'?st.center:'',category:st.category||'',created_at:Date.now()})}
}
function finValidate(t){
  const debit=t.amount<0;
  if(FS.useLink&&FS.link)return '';
  if(FS.kind==='transferencia')return '';
  if(FS.split){const tot=sum(FS.splits,x=>x.amount);if(FS.splits.some(x=>!x.dest||!(x.amount>0)))return 'Escolha o destino e o valor de cada parte.';if(Math.abs(tot-Math.abs(t.amount))>0.005)return 'A soma das partes precisa ser igual ao valor do extrato.';if(debit&&FS.splits.some(x=>!x.category))return 'Escolha a categoria de cada parte.';return ''}
  if(FS.kind==='empresa'){if(!FS.center)return 'Escolha o centro da empresa.';if(!FS.category)return 'Escolha a categoria.';return ''}
  if(!FS.project_id)return `Escolha ${FS.kind==='venda'?'a venda':FS.kind==='servico'?'o serviço':'a obra'} ou crie um novo cadastro.`;
  if(debit&&!FS.category)return 'Escolha a categoria da despesa.';
  return '';
}
async function finConfirm(){
  const t=txOf(SEL);if(!t||!FS)return;
  const err=finValidate(t),msg=((!M.hidden&&$('#fin-msg',M))||$('#fin-msg'));if(err){if(msg)msg.textContent=err;return}
  const b=((!M.hidden&&$('[data-act=fin-confirm]',M))||$('[data-act=fin-confirm]'));if(b)b.disabled=true;
  try{await finClassify(t,FS);toast('Lançamento classificado.');finNext(false)}
  catch(e){console.error(e);if(msg)msg.textContent=e.message==='destino'?'O destino escolhido não existe mais.':errText(e);if(b)b.disabled=false}
}
function finNext(skip){
  const l=pending(),i=l.findIndex(x=>x.id===SEL);
  const nx=skip?(l[i+1]||l[0]):(l.find((x,j)=>j>=i&&x.id!==SEL)||l.find(x=>x.id!==SEL));
  if(nx&&nx.id!==SEL){finSelect(nx.id);if(innerWidth>820)render()}else{SEL=null;FS=null;closeModal();render();if(!l.filter(x=>x.id!==SEL).length)toast('Tudo classificado.')}
}
async function finIgnore(){const t=txOf(SEL);if(!t)return;try{await put('transactions',{...t,status:'ignorado',allocations:[],classified_at:Date.now()});toast('Lançamento ignorado. Ele fica em Classificados, se precisar desfazer.');finNext(false)}catch(e){toast(errText(e))}}
async function finUndo(id){
  const t=txOf(id);if(!t)return;
  confirmBox('Desfazer classificação','O lançamento volta para "A classificar". Despesas e recebimentos criados a partir dele são removidos das obras (fica registrado no histórico). Lançamentos que já existiam são apenas desvinculados.','Desfazer',async()=>{
    for(const a of t.allocations||[]){
      if(a.expense_id){const e=D.expenses.find(x=>x.id===a.expense_id);if(e){if(a.linked){const {bank_tx_id,...r}=e;await put('expenses',{...r,updated_at:Date.now()})}else{await put('expenses',{...e,deleted:true,deleted_at:Date.now()});await log('despesa','excluiu',e.project_id,`Despesa do extrato removida ao desfazer a classificação: ${e.description} (${money(e.amount)})`,e.id)}}}
      if(a.receipt_id){const r=D.receipts.find(x=>x.id===a.receipt_id);if(r){if(a.linked){const {bank_tx_id,...o}=r;await put('receipts',{...o,updated_at:Date.now()})}else{await put('receipts',{...r,deleted:true,deleted_at:Date.now()});await log('recebimento','excluiu',r.project_id,`Recebimento do extrato removido ao desfazer a classificação: ${money(r.amount)}`,r.id)}}}
    }
    await put('transactions',{...t,status:'pendente',allocations:[],classified_at:null});toast('Classificação desfeita.');
  });
}
async function finApplyAll(){
  const l=pending().map(t=>({t,s:suggest(t)})).filter(x=>(x.s.src==='regra'||x.s.src==='histórico'||x.s.src==='transferência')&&!x.s.link&&(x.s.kind==='transferencia'||(x.s.kind==='empresa'?x.s.center&&(x.s.category||x.t.amount>0):x.s.project_id&&proj(x.s.project_id)&&(x.s.category||x.t.amount>0))));
  if(!l.length){toast('Nenhuma sugestão completa para aplicar.');return}
  confirmBox('Aplicar sugestões',`${l.length} ${l.length===1?'lançamento será classificado':'lançamentos serão classificados'} com as regras e o histórico. Você pode desfazer cada um em Classificados.`,'Aplicar',async()=>{
    let n=0;for(const {t,s} of l){const p=s.project_id&&proj(s.project_id);await finClassify(t,{kind:s.kind==='projeto'?kindOf(p):s.kind,project_id:s.project_id||'',center:s.center||'',category:s.category||'',supplier:'',split:false,useLink:false,rule:false});n++}
    SEL=null;FS=null;toast(`${n} lançamentos classificados.`);
  });
}
function finAccEdit(id){const a=acc(id);modal({title:'Conta bancária',body:`<div class="form">${fld('Nome da conta','name',a.name,{full:true,req:true})}</div><p class="small muted">Banco ${esc(a.bank||'—')} · conta ${esc(a.acctid||'—')}</p>`,onSubmit:async(f,msg)=>{const v=vals(f);if(!v.name){msg('Informe o nome.');return false}await put('accounts',{...a,name:v.name})}})}
function finDoneRows(){
  const q=deacc(FTQ);let l=D.transactions.filter(t=>t.status!=='pendente'&&(!FACC||t.account_id===FACC));
  if(q)l=l.filter(t=>deacc(t.desc+' '+(t.allocations||[]).map(destLabel).join(' ')).includes(q));
  l.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  if(!l.length)return `<p class="muted small" style="padding:10px 0">Nenhum lançamento classificado${q?' com essa busca':''}.</p>`;
  return l.slice(0,300).map(t=>`<div class="li"><div class="m"><div class="t">${esc(t.desc)}</div><div class="d">${fdate(t.date)} · ${t.status==='ignorado'?'<b>Ignorado</b>':(t.allocations||[]).map(a=>esc(destLabel(a))+(a.category?' · '+esc(a.category):'')+((t.allocations||[]).length>1?' ('+money(a.amount)+')':'')+(a.linked?' · vinculado':'')).join(' + ')}</div></div><div class="rt"><div class="a ${t.amount<0?'neg':'pos'}">${t.amount<0?'−':'+'}${money(Math.abs(t.amount))}</div><div class="acts" data-w><button class="btn ghost" style="padding:4px 10px;min-height:0" data-act="fin-undo" data-id="${t.id}">Desfazer</button></div></div></div>`).join('')+(l.length>300?'<p class="small muted">Mostrando os 300 mais recentes. Use a busca.</p>':'');
}
function finResult(){
  const months=[...new Set([...D.transactions.map(t=>(t.date||'').slice(0,7)),...D.expenses.map(e=>(e.date||'').slice(0,7)),...D.receipts.map(r=>(r.date||'').slice(0,7))].filter(Boolean))].sort().reverse();
  const m=FMON||today().slice(0,7);
  const inM=d=>(d||'').startsWith(m);
  const rec=D.receipts.filter(r=>!r.deleted&&inM(r.date)),exp=D.expenses.filter(e=>!e.deleted&&e.status!=='estornada'&&inM(e.date));
  const by={};for(const r of rec){(by[r.project_id]=by[r.project_id]||{r:0,c:0}).r+=+r.amount||0}for(const e of exp){(by[e.project_id]=by[e.project_id]||{r:0,c:0}).c+=+e.amount||0}
  const comp=D.transactions.filter(t=>t.status==='classificado'&&inM(t.date)).flatMap(t=>(t.allocations||[]).filter(a=>a.kind==='empresa').map(a=>({...a,debit:t.amount<0})));
  const fixed={},inc={};for(const a of comp){const o=a.debit?fixed:inc;o[a.category||'Outros']=(o[a.category||'Outros']||0)+(+a.amount||0)}
  const pend=D.transactions.filter(t=>t.status==='pendente'&&inM(t.date)).length;
  const groups=Object.keys(KIND).map(k=>{const items=Object.entries(by).map(([pid,v])=>({p:proj(pid),...v})).filter(x=>x.p&&kindOf(x.p)===k).sort((a,b)=>(b.r-b.c)-(a.r-a.c));return {k,items,r:sum(items,x=>x.r),c:sum(items,x=>x.c)}});
  const R=sum(groups,g=>g.r),C=sum(groups,g=>g.c),F=sum(Object.values(fixed)),I=sum(Object.values(inc)),L=R+I-C-F;
  const fx=Object.entries(fixed).sort((a,b)=>b[1]-a[1]),mx=fx.length?fx[0][1]:1;
  const mopts=[...new Set([m,...months])].sort().reverse().map(x=>`<option value="${x}"${x===m?' selected':''}>${['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'][+x.slice(5)-1]} de ${x.slice(0,4)}</option>`).join('');
  let h=`<div class="row" style="justify-content:space-between"><p class="ink2 small">Receitas e custos lançados no mês (manuais e do extrato) e os custos fixos classificados.</p><label class="f" for="fin-mon" style="flex-direction:row;align-items:center;gap:8px">Mês<select id="fin-mon" data-fin="month" style="width:auto">${mopts}</select></label></div>`;
  if(pend)h+=`<div class="banner warn"><span>${pend} ${pend===1?'lançamento do extrato deste mês ainda não foi classificado e está':'lançamentos do extrato deste mês ainda não foram classificados e estão'} fora do resultado.</span><button class="btn" data-act="fin-tab" data-id="classificar">Classificar agora</button></div>`;
  h+=`<div class="grid g4">${kpi('Receitas',money(R+I),I?`Inclui ${money(I)} fora dos trabalhos`:'Obras, serviços e vendas','tone-pos','coin')}${kpi('Custos diretos',money(C),'Ligados a um trabalho','tone-neg','build')}${kpi('Custos fixos',money(F),'Centros da empresa','tone-info','bank')}${kpi('Lucro do mês',money(L),R+I>0?pct(L/(R+I)*100)+' das receitas':'',`hl ${L<0?'tone-neg':'tone-pos'}`,'doc')}</div>`;
  const row=x=>`<tr><td>${dot(x.p)}<span class="muted small">${esc(x.p.code)}</span> <a href="#obra-${x.p.id}"><b>${esc(x.p.name)}</b></a></td><td class="r">${money(x.r)}</td><td class="r neg">${money(x.c)}</td><td class="r ${x.r-x.c<0?'neg':'pos'}"><b>${money(x.r-x.c)}</b></td></tr>`;
  const tb=groups.filter(g=>g.items.length).map(g=>`<tr class="grp k-${g.k}"><td>${KIND[g.k].pl}</td><td class="r">${money(g.r)}</td><td class="r">${money(g.c)}</td><td class="r"><b>${money(g.r-g.c)}</b></td></tr>${g.items.map(row).join('')}`).join('');
  h+=`<div class="fin-res"><div class="card"><h2>Por obra, serviço e venda</h2>${tb?`<div class="scroll"><table class="stack"><thead><tr><th>Destino</th><th class="r">Receita</th><th class="r">Custo direto</th><th class="r">Resultado</th></tr></thead><tbody>${tb}<tr><td><b>Total dos trabalhos</b></td><td class="r"><b>${money(R)}</b></td><td class="r neg"><b>${money(C)}</b></td><td class="r pos"><b>${money(R-C)}</b></td></tr></tbody></table></div>`:'<p class="muted small">Nenhum recebimento ou despesa neste mês.</p>'}</div>
   <div style="display:flex;flex-direction:column;gap:14px;min-width:0"><div class="card"><h2>Resultado da empresa</h2><div class="dre">${[['Receitas dos trabalhos',R,''],I?['Outras receitas',I,'']:null,['(−) Custos diretos',C,'neg'],['(−) Custos fixos da empresa',F,'neg']].filter(Boolean).map(([l,v,c])=>`<div><span class="${c}">${l}</span><b class="${c}">${money(v)}</b></div>`).join('')}<div class="tot"><span>= Lucro do mês</span><b class="${L<0?'neg':'pos'}">${money(L)}</b></div></div></div>
   <div class="card"><div class="row" style="justify-content:space-between;margin-bottom:10px"><h2 style="margin:0">Custos fixos</h2><b class="num">${money(F)}</b></div>${fx.length?fx.map(([k,v])=>`<div class="fxr"><div class="row" style="justify-content:space-between"><span>${esc(k)}</span><b class="num">${money(v)}</b></div><div class="bar"><i style="width:${(v/mx*100).toFixed(0)}%;background:var(--info)"></i></div></div>`).join(''):'<p class="muted small">Nenhum custo fixo classificado neste mês.</p>'}</div></div></div>`;
  return h;
}
function vFin(){
  const pend=D.transactions.filter(t=>t.status==='pendente');
  let h=`<div class="head"><div><h1>Financeiro</h1><p class="sub">Extrato do banco classificado por obra, serviço, venda ou custo da empresa</p></div><div class="row">${D.accounts.length>1?`<select data-fin="acc" aria-label="Conta" style="width:auto"><option value="">Todas as contas</option>${D.accounts.map(a=>`<option value="${a.id}"${FACC===a.id?' selected':''}>${esc(a.name)}</option>`).join('')}</select>`:''}<button class="btn dark" data-act="fin-import" data-w>${ic('upload')} Importar extrato (OFX)</button><input type="file" id="ofx-in" accept=".ofx,.OFX,application/x-ofx,text/plain" multiple hidden></div></div>`;
  const tabs=[['classificar',`A classificar${pend.length?' ('+pend.length+')':''}`],['classificados','Classificados'],['resultado','Resultado do mês'],['regras','Regras'],['contas','Contas']];
  h+=`<div class="tabs" role="tablist">${tabs.map(([k,l])=>`<button role="tab" aria-selected="${FT===k}" class="${FT===k?'on':''}" data-act="fin-tab" data-id="${k}">${l}</button>`).join('')}</div>`;
  if(FT==='classificar'){
    const l=pending();
    if(!D.transactions.length)return h+`<div class="card empty"><b>Nenhum extrato importado</b><span>No site ou aplicativo do banco, exporte o extrato da conta no formato <b>OFX</b> (às vezes chamado de "Money" ou "arquivo para gerenciador financeiro") e importe aqui. Pode importar o mesmo período mais de uma vez: nada é duplicado.</span><button class="btn primary" data-act="fin-import" data-w>${ic('upload')} Importar extrato (OFX)</button>${isDemo()?'':'<button class="btn" data-act="demo-on">Ver com dados de demonstração</button>'}</div>`;
    const out=sum(l.filter(t=>t.amount<0),t=>-t.amount),inn=sum(l.filter(t=>t.amount>0),t=>t.amount),bal=sum(D.accounts.filter(a=>!FACC||a.id===FACC),a=>+a.balance||0);
    const lastDate=D.accounts.map(a=>a.balance_date||'').sort().pop();
    h+=`<div class="grid g4">${kpi('A classificar',`${l.length}`,'Fora do resultado até classificar','tone-warn','doc')}${kpi('Saídas a classificar',money(out),`${l.filter(t=>t.amount<0).length} pagamentos`,'tone-neg','coin')}${kpi('Entradas a classificar',money(inn),`${l.filter(t=>t.amount>0).length} recebimentos`,'tone-pos','down')}${kpi('Saldo no banco',money(bal),lastDate?'Conforme extrato de '+fdate(lastDate):'Sem saldo no extrato','tone-info','bank')}</div>`;
    if(!l.length)return h+`<div class="card empty"><b>Tudo classificado</b><span>Importe o próximo extrato quando quiser.</span></div>`;
    if(SEL&&!l.some(x=>x.id===SEL)){SEL=null;FS=null}
    if(!SEL&&innerWidth>820){const f=l[0];SEL=f.id;const keep=FS;FS=null;finSelectSilent(f.id)}
    const auto=l.filter(t=>{const s=suggest(t);return (s.src==='regra'||s.src==='histórico'||s.src==='transferência')&&!s.link}).length;
    h+=`<div class="fin-grid"><div class="card fin-list"><div class="row" style="justify-content:space-between;margin-bottom:6px"><span class="small ink2">${l.length} ${l.length===1?'lançamento':'lançamentos'}, do mais recente ao mais antigo</span>${auto?`<button class="btn" data-act="fin-apply" data-w>${ic('bolt')} Aplicar ${auto} ${auto===1?'sugestão':'sugestões'} automáticas</button>`:''}</div>
      ${l.slice(0,400).map(t=>`<button type="button" class="txr${t.id===SEL?' on':''}" data-act="fin-sel" data-id="${t.id}"><span class="dt">${fdate(t.date).slice(0,5)}</span><span class="m"><span class="t">${esc(t.desc)}</span>${sugPill(t)}</span><span class="a ${t.amount<0?'neg':'pos'}">${t.amount<0?'−':'+'}${money(Math.abs(t.amount))}</span></button>`).join('')}${l.length>400?'<p class="small muted">Mostrando 400. Classifique para ver os próximos.</p>':''}</div>
      ${innerWidth>820?`<div class="card fin-side" id="fin-panel">${finPanelInner()}</div>`:''}</div>`;
    return h;
  }
  if(FT==='classificados')return h+`<div class="card"><div class="row" style="margin-bottom:8px"><input type="search" id="fin-txq" placeholder="Buscar por descrição ou destino" value="${esc(FTQ)}" style="flex:1"></div><div class="list" id="fin-done">${finDoneRows()}</div></div>`;
  if(FT==='resultado')return h+finResult();
  if(FT==='regras')return h+`<div class="card"><h2>Regras automáticas</h2><p class="small muted" style="margin-bottom:10px">Quando a descrição do extrato contém o texto, o sistema sugere o destino. Crie regras marcando a opção na hora de classificar.</p>${D.rules.length?`<div class="list">${D.rules.slice().sort((a,b)=>(a.match||'').localeCompare(b.match||'')).map(r=>`<div class="li"><div class="m"><div class="t">“${esc(r.match)}”</div><div class="d">${esc(r.kind==='transferencia'?'Transferência entre contas':r.kind==='empresa'?'Empresa · '+(r.center||''):(proj(r.project_id)?proj(r.project_id).code+' · '+proj(r.project_id).name:'Cadastro removido'))}${r.category?' · '+esc(r.category):''}</div></div><div class="acts" data-w><button class="icb" data-act="fin-del-rule" data-id="${r.id}" aria-label="Excluir regra">${ic('trash')}</button></div></div>`).join('')}</div>`:'<p class="muted small">Nenhuma regra ainda.</p>'}</div>`;
  if(FT==='contas')return h+`<div class="card"><h2>Contas bancárias</h2><p class="small muted" style="margin-bottom:10px">As contas são criadas automaticamente na primeira importação do extrato de cada uma.</p>${D.accounts.length?`<div class="list">${D.accounts.map(a=>{const ts=D.transactions.filter(t=>t.account_id===a.id);return `<div class="li"><div class="m"><div class="t">${esc(a.name)}</div><div class="d">Banco ${esc(a.bank||'—')} · conta ${esc(a.acctid||'—')} · ${ts.length} lançamentos, ${ts.filter(t=>t.status==='pendente').length} a classificar${a.last_import?' · última importação '+fts(a.last_import):''}</div></div><div class="rt"><div class="a">${a.balance!=null?money(a.balance):'—'}</div><div class="d small muted">${a.balance_date?'saldo em '+fdate(a.balance_date):''}</div></div><div class="acts" data-w><button class="icb" data-act="fin-acc-edit" data-id="${a.id}" aria-label="Renomear conta">${ic('edit')}</button></div></div>`}).join('')}</div>`:'<p class="muted small">Nenhuma conta ainda. Importe um extrato.</p>'}</div>`;
  return h;
}
function finSelectSilent(id){const t=txOf(id);if(!t)return;const was=innerWidth;SEL=id;const s=suggest(t),p=s.project_id&&proj(s.project_id);
  FS={id,kind:s.kind==='projeto'?(p?kindOf(p):'obra'):(s.kind||'obra'),project_id:s.kind==='projeto'?s.project_id:'',center:s.center||(s.kind==='empresa'?centers()[0]:''),category:s.category||'',supplier:t.amount<0?payee(t.desc).split(' ').slice(0,4).join(' ').toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()):'',link:s.link||null,useLink:!!s.link,split:false,splits:[],rule:!s.rule&&!!payee(t.desc)&&s.src!=='regra'&&(s.kind==='empresa'||s.src==='histórico'),ruleText:payee(t.desc).split(' ').slice(0,3).join(' '),q:'',quick:false,src:s.src||''}}

/* --- dashboard --- */
function vDash(){
  const T=totals();
  let h=`<div class="head"><div><h1>Dashboard</h1><p class="sub">Visão geral de todas as obras em ${fdate(today())}</p></div><button class="btn primary" data-act="new-expense" data-w>${ic('plus')} NOVA DESPESA</button></div>`;
  if(!T.n)return h+emptyStart();
  h+=`<div class="strip"><div class="st-ink"><b>${T.n}</b><span>Obras cadastradas</span></div><div class="st-acc"><b>${T.running}</b><span>Em andamento</span></div><div class="st-pos"><b>${T.done}</b><span>Concluídas</span></div><div class="${T.late?'st-neg':'st-mut'}"><b>${T.late}</b><span>Atrasadas</span></div></div>`;
  const neg=T.profit<0,mneg=T.avgMargin!=null&&T.avgMargin<0;
  h+=`<div class="grid g3 kp">${kpi('Valor total contratado',money(T.contracted),'Obras aprovadas, em execução e concluídas','tone-info','doc')}${kpi('Total de despesas',money(T.expenses),'Sem estornos e exclusões','tone-neg','coin')}${kpi('Lucro bruto acumulado',money(T.profit),'Contratado menos custo. Não depende do que já foi recebido',`hl ${neg?'tone-neg':'tone-pos'}`,'build')}
   ${kpi('Total recebido',money(T.received),'Dinheiro que já entrou','tone-teal','down')}${kpi('Valores a receber',money(T.receivable),'Saldo dos contratos','tone-warn','cal')}${kpi('Margem de lucro média',pct(T.avgMargin),'Média das margens das obras contratadas',mneg?'tone-neg':'tone-pos','home')}</div>`;
  const al=T.ps.filter(x=>x.c.open&&(x.c.late||x.c.overCost));
  if(al.length)h+=`<div class="card"><h2>Precisa de atenção</h2><div class="list">${al.map(({p,c})=>`<a class="li" href="#obra-${p.id}"><div class="m"><div class="t">${esc(p.name)}</div><div class="d">${esc(p.code)}${c.overCost?` · custo ${money(c.costDev)} acima do previsto`:''}</div></div><div class="row">${flags(c)}</div></a>`).join('')}</div></div>`;
  h+=`<div class="grid g2"><div class="card"><h2>Despesas por categoria</h2><div class="chartbox"><canvas id="ch-cat"></canvas></div></div><div class="card"><h2>Evolução mensal das despesas</h2><div class="chartbox"><canvas id="ch-month"></canvas></div></div>
   <div class="card"><h2>Contratado e custo por obra</h2><div class="chartbox"><canvas id="ch-cmp"></canvas></div></div><div class="card"><h2>Gastos por obra</h2><div class="chartbox"><canvas id="ch-proj"></canvas></div></div>
   <div class="card"><h2>Rentabilidade de cada obra</h2><div class="chartbox"><canvas id="ch-rent"></canvas></div></div>
   <div class="card"><h2>Atividades recentes</h2>${activity(D.audit.slice().sort((a,b)=>b.ts-a.ts).slice(0,8),true)}</div></div>`;
  return h;
}
function activity(list,withProj){
  if(!list.length)return `<p class="muted small">Nenhum lançamento registrado ainda.</p>`;
  return `<div class="list">${list.map(a=>{const p=a.project_id&&proj(a.project_id);return `<div class="li"><div class="m"><div class="t" style="font-weight:500">${esc(a.text)}</div><div class="d">${fts(a.ts)}${withProj&&p?' · '+esc(p.name):''}${a.by?` · <span data-uid="${esc(a.by)}"></span>`:''}</div></div></div>`}).join('')}</div>`;
}
function drawCharts(){
  if(!window.Chart||!$('#ch-cat'))return;
  const css=k=>getComputedStyle(document.documentElement).getPropertyValue(k).trim();
  const A=css('--accent'),G='#C9CDD4',M=css('--muted'),POS=css('--pos'),NEG=css('--neg');
  Chart.defaults.font.family=css('--body');Chart.defaults.font.size=12;Chart.defaults.color=M;Chart.defaults.animation=false;
  const T=totals();
  const tip={callbacks:{label:c=>' '+(c.dataset.label?c.dataset.label+': ':'')+money(c.parsed.x!=null&&c.chart.options.indexAxis==='y'?c.parsed.x:c.parsed.y)}};
  const ax={grid:{color:'#F0F1F4'},border:{display:false},ticks:{callback:v=>v>=1000?(v/1000).toLocaleString('pt-BR')+' mil':v}};
  const nog={grid:{display:false},border:{display:false}};
  const mk=(id,cfg)=>charts.push(new Chart($(id),cfg));
  const cat={};for(const e of D.expenses)if(!e.deleted&&e.status!=='estornada')cat[e.category]=(cat[e.category]||0)+(+e.amount||0);
  const ce=Object.entries(cat).sort((a,b)=>b[1]-a[1]).slice(0,8);
  mk('#ch-cat',{type:'bar',data:{labels:ce.map(x=>x[0]),datasets:[{data:ce.map(x=>x[1]),backgroundColor:ce.map((_,i)=>CHART_COLORS[i%CHART_COLORS.length]),borderRadius:6,barThickness:14}]},options:{indexAxis:'y',maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:tip},scales:{x:ax,y:nog}}});
  const now=new Date(),ms=[];for(let i=11;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);ms.push(d.getFullYear()+'-'+pad(d.getMonth()+1))}
  const mv=ms.map(m=>sum(D.expenses.filter(e=>!e.deleted&&e.status!=='estornada'&&(e.date||'').startsWith(m)),e=>e.amount));
  mk('#ch-month',{type:'line',data:{labels:ms.map(m=>m.slice(5)+'/'+m.slice(2,4)),datasets:[{data:mv,borderColor:NEG,backgroundColor:'rgba(216,58,58,.10)',fill:true,tension:.3,pointRadius:mv.map((_,i)=>i===11?4:0),pointBackgroundColor:NEG,borderWidth:2}]},options:{maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:tip},scales:{y:{...ax,beginAtZero:true},x:nog}}});
  const ps=T.ps.filter(x=>x.c.counted||x.c.cost>0),lb=ps.map(x=>x.p.code),ttl={title:i=>ps[i[0].dataIndex].p.name};
  mk('#ch-cmp',{type:'bar',data:{labels:lb,datasets:[{label:'Contratado',data:ps.map(x=>x.c.contracted),backgroundColor:'#2F6FDE',borderRadius:5},{label:'Custo',data:ps.map(x=>x.c.cost),backgroundColor:NEG,borderRadius:5},{label:'Recebido',data:ps.map(x=>x.c.received),backgroundColor:POS,borderRadius:5}]},options:{maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:10,boxHeight:10}},tooltip:{callbacks:{...tip.callbacks,...ttl}}},scales:{y:{...ax,beginAtZero:true},x:nog}}});
  mk('#ch-proj',{type:'bar',data:{labels:lb,datasets:[{data:ps.map(x=>x.c.cost),backgroundColor:ps.map(x=>pcol(x.p).fg),borderColor:ps.map(x=>x.c.overCost?NEG:'transparent'),borderWidth:ps.map(x=>x.c.overCost?2:0),borderRadius:6,barThickness:14}]},options:{indexAxis:'y',maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{...tip.callbacks,...ttl}}},scales:{x:{...ax,beginAtZero:true},y:nog}}});
  const rs=ps.filter(x=>x.c.margin!=null);
  mk('#ch-rent',{type:'bar',data:{labels:rs.map(x=>x.p.code),datasets:[{data:rs.map(x=>+x.c.margin.toFixed(1)),backgroundColor:rs.map(x=>x.c.margin<0?NEG:POS),borderRadius:6}]},options:{maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{title:i=>rs[i[0].dataIndex].p.name,label:c=>` Margem: ${pct(c.parsed.y)} · Lucro: ${money(rs[c.dataIndex].c.profit)}`}}},scales:{y:{grid:{color:'#F0F1F4'},border:{display:false},ticks:{callback:v=>v+'%'}},x:nog}}});
}

/* --- obras --- */
function vObras(){
  const cnt=k=>D.projects.filter(p=>kindOf(p)===k).length;
  let h=`<div class="head"><div><h1>Minhas Obras</h1><p class="sub">${cnt('obra')} obras, ${cnt('servico')} serviços e ${cnt('venda')} vendas, incluindo as antigas</p></div><div class="row"><button class="btn dark" data-act="new-project" data-w>${ic('plus')} Nova obra</button><button class="btn" data-act="new-kind" data-id="servico" data-w>${ic('plus')} Serviço</button><button class="btn" data-act="new-kind" data-id="venda" data-w>${ic('plus')} Venda</button></div></div>
  <div class="chips kfilter">${[['','Todos'],['obra','Obras'],['servico','Serviços'],['venda','Vendas']].map(([k,l])=>`<button type="button" class="chip${PF.kind===k?' on':''}" data-act="pf-kind" data-id="${k}">${l}</button>`).join('')}</div>`;
  if(!D.projects.length)return h+emptyStart();
  h+=`<div class="row"><input type="search" id="pf-q" placeholder="Buscar por nome, código, cliente ou cidade" value="${esc(PF.q)}" style="flex:1;min-width:200px" data-pf="q"><select id="pf-status" data-pf="status" style="width:auto"><option value="">Todos os status</option>${Object.entries(STATUS).map(([k,v])=>`<option value="${k}"${PF.status===k?' selected':''}>${v}</option>`).join('')}</select></div>`;
  return h+`<div class="card tcard"><div class="scroll" id="plist">${projCards()}</div></div>`;
}
function projCards(){
  const q=PF.q.toLowerCase();
  const l=D.projects.filter(p=>(!PF.kind||kindOf(p)===PF.kind)&&(!PF.status||p.status===PF.status)&&(!q||[p.name,p.code,p.city,(cli(p.client_id)||{}).name].join(' ').toLowerCase().includes(q))).sort((a,b)=>(b.created_at||0)-(a.created_at||0));
  if(!l.length)return `<p class="muted" style="padding:12px 0">Nenhum cadastro encontrado com esse filtro.</p>`;
  return `<table class="stack tlist"><thead><tr><th>Cadastro</th><th>Situação</th><th class="r">Contratado</th><th class="r">Custo</th><th class="r">Lucro</th><th>Prazo</th><th class="r">Ações</th></tr></thead><tbody>${l.map(p=>{const c=calc(p),u=c.planned>0?Math.min(100,c.cost/c.planned*100):0,k=pcol(p),cl=cli(p.client_id);
    return `<tr><td class="tl-main"><a href="#obra-${p.id}" class="tl-name">${dot(p)}<span><small>${esc(p.code)}${cl?' · '+esc(cl.name):''}</small><b>${esc(p.name)}</b></span></a></td>
    <td><div class="chips">${kindOf(p)!=='obra'?`<span class="pill k-${kindOf(p)}">${KIND[kindOf(p)].n}</span>`:''}${statusPill(p)}${c.late?`<span class="pill bad">${days(c.delay)} de atraso</span>`:''}${c.overCost?'<span class="pill bad">Acima do custo</span>':''}</div></td>
    <td class="r">${money(c.contracted)}</td>
    <td class="r"><div class="cell"><div>${money(c.cost)}</div>${c.planned>0?`<div class="bar mini${c.overCost?' over':''}"><i style="width:${u}%;${c.overCost?'':'background:'+k.fg}"></i></div>`:''}</div></td>
    <td class="r"><div class="cell"><b class="${sgn(c.profit)}">${money(c.profit)}</b>${c.margin!=null?`<div class="small muted">${pct(c.margin)}</div>`:''}</div></td>
    <td class="tw">${c.done?`Concluída ${fdate(p.real_end)}`:p.planned_end?fdate(p.planned_end):'<span class="muted">Sem prazo</span>'}</td>
    <td class="r tl-act" data-w><button type="button" class="icb" data-act="edit-project" data-id="${p.id}" aria-label="Editar ${esc(p.name)}" title="Editar">${ic('edit')}</button><button type="button" class="icb danger" data-act="del-project" data-id="${p.id}" aria-label="Excluir ${esc(p.name)}" title="Excluir">${ic('trash')}</button></td></tr>`}).join('')}</tbody></table>`;
}
/* --- despesas (lançamentos) --- */
function expRows(list,showProj){
  if(!list.length)return `<p class="muted small" style="padding:8px 0">Nenhuma despesa encontrada.</p>`;
  return list.map(e=>{const p=proj(e.project_id),off=e.status==='estornada';return `<div class="li${off?' off':''}"><div class="m"><div class="t">${esc(e.description||e.category)}</div>
   <div class="d">${fdate(e.date)} · ${esc(e.category)}${e.supplier?' · '+esc(e.supplier):''}${e.payment?' · '+esc(e.payment):''}${showProj&&p?' · '+esc(p.code+' '+p.name):''}${off?' · <b>estornada</b>':''}</div>
   ${attChips(e.attachments)}</div><div class="rt"><div class="a">${money(e.amount)}</div>
   <div class="acts" data-w><button class="icb" data-act="edit-expense" data-id="${e.id}" title="Editar" aria-label="Editar">${ic('edit')}</button><button class="icb" data-act="reverse-expense" data-id="${e.id}" title="${off?'Desfazer estorno':'Estornar'}" aria-label="${off?'Desfazer estorno':'Estornar'}">${ic('undo')}</button><button class="icb" data-act="del-expense" data-id="${e.id}" title="Excluir" aria-label="Excluir">${ic('trash')}</button></div></div></div>`}).join('');
}
function attChips(a){
  if(!a||!a.length)return '';
  return `<div class="chips">${a.map(x=>`<button type="button" class="chip" data-act="att" data-id="${esc(x.id)}" data-type="${esc(x.type||'')}">${ic('clip')}${esc(x.kind==='nf'?'NF: ':'')}${esc(x.name||'anexo')}</button>`).join('')}</div>`;
}
function filteredExp(){
  const q=F.q.toLowerCase();
  return D.expenses.filter(e=>!e.deleted&&(!F.project||e.project_id===F.project)&&(!F.cat||e.category===F.cat)&&(!F.supplier||e.supplier===F.supplier)&&(!F.from||e.date>=F.from)&&(!F.to||e.date<=F.to)&&(!q||[e.description,e.supplier,e.category,e.notes,e.responsible].join(' ').toLowerCase().includes(q))).sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.created_at||0)-(a.created_at||0));
}
const suppliers=()=>[...new Set(D.expenses.filter(e=>!e.deleted&&e.supplier).map(e=>e.supplier))].sort((a,b)=>a.localeCompare(b));
function vDespesas(){
  let h=`<div class="head"><div><h1>Lançar Despesa</h1><p class="sub">Toda despesa pertence a uma única obra</p></div><button class="btn primary" data-act="new-expense" data-w style="padding:12px 20px">${ic('plus')} NOVA DESPESA</button></div>`;
  if(!D.projects.length)return h+emptyStart();
  const o=(v,l,s)=>`<option value="${esc(v)}"${s===v?' selected':''}>${esc(l)}</option>`;
  h+=`<div class="card"><div class="filters${FOPEN?' open':''}"><input class="q" type="search" id="f-q" data-f="q" placeholder="Pesquisar descrição, fornecedor, observações" value="${esc(F.q)}"><button type="button" class="btn ftog" data-act="ftog">Filtros${(n=>n?' ('+n+')':'')(['project','cat','supplier','from','to'].filter(k=>F[k]).length)}</button>
   <select id="f-project" data-f="project">${o('','Todas as obras',F.project)}${D.projects.map(p=>o(p.id,p.code+' '+p.name,F.project)).join('')}</select>
   <select id="f-cat" data-f="cat">${o('','Todas as categorias',F.cat)}${allCats().map(c=>o(c,c,F.cat)).join('')}</select>
   <select id="f-supplier" data-f="supplier">${o('','Todos os fornecedores',F.supplier)}${suppliers().map(c=>o(c,c,F.supplier)).join('')}</select>
   <label class="f fd" for="f-from"><span>De</span><input type="date" id="f-from" data-f="from" value="${F.from}"></label><label class="f fd" for="f-to"><span>Até</span><input type="date" id="f-to" data-f="to" value="${F.to}"></label></div>
   <div id="elist" style="margin-top:14px">${expBlock()}</div></div>`;
  return h;
}
function expBlock(){
  const l=filteredExp(),tot=sum(l.filter(e=>e.status!=='estornada'),e=>e.amount);
  return `<div class="row" style="justify-content:space-between"><span class="ink2 small">${l.length} ${l.length===1?'lançamento':'lançamentos'}</span><span>Total gasto: <b class="num">${money(tot)}</b></span></div><div class="list">${expRows(l.slice(0,300),true)}</div>${l.length>300?'<p class="muted small">Mostrando os 300 mais recentes. Use os filtros para refinar.</p>':''}`;
}

/* --- cronograma --- */
function tlRange(ps){
  const pts=[];for(const p of ps){[p.planned_start,p.planned_end,p.real_start,p.real_end].forEach(d=>d&&pts.push(dnum(d)));if(p.real_start&&!p.real_end)pts.push(dnum(today()))}
  if(!pts.length)return null;const min=Math.min(...pts),max=Math.max(...pts)+1;return {min,span:Math.max(1,max-min)};
}
function tl(p,R,axis){
  const c=calc(p);R=R||tlRange([p]);
  if(!R)return `<p class="muted small">Informe as datas previstas para ver a linha do tempo.</p>`;
  const seg=(a,b,cls='')=>{const l=(dnum(a)-R.min)/R.span*100,w=(dnum(b)+1-dnum(a))/R.span*100;return `<i class="${cls}" style="left:${l.toFixed(2)}%;width:${Math.max(.6,w).toFixed(2)}%"></i>`};
  const t=today(),end=p.real_end||t;
  const tm=dnum(t)>=R.min&&dnum(t)<=R.min+R.span?`<span class="mark" style="left:${((dnum(t)+.5-R.min)/R.span*100).toFixed(2)}%" title="Hoje"></span>`:'';
  return `<div class="tl"><div class="lane plan" title="Previsto">${p.planned_start&&p.planned_end?seg(p.planned_start,p.planned_end):''}${tm}</div>
   <div class="lane real" title="Realizado">${p.real_start?seg(p.real_start,end,c.done?'done':''):''}${c.pauses.map(z=>seg(z.start,(z.end&&z.end<end?z.end:end),'pz')).join('')}</div>
   ${axis===false?'':`<div class="ax"><span>${fdate(isoOf(R.min))}</span><span>${fdate(isoOf(R.min+R.span-1))}</span></div>`}</div>`;
}
const tlLegend=`<div class="legend"><span><i style="background:#C5C9D1"></i>Previsto</span><span><i style="background:var(--accent)"></i>Realizado</span><span><i style="background:var(--neg)"></i>Paralisação</span><span><i style="background:var(--pos)"></i>Concluída</span><span><i style="background:var(--ink);width:2px;height:12px;border-radius:2px"></i>Hoje</span></div>`;
function vCrono(){
  let h=`<div class="head"><div><h1>Cronograma</h1><p class="sub">Prazos previstos e realizados de todas as obras</p></div></div>`;
  const ps=D.projects.filter(p=>p.status!=='cancelada'&&(p.planned_start||p.real_start)).sort((a,b)=>(a.planned_start||a.real_start).localeCompare(b.planned_start||b.real_start));
  if(!ps.length)return h+(D.projects.length?`<div class="card empty"><b>Nenhuma obra com datas</b><span>Informe as datas previstas no cadastro da obra para montar o cronograma.</span></div>`:emptyStart());
  const R=tlRange(ps);
  h+=`<div class="card gantt">${tlLegend}<div class="ax" style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin:10px 0 0"><span></span><span>${fdate(isoOf(R.min))} até ${fdate(isoOf(R.min+R.span-1))}</span></div>
   ${ps.map(p=>{const c=calc(p);return `<div class="gr"><a href="#obra-${p.id}"><div class="t" style="font-weight:600">${dot(p)}${esc(p.name)}</div><div class="small muted">${esc(p.code)} · ${c.progress}% executado</div><div class="row" style="margin-top:5px">${statusPill(p)}${c.late?`<span class="pill bad">${days(c.delay)} de atraso</span>`:''}</div></a>${tl(p,R,false)}</div>`}).join('')}</div>`;
  h+=`<div class="card"><h2>Prazos por obra</h2><div class="scroll"><table class="stack"><thead><tr><th>Obra</th><th>Início previsto</th><th>Conclusão prevista</th><th>Início real</th><th>Conclusão real</th><th class="r">Duração prevista</th><th class="r">Duração real</th><th class="r">Paralisação</th><th class="r">Atraso</th><th class="r">Restam</th></tr></thead><tbody>
   ${ps.map(p=>{const c=calc(p);return `<tr><td><a href="#obra-${p.id}"><b>${esc(p.code)}</b></a></td><td>${fdate(p.planned_start)}</td><td>${fdate(p.planned_end)}</td><td>${fdate(p.real_start)}</td><td>${fdate(p.real_end)}</td><td class="r">${days(c.plannedDur)}</td><td class="r">${days(c.realDur)}</td><td class="r">${days(c.pauseDays)}</td><td class="r ${c.delay?'neg':''}">${days(c.delay)}</td><td class="r">${days(c.remaining)}</td></tr>`}).join('')}</tbody></table></div></div>`;
  return h;
}

/* --- relatórios --- */
function vRel(){
  let h=`<div class="head"><div><h1>Relatórios</h1><p class="sub">Resultado econômico e fluxo financeiro por obra</p></div><button class="btn" data-act="xlsx-all">${ic('down')} Exportar tudo em Excel</button></div>`;
  if(!D.projects.length)return h+emptyStart();
  const T=totals();
  h+=`<div class="card"><h2>Consolidado por obra</h2><div class="scroll"><table class="stack"><thead><tr><th>Obra</th><th>Status</th><th class="r">Contratado</th><th class="r">Custo</th><th class="r">Lucro bruto</th><th class="r">Margem</th><th class="r">Recebido</th><th class="r">A receber</th><th>Exportar</th></tr></thead><tbody>
   ${T.ps.map(({p,c})=>`<tr><td><a href="#obra-${p.id}"><b>${esc(p.code)}</b> ${esc(p.name.length>34?p.name.slice(0,34)+'…':p.name)}</a></td><td>${statusPill(p)}</td><td class="r">${money(c.contracted)}</td><td class="r">${money(c.cost)}</td><td class="r ${sgn(c.profit)}">${money(c.profit)}</td><td class="r">${pct(c.margin)}</td><td class="r">${money(c.received)}</td><td class="r">${money(c.receivable)}</td><td><button class="btn" data-act="pdf" data-id="${p.id}">PDF</button> <button class="btn" data-act="xlsx" data-id="${p.id}">Excel</button>${c.done?` <button class="btn" data-act="termo" data-id="${p.id}">Termo</button>`:''}</td></tr>`).join('')}
   <tr><td colspan="2"><b>Total das obras contratadas</b></td><td class="r"><b>${money(T.contracted)}</b></td><td class="r"><b>${money(sum(T.k,x=>x.c.cost))}</b></td><td class="r"><b>${money(T.profit)}</b></td><td class="r"><b>${pct(T.contracted>0?T.profit/T.contracted*100:null)}</b></td><td class="r"><b>${money(sum(T.k,x=>x.c.received))}</b></td><td class="r"><b>${money(T.receivable)}</b></td><td></td></tr></tbody></table></div>
   <p class="small muted" style="margin-top:10px">Orçamentos e obras aguardando aprovação não entram no total contratado. Em contrato cancelado, vale como contratado apenas o valor efetivamente recebido.</p></div>`;
  return h;
}

/* --- configurações --- */
function vConf(){
  const custom=(D.settings.categories||[]).filter(c=>!CATS.includes(c));
  return `<div class="head"><div><h1>Configurações</h1></div></div>
  <div class="grid g2">
   <div class="card"><h2>Empresa</h2><form data-form="company" class="form">${fld('Nome da empresa','company',D.settings.company,{full:true})}${fld('CNPJ ou CPF','company_doc',D.settings.company_doc)}${fld('Telefone','company_phone',D.settings.company_phone,{type:'tel'})}${fld('Endereço','company_address',D.settings.company_address,{full:true})}${fld('Responsável técnico','company_resp',D.settings.company_resp,{full:true,ph:'Nome e registro profissional, ex.: CREA'})}<div class="full row" style="justify-content:space-between"><p class="small muted">Aparece nos relatórios, no termo de conclusão e na página do cliente.</p><button class="btn dark" data-w>Salvar</button></div></form></div>
   <div class="card"><h2>Aplicativo</h2><p class="ink2 small" style="margin-bottom:12px">${standalone()?'Você está usando o aplicativo instalado.':'Instale o OBRA CONTROL no celular ou no computador. Ele abre em tela própria, com ícone, e usa a mesma conta e os mesmos dados.'}</p>${standalone()?'':`<button class="btn dark" data-act="install">${ic('down')} Instalar aplicativo</button>`}</div>
   <div class="card"><h2>Demonstração</h2><p class="ink2 small" style="margin-bottom:12px">Carrega obras fictícias para conhecer o aplicativo. Os dados de demonstração ficam só na tela, nunca se misturam com os seus e somem ao sair.</p>${isDemo()?`<button class="btn" data-act="demo-off">Sair da demonstração</button>`:`<button class="btn" data-act="demo-on">Abrir modo demonstração</button>`}</div>
   <div class="card"><h2>Financeiro da empresa</h2><p class="small muted" style="margin-bottom:10px">Centros e categorias para os custos que não pertencem a uma obra, serviço ou venda.</p>
    <h3 style="margin-bottom:8px">Centros</h3><div class="chips" style="margin-bottom:10px">${centers().map(c=>`<span class="pill s-aprovada">${esc(c)} <button class="icb" style="padding:0" data-act="del-center" data-id="${esc(c)}" data-w aria-label="Remover ${esc(c)}">${ic('x')}</button></span>`).join('')}</div>
    <form data-form="center" class="row" data-w style="margin-bottom:16px"><input type="text" name="v" id="new-center" placeholder="Novo centro" maxlength="40" style="flex:1;min-width:140px"><button class="btn">Adicionar</button></form>
    <h3 style="margin-bottom:8px">Categorias de custo fixo</h3><div class="chips" style="margin-bottom:10px">${companyCats().map(c=>`<span class="pill">${esc(c)} <button class="icb" style="padding:0" data-act="del-ccat" data-id="${esc(c)}" data-w aria-label="Remover ${esc(c)}">${ic('x')}</button></span>`).join('')}</div>
    <form data-form="ccat" class="row" data-w><input type="text" name="v" id="new-ccat" placeholder="Nova categoria" maxlength="40" style="flex:1;min-width:140px"><button class="btn">Adicionar</button></form></div>
   <div class="card"><h2>Categorias de despesa</h2><div class="chips" style="margin-bottom:12px">${CATS.map(c=>`<span class="pill">${esc(c)}</span>`).join('')}${custom.map(c=>`<span class="pill s-andamento">${esc(c)} <button class="icb" style="padding:0" data-act="del-cat" data-id="${esc(c)}" data-w aria-label="Remover ${esc(c)}">${ic('x')}</button></span>`).join('')}</div>
    <form data-form="cat" class="row" data-w><input type="text" id="newcat" name="cat" placeholder="Nova categoria" style="flex:1;min-width:160px" maxlength="40"><button class="btn dark">Adicionar</button></form></div>
   <div class="card"><h2>Clientes</h2><p class="small ink2" style="margin-bottom:12px">${D.clients.length} ${D.clients.length===1?'cliente cadastrado':'clientes cadastrados'}. O cadastro completo, com consulta automática de CNPJ, CPF e CEP, fica na aba Clientes.</p><a class="btn" href="#clientes">${ic('user')} Abrir Clientes</a></div>
   <div class="card" style="grid-column:1/-1"><h2>Sobre os dados</h2><p class="ink2 small">Os registros ficam gravados no banco de dados da sua conta e aparecem iguais no computador e no celular: basta entrar com o mesmo e-mail e senha. Cada conta enxerga apenas os próprios dados. Exclusões e edições ficam registradas no histórico de cada obra.</p>${me?`<p style="margin-top:12px"><b>${esc(me.name||'')}</b> <span class="muted">${esc(me.email||'')}</span></p><button class="btn" style="margin-top:10px" data-act="logout">Sair da conta</button>`:''}</div>
  </div>`;
}

/* --- página da obra --- */
function vObra(id){
  const p=proj(id);
  if(!p)return `<div class="card empty"><b>Obra não encontrada</b><a class="btn" href="#obras">Voltar para Minhas Obras</a></div>`;
  if(lastObra!==id){lastObra=id;tab='resumo'}
  const c=calc(p),cl=cli(p.client_id)||{};
  const TABS=[['resumo','Resumo'],['despesas','Despesas'],['recebimentos','Recebimentos'],['cronograma','Cronograma'],['relatorios','Relatórios'],['historico','Histórico']];
  let h=`<div class="head"><div><a href="#obras" class="small muted">‹ Minhas Obras</a><h1>${esc(p.name)}</h1><div class="row" style="margin-top:8px"><span class="small muted">${dot(p)}${esc(p.code)}</span>${statusPill(p)}${flags(c)}</div></div>
   <div class="row">${c.done?`<button class="btn" data-act="reopen" data-id="${p.id}" data-w>Reabrir obra</button>`:`<select id="st-sel" data-status="${p.id}" style="width:auto" aria-label="Status da obra" data-w>${Object.entries(STATUS).map(([k,v])=>`<option value="${k}"${p.status===k?' selected':''}>${v}</option>`).join('')}</select>`}
   <button class="btn" data-act="share" data-id="${p.id}">${p.share_token?'Link do cliente':'Enviar ao cliente'}</button><a class="btn ghost" href="#cliente-${p.id}">Prévia</a><button class="btn ghost danger" data-act="del-project" data-id="${p.id}" data-w aria-label="Excluir" title="Excluir">${ic('trash')}</button><button class="btn" data-act="edit-project" data-id="${p.id}" data-w>${ic('edit')} Editar</button><button class="btn primary" data-act="new-expense" data-id="${p.id}" data-w>${ic('plus')} NOVA DESPESA</button>${c.open?`<button class="btn dark" data-act="finalize" data-id="${p.id}" data-w>FINALIZAR OBRA</button>`:''}</div></div>
   <div class="tabs" role="tablist">${TABS.map(([k,l])=>`<button role="tab" aria-selected="${tab===k}" class="${tab===k?'on':''}" data-act="tab" data-id="${k}">${l}</button>`).join('')}</div>`;
  if(tab==='resumo'){
    h+=`<div class="grid g4">${kpi('Valor contratado',money(c.contracted),c.canceled?'Cancelada: vale o que foi recebido':'')}${kpi('Custo acumulado',money(c.cost),c.planned?`Previsto ${money(c.planned)}`:'Sem custo previsto')}${kpi('Lucro atual',`<span class="${c.profit<0?'neg':''}">${money(c.profit)}</span>`,'Margem '+pct(c.margin),'hl')}${kpi('Prazo',p.planned_end?fdate(p.planned_end):'—',c.done?`Concluída em ${fdate(p.real_end)}`:c.late?`<span class="neg">${days(c.delay)} de atraso</span>`:c.remaining!=null?`Restam ${days(c.remaining)}`:'')}</div>
    <div class="grid g2"><div class="card"><h2>Resultado econômico</h2><div class="dl"><div><span>Valor contratado</span><b class="num">${money(c.contracted)}</b></div><div><span>Custo total</span><b class="num">${money(c.cost)}</b></div><div><span>Lucro bruto</span><b class="num ${sgn(c.profit)}">${money(c.profit)}</b></div><div><span>Margem de lucro</span><b>${pct(c.margin)}</b></div><div><span>Lucro previsto</span><b class="num">${c.planned?money((+p.contract_value||0)-c.planned):'—'}</b></div><div><span>Desvio de custo</span><b class="num ${c.costDev>0?'neg':''}">${c.costDev==null?'—':(c.costDev>0?'+':'')+money(c.costDev)}</b></div></div></div>
    <div class="card"><h2>Fluxo financeiro</h2><div class="dl"><div><span>Total recebido</span><b class="num">${money(c.received)}</b></div><div><span>Saldo a receber</span><b class="num">${money(c.receivable)}</b></div><div><span>Percentual recebido</span><b>${pct(c.pctReceived)}</b></div><div><span>Caixa da obra (recebido menos gasto)</span><b class="num ${sgn(c.received-c.cost)}">${money(c.received-c.cost)}</b></div></div><p class="small muted" style="margin-top:12px">O lucro vem do contrato menos o custo. O dinheiro recebido mostra apenas o caixa.</p></div>
    <div class="card"><h2>Cliente e obra</h2><div class="dl"><div><span>Cliente</span><b>${esc(cl.name||'—')}</b></div><div><span>CPF/CNPJ</span><b>${esc(cl.doc||'—')}</b></div><div><span>Telefone / WhatsApp</span><b>${esc([cl.phone,cl.whatsapp].filter(Boolean).join(' / ')||'—')}</b></div><div><span>E-mail</span><b>${esc(cl.email||'—')}</b></div><div style="grid-column:1/-1"><span>Endereço</span><b>${esc([p.address,p.city,p.state].filter(Boolean).join(', ')||'—')}</b></div><div><span>Responsável</span><b>${esc(p.responsible||'—')}</b></div><div><span>Data do contrato</span><b>${fdate(p.contract_date)}</b></div><div style="grid-column:1/-1"><span>Descrição dos serviços</span><b style="font-weight:500">${esc(p.description||'—')}</b></div></div></div>
    <div class="card"><div class="row" style="justify-content:space-between;margin-bottom:8px"><h2>Documentos da obra</h2>${assets&&!isDemo()?`<label class="btn" data-w>${ic('clip')} Anexar<input type="file" id="docup" data-docup="${p.id}" multiple hidden accept="image/*,application/pdf"></label>`:''}</div>
     ${docsList(p)}${!assets||isDemo()?'<p class="small muted">O envio de anexos ainda não está disponível nesta versão.</p>':''}</div></div>`;
  }
  if(tab==='despesas'){
    const l=c.exps.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
    const cats=Object.entries(c.byCat).sort((a,b)=>b[1]-a[1]);
    h+=`<div class="grid g21"><div class="card"><div class="row" style="justify-content:space-between"><h2>Despesas lançadas</h2><span>Total gasto: <b class="num">${money(c.cost)}</b></span></div><div class="list" style="margin-top:8px">${expRows(l,false)}</div></div>
     <div class="card"><h2>Por categoria</h2>${cats.length?`<div class="list">${cats.map(([k,v])=>`<div class="li"><div class="m"><div class="t" style="font-weight:500">${esc(k)}</div><div class="bar" style="margin-top:6px"><i style="width:${(v/c.cost*100).toFixed(1)}%"></i></div></div><div class="a" style="font-size:13.5px">${money(v)}</div></div>`).join('')}</div>`:'<p class="muted small">Sem despesas.</p>'}
     <h2 style="margin:18px 0 8px">Fornecedores</h2>${(()=>{const s={};c.active.forEach(e=>{if(e.supplier)s[e.supplier]=(s[e.supplier]||0)+(+e.amount||0)});const a=Object.entries(s).sort((x,y)=>y[1]-x[1]);return a.length?`<div class="list">${a.map(([k,v])=>`<div class="li"><div class="m"><div class="t" style="font-weight:500">${esc(k)}</div></div><div class="a" style="font-size:13.5px">${money(v)}</div></div>`).join('')}</div>`:'<p class="muted small">Nenhum fornecedor informado.</p>'})()}</div></div>`;
  }
  if(tab==='recebimentos'){
    const l=c.recs.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
    h+=`<div class="grid g4">${kpi('Total contratado',money(c.contracted))}${kpi('Total recebido',money(c.received))}${kpi('Saldo a receber',money(c.receivable))}${kpi('Percentual recebido',pct(c.pctReceived))}</div>
    ${c.received>c.contracted&&!c.canceled?`<div class="banner warn">O total recebido passa do valor contratado em ${money(c.received-c.contracted)}. Confira os lançamentos ou atualize o valor do contrato.</div>`:''}
    <div class="card"><div class="row" style="justify-content:space-between"><h2>Histórico de pagamentos</h2><button class="btn dark" data-act="new-receipt" data-id="${p.id}" data-w>${ic('plus')} Registrar recebimento</button></div>
    <div class="bar" style="margin:14px 0 4px"><i style="width:${Math.min(100,c.pctReceived||0)}%;background:var(--pos)"></i></div>
    <div class="list">${l.length?l.map(r=>`<div class="li"><div class="m"><div class="t">${esc(r.description||'Recebimento')}</div><div class="d">${fdate(r.date)}${r.method?' · '+esc(r.method):''}</div></div><div class="rt"><div class="a pos">${money(r.amount)}</div><div class="acts" data-w><button class="icb" data-act="edit-receipt" data-id="${r.id}" aria-label="Editar">${ic('edit')}</button><button class="icb" data-act="del-receipt" data-id="${r.id}" aria-label="Excluir">${ic('trash')}</button></div></div></div>`).join(''):'<p class="muted small" style="padding:8px 0">Nenhum recebimento registrado. Pagamentos parciais podem ser lançados um a um.</p>'}</div></div>`;
  }
  if(tab==='cronograma'){
    const openPause=c.pauses.find(z=>!z.end);
    const steps=[];
    if(p.planned_start)steps.push([p.planned_start,'Início previsto','']);
    if(p.real_start)steps.push([p.real_start,'Início real da execução','ok']);
    c.pauses.forEach(z=>{steps.push([z.start,'Paralisação: '+(z.reason||'motivo não informado'),'pz',z.id]);if(z.end)steps.push([z.end,'Retomada da execução','ok'])});
    c.notes.forEach(n=>steps.push([n.date,n.text,'',n.id]));
    if(p.planned_end)steps.push([p.planned_end,'Conclusão prevista','']);
    if(p.real_end)steps.push([p.real_end,'Conclusão real','ok']);
    steps.sort((a,b)=>a[0].localeCompare(b[0]));
    h+=`<div class="grid g4">${kpi('Duração prevista',days(c.plannedDur))}${kpi('Duração real',days(c.realDur),c.execDays!=null?`${days(c.execDays)} de execução`:'')}${kpi('Dias de atraso',`<span class="${c.delay?'neg':''}">${days(c.delay)}</span>`,c.remaining!=null&&!c.late?`Restam ${days(c.remaining)}`:c.timeDev!=null?`Desvio de prazo ${c.timeDev>0?'+':''}${days(c.timeDev)}`:'')}${kpi('Dias de paralisação',days(c.pauseDays))}</div>
    <div class="card"><div class="row" style="justify-content:space-between;margin-bottom:6px"><h2>Andamento ao longo do tempo</h2>${chartLegend}</div>${progressChart(buildCV(p))}</div>
    <div class="card"><div class="row" style="justify-content:space-between;margin-bottom:14px"><h2>Linha do tempo</h2>${tlLegend}</div>${tl(p)}
     <div style="margin-top:20px"><label class="f" for="prog">Percentual de execução: <span id="progv">${c.progress}%</span></label><input type="range" id="prog" min="0" max="100" step="5" value="${c.progress}" data-progress="${p.id}" ${c.done||!canWrite&&!isDemo()?'disabled':''} style="width:100%;accent-color:var(--accent)"></div></div>
    <div class="card"><div class="row" style="justify-content:space-between;margin-bottom:14px"><h2>Eventos da execução</h2><div class="row" data-w>${c.open?(openPause?`<button class="btn" data-act="resume" data-id="${openPause.id}">Registrar retomada</button>`:`<button class="btn" data-act="new-pause" data-id="${p.id}">Registrar paralisação</button>`):''}<button class="btn dark" data-act="new-event" data-id="${p.id}">${ic('plus')} Evento ou observação</button></div></div>
     ${steps.length?`<div class="steps">${steps.map(s=>`<div class="st ${s[2]}"><div class="dt">${fdate(s[0])}</div><div>${esc(s[1])}${s[3]?` <button class="icb" style="padding:2px;vertical-align:middle" data-act="del-event" data-id="${s[3]}" data-w aria-label="Excluir evento">${ic('x')}</button>`:''}</div></div>`).join('')}</div>`:'<p class="muted small">Nenhum evento registrado.</p>'}</div>`;
  }
  if(tab==='relatorios'){
    h+=`<div class="card"><div class="row" style="justify-content:space-between;margin-bottom:14px"><h2>Relatório financeiro</h2><div class="row">${c.done?`<button class="btn dark" data-act="termo" data-id="${p.id}">${ic('doc')} Termo de conclusão</button>`:''}<button class="btn primary" data-act="pdf" data-id="${p.id}">${ic('down')} Exportar PDF</button><button class="btn" data-act="xlsx" data-id="${p.id}">${ic('down')} Exportar Excel</button></div></div>
     <div class="scroll"><table><tbody><tr><td>Valor total contratado</td><td class="r"><b>${money(c.contracted)}</b></td></tr>${GROUPS.map(g=>`<tr><td>Total de ${g==='Outras despesas'?'outras despesas':g.toLowerCase()}</td><td class="r">${money(c.byGroup[g])}</td></tr>`).join('')}
     <tr><td><b>Custo total da obra</b></td><td class="r"><b>${money(c.cost)}</b></td></tr><tr><td><b>Lucro bruto</b></td><td class="r ${sgn(c.profit)}"><b>${money(c.profit)}</b></td></tr><tr><td>Margem de lucro</td><td class="r">${pct(c.margin)}</td></tr><tr><td>Desvio de custo (realizado menos previsto)</td><td class="r">${c.costDev==null?'—':money(c.costDev)}</td></tr><tr><td>Total recebido</td><td class="r">${money(c.received)}</td></tr><tr><td>Saldo a receber</td><td class="r">${money(c.receivable)}</td></tr></tbody></table></div></div>
    <div class="card"><h2>Relatório operacional</h2><div class="scroll"><table><tbody><tr><td>Prazo previsto</td><td class="r">${fdate(p.planned_start)} a ${fdate(p.planned_end)} (${days(c.plannedDur)})</td></tr><tr><td>Prazo realizado</td><td class="r">${fdate(p.real_start)} a ${p.real_end?fdate(p.real_end):'em aberto'} (${days(c.realDur)})</td></tr><tr><td>Dias de execução</td><td class="r">${days(c.execDays)}</td></tr><tr><td>Dias de paralisação</td><td class="r">${days(c.pauseDays)}</td></tr><tr><td>Dias de atraso</td><td class="r">${days(c.delay)}</td></tr><tr><td>Desvio de prazo (realizado menos previsto)</td><td class="r">${c.timeDev==null?'—':days(c.timeDev)}</td></tr><tr><td>Percentual de execução</td><td class="r">${c.progress}%</td></tr></tbody></table></div></div>`;
  }
  if(tab==='historico'){
    h+=`<div class="card"><h2>Histórico de alterações</h2>${activity(D.audit.filter(a=>a.project_id===p.id).sort((a,b)=>b.ts-a.ts),false)}</div>`;
  }
  return h;
}
function buildCV(p){
  const cl=cli(p.client_id)||{},st=D.settings||{};
  return {project:{...p},client:{name:cl.name||'',doc:cl.doc||''},company:{name:st.company||'',doc:st.company_doc||'',address:st.company_address||'',phone:st.company_phone||'',responsible:st.company_resp||''},
    events:D.events.filter(e=>e.project_id===p.id).map(e=>({type:e.type,date:e.date,start:e.start,end:e.end,reason:e.reason,text:e.text}))};
}
function cvCalc(v){
  const p=v.project||{},t=today(),done=p.status==='concluida',canceled=p.status==='cancelada',open=!done&&!canceled;
  const start=p.real_start||'',endRef=p.real_end||t;
  const pauses=(v.events||[]).filter(e=>e.type==='pause'&&e.start).sort((a,b)=>a.start.localeCompare(b.start));
  const notes=(v.events||[]).filter(e=>e.type!=='pause'&&e.date);
  const pauseDays=sum(pauses,z=>{const e=z.end&&z.end<endRef?z.end:endRef;return Math.max(0,ddiff(e,z.start))});
  const plannedDur=p.planned_start&&p.planned_end?ddiff(p.planned_end,p.planned_start)+1:null;
  const realDur=start?Math.max(0,ddiff(endRef,start)+1):null;
  let delay=0;if(p.planned_end){if(p.real_end)delay=Math.max(0,ddiff(p.real_end,p.planned_end));else if(open&&start)delay=Math.max(0,ddiff(t,p.planned_end))}
  const remaining=open&&p.planned_end?Math.max(0,ddiff(p.planned_end,t)):null;
  // prazo decorrido: do início real até o prazo final (conclusão prevista)
  let timePct=null,totalDays=null,elapsed=null;
  if(start&&p.planned_end&&p.planned_end>=start){totalDays=ddiff(p.planned_end,start)+1;elapsed=Math.max(0,Math.min(ddiff(endRef,start)+1,9999));timePct=elapsed/totalDays*100}
  const progress=done?100:Math.min(100,Math.max(0,Number(p.progress)||0));
  return {p,done,canceled,open,start,endRef,pauses,notes,pauseDays,plannedDur,realDur,delay,late:open&&delay>0,remaining,timePct,totalDays,elapsed,progress};
}
const chartLegend=`<div class="legend"><span><i style="background:#9AA0A9"></i>Prazo decorrido</span><span><i style="background:var(--accent)"></i>Execução informada</span><span><i style="background:#F6C9C9"></i>Paralisação</span><span><i style="background:var(--ink);width:2px;height:12px;border-radius:2px"></i>Hoje</span></div>`;
function progressChart(v){
  const c=cvCalc(v),p=c.p,t=today();
  const s0=c.start||p.planned_start;
  if(!s0||!p.planned_end)return `<p class="muted small">Informe a data de início e o prazo final para ver o gráfico.</p>`;
  const x0=dnum(s0),x1=Math.max(dnum(p.planned_end),dnum(c.endRef),x0+1)+1;
  const nar=innerWidth<640,W=nar?400:720,H=nar?290:270,L=nar?36:44,R=nar?10:16,T=22,B=38,iw=W-L-R,ih=H-T-B,fs=nar?12:11;
  const X=d=>L+(dnum(d)-x0)/(x1-x0)*iw, Xn=n=>L+(n-x0)/(x1-x0)*iw, Y=v=>T+ih-(Math.max(0,Math.min(100,v))/100)*ih;
  let g='';
  for(const v of [0,25,50,75,100])g+=`<line x1="${L}" x2="${W-R}" y1="${Y(v)}" y2="${Y(v)}" stroke="#ECEEF1"/><text x="${L-8}" y="${Y(v)+4}" text-anchor="end" font-size="${fs}" fill="#8A8F98">${v}%</text>`;
  for(const z of c.pauses){const e=z.end||c.endRef;if(e<s0)continue;const a=Math.max(L,X(z.start)),b=Math.min(W-R,X(e)+iw/(x1-x0));g+=`<rect x="${a}" y="${T}" width="${Math.max(2,b-a)}" height="${ih}" fill="#FBE3E3"><title>Paralisação ${fdate(z.start)}${z.end?' a '+fdate(z.end):' (em aberto)'}: ${esc(z.reason||'')}</title></rect>`}
  // prazo decorrido (linear do início real ao prazo final)
  if(c.start){const xe=X(p.planned_end)+iw/(x1-x0);g+=`<line x1="${X(c.start)}" y1="${Y(0)}" x2="${xe}" y2="${Y(100)}" stroke="#9AA0A9" stroke-width="2" stroke-dasharray="6 5"/>`}
  // execução informada
  let pts=(p.progress_log||[]).filter(x=>x&&x.d).map(x=>[x.d,Math.max(0,Math.min(100,+x.v||0))]).sort((a,b)=>a[0].localeCompare(b[0]));
  if(c.start){if(!pts.length||pts[0][0]>c.start)pts.unshift([c.start,0])}
  if(c.done&&p.real_end&&(!pts.length||pts[pts.length-1][1]<100))pts.push([p.real_end,100]);
  if(!c.done&&c.start&&c.progress>0&&(!pts.length||pts[pts.length-1][1]!==c.progress))pts.push([t,c.progress]);
  pts=pts.filter(x=>x[0]>=s0);
  if(pts.length){
    const last=pts[pts.length-1],endX=c.done?X(last[0]):Math.max(X(last[0]),X(t));
    let d=`M${X(pts[0][0])},${Y(pts[0][1])}`;for(let i=1;i<pts.length;i++)d+=` L${X(pts[i][0])},${Y(pts[i][1])}`;d+=` L${endX},${Y(last[1])}`;
    g+=`<path d="${d} L${endX},${Y(0)} L${X(pts[0][0])},${Y(0)} Z" fill="rgba(241,86,35,.10)"/><path d="${d}" fill="none" stroke="#F15623" stroke-width="2.5" stroke-linejoin="round"/>`;
    for(const q of pts.slice(1))g+=`<circle cx="${X(q[0])}" cy="${Y(q[1])}" r="3.5" fill="#fff" stroke="#F15623" stroke-width="2"><title>${fdate(q[0])}: ${q[1]}% executado</title></circle>`;
    g+=`<circle cx="${endX}" cy="${Y(last[1])}" r="5" fill="#F15623"/><text x="${Math.min(endX+8,W-R-34)}" y="${Y(last[1])-10}" font-size="${fs+1}" font-weight="700" fill="#202124">${last[1]}%</text>`;
  }
  // marcos
  const xd=Math.min(X(p.planned_end)+iw/(x1-x0),W-R);
  g+=`<line x1="${xd}" x2="${xd}" y1="${T}" y2="${T+ih}" stroke="#5A5F68" stroke-width="1.5" stroke-dasharray="3 3"/><text x="${xd-5}" y="${T+ih-8}" text-anchor="end" font-size="${fs}" font-weight="600" fill="#5A5F68">Prazo final</text>`;
  if(!c.done&&dnum(t)>=x0&&dnum(t)<=x1){const xt=X(t)+iw/(x1-x0)/2,anc=xt>W-R-30?'end':xt<L+30?'start':'middle';g+=`<line x1="${xt}" x2="${xt}" y1="${T-6}" y2="${T+ih}" stroke="#202124" stroke-width="1.5"/><text x="${xt}" y="${T-9}" text-anchor="${anc}" font-size="${fs}" font-weight="700" fill="#202124">Hoje</text>`}
  for(const n of c.notes){if(n.date<s0||dnum(n.date)>x1)continue;g+=`<circle cx="${X(n.date)}" cy="${Y(0)}" r="4" fill="#2F6FDE" stroke="#fff" stroke-width="1.5"><title>${fdate(n.date)}: ${esc(n.text||'')}</title></circle>`}
  g+=`<text x="${L}" y="${H-12}" font-size="${fs}" fill="#8A8F98">${fdate(s0)}${c.start?' (início real)':''}</text><text x="${W-R}" y="${H-12}" text-anchor="end" font-size="${fs}" fill="#8A8F98">${fdate(isoOf(x1-1))}</text>`;
  return `<div class="pchart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico do andamento da obra: prazo decorrido e execução ao longo do tempo">${g}</svg></div>`;
}
function clientViewHTML(v,opt={}){
  const c=cvCalc(v),p=c.p,co=v.company||{};
  const steps=[];
  if(c.start)steps.push([c.start,'Início da execução','ok']);else if(p.planned_start)steps.push([p.planned_start,'Início previsto','']);
  c.pauses.forEach(z=>{steps.push([z.start,'Obra paralisada: '+(z.reason||'motivo não informado'),'pz']);if(z.end)steps.push([z.end,'Execução retomada','ok'])});
  c.notes.forEach(n=>steps.push([n.date,n.text||'','']));
  if(p.real_end)steps.push([p.real_end,'Obra concluída','ok']);else if(p.planned_end)steps.push([p.planned_end,'Conclusão prevista','']);
  steps.sort((a,b)=>b[0].localeCompare(a[0]));
  const prazo=c.done?['Concluída',`em ${fdate(p.real_end)}`]:c.canceled?['Cancelada','']:c.late?[`${days(c.delay)} de atraso`,'em relação ao prazo final']:c.remaining!=null?[`Restam ${days(c.remaining)}`,'até o prazo final']:['A definir',''];
  const tp=c.timePct==null?null:Math.round(c.timePct),tpBar=tp==null?0:Math.min(100,tp);
  const k=pcol(p);
  return `${opt.banner||''}<div class="cv">
   <div class="card cvh" style="border-top:4px solid ${k.fg}"><div class="brand"><i></i>${co.name?esc(co.name):'OBRA&nbsp;<span>CONTROL</span>'}</div>
    <h1>${esc(p.name)}</h1><div class="small ink2">${esc([p.code,[p.city,p.state].filter(Boolean).join(' / ')].filter(Boolean).join(' · '))}</div><div>${statusPill(p)}</div>
    <div class="gauges"><div><div class="cvp"><b>${tp==null?'—':tp+'%'}</b><span>do prazo decorrido</span></div><div class="bar big"><i style="width:${tpBar}%;background:${tp>100&&!c.done?'var(--neg)':'#5A5F68'}"></i></div><p class="small muted">${c.start?`Do início real em ${fdate(c.start)} até o prazo final em ${fdate(p.planned_end)}${c.totalDays?` (${days(c.totalDays)})`:''}`:'A obra ainda não começou'}${tp>100&&!c.done?`. Prazo final excedido em ${days(c.delay)}.`:''}</p></div>
    <div><div class="cvp"><b>${c.progress}%</b><span>da obra executada</span></div><div class="bar big"><i style="width:${c.progress}%;background:${c.done?'var(--pos)':'var(--accent)'}"></i></div><p class="small muted">${c.done?'Obra concluída':'Percentual informado pela equipe responsável'}</p></div></div></div>
   <div class="grid g2 cvk">${kpi(c.start?'Início da obra':'Início previsto',fdate(c.start||p.planned_start))}${kpi(c.done?'Conclusão':'Prazo final',fdate(c.done?p.real_end:p.planned_end))}${kpi('Situação do prazo',`<span class="${c.late?'neg':c.done?'pos':''}">${prazo[0]}</span>`,prazo[1])}${kpi('Dias de paralisação',days(c.pauseDays),c.pauses.some(z=>!z.end)?'Obra paralisada no momento':'')}</div>
   <div class="card"><div class="row" style="justify-content:space-between;margin-bottom:6px"><h2>Andamento ao longo do tempo</h2>${chartLegend}</div>${progressChart(v)}<p class="small muted" style="margin-top:6px">Linha tracejada: quanto do prazo já passou desde o início real. Linha laranja: execução informada a cada atualização. Pontos azuis: acontecimentos registrados.</p></div>
   <div class="card"><h2>Acontecimentos da obra</h2>${steps.length?`<div class="steps">${steps.map(s=>`<div class="st ${s[2]}"><div class="dt">${fdate(s[0])}</div><div>${esc(s[1])}</div></div>`).join('')}</div>`:'<p class="muted small">Nenhum acontecimento registrado ainda.</p>'}</div>
   ${c.done?`<div class="card"><div class="row" style="justify-content:space-between"><div><h2>Termo de conclusão</h2><p class="small ink2" style="margin-top:4px">Documento que registra a conclusão da obra conforme o contrato.</p></div><button class="btn dark" data-act="${opt.public?'termo-pub':'termo'}" data-id="${esc(p.id||'')}">${ic('down')} Baixar termo (PDF)</button></div></div>`:''}
   ${p.description||p.responsible||p.address?`<div class="card"><h2>Sobre a obra</h2><div class="dl" style="grid-template-columns:1fr">${p.description?`<div><span>Serviços</span><b style="font-weight:500">${esc(p.description)}</b></div>`:''}${p.address?`<div><span>Local</span><b style="font-weight:500">${esc([p.address,p.city,p.state].filter(Boolean).join(', '))}</b></div>`:''}${p.responsible?`<div><span>Responsável pela obra</span><b>${esc(p.responsible)}</b></div>`:''}${co.phone?`<div><span>Contato</span><b>${esc(co.phone)}</b></div>`:''}</div></div>`:''}
   <p class="small muted" style="text-align:center">Atualizado em ${fdate(today())}${co.name?' · '+esc(co.name):''}</p>
  </div>`;
}
function vCliente(id){
  const p=proj(id);
  if(!p)return `<div class="card empty"><b>Obra não encontrada</b><a class="btn" href="#obras">Voltar para Minhas Obras</a></div>`;
  return clientViewHTML(buildCV(p),{banner:`<div class="banner demo"><span><b>Prévia da visão do cliente.</b> É isto que o cliente vê pelo link: andamento e prazos, sem valores, custos ou lucro.</span><span class="row"><button class="btn" data-act="share" data-id="${p.id}">Enviar ao cliente</button><a class="btn" href="#obra-${p.id}">Voltar à obra</a></span></div>`});
}
function vPublic(){
  if(pubErr)return `<div class="cv"><div class="card empty"><b>Link indisponível</b><span>${esc(pubErr)}</span></div></div>`;
  if(!PUB)return `<div class="cv"><div class="card empty"><b>Carregando o andamento da obra…</b></div></div>`;
  return clientViewHTML(PUB,{public:true});
}
async function loadPublic(token){
  try{
    const AUTH_URL=DATA_URL.replace('.apirest.','.neonauth.').replace(/\/rest\/v1$/,'/auth');
    const tk=await fetch(`${AUTH_URL}/token/anonymous`).then(r=>r.ok?r.json():null).catch(()=>null);
    const r=await fetch(`${DATA_URL}/rpc/client_view`,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json',...(tk&&tk.token?{Authorization:'Bearer '+tk.token}:{})},body:JSON.stringify({p_token:token})});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const j=await r.json();
    if(!j||!j.project){pubErr='Este link não existe mais ou foi desativado. Peça um novo link à empresa responsável pela obra.'}else{PUB=j;document.title=(j.project.name||'Obra')+' · Acompanhamento'}
  }catch(e){console.warn(e);pubErr='Não foi possível carregar agora. Verifique a internet e recarregue a página.'}
  render();
}

/* ---------- link do cliente ---------- */
function shareModal(pid){
  const p=proj(pid);if(!p)return;
  if(memory()){modal({title:'Enviar ao cliente',cancel:'Fechar',body:'<p class="ink2">O link do cliente só funciona com obras salvas na sua conta. Saia do modo demonstração para gerar um link real.</p>'});return}
  const cl=cli(p.client_id)||{};
  if(!p.share_token){
    modal({title:'Enviar ao cliente',submit:'Gerar link',body:`<p class="ink2">Gera um link para <b>${esc(cl.name||'o cliente')}</b> acompanhar <b>${esc(p.name)}</b> sem precisar de login.</p><p class="small muted">O cliente vê o andamento, os prazos, a linha do tempo e os acontecimentos. Valores, custos, recebimentos e lucro nunca aparecem. Você pode desativar o link a qualquer momento.</p>`,
      onSubmit:async()=>{await put('projects',{...p,share_token:newToken(),updated_at:Date.now()});await log('obra','editou',p.id,'Link de acompanhamento do cliente gerado',p.id);setTimeout(()=>shareModal(pid),60)}});
    return;
  }
  const url=shareUrl(p.share_token),txt=`Olá${cl.name?', '+cl.name.split(' ')[0]:''}! Acompanhe o andamento da obra "${p.name}" por este link: ${url}`;
  const ph=String(cl.whatsapp||cl.phone||'').replace(/\D/g,''),wa=`https://wa.me/${ph?(ph.length<=11?'55'+ph:ph):''}?text=${encodeURIComponent(txt)}`;
  modal({title:'Link do cliente',cancel:'Fechar',body:`<p class="ink2">Envie este link para <b>${esc(cl.name||'o cliente')}</b>. Ele mostra andamento e prazos, sem valores.</p>
    <label class="f" for="share-url">Link de acompanhamento<input type="text" id="share-url" value="${esc(url)}" readonly></label>
    <div class="row"><button type="button" class="btn dark" data-act="share-copy">Copiar link</button><a class="btn" href="${esc(wa)}" target="_blank" rel="noopener">Enviar pelo WhatsApp</a><a class="btn" href="${esc(url)}" target="_blank" rel="noopener">Abrir</a></div>
    ${cl.email?`<p class="small muted">E-mail do cliente: ${esc(cl.email)}</p>`:''}
    <p class="small muted" style="border-top:1px solid var(--line-2);padding-top:12px">Quem tiver o link consegue ver o andamento. Para cortar o acesso, desative o link; um link novo pode ser gerado depois.</p>
    <div><button type="button" class="btn danger" data-act="share-revoke" data-id="${p.id}">Desativar link</button></div>`});
}
function revokeShare(pid){
  const p=proj(pid);
  confirmBox('Desativar link do cliente','O link atual deixa de funcionar imediatamente. Você pode gerar um novo depois.','Desativar',async()=>{await put('projects',{...p,share_token:null,updated_at:Date.now()});await log('obra','editou',p.id,'Link de acompanhamento do cliente desativado',p.id);toast('Link desativado.')});
}
function finishedModal(pid){
  const p=proj(pid);if(!p)return;
  modal({title:'Obra finalizada',cancel:'Fechar',body:`<p class="ink2">O termo de conclusão de <b>${esc(p.name)}</b> foi gerado para enviar ao cliente.</p><div class="row"><button type="button" class="btn dark" data-act="termo" data-id="${p.id}">${ic('down')} Baixar termo de conclusão</button><button type="button" class="btn" data-act="share" data-id="${p.id}">Enviar link ao cliente</button><button type="button" class="btn" data-act="pdf" data-id="${p.id}">Relatório interno (PDF)</button></div><p class="small muted">Pelo link, o cliente também pode baixar o termo a qualquer momento.</p>`});
}

/* ---------- termo de conclusão ---------- */
async function exportTermo(v){
  if(!window.jspdf){toast('O gerador de PDF não carregou. Recarregue a página e tente de novo.');return}
  const c=cvCalc(v),p=c.p,co=v.company||{},cl=v.client||{};
  const doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'}),A=[241,86,35],INK=[32,33,36],MU=[110,115,124],Wd=210,Lm=20,Rm=190;
  let y=20;
  doc.setFont('helvetica','bold');doc.setFontSize(13);doc.setTextColor(...INK);doc.text(px(co.name||'Contratada'),Lm,y);
  doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(...MU);
  const cinfo=[co.doc?'CNPJ/CPF: '+co.doc:'',co.address,co.phone].filter(Boolean).join('  ·  ');if(cinfo){y+=5;doc.text(doc.splitTextToSize(px(cinfo),130),Lm,y)}
  doc.text(px('Nº '+(p.code||'')),Rm,20,{align:'right'});
  y+=7;doc.setDrawColor(...A);doc.setLineWidth(.8);doc.line(Lm,y,Rm,y);
  y+=12;doc.setFont('helvetica','bold');doc.setFontSize(15);doc.setTextColor(...INK);doc.text('TERMO DE CONCLUSÃO E ENTREGA DE OBRA',Wd/2,y,{align:'center'});
  y+=8;
  const sec=(title,rows)=>{doc.autoTable({startY:y,head:[[{content:px(title),colSpan:2}]],body:rows.map(r=>r.map(px)),theme:'plain',margin:{left:Lm,right:Wd-Rm},styles:{font:'helvetica',fontSize:9,cellPadding:{top:1.15,bottom:1.15,left:1.5,right:1.5},textColor:INK,lineColor:[232,234,238],lineWidth:{bottom:.2},overflow:'linebreak'},headStyles:{fontStyle:'bold',fontSize:10,textColor:A},columnStyles:{0:{cellWidth:52,textColor:[90,95,104]}}});y=doc.lastAutoTable.finalY+4};
  sec('1. Partes',[['Contratada',co.name||'-'],['CNPJ/CPF da contratada',co.doc||'-'],['Contratante',cl.name||'-'],['CPF/CNPJ do contratante',cl.doc||'-']]);
  sec('2. Objeto',[['Obra',p.name||'-'],['Serviços',p.description||'-'],['Local',[p.address,p.city,p.state].filter(Boolean).join(', ')||'-'],['Responsável pela execução',p.responsible||co.responsible||'-']]);
  sec('3. Contrato e prazos',[['Data do contrato',fdate(p.contract_date)],['Prazo contratual',p.planned_start&&p.planned_end?`${fdate(p.planned_start)} a ${fdate(p.planned_end)} (${days(c.plannedDur)})`:'-'],['Início real da execução',fdate(c.start)],['Conclusão',fdate(p.real_end)],['Duração realizada',days(c.realDur)],['Dias de paralisação',days(c.pauseDays)],['Situação em relação ao prazo',p.real_end&&p.planned_end?(c.delay>0?`Concluída ${days(c.delay)} após o prazo final`:'Concluída dentro do prazo contratual'):'-']]);
  const hist=[];c.pauses.forEach(z=>{hist.push([z.start,'Paralisação: '+(z.reason||'motivo não informado')]);if(z.end)hist.push([z.end,'Retomada da execução'])});c.notes.forEach(n=>hist.push([n.date,n.text||'']));hist.sort((a,b)=>a[0].localeCompare(b[0]));
  if(hist.length)sec('4. Registro da execução',hist.map(h=>[fdate(h[0]),h[1]]));
  if(y>215){doc.addPage();y=22}
  doc.setFont('helvetica','bold');doc.setFontSize(10.5);doc.setTextColor(...A);doc.text(px(`${hist.length?'5':'4'}. Declaração`),Lm,y);y+=6;
  doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(...INK);
  const decl=`Pelo presente termo, a CONTRATADA declara que os serviços referentes à obra acima identificada foram integralmente executados e concluídos em ${fdate(p.real_end)}, conforme o escopo descrito neste documento e o contrato firmado entre as partes${p.contract_date?' em '+fdate(p.contract_date):''}. A execução teve início em ${fdate(c.start)} e foi concluída em ${fdate(p.real_end)}, totalizando ${days(c.realDur)} corridos${c.pauseDays?`, dos quais ${days(c.pauseDays)} de paralisação`:''}.`;
  const decl2='Ao assinar este termo, o CONTRATANTE declara ter recebido a obra nas condições descritas, ressalvadas as observações registradas abaixo.';
  doc.setFontSize(9.5);for(const t of [decl,decl2]){const lines=doc.splitTextToSize(px(t),Rm-Lm);doc.text(lines,Lm,y,{lineHeightFactor:1.4});y+=lines.length*4.8+2.5}
  y+=2;doc.setFontSize(9.5);doc.setTextColor(...MU);doc.text('Observações:',Lm,y);doc.setDrawColor(200);doc.setLineWidth(.2);for(let i=0;i<2;i++){y+=7;doc.line(Lm,y,Rm,y)}
  if(y>246){doc.addPage();y=30}
  y+=10;doc.setTextColor(...INK);doc.setFontSize(10);
  const lugar=[p.city,p.state].filter(Boolean).join('-');doc.text(px(`${lugar?lugar+', ':''}${new Date().toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'})}.`),Lm,y);
  y+=20;doc.setDrawColor(...INK);doc.setLineWidth(.3);doc.line(Lm,y,Lm+75,y);doc.line(Rm-75,y,Rm,y);
  doc.setFontSize(9);doc.setFont('helvetica','bold');doc.text(px(co.name||'Contratada'),Lm,y+5);doc.text(px(cl.name||'Contratante'),Rm-75,y+5);
  doc.setFont('helvetica','normal');doc.setTextColor(...MU);doc.text('CONTRATADA'+(co.responsible?' · '+px(co.responsible):''),Lm,y+10);doc.text(px('CONTRATANTE'+(cl.doc?' · '+cl.doc:'')),Rm-75,y+10);
  const n=doc.getNumberOfPages();for(let i=1;i<=n;i++){doc.setPage(i);doc.setFontSize(8);doc.setTextColor(...MU);doc.text(px(`Termo de conclusão · ${p.code||''} · gerado em ${fdate(today())} pelo OBRA CONTROL`),Lm,288);doc.text(`${i} / ${n}`,Rm,288,{align:'right'})}
  await save(`termo-conclusao-${slug(p.code||'obra')}.pdf`,doc.output('arraybuffer'));
}
function docsList(p){
  const l=D.documents.filter(d=>d.project_id===p.id&&!d.deleted);
  if(!l.length)return '<p class="muted small" style="margin-bottom:6px">Nenhum documento anexado.</p>';
  return `<div class="list">${l.map(d=>`<div class="li"><div class="m"><button type="button" class="chip" data-act="att" data-id="${esc(d.asset)}" data-type="${esc(d.type||'')}">${ic('clip')}${esc(d.name)}</button></div><div class="d">${fts(d.created_at)}</div><div class="acts" data-w><button class="icb" data-act="del-doc" data-id="${d.id}" aria-label="Excluir">${ic('trash')}</button></div></div>`).join('')}</div>`;
}
async function fillNames(){
  const els=[...document.querySelectorAll('[data-uid]')];if(!els.length||!user||!user.profiles)return;
  try{const ps=await user.profiles([...new Set(els.map(e=>e.dataset.uid))]);els.forEach(e=>{e.textContent=(ps&&ps[e.dataset.uid]&&ps[e.dataset.uid].name)||''})}catch(e){}
}

/* ---------- modal, toast ---------- */
const M=$('#modal');
function modal({title,body,submit='Salvar',onSubmit,wide,cancel='Cancelar',danger}){
  M.innerHTML=`<div class="sheet${wide?' wide':''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><form novalidate><header><h2>${esc(title)}</h2><button type="button" class="icb" data-act="close" aria-label="Fechar">${ic('x')}</button></header><div class="sb">${body}<p class="msg" role="alert"></p></div><footer>${cancel?`<button type="button" class="btn ghost" data-act="close">${cancel}</button>`:''}${onSubmit?`<button class="btn ${danger?'dark':'primary'}">${submit}</button>`:''}</footer></form></div>`;
  M.hidden=false;
  const f=$('form',M),msg=t=>{$('.msg',M).textContent=t||''};
  f.onsubmit=async e=>{e.preventDefault();if(!onSubmit)return;const b=$('footer .btn:last-child',M);b.disabled=true;msg('');
    try{const r=await onSubmit(f,msg);if(r!==false)closeModal()}catch(err){console.error(err);msg(errText(err))}
    if(b.isConnected)b.disabled=false};
  const first=$('input:not([type=hidden]):not([type=file]),select,textarea',f);if(first&&matchMedia('(min-width:821px)').matches)first.focus();
}
function closeModal(){M.hidden=true;M.innerHTML=''}
function confirmBox(title,text,label,fn){modal({title,body:`<p class="ink2">${esc(text)}</p>`,submit:label,danger:true,onSubmit:fn})}
let tt=0;function toast(t){const e=$('#toast');e.textContent=t;e.hidden=false;clearTimeout(tt);tt=setTimeout(()=>e.hidden=true,4200)}
const fld=(l,name,val='',o={})=>{
  const id='fi-'+name,cls=o.full?' full':'',req=o.req?' *':'';
  let c;
  if(o.type==='select')c=`<select id="${id}" name="${name}">${o.opts.map(x=>{const[v,t]=Array.isArray(x)?x:[x,x];return `<option value="${esc(v)}"${String(val)===String(v)?' selected':''}>${esc(t)}</option>`}).join('')}</select>`;
  else if(o.type==='textarea')c=`<textarea id="${id}" name="${name}">${esc(val)}</textarea>`;
  else if(o.type==='money')c=`<input type="text" inputmode="numeric" id="${id}" name="${name}" data-money value="${val?money(val):''}" placeholder="R$ 0,00" autocomplete="off">`;
  else if(o.type==='file')c=`<input type="file" id="${id}" name="${name}" multiple accept="image/*,application/pdf"${o.capture?' capture="environment"':''}>`;
  else c=`<input type="${o.type||'text'}" id="${id}" name="${name}" value="${esc(val)}"${o.list?` list="${o.list}"`:''}${o.ph?` placeholder="${esc(o.ph)}"`:''} autocomplete="off">`;
  return `<label class="f${cls}" for="${id}">${l}${req}${c}</label>`;
};
const mval=s=>{const d=String(s||'').replace(/\D/g,'');return d?+d/100:0};
const vals=f=>Object.fromEntries([...new FormData(f)].filter(([,v])=>typeof v==='string').map(([k,v])=>[k,v.trim()]));

/* ---------- formulários ---------- */
function clientFields(c={}){return fld('Nome ou razão social','c_name',c.name,{full:true,req:true})+fld('CPF ou CNPJ','c_doc',c.doc)+fld('Telefone','c_phone',c.phone,{type:'tel'})+fld('WhatsApp','c_whatsapp',c.whatsapp,{type:'tel'})+fld('E-mail','c_email',c.email,{type:'email'})}
const readClient=(v,old)=>({...(old||{id:uid('c'),created_at:Date.now()}),name:v.c_name,doc:v.c_doc,phone:v.c_phone,whatsapp:v.c_whatsapp,email:v.c_email});
const onlyD=x=>String(x||'').replace(/\D/g,'');
const fmtTel=x=>{const d=onlyD(x);return d.length===11?`(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`:d.length===10?`(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`:(x||'')};
function fmtDoc(x){const d=onlyD(x);if(d.length===11)return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4');if(d.length===14)return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,'$1.$2.$3/$4-$5');return x||''}
function docOk(x){const c=onlyD(x);
  if(c.length===11){if(/^(\d)\1+$/.test(c))return false;const dv=n=>{let s=0;for(let i=0;i<n;i++)s+=+c[i]*(n+1-i);const r=s*10%11;return r===10?0:r};return dv(9)===+c[9]&&dv(10)===+c[10]}
  if(c.length===14){if(/^(\d)\1+$/.test(c))return false;const dv=n=>{const w=n===12?[5,4,3,2,9,8,7,6,5,4,3,2]:[6,5,4,3,2,9,8,7,6,5,4,3,2];let s=0;for(let i=0;i<n;i++)s+=+c[i]*w[i];const r=s%11;return r<2?0:11-r};return dv(12)===+c[12]&&dv(13)===+c[13]}
  return false}
async function apiLookup(tipo,doc){
  if(memory())throw new Error('A consulta automática funciona com a sua conta (fora do modo demonstração).');
  let tok='';try{const r=await neon.auth.getSession();tok=r&&r.data&&r.data.session&&r.data.session.token||''}catch(e){}
  const r=await fetch('/api/consulta',{method:'POST',headers:{'Content-Type':'application/json',...(tok?{Authorization:'Bearer '+tok}:{})},body:JSON.stringify({tipo,doc})});
  let j={};try{j=await r.json()}catch(e){}
  if(!r.ok)throw new Error(j.error||'Não foi possível consultar agora.');
  return j;
}
const CL_F=[['name','cl_name'],['trade_name','cl_trade'],['status_rf','cl_status'],['opened_at','cl_opened'],['activity','cl_activity'],['birth','cl_birth'],['cep','cl_cep'],['street','cl_street'],['number','cl_number'],['complement','cl_complement'],['district','cl_district'],['city','cl_city'],['state','cl_state'],['phone','cl_phone'],['email','cl_email'],['ie','cl_ie'],['regime','cl_regime']];
function formClient(id,after){
  const old=id&&cli(id),c=old||{};
  const pj=c.kind?c.kind==='pj':onlyD(c.doc).length!==11;
  modal({title:old?'Editar cliente':'Novo cliente',wide:true,submit:old?'Salvar alterações':'Cadastrar cliente',body:`<div class="form">
   <div class="full cl-doc"><label class="f" for="fi-cl_doc">CPF ou CNPJ<input type="text" inputmode="numeric" id="fi-cl_doc" name="cl_doc" value="${esc(fmtDoc(c.doc))}" placeholder="Digite e o restante é preenchido sozinho" autocomplete="off"></label><button type="button" class="btn dark" data-act="cl-lookup">${ic('search')} Consultar</button></div>
   <p class="full small" id="cl-info" aria-live="polite">${c.lookup_source?`Dados de ${esc(c.lookup_source)} em ${fts(c.lookup_at)}.`:'Para CNPJ, a consulta traz razão social, situação na Receita, endereço e contato. Confira antes de salvar.'}</p>
   <input type="hidden" name="cl_kind" id="fi-cl_kind" value="${pj?'pj':'pf'}"><input type="hidden" name="cl_src" id="fi-cl_src" value="${esc(c.lookup_source||'')}">
   <h3>Identificação</h3>${fld('Nome ou razão social','cl_name',c.name,{full:true,req:true})}${fld('Nome fantasia','cl_trade',c.trade_name)}${fld('Situação na Receita','cl_status',c.status_rf)}${fld('Data de abertura','cl_opened',c.opened_at,{type:'date'})}${fld('Data de nascimento','cl_birth',c.birth,{type:'date'})}${fld('Inscrição estadual','cl_ie',c.ie)}${fld('Regime tributário','cl_regime',c.regime,{ph:'Simples Nacional, MEI…'})}${fld('Atividade principal','cl_activity',c.activity,{full:true})}
   <h3>Contato</h3>${fld('Telefone','cl_phone',c.phone,{type:'tel'})}${fld('WhatsApp','cl_whatsapp',c.whatsapp,{type:'tel'})}${fld('E-mail','cl_email',c.email,{type:'email'})}${fld('Pessoa de contato','cl_contact',c.contact,{ph:'Quem fala com você na empresa'})}
   <h3>Endereço</h3>${fld('CEP','cl_cep',c.cep,{ph:'00000-000'})}${fld('Logradouro','cl_street',c.street)}${fld('Número','cl_number',c.number)}${fld('Complemento','cl_complement',c.complement)}${fld('Bairro','cl_district',c.district)}${fld('Cidade','cl_city',c.city)}${fld('Estado','cl_state',c.state||'TO',{type:'select',opts:UFS})}
   ${fld('Observações','cl_notes',c.notes,{type:'textarea',full:true})}</div>`,
   onSubmit:async(f,msg)=>{
    const v=vals(f);
    if(!v.cl_name){msg('Informe o nome ou a razão social.');return false}
    const d=onlyD(v.cl_doc);
    if(d&&!docOk(d)){msg('CPF ou CNPJ inválido. Confira os números ou deixe em branco.');return false}
    const dup=d&&D.clients.find(x=>x.id!==(old&&old.id)&&onlyD(x.doc)===d);
    if(dup){msg(`Já existe um cliente com este documento: ${dup.name}.`);return false}
    const o={...(old||{id:uid('c'),created_at:Date.now()}),kind:d.length===11?'pf':d.length===14?'pj':(v.cl_kind||'pj'),doc:d?fmtDoc(d):'',name:v.cl_name,trade_name:v.cl_trade,status_rf:v.cl_status,opened_at:v.cl_opened,birth:v.cl_birth,activity:v.cl_activity,ie:v.cl_ie,regime:v.cl_regime,phone:fmtTel(v.cl_phone),whatsapp:fmtTel(v.cl_whatsapp),email:v.cl_email,contact:v.cl_contact,cep:v.cl_cep,street:v.cl_street,number:v.cl_number,complement:v.cl_complement,district:v.cl_district,city:v.cl_city,state:v.cl_state,notes:v.cl_notes,updated_at:Date.now()};
    if(v.cl_src&&(!old||old.lookup_source!==v.cl_src||f.dataset.looked)){o.lookup_source=v.cl_src;o.lookup_at=Date.now()}
    await put('clients',o);toast('Cliente salvo.');
    if(after)setTimeout(()=>after(o),60);else if(!old)location.hash='clientes-'+o.id;
   }});
  const fm=$('#modal form');if(fm)fm.dataset.cid=old?old.id:'';
}
async function clLookup(){
  const f=$('#modal form');if(!f)return;const info=$('#cl-info',f),b=$('[data-act=cl-lookup]',f),d=onlyD($('#fi-cl_doc',f).value);
  const say=(t,cls='')=>{info.className='full small '+cls;info.textContent=t};
  if(d.length!==11&&d.length!==14){say('Digite um CPF (11 números) ou CNPJ (14 números).','neg');return}
  if(!docOk(d)){say(`${d.length===11?'CPF':'CNPJ'} inválido. Confira os números.`,'neg');return}
  const dup=D.clients.find(x=>onlyD(x.doc)===d&&x.id!==(f.dataset.cid||''));
  b.disabled=true;say('Consultando…','muted');
  try{
    const r=await apiLookup(d.length===11?'cpf':'cnpj',d),x=r.data||{};
    let n=0;for(const [k,fid] of CL_F){const el=$('#fi-'+fid,f);if(!el||!x[k])continue;if(el.tagName==='SELECT'){if([...el.options].some(o=>o.value===x[k])){el.value=x[k];n++}}else{el.value=x[k];n++}}
    $('#fi-cl_doc',f).value=fmtDoc(d);$('#fi-cl_kind',f).value=d.length===11?'pf':'pj';$('#fi-cl_src',f).value=r.source||'';f.dataset.looked='1';
    const st=(x.status_rf||'').toUpperCase();
    say(`${n} campos preenchidos com dados de ${r.source||'consulta'}${r.test?' (chave de teste: dados de exemplo)':''}.${st&&st!=='ATIVA'&&d.length===14?` Atenção: situação na Receita "${x.status_rf}".`:''}${dup?` Atenção: já existe um cliente com este documento (${dup.name}).`:''} Confira e complete WhatsApp e contato.`,st&&st!=='ATIVA'&&d.length===14||dup?'warn-t':'pos');
  }catch(e){say(e.message,'neg')}
  b.disabled=false;
}
async function cepLookup(el){
  const f=el.closest('form'),d=onlyD(el.value);if(d.length!==8||memory())return;
  try{const r=await apiLookup('cep',d),x=r.data||{};el.value=x.cep||el.value;for(const [k,fid] of [['street','cl_street'],['district','cl_district'],['city','cl_city'],['state','cl_state']]){const e=$('#fi-'+fid,f);if(e&&x[k]&&!e.value)e.value=x[k]}if(x.state)$('#fi-cl_state',f).value=x.state;const n=$('#fi-cl_number',f);if(n&&!n.value)n.focus()}catch(e){}
}
const CF={q:'',kind:''};
function clientStats(id){const ps=D.projects.filter(p=>p.client_id===id),cs=ps.map(p=>({p,c:calc(p)}));return {ps,n:ps.length,obra:ps.filter(p=>kindOf(p)==='obra').length,servico:ps.filter(p=>kindOf(p)==='servico').length,venda:ps.filter(p=>kindOf(p)==='venda').length,contracted:sum(cs.filter(x=>x.c.counted),x=>x.c.contracted),received:sum(cs,x=>x.c.received),receivable:sum(cs.filter(x=>x.c.counted),x=>x.c.receivable),open:cs.filter(x=>x.c.open).length}}
function clientRows(){
  const q=deacc(CF.q),qd=onlyD(CF.q);
  const l=D.clients.filter(c=>(!CF.kind||(c.kind||(onlyD(c.doc).length===11?'pf':'pj'))===CF.kind)&&(!q||deacc([c.name,c.trade_name,c.city,c.email,c.contact].join(' ')).includes(q)||(qd.length>=3&&onlyD(c.doc+' '+c.phone+' '+c.whatsapp).includes(qd)))).sort((a,b)=>(a.name||'').localeCompare(b.name||'','pt-BR'));
  if(!l.length)return `<p class="muted small" style="padding:12px 0">${D.clients.length?'Nenhum cliente encontrado com essa busca.':'Nenhum cliente cadastrado ainda.'}</p>`;
  return `<table class="stack tlist"><thead><tr><th>Cliente</th><th>Documento</th><th>Cidade</th><th>Contato</th><th>Cadastros</th><th class="r">Contratado</th><th class="r">Ações</th></tr></thead><tbody>${l.map(c=>{const st=clientStats(c.id),k=c.kind||(onlyD(c.doc).length===11?'pf':'pj'),bad=c.status_rf&&!/ATIVA/i.test(c.status_rf)&&k==='pj';
    return `<tr><td class="tl-main"><a href="#clientes-${c.id}" class="tl-name"><span class="cav ${k}">${esc((c.trade_name||c.name||'?').trim().slice(0,1).toUpperCase())}</span><span><small>${k==='pj'?'Empresa':'Pessoa física'}${c.trade_name&&c.trade_name!==c.name?' · '+esc(c.trade_name):''}</small><b>${esc(c.name)}</b></span></a>${bad?`<span class="pill bad">${esc(c.status_rf)}</span>`:''}</td>
    <td>${esc(c.doc||'—')}</td><td>${esc([c.city,c.state].filter(Boolean).join('/')||'—')}</td><td>${esc(c.whatsapp||c.phone||c.email||'—')}</td>
    <td><div class="chips">${st.obra?`<span class="pill k-obra">${st.obra} ${st.obra===1?'obra':'obras'}</span>`:''}${st.servico?`<span class="pill k-servico">${st.servico} ${st.servico===1?'serviço':'serviços'}</span>`:''}${st.venda?`<span class="pill k-venda">${st.venda} ${st.venda===1?'venda':'vendas'}</span>`:''}${!st.n?'<span class="muted small">Nenhum</span>':''}</div></td>
    <td class="r"><div class="cell"><b>${money(st.contracted)}</b>${st.receivable>0?`<div class="small muted">a receber ${money(st.receivable)}</div>`:''}</div></td>
    <td class="r tl-act" data-w><button type="button" class="icb" data-act="edit-client" data-id="${c.id}" aria-label="Editar ${esc(c.name)}" title="Editar">${ic('edit')}</button><button type="button" class="icb danger" data-act="del-client" data-id="${c.id}" aria-label="Excluir ${esc(c.name)}" title="Excluir">${ic('trash')}</button></td></tr>`}).join('')}</tbody></table>`;
}
function vClientes(){
  const pj=D.clients.filter(c=>(c.kind||(onlyD(c.doc).length===11?'pf':'pj'))==='pj').length;
  let h=`<div class="head"><div><h1>Clientes</h1><p class="sub">${D.clients.length} ${D.clients.length===1?'cliente':'clientes'}: ${pj} empresas e ${D.clients.length-pj} pessoas físicas</p></div><button class="btn dark" data-act="new-client" data-w>${ic('plus')} Novo cliente</button></div>`;
  if(!D.clients.length)return h+`<div class="card empty"><b>Nenhum cliente cadastrado</b><span>Digite o CNPJ ou CPF e o sistema preenche razão social, endereço e contato automaticamente.</span><button class="btn primary" data-act="new-client" data-w>${ic('plus')} Cadastrar primeiro cliente</button></div>`;
  h+=`<div class="row"><input type="search" id="cf-q" placeholder="Buscar por nome, CNPJ/CPF, cidade, telefone ou e-mail" value="${esc(CF.q)}" style="flex:1;min-width:200px"><div class="chips kfilter">${[['','Todos'],['pj','Empresas'],['pf','Pessoas físicas']].map(([k,l])=>`<button type="button" class="chip${CF.kind===k?' on':''}" data-act="cf-kind" data-id="${k}">${l}</button>`).join('')}</div></div>`;
  return h+`<div class="card tcard"><div class="scroll" id="cl-list">${clientRows()}</div></div>`;
}
function vClienteDet(id){
  const c=cli(id);if(!c)return `<div class="card empty"><b>Cliente não encontrado</b><a class="btn" href="#clientes">Voltar para Clientes</a></div>`;
  const st=clientStats(id),k=c.kind||(onlyD(c.doc).length===11?'pf':'pj'),wa=onlyD(c.whatsapp||'');
  const addr=[[c.street,c.number].filter(Boolean).join(', '),c.complement,c.district,[c.city,c.state].filter(Boolean).join('/'),c.cep].filter(Boolean).join(' · ');
  const dl=(l,v)=>v?`<div><span>${l}</span><b>${v}</b></div>`:'';
  let h=`<div class="head"><div><a href="#clientes" class="small muted">‹ Clientes</a><h1>${esc(c.name)}</h1><div class="row" style="margin-top:8px"><span class="small muted">${esc(c.doc||'Sem documento')}</span><span class="pill">${k==='pj'?'Empresa':'Pessoa física'}</span>${c.status_rf?`<span class="pill ${/ATIVA/i.test(c.status_rf)?'s-concluida':'bad'}">${esc(c.status_rf)}</span>`:''}</div></div>
   <div class="row" data-w><button class="btn ghost danger" data-act="del-client" data-id="${c.id}">${ic('trash')}</button><button class="btn" data-act="edit-client" data-id="${c.id}">${ic('edit')} Editar</button><button class="btn" data-act="cl-new-proj" data-id="${c.id}|venda">${ic('plus')} Venda</button><button class="btn" data-act="cl-new-proj" data-id="${c.id}|servico">${ic('plus')} Serviço</button><button class="btn dark" data-act="cl-new-proj" data-id="${c.id}|obra">${ic('plus')} Nova obra</button></div></div>
   <div class="grid g4">${kpi('Cadastros',`${st.n}`,`${st.obra} obras · ${st.servico} serviços · ${st.venda} vendas`,'tone-info','build')}${kpi('Valor contratado',money(st.contracted),'Contratos fechados','tone-info','doc')}${kpi('Recebido',money(st.received),'Total já pago pelo cliente','tone-pos','coin')}${kpi('A receber',money(st.receivable),st.open?`${st.open} em aberto`:'Nada em aberto','tone-warn','cal')}</div>
   <div class="grid g2"><div class="card"><h2>Dados do cliente</h2><div class="dl">${dl(k==='pj'?'Razão social':'Nome',esc(c.name))}${dl('Nome fantasia',esc(c.trade_name||''))}${dl(k==='pj'?'CNPJ':'CPF',esc(c.doc||''))}${dl('Abertura',c.opened_at?fdate(c.opened_at):'')}${dl('Nascimento',c.birth?fdate(c.birth):'')}${dl('Inscrição estadual',esc(c.ie||''))}${dl('Regime tributário',esc(c.regime||''))}${dl('Atividade principal',esc(c.activity||''))}${addr?`<div style="grid-column:1/-1"><span>Endereço</span><b style="font-weight:500">${esc(addr)}</b></div>`:''}${c.notes?`<div style="grid-column:1/-1"><span>Observações</span><b style="font-weight:500">${esc(c.notes)}</b></div>`:''}</div>${c.lookup_source?`<p class="small muted" style="margin-top:12px">Consultado em ${esc(c.lookup_source)} em ${fts(c.lookup_at)}.</p>`:''}</div>
   <div class="card"><h2>Contato</h2><div class="list">${c.contact?`<div class="li"><div class="m"><div class="d">Pessoa de contato</div><div class="t">${esc(c.contact)}</div></div></div>`:''}${c.whatsapp?`<div class="li"><div class="m"><div class="d">WhatsApp</div><div class="t">${esc(c.whatsapp)}</div></div>${wa?`<a class="btn" href="https://wa.me/${wa.length<=11?'55'+wa:wa}" target="_blank" rel="noopener">Abrir conversa</a>`:''}</div>`:''}${c.phone?`<div class="li"><div class="m"><div class="d">Telefone</div><div class="t">${esc(c.phone)}</div></div><a class="btn" href="tel:${onlyD(c.phone)}">Ligar</a></div>`:''}${c.email?`<div class="li"><div class="m"><div class="d">E-mail</div><div class="t">${esc(c.email)}</div></div><a class="btn" href="mailto:${esc(c.email)}">Enviar e-mail</a></div>`:''}${!c.contact&&!c.whatsapp&&!c.phone&&!c.email?'<p class="muted small">Nenhum contato cadastrado. Use Editar para completar.</p>':''}</div></div></div>
   <div class="card"><h2>Obras, serviços e vendas</h2>${st.ps.length?`<div class="grid g3">${st.ps.sort((a,b)=>(b.created_at||0)-(a.created_at||0)).map(p=>{const pc=calc(p),kk=pcol(p);return `<a class="card pcard" href="#obra-${p.id}" style="background:${kk.bg};border:1px solid ${kk.bd}"><div class="small muted">${dot(p)}${esc(p.code)}</div><div class="nm">${esc(p.name)}</div><div class="row">${kindOf(p)!=='obra'?`<span class="pill k-${kindOf(p)}">${KIND[kindOf(p)].n}</span>`:''}${statusPill(p)}</div><div class="figs"><div class="fig"><span>Contratado</span><b>${money(pc.contracted).replace(' ','&nbsp;')}</b></div><div class="fig"><span>Recebido</span><b>${money(pc.received).replace(' ','&nbsp;')}</b></div><div class="fig"><span>A receber</span><b>${money(pc.receivable).replace(' ','&nbsp;')}</b></div></div></a>`}).join('')}</div>`:'<p class="muted small">Nenhum cadastro para este cliente ainda.</p>'}</div>`;
  return h;
}
function formProject(id,kindNew,clientId){
  const old=id&&proj(id),kind=old?kindOf(old):(KIND[kindNew]?kindNew:'obra'),p=old||{status:kind==='obra'?'orcamento':'andamento',state:(cli(clientId)||{}).state||'TO',city:(cli(clientId)||{}).city||'',kind,client_id:clientId||''};
  const copts=[['','Selecione o cliente'],...D.clients.map(c=>[c.id,c.name]),['__new','+ Cadastrar novo cliente']];
  modal({title:old?'Editar '+KIND[kind].n.toLowerCase():KIND[kind].novo,wide:true,submit:old?'Salvar alterações':'Cadastrar',body:`<div class="form">
   <div class="full"><span class="small" style="font-weight:600;color:var(--ink-2)">Tipo</span><div class="seg" role="radiogroup" aria-label="Tipo de cadastro">${Object.entries(KIND).map(([k,v])=>`<label><input type="radio" name="kind" value="${k}"${kind===k?' checked':''}><span>${v.n}</span></label>`).join('')}</div></div>
   <h3>Cliente</h3>${fld('Cliente','client_id',p.client_id||(D.clients.length?'':'__new'),{type:'select',opts:copts,full:true,req:true})}<div class="form full" id="newcli" ${(p.client_id||D.clients.length)?'hidden':''}>${clientFields()}</div>
   <h3>Dados</h3>${fld('Nome','name',p.name,{full:true,req:true,ph:kind==='venda'?'Ex.: Kit padrão de entrada':kind==='servico'?'Ex.: Manutenção de quadro elétrico':''})}${fld('Código de identificação','code',old?p.code:nextCode(kind)+' (automático)',{})}${fld('Status','status',p.status,{type:'select',opts:Object.entries(STATUS).filter(([k])=>old?true:k!=='concluida')})}
   ${fld('Endereço completo','address',p.address,{full:true})}${fld('Cidade','city',p.city)}${fld('Estado','state',p.state,{type:'select',opts:UFS})}
   ${fld('Descrição dos serviços','description',p.description,{type:'textarea',full:true})}${fld('Responsável pela obra','responsible',p.responsible)}${fld('Data do contrato','contract_date',p.contract_date,{type:'date'})}
   <div class="full"><span class="small" style="font-weight:600;color:var(--ink-2)">Cor da obra</span><div class="swatches" role="radiogroup" aria-label="Cor da obra">${PCOL.map(k=>`<label class="sw" title="${k.n}"><input type="radio" name="color" value="${k.k}"${pcol(old||{id:'novo'+D.projects.length}).k===k.k?' checked':''}><span style="background:${k.bg};border-color:${k.bd}"><i style="background:${k.fg}"></i></span>${k.n}</label>`).join('')}</div></div>
   <h3>Valores</h3>${fld(kind==='venda'?'Valor da venda':'Valor total contratado','contract_value',p.contract_value,{type:'money'})}${fld(kind==='venda'?'Custo do material':'Custo previsto','planned_cost',p.planned_cost,{type:'money'})}<div class="full ink2 small">Lucro previsto: <b id="plucro" class="num">—</b></div>
   <h3>Prazos</h3>${fld('Data prevista de início','planned_start',p.planned_start,{type:'date'})}${fld('Data prevista de conclusão','planned_end',p.planned_end,{type:'date'})}${fld('Data real de início','real_start',p.real_start,{type:'date'})}${fld('Data real de conclusão','real_end',p.real_end,{type:'date'})}</div>`,
   onSubmit:async(f,msg)=>{
    const v=vals(f);
    if(!v.name){msg('Informe o nome da obra.');return false}
    if(!v.client_id){msg('Selecione o cliente ou cadastre um novo.');return false}
    if(v.client_id==='__new'&&!v.c_name){msg('Informe o nome do novo cliente.');return false}
    if(v.planned_start&&v.planned_end&&v.planned_end<v.planned_start){msg('A conclusão prevista não pode ser antes do início previsto.');return false}
    if(v.real_start&&v.real_end&&v.real_end<v.real_start){msg('A conclusão real não pode ser antes do início real.');return false}
    if(v.status==='concluida'&&!old){msg('Use FINALIZAR OBRA para concluir.');return false}
    let cid=v.client_id;
    if(cid==='__new'){const c=readClient(v);await put('clients',c);cid=c.id}
    const cv=mval(v.contract_value),pc=mval(v.planned_cost);
    const nk=KIND[v.kind]?v.kind:kind;
    const o={...(old||{id:uid('p'),code:nextCode(nk),created_at:Date.now(),progress:0}),kind:nk,client_id:cid,name:v.name,status:old&&old.status==='concluida'?'concluida':v.status,address:v.address,city:v.city,state:v.state,description:v.description,responsible:v.responsible,contract_date:v.contract_date,contract_value:cv,planned_cost:pc,planned_profit:cv-pc,planned_start:v.planned_start,planned_end:v.planned_end,real_start:v.real_start,real_end:v.real_end,color:v.color||pcol(old||{}).k,updated_at:Date.now()};
    if(o.status==='andamento'&&!o.real_start)o.real_start=today();
    await put('projects',o);
    if(old){const ch=diff(old,o,{name:'nome',status:'status',contract_value:'valor contratado',planned_cost:'custo previsto',planned_start:'início previsto',planned_end:'conclusão prevista',real_start:'início real',real_end:'conclusão real',responsible:'responsável'});await log('obra','editou',o.id,'Obra editada'+(ch?': '+ch:''),o.id)}
    else{await log('obra','criou',o.id,`${KIND[nk].n} cadastrada: ${o.name} (${o.code})`,o.id);location.hash='obra-'+o.id}
    toast('Obra salva.');
   }});
  const f=$('form',M);$('#fi-code',f).disabled=true;
  const upd=()=>{$('#newcli',f).hidden=$('#fi-client_id',f).value!=='__new';const a=mval($('#fi-contract_value',f).value),b=mval($('#fi-planned_cost',f).value);$('#plucro',f).textContent=a||b?`${money(a-b)}${a>0?' ('+pct((a-b)/a*100)+')':''}`:'—'};
  f.addEventListener('input',upd);f.addEventListener('change',upd);upd();
}
function diff(a,b,map){
  const fm=(k,v)=>/value|cost|amount/.test(k)?money(v):/start|end|date/.test(k)?fdate(v):k==='status'?(STATUS[v]||v):k==='project_id'?((proj(v)||{}).code||'—'):(v||'—');
  return Object.keys(map).filter(k=>String(a[k]??'')!==String(b[k]??'')).map(k=>`${map[k]} de ${fm(k,a[k])} para ${fm(k,b[k])}`).join('; ');
}
async function upload(files,kind){
  const out=[];if(!assets||isDemo())return out;
  for(const file of files){if(!file||!file.size)continue;const r=await assets.upload(file);out.push({id:r.id,name:file.name,type:r.contentType||file.type,size:r.sizeBytes||file.size,kind})}
  return out;
}
function formExpense(id,pid){
  const old=id&&D.expenses.find(e=>e.id===id);
  const ps=D.projects.filter(p=>!['concluida','cancelada'].includes(p.status)||(old&&old.project_id===p.id)||p.id===pid);
  if(!D.projects.length){modal({title:'Cadastre uma obra primeiro',body:'<p class="ink2">Toda despesa precisa estar vinculada a uma obra. Cadastre a obra e depois lance a despesa.</p>',submit:'Cadastrar obra',onSubmit:()=>{setTimeout(()=>formProject(),0)}});return}
  let lastResp='';try{lastResp=localStorage.getItem('oc-resp')||''}catch(e){}
  const e=old||{project_id:pid||(ps.length===1?ps[0].id:''),date:today(),category:'',payment:'Pix',responsible:lastResp||myName};
  const canUp=assets&&!isDemo();
  modal({title:old?'Editar despesa':'Nova despesa',submit:old?'Salvar alterações':'Lançar despesa',body:`<div class="form">
   ${fld('Valor','amount',e.amount,{type:'money',req:true,full:true})}
   ${fld('Obra','project_id',e.project_id,{type:'select',opts:[['','Selecione a obra'],...ps.map(p=>[p.id,p.code+' · '+p.name])],full:true,req:true})}
   ${fld('Categoria','category',e.category,{type:'select',opts:[['','Selecione'],...allCats()],req:true})}${fld('Data da despesa','date',e.date,{type:'date',req:true})}
   ${fld('Descrição','description',e.description,{full:true})}
   <details class="full more"${old||matchMedia('(min-width:821px)').matches?' open':''}><summary>Mais detalhes: pagamento, fornecedor, observações</summary><div class="form">
   ${fld('Forma de pagamento','payment',e.payment,{type:'select',opts:PAY})}${fld('Fornecedor','supplier',e.supplier,{list:'dl-sup'})}${fld('Responsável pelo lançamento','responsible',e.responsible,{full:true})}
   <datalist id="dl-sup">${suppliers().map(s=>`<option value="${esc(s)}">`).join('')}</datalist>
   ${fld('Observações','notes',e.notes,{type:'textarea',full:true})}</div></details>
   ${canUp?fld('Nota fiscal (foto ou PDF)','nf','',{type:'file'})+fld('Comprovante ou fotografia','comp','',{type:'file'}):'<p class="full small muted">O envio de nota fiscal e comprovante ainda não está disponível nesta versão.</p>'}
   ${old&&old.attachments&&old.attachments.length?`<div class="full"><span class="small ink2">Anexos atuais (marque para remover)</span><div class="chips">${old.attachments.map(a=>`<label class="chip"><input type="checkbox" name="rm_${esc(a.id)}"> ${esc(a.name)}</label>`).join('')}</div></div>`:''}</div>`,
   onSubmit:async(f,msg)=>{
    const v=vals(f),amount=mval(v.amount);
    if(!v.project_id||!proj(v.project_id)){msg('Selecione a obra. Não é possível lançar despesa sem obra vinculada.');return false}
    if(!(amount>0)){msg('Informe o valor da despesa.');return false}
    if(!v.date){msg('Informe a data da despesa.');return false}
    if(!v.category){msg('Selecione a categoria.');return false}
    const dup=D.expenses.find(x=>!x.deleted&&x.id!==(old&&old.id)&&x.project_id===v.project_id&&x.date===v.date&&Math.abs(x.amount-amount)<.005&&(x.supplier||'')===v.supplier&&x.category===v.category);
    if(dup&&f.dataset.dupOk!=='1'){f.dataset.dupOk='1';msg(`Já existe um lançamento igual nesta obra (${fdate(dup.date)}, ${money(dup.amount)}, ${dup.description||dup.category}). Se não for duplicado, toque em salvar de novo.`);return false}
    let att=(old&&old.attachments||[]).filter(a=>!f.elements['rm_'+a.id]||!f.elements['rm_'+a.id].checked);
    if(canUp){try{att=att.concat(await upload(f.elements.nf.files,'nf'),await upload(f.elements.comp.files,'comp'))}catch(err){msg('Não foi possível enviar o anexo. Verifique o arquivo (até 20 MB) e sua permissão de envio.');return false}}
    const o={...(old||{id:uid('e'),created_at:Date.now(),created_by:myId||null,status:'ativa'}),project_id:v.project_id,date:v.date,category:v.category,description:v.description,amount,supplier:v.supplier,payment:v.payment,responsible:v.responsible,notes:v.notes,attachments:att,updated_at:Date.now()};
    await put('expenses',o);
    try{localStorage.setItem('oc-resp',v.responsible)}catch(e){}
    if(old){const ch=diff(old,o,{amount:'valor',date:'data',category:'categoria',description:'descrição',supplier:'fornecedor',payment:'pagamento',project_id:'obra'});await log('despesa','editou',o.project_id,`Despesa editada (${o.description||o.category})`+(ch?': '+ch:''),o.id)}
    else await log('despesa','criou',o.project_id,`Despesa lançada: ${o.description||o.category} (${money(amount)})`,o.id);
    toast(old?'Despesa atualizada.':'Despesa lançada.');
   }});
  if(!old){const a=$('#fi-amount',M);if(a)a.focus()}
}
function formReceipt(id,pid){
  const old=id&&D.receipts.find(r=>r.id===id),r=old||{project_id:pid,date:today(),method:'Pix'},p=proj(r.project_id),c=calc(p);
  modal({title:old?'Editar recebimento':'Registrar recebimento',body:`<p class="small ink2">${esc(p.code)} · contratado ${money(c.contracted)} · saldo a receber ${money(c.receivable)}</p><div class="form">${fld('Valor recebido','amount',r.amount,{type:'money',req:true})}${fld('Data do recebimento','date',r.date,{type:'date',req:true})}${fld('Forma de recebimento','method',r.method,{type:'select',opts:PAY})}${fld('Descrição','description',r.description,{ph:'Ex.: entrada, 2ª medição'})}</div>`,
   onSubmit:async(f,msg)=>{
    const v=vals(f),amount=mval(v.amount);
    if(!(amount>0)){msg('Informe o valor recebido.');return false}
    if(!v.date){msg('Informe a data do recebimento.');return false}
    const o={...(old||{id:uid('r'),created_at:Date.now(),project_id:p.id}),amount,date:v.date,method:v.method,description:v.description,updated_at:Date.now()};
    await put('receipts',o);
    await log('recebimento',old?'editou':'criou',p.id,old?`Recebimento editado: ${diff(old,o,{amount:'valor',date:'data'})||o.description||'sem mudança de valor'}`:`Recebimento registrado: ${money(amount)}${o.description?' ('+o.description+')':''}`,o.id);
    toast('Recebimento salvo.');
   }});
}
function formPause(pid){
  modal({title:'Registrar paralisação',body:`<div class="form">${fld('Data da paralisação','start',today(),{type:'date',req:true})}${fld('Data de retomada (se já houver)','end','',{type:'date'})}${fld('Motivo da paralisação','reason','',{type:'textarea',full:true,req:true})}</div>`,onSubmit:async(f,msg)=>{
    const v=vals(f),p=proj(pid);if(!v.start||!v.reason){msg('Informe a data e o motivo.');return false}
    if(v.end&&v.end<v.start){msg('A retomada não pode ser antes da paralisação.');return false}
    await put('events',{id:uid('v'),project_id:pid,type:'pause',start:v.start,end:v.end||'',reason:v.reason,created_at:Date.now()});
    if(!v.end&&p.status==='andamento')await put('projects',{...p,status:'pausada',updated_at:Date.now()});
    await log('cronograma','criou',pid,`Paralisação registrada em ${fdate(v.start)}: ${v.reason}`);
  }});
}
function formResume(evId){
  const z=D.events.find(e=>e.id===evId);
  modal({title:'Registrar retomada',body:`<p class="small ink2">Paralisada desde ${fdate(z.start)}: ${esc(z.reason)}</p><div class="form">${fld('Data de retomada','end',today(),{type:'date',req:true,full:true})}</div>`,onSubmit:async(f,msg)=>{
    const v=vals(f),p=proj(z.project_id);if(!v.end||v.end<z.start){msg('Informe uma data de retomada igual ou posterior à paralisação.');return false}
    await put('events',{...z,end:v.end});
    if(p.status==='pausada')await put('projects',{...p,status:'andamento',updated_at:Date.now()});
    await log('cronograma','editou',p.id,`Execução retomada em ${fdate(v.end)}`);
  }});
}
function formEvent(pid){
  modal({title:'Evento ou observação',body:`<div class="form">${fld('Data','date',today(),{type:'date',req:true,full:true})}${fld('O que aconteceu','text','',{type:'textarea',full:true,req:true})}</div>`,onSubmit:async(f,msg)=>{
    const v=vals(f);if(!v.date||!v.text){msg('Informe a data e a descrição.');return false}
    await put('events',{id:uid('v'),project_id:pid,type:'note',date:v.date,text:v.text,created_at:Date.now()});
    await log('cronograma','criou',pid,`Evento em ${fdate(v.date)}: ${v.text}`);
  }});
}
function formFinalize(pid){
  const p=proj(pid),c=calc(p);
  modal({title:'Finalizar obra',submit:'Finalizar e gerar termo',danger:true,body:`<p class="ink2">${esc(p.name)}</p><div class="dl"><div><span>Custo total</span><b class="num">${money(c.cost)}</b></div><div><span>Lucro bruto</span><b class="num ${sgn(c.profit)}">${money(c.profit)} (${pct(c.margin)})</b></div><div><span>Recebido</span><b class="num">${money(c.received)}</b></div><div><span>Saldo a receber</span><b class="num">${money(c.receivable)}</b></div></div>
   ${c.receivable>0?'<p class="small muted">Ainda há saldo a receber. Você pode finalizar e continuar registrando recebimentos depois.</p>':''}
   <div class="form">${fld('Data real de início','real_start',p.real_start||p.planned_start||today(),{type:'date',req:true})}${fld('Data real de conclusão','real_end',p.real_end||today(),{type:'date',req:true})}</div><p class="small muted">Despesas, documentos e histórico são mantidos. A obra continua disponível para consulta em Minhas Obras.</p>`,
   onSubmit:async(f,msg)=>{
    const v=vals(f);if(!v.real_start||!v.real_end||v.real_end<v.real_start){msg('Confira as datas reais de início e conclusão.');return false}
    const open=c.pauses.find(z=>!z.end);if(open)await put('events',{...open,end:v.real_end});
    const pl=(p.progress_log||[]).filter(x=>x.d!==v.real_end);pl.push({d:v.real_end,v:100});
    const o={...p,status:'concluida',real_start:v.real_start,real_end:v.real_end,progress:100,progress_log:pl,finalized_at:Date.now(),updated_at:Date.now()};
    await put('projects',o);await log('obra','finalizou',pid,`Obra finalizada em ${fdate(v.real_end)}`,pid);
    if(memory()){const i=D.projects.findIndex(x=>x.id===pid);if(i>=0)D.projects[i]=o}
    tab='relatorios';schedule();
    exportTermo(buildCV(o));setTimeout(()=>finishedModal(pid),80);
   }});
}
function formReopen(pid){
  const p=proj(pid);
  if(!canAdmin&&!isDemo()){modal({title:'Reabrir obra',body:'<p class="ink2">Somente o dono do aplicativo ou um editor autorizado pode reabrir uma obra concluída.</p>',cancel:'Entendi'});return}
  modal({title:'Reabrir obra concluída',submit:'Autorizar e reabrir',danger:true,body:`<p class="ink2">A obra volta para "Em andamento" e a data real de conclusão é apagada. A reabertura fica registrada no histórico.</p><div class="form">${fld('Motivo da reabertura','reason','',{type:'textarea',full:true,req:true})}</div>`,onSubmit:async(f,msg)=>{
    const v=vals(f);if(v.reason.length<5){msg('Descreva o motivo da reabertura.');return false}
    await put('projects',{...p,status:'andamento',real_end:'',reopened_at:Date.now(),updated_at:Date.now()});
    await log('obra','reabriu',pid,`Obra reaberta com autorização. Motivo: ${v.reason}`,pid);toast('Obra reaberta.');
  }});
}

function delProject(id){
  const p=proj(id);if(!p)return;
  const ne=D.expenses.filter(e=>e.project_id===id&&!e.deleted).length,nr=D.receipts.filter(r=>r.project_id===id&&!r.deleted).length,nv=D.events.filter(e=>e.project_id===id).length,nd=D.documents.filter(d=>d.project_id===id&&!d.deleted).length;
  const txs=D.transactions.filter(t=>(t.allocations||[]).some(a=>a.project_id===id));
  const has=ne+nr+nv+nd+txs.length>0,kn=KIND[kindOf(p)].n.toLowerCase();
  modal({title:`Excluir ${kn}`,submit:'Excluir definitivamente',danger:true,body:`<p class="ink2"><b>${esc(p.code)} · ${esc(p.name)}</b></p>
   ${has?`<p class="ink2">Junto ${kindOf(p)==='obra'?'com a obra':kindOf(p)==='venda'?'com a venda':'com o serviço'} serão apagados: ${[ne&&`${ne} ${ne===1?'despesa':'despesas'}`,nr&&`${nr} ${nr===1?'recebimento':'recebimentos'}`,nv&&`${nv} ${nv===1?'evento':'eventos'} do cronograma`,nd&&`${nd} ${nd===1?'documento':'documentos'}`].filter(Boolean).join(', ')||'nenhum lançamento'}.${txs.length?` ${txs.length} ${txs.length===1?'lançamento do extrato volta':'lançamentos do extrato voltam'} para "A classificar".`:''}</p>
   <p class="small muted">Isto não pode ser desfeito. Se a ${kn} só não vai acontecer, prefira mudar o status para <b>Cancelada</b>: o histórico fica guardado.</p>
   <label class="f" for="del-confirm">Para confirmar, digite o código <b>${esc(p.code)}</b><input type="text" id="del-confirm" name="confirm" autocomplete="off"></label>`:'<p class="small muted">Este cadastro não tem lançamentos. A exclusão não pode ser desfeita.</p>'}`,
   onSubmit:async(f,msg)=>{
    if(has&&(vals(f).confirm||'').trim().toUpperCase()!==String(p.code).toUpperCase()){msg('Digite o código exatamente como aparece acima.');return false}
    for(const t of txs){
      const keep=(t.allocations||[]).filter(a=>a.project_id!==id);
      if(keep.length){
        // lançamento dividido: desfaz tudo para reclassificar com segurança
        for(const a of keep){if(a.expense_id){const e=D.expenses.find(x=>x.id===a.expense_id);if(e)await put('expenses',a.linked?(({bank_tx_id,...r})=>r)(e):{...e,deleted:true,deleted_at:Date.now()})}if(a.receipt_id){const r=D.receipts.find(x=>x.id===a.receipt_id);if(r)await put('receipts',a.linked?(({bank_tx_id,...o})=>o)(r):{...r,deleted:true,deleted_at:Date.now()})}}
      }
      await put('transactions',{...t,status:'pendente',allocations:[],classified_at:null});
    }
    if(!memory()){const {error}=await neon.from('projects').delete().eq('id',id);if(error)throw error}
    for(const col of ['expenses','receipts','events','documents','audit'])D[col]=D[col].filter(x=>x.project_id!==id);
    D.projects=D.projects.filter(x=>x.id!==id);
    await log('obra','excluiu',null,`${KIND[kindOf(p)].n} excluída: ${p.name} (${p.code})${has?` com ${ne} despesas e ${nr} recebimentos`:''}`,id);
    if(location.hash==='#obra-'+id)location.hash='obras';
    schedule();toast(`${KIND[kindOf(p)].n} excluída.`);
   }});
}

/* ---------- exportações ---------- */
async function save(filename,data){
  try{const u=URL.createObjectURL(data instanceof Blob?data:new Blob([data]));const a=document.createElement('a');a.href=u;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),8000);toast('Arquivo gerado.')}
  catch(e){toast('Não foi possível gerar o arquivo. Tente de novo.')}
}
const slug=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40);
const px=s=>String(s??'').replace(/[  ]/g,' ').replace(/[—–]/g,'-').replace(/[^\x09\x0a\x20-\xff]/g,'');
function imgData(id){
  return new Promise(res=>{const im=new Image();const to=setTimeout(()=>res(null),8000);
    im.onload=()=>{clearTimeout(to);try{const k=Math.min(1,1400/Math.max(im.naturalWidth,im.naturalHeight)),cv=document.createElement('canvas');cv.width=im.naturalWidth*k;cv.height=im.naturalHeight*k;const g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,cv.width,cv.height);g.drawImage(im,0,0,cv.width,cv.height);res({d:cv.toDataURL('image/jpeg',.82),w:cv.width,h:cv.height})}catch(e){res(null)}};
    im.onerror=()=>{clearTimeout(to);res(null)};im.src='/_blob/'+id});
}
async function exportPdf(pid,pOverride){
  const p=pOverride||proj(pid);if(!p)return;
  if(!window.jspdf){toast('O gerador de PDF não carregou. Recarregue a página e tente de novo.');return}
  toast('Gerando relatório…');
  const c=calc(p),cl=cli(p.client_id)||{},doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'});
  const A=[241,86,35],INK=[32,33,36],MU=[138,143,152];
  doc.setFillColor(...A);doc.rect(0,0,210,24,'F');doc.setTextColor(255);doc.setFont('helvetica','bold');doc.setFontSize(15);doc.text('OBRA CONTROL',14,15);
  doc.setFont('helvetica','normal');doc.setFontSize(10);doc.text(px(c.done?'Relatório final da obra':'Relatório parcial da obra'),196,15,{align:'right'});
  doc.setTextColor(...INK);doc.setFont('helvetica','bold');doc.setFontSize(14);doc.text(doc.splitTextToSize(px(p.name),182),14,36);
  doc.setFont('helvetica','normal');doc.setFontSize(9.5);doc.setTextColor(...MU);doc.text(px(`${p.code} · ${STATUS[p.status]}${D.settings.company?' · '+D.settings.company:''}${isDemo()?' · DADOS DE DEMONSTRAÇÃO':''}`),14,48);
  let y=54;
  const sec=(title,rows,o={})=>{doc.autoTable({startY:y,head:[[{content:px(title),colSpan:o.head?o.head.length:2}]].concat(o.head?[o.head.map(px)]:[]),body:rows.map(r=>r.map(px)),theme:'plain',margin:{left:14,right:14},styles:{font:'helvetica',fontSize:9,cellPadding:{top:1.8,bottom:1.8,left:2,right:2},textColor:INK,lineColor:[232,234,238],lineWidth:{bottom:.2},overflow:'linebreak'},headStyles:{fontStyle:'bold',fontSize:o.head?8.5:10.5,textColor:INK},columnStyles:o.cols||{0:{textColor:[90,95,104],cellWidth:70},1:{halign:o.right?'right':'left'}},didParseCell:d=>{if(d.section==='head'&&d.row.index===0){d.cell.styles.fontSize=10.5;d.cell.styles.textColor=A}if(o.bold&&d.section==='body'&&o.bold.includes(d.row.index))d.cell.styles.fontStyle='bold'}});y=doc.lastAutoTable.finalY+7};
  sec('Identificação',[['Nome da obra',p.name],['Cliente',cl.name||'-'],['CPF/CNPJ',cl.doc||'-'],['Endereço',[p.address,p.city,p.state].filter(Boolean).join(', ')||'-'],['Responsável',p.responsible||'-'],['Data de início',fdate(p.real_start||p.planned_start)],['Data de conclusão',p.real_end?fdate(p.real_end):'Em aberto']]);
  sec('Demonstrativo financeiro',[['Valor total contratado',money(c.contracted)],...GROUPS.map(g=>['Total de '+(g==='Outras despesas'?'outras despesas':g.toLowerCase()),money(c.byGroup[g])]),['Custo total da obra',money(c.cost)],['Lucro bruto',money(c.profit)],['Margem de lucro',pct(c.margin)],['Desvio de custo (realizado - previsto)',c.costDev==null?'-':money(c.costDev)],['Total recebido',money(c.received)],['Saldo a receber',money(c.receivable)]],{right:true,bold:[0,7,8]});
  sec('Demonstrativo operacional',[['Prazo previsto',`${fdate(p.planned_start)} a ${fdate(p.planned_end)} (${days(c.plannedDur)})`],['Prazo realizado',`${fdate(p.real_start)} a ${p.real_end?fdate(p.real_end):'em aberto'} (${days(c.realDur)})`],['Dias de execução',days(c.execDays)],['Dias de atraso',days(c.delay)],['Dias de paralisação',days(c.pauseDays)],['Desvio de prazo (realizado - previsto)',c.timeDev==null?'-':days(c.timeDev)]],{right:true});
  const hist=[];c.pauses.forEach(z=>{hist.push([z.start,'Paralisação: '+(z.reason||'')]);if(z.end)hist.push([z.end,'Retomada da execução'])});c.notes.forEach(n=>hist.push([n.date,n.text]));
  D.audit.filter(a=>a.project_id===p.id&&a.entity==='obra'&&['finalizou','reabriu'].includes(a.action)).forEach(a=>hist.push([new Date(a.ts).toISOString().slice(0,10),a.text]));
  hist.sort((a,b)=>a[0].localeCompare(b[0]));
  if(hist.length)sec('Histórico de execução',hist.map(h=>[fdate(h[0]),h[1]]),{cols:{0:{cellWidth:26,textColor:[90,95,104]}}});
  const ex=c.exps.slice().sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  if(ex.length)sec('Despesas lançadas',ex.map(e=>[fdate(e.date),e.category,(e.description||'')+(e.status==='estornada'?' (estornada)':''),e.supplier||'',money(e.amount)]),{head:['Data','Categoria','Descrição','Fornecedor','Valor'],cols:{0:{cellWidth:22},1:{cellWidth:36},3:{cellWidth:34},4:{halign:'right',cellWidth:28}}});
  if(c.recs.length)sec('Recebimentos',c.recs.slice().sort((a,b)=>(a.date||'').localeCompare(b.date||'')).map(r=>[fdate(r.date),r.description||'Recebimento',r.method||'',money(r.amount)]),{head:['Data','Descrição','Forma','Valor'],cols:{0:{cellWidth:22},2:{cellWidth:34},3:{halign:'right',cellWidth:30}}});
  const atts=[];ex.forEach(e=>(e.attachments||[]).forEach(a=>atts.push({...a,label:(a.kind==='nf'?'Nota fiscal':'Comprovante')+' · '+fdate(e.date)+' · '+(e.description||e.category)})));
  D.documents.filter(d=>d.project_id===p.id&&!d.deleted).forEach(d=>atts.push({id:d.asset,name:d.name,type:d.type,label:'Documento da obra'}));
  if(atts.length){
    sec('Anexos',atts.map(a=>[a.name||'anexo',a.label]),{head:['Arquivo','Referência'],cols:{0:{cellWidth:70}}});
    for(const a of atts.filter(a=>/^image\//.test(a.type||'')).slice(0,16)){
      const im=await imgData(a.id);if(!im)continue;
      doc.addPage();doc.setFontSize(9.5);doc.setTextColor(...MU);doc.text(doc.splitTextToSize(px(a.label+' · '+a.name),182),14,16);
      const k=Math.min(182/im.w,250/im.h);doc.addImage(im.d,'JPEG',14,24,im.w*k,im.h*k);
    }
  }
  const n=doc.getNumberOfPages();
  for(let i=1;i<=n;i++){doc.setPage(i);doc.setFontSize(8);doc.setTextColor(...MU);doc.text(px(`OBRA CONTROL · ${p.code} · gerado em ${fdate(today())}`),14,290);doc.text(`${i} / ${n}`,196,290,{align:'right'})}
  await save(`relatorio-${slug(p.code)}-${slug(p.name)}.pdf`,doc.output('arraybuffer'));
}
function exportXlsx(pid){
  if(!window.XLSX){toast('O gerador de Excel não carregou. Recarregue a página e tente de novo.');return}
  const ps=pid?[proj(pid)]:D.projects.slice(),ids=new Set(ps.map(p=>p.id)),wb=XLSX.utils.book_new();
  const sheet=(name,rows,moneyCols)=>{const ws=XLSX.utils.aoa_to_sheet(rows);ws['!cols']=rows[0].map((h,i)=>({wch:Math.min(48,Math.max(String(h).length+2,...rows.slice(1,60).map(r=>String(r[i]??'').length+2)))}));
    for(let r=1;r<rows.length;r++)for(const cidx of moneyCols){const a=XLSX.utils.encode_cell({r,c:cidx});if(ws[a]&&typeof ws[a].v==='number')ws[a].z='"R$" #,##0.00'}
    XLSX.utils.book_append_sheet(wb,ws,name)};
  sheet('Resumo',[['Código','Obra','Cliente','Status','Valor contratado','Custo previsto','Custo total','Lucro bruto','Margem (%)','Total recebido','Saldo a receber','Desvio de custo','Início previsto','Conclusão prevista','Início real','Conclusão real','Duração prevista (dias)','Duração real (dias)','Dias de paralisação','Dias de atraso','Execução (%)']]
   .concat(ps.map(p=>{const c=calc(p);return [p.code,p.name,(cli(p.client_id)||{}).name||'',STATUS[p.status],c.contracted,c.planned,c.cost,c.profit,c.margin==null?'':+c.margin.toFixed(2),c.received,c.receivable,c.costDev??'',fdate(p.planned_start),fdate(p.planned_end),fdate(p.real_start),fdate(p.real_end),c.plannedDur??'',c.realDur??'',c.pauseDays,c.delay,c.progress]})),[4,5,6,7,9,10,11]);
  const code=id=>(proj(id)||{}).code||'';
  sheet('Despesas',[['Data','Obra','Categoria','Descrição','Fornecedor','Forma de pagamento','Responsável','Valor','Situação','Observações','Anexos']].concat(D.expenses.filter(e=>ids.has(e.project_id)&&!e.deleted).sort((a,b)=>(a.date||'').localeCompare(b.date||'')).map(e=>[fdate(e.date),code(e.project_id),e.category,e.description||'',e.supplier||'',e.payment||'',e.responsible||'',+e.amount||0,e.status==='estornada'?'Estornada':'Ativa',e.notes||'',(e.attachments||[]).length])),[7]);
  sheet('Recebimentos',[['Data','Obra','Descrição','Forma de recebimento','Valor']].concat(D.receipts.filter(r=>ids.has(r.project_id)&&!r.deleted).sort((a,b)=>(a.date||'').localeCompare(b.date||'')).map(r=>[fdate(r.date),code(r.project_id),r.description||'',r.method||'',+r.amount||0])),[4]);
  sheet('Cronograma',[['Obra','Tipo','Início / data','Retomada','Descrição']].concat(D.events.filter(e=>ids.has(e.project_id)).map(e=>e.type==='pause'?[code(e.project_id),'Paralisação',fdate(e.start),e.end?fdate(e.end):'',e.reason||'']:[code(e.project_id),'Evento',fdate(e.date),'',e.text||''])),[]);
  save(pid?`obra-${slug(ps[0].code)}.xlsx`:`obra-control-${today()}.xlsx`,XLSX.write(wb,{bookType:'xlsx',type:'array'}));
}

/* ---------- ações ---------- */
const ACT={
  'close':closeModal,
  'new-project':()=>formProject(),'edit-project':id=>formProject(id),
  'new-expense':id=>formExpense(null,id||(route().page==='obra'?route().id:null)),'edit-expense':id=>formExpense(id),
  'reverse-expense':id=>{const e=D.expenses.find(x=>x.id===id),off=e.status==='estornada';confirmBox(off?'Desfazer estorno':'Estornar despesa',off?'A despesa volta a contar no custo da obra.':'A despesa continua no histórico, riscada, e deixa de contar no custo da obra.',off?'Desfazer estorno':'Estornar',async()=>{await put('expenses',{...e,status:off?'ativa':'estornada',updated_at:Date.now()});await log('despesa',off?'reativou':'estornou',e.project_id,`${off?'Estorno desfeito':'Despesa estornada'}: ${e.description||e.category} (${money(e.amount)})`,e.id)})},
  'del-expense':id=>{const e=D.expenses.find(x=>x.id===id);confirmBox('Excluir despesa',`${e.description||e.category}, ${money(e.amount)}. A exclusão fica registrada no histórico da obra.`,'Excluir',async()=>{await put('expenses',{...e,deleted:true,deleted_at:Date.now()});await log('despesa','excluiu',e.project_id,`Despesa excluída: ${e.description||e.category} (${money(e.amount)}, ${fdate(e.date)})`,e.id)})},
  'new-receipt':id=>formReceipt(null,id),'edit-receipt':id=>formReceipt(id),
  'del-receipt':id=>{const r=D.receipts.find(x=>x.id===id);confirmBox('Excluir recebimento',`${money(r.amount)} em ${fdate(r.date)}. A exclusão fica registrada no histórico.`,'Excluir',async()=>{await put('receipts',{...r,deleted:true,deleted_at:Date.now()});await log('recebimento','excluiu',r.project_id,`Recebimento excluído: ${money(r.amount)} (${fdate(r.date)})`,r.id)})},
  'new-pause':id=>formPause(id),'resume':id=>formResume(id),'new-event':id=>formEvent(id),
  'del-event':id=>{const v=D.events.find(x=>x.id===id);confirmBox('Excluir evento','O evento sai do cronograma. A exclusão fica registrada no histórico.','Excluir',async()=>{
    await del('events',id);
    await log('cronograma','excluiu',v.project_id,`Evento excluído: ${v.type==='pause'?'paralisação de '+fdate(v.start):v.text}`)})},
  'finalize':id=>formFinalize(id),'reopen':id=>formReopen(id),
  'pdf':id=>exportPdf(id),'xlsx':id=>exportXlsx(id),'xlsx-all':()=>exportXlsx(),
  'tab':id=>{tab=id;render()},
  'new-kind':k=>formProject(null,k),
  'del-project':id=>delProject(id),
  'pf-kind':k=>{PF.kind=k||'';render()},
  'fin-tab':t=>{FT=t;render()},
  'fin-import':()=>{const i=$('#ofx-in');if(i)i.click()},
  'fin-sel':id=>finSelect(id),
  'fin-kind':k=>{finSetKind(k)},
  'fin-confirm':()=>finConfirm(),
  'fin-skip':()=>finNext(true),
  'fin-transfer':()=>{finSetKind('transferencia')},
  'fin-ignore':()=>finIgnore(),
  'fin-link':()=>{FS.useLink=!FS.useLink;finPanel()},
  'fin-split':()=>{finToggleSplit()},
  'fin-split-add':()=>{FS.splits.push({dest:'',category:'',amount:0});finPanel()},
  'fin-split-del':i=>{FS.splits.splice(+i,1);finPanel()},
  'fin-quick':()=>{FS.quick=!FS.quick;finPanel()},
  'fin-quick-save':()=>finQuickSave(),
  'fin-undo':id=>finUndo(id),
  'fin-apply':()=>finApplyAll(),
  'fin-del-rule':id=>{confirmBox('Excluir regra','A regra deixa de sugerir destinos. Lançamentos já classificados não mudam.','Excluir',async()=>{await del('rules',id)})},
  'fin-acc-edit':id=>finAccEdit(id),
  'fin-month':()=>{},
  'del-center':c=>putSettings({...D.settings,centers:centers().filter(x=>x!==c)}).catch(e=>toast(errText(e))),
  'del-ccat':c=>putSettings({...D.settings,company_cats:companyCats().filter(x=>x!==c)}).catch(e=>toast(errText(e))),
  'share':id=>shareModal(id),
  'share-revoke':id=>revokeShare(id),
  'share-copy':async()=>{const i=$('#share-url');try{await navigator.clipboard.writeText(i.value);toast('Link copiado.')}catch(e){i.select();toast('Selecione e copie o link.')}},
  'termo':id=>{const p=proj(id);if(p)exportTermo(buildCV(p))},
  'termo-pub':()=>{if(PUB)exportTermo(PUB)},
  'auth-go':id=>{authView=id;render()},
  'logout':async()=>{try{await neon.auth.signOut()}catch(e){}me=null;myId=null;DEMO=null;D=LIVE;Object.assign(LIVE,blank());authView='login';phase='auth';location.hash='';render()},
  'ftog':(id,el)=>{FOPEN=!FOPEN;el.closest('.filters').classList.toggle('open',FOPEN)},
  'demo-on':()=>{DEMO=demoData();D=DEMO;location.hash='dashboard';render()},
  'demo-off':()=>{D=LIVE;DEMO=null;location.hash='dashboard';render()},
  'more':()=>modal({title:'Mais',cancel:'',body:`<nav class="nav"><button data-act="new-project" data-w>${ic('plus')}Nova Obra</button><a href="#clientes" data-act="close">${ic('user')}Clientes</a><a href="#financeiro" data-act="close">${ic('bank')}Financeiro</a><a href="#cronograma" data-act="close">${ic('cal')}Cronograma</a><a href="#relatorios" data-act="close">${ic('doc')}Relatórios</a><a href="#configuracoes" data-act="close">${ic('gear')}Configurações</a>${standalone()?'':`<button data-act="install">${ic('down')}Instalar aplicativo</button>`}${me?`<button data-act="logout">${ic('x')}Sair da conta</button>`:''}</nav>`}),
  'new-client':()=>formClient(),'edit-client':id=>formClient(id),
  'cl-lookup':()=>clLookup(),
  'cf-kind':k=>{CF.kind=k||'';render()},
  'cl-new-proj':v=>{const [cid,k]=String(v).split('|');formProject(null,k,cid)},
  'del-client':id=>{const c=cli(id);if(D.projects.some(p=>p.client_id===id)){modal({title:'Cliente com cadastros',body:'<p class="ink2">Este cliente tem obras, serviços ou vendas cadastrados e não pode ser excluído.</p>',cancel:'Entendi'});return}
    confirmBox('Excluir cliente',c.name,'Excluir',async()=>{await del('clients',id);if(location.hash==='#clientes-'+id)location.hash='clientes'})},
  'del-cat':id=>putSettings({...D.settings,categories:(D.settings.categories||[]).filter(c=>c!==id)}).catch(e=>toast(errText(e))),
  'del-doc':id=>{const d=D.documents.find(x=>x.id===id);confirmBox('Excluir documento',d.name+'. O arquivo sai da lista da obra e a exclusão fica no histórico.','Excluir',async()=>{await put('documents',{...d,deleted:true});await log('documento','excluiu',d.project_id,`Documento removido: ${d.name}`)})},
  'att':(id,el)=>{const url=new URL('/_blob/'+id,location.href).href;if(/^image\//.test(el.dataset.type)){$('#light').innerHTML=`<img src="${esc(url)}" alt="Anexo">`;$('#light').hidden=false}else{const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove()}}
};
document.addEventListener('click',e=>{
  if(e.target.id==='light'||e.target.closest('#light')){$('#light').hidden=true;return}
  if(e.target===M){closeModal();return}
  const b=e.target.closest('[data-act]');if(!b)return;
  const a=b.dataset.act;
  if(b.tagName!=='A')e.preventDefault();
  if(a==='close'){closeModal();return}
  if(M.contains(b)&&!['att','share-copy','cl-lookup'].includes(a)&&!(a.startsWith('fin-')&&a!=='fin-tab'))closeModal();
  if(ACT[a])ACT[a](b.dataset.id,b);
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('#light').hidden)$('#light').hidden=true;else if(!M.hidden)closeModal()}});
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.matches('[data-money]')){const d=t.value.replace(/\D/g,'').slice(0,13);t.value=d?money(+d/100):''}
  if(t.dataset.f==='q'){F.q=t.value;$('#elist').innerHTML=expBlock()}
  if(t.dataset.pf==='q'){PF.q=t.value;const e=$('#plist');e.innerHTML=projCards();stackLabels(e)}
  if(t.dataset.progress)$('#progv').textContent=t.value+'%';
  if(t.id==='cf-q'){CF.q=t.value;const e=$('#cl-list');e.innerHTML=clientRows();stackLabels(e)}
  if(t.id==='fi-cl_doc'){const d=onlyD(t.value);if((d.length===14||d.length===11)&&docOk(d)&&t.dataset.auto!==d){t.dataset.auto=d;clLookup()}}
  if(t.id==='fin-q'){FS.q=t.value;const l=t.closest('#fin-panel')&&t.closest('#fin-panel').querySelector('#fdest-list');if(l)l.innerHTML=finDestList()}
  if(t.dataset.fin==='samount'){FS.splits[+t.dataset.i].amount=mval(t.value);const e=t.closest('#fin-panel')&&t.closest('#fin-panel').querySelector('#fin-sum');if(e)e.outerHTML=finSumHTML()}
  if(t.id==='fin-txq'){FTQ=t.value;const l=$('#fin-done');if(l)l.innerHTML=finDoneRows()}
});
document.addEventListener('change',async e=>{
  const t=e.target;
  try{
    if(t.dataset.f&&t.dataset.f!=='q'){F[t.dataset.f]=t.value;$('#elist').innerHTML=expBlock()}
    if(t.dataset.pf==='status'){PF.status=t.value;const e=$('#plist');e.innerHTML=projCards();stackLabels(e)}
    if(t.dataset.progress){const p=proj(t.dataset.progress),pl=(p.progress_log||[]).filter(x=>x.d!==today());pl.push({d:today(),v:+t.value});await put('projects',{...p,progress:+t.value,progress_log:pl,updated_at:Date.now()});await log('cronograma','editou',p.id,`Percentual de execução atualizado para ${t.value}%`)}
    if(t.dataset.status){const p=proj(t.dataset.status),s=t.value;
      if(s==='concluida'){t.value=p.status;formFinalize(p.id);return}
      const o={...p,status:s,updated_at:Date.now()};if(s==='andamento'&&!o.real_start)o.real_start=today();
      await put('projects',o);await log('obra','editou',p.id,`Status alterado de ${STATUS[p.status]} para ${STATUS[s]}`,p.id)}
    if(t.id==='fi-cl_cep'){cepLookup(t);return}
    if(t.id==='ofx-in'){const files=[...t.files];t.value='';if(files.length)await finImport(files);return}
    if(t.dataset.fin){finField(t);return}
    if(t.dataset.docup){const pid=t.dataset.docup,files=[...t.files];t.value='';toast('Enviando…');
      for(const a of await upload(files,'doc')){await put('documents',{id:uid('d'),project_id:pid,asset:a.id,name:a.name,type:a.type,size:a.size,created_at:Date.now()});await log('documento','criou',pid,`Documento anexado: ${a.name}`)}
      toast('Documento anexado.')}
  }catch(err){console.error(err);toast(t.dataset.docup?'Não foi possível enviar o arquivo. Verifique o tamanho (até 20 MB) e sua permissão.':errText(err))}
});
document.addEventListener('submit',async e=>{
  const f=e.target,k=f.dataset.form;if(!k)return;e.preventDefault();
  if(k==='auth'){authSubmit(f);return}
  if(k==='center'||k==='ccat'){const v=(f.elements.v.value||'').trim();if(!v)return;const list=k==='center'?centers():companyCats();if(list.some(x=>x.toLowerCase()===v.toLowerCase())){toast('Já existe.');return}
    try{await putSettings({...D.settings,[k==='center'?'centers':'company_cats']:[...list,v]});toast('Adicionado.')}catch(err){toast(errText(err))}return}
  try{
    if(k==='company'){const v=vals(f);await putSettings({...D.settings,company:v.company||'',company_doc:v.company_doc||'',company_phone:v.company_phone||'',company_address:v.company_address||'',company_resp:v.company_resp||''});toast('Dados da empresa salvos.')}
    if(k==='cat'){const c=f.elements.cat.value.trim();if(!c)return;if(allCats().some(x=>x.toLowerCase()===c.toLowerCase())){toast('Essa categoria já existe.');return}
      await putSettings({...D.settings,categories:[...(D.settings.categories||[]),c]});toast('Categoria adicionada.')}
  }catch(err){toast(errText(err))}
});
addEventListener('hashchange',()=>{$('#main').scrollTop=0;render()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&me&&!isDemo()&&M.hidden&&Date.now()-lastLoad>30000)loadAll().then(schedule).catch(()=>{})});
/* ---------- aplicativo instalável ---------- */
let installEvt=null;
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e;schedule()});
addEventListener('appinstalled',()=>{installEvt=null;toast('Aplicativo instalado.');schedule()});
if('serviceWorker' in navigator&&location.protocol==='https:')addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
async function installApp(){
  if(installEvt){installEvt.prompt();try{await installEvt.userChoice}catch(e){}installEvt=null;schedule();return}
  const ios=isIOS();
  modal({title:'Instalar o aplicativo',cancel:'Fechar',body:ios
    ?`<p class="ink2">No iPhone ou iPad, abra este endereço no <b>Safari</b> e:</p><ol class="ink2" style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px"><li>Toque em <b>Compartilhar</b> (o quadrado com a seta para cima).</li><li>Escolha <b>Adicionar à Tela de Início</b>.</li><li>Toque em <b>Adicionar</b>.</li></ol>`
    :`<p class="ink2">No Android, abra este endereço no <b>Chrome</b>, toque no menu <b>⋮</b> e escolha <b>Instalar app</b> (ou <b>Adicionar à tela inicial</b>).</p><p class="ink2">No computador, use o ícone de instalar na barra de endereço do Chrome ou do Edge.</p>`});
}
ACT['install']=installApp;

init();
