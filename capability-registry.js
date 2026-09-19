/* Reusable Engine Capability Registry v1
   Preservation-first inventory. A capability may remain available even when a
   particular application profile does not expose it. This registry does not
   remove, rewrite, or replace specialized implementations. */
(()=>{'use strict';
const clone=v=>v==null?v:structuredClone(v);
const CAPABILITIES={
  tags:{label:'Unlimited Tags / Typed Tag Relationships',kind:'generic+specialized',defaultEnabled:true,implementations:['tag-engine.js','tag-assignment-engine.js','tag-rule-engine.js','genreactrix-tag-compatibility.js']},
  matrix:{label:'Classification Matrix',kind:'generic+specialized',defaultEnabled:true,implementations:['classification-matrix-engine.js','classification-matrix-ui.js']},
  interlockedMatrix:{label:'Interlocked Matrix',kind:'generic+specialized',defaultEnabled:true,implementations:['interlocked-matrix-ui.js']},
  aiPipeline:{label:'AI Analysis Pipeline',kind:'specialized-reusable',defaultEnabled:true,implementations:['engine/ai-pipeline-engine.js','engine/ai-analysis-engine.js','engine/ai-artifact-engine.js']},
  promptLibrary:{label:'Prompt Library',kind:'specialized-reusable',defaultEnabled:true,implementations:['prompt-library-engine.js','prompt-evaluation-engine.js','prompt-diagnostics-engine.js']},
  themeSweep:{label:'Theme Sweep / Adversarial Theme Review',kind:'specialized',defaultEnabled:true,implementations:['theme-sweep-engine.js']},
  slopDetection:{label:'SLOP Detection and Director Review',kind:'specialized',defaultEnabled:true,implementations:['ai-analysis-engine.js','ai-artifact-engine.js','app.js','styles.css']},
  reactions:{label:'Reaction Classification and Customization',kind:'specialized',defaultEnabled:true,implementations:['director-classification-engine.js','app.js']},
  themes:{label:'Theme Classification and Customization',kind:'specialized',defaultEnabled:true,implementations:['director-classification-engine.js','theme-sweep-engine.js','app.js']},
  director:{label:'Director Classification Workflow',kind:'specialized-reusable',defaultEnabled:true,implementations:['director-classification-engine.js']},
  queue:{label:'Queue Processing',kind:'reusable',defaultEnabled:true,implementations:['queue-engine.js']},
  batch:{label:'Batch Processing',kind:'reusable',defaultEnabled:true,implementations:['batch-engine.js']},
  reports:{label:'Reports',kind:'reusable+specialized',defaultEnabled:true,implementations:['reports-engine.js','report-definition-engine.js']},
  research:{label:'Research Tooling',kind:'specialized-reusable',defaultEnabled:true,implementations:['public-research-engine.js','methodology-engine.js','finding-library-engine.js']},
  publication:{label:'Publication Tooling',kind:'specialized-reusable',defaultEnabled:true,implementations:['publication-engine.js','publication-validator-engine.js','paper-composer-ui.js']},
  prediction:{label:'Prediction / Correlation / Consensus',kind:'specialized-reusable',defaultEnabled:true,implementations:['prediction-engine.js','consensus-engine.js']},
  persistence:{label:'Persistence / Import / History',kind:'reusable',defaultEnabled:true,implementations:['persistence-engine.js','import-engine.js','event-log.js']},
  maintenance:{label:'Maintenance / Validation / Housekeeping',kind:'reusable',defaultEnabled:true,implementations:['maintenance-engine.js','validation-engine.js','housekeeping-engine.js']}
};
function profile(){return window.engineProfile||{};}
function enabled(id){const cap=CAPABILITIES[id];if(!cap)return false;const configured=profile()?.capabilities?.[id];return configured==null?cap.defaultEnabled:configured!==false;}
function list(){return Object.entries(CAPABILITIES).map(([id,value])=>({id,...clone(value),enabled:enabled(id)}));}
function get(id){const value=CAPABILITIES[id];return value?{id,...clone(value),enabled:enabled(id)}:null;}
window.reusableEngineCapabilities=Object.freeze({list,get,enabled});
})();
