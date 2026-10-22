import ThemeToggle from './ThemeToggle';
﻿import React, { useEffect, useRef, useState } from 'react';
import Brand from './Brand';
import { useCommunity } from '../state/CommunityStore';
import { goTo } from '../data/navigation';

const communityLinks = [['/players', 'Players'], ['/leaderboards', 'Player leaderboards'], ['/rivalries', 'Rivalries']];
export default function Navbar({ path = '/' }) {
  const { activePlayer, dispatch } = useCommunity();
  const [open, setOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggle = useRef(null);
  const communityToggle = useRef(null);
  const header = useRef(null);
  const isCommunity = communityLinks.some(([href]) => path === href || path.startsWith(href + '/'));
  useEffect(() => { setOpen(false); setCommunityOpen(false); }, [path]);
  useEffect(() => {
    if (!open && !communityOpen) return;
    const keydown = event => {
      if (event.key !== 'Escape') return;
      if (communityOpen) { setCommunityOpen(false); communityToggle.current?.focus(); }
      else { setOpen(false); toggle.current?.focus(); }
    };
    const outside = event => { if (!header.current?.contains(event.target)) { setOpen(false); setCommunityOpen(false); } };
    document.addEventListener('keydown', keydown);
    document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', keydown); document.removeEventListener('pointerdown', outside); };
  }, [open, communityOpen]);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 20);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return <header ref={header} className={scrolled ? 'site-header is-scrolled' : 'site-header'}>
    <div className="container nav-inner"><Brand />
      <button ref={toggle} className="menu-toggle" aria-expanded={open} aria-controls="main-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => { setOpen(!open); setCommunityOpen(false); }}><span /><span /><span /></button>
      <nav id="main-navigation" className={open ? 'navigation is-open' : 'navigation'} aria-label="Main navigation" onClick={event => { if (event.target.closest('a')) { setOpen(false); setCommunityOpen(false); } }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setCommunityOpen(false); }}>
        {[['/', 'Home'], ['/booking', 'Book Turf'], ['/teams', 'Teams'], ['/matches', 'Matches'], ['/rankings', 'Rankings']].map(([href,label]) => <a key={href} href={href} aria-current={path === href ? 'page' : undefined}>{label}</a>)}
        <div className="community-nav"><button ref={communityToggle} type="button" className={`community-nav-trigger ${isCommunity ? 'is-current' : ''}`} aria-expanded={communityOpen} aria-controls="community-navigation" onClick={() => setCommunityOpen(!communityOpen)}>Explore <span aria-hidden="true">⌄</span></button>
          <div id="community-navigation" className="community-nav-panel" hidden={!communityOpen}>{communityLinks.map(([href, label]) => <a key={href} href={href} aria-current={path === href || path.startsWith(href + '/') ? 'page' : undefined}>{label}<span aria-hidden="true">↗</span></a>)}{activePlayer && <><a href="/account/profile">My Profile ↗</a><a href="/account/teams">My Teams ↗</a><a href="/account/bookings">My Bookings ↗</a><a href="/account/settings">Account Settings ↗</a><button className="text-button" onClick={() => { dispatch({ type: 'exitAccount' }); setCommunityOpen(false); setOpen(false); goTo('/account'); }}>Exit Demo Account</button></>}<ThemeToggle/></div>
        </div>
        <a className="account-link" href="/account" aria-current={path.startsWith('/account') ? 'page' : undefined}>{activePlayer && <img className="nav-avatar" src={activePlayer.photo} alt="" />}My Account</a>

      </nav>
    </div>
  </header>;
}
