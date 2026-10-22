import React from 'react';
import { useCommunity } from '../state/CommunityStore';
export default function DemoCommunityBar() {
 const { activePlayer, notice, noticeKind } = useCommunity();
 return <div className="community-demo"><p>Demo community · Changes reset on refresh.</p><a href="/account" className="text-link">{activePlayer ? `${activePlayer.name} · My Account` : 'Create or access My Account'} ↗</a>{notice && <p className={`community-notice ${noticeKind}`} role="status">{notice}</p>}</div>;
}
