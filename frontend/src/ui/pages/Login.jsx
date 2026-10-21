import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import FormField from '../components/FormField';
import { validateLogin } from '../data/player';

export default function Login() {
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  function change(event) { setValues({ ...values, [event.target.name]: event.target.value }); setErrors({ ...errors, [event.target.name]: '' }); setMessage(''); }
  function submit(event) {
    event.preventDefault();
    const next = validateLogin(values);
    setErrors(next);
    if (Object.keys(next).length) { requestAnimationFrame(() => document.getElementById(Object.keys(next)[0])?.focus()); return; }
    setValues({ ...values, password: '' });
    setMessage('Demo only. You have not been signed in. No credentials were sent or stored.');
  }
  return <main id="main" className="inner-page container auth-layout"><div className="auth-intro"><PageHeader eyebrow="THE PLAYERS / LOGIN" title="Back to the game">Your next chapter starts on the field.</PageHeader><div className="auth-editorial"><span aria-hidden="true">LF /</span><p>Football. Cricket.<br />One shared love of the game.</p></div></div><section className="auth-panel"><p className="eyebrow">WELCOME BACK</p><h2>Player login</h2><p className="helper">UI preview · Sign-in is not connected yet.</p><form onSubmit={submit} noValidate><FormField label="Email" name="email" type="email" autoComplete="email" required value={values.email} onChange={change} error={errors.email} /><FormField label="Password" name="password" type="password" autoComplete="current-password" required value={values.password} onChange={change} error={errors.password} /><button className="text-button forgot-button" type="button" onClick={() => setMessage('Password recovery is not available in this UI preview. No reset email has been sent.')}>Forgot password?</button><button className="button full-width" type="submit">Preview login <span aria-hidden="true">↗</span></button><p className="status-message" role="status">{message}</p></form><p className="auth-switch">New to the field? <a href="/register">Register as a player ↗</a></p></section></main>;
}
