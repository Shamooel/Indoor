import React from 'react';
import PageHeader from './PageHeader';
export default function AccountGate({ next = '/booking' }) {
  return <main id="main" className="inner-page container access-gate"><PageHeader eyebrow="YOUR PLAYER ACCOUNT" title={next.startsWith('/booking') ? 'Your next game starts here' : 'Join the game'}>{next.startsWith('/booking') ? 'Create or access your player account to book a turf slot.' : 'Create or access your player account to manage teams, challenges, and conversations.'}</PageHeader><a className="button" href={`/account?next=${encodeURIComponent(next)}`}>Continue to My Account ↗</a><p className="helper">Frontend demo · No secure authentication or permanent storage. Changes reset on refresh.</p></main>;
}
