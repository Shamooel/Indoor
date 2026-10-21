import React from 'react';
import Brand from './Brand';
export default function Footer() {
  return <footer id="contact"><div className="container"><div className="footer-top"><Brand /><nav aria-label="Footer navigation"><a href="/">Home</a><a href="/#about">About</a><a href="/#facilities">Facilities</a><a href="/players">Players</a><a href="/teams">Teams</a><a href="#contact">Contact</a><a href="/login">Login</a><a href="/register">Register</a></nav><p>Contact details coming soon.</p></div><div className="footer-bottom"><p>© {new Date().getFullYear()} Legends Field Indoor. All rights reserved.</p><span>FOR THE LOVE OF THE GAME.</span></div></div></footer>;
}

