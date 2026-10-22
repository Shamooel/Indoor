import { scheduleHandoff } from '../data/journeys';
import FormErrors from './FormErrors';
import React, { useEffect, useRef, useState } from 'react';
import { useCommunity } from '../state/CommunityStore';
import { validateChallenge } from '../state/competitionReducer';
import { localDate } from '../data/booking';
import JourneySteps from './JourneySteps';
export default function ChallengeForm({ sport, opponentId, initialTeamId, lockedTeamId, initialDate = '', initialTime = '', onCreated }) {
 const state = useCommunity();
 const { teams, activePlayer, dispatch } = state;
 const ownTeams = teams.filter(t => t.sport === sport && t.captainId === activePlayer.id && (!lockedTeamId || t.id === lockedTeamId));
 const schedule = scheduleHandoff(initialDate,initialTime,'challenge');
 const [values,setValues] = useState({ fromTeamId:initialTeamId || '',toTeamId:opponentId || '',date:schedule.date,time:schedule.time,message:'' });
 const [step,setStep] = useState(0);
 const [errors,setErrors] = useState({});
 const [sent,setSent] = useState(false);
 const heading = useRef(null);
 const sourceId = ownTeams.some(t => t.id === values.fromTeamId) ? values.fromTeamId : ownTeams[0]?.id || '';
 const opponents = teams.filter(t => t.sport === sport && t.id !== sourceId);
 const targetId = opponents.some(t => t.id === values.toTeamId) ? values.toTeamId : '';
 useEffect(() => { if (opponentId) { setValues(v => ({...v,toTeamId:opponentId})); setStep(1); } }, [opponentId]);
 useEffect(() => { setStep(0);setErrors({});setSent(false); }, [sport,activePlayer.id]);
 useEffect(() => { heading.current?.focus({preventScroll:true}); },[step]);
 const change = e => { setValues(v => ({...v,[e.target.name]:e.target.value})); setErrors({}); };
 function submit(e) {
  e.preventDefault();
  const proposal = {...values,fromTeamId:sourceId,toTeamId:targetId,sport};
  const all = validateChallenge(proposal,state,activePlayer);
  const keys = [['fromTeamId'],['toTeamId','sport'],['date','time'],['message'],Object.keys(all)][step];
  const next = Object.fromEntries(Object.entries(all).filter(([k]) => keys.includes(k)));
  setErrors(next);
  if (Object.keys(next).length) return;
  if (step < 4) { setStep(step+1);return; }
  const outcome = dispatch({type:'sendChallenge',values:proposal}); if (!outcome.ok) { setErrors({ submit:outcome.error }); return; } setSent(true); onCreated(); setStep(0); setValues(v => ({...v,date:'',time:'',message:''}));
 }
 return <form id="challenge-form" className="challenge-form" onSubmit={submit} noValidate><p className="eyebrow">NEW CHALLENGE / {sport}</p><h2 ref={heading} tabIndex="-1">{['Choose your team.','Find an opponent.','Propose a time.','Add a message.','Ready to challenge?'][step]}</h2><p className="helper" role="status">{sent && <>Demo challenge added. <a className="text-link" href="#challenge-activity">View challenge activity ↓</a></>}</p>{schedule.message && <p className="helper">{schedule.message}</p>}<JourneySteps labels={['My Team','Opponent','Date & time','Message','Send']} step={step}/>{!ownTeams.length ? <div className="empty-state"><p>You need to captain a {sport.toLowerCase()} team to send a challenge.</p><a className="text-link" href="/teams/create">Create My Team ↗</a></div> : <>
 {step === 0 && <div className="form-field"><label htmlFor="fromTeamId">My captain team</label><select id="fromTeamId" name="fromTeamId" value={sourceId} onChange={change}>{ownTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>}
 {step === 1 && <div className="form-field"><label htmlFor="toTeamId">Opponent team</label><select id="toTeamId" name="toTeamId" value={targetId} onChange={change}><option value="">Choose a registered opponent</option>{opponents.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>}
 {step === 2 && <><div className="form-field"><label htmlFor="date">Proposed date</label><input id="date" name="date" type="date" min={localDate()} value={values.date} onChange={change}/></div><div className="form-field"><label htmlFor="time">Proposed time (PKT)</label><input id="time" name="time" type="time" value={values.time} onChange={change}/></div><p className="helper">This is a proposal, not a check of venue hours or availability.</p></>}
 {step === 3 && <div className="form-field"><label htmlFor="message">Message (optional)</label><textarea id="message" name="message" maxLength={500} rows="4" value={values.message} onChange={change} placeholder="Introduce your team or suggest a friendly match."/><p className="helper">{values.message.length}/500</p></div>}
 {step === 4 && <dl className="review-details"><div><dt>My Team</dt><dd>{teams.find(t => t.id === sourceId)?.name}</dd></div><div><dt>Opponent</dt><dd>{teams.find(t => t.id === targetId)?.name}</dd></div><div><dt>Proposed time</dt><dd>{values.date} · {values.time} PKT</dd></div><div><dt>Message</dt><dd>{values.message || 'No message'}</dd></div></dl>}
 <FormErrors errors={errors}/><div className="flow-actions">{step > 0 && <button type="button" className="text-button" onClick={() => {setStep(step-1);setErrors({});}}>← Back</button>}<button className="button" type="submit">{step === 4 ? 'Send demo challenge' : 'Continue'} ↗</button></div></>}<p className="helper form-endnote">Accepted challenges still need a separate turf booking. Nothing is sent outside this demo session.</p></form>;
}
