import { challengeLink, scheduleHandoff } from '../data/journeys';
import FormErrors from '../components/FormErrors';
import React, { useEffect, useRef, useState } from 'react';
import PageHeader from '../components/PageHeader';
import JourneySteps from '../components/JourneySteps';
import ImageUpload from '../components/ImageUpload';
import FormField from '../components/FormField';
import { TeamLogo } from '../components/CommunityElements';
import { useCommunity } from '../state/CommunityStore';
import { validateTeam } from '../state/communityReducer';
import { bookingErrors } from '../state/accountActions';
import { localDate, formatDate, slotsForDate, endTime } from '../data/booking';
import '../styles/community.css';

const steps = ['Sport','Date & slot','My Team','Opponent','Review','Demo result'];
export default function Booking({ search = '' }) {
  const state = useCommunity();
  const { activePlayer, teams, players, bookingDrafts, bookings, dispatch } = state;
  const draft = { sport:activePlayer.sports[0], date:localDate(1), slot:'',teamId:'',opponentId:'',...bookingDrafts[activePlayer.id] };
  const [step,setStep] = useState(0);
  const [errors,setErrors] = useState({});
  const [creating,setCreating] = useState(false);
  const [teamValues,setTeamValues] = useState({ name:'',description:'',logo:'' });
  const [imageBlocked,setImageBlocked] = useState(false);
  const [query,setQuery] = useState('');
  const [resultId,setResultId] = useState('');
  const heading = useRef(null);
  const [handoffMessage,setHandoffMessage] = useState('');
  useEffect(() => {
    const params = new URLSearchParams(search);
    if (!params.has('from')) return;
    const source = teams.find(t => t.id === params.get('from') && t.captainId === activePlayer.id);
    const target = teams.find(t => t.id === params.get('opponent') && t.sport === source?.sport && t.id !== source?.id);
    if (!source || !target) { setHandoffMessage('The linked teams are unavailable for this captain. Select your teams below.'); return; }
    const schedule = scheduleHandoff(params.get('date'),params.get('time'),'booking');
    dispatch({ type:'bookingDraft', values:{ sport:source.sport,teamId:source.id,opponentId:target.id,date:schedule.date || localDate(1),slot:schedule.time } });
    setHandoffMessage(schedule.message);
  }, [search,activePlayer.id,dispatch]);
  useEffect(() => { heading.current?.focus(); }, [step]);
  const update = values => { dispatch({ type:'bookingDraft',values }); setErrors({}); };
  const ownTeams = teams.filter(t => t.sport === draft.sport && t.members.includes(activePlayer.id));
  const opponents = teams.filter(t => t.sport === draft.sport && t.id !== draft.teamId);
  const own = ownTeams.find(t => t.id === draft.teamId);
  const opponent = opponents.find(t => t.id === draft.opponentId);
  const result = bookings.find(b => b.id === resultId);
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(draft.date) && draft.date >= localDate(1) && !bookingErrors(draft,state,activePlayer).date;
  const validSlot = validDate && slotsForDate(draft.date).some(s => s.time === draft.slot && s.available);
  function advance(e) {
    e.preventDefault();
    const all = bookingErrors(draft,state,activePlayer);
    const keys = [['sport'],['date','slot'],['teamId'],['opponentId'],Object.keys(all)][step];
    const current = Object.fromEntries(Object.entries(all).filter(([k]) => keys.includes(k)));
    setErrors(current);
    if (Object.keys(current).length) return;
    if (step === 4) { const outcome = dispatch({ type:'createBooking',values:draft }); if (!outcome.ok) { setErrors({ submit:outcome.error }); return; } setResultId(outcome.state.bookings.at(-1).id); }
    setStep(step+1);
  }
  function createTeam(e) {
    e.preventDefault();
    const values = { ...teamValues,sport:draft.sport };
    const next = validateTeam(values,teams,activePlayer);
    setErrors(next);
    if (Object.keys(next).length || imageBlocked) return;
    const outcome = dispatch({ type:'createTeam',values,forBooking:true });
    if (!outcome.ok) { setErrors({ submit:outcome.error }); return; }
    setCreating(false); setTeamValues({ name:'',description:'',logo:'' });
  }
  const summary = [['Player',activePlayer.name],['Sport',draft.sport],['Date',validDate ? formatDate(draft.date) : 'Choose date'],['Time (PKT)',validSlot ? `${draft.slot}–${endTime(draft.slot)}` : 'Choose slot'],['Duration','60 minutes'],['My Team',own?.name || 'Choose team'],['Opponent',opponent?.name || 'Choose opponent'],['Venue','Legends Field Indoor'],['Status','Demo request · Not reserved']];
  return <main id="main" className="inner-page container community-page"><PageHeader eyebrow="BOOK TURF / LEGENDS FIELD INDOOR" title="Make room for your game">Pick a sport. Bring your team. Choose your opponent.</PageHeader><p className="demo-note">Demo availability only · These slots are examples, not venue hours or real availability. No price or payment is involved.</p>{handoffMessage && <p className="demo-note" role="status">{handoffMessage}</p>}<JourneySteps labels={steps} step={step}/>{result ? <section className="flow-panel"><p className="eyebrow">DEMO REQUEST ADDED</p><h2 ref={heading} tabIndex="-1">Your game plan is ready.</h2><p role="status">Your demo request is in My Account → My Bookings. The turf is not reserved and the opponent has not accepted.</p><dl className="review-details">{[['Request',result.id],['Sport',result.sport],['Date',formatDate(result.date)],['Time',`${result.slot}–${endTime(result.slot)} PKT`],['My Team',teams.find(t => t.id === result.teamId)?.name],['Opponent',teams.find(t => t.id === result.opponentId)?.name],['Booking status',result.status],['Opponent confirmation',result.opponentStatus]].map(([k,v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><div className="flow-actions"><a className="button" href="/account/bookings">View My Bookings ↗</a>{teams.find(t => t.id === result.teamId)?.captainId === activePlayer.id && <a className="text-link" href={challengeLink(result)}>Propose a match to this opponent ↗</a>}</div><p className="helper">Selecting a team does not send a challenge. A proposal, opponent acceptance, and turf confirmation are separate.</p></section> : <div className="booking-flow"><section className="flow-panel"><h2 ref={heading} tabIndex="-1">{['What are we playing?','Choose your time.','Who are you playing for?','Choose your opponent.','Check your game plan.'][step]}</h2>
    {step === 0 && <><p>Choose a sport from your player profile.</p><div className="sport-choice-grid">{['Football','Cricket'].map(s => <button className="sport-choice" key={s} aria-pressed={s === draft.sport} onClick={() => update({ sport:s,teamId:'',opponentId:'' })}><strong>{s}</strong><span>{s === 'Football' ? 'The first touch. The final whistle.' : 'Every ball. Every partnership.'}</span></button>)}</div>{!activePlayer.sports.includes(draft.sport) && <p className="helper">Add {draft.sport} to your player profile before continuing. <a className="text-link" href="/account/edit">Edit profile ↗</a></p>}</>}
    {step === 1 && <><p>All times are in Karachi time (PKT). Every demo slot is 60 minutes.</p><div className="form-field"><label htmlFor="play-date">Choose a date</label><input id="play-date" type="date" min={localDate(1)} value={draft.date} onChange={e => update({ date:e.target.value,slot:'' })}/></div><div className="date-strip">{Array.from({length:5},(_,i) => localDate(i+1)).map(date => <button type="button" key={date} className={`date-tile ${date === draft.date ? 'selected' : ''}`} aria-pressed={date === draft.date} onClick={() => update({ date,slot:'' })}><span>{new Date(`${date}T12:00:00`).toLocaleDateString('en-GB',{weekday:'short'})}</span><strong>{date.slice(-2)}</strong><span>{new Date(`${date}T12:00:00`).toLocaleDateString('en-GB',{month:'short'})}</span></button>)}</div>{validDate && <h3>{formatDate(draft.date)}</h3>}<div className="slot-legend" aria-label="Slot states"><span>Available</span><span>Selected</span><span>Unavailable</span></div>{validDate ? [['Morning',0,12],['Afternoon',12,18],['Evening',18,24]].map(([label,start,end]) => <fieldset className="form-section" key={label}><legend>{label}</legend><div className="slot-grid">{slotsForDate(draft.date).filter(s => Number(s.time.slice(0,2)) >= start && Number(s.time.slice(0,2)) < end).map(s => <label key={s.time} className={`slot ${s.time === draft.slot ? 'selected' : ''} ${!s.available ? 'unavailable' : ''}`}><input type="radio" name="slot" checked={s.time === draft.slot} disabled={!s.available} onChange={() => update({ slot:s.time })}/><strong>{s.time}–{endTime(s.time)}</strong><span>{!s.available ? 'Unavailable · demo' : s.time === draft.slot ? 'Selected · 60 min' : 'Available · 60 min'}</span></label>)}</div></fieldset>) : <p className="empty-state">Choose a valid future date to see demo slots.</p>}</>}
    {step === 2 && <><p>Choose a {draft.sport.toLowerCase()} team you belong to, or create your own. You will be its captain.</p><div className="team-options" role="group" aria-label="My existing teams">{ownTeams.map(t => <button className="team-option" key={t.id} aria-pressed={t.id === draft.teamId} onClick={() => update({ teamId:t.id,opponentId:draft.opponentId === t.id ? '' : draft.opponentId })}><TeamLogo team={t}/><span><strong>{t.name}</strong><small>{t.captainId === activePlayer.id ? 'You are captain' : `Captain: ${players.find(p => p.id === t.captainId)?.name}`}</small></span><span>{t.id === draft.teamId ? 'Selected ✓' : 'Select'}</span></button>)}</div>{!ownTeams.length && <p className="empty-state">You do not have a {draft.sport.toLowerCase()} team yet. Create one below or <a className="text-link" href="/teams">find a team to join ↗</a>. Your slot selections stay in this session.</p>}<button className="text-button" type="button" onClick={() => { setCreating(!creating); setImageBlocked(false); setErrors({}); }} aria-expanded={creating}>{creating ? 'Cancel team creation' : '+ Create My Team'}</button>{creating && <form className="inline-create" onSubmit={createTeam} noValidate><h3>Create My Team</h3><p className="helper">Sport: {draft.sport}. This team will also appear in Teams and My Account.</p><FormField label="Team name" name="name" maxLength={50} value={teamValues.name} onChange={e => setTeamValues(v => ({...v,name:e.target.value}))} error={errors.name}/><ImageUpload value={teamValues.logo} onChange={logo => setTeamValues(v => ({...v,logo}))} onStatusChange={setImageBlocked}/><button className="button" disabled={imageBlocked}>Create & select My Team ↗</button></form>}</>}
    {step === 3 && <><p>Select an existing registered {draft.sport.toLowerCase()} team. Selecting an opponent does not mean they have accepted a match.</p><div className="form-field"><label htmlFor="opponent-search">Search opponent teams</label><input id="opponent-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search team name"/></div><div className="team-options" role="group" aria-label="Existing opponent teams">{opponents.filter(t => t.name.toLowerCase().includes(query.trim().toLowerCase())).map(t => <button className="team-option" key={t.id} aria-pressed={t.id === draft.opponentId} onClick={() => update({opponentId:t.id})}><TeamLogo team={t}/><span><strong>{t.name}</strong><small>Captain: {players.find(p => p.id === t.captainId)?.name}</small></span><span>{t.id === draft.opponentId ? 'Selected ✓' : 'Select'}</span></button>)}</div>{!opponents.length ? <p className="empty-state">There is no other registered team in this sport yet. Your selections will stay in this session. <a className="text-link" href="/account">Return to My Account ↗</a></p> : !opponents.some(t => t.name.toLowerCase().includes(query.trim().toLowerCase())) && <p className="empty-state">No teams match your search. <button className="text-button" onClick={() => setQuery('')}>Clear search</button></p>}</>}
    {step === 4 && <><p>Review your request before adding it to My Bookings.</p><dl className="review-details">{summary.map(([k,v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}<div><dt>Opponent confirmation</dt><dd>Not requested</dd></div></dl><div className="account-quick-links">{steps.slice(0,4).map((s,i) => <button type="button" className="text-button" key={s} onClick={() => setStep(i)}>Edit {s}</button>)}</div><p className="demo-note">No slot will be reserved. No opponent notification, payment, or official match is created.</p></>}
    {(step === 2 || step === 4) && own && own.captainId !== activePlayer.id && <p className="demo-note" role="status">You are a player on {own.name}. Only its captain can submit a team booking request. The captain is {players.find(p => p.id === own.captainId)?.name}. This demo has no player-to-captain messaging. <a href="/account/teams">Review your teams</a>, or select/create a team you captain. You can continue browsing options.</p>}
    <FormErrors errors={errors}/><form onSubmit={advance}><div className="flow-actions">{step > 0 ? <button className="text-button" type="button" onClick={() => {setStep(step-1);setErrors({});setCreating(false);setImageBlocked(false);}}>← Back</button> : <span/>}<button className="button" disabled={(step === 4 && own?.captainId !== activePlayer.id) || creating || (step === 3 && !opponents.length)}>{step === 4 ? 'Submit demo request' : 'Continue'} ↗</button></div></form></section><aside className="summary-panel"><p className="eyebrow">YOUR GAME PLAN</p><h2>One field. Your match.</h2><dl>{summary.slice(1,7).map(([k,v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><p className="helper">Legends Field Indoor · Karachi<br/>Demo request only. Not reserved.</p></aside></div>}</main>;
}
