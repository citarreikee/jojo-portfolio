import {useState,useRef,useEffect} from 'react'
// @ts-ignore — source-derived JSX scene from the current Context OS frontend.
import {TodayView} from './ContextToday'
// @ts-ignore — original Context OS brand component.
import {KeeperMark} from './ContextKeeperMark'
import './ContextOSPreview.css'
const notes=[
 {bucket:'inbox',title:'Make warmth a principle you can test.',body:'At the next design review, ask: does this interface show the system, or help the person using it? Keep the complexity behind the page.',messageType:'advice'},
 {bucket:'inbox',title:'Leave room to think before adding another task.',body:'Protect a little uninterrupted time for the next product review. A longer task list is not always the next useful step.',messageType:'advice'}
]
export default function ContextOSPreview({active}:{active:boolean}){
 const [view,setView]=useState('today'),[letter,setLetter]=useState<number|null>(null),[person,setPerson]=useState(false),[project,setProject]=useState(false)
 const page=useRef<HTMLDivElement>(null)
 useEffect(()=>{if(page.current)page.current.scrollTop=0},[view])
 return <div className="context-os-preview" aria-label="Context OS Memory Keeper interactive preview" onClick={e=>e.stopPropagation()} {...(!active?{inert:''}:{})}>
  <header className="context-mast"><button onClick={()=>setView('today')}><KeeperMark compact/><strong>Context OS</strong></button><span>Memory Keeper · Sample content</span></header>
  <nav className="context-nav" aria-label="Context OS views">{[['today','Today'],['atlas','Paths'],['people','People'],['calendar','Calendar'],['journal','Journal']].map(([id,label])=><button key={id} aria-pressed={view===id} onClick={()=>{setView(id);setLetter(null)}}>{label}</button>)}</nav>
  <div ref={page} className="context-page">
  {view==='today'?<TodayView active={active} suggestions={notes} refreshKey={0} onNavigate={(id:string)=>setView(id==='interaction'?'journal':id)} onOpenLetters={()=>setView('letters')}/>:view==='letters'?<div className="context-reading"><h1>Notes for you.</h1>{notes.map((n,i)=><button className="context-note" key={n.title} onClick={()=>setLetter(letter===i?null:i)} aria-expanded={letter===i}><small>A thought to share</small><h2>{n.title}</h2>{letter===i?<p>{n.body}</p>:<span>Open note ↗</span>}</button>)}</div>:view==='atlas'?<div className="context-reading"><h1>A path taking shape.</h1><div className="context-path"><button className="context-note" onClick={()=>setProject(!project)} aria-expanded={project}><small>PROJECT</small><h2>Context OS</h2><p>Making memory feel natural</p>{project&&<p>Current focus: a readable daily page, quieter navigation, and original records that remain yours.</p>}</button><span aria-hidden="true">··············</span><div className="context-goal">Build personal AI<br/>that understands people.</div></div></div>:view==='people'?<div className="context-reading"><h1>People around you.</h1><button className="context-person" onClick={()=>setPerson(!person)} aria-expanded={person}><i>AL</i><h2>Alex</h2><span>Product collaborator ↗</span></button>{person&&<article className="context-note"><small>ILLUSTRATIVE PERSON</small><h2>A shared design conversation</h2><p>Working together on a calmer daily experience. The next conversation is about what the interface can leave out.</p><p>Relationship details stay attached to their source material.</p></article>}</div>:view==='calendar'?<div className="context-reading"><h1>Room in your week.</h1><p>No scheduled events in this sample.</p>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day=><details className="context-day" key={day}><summary>{day}</summary><p>No plans. Time to keep for yourself.</p></details>)}</div>:<div className="context-reading"><h1>A page to think on.</h1><p>This local sample keeps your draft only while the preview is open.</p><textarea aria-label="Sample journal draft" placeholder="What would you like to remember?"/><p className="context-footnote">No message is sent and no AI response is simulated.</p></div>}
  </div>
 </div>
}
