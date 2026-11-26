import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import App from './App'
import { ReasoningNote } from './components/ReviewRevision'
import { EvidenceNote, extraNotes } from './components/EvidenceSections'

export const notes = [
  {id:'reasoning',title:'Less reasoning, faster letters. But were they better?',description:'An 18-case Zoi experiment comparing high and low reasoning effort, runtime and human evidence checks.'},
  ...extraNotes.map(note=>({id:note.id,title:note.title,description:note.parts[0][1]})),
]
export function renderHome(){ return renderToString(<App/>) }
export function renderNote(id:string){return renderToStaticMarkup(id==='reasoning'?<ReasoningNote/>:<EvidenceNote id={id}/>)}
