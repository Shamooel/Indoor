import React, { useEffect, useRef, useState } from 'react';
import Brand from './Brand';
export default function Navbar({ path = '/' }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggle = useRef(null);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = event => {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 20);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return <header className={scrolled ? 'site-header is-scrolled' : 'site-header'}><div className="container nav-inner"><Brand /><button ref={toggle} className="menu-toggle" aria-expanded={open} aria-controls="main-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen(!open)}><span /><span /><span /></button><nav id="main-navigation" className={open ? 'navigation is-open' : 'navigation'} aria-label="Main navigation" onClick={() => setOpen(false)} onKeyDown={e => {
        if (e.key === 'Escape') {
          setOpen(false);
          toggle.current?.focus();
        }
      }}><a href="/" aria-current={path === '/' ? 'page' : undefined}>Home</a><a href="/#about">About</a><a href="/#facilities">Facilities</a><a href="/players" aria-current={path.startsWith('/players') ? 'page' : undefined}>Players</a><a href="/teams" aria-current={path.startsWith('/teams') ? 'page' : undefined}>Teams</a><a href="#contact">Contact</a><a href="/login" aria-current={path === '/login' ? 'page' : undefined}>Login</a><a href="/register" aria-current={path === '/register' ? 'page' : undefined}>Register</a><a className="button small-button" href="/booking" aria-current={path === '/booking' ? 'page' : undefined}>Book Now <span aria-hidden="true">↗</span></a></nav></div></header>;
}
