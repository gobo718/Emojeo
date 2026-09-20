/* Genreactrix Housekeeping Engine v2 — v0.9.40.39
   Scheduled local non-AI operational recovery and retention.
   Housekeeping never launches/retries AI and never retries Quarantine. */
(()=>{'use strict';
const MARKER_PREFIX='genreactrix-housekeeping-last-daily-v2';
const now=()=>new Date().toISOString();
const clone=v=>v==null?v:structuredClone(v);
function localDay(){const d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return`${y}-${m}-${day}`}
async function context(){const ctx=window.genreactrixProjectRuntimeEngine;if(ctx?.ready)await ctx.ready;return{projectId:String(ctx?.projectId?.()||window.genreactrixSettingsEngine?.get?.('project.id')||'project-local'),runtimeId:String(ctx?.runtimeId?.()||'runtime-local')}}
function markerKey({projectId,runtimeId}){return`${MARKER_PREFIX}:${projectId}:${runtimeId}`}
async function lastDaily(){const scope=await context();try{return localStorage.getItem(markerKey(scope))||null}catch{return null}}
async function runDaily({force=false}={}){
  const day=localDay(),scope=await context(),key=markerKey(scope),last=(()=>{try{return localStorage.getItem(key)||''}catch{return''}})();
  if(!force&&last===day)return{day,projectId:scope.projectId,runtimeId:scope.runtimeId,skipped:true,reason:'already-run'};
  const result={day,projectId:scope.projectId,runtimeId:scope.runtimeId,startedAt:now(),purgatory:null,originSource:null,recycle:null,errors:[]};
  try{const batchReady=window.genreactrixBatchEngine?.ready;if(batchReady&&typeof batchReady.then==='function')await batchReady}catch(error){result.errors.push({engine:'batch-recovery',message:String(error?.message||error)})}
  try{result.purgatory=await window.genreactrixPostProcessingEngine?.retryDaily?.({date:day})||{eligible:0,results:[]}}catch(error){result.errors.push({engine:'post-processing',message:String(error?.message||error)})}
  try{result.originSource=await window.genreactrixOriginGateEngine?.retryDailySourceCases?.({date:day})||{eligible:0,results:[]}}catch(error){result.errors.push({engine:'origin-source',message:String(error?.message||error)})}
  let imagePreparationOk=true;try{const prep=window.genreactrixImagesStartupReady;if(prep&&typeof prep.then==='function')await prep}catch(error){imagePreparationOk=false;result.errors.push({engine:'image-startup-preparation',message:String(error?.message||error)})}
  if(imagePreparationOk)try{result.recycle=await window.genreactrixImagesEngine?.purgeExpired?.()||{purged:0,freed:0}}catch(error){result.errors.push({engine:'recycle',message:String(error?.message||error)})}else result.recycle={skipped:true,reason:'image-startup-preparation-failed'};
  result.completedAt=now();
  if(!result.errors.length)try{localStorage.setItem(key,day)}catch{}
  window.dispatchEvent(new CustomEvent('genreactrix:housekeeping',{detail:clone(result)}));return result;
}
async function verify(){const scope=await context(),issues=[];if(!scope.projectId)issues.push({type:'housekeeping-missing-project',severity:'attention'});if(!scope.runtimeId)issues.push({type:'housekeeping-missing-runtime',severity:'attention'});return{checkedAt:now(),projectId:scope.projectId,runtimeId:scope.runtimeId,lastDaily:await lastDaily(),issueCount:issues.length,issues}}
const api={runDaily,lastDaily,verify,markerKey};window.genreactrixHousekeepingEngine=api;
window.addEventListener('DOMContentLoaded',()=>window.genreactrixMaintenanceEngine?.registerChecker?.('housekeeping',verify,{quick:true,label:'Daily Housekeeping'}));
window.addEventListener('load',()=>{setTimeout(()=>runDaily().catch(error=>console.warn('Daily Housekeeping failed',error)),0)});
})();
