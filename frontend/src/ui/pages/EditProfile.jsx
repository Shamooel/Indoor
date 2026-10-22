import FormErrors from '../components/FormErrors';
import React, { useState } from 'react';
import { useCommunity } from '../state/CommunityStore';
import { profileErrors } from '../state/accountActions';
import { goTo } from '../data/navigation';
import PageHeader from '../components/PageHeader';
import FormField from '../components/FormField';
import ProfileFields from '../components/ProfileFields';
import ImageUpload from '../components/ImageUpload';
import '../styles/community.css';
export default function EditProfile() {
  const state = useCommunity();
  const [values,setValues] = useState(() => ({ ...state.activePlayer, sports:[...state.activePlayer.sports],positions:[...state.activePlayer.positions] }));
  const [errors,setErrors] = useState({});
  const [blocked,setBlocked] = useState(false);
  return <main id="main" className="inner-page container community-page"><a className="back-link" href="/account/profile">← My Account</a><PageHeader eyebrow="MY ACCOUNT / EDIT PROFILE" title="Make it your own">Your changes update your player card, public profile, and team views together.</PageHeader><form className="flow-panel" style={{ maxWidth:780 }} noValidate onSubmit={e => { e.preventDefault(); const next = profileErrors(values,state,state.activePlayer); setErrors(next); if (Object.keys(next).length || blocked) return; const outcome = state.dispatch({ type:'editProfile',values }); if (!outcome.ok) { setErrors({ submit:outcome.error }); return; } goTo('/account/profile'); }}><FormErrors errors={errors}/><FormField label="Full name" name="name" value={values.name} maxLength={70} onChange={e => setValues(v => ({ ...v,name:e.target.value }))} error={errors.name}/><ProfileFields values={values} setValues={setValues} errors={errors}/><ImageUpload id="edit-photo" label="Profile photo" value={values.photo} onChange={photo => setValues(v => ({ ...v,photo }))} onStatusChange={setBlocked}/><div className="flow-actions"><a className="text-link" href="/account/profile">Cancel</a><button className="button" disabled={blocked}>Save profile changes ↗</button></div></form></main>;
}
