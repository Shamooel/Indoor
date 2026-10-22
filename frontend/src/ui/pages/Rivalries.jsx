import SectionNav from '../components/SectionNav';
import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import DemoCommunityBar from '../components/DemoCommunityBar';
import { RivalryCard } from '../components/RivalryElements';
import { useCommunity } from '../state/CommunityStore';
import '../styles/community.css';
import '../styles/competition.css';

export default function Rivalries() {
  const { rivalries } = useCommunity();
  const [sport, setSport] = useState('All');
  const visible = rivalries.filter(rivalry => sport === 'All' || rivalry.sport === sport);
  return <main id="main" tabIndex="-1" className="inner-page container community-page competition-page"><SectionNav current="/rivalries" group="competition"/><PageHeader eyebrow="THE COMPETITION / RIVALRIES" title="Some fixtures mean a little more">Different sides. Shared history. Explore fictional head-to-head records from the demo community.</PageHeader><DemoCommunityBar /><div className="directory-meta"><div className="sport-filters" role="group" aria-label="Rivalry sport">{['All', 'Football', 'Cricket'].map(item => <button type="button" key={item} aria-pressed={sport === item} onClick={() => setSport(item)}>{item === 'All' ? 'All rivalries' : item}</button>)}</div><p role="status">{visible.length} demo {visible.length === 1 ? 'rivalry' : 'rivalries'}</p></div><div className="rivalry-grid">{visible.map(rivalry => <RivalryCard key={rivalry.id} rivalry={rivalry} />)}</div>{!visible.length && <p className="empty-state">No illustrative rivalries in this sport yet.</p>}<p className="directory-footnote">All match results and competitive records on this page are fictional. They are independent of challenge proposals and do not imply any real matches took place.</p></main>;
}
