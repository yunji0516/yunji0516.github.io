'use strict';
const tasks = [
  {id:'MOT-E01',suite:'motion',level:'Easy',title:'Single-slide positioning',description:'Move the slide to the requested position, confirm arrival and standstill, and maintain the completed state.',speed:'Slow motion'},
  {id:'MAT-E01',suite:'material',level:'Easy',title:'Local workpiece acquisition',description:'Close the gripper on a workpiece at a prepared position and confirm that the workpiece is held.',speed:'Slow motion'},
  {id:'MOT-M14',suite:'motion',level:'Medium',title:'Rotary-table and slide coordination',description:'Retract the slide, maintain clearance during table rotation, and approach only after alignment and standstill.',speed:'Slow motion'},
  {id:'MAT-M04',suite:'material',level:'Medium',title:'Inspection-guided workpiece sorting',description:'Inspect each workpiece and coordinate pickup, transfer, and placement at the corresponding destination.',speed:'Reference replay'},
  {id:'MOT-H15',suite:'motion',level:'Hard',title:'Balance-controlled pocket access',description:'Coordinate independent access requests through a shared transfer mechanism and balance-controlled pockets.',speed:'Accelerated replay'},
  {id:'MAT-H01',suite:'material',level:'Hard',title:'Shared robot and machining cells',description:'Coordinate two machining jobs with a shared robot, including loading, processing, inspection, and outfeed.',speed:'Accelerated replay'},
];
const suiteNames={motion:'Motion Control',material:'Material Handling'};
document.getElementById('task-grid').innerHTML=tasks.map(t=>`<article class="task-card" data-suite="${t.suite}"><div class="task-media"><video muted loop playsinline controls preload="none" poster="assets/posters/${t.id}.webp" data-src="assets/videos/${t.id}.mp4" aria-label="${t.title} reference replay"></video><span class="video-badge">${t.id} · ${t.speed}</span></div><div class="task-copy"><div class="task-meta"><span class="level ${t.level.toLowerCase()}">${t.level}</span><span>${suiteNames[t.suite]}</span><code>${t.id}</code></div><h3>${t.title}</h3><p>${t.description}</p><div class="task-links"><a href="https://plc.damilab.cc/replay?task=${t.id}&amp;labels=0" target="_blank" rel="noopener">Open interactive replay ↗</a><a href="assets/videos/${t.id}.mp4" download>Download video ↓</a></div></div></article>`).join('');
const videos=[...document.querySelectorAll('video')];
fetch('assets/videos/recordings.json').then(response=>{
  if(!response.ok)throw new Error('Recording metadata unavailable');
  return response.json();
}).then(recordings=>{
  document.querySelectorAll('.task-card').forEach(card=>{
    const id=card.querySelector('code').textContent;
    const recording=recordings[id];
    if(recording)card.querySelector('.video-badge').textContent=`${id} · ${recording.playback_speed.toFixed(2)}× speed`;
  });
  const hero=recordings['MAT-H01'];
  if(hero)document.querySelector('.showcase-task').textContent=`Shared robot & machining cells · ${hero.playback_speed.toFixed(2)}×`;
}).catch(()=>{});
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let videosPaused=reducedMotion.matches;
const visibleVideos=new Set();
function loadVideo(video){if(!video.getAttribute('src')){video.src=video.dataset.src;video.load();}}
function tryPlay(video){if(!videosPaused&&!document.hidden&&!video.closest('[hidden]')){loadVideo(video);video.play().catch(()=>{});}}
const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(isIntersecting){visibleVideos.add(target);loadVideo(target);tryPlay(target);}else{visibleVideos.delete(target);target.pause();}}),{threshold:.2});
videos.forEach(v=>{v.muted=true;observer.observe(v);});
const pauseButton=document.getElementById('toggle-videos');
function updatePauseButton(){pauseButton.textContent=videosPaused?'Play videos':'Pause videos';pauseButton.setAttribute('aria-pressed',String(videosPaused));}
updatePauseButton();
pauseButton.addEventListener('click',()=>{videosPaused=!videosPaused;updatePauseButton();videos.forEach(v=>{if(videosPaused)v.pause();else if(visibleVideos.has(v))tryPlay(v);});});
document.addEventListener('visibilitychange',()=>{videos.forEach(v=>{if(document.hidden)v.pause();else if(visibleVideos.has(v))tryPlay(v);});});
reducedMotion.addEventListener('change',e=>{videosPaused=e.matches;updatePauseButton();videos.forEach(v=>{if(videosPaused)v.pause();else if(visibleVideos.has(v))tryPlay(v);});});
document.querySelectorAll('button[data-suite]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('button[data-suite]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
  let count=0;
  document.querySelectorAll('.task-card').forEach(card=>{const show=button.dataset.suite==='all'||card.dataset.suite===button.dataset.suite;card.hidden=!show;if(show)count++;else card.querySelector('video').pause();});
  document.getElementById('gallery-status').textContent=`Showing ${count} ${button.dataset.suite==='all'?'':suiteNames[button.dataset.suite]+' '}tasks`;
}));

// Values transcribed from Table 5 (tab:main_results) in the supplied LaTeX source.
const results={direct:[
  ['GPT-5.5',[71.11,1.67,75.58,7.05,18.06,65.19],[97.83,0,93.06,1.77,27.87,32.24],37.88],
  ['GPT-4o',[14.44,22.37,8.91,42.06,0,28.57],[28.99,13.49,1.04,21.11,0,57.71],92.75],
  ['Claude Sonnet 5',[75,2.27,75.91,25.50,0,73.33],[88.41,.72,77.43,1.04,4.37,51.72],50.90],
  ['Gemini 3.1 Pro',[78.33,0,80.86,18.09,11.81,65.48],[94.20,1.45,93.40,1.04,35.25,51.95],36.17],
  ['Gemini 3.8 Flash',[95.56,0,76.90,18.02,4.86,72.73],[98.55,0,87.50,0,17.21,32.37],32.10],
  ['Qwen3.5-Plus',[60.56,6.71,55.12,34.88,0,57.14],[86.23,2.17,46.18,24.11,1.64,61.70],49.79],
],frameworks:[
  ['Direct (GPT-5.5, matched)',[70,5,75.25,5.21,22.92,70.83],[93.48,0,85.42,5.56,28.69,34.43],39.61],
  ['LLM4PLC',[75,0,77.23,4.95,0,43.75],[97.83,0,84.38,6.25,23.77,48.36],43.97],
  ['Agents4PLC',[73.33,3.33,77.23,10.89,0,79.17],[84.78,0,70.83,0,16.39,27.87],49.05],
  ['AutoPLC',[80,0,75.25,4.95,12.50,75],[100,0,87.50,7.29,31.15,25.41],41.44],
  ['SemaPLC',[76.67,0,65.35,.99,12.50,85.42],[93.48,0,94.79,0,9.84,39.34],45.45],
]};
let setting='direct';
function renderResults(){const suite=document.getElementById('result-suite').value;const column=suite==='motion'?1:2;const rows=results[setting];const best=Array.from({length:6},(_,i)=>(i%2?Math.min:Math.max)(...rows.map(r=>r[column][i])));document.getElementById('results-body').innerHTML=rows.map(r=>`<tr><th scope="row">${r[0]}</th>${r[column].map((v,i)=>`<td class="${v===best[i]?'best':''}">${v.toFixed(2)}</td>`).join('')}<td>${r[3].toFixed(2)}</td></tr>`).join('');document.getElementById('results-caption').textContent=`${setting==='direct'?'Direct ST generation':'Adapted workflows · GPT-5.5 backbone'} · ${suiteNames[suite]} · Results (%)`}
document.querySelectorAll('[data-setting]').forEach(button=>button.addEventListener('click',()=>{setting=button.dataset.setting;document.querySelectorAll('[data-setting]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});renderResults();}));
document.getElementById('result-suite').addEventListener('change',renderResults);renderResults();
document.getElementById('copy-citation').addEventListener('click',async event=>{const content=document.getElementById('bibtex').textContent;try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(content);}else{const field=document.createElement('textarea');field.value=content;field.style.cssText='position:fixed;opacity:0';document.body.append(field);field.select();const ok=document.execCommand('copy');field.remove();if(!ok)throw new Error('Copy unavailable');}event.target.textContent='Copied!';document.getElementById('copy-status').textContent='Citation copied to clipboard.';setTimeout(()=>event.target.textContent='Copy citation',2000);}catch{const range=document.createRange();range.selectNodeContents(document.getElementById('bibtex'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);document.getElementById('copy-status').textContent='Citation selected. Use your keyboard copy command.';event.target.textContent='Select & copy';}});
