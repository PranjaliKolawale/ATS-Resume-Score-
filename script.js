pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ---------- data ----------
const MASTER_KEYWORDS = ["JavaScript","TypeScript","Python","Java","SQL","React","Node.js","AWS","Azure","GCP","Docker","Kubernetes","CI/CD","Git","REST API","GraphQL","Agile","Scrum","Machine Learning","Data Analysis","Data Visualization","Tableau","Power BI","Excel","A/B Testing","SEO","SEM","Google Analytics","Content Marketing","Social Media Marketing","Email Marketing","CRM","Salesforce","HubSpot","Lead Generation","Negotiation","Account Management","Figma","Sketch","Adobe XD","User Research","Wireframing","Prototyping","Usability Testing","Product Roadmap","Stakeholder Management","Cross-functional","KPI","Budgeting","Forecasting","Financial Modeling","GAAP","Accounts Payable","Accounts Receivable","Reconciliation","Project Management","PMP","Risk Management","Vendor Management","Onboarding","Recruiting","Performance Management","Employee Relations","HRIS","Compliance","Customer Success","Retention","Churn","Escalation Management","Zendesk","Communication","Leadership","Problem Solving","Team Management","Time Management","Public Speaking","Presentation","Strategic Planning","Process Improvement","Six Sigma","Supply Chain","Inventory Management","Logistics","Quality Assurance","Testing","Debugging","API Integration","Cloud Computing","Cybersecurity","Networking","Linux","Spring Boot","Django","Flask","HTML","CSS","Power Automate","Jira","Confluence","Slack","Notion","Data Warehousing","ETL","Snowflake","BigQuery","Statistics","Regression","Copywriting","Brand Strategy","Market Research","Competitive Analysis","Pricing Strategy","Partnerships","B2B","B2C","SaaS","Go-to-Market","Sales Pipeline","Cold Outreach","Closing","Quota Attainment","Onboarding Flows","Deep Learning","NLP","Pandas","NumPy","PyTorch","TensorFlow"];

const STOPWORDS = new Set(("a about above after again against all am an and any are as at be because been before being below between both but by could did do does doing down during each few for from further had has have having he her here hers herself him himself his how i if in into is it its itself just me more most my myself nor not of off on once only or other our ours ourselves out over own same she should so some such than that the their theirs them themselves then there these they this those through to too under until up very was we were what when where which while who whom why will with you your yours yourself yourselves will strong looking seeking role work team join across using help support ability years experience including etc plus new also within").split(" "));

const ROLES = {
  "software-engineer": {label:"Software Engineer", keywords:["JavaScript","Python","React","Node.js","SQL","AWS","Docker","Git","REST API","CI/CD","Agile","Scrum","Debugging","Testing","Cloud Computing","Kubernetes","Problem Solving","Cross-functional"]},
  "data-analyst": {label:"Data Analyst / Data Scientist", keywords:["SQL","Python","Data Analysis","Data Visualization","Tableau","Power BI","Excel","Statistics","Regression","Machine Learning","ETL","BigQuery","Pandas","NumPy","A/B Testing","Forecasting"]},
  "product-manager": {label:"Product Manager", keywords:["Product Roadmap","Stakeholder Management","Agile","Scrum","KPI","User Research","A/B Testing","Cross-functional","Market Research","Prioritization","Go-to-Market","Jira","Data Analysis","Strategic Planning"]},
  "marketing": {label:"Digital Marketing", keywords:["SEO","SEM","Google Analytics","Content Marketing","Social Media Marketing","Email Marketing","A/B Testing","Brand Strategy","Copywriting","Market Research","Campaign Management","HubSpot","KPI"]},
  "sales": {label:"Sales / Business Development", keywords:["Lead Generation","Negotiation","Account Management","CRM","Salesforce","Sales Pipeline","Cold Outreach","Closing","Quota Attainment","Partnerships","B2B","Forecasting","Communication"]},
  "ux-designer": {label:"UX / UI Designer", keywords:["Figma","Sketch","Adobe XD","User Research","Wireframing","Prototyping","Usability Testing","Interaction Design","Design Systems","Cross-functional","Accessibility"]},
  "project-manager": {label:"Project / Program Manager", keywords:["Project Management","PMP","Risk Management","Vendor Management","Stakeholder Management","Budgeting","Agile","Scrum","Process Improvement","Jira","Confluence","Cross-functional"]},
  "finance": {label:"Finance / Accounting Analyst", keywords:["Financial Modeling","Budgeting","Forecasting","GAAP","Accounts Payable","Accounts Receivable","Reconciliation","Excel","Variance Analysis","Compliance","Risk Management"]},
  "hr": {label:"HR / People Ops", keywords:["Recruiting","Onboarding","Performance Management","Employee Relations","HRIS","Compliance","Employee Engagement","Policy Development","Conflict Resolution"]},
  "customer-success": {label:"Customer Success", keywords:["Customer Success","Retention","Churn","Onboarding Flows","Escalation Management","Zendesk","CRM","Account Management","Communication","Upselling"]}
};

const roleSelect = document.getElementById('roleSelect');
Object.entries(ROLES).forEach(([key,r])=>{
  const opt = document.createElement('option');
  opt.value = key; opt.textContent = r.label;
  roleSelect.appendChild(opt);
});

document.getElementById('fileNo').textContent = 'SCAN #' + Math.floor(1000+Math.random()*9000);

// ---------- mode tabs ----------
let mode = 'role';
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;
    document.getElementById('pane-role').classList.toggle('active', mode==='role');
    document.getElementById('pane-jd').classList.toggle('active', mode==='jd');
    validateReady();
  });
});
roleSelect.addEventListener('change', validateReady);
document.getElementById('jdText').addEventListener('input', validateReady);

// ---------- file handling ----------
let resumeFile = null;
let resumeText = '';

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const fileChip = document.getElementById('fileChip');
const fileErr = document.getElementById('fileErr');

dropzone.addEventListener('click', ()=>fileInput.click());
dropzone.addEventListener('dragover', e=>{e.preventDefault(); dropzone.classList.add('drag');});
dropzone.addEventListener('dragleave', ()=>dropzone.classList.remove('drag'));
dropzone.addEventListener('drop', e=>{
  e.preventDefault(); dropzone.classList.remove('drag');
  if(e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', e=>{
  if(e.target.files.length) handleFile(e.target.files[0]);
});
document.getElementById('fileRemove').addEventListener('click', e=>{
  e.stopPropagation();
  resumeFile = null; resumeText = '';
  fileChip.classList.remove('show');
  fileInput.value = '';
  validateReady();
});

function handleFile(file){
  fileErr.classList.remove('show');
  const name = file.name.toLowerCase();
  if(!name.endsWith('.pdf') && !name.endsWith('.docx')){
    fileErr.textContent = "That file type isn't it — upload a .pdf or .docx resume.";
    fileErr.classList.add('show');
    return;
  }
  resumeFile = file;
  document.getElementById('fileName').textContent = file.name;
  fileChip.classList.add('show');
  validateReady();
}

function validateReady(){
  const hasTarget = mode==='role' ? !!roleSelect.value : document.getElementById('jdText').value.trim().length > 30;
  document.getElementById('runBtn').disabled = !(hasTarget && resumeFile);
}

// ---------- extraction helpers ----------
function escapeRegex(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}

async function extractResumeText(file){
  const name = file.name.toLowerCase();
  if(name.endsWith('.pdf')){
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({data:buf}).promise;
    let text = '';
    for(let i=1;i<=pdf.numPages;i++){
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(it=>it.str).join(' ') + '\n';
    }
    return text;
  } else {
    const buf = await file.arrayBuffer();
    const result = await mammoth.extractRawText({arrayBuffer:buf});
    return result.value;
  }
}

function extractKeywordsFromJD(text){
  const lower = text.toLowerCase();
  const matched = MASTER_KEYWORDS.filter(k=> new RegExp('\\b'+escapeRegex(k.toLowerCase())+'\\b').test(lower));
  const words = lower.replace(/[^a-z0-9+.# ]/g,' ').split(/\s+/).filter(w=>w.length>2 && !STOPWORDS.has(w));
  const freq = {};
  words.forEach(w=>freq[w]=(freq[w]||0)+1);
  const extra = Object.entries(freq)
    .filter(([w,c])=>c>=2 && !matched.some(m=>m.toLowerCase()===w))
    .sort((a,b)=>b[1]-a[1]).slice(0,10).map(([w])=>w);
  const all = [...matched, ...extra];
  return [...new Set(all)].slice(0,25);
}

function scoreKeywords(keywords, resumeLower){
  const found = keywords.filter(k=> new RegExp('\\b'+escapeRegex(k.toLowerCase())+'\\b').test(resumeLower));
  const missing = keywords.filter(k=>!found.includes(k));
  const pct = keywords.length ? Math.round(found.length/keywords.length*100) : 0;
  return {found, missing, pct};
}

function checkStructure(text){
  const checks = [];
  checks.push({label:'Email address found', pass: /[\w.+-]+@[\w-]+\.[\w.-]+/.test(text)});
  checks.push({label:'Phone number found', pass: /(\+?\d[\d\-.\s()]{8,}\d)/.test(text)});
  checks.push({label:'"Experience" section present', pass: /experience/i.test(text)});
  checks.push({label:'"Education" section present', pass: /education/i.test(text)});
  checks.push({label:'Skills section present', pass: /skills/i.test(text)});
  checks.push({label:'Bullet points used', pass: (text.match(/^[\s]{0,4}[•\-\*]/gm)||[]).length >= 3});
  const wc = text.trim().split(/\s+/).filter(Boolean).length;
  checks.push({label:'Word count in healthy range (300–900)', pass: wc>=300 && wc<=900, note: wc+' words'});
  const passCount = checks.filter(c=>c.pass).length;
  const pct = Math.round(passCount/checks.length*100);
  return {checks, pct};
}

// ---------- confetti ----------
function burstConfetti(container){
  const emojis = ['✨','🔥','💫','⭐','💅','🎉'];
  for(let i=0;i<14;i++){
    const el = document.createElement('span');
    el.className = 'confetti';
    el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    const angle = Math.random()*Math.PI*2;
    const dist = 60 + Math.random()*70;
    el.style.setProperty('--dx', Math.cos(angle)*dist + 'px');
    el.style.setProperty('--dy', Math.sin(angle)*dist + 'px');
    el.style.setProperty('--rot', (Math.random()*360-180) + 'deg');
    el.style.animationDelay = (Math.random()*0.15) + 's';
    container.appendChild(el);
    setTimeout(()=>el.remove(), 1100);
  }
}

// ---------- run ----------
document.getElementById('runBtn').addEventListener('click', runScan);
document.getElementById('resetBtn').addEventListener('click', ()=>{
  document.getElementById('results').classList.remove('show');
  window.scrollTo({top:0, behavior:'smooth'});
});

async function runScan(){
  const overlay = document.getElementById('scanOverlay');
  const status = document.getElementById('scanStatus');
  overlay.classList.add('show');
  document.getElementById('runBtn').disabled = true;
  document.getElementById('results').classList.remove('show');

  try{
    status.textContent = 'Reading your resume…';
    resumeText = await extractResumeText(resumeFile);
    if(!resumeText || resumeText.trim().length < 40){
      throw new Error('parse-empty');
    }
    const resumeLower = resumeText.toLowerCase();

    let targetText, targetLabel, keywords;
    if(mode==='role'){
      const role = ROLES[roleSelect.value];
      targetLabel = role.label;
      targetText = role.label + '. Key requirements: ' + role.keywords.join(', ') + '.';
      keywords = role.keywords;
    } else {
      targetText = document.getElementById('jdText').value;
      targetLabel = 'the pasted job description';
      keywords = extractKeywordsFromJD(targetText);
    }

    status.textContent = 'Matching keywords…';
    const kwResult = scoreKeywords(keywords, resumeLower);

    status.textContent = 'Checking formatting…';
    const structResult = checkStructure(resumeText);

    const combined = Math.round(kwResult.pct*0.7 + structResult.pct*0.3);

    renderResults({kwResult, structResult, combined});

  }catch(err){
    fileErr.textContent = "Couldn't read that file — try re-saving it as a standard PDF or DOCX and upload again.";
    fileErr.classList.add('show');
  } finally {
    overlay.classList.remove('show');
    document.getElementById('runBtn').disabled = false;
  }
}

function renderResults({kwResult, structResult, combined}){
  const results = document.getElementById('results');
  results.classList.add('show');

  const stamp = document.getElementById('stamp');
  stamp.classList.remove('amber','red');
  stamp.style.animation = 'none'; void stamp.offsetWidth; stamp.style.animation = '';
  let verdict;
  if(combined>=80){ verdict='SLAYS ✨'; }
  else if(combined>=55){ verdict='MID — FIXABLE'; stamp.classList.add('amber'); }
  else { verdict='GLOW UP TIME 🌱'; stamp.classList.add('red'); }
  document.getElementById('verdictText').textContent = verdict;
  document.getElementById('scoreText').textContent = 'SCORE: ' + combined + '/100';

  setTimeout(()=>{
    document.getElementById('barKeyword').style.width = kwResult.pct + '%';
    document.getElementById('barStructure').style.width = structResult.pct + '%';
    burstConfetti(document.getElementById('stampRow'));
  }, 60);
  document.getElementById('pctKeyword').textContent = kwResult.pct + '%';
  document.getElementById('pctStructure').textContent = structResult.pct + '%';

  const foundEl = document.getElementById('tagsFound');
  const missEl = document.getElementById('tagsMissing');
  foundEl.innerHTML = kwResult.found.length
    ? kwResult.found.map(k=>`<span class="tag found">${k}</span>`).join('')
    : '<span class="note">None matched — check the missing keywords below.</span>';
  missEl.innerHTML = kwResult.missing.length
    ? kwResult.missing.map(k=>`<span class="tag missing">${k}</span>`).join('')
    : '<span class="note">Nothing missing — solid coverage.</span>';

  const cl = document.getElementById('checklist');
  cl.innerHTML = structResult.checks.map(c=>
    `<li><span class="mark ${c.pass?'pass':'fail'}">${c.pass?'✓':'✗'}</span>
     <span>${c.label}${c.note?` <span class="note">(${c.note})</span>`:''}</span></li>`
  ).join('');

  results.scrollIntoView({behavior:'smooth', block:'start'});
}
