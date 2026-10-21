import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { localDate, formatDate, slotsForDate, endTime } from '../data/booking';

export default function Booking() {
  const [sport, setSport] = useState('Football');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [message, setMessage] = useState('');
  const minimum = localDate(1);
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= minimum;
  const selected = validDate && slotsForDate(date).some(item => item.time === slot && item.available);
  function changeDate(value) { setDate(value); setSlot(''); setMessage(''); }
  function submit(event) {
    event.preventDefault();
    setMessage(selected ? 'Demo complete. No booking has been created or reserved. Live availability and booking will be added in a later phase.' : 'Choose a future date and an available time slot first.');
  }
  return <main id="main" className="inner-page container">
    <PageHeader eyebrow="THE FIELD / BOOKING" title="Make time for your game">One field. Your team. Choose how you want to play at Legends Field Indoor, Karachi.</PageHeader>
    <div className="demo-note">UI preview · All availability and time slots below are illustrative. They do not represent operating hours or real reservations. No prices are set.</div>
    <form className="booking-layout" onSubmit={submit} noValidate>
      <div className="booking-controls">
        <fieldset className="form-section"><legend><span>01</span> Pick your sport</legend><div className="choice-grid">{['Football', 'Cricket'].map(item => <label className={`choice ${sport === item ? 'selected' : ''}`} key={item}><input type="radio" name="sport" value={item} checked={sport === item} onChange={() => { setSport(item); setMessage(''); }} /><span>{item}</span><span aria-hidden="true">↗</span></label>)}</div></fieldset>
        <section className="form-section" aria-labelledby="date-heading"><h2 id="date-heading"><span>02</span> Choose a date</h2><label className="date-label" htmlFor="play-date">Future date</label><input id="play-date" type="date" min={minimum} value={date} onChange={event => changeDate(event.target.value)} required aria-describedby="date-help" /><p id="date-help" className="helper">Choose tomorrow or a later date. Times shown in Karachi time (PKT).</p><div className="date-strip">{Array.from({ length: 5 }, (_, index) => localDate(index + 1)).map(value => <button type="button" className={`date-tile ${date === value ? 'selected' : ''}`} aria-pressed={date === value} key={value} onClick={() => changeDate(value)}><span>{new Date(`${value}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short' })}</span><strong>{value.slice(-2)}</strong><span>{new Date(`${value}T12:00:00`).toLocaleDateString('en-GB', { month: 'short' })}</span></button>)}</div></section>
        <fieldset className="form-section"><legend><span>03</span> Find your time</legend><p className="helper">Illustrative 60-minute slots · Unavailable slots cannot be selected.</p>{validDate ? <div className="slot-grid">{slotsForDate(date).map(item => <label className={`slot ${slot === item.time ? 'selected' : ''} ${!item.available ? 'unavailable' : ''}`} key={item.time}><input type="radio" name="slot" value={item.time} checked={slot === item.time} disabled={!item.available} onChange={() => { setSlot(item.time); setMessage(''); }} /><strong>{item.time}–{endTime(item.time)}</strong><span>{item.available ? 'Available' : 'Unavailable · demo'}</span></label>)}</div> : <p className="empty-state">Select a future date to explore demo availability.</p>}</fieldset>
      </div>
      <aside className="summary-panel"><p className="eyebrow">YOUR GAME PLAN</p><h2>Selected slot</h2><p className="venue-name">Legends Field Indoor <span>Karachi · Single venue</span></p><dl><div><dt>Sport</dt><dd>{sport}</dd></div><div><dt>Date</dt><dd>{validDate ? formatDate(date) : 'Choose a date'}</dd></div><div><dt>Time (PKT)</dt><dd>{selected ? `${slot}–${endTime(slot)}` : 'Choose a slot'}</dd></div><div><dt>Duration</dt><dd>{selected ? '60 minutes' : '—'}</dd></div></dl><button className="button full-width" type="submit" disabled={!selected}>Preview booking <span aria-hidden="true">↗</span></button><p className="helper">Demo only. No payment, reservation, or real booking.</p><p className="status-message" role="status">{message}</p></aside>
    </form>
  </main>;
}
