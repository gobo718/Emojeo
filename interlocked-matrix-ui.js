/* Reusable Interlocked Matrix UI
   Product-neutral renderer extracted from Genreactrix's landscape matrix.
   Applications provide axes, rows, cell metadata, and callbacks. */
(()=>{'use strict';
const resolveTarget=t=>typeof t==='string'?document.getElementById(t):t;
function render(options={}){
  const root=resolveTarget(options.target); if(!root)return false;
  const top=options.top||[],bottom=options.bottom||[],left=options.left||[],right=options.right||[],rows=options.rows||[];
  root.innerHTML='';
  const shell=document.createElement('div');shell.className='interlocked-matrix-shell';
  const makeAxis=(position,values)=>{const holder=document.createElement('div');holder.className=`interlocked-axis interlocked-axis-${position}`;values.forEach(value=>{const button=document.createElement('button');button.type='button';button.textContent=options.axisText?.(value,position)??value;button.title=options.axisLabel?.(value,position)??String(value);button.addEventListener('click',()=>options.onSelectAxis?.(value,position));holder.appendChild(button);});return holder;};
  shell.appendChild(makeAxis('top',top));
  const body=document.createElement('div');body.className='interlocked-matrix-body';
  body.appendChild(makeAxis('left',left));
  const grid=document.createElement('div');grid.className='interlocked-matrix-grid';
  rows.forEach((row,rowIndex)=>row.forEach((entry,columnIndex)=>{
    const cell=document.createElement('button');cell.type='button';
    const tone=String(entry?.tone||'default').replace(/[^a-z0-9_-]/gi,'');
    cell.className=`interlocked-cell interlocked-${tone||'default'}`;
    if(entry?.open||entry?.value==='OPEN')cell.classList.add('interlocked-open');
    if(entry?.diagonal)cell.classList.add(`interlocked-diagonal-${entry.diagonal}`);
    // Compatibility behavior for the proven Genreactrix diagonal presentation.
    if(tone==='green'&&!entry?.diagonal){const nextIsGreen=row[columnIndex+1]?.tone==='green';const bottomRight=rowIndex===rows.length-1&&columnIndex===row.length-1;cell.classList.add((nextIsGreen||bottomRight)?'interlocked-diagonal-lower':'interlocked-diagonal-upper');if(bottomRight)cell.classList.add('interlocked-bottom-right-angry');}
    cell.textContent=options.cellText?.(entry,rowIndex,columnIndex)??entry?.value??'';
    cell.title=options.cellTitle?.(entry,rowIndex,columnIndex)??String(entry?.value??'');
    const id=options.cellId?.(entry,rowIndex,columnIndex);if(id)cell.dataset.matrixItemId=id;
    cell.addEventListener('click',()=>options.onSelectCell?.(entry,rowIndex,columnIndex));grid.appendChild(cell);
  }));
  body.appendChild(grid);body.appendChild(makeAxis('right',right));shell.appendChild(body);shell.appendChild(makeAxis('bottom',bottom));root.appendChild(shell);return true;
}
window.interlockedMatrixUI=Object.freeze({render});
})();
