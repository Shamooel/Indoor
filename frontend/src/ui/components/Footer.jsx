import React from 'react';
import Brand from './Brand';
export default function Footer() {
  return <footer id="contact"><div className="container"><div className="footer-top"><Brand /><nav aria-label="Footer navigation"><a href="/booking">Book Turf</a><a href="/account">My Account</a><a href="/players">Players</a><a href="/teams">Teams</a><a href="/matches">Matches</a><a href="/leaderboards">Player leaderboards</a><a href="/rankings">Team rankings</a><a href="/challenges">Team challenges</a><a href="/rivalries">Rivalries</a><a href="/inbox">Captain inbox</a></nav><p>Football & cricket · Karachi</p></div><div className="footer-bottom"><p>© {new Date().getFullYear()} Legends Field Indoor. All rights reserved.</p><span>FOR THE LOVE OF THE GAME.</span></div></div></footer>;
}
