import { AccountOverview } from './AccountPages';
export { default as BookingRecord } from '../components/BookingRecord';
import FormErrors from '../components/FormErrors';
import React, { useEffect, useRef, useState } from 'react';
import { useCommunity } from '../state/CommunityStore';
import { profileErrors } from '../state/accountActions';
import PageHeader from '../components/PageHeader';
import FormField from '../components/FormField';
import ImageUpload from '../components/ImageUpload';
import ProfileFields from '../components/ProfileFields';
import JourneySteps from '../components/JourneySteps';
import { goTo, safeNext } from '../data/navigation';
import '../styles/community.css';

const blank = { name:'', email:'', password:'', confirmPassword:'', sports:[], positions:[], role:'', photo:'' };
export default function Account({ search = '', initialMode = 'create' }) {
  const state = useCommunity();
  const { activePlayer, players, dispatch } = state;
  const params = new URLSearchParams(search);
  const next = safeNext(params.get('next'));
  const [mode,setMode] = useState(params.get('mode') === 'access' ? 'access' : initialMode);
  const [step,setStep] = useState(0);
  const [values,setValues] = useState(blank);
  const [errors,setErrors] = useState({});
  const [blocked,setBlocked] = useState(false);
  const [selected,setSelected] = useState(players[0]?.id || '');
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus(); }, [step,mode]);
  function advance(event) {
    event.preventDefault();
    const all = profileErrors(values,state,null,true);
    if (values.password.length < 8) all.password = 'Use at least 8 characters for this demo form.';
    if (values.password !== values.confirmPassword) all.confirmPassword = 'Passwords must match.';
    const keys = step === 0 ? ['name','email','password','confirmPassword'] : step === 1 ? ['sports','positions','role'] : step === 2 ? [] : Object.keys(all);
    const current = Object.fromEntries(Object.entries(all).filter(([key]) => keys.includes(key)));
    setErrors(current);
    if (Object.keys(current).length || (step >= 2 && blocked)) return;
    if (step < 3) { setStep(step+1); return; }
    const { password,confirmPassword,...profile } = values;
    const outcome = dispatch({ type:'createAccount',values:profile });
    if (!outcome.ok) { setErrors({ submit:outcome.error }); return; }
    setValues(blank);
    goTo('/account' + (next ? `?next=${encodeURIComponent(next)}` : ''));
  }
  const change = e => setValues(v => ({ ...v,[e.target.name]:e.target.value }));
  return <main id="main" className="inner-page container community-page account-page">{activePlayer ? <AccountOverview key={activePlayer.id} next={next}/> : <><PageHeader eyebrow="MY ACCOUNT" title="Your place in the game">One player account for football, cricket, teams, and your next turf booking.</PageHeader>{next && <p className="demo-note">{next.startsWith('/booking') ? 'Create or access your player account to book a turf slot.' : 'Access your player account to continue.'}</p>}<div className="access-layout"><aside className="access-art"><p className="eyebrow">LEGENDS FIELD / KARACHI</p><h2>More than a name on the team sheet.</h2><p>Your own player card. Your people. Your next game.</p><ol><li>Create your player profile.</li><li>Join a team or build your own.</li><li>Choose a turf slot and an opponent.</li></ol></aside><section className="flow-panel"><div className="mode-switch" role="group" aria-label="Account access mode"><button aria-pressed={mode === 'create'} onClick={() => { setMode('create'); setErrors({}); }}>Create Account</button><button aria-pressed={mode === 'access'} onClick={() => { setMode('access'); setBlocked(false); setStep(0); setValues(v => ({ ...v,password:'',confirmPassword:'' })); setErrors({}); }}>Access Existing Account</button></div><p className="helper">Frontend demo only. No secure sign-in or permanent account storage. Refresh resets this session.</p>{mode === 'access' ? <form onSubmit={e => { e.preventDefault(); if (!players.some(p => p.id === selected)) return; const result = dispatch({ type:'switchPlayer',playerId:selected }); if (result.ok && result.state.activePlayerId === selected) goTo(next || '/account'); }}><h2 tabIndex="-1" ref={heading}>Welcome back.</h2><p className="helper">Choose a sample player or an account created during this session. Access is simulated; no password is checked.</p><div className="form-field"><label htmlFor="existing-player">Existing demo account</label><select id="existing-player" value={selected} onChange={e => setSelected(e.target.value)}>{players.map(p => <option key={p.id} value={p.id}>{p.name} · {p.email || p.id}</option>)}</select></div><button className="button full-width">Access demo account ↗</button></form> : <><JourneySteps labels={['Personal information','Sports & positions','Profile photo','Review & create']} step={step}/><h2 ref={heading} tabIndex="-1">{['First, the basics.','Choose your game.','Make it yours.','Ready to join?'][step]}</h2><form onSubmit={advance} noValidate><FormErrors errors={errors}/>{step === 0 && <><FormField label="Full name" name="name" autoComplete="name" value={values.name} maxLength={70} onChange={change} error={errors.name}/><FormField label="Email" name="email" type="email" autoComplete="email" value={values.email} onChange={change} error={errors.email}/><FormField label="Password" name="password" type="password" autoComplete="new-password" value={values.password} onChange={change} error={errors.password}/><FormField label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" value={values.confirmPassword} onChange={change} error={errors.confirmPassword}/><p className="helper">Use a sample password. It stays only in this form and is discarded on completion.</p></>}{step === 1 && <ProfileFields values={values} setValues={setValues} errors={errors}/ >}{<div hidden={step !== 2}><ImageUpload id="profile-photo" label="Profile photo" value={values.photo} onChange={photo => setValues(v => ({ ...v,photo }))} onStatusChange={setBlocked}/ ></div>}{step === 3 && <>{values.photo && <img className="captain-avatar" src={values.photo} alt="Your chosen profile"/>}<dl className="review-details">{[['Name',values.name],['Email',values.email],['Sports',values.sports.join(' & ')],...(values.sports.includes('Football') ? [['Football positions',values.positions.join(' / ')]] : []),...(values.sports.includes('Cricket') ? [['Cricket role',values.role]] : []),['Photo',values.photo ? 'Added' : 'Default player silhouette']].map(([key,value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl><p className="helper">Your demo account will open immediately. No information is sent to a server.</p></>}<div className="flow-actions">{step > 0 ? <button type="button" className="text-button" onClick={() => { setStep(step-1); setErrors({}); }}>← Back</button> : <span/>}<button className="button" disabled={step >= 2 && blocked}>{step === 3 ? 'Create demo account' : 'Continue'} ↗</button></div></form></>}</section></div></>}</main>;
}
