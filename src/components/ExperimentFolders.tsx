import {useEffect,useRef,useState} from 'react'
import {createPortal} from 'react-dom'
// @ts-ignore Exact React Bits JS-CSS registry source.
import Folder from './Folder'
// @ts-ignore Exact React Bits JS-CSS registry source.
import FolderFloat from './FolderFloat'
import {GuildLab,CompanyLab,WearableLab,EvidenceNote,extraNotes} from './EvidenceSections'
import {ReasoningNote} from './ReviewRevision'
import './ExperimentFolders.css'
const projects=[
 {title:'Lux in Don’t Starve',image:'/assets/review/lux-poster.webp',id:'lux'},
 {title:'AGuild',image:'/assets/review/guild-cover.webp',id:'guild'},
 {title:'Company Context',image:'/assets/review/company-native.webp',id:'company'},
 {title:'Wearable AI',image:'/assets/review/wearable-pair.webp',id:'wearable'},

]
const notes=[{id:'reasoning',title:'Less reasoning, faster letters. But were they better?'},...extraNotes]
function ProjectPage({id}:{id:string}){
 if(id==='guild')return <GuildLab/>
 if(id==='company')return <CompanyLab/>
 if(id==='wearable')return <WearableLab/>
 return <article className="evidence-lab"><header><h2>Lux in Don’t Starve</h2><span>Playable mod · Gameplay capture</span></header><video className="lab-video" controls playsInline preload="metadata" poster="/assets/review/lux-poster.webp" src="/assets/review/lux-gameplay.mp4"/><p className="evidence-caveat">Abilities, equipment and visual effects in the game. 01:19 · Original capture.</p><p className="lab-credit">Unofficial fan project. Game and character rights belong to their respective owners.</p></article>
}
export default function ExperimentFolders(){
 const [selection,setSelection]=useState<{type:'project'|'note';id:string}|null>(null)
 const [projectsOpen,setProjectsOpen]=useState(false)
 const [notesOpen,setNotesOpen]=useState(false)
 const dialog=useRef<HTMLDialogElement>(null)
 const trigger=useRef<HTMLElement|null>(null)
 const open=(type:'project'|'note',id:string)=>{trigger.current=document.activeElement as HTMLElement;setSelection({type,id})}
 const close=()=>{setSelection(null);trigger.current?.focus({preventScroll:true})}
 useEffect(()=>{if(!selection)return;dialog.current?.showModal();const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=old}},[selection])
 useEffect(()=>{
  const onHash=()=>{const id=location.hash.slice(1);if(notes.some(n=>n.id===id))open('note',id)}
  window.addEventListener('hashchange',onHash);onHash();return()=>window.removeEventListener('hashchange',onHash)
 },[])
 return <section id="experiments" className="revision-section experiment-folders">
  <span id="labs" className="folder-anchor"/><span id="notes" className="folder-anchor"/>
  <div className="revision-label"><span>03 — Experiments & Notes</span><span>Jojo</span></div>
  <div className="experiment-folder-pair">
   <div className={`experiment-folder-cell project-folder-cell${projectsOpen?' is-open':''}`}><Folder onOpenChange={setProjectsOpen} label="Projects" color="#52525b" paperColor="#efeee9" theme="dark" zoomOnClick={false} items={projects.map(p=>({title:p.title,content:<div className="folder-project-sheet"><img src={p.image} alt=""/><strong>{p.title}</strong></div>}))} onItemClick={(_item:unknown,index:number)=>open('project',projects[index].id)}/></div>
   <div className={`experiment-folder-cell note-folder-cell${notesOpen?' is-open':''}`}><FolderFloat onOpenChange={setNotesOpen} label="Notes" sublabel="6 notes" items={notes.map(n=>n.title)} trigger="click" closeOnSelect={false} physics drift={0.5} onSelect={(_value:unknown,index:number)=>open('note',notes[index].id)} folderColor="#3f3f46" frontColor="#52525b" paperColor="#f5f5f5" itemColor="#f5f5f5" itemTextColor="#18181b" labelColor="#f5f5f5" width={200} height={148} radius={14} spread={180} lift={26} tilt={8} flapAngle={34} restAngle={16} openDuration={520} stagger={45} bounce={0.3}/></div>
  </div>
  {selection&&createPortal(<dialog ref={dialog} className="experiment-dialog" aria-label={selection.type==='project'?projects.find(p=>p.id===selection.id)?.title:notes.find(n=>n.id===selection.id)?.title} onCancel={e=>{e.preventDefault();close()}} onClick={e=>{if(e.target===e.currentTarget)close()}}><div className="experiment-dialog-page">{selection.type==='note'&&<a className="note-permalink" href={`/notes/${selection.id}/`}>Read as a page ↗</a>}<button autoFocus className="experiment-dialog-close" onClick={close} aria-label="Close detail">Close ×</button>{selection.type==='project'?<ProjectPage id={selection.id}/>:selection.id==='reasoning'?<ReasoningNote/>:<EvidenceNote id={selection.id}/>}</div></dialog>,document.body)}
 </section>
}
