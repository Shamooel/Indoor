import React, { useEffect, useRef, useState } from 'react';
import FormField from '../components/FormField';
import PageHeader from '../components/PageHeader';
import { validatePlayer } from '../data/player';

const footballPositions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
const cricketRoles = ['Batsman', 'Bowler', 'All-rounder', 'Wicketkeeper'];
const emptyValues = { fullName: '', email: '', password: '', confirmPassword: '', football: false, cricket: false, primaryPosition: '', secondaryPositions: [], cricketRole: '' };

export default function Register() {
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState({});
  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [photoLoading, setPhotoLoading] = useState(false);
  const [review, setReview] = useState(false);
  const [complete, setComplete] = useState(false);
  const preview = useRef('');
  const fileInput = useRef(null);
  const uploadVersion = useRef(0);
  const reviewHeading = useRef(null);
  useEffect(() => () => { URL.revokeObjectURL(preview.current); uploadVersion.current += 1; }, []);
  useEffect(() => { if (review || complete) reviewHeading.current?.focus(); }, [review, complete]);

  function change(event) {
    const { name, value } = event.target;
    setValues(previous => ({ ...previous, [name]: value }));
    setErrors(previous => ({ ...previous, [name]: '' }));
  }
  function toggleSport(sport) {
    setValues(previous => ({ ...previous, [sport]: !previous[sport],
      ...(sport === 'football' ? { primaryPosition: '', secondaryPositions: [] } : { cricketRole: '' }) }));
    setErrors(previous => ({ ...previous, sports: '', primaryPosition: '', cricketRole: '' }));
  }
  function clearPhoto() {
    uploadVersion.current += 1;
    URL.revokeObjectURL(preview.current);
    preview.current = '';
    setPhoto(null);
    setPhotoLoading(false);
    setPhotoError('');
    if (fileInput.current) fileInput.current.value = '';
  }
  function upload(event) {
    const file = event.target.files?.[0];
    clearPhoto();
    setPhotoError('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setPhotoError('Choose a JPG, PNG, or WebP image.'); return; }
    if (file.size > 5 * 1024 * 1024) { setPhotoError('Choose an image smaller than 5 MB.'); return; }
    const url = URL.createObjectURL(file);
    setPhotoLoading(true);
    const version = uploadVersion.current;
    const image = new Image();
    image.onload = () => {
      if (version !== uploadVersion.current) { URL.revokeObjectURL(url); return; }
      preview.current = url;
      setPhoto({ url, name: file.name });
      setPhotoLoading(false);
    };
    image.onerror = () => { URL.revokeObjectURL(url); if (version === uploadVersion.current) { setPhotoLoading(false); setPhotoError('This image could not be read. Choose another image.'); } };
    image.src = url;
  }
  function validate() {
    const next = validatePlayer(values);
    setErrors(next);
    return next;
  }
  function submit(event) {
    event.preventDefault();
    const next = validate();
    if (Object.keys(next).length || photoError || photoLoading) {
      requestAnimationFrame(() => document.getElementById(Object.keys(next)[0] || 'photo')?.focus());
      return;
    }
    setReview(true);
  }
  function finish() {
    const next = validate();
    if (Object.keys(next).length || photoError) { setReview(false); return; }
    setValues(previous => ({ ...previous, password: '', confirmPassword: '' }));
    setComplete(true);
  }
  const sports = [values.football && 'Football', values.cricket && 'Cricket'].filter(Boolean).join(' & ');
  return <main id="main" className="inner-page container register-page">
    <PageHeader eyebrow="THE PLAYERS / REGISTRATION" title="Every player has a story">Start yours at Legends Field Indoor. Register individually for football, cricket, or both.</PageHeader>
    <div className="registration-layout"><aside className="registration-aside"><p className="eyebrow">YOUR PLACE IN THE GAME</p><h2>One player.<br />Your potential.</h2><ol className="step-list" aria-label="Registration progress"><li className={!review ? 'current' : ''} aria-current={!review ? 'step' : undefined}><span>01</span> Player details</li><li className={review && !complete ? 'current' : ''} aria-current={review && !complete ? 'step' : undefined}><span>02</span> Review your profile</li><li className={complete ? 'current' : ''} aria-current={complete ? 'step' : undefined}><span>03</span> Demo completion</li></ol><p className="helper">UI preview only. No account or unique Player ID will be created. Your password stays in temporary form state and is never persisted.</p><p className="auth-switch">Already a player? <a href="/login">Go to login ↗</a></p></aside>
      <section className="registration-panel">
      {complete ? <div className="completion-panel"><p className="eyebrow">PREVIEW COMPLETE</p><h2 tabIndex="-1" ref={reviewHeading}>You're ready for the next step.</h2><p role="status">Demo only. No account has been created, no Player ID has been generated or reserved, and no information has been submitted or saved.</p><p>Your registration preview is complete. Real registration will be available in a later phase.</p><a className="button" href="/">Back to the field <span aria-hidden="true">↗</span></a></div>
      : review ? <div className="review-panel"><p className="eyebrow">02 / CHECK YOUR DETAILS</p><h2 tabIndex="-1" ref={reviewHeading}>Review your profile</h2><p className="helper">Make sure everything looks right before completing this demo.</p>{photo && <img className="photo-preview review-photo" src={photo.url} alt="Your selected player profile" />}<dl className="review-details"><div><dt>Full name</dt><dd>{values.fullName.trim()}</dd></div><div><dt>Email</dt><dd>{values.email.trim()}</dd></div><div><dt>Profile photo</dt><dd>{photo ? photo.name : 'Not added (optional)'}</dd></div><div><dt>Sport</dt><dd>{sports}</dd></div>{values.football && <><div><dt>Primary football position</dt><dd>{values.primaryPosition}</dd></div><div><dt>Secondary positions</dt><dd>{values.secondaryPositions.join(', ') || 'None selected'}</dd></div></>}{values.cricket && <div><dt>Primary cricket role</dt><dd>{values.cricketRole}</dd></div>}</dl><p className="helper">Password is omitted from this summary and will be cleared on demo completion.</p><div className="form-actions"><button type="button" className="button button-outline" onClick={() => setReview(false)}>Edit details</button><button className="button" type="button" onClick={finish}>Complete demo <span aria-hidden="true">↗</span></button></div></div>
      : <form onSubmit={submit} noValidate>
        <section className="form-section"><h2><span>01</span> The basics</h2><div className="field-grid"><FormField label="Full name" name="fullName" autoComplete="name" required value={values.fullName} onChange={change} error={errors.fullName} /><FormField label="Email" name="email" type="email" autoComplete="email" required value={values.email} onChange={change} error={errors.email} /><FormField label="Password" name="password" type="password" autoComplete="new-password" required value={values.password} onChange={change} error={errors.password} /><FormField label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" required value={values.confirmPassword} onChange={change} error={errors.confirmPassword} /></div><div className="photo-field">{photo ? <img className="photo-preview" src={photo.url} alt="Your selected player profile" /> : <span className="photo-placeholder" aria-hidden="true">LF</span>}<div><label htmlFor="photo">Player photo <span className="helper">(optional)</span></label><input ref={fileInput} id="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} aria-invalid={Boolean(photoError)} aria-describedby="photo-help photo-error" /><p id="photo-help" className="helper">JPG, PNG, or WebP · Up to 5 MB</p>{(photo || photoError) && <button className="text-button" type="button" onClick={clearPhoto}>Remove photo</button>}<p id="photo-error" className="field-error" role="status">{photoLoading ? "Checking your image…" : photoError}</p></div></div></section>
        <fieldset className="form-section"><legend><span>02</span> Your sport</legend><p className="helper">Choose one or both sports.</p><div className="choice-grid" id="sports" tabIndex="-1" aria-describedby={errors.sports ? 'sports-error' : undefined}>{['football', 'cricket'].map(sport => <label key={sport} className={`choice ${values[sport] ? 'selected' : ''}`}><input type="checkbox" checked={values[sport]} onChange={() => toggleSport(sport)} /><span>{sport === 'football' ? 'Football' : 'Cricket'}</span></label>)}</div>{errors.sports && <p id="sports-error" className="field-error">{errors.sports}</p>}</fieldset>
        {values.football && <fieldset className="form-section conditional-section"><legend>Your football position</legend><div className="form-field"><label htmlFor="primaryPosition">Primary position</label><select id="primaryPosition" required value={values.primaryPosition} aria-invalid={Boolean(errors.primaryPosition)} aria-describedby={errors.primaryPosition ? 'position-error' : undefined} onChange={event => { const value = event.target.value; setValues(previous => ({ ...previous, primaryPosition: value, secondaryPositions: previous.secondaryPositions.filter(item => item !== value) })); setErrors(previous => ({ ...previous, primaryPosition: '' })); }}><option value="">Choose a position</option>{footballPositions.map(position => <option key={position}>{position}</option>)}</select>{errors.primaryPosition && <p id="position-error" className="field-error">{errors.primaryPosition}</p>}</div><p className="field-label">Secondary positions <span className="helper">(optional)</span></p><div className="checkbox-row">{footballPositions.filter(position => position !== values.primaryPosition).map(position => <label key={position}><input type="checkbox" checked={values.secondaryPositions.includes(position)} onChange={() => setValues(previous => ({ ...previous, secondaryPositions: previous.secondaryPositions.includes(position) ? previous.secondaryPositions.filter(item => item !== position) : [...previous.secondaryPositions, position] }))} />{position}</label>)}</div></fieldset>}
        {values.cricket && <fieldset className="form-section conditional-section"><legend>Your cricket role</legend><div className="form-field"><label htmlFor="cricketRole">Primary role</label><select id="cricketRole" name="cricketRole" required value={values.cricketRole} onChange={change} aria-invalid={Boolean(errors.cricketRole)} aria-describedby={errors.cricketRole ? 'role-error' : undefined}><option value="">Choose a role</option>{cricketRoles.map(role => <option key={role}>{role}</option>)}</select>{errors.cricketRole && <p id="role-error" className="field-error">{errors.cricketRole}</p>}</div></fieldset>}
        <div className="form-actions"><p className="helper">Next: review your details.<br />No account will be created.</p><button className="button" type="submit" disabled={photoLoading}>Review profile <span aria-hidden="true">↗</span></button></div>
      </form>}
      </section>
    </div>
  </main>;
}

