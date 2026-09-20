/* Genreactrix v0.9.39.90 — lightweight live event log.
   Session-scoped diagnostic feed only; no workflow or Worker behavior changes. */
(()=>{'use strict';
  const KEY='genreactrix-event-log-session-v1',MAX=400;
  let entries=[],lastLine='',lastAt=0,output=null;
  try{const saved=JSON.parse(sessionStorage.getItem(KEY)||'[]');if(Array.isArray(saved))entries=saved.slice(-MAX);}catch{}

  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const flatten=value=>{
    if(value instanceof Error)return `${value.name}: ${value.message}`;
    if(typeof value==='string')return value;
    try{return JSON.stringify(value);}catch{return String(value);}
  };
  function persist(){try{sessionStorage.setItem(KEY,JSON.stringify(entries.slice(-MAX)));}catch{}}
  function render(){
    output=document.getElementById('eventLogOutput')||output;if(!output)return;
    output.innerHTML=entries.map(entry=>`<div class="event-log-line level-${entry.level}"><span class="event-log-time">[${esc(entry.time)}]</span> <span class="event-log-source">${esc(entry.source)}</span> <span class="event-log-message">${esc(entry.message)}</span></div>`).join('');
    output.scrollTop=output.scrollHeight;
    const count=document.getElementById('eventLogCount');if(count)count.textContent=String(entries.length);
  }
  function write(level='info',message='',source='APP'){
    message=String(message??'').trim();if(!message)return;
    const now=Date.now(),signature=`${level}|${source}|${message}`;
    if(signature===lastLine&&now-lastAt<500)return;
    lastLine=signature;lastAt=now;
    entries.push({time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'}),level,source,message});
    if(entries.length>MAX)entries=entries.slice(-MAX);persist();render();
  }
  window.genreactrixEventLog={write,info:(m,s)=>write('info',m,s),warn:(m,s)=>write('warn',m,s),error:(m,s)=>write('error',m,s),clear:()=>{entries=[];persist();render();},entries:()=>structuredClone(entries)};

  const originalWarn=console.warn.bind(console),originalError=console.error.bind(console);
  console.warn=(...args)=>{write('warn',args.map(flatten).join(' '),'WARN');originalWarn(...args);};
  console.error=(...args)=>{write('error',args.map(flatten).join(' '),'ERROR');originalError(...args);};
  window.addEventListener('error',event=>write('error',event.error?flatten(event.error):event.message,'WINDOW'));
  window.addEventListener('unhandledrejection',event=>write('error',flatten(event.reason),'PROMISE'));

  const queueSignatures=new Map();
  window.addEventListener('genreactrix:queue',event=>{
    const jobs=event.detail?.jobs||[];
    for(const job of jobs){
      const signature=[job.state,job.completed,job.failed,job.skipped,job.total,job.message].join('|');
      if(queueSignatures.get(job.id)===signature)continue;
      queueSignatures.set(job.id,signature);
      const level=job.state==='failed'?'error':job.state==='completed-with-failures'?'warn':'info';
      const counts=job.total?` ${Number(job.completed)||0}/${Number(job.total)||0}`:'';
      const failures=job.failed?` · ${job.failed} failed`:'';
      write(level,`${job.label} · ${job.state}${counts}${failures}${job.message?` · ${job.message}`:''}`,'QUEUE');
    }
  });
  window.addEventListener('genreactrix:notification',event=>{
    const n=event.detail?.notification||event.detail;if(!n)return;
    const level=n.severity==='critical'?'error':n.severity==='attention'?'warn':'info';
    write(level,[n.title,n.message].filter(Boolean).join(' · '),'NOTICE');
  });

  function observeStatus(id,source){
    const node=document.getElementById(id);if(!node)return;
    let previous='';
    const capture=()=>{const text=(node.textContent||'').trim();if(!text||text===previous)return;previous=text;const lower=text.toLowerCase();const level=/fail|error|could not|blocked|unsupported/.test(lower)?'error':/warn|attention|paused|retry/.test(lower)?'warn':'info';write(level,text,source);};
    new MutationObserver(capture).observe(node,{childList:true,subtree:true,characterData:true});
  }

  document.addEventListener('DOMContentLoaded',()=>{
    output=document.getElementById('eventLogOutput');
    document.getElementById('portraitEventLogBtn')?.addEventListener('click',()=>{render();document.getElementById('eventLogDialog')?.showModal();});
    document.getElementById('eventLogClose')?.addEventListener('click',()=>document.getElementById('eventLogDialog')?.close());
    document.getElementById('eventLogClear')?.addEventListener('click',()=>{entries=[];persist();write('info','Log cleared.','SYSTEM');});
    [['portraitStationStatus','PORTRAIT'],['directorStatus','DIRECTOR'],['aiJobSummary','AI'],['aiProviderStatus','AI'],['aiAutomaticStatus','AI'],['imagesConsoleStatus','IMAGES'],['imageIntakePreview','IMPORT'],['themeError','THEME'],['tabletThemeError','THEME']].forEach(([id,source])=>observeStatus(id,source));
    write('info','Live event log ready.','SYSTEM');render();
  });
})();
