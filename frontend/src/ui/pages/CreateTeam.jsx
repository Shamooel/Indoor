import FormErrors from '../components/FormErrors';
import React, { useEffect, useRef, useState } from 'react';
import PageHeader from '../components/PageHeader';
import FormField from '../components/FormField';
import DemoCommunityBar from '../components/DemoCommunityBar';
import ImageUpload from '../components/ImageUpload';
import { TeamLogo } from '../components/CommunityElements';
import { useCommunity } from '../state/CommunityStore';
import { validateTeam } from '../state/communityReducer';
import '../styles/community.css';

export default function CreateTeam() {
  const { activePlayer, players, teams, dispatch } = useCommunity();
  const [values, setValues] = useState({ name: '', sport: activePlayer.sports[0], description: '', logo: '' });
  const [errors, setErrors] = useState({});
  const [imageBlocked, setImageBlocked] = useState(false);
  const [createdId, setCreatedId] = useState('');
  const resultHeading = useRef(null);
  const created = teams.find(team => team.id === createdId);
  useEffect(() => { if (created) resultHeading.current?.focus(); }, [created]);
  function change(event) { setValues(previous => ({ ...previous, [event.target.name]: event.target.value })); setErrors(previous => ({ ...previous, [event.target.name]: '' })); }
  function submit(event) {
    event.preventDefault();
    const next = validateTeam(values, teams, activePlayer);
    setErrors(next);
    if (Object.keys(next).length) { requestAnimationFrame(() => document.getElementById(Object.keys(next)[0])?.focus()); return; }
    if (imageBlocked) return;
    const outcome = dispatch({ type: 'createTeam', values });
    if (!outcome.ok) { setErrors({ submit:outcome.error }); return; }
    setCreatedId(outcome.state.teams.at(-1).id);
  }
  const result = created;
  return <main id="main" tabIndex="-1" className="inner-page container community-page"><a href="/teams" className="back-link">← All teams</a><PageHeader eyebrow="THE COMMUNITY / CREATE A TEAM" title="Start with your people">Choose a name, choose your sport, and bring a demo team together.</PageHeader><DemoCommunityBar />
    {result ? <section className="team-created"><p className="eyebrow">LOCAL DEMO RESULT</p><TeamLogo team={result} large /><h2 ref={resultHeading} tabIndex="-1">Meet {result.name}.</h2><p role="status">Your demo team is ready in this tab. {players.find(player => player.id === result.captainId)?.name} was selected as its demo captain. No real team was created or saved to a database.</p><p className="helper">Reloading resets this team and its roster.</p><a href={`/teams/${result.id}/manage`} className="button">Manage your team <span aria-hidden="true">↗</span></a></section>
      : <div className="create-team-layout"><aside><p className="eyebrow">THE FIRST NAME ON THE TEAM SHEET</p><img className="captain-avatar" src={activePlayer.photo} alt={`Illustrative portrait for ${activePlayer.name}`} /><h2>{activePlayer.name}</h2><p>Selected demo creator & captain</p><p className="helper">The demo creator is the first roster member. Teams and membership are kept separate for football and cricket.</p></aside><form onSubmit={submit} noValidate><FormErrors errors={errors}/><section className="form-section"><h2><span>01</span> Team identity</h2><FormField label="Team name" name="name" required maxLength={50} value={values.name} onChange={change} error={errors.name} /><div className="form-field"><label htmlFor="sport">Sport</label><select id="sport" name="sport" value={values.sport} onChange={change} required aria-invalid={Boolean(errors.sport)} aria-describedby={errors.sport ? 'team-sport-error' : undefined}><option>Football</option><option>Cricket</option></select>{errors.sport && <p className="field-error" id="team-sport-error">{errors.sport}</p>}</div><ImageUpload value={values.logo} onChange={logo => setValues(previous => ({ ...previous, logo }))} onStatusChange={setImageBlocked} /></section><section className="form-section"><h2><span>02</span> What brings you together?</h2><div className="form-field"><label htmlFor="description">Team description (optional)</label><textarea id="description" name="description" rows="4" maxLength={280} value={values.description} onChange={change} aria-invalid={Boolean(errors.description)} aria-describedby="description-help description-error" /><p className="helper" id="description-help">{values.description.length}/280 characters</p>{errors.description && <p className="field-error" id="description-error">{errors.description}</p>}</div></section><div className="form-actions"><p className="helper">Frontend demo only.<br />No database or real team invitation.</p><button type="submit" className="button" disabled={imageBlocked}>Create demo team <span aria-hidden="true">↗</span></button></div></form></div>}
  </main>;
}
