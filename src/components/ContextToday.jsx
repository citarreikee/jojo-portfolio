import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, MessageCircle } from 'lucide-react'

import { demoCalendar, demoPeople, demoPursuits } from './contextos-demo'
import { KeeperMark } from './ContextKeeperMark'

const demoSnapshot = {
  pursuits: demoPursuits,
  calendar: demoCalendar,
  people: demoPeople,
}

function eventDate(event) {
  return event?.start || event?.scheduled_at || event?.occurred_at || event?.recorded_at || ''
}

function shortName(value = '') {
  const name = String(value).trim()
  if (!name) return 'Someone'
  if (/^[\u3400-\u9fff]+$/u.test(name)) return name.slice(-2)
  return name.split(/\s+/u)[0]
}

function isToday(value) {
  const date = value ? new Date(value) : null
  return Boolean(date && !Number.isNaN(date.valueOf()) && date.toDateString() === new Date().toDateString())
}

function latestSeen(people) {
  const timestamp = (person) => {
    const value = Date.parse(person.last_seen_at || '')
    return Number.isNaN(value) ? 0 : value
  }
  return [...(people || [])].sort((left, right) => timestamp(right) - timestamp(left))[0]
}

export function TodayView({ active, suggestions, refreshKey, onNavigate, onOpenLetters }) {
  const snapshot = demoSnapshot
  const preview = true

  const inbox = useMemo(() => suggestions.filter((item) => item.bucket === 'inbox'), [suggestions])
  const note = inbox[0]
  const project = (snapshot.pursuits.projects || []).find((item) => !['completed', 'archived', 'cancelled'].includes(String(item.lifecycle || item.status || '').toLowerCase()))
  const todaysEvents = (snapshot.calendar.events || [])
    .filter((item) => isToday(eventDate(item)) && !['cancelled', 'archived'].includes(item.status))
    .sort((left, right) => Date.parse(eventDate(left)) - Date.parse(eventDate(right)))
  const event = todaysEvents[0]
  const person = latestSeen(snapshot.people.people)
  const now = new Date()
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now)
  const noteIsQuestion = note?.messageType === 'question'
  const personName = shortName(person?.name)
  const initials = /^[\u3400-\u9fff]+$/u.test(personName) ? personName.slice(-2) : personName.slice(0, 2)

  return (
    <section className={`screen today-screen${active ? ' active' : ''}`} aria-label="Today">
      <div className="today-canvas">
        <div className="today-page">
          <header className="today-opening">
            <time className="today-date" dateTime={`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`}>
              <span>{now.getMonth() + 1} /</span>
              <strong>{now.getDate()}</strong>
              <small>{weekday}</small>
            </time>
            <div className="today-greeting">
              <h1>Take today gently.</h1>
              {preview && <span className="today-preview">Interactive preview · Sample content</span>}
            </div>
            <button className="today-chat" type="button" onClick={() => onNavigate('interaction')}><MessageCircle size={17} /> Open the journal <ArrowUpRight size={15} /></button>
          </header>

          <div className="today-desk">
            <span className="today-desk-caption" aria-hidden="true">For you</span>
            <article className={`today-letter${noteIsQuestion ? ' today-letter-question' : ''}${note ? '' : ' today-letter-empty'}`} aria-label="A note for you">
              <span className="today-letter-tape" aria-hidden="true" />
              <span className="today-letter-kind">{noteIsQuestion ? 'Something to think about' : note ? 'A thought to share' : 'Room for a quiet day'}</span>
              <h2>{note?.title || 'A little room to breathe.'}</h2>
              {note?.body && <p>{note.body}</p>}
              <footer>
                <button type="button" className="today-letter-open" onClick={onOpenLetters}>{noteIsQuestion ? 'Read this note' : note ? 'Open this note' : 'Browse notes'} <ArrowUpRight size={17} /></button>
                {inbox.length > 1 && <span>Another {inbox.length - 1} notes, whenever you are ready</span>}
              </footer>
            </article>
            <div className="today-companion" aria-hidden="true"><KeeperMark compact /><span>One thing at a time</span></div>
          </div>

          <div className="today-fragments" aria-label="A few traces of life">
          <button type="button" className="fragment-project" onClick={() => onNavigate('atlas')}>
            <span className="today-fragment-label">In progress</span>
            <strong>{project?.title || 'Nothing in progress'}</strong>
            <small>{project?.phase || project?.summary || 'A little room to breathe'}</small>
            <span className="today-fragment-link">Explore the path <ArrowUpRight size={14} /></span>
          </button>
          <button type="button" className="fragment-time" onClick={() => onNavigate('calendar')}>
            <span className="today-fragment-label">Today’s plans{todaysEvents.length > 1 ? ` · ${todaysEvents.length} items` : ''}</span>
            <strong>{event?.title || 'No plans today'}</strong>
            <small>{event ? `${new Date(eventDate(event)).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}${event.status === 'proposed' ? ' · To confirm' : ''}` : 'Time to keep for yourself'}</small>
            <span className="today-fragment-link">Open the calendar <ArrowUpRight size={14} /></span>
          </button>
          <button type="button" className="fragment-person" onClick={() => onNavigate('people')}>
            <span className="today-fragment-label">Someone nearby</span>
            <div className="today-person-line"><i className="today-person-mark" aria-hidden="true">{person ? initials : '…'}</i><strong>{person ? personName : 'A story to come'}</strong></div>
            <small>{person?.relation || person?.relation_line || 'Something to remember'}</small>
            <span className="today-fragment-link">Read their story <ArrowUpRight size={14} /></span>
          </button>
        </div>

        </div>
      </div>
    </section>
  )
}
