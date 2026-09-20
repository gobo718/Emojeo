/* Emojeo AI Inheritance Check — Pass 28
   Read-only diagnostics for the already-configured Genreactrix Worker boundary.
   Never exposes, replaces, regenerates, or persists secret values. */
(()=>{'use strict';
const api=()=>globalThis.GenreactrixCloudApi||globalThis.window?.GenreactrixCloudApi||null;
function inspect(){const cloud=api();return Object.freeze({cloudApiLoaded:Boolean(cloud),workerConfigured:Boolean(cloud?.isConfigured?.()),workerBase:cloud?.getBaseUrl?.()||'',analysisKeyPresent:Boolean(cloud?.getKey?.()),analysisKeyValueExposed:false});}
async function verify(){const cloud=api();if(!cloud)throw new Error('Genreactrix Cloud API is not loaded.');const before=inspect();const result=await cloud.verifyConnection();return Object.freeze({before,connected:true,auth:result?.auth||null,providers:result?.providers||null,health:{version:result?.version||null,vision:result?.vision||null,storage:result?.storage||null}});}
const out=Object.freeze({inspect,verify});if(typeof window!=='undefined')window.emojeoAiInheritance=out;if(typeof globalThis!=='undefined')globalThis.emojeoAiInheritance=out;
})();
