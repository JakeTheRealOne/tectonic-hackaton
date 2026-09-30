'use strict';
const DEMO_QUESTION = 'What should we quote Northstar Retail for a managed-payroll setup for 120 employees in Belgium?';
const AS_OF = Date.UTC(2026, 8, 30);
const evidence = [
 {country:'Greece',date:'14 Jun 2023',price:'€10,000',client:'Aegean Stores',size:300,author:'Maria Papadopoulos',initials:'MP',documents:3,relevance:['Low','low'],freshness:['Older · 2023','low'],similarity:['Different client & scale','low'],note:'Same service, but a larger workforce and a different country.'},
 {country:'Netherlands',date:'18 Nov 2025',price:'€5,000',client:'Canal Retail',size:100,author:'Tom de Vries',initials:'TV',documents:2,relevance:['Partial','mid'],freshness:['2025','mid'],similarity:['Similar scale','mid'],note:'Comparable retailer and size. Belgian pricing is still unconfirmed.'},
 {country:'United Kingdom',date:'09 Sep 2026',price:'£7,000',client:'Northstar Retail',size:120,author:'Emma Clarke',initials:'EC',documents:1,relevance:['Partial','mid'],freshness:['Recent · 2026','high'],similarity:['Same client & scale','high'],note:'Strong client match. Different country, currency and potentially scope.'}
];
const people = [
 {name:'Sophie Peeters',initials:'SP',role:'Payroll Implementation Lead · Belgium',context:96,activity:'2026-09-24',contributions:8,reason:'Owns Belgian payroll setup guidance and recently documented migration and integration requirements.',helps:'Belgian pricing and implementation scope',support:'Belgian setup guidance · Migration checklist'},
 {name:'Emma Clarke',initials:'EC',role:'Client Implementation Manager · UK',context:85,activity:'2026-09-09',contributions:6,reason:'Led Northstar’s recent UK implementation and knows the client’s systems and migration needs.',helps:'Northstar’s client-specific requirements',support:'Northstar UK proposal · Integration notes'},
 {name:'Tom de Vries',initials:'TV',role:'Payroll Solutions Consultant · Netherlands',context:76,activity:'2026-09-02',contributions:9,reason:'Frequently contributes to retail payroll proposals and can explain comparable setup costs.',helps:'Comparable retail scope and cost drivers',support:'Retail pricing notes · Canal Retail proposals'},
 {name:'Maria Papadopoulos',initials:'MP',role:'Payroll Consultant · Greece',context:42,activity:'2023-06-14',contributions:3,reason:'Authored the Greek project records.',helps:'Historical Greek project scope',support:'Aegean Stores records'},
 {name:'Lucas Martin',initials:'LM',role:'Knowledge Coordinator · France',context:31,activity:'2026-09-28',contributions:12,reason:'Publishes frequently, with limited Belgian payroll pricing context.',helps:'Knowledge documentation',support:'General onboarding guides'}
];
const $ = id => document.getElementById(id);
const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
let run = 0;
let searching = false;
let finding = false;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function normalize(value){ return value.toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim(); }
function rankPeople(){
 return people.map(person => {
  const days = Math.max(0, Math.floor((AS_OF - Date.parse(person.activity+'T00:00:00Z')) / 86400000));
  const recency = Math.max(0, Math.round(100 * (1 - days/365)));
  const contribution = Math.min(person.contributions,10)*10;
  const score = Math.round(.5*person.context + .3*recency + .2*contribution);
  return {...person,days,recency,contribution,score};
 }).sort((a,b)=>b.score-a.score).slice(0,3);
}
function renderEvidence(){
 $('result-cards').innerHTML = evidence.map((item,i)=>`<article class="result-card"><div class="card-body"><div class="card-top"><span class="country">${item.country}</span><span class="doc-id">SOURCE 0${i+1}</span></div><div class="price">${item.price}</div><div class="price-caption">One-time setup fee</div><h4>${item.client}</h4><div class="card-meta">${item.size} employees · ${item.date}</div><div class="metrics">${[['Relevance',item.relevance],['Freshness',item.freshness],['Similarity',item.similarity]].map(([label,tag])=>`<div class="metric-row"><span>${label}</span><span class="tag tag-${tag[1]}">${tag[0]}</span></div>`).join('')}</div><p class="card-note">${item.note}</p></div><div class="card-footer"><span class="tiny-avatar">${item.initials}</span><div><strong>${item.author}</strong><br>${item.documents} document${item.documents===1?'':'s'} · ${item.documents===1?'One proposal':'Same project, repeated quote'}</div></div></article>`).join('');
}
function renderExperts(){
 const ranked=rankPeople();
 $('expert-cards').innerHTML=ranked.map((person,i)=>`<article class="expert-card"><div class="expert-rank">0${i+1} / ${i===0?'STRONGEST MATCH':'RECOMMENDED'}</div><div class="expert-person"><div class="expert-avatar">${person.initials}</div><div><h3>${person.name}</h3><div class="expert-role">${person.role}</div></div></div><div class="score-row"><span>Match score</span><span class="score-number">${person.score}<small> / 100</small></span></div><div class="score-track" aria-hidden="true"><div class="score-fill" style="width:${person.score}%"></div></div><p class="expert-reason">${person.reason}</p><div class="expert-facts"><div>Last relevant activity <b>${new Date(person.activity+'T00:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'})}</b></div><div><b>${person.contributions} distinct relevant contributions</b></div><div>${person.support}</div></div><div class="expert-helps"><span>CAN HELP CLARIFY</span>${person.helps}</div><details><summary>Why this match score?</summary><div class="factor-list"><div><span>Context match · 50%</span><b>${person.context}/100</b></div><div><span>Recent activity · 30%</span><b>${person.recency}/100</b></div><div><span>Contributions · 20%</span><b>${person.contribution}/100</b></div></div></details></article>`).join('');
 return ranked;
}
async function search(question){
 if(searching) return {status:'busy'};
 const clean=String(question).trim();
 if(!clean){$('input-error').textContent='Enter a question to search.';$('input-error').hidden=false;$('question').focus();return {status:'invalid'};}
 if(normalize(clean)!==normalize(DEMO_QUESTION)){
  $('input-error').textContent='This demo uses one scenario. Select the sample question below or paste the Northstar Retail question.';$('input-error').hidden=false;
  $('example').hidden=false;$('example').style.display='flex';return {status:'unsupported'};
 }
 $('input-error').hidden=true;$('example').style.removeProperty('display');
 const current=++run;searching=true;finding=false;
 $('question').value=clean;$('search-area').classList.add('compact');
 ['results','experts','experts-loading'].forEach(id=>$(id).hidden=true);
 $('search-loading').hidden=false;$('search-button').disabled=true;$('search-button').textContent='Searching…';
 $('find-experts').disabled=false;$('find-experts').lastChild.textContent='Find someone who can clarify';
 const stages=['Searching proposals and project notes…','Comparing countries, clients and project scope…','Checking dates, relevance and evidence gaps…'];
 for(const stage of stages){$('loading-text').textContent=stage;await sleep(reducedMotion()?120:700);if(current!==run)return {status:'cancelled'};}
 renderEvidence();$('search-loading').hidden=true;$('results').hidden=false;
 searching=false;$('search-button').disabled=false;$('search-button').innerHTML='Search <span aria-hidden="true">↵</span>';
 $('results-title').focus({preventScroll:true});
 return {status:'complete',projects:3,gap:'Belgian setup pricing and Northstar migration/integration requirements'};
}
async function findExperts(){
 if($('results').hidden) throw new Error('Search the demo question first.');
 if(finding)return {status:'busy'};
 if(!$('experts').hidden){$('experts').scrollIntoView({behavior:reducedMotion()?'instant':'smooth',block:'start'});return {status:'complete',people:rankPeople().map(p=>({name:p.name,score:p.score}))};}
 finding=true;const current=run;$('find-experts').disabled=true;$('experts-loading').hidden=false;
 $('experts-loading').scrollIntoView({behavior:reducedMotion()?'instant':'smooth',block:'center'});
 await sleep(reducedMotion()?120:1350);if(current!==run)return {status:'cancelled'};
 const ranked=renderExperts();$('experts-loading').hidden=true;$('experts').hidden=false;finding=false;$('find-experts').disabled=false;
 $('find-experts').lastChild.textContent='View recommended people';
 $('experts-title').focus({preventScroll:true});$('experts').scrollIntoView({behavior:reducedMotion()?'instant':'smooth',block:'start'});
 return {status:'complete',people:ranked.map(p=>({name:p.name,score:p.score}))};
}
function reset(){
 run++;searching=false;finding=false;
 ['results','experts','search-loading','experts-loading','input-error'].forEach(id=>$(id).hidden=true);
 $('search-area').classList.remove('compact');$('question').value='';$('search-button').disabled=false;
 $('search-button').innerHTML='Search <span aria-hidden="true">↵</span>';$('find-experts').disabled=false;
 $('example').hidden=false;$('example').style.removeProperty('display');
 $('question').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});
}
$('search-form').addEventListener('submit',event=>{event.preventDefault();void search($('question').value);});
$('question').addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();void search($('question').value);}});
$('sample').addEventListener('click',()=>{$('question').value=DEMO_QUESTION;$('input-error').hidden=true;$('question').focus();});
$('find-experts').addEventListener('click',()=>{void findExperts();});
$('reset').addEventListener('click',reset);
// Optional browser-agent access shares the same visible actions; no network calls or data collection.
if(document.modelContext?.registerTool){
 const tools=[
  {name:'search_demo_knowledge',title:'Search demo knowledge',description:'Run the fictional Northstar Retail search and show comparable projects.',inputSchema:{type:'object',properties:{question:{type:'string'}},required:['question'],additionalProperties:false},execute:async input=>{if(!input||typeof input.question!=='string'||Object.keys(input).some(k=>k!=='question'))throw new Error('A question string is required.');const result=await search(input.question);if(result.status==='invalid'||result.status==='unsupported')throw new Error('Use the supported Northstar Retail demo question.');return result;}},
  {name:'find_gap_experts',title:'Find people to clarify the gap',description:'After a successful search, show three people ranked for the Belgian pricing and implementation gap.',inputSchema:{type:'object',properties:{},additionalProperties:false},execute:async input=>{if(!input||Object.keys(input).length)throw new Error('No arguments expected.');return findExperts();}}
 ];
 const lifecycle=new AbortController();window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
 for(const tool of tools){try{Promise.resolve(document.modelContext.registerTool({...tool,annotations:{readOnlyHint:false,untrustedContentHint:false}},{signal:lifecycle.signal})).catch(()=>{});}catch{}}
}
