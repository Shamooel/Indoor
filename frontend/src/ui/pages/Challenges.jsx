import '../styles/workspaces.css';
import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import DemoCommunityBar from '../components/DemoCommunityBar';
import ChallengeCard from '../components/ChallengeCard';
import ChallengeForm from '../components/ChallengeForm';
import { TeamLogo } from '../components/CommunityElements';
import { useCommunity } from '../state/CommunityStore';
import '../styles/community.css';
import '../styles/competition.css';

export default function Challenges({ search = '' }) {
  const { teams, players, challenges, activePlayer } = useCommunity();
  const params = new URLSearchParams(search);
  const linked = challenges.find(item => item.id === params.get('challenge'));
  const [sourceId,setSourceId] = useState(params.get('from') || '');
  const [opponentId, setOpponentId] = useState(params.get('opponent') || '');
  const [query, setQuery] = useState('');
  const [direction, setDirection] = useState('all');
  const [status, setStatus] = useState('all');
  const ownTeams = teams.filter(team => team.captainId === activePlayer.id);
  const source = ownTeams.find(t => t.id === sourceId) || ownTeams.find(t => linked && [linked.fromTeamId,linked.toTeamId].includes(t.id)) || ownTeams[0];
  const sport = source?.sport || 'Football';
  const ownIds = source ? [source.id] : [];
  const opponents = teams.filter(team => team.sport === sport && !ownIds.includes(team.id) && team.name.toLowerCase().includes(query.trim().toLowerCase()));
  const visible = challenges.filter(item => item.sport === sport && (ownIds.includes(item.fromTeamId) || ownIds.includes(item.toTeamId))
    && (direction === 'all' || (direction === 'incoming' ? ownIds.includes(item.toTeamId) : ownIds.includes(item.fromTeamId))) && (status === 'all' || item.status === status));
  return <main id="main" tabIndex="-1" className="inner-page container community-page competition-page">
    <a className="back-link" href={source ? `/teams/${source.id}/manage` : "/account/teams"}>← Team workspace</a><PageHeader eyebrow="THE COMPETITION / CHALLENGES" title="A good game starts with a challenge">Find an opponent. Propose a time. Keep the competition on the field.</PageHeader><DemoCommunityBar />
    {source ? <div className="team-workspace-context"><label className="field-label" htmlFor="challenge-team">Managing challenges for</label><select id="challenge-team" value={source.id} onChange={e => {setSourceId(e.target.value);setOpponentId('');}}>{ownTeams.map(t => <option key={t.id} value={t.id}>{t.name} · {t.sport}</option>)}</select><p>You send proposals as {source.name}. Incoming proposals await this team's response.</p></div> : <div className="empty-state"><h2>You do not captain a team yet.</h2><a className="button" href="/teams/create">Create My Team</a></div>}
    {source && <>
    <div className="challenge-page-layout"><div>
      <details className="opponent-browser"><summary>Browse registered opponent teams ↓</summary><section className="opponents-section"><div className="community-section-title"><h2>Find your next opponent</h2><span>{sport} teams · Demo only</span></div><label htmlFor="opponent-search" className="field-label">Search opponent teams</label><input id="opponent-search" type="search" className="opponent-search" value={query} placeholder="Search by team name" onChange={event => setQuery(event.target.value)} />
        <div className="opponents-grid">{opponents.map(team => <article className="opponent-tile" key={team.id}><TeamLogo team={team} /><div><a href={`/teams/${team.id}`}>{team.name}</a><span>Captain: {players.find(player => player.id === team.captainId)?.name}</span></div><button type="button" className="compact-action" disabled={!ownTeams.length} onClick={() => { setOpponentId(team.id); document.getElementById('challenge-form')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); document.getElementById('toTeamId')?.focus({ preventScroll: true }); }}>Propose ↗</button></article>)}</div>{!opponents.length && <p className="empty-state">No eligible opponent teams match this search.</p>}
      </section></details>
      <section className="community-section" id="challenge-activity"><div className="community-section-title"><h2>Captain activity</h2><a className="text-link" href={`/inbox?from=${source.id}`}>Open inbox ↗</a></div>{params.get('challenge') && !linked && <p className="demo-note">This challenge is not in the current demo session. It may have reset after refresh.</p>}
        <div className="challenge-activity-filters"><div className="sport-filters" role="group" aria-label="Challenge direction">{[['all', 'All activity'], ['incoming', 'Incoming'], ['outgoing', 'Outgoing']].map(([value, label]) => <button type="button" key={value} aria-pressed={direction === value} onClick={() => setDirection(value)}>{label}</button>)}</div><div><label htmlFor="challenge-status-filter">Status</label><select id="challenge-status-filter" value={status} onChange={event => setStatus(event.target.value)}><option value="all">All statuses</option>{['pending', 'accepted', 'rejected', 'cancelled'].map(item => <option key={item} value={item}>{item.charAt(0).toUpperCase() + item.slice(1)}</option>)}</select></div></div>
        <p className="results-count" role="status">{visible.length} demo {visible.length === 1 ? 'challenge' : 'challenges'} for {source.name}</p><div className="challenge-list">{[...visible].reverse().map(item => <ChallengeCard contextTeamId={source.id} challenge={item} key={item.id} highlighted={item.id === linked?.id} />)}</div>{!visible.length && <div className="empty-state">{ownTeams.length ? 'No challenges match these filters. Propose a match or change the filters.' : 'Create a team in this sport to become its captain and send challenges.'}</div>}
      </section>
    </div><aside><ChallengeForm key={source.id} lockedTeamId={source.id} initialDate={source.id === params.get('from') ? params.get('date') || '' : ''} initialTime={source.id === params.get('from') ? params.get('time') || '' : ''} sport={sport} opponentId={opponentId} initialTeamId={source.id} onCreated={() => { setDirection('outgoing'); setStatus('all'); }} /></aside></div></>}
  </main>;
}
