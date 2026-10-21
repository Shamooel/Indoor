import React, { lazy, Suspense, useEffect, useState } from 'react';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnimatedPage from './components/AnimatedPage';
import { CommunityProvider } from './state/CommunityContext';
import './styles/home.css';
import './styles/phase2.css';
import './styles/navigation.css';

const Booking = lazy(() => import('./pages/Booking'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Players = lazy(() => import('./pages/Players'));
const PlayerProfile = lazy(() => import('./pages/PlayerProfile'));
const Teams = lazy(() => import('./pages/Teams'));
const CreateTeam = lazy(() => import('./pages/CreateTeam'));
const TeamProfile = lazy(() => import('./pages/TeamProfile'));
const routes = { '/': Home, '/booking': Booking, '/login': Login, '/register': Register, '/players': Players, '/teams': Teams, '/teams/create': CreateTeam };
function resolveRoute(path) {
  if (routes[path]) return { Page: routes[path] };
  const player = path.match(/^\/players\/([^/]+)$/);
  if (player) return { Page: PlayerProfile, id: player[1] };
  const team = path.match(/^\/teams\/([^/]+)$/);
  if (team) return { Page: TeamProfile, id: team[1] };
  return {};
}

export default function Website() {
  const [path, setPath] = useState(window.location.pathname.replace(/\/$/, '') || '/');
  useEffect(() => {
    function onPopState() { setPath(window.location.pathname.replace(/\/$/, '') || '/'); }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  useEffect(() => {
    const titles = { '/': 'Your Game. Your Field.', '/booking': 'Book the Field', '/login': 'Player Login', '/register': 'Player Registration', '/players': 'Discover Players', '/teams': 'Discover Teams', '/teams/create': 'Create a Demo Team' };
    document.title = `${titles[path] || (path.startsWith('/players/') ? 'Demo Player Profile' : path.startsWith('/teams/') ? 'Demo Team Profile' : 'Page not found')} | Legends Field Indoor`;
  }, [path]);
  function navigate(event) {
    const anchor = event.target.closest('a');
    if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.target || anchor.hasAttribute('download')) return;
    const url = new URL(anchor.href);
    if (url.origin !== window.location.origin || !resolveRoute(url.pathname).Page) return;
    if (url.pathname === path && url.hash) return;
    event.preventDefault();
    if (url.pathname === path) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' });
      return;
    }
    window.history.pushState(null, '', url.pathname + url.hash);
    setPath(url.pathname);
  }
  const { Page, id } = resolveRoute(path);
  return <CommunityProvider><div onClick={navigate}><a className="skip-link" href="#main">Skip to content</a><Navbar path={path} /><Suspense fallback={<main id="main" className="inner-page container" role="status">Getting the field ready…</main>}><AnimatedPage pageKey={path} key={path}>{Page ? <Page id={id} /> : <main id="main" className="inner-page container" tabIndex="-1"><h1>Page not found.</h1><a className="button" href="/">Return home</a></main>}</AnimatedPage></Suspense><Footer /></div></CommunityProvider>;
}
