import './state/theme';
import './styles/theme.css';
import React, { lazy, Suspense, useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnimatedPage from './components/AnimatedPage';
import './styles/home.css';
import './styles/polish.css';
import './styles/navigation.css';
import { useCommunity } from './state/CommunityStore';
import { requiresAccount } from './data/navigation';
const AccountGate = lazy(() => import('./components/AccountGate'));

const Home = lazy(() => import('./pages/Home'));
const CommunityProvider = lazy(() => import('./state/CommunityContext').then(module => ({ default: module.CommunityProvider })));
const Booking = lazy(() => import('./pages/Booking'));
const Account = lazy(() => import('./pages/Account'));
const AccountPages = lazy(() => import('./pages/AccountPages'));
const ManageTeam = lazy(() => import('./pages/ManageTeam'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const Login = Account;
const Register = Account;
const Players = lazy(() => import('./pages/Players'));
const PlayerProfile = lazy(() => import('./pages/PlayerProfile'));
const Teams = lazy(() => import('./pages/Teams'));
const CreateTeam = lazy(() => import('./pages/CreateTeam'));
const TeamProfile = lazy(() => import('./pages/TeamProfile'));
const Challenges = lazy(() => import('./pages/Challenges'));
const Inbox = lazy(() => import('./pages/Inbox'));
const Rivalries = lazy(() => import('./pages/Rivalries'));
const HeadToHead = lazy(() => import('./pages/HeadToHead'));
const Matches = lazy(() => import('./pages/Matches'));
const MatchDetails = lazy(() => import('./pages/MatchDetails'));
const Leaderboards = lazy(() => import('./pages/Leaderboards'));
const Rankings = lazy(() => import('./pages/Rankings'));
const routes = { '/': Home, '/account': Account, '/account/edit': EditProfile, '/booking': Booking, '/login': Login, '/register': Register, '/players': Players, '/teams': Teams, '/teams/create': CreateTeam, '/challenges': Challenges, '/inbox': Inbox, '/rivalries': Rivalries, '/matches': Matches, '/leaderboards': Leaderboards, '/rankings': Rankings };
export function resolveRoute(value) {
  const path = value.replace(/\/$/, '') || '/';
  if (routes[path]) return { Page: routes[path] };
  const account = path.match(/^\/account\/(profile|teams|bookings|matches|statistics|invitations|settings)$/);
  if (account) return { Page: AccountPages, view: account[1] };
  const manage = path.match(/^\/teams\/([^/]+)\/manage$/);
  if (manage) return { Page: ManageTeam, id: manage[1] };
  const player = path.match(/^\/players\/([^/]+)$/);
  if (player) return { Page: PlayerProfile, id: player[1] };
  const team = path.match(/^\/teams\/([^/]+)$/);
  if (team) return { Page: TeamProfile, id: team[1] };
  const rivalry = path.match(/^\/rivalries\/([^/]+)$/);
  if (rivalry) return { Page: HeadToHead, id: rivalry[1] };
  const match = path.match(/^\/matches\/([^/]+)$/);
  if (match) return { Page: MatchDetails, id: match[1] };
  return {};
}

function SiteRoutes() {
  const { activePlayer } = useCommunity();
  const [path, setPath] = useState(window.location.pathname.replace(/\/$/, '') || '/');
  const [search, setSearch] = useState(window.location.search);
  useEffect(() => {
    function onPopState() {
      const next = window.location.pathname.replace(/\/$/, '') || '/';
      setPath(next); setSearch(window.location.search);
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  useEffect(() => {
    const titles = { '/': 'Your Game. Your Field.', '/account': 'My Account', '/account/edit': 'Edit My Profile', '/booking': 'Book the Field', '/login': 'My Account', '/register': 'My Account', '/players': 'Discover Players', '/teams': 'Discover Teams', '/teams/create': 'Create a Demo Team', '/challenges': 'Match Challenges', '/inbox': 'Demo Captain Inbox', '/rivalries': 'Rivalries', '/matches': 'Demo Match Center', '/leaderboards': 'Demo Player Leaderboards', '/rankings': 'Demo Team Rankings' };
    document.title = `${titles[path] || (path.startsWith('/account/') ? 'My ' + path.split('/').pop() : path.endsWith('/manage') ? 'Manage Team' : path.startsWith('/players/') ? 'Demo Player Profile' : path.startsWith('/teams/') ? 'Demo Team Profile' : path.startsWith('/rivalries/') ? 'Demo Head-to-Head' : path.startsWith('/matches/') ? 'Demo Match Details' : 'Page not found')} | Legends Field Indoor`;
  }, [path]);
  function navigate(event) {
    const anchor = event.target.closest('a');
    if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.target || anchor.hasAttribute('download')) return;
    const url = new URL(anchor.href);
    if (url.origin === window.location.origin && url.pathname === '/booking' && !activePlayer) { url.pathname = '/account'; url.search = '?next=%2Fbooking'; url.hash = ''; }
    if (url.origin !== window.location.origin || !resolveRoute(url.pathname).Page) return;
    if (url.pathname === path && url.search === search && url.hash) return;
    event.preventDefault();
    if (url.pathname === path && url.search === search) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' });
      return;
    }
    window.history.pushState(null, '', url.pathname + url.search + url.hash);
    setPath(url.pathname);
    setSearch(url.search);
  }
  const { Page, id, view } = resolveRoute(path);
  const protectedPage = requiresAccount(path);
  const body = protectedPage && !activePlayer ? <AccountGate next={path + search} /> : Page ? <Page id={id} view={view} search={search} initialMode={path === '/login' ? 'access' : 'create'} /> : null;
  const loading = <main id="main" className="container route-loading" role="status">Getting the field ready...</main>;
  const shell = body => <div onClick={navigate}><a className="skip-link" href="#main">Skip to content</a><Navbar path={path} />{body}<Footer /></div>;
  const content = shell(<Suspense fallback={loading}><AnimatedPage pageKey={path + search} key={path + search + (activePlayer?.id || 'visitor')}>{Page ? body : <main id="main" className="container route-loading route-error" tabIndex="-1"><h1>Page not found.</h1><p>This page is not part of the Legends Field demo.</p><a className="button" href="/">Return home</a></main>}</AnimatedPage></Suspense>);
  // The single demo session remains mounted across all routes.
  return content;
}

export default function Website() { return <Suspense fallback={<main className="container route-loading" role="status">Getting the field ready...</main>}><CommunityProvider><SiteRoutes /></CommunityProvider></Suspense>;
}
