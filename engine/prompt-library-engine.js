/* Genreactrix Prompt Library Engine v1 */
(()=>{'use strict';
 const KEY='genreactrix-prompt-library-v1', BENCH='genreactrix-prompt-benchmarks-v1';
 const now=()=>new Date().toISOString(),clone=v=>structuredClone(v),uid=p=>`${p}_${Date.now().toString(36)}_${crypto.randomUUID().slice(0,8)}`;
 const CATEGORIES=['reactions','themes','description','emotion','reactionReasons','genreReasons','primfusion','quality','metadata'];
 const load=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))||f}catch{return f}};
 const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
 let prompts=load(KEY,[]), benchmarks=load(BENCH,[]);
 function seed(){if(prompts.length)return;for(const c of CATEGORIES.slice(0,6))prompts.push({id:`prompt_${c}`,version:1,name:`${c[0].toUpperCase()+c.slice(1)} default`,description:`Canonical ${c} analysis prompt`,category:c,providerCompatibility:['openai'],status:'active',text:'',createdAt:now(),modifiedAt:now(),parentVersion:null});save(KEY,prompts)}
 function list(filter={}){return clone(prompts.filter(p=>(!filter.category||p.category===filter.category)&&(!filter.status||p.status===filter.status)))}
 function get(id,version){return clone(prompts.find(p=>p.id===id&&(version==null||p.version===Number(version)))||null)}
 function create(data){const id=data.id||uid('prompt');const max=Math.max(0,...prompts.filter(p=>p.id===id).map(p=>p.version));const p={id,version:max+1,name:String(data.name||'Untitled prompt'),description:String(data.description||''),category:CATEGORIES.includes(data.category)?data.category:'metadata',providerCompatibility:data.providerCompatibility||['openai'],status:data.status||'draft',text:String(data.text||''),createdAt:now(),modifiedAt:now(),parentVersion:max||null};prompts.push(p);save(KEY,prompts);emit();return clone(p)}
 function update(id,version,patch){const p=prompts.find(x=>x.id===id&&x.version===Number(version));if(!p)throw Error('Prompt version not found');Object.assign(p,patch,{modifiedAt:now()});save(KEY,prompts);emit();return clone(p)}
 function promote(id,version,status){if(!['draft','candidate','active','retired'].includes(status))throw Error('Invalid prompt status');const p=prompts.find(x=>x.id===id&&x.version===Number(version));if(!p)throw Error('Prompt version not found');if(status==='active')for(const x of prompts)if(x.category===p.category&&x.status==='active')x.status='retired';p.status=status;p.modifiedAt=now();save(KEY,prompts);emit();return clone(p)}
 function active(category){return clone(prompts.filter(p=>p.category===category&&p.status==='active').sort((a,b)=>b.version-a.version)[0]||null)}
 function createBenchmark(data){const b={id:data.id||uid('bench'),name:String(data.name||'Benchmark'),description:String(data.description||''),imageIds:[...new Set(data.imageIds||[])],createdAt:now(),modifiedAt:now()};benchmarks.push(b);save(BENCH,benchmarks);emit();return clone(b)}
 function listBenchmarks(){return clone(benchmarks)}
 function removeBenchmark(id){benchmarks=benchmarks.filter(b=>b.id!==id);save(BENCH,benchmarks);emit()}
 function exportLibrary(){return {schemaVersion:1,exportedAt:now(),prompts:list(),benchmarks:listBenchmarks()}}
 function verify(){const issues=[];for(const p of prompts){if(!CATEGORIES.includes(p.category))issues.push({type:'prompt-category',id:p.id,version:p.version});if(!['draft','candidate','active','retired'].includes(p.status))issues.push({type:'prompt-status',id:p.id,version:p.version})}for(const c of CATEGORIES){const a=prompts.filter(p=>p.category===c&&p.status==='active');if(a.length>1)issues.push({type:'multiple-active-prompts',category:c,count:a.length})}return {promptCount:prompts.length,benchmarkCount:benchmarks.length,issueCount:issues.length,issues}}
 function emit(){window.dispatchEvent(new CustomEvent('genreactrix:prompt-library'))}
 seed();window.genreactrixPromptLibraryEngine={categories:CATEGORIES,list,get,create,update,promote,active,createBenchmark,listBenchmarks,removeBenchmark,exportLibrary,verify};
})();
