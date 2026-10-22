import '../styles/workspaces.css';
﻿import React, { useEffect, useRef, useState } from 'react';
import PageHeader from '../components/PageHeader';
import DemoCommunityBar from '../components/DemoCommunityBar';
import { TeamLogo } from '../components/CommunityElements';
import { ChallengeStatus } from '../components/ChallengeCard';
import { useCommunity } from '../state/CommunityStore';
import { messageTime, sameTeamPair } from '../data/competition';
import '../styles/community.css';
import '../styles/competition.css';

function ConversationPanel({ thread, source, opponent, onBack }) {
  const { teams, players, challenges, dispatch } = useCommunity();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const log = useRef(null);
  const input = useRef(null);
  useEffect(() => { if (log.current) log.current.scrollTop = log.current.scrollHeight; }, [thread.messages.length]);
  const related = challenges.filter(item => sameTeamPair(item.fromTeamId, item.toTeamId, thread.teamIds));
  function submit(event) {
    event.preventDefault();
    if (!draft.trim() || draft.trim().length > 1000) { setError('Enter a message of 1–1,000 characters.'); input.current?.focus(); return; }
    const outcome = dispatch({ type: 'sendMessage', conversationId: thread.id, fromTeamId: source.id, text: draft });
    if (!outcome.ok) { setError(outcome.error); return; }
    setDraft(''); setError(''); input.current?.focus();
  }
  return <section className="conversation-panel" aria-labelledby="conversation-title">
    <div className="conversation-header"><button className="text-button inbox-mobile-back" type="button" onClick={onBack}>← Conversations</button><div><TeamLogo team={opponent} /><div><h2 id="conversation-title">{opponent.name}</h2><p>{players.find(player => player.id === opponent.captainId)?.name} · {opponent.sport} demo captain</p></div></div><span className="local-only-label">LOCAL DEMO</span></div>
    <p className="conversation-identity">Writing as <strong>{source.name}</strong>. Messages stay in this tab; no delivery or read receipts.</p>
    {related.length > 0 && <div className="related-challenges"><span>Related proposals</span>{related.slice(-2).map(item => <a key={item.id} href={`/challenges?from=${source.id}&challenge=${item.id}#${item.id}`}><span>{item.date} · {item.time} PKT</span><ChallengeStatus status={item.status} /><span aria-hidden="true">↗</span></a>)}</div>}
    <div className="conversation-messages" ref={log} role="log" aria-label="Local demo conversation history" aria-live="polite" aria-relevant="additions text">{thread.messages.length ? thread.messages.map(message => {
      const sender = teams.find(team => team.id === message.fromTeamId);
      return <article className={`message-bubble ${message.fromTeamId === source.id ? 'own-message' : ''}`} key={message.id}><p className="message-author">{sender?.name}</p><p>{message.text}</p><footer><time dateTime={message.timestamp} title={messageTime(message.timestamp, true)}>{messageTime(message.timestamp)}</time><span>Demo only</span></footer></article>;
    }) : <div className="conversation-empty"><p className="eyebrow">START THE DISCUSSION</p><h3>Put a plan into words.</h3><p>Agree on a proposal here in the demo. A real match still needs a separate confirmed turf booking.</p></div>}</div>
    <form className="message-composer" onSubmit={submit} noValidate><label htmlFor="captain-message">Local demo message</label><textarea ref={input} id="captain-message" rows="3" maxLength={1000} value={draft} onChange={event => { setDraft(event.target.value); setError(''); }} placeholder="Discuss a proposed date, time, or match arrangement…" aria-invalid={Boolean(error)} aria-describedby="message-help message-error" /><div><p className="helper" id="message-help">{draft.length}/1,000 · Nothing is delivered</p><button className="button" type="submit">Add demo message <span aria-hidden="true">↗</span></button></div><p id="message-error" className="field-error" role="alert">{error}</p></form>
  </section>;
}

export default function Inbox({ search = '' }) {
  const { teams, activePlayer, conversations, inboxConversationId, dispatch } = useCommunity();
  const [sourceId, setSourceId] = useState(new URLSearchParams(search).get('from') || '');
  const [opponentId, setOpponentId] = useState('');
  const [showConversation, setShowConversation] = useState(Boolean(inboxConversationId || new URLSearchParams(search).get('thread')));
  const [selectedId, setSelectedId] = useState('');
  const identity = useRef(activePlayer.id);
  const [formError, setFormError] = useState('');
  const ownTeams = teams.filter(team => team.captainId === activePlayer.id);
  const selectedSource = ownTeams.find(team => team.id === sourceId) || ownTeams.find(t => conversations.find(c => c.id === new URLSearchParams(search).get('thread'))?.teamIds.includes(t.id)) || ownTeams[0];
  const possibleOpponents = selectedSource ? teams.filter(team => team.sport === selectedSource.sport && team.id !== selectedSource.id) : [];
  const selectedOpponent = possibleOpponents.find(team => team.id === opponentId);
  const visible = conversations.filter(thread => thread.teamIds.includes(selectedSource?.id)).sort((a, b) => new Date(b.messages.at(-1)?.timestamp || 0) - new Date(a.messages.at(-1)?.timestamp || 0));
  const linkedId = new URLSearchParams(search).get('thread');
  const linked = visible.find(thread => thread.id === linkedId);
  const active = visible.find(thread => thread.id === selectedId) || linked || visible.find(thread => thread.id === inboxConversationId) || visible[0];
  const source = active && selectedSource;
  const opponent = active && teams.find(team => active.teamIds.includes(team.id) && team.id !== source?.id);
  useEffect(() => {
    if (identity.current !== activePlayer.id) { identity.current = activePlayer.id; setShowConversation(false); setFormError(''); setSelectedId(''); }
  }, [activePlayer.id]);
  function open(event) {
    event.preventDefault();
    if (!selectedSource || !selectedOpponent) { setFormError('Choose your captain team and an opponent in the same sport.'); return; }
    const outcome = dispatch({ type: 'openConversation', fromTeamId: selectedSource.id, toTeamId: selectedOpponent.id });
    if (!outcome.ok) { setFormError(outcome.error); return; }
    setSelectedId(outcome.state.inboxConversationId);
    setFormError(''); setShowConversation(true);
  }
  return <main id="main" tabIndex="-1" className="inner-page container community-page competition-page">
    <a className="back-link" href={selectedSource ? `/teams/${selectedSource.id}/manage` : "/account/teams"}>← Team workspace</a><PageHeader eyebrow="THE COMPETITION / CAPTAIN INBOX" title="Great games begin with a conversation">Talk through the next fixture, captain to captain. A local preview of how match arrangements could feel.</PageHeader><DemoCommunityBar />
    {linkedId && !linked && <p className="demo-note">This conversation is unavailable for the selected demo captain, or the session has reset.</p>}
    {ownTeams.length ? <><form className="new-conversation" onSubmit={open} noValidate><div><label htmlFor="inbox-source">Your captain team</label><select id="inbox-source" value={selectedSource?.id || ''} onChange={event => { setSourceId(event.target.value); setSelectedId(''); setShowConversation(false); setOpponentId(''); setFormError(''); }}>{ownTeams.map(team => <option key={team.id} value={team.id}>{team.name} · {team.sport}</option>)}</select></div><div><label htmlFor="inbox-opponent">Opposing team</label><select id="inbox-opponent" value={selectedOpponent?.id || ''} onChange={event => { setOpponentId(event.target.value); setFormError(''); }} aria-invalid={Boolean(formError)} aria-describedby={formError ? 'conversation-error' : undefined}><option value="">Choose an opponent</option>{possibleOpponents.map(team => <option value={team.id} key={team.id}>{team.name}</option>)}</select></div><button type="submit" className="button">Open demo conversation <span aria-hidden="true">↗</span></button>{formError && <p className="field-error" role="alert" id="conversation-error">{formError}</p>}</form>
      <div className={`captain-inbox ${showConversation ? 'conversation-is-open' : ''}`}><aside className="conversation-list" aria-label="Demo captain conversations"><div className="conversation-list-heading"><h2>Conversations</h2><span>{visible.length} local</span></div>{visible.length ? visible.map(thread => {
        const ownTeam = selectedSource;
        const other = teams.find(team => thread.teamIds.includes(team.id) && team.id !== ownTeam?.id);
        const latest = thread.messages.at(-1);
        return <button type="button" key={thread.id} aria-pressed={thread.id === active?.id} onClick={() => { dispatch({ type: 'openConversation', fromTeamId: ownTeam.id, toTeamId: other.id }); setSelectedId(thread.id); setShowConversation(true); }}><TeamLogo team={other} /><span><strong>{other.name}</strong><small>{ownTeam.name} · {ownTeam.sport}</small><span className="conversation-preview">{latest?.text || 'No demo messages yet.'}</span>{latest && <time dateTime={latest.timestamp}>{messageTime(latest.timestamp)}</time>}</span></button>;
      }) : <div className="empty-state">No conversations yet. Choose an opponent above to open a local demo thread.</div>}</aside>
        {active && source && opponent ? <ConversationPanel key={`${active.id}-${activePlayer.id}-${source.id}`} thread={active} source={source} opponent={opponent} onBack={() => setShowConversation(false)} /> : <section className="conversation-panel conversation-empty"><h2>Pick a conversation.</h2><p>Open a demo thread with an opposing team captain to start planning.</p><button type="button" className="text-button inbox-mobile-back" onClick={() => setShowConversation(false)}>← Conversations</button></section>}
      </div></> : <div className="empty-state"><h2>This demo player is not a captain yet.</h2><p>Create your own team to start conversations with other captains. You can switch sample accounts in My Account settings.</p><a href="/teams/create" className="text-link">Create a demo team ↗</a></div>}
  </main>;
}

