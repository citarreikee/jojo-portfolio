import { useEffect, useRef, useState } from 'react'
import AccordionGallery from './AccordionGallery'
import MistrePreview from './MistrePreview'
import VisibleManusPreview from './VisibleManusPreview'
import EntroFlowPreview from './EntroFlowPreview'
import AgentNetworkPreview from './AgentNetworkPreview'
import ContextOSPreview from './ContextOSPreview'
import AGuildPreview from './AGuildPreview'
import './WorksCarousel.css'

export const works = [
 {id:'recordercat',title:'RecorderCat',subtitle:'iPhone & Apple Watch · Product film',src:'/assets/review/recorder-poster.webp',kind:'film',caption:'Live transcription, a recording companion, and a watch interaction built around three states.',video:'recorder-demo.mp4'},
 {id:'zoi',title:'Zoi',subtitle:'Personal context · TestFlight beta',src:'/assets/review/zoi-cover.webp',kind:'film',caption:'From recording to people, experiences and projects. A product walkthrough across ten iterations.',video:'zoi-story.mp4'},
 {id:'connectme',title:'ConnectMe',subtitle:'Relationship maps · Interactive demo',src:'/assets/review/connectme-cover.webp',kind:'demo',caption:'Explore the graph, select a person, or search. The live product also includes YC and MiraclePlus S24 canvases.'},
 {id:'entroflow',title:'EntroFlow / Robomix',subtitle:'Physical AI · Interactive demo',src:'/assets/review/entroflow-cover.webp',kind:'demo',caption:'Run the office scene. This is an interactive demonstration, separate from the real-device integration checks below.'},
 {id:'manus',title:'Visible Manus',subtitle:'Agent workflows · Interactive demo',src:'/assets/review/manus-cover.webp',kind:'demo',caption:'Give the demo a brief and follow planning, tasks and output as the workflow unfolds.'},
 {id:'contextos',title:'ContextOS',subtitle:'Memory Keeper · Interactive preview',src:'/assets/review/contextos-cover.webp',kind:'demo',caption:'Explore the newer Memory Keeper interface: Today, notes, paths, people and calendar. English sample content; no backend connection.'},
 {id:'network',title:'AgentNetwork-Red',subtitle:'Agent swarm · Interactive demo',src:'/assets/review/network-cover.webp',kind:'demo',caption:'Explore the swarm display. An interface experiment in observing many agents at once.'},
 {id:'guild',title:'AGuild',subtitle:'Open quests · Interactive preview',src:'/assets/review/guild-cover.webp',kind:'demo',caption:'Inspect the quest-board interaction. Public task postings and contributor responses form the underlying project.'},
]
export function WorkMedia({id,active=true}:{id:string;active?:boolean}){
 const p=works.find(p=>p.id===id)!;const video=useRef<HTMLVideoElement>(null);
 useEffect(()=>{if(!active)video.current?.pause()},[active]);
 if(p.kind==='film')return <video ref={video} key={id} controls playsInline preload={active?'metadata':'none'} poster={p.src} src={'/assets/review/'+p.video} aria-label={p.title+' product film'}/>;
 return <div className="work-live-demo">{id==='connectme'?<MistrePreview active={active}/>:id==='entroflow'?<EntroFlowPreview active={active}/>:id==='manus'?<VisibleManusPreview active={active}/>:id==='contextos'?<ContextOSPreview active={active}/>:id==='network'?<AgentNetworkPreview active={active}/>:<AGuildPreview active={active}/>}</div>
}
const galleryWorks=works.filter(p=>p.id!=='guild');
export default function WorksCarousel(){
 const root = useRef<HTMLElement>(null)
 const sticky = useRef<HTMLDivElement>(null)
 const [active, setActive] = useState(0)
 useEffect(()=>{
  let raf=0
  const update=()=>{
   raf=0
   if(!root.current||!sticky.current)return
   const distance=root.current.offsetHeight-sticky.current.offsetHeight
   const progress=Math.max(0,Math.min(1,-root.current.getBoundingClientRect().top/Math.max(1,distance)))
   setActive(Math.round(progress*(galleryWorks.length-1)))
  }
  const request=()=>{if(!raf)raf=requestAnimationFrame(update)}
  const observer=new ResizeObserver(request)
  observer.observe(root.current!)
  observer.observe(sticky.current!)
  window.addEventListener('scroll',request,{passive:true})
  update()
  return()=>{cancelAnimationFrame(raf);observer.disconnect();window.removeEventListener('scroll',request)}
 },[])
 const select=(index:number)=>setActive(index)
 return <section ref={root} id="jobs" className="works-section works-section--accordion" style={{height:`${100+(galleryWorks.length-1)*80}svh`}}>
  <div ref={sticky} className="works-accordion-sticky">
   <div className="revision-label"><span>02 — Works</span><span>Jojo</span></div>
   <AccordionGallery
    items={galleryWorks.map(p=>({label:p.title,image:p.src,alt:p.title,
      preview:(selected:boolean)=><WorkMedia id={p.id} active={selected}/>}))}
    defaultIndex={0} activeIndex={active} onActiveChange={select} expandRatio={0.64} trigger="hover"
    accentColor="#efeee9" overlayColor="#0d0d0d" textColor="#efeee9"
    height={640} gap={10} radius={20} showLabels={false}
    className="works-accordion"/>
  </div>
 </section>
}
