import React from 'react';
import '../styles/home-page.css';
const image = new URL('../assets/indoor-pitch.jpg', import.meta.url).href;
const highlights = [
  { title: 'Your player identity', description: 'Create your account, choose your sports, and make your player card your own.', href:'/account', action:'Create your account' },
  { title: 'Your people. Your team.', description: 'Join a squad or create a team. Captains can invite players and challenge opponents.', href:'/teams', action:'Find your team' },
  { title: 'Every game has a story', description: 'Follow football and cricket matches, compare results, and explore the rankings.', href:'/matches', action:'Explore matches' }
];
function Icon({ type }) {
  return <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">{type === 0 ? <><rect x="5" y="7" width="30" height="26" /><path d="M20 7v26M5 14h6v12H5m30-12h-6v12h6" /><circle cx="20" cy="20" r="5" /></> : type === 1 ? <path d="m4 17 16-12 16 12M8 16v18h24V16M14 34V23h12v11" /> : <><circle cx="15" cy="13" r="5" /><path d="M5 33v-5a10 10 0 0 1 20 0v5M27 8a5 5 0 0 1 0 10m3 5a8 8 0 0 1 5 8v2" /></>}</svg>;
}
export default function Home() {
  return <main id="main" tabIndex="-1">
    <section className="hero" id="home" aria-labelledby="hero-title">
      <img className="hero-image" src={image} width="1200" height="797" fetchPriority="high" alt="Illustrative indoor football turf beneath a covered roof" /><div className="hero-shade" />
      <div className="container hero-content"><p className="eyebrow"><i /> FOOTBALL & CRICKET / KARACHI</p>
        <h1 id="hero-title"><span className="hero-word" style={{ '--word-delay': '60ms' }}>Your</span>{' '}<span className="hero-word" style={{ '--word-delay': '160ms' }}>Game.</span><br /><span className="hero-word" style={{ '--word-delay': '260ms' }}>Your</span>{' '}<span className="hero-word" style={{ '--word-delay': '360ms' }}>Field<span className="dot">.</span></span></h1>
        <p className="hero-description">One indoor turf. Two ways to play. Bring your football or cricket team together at Legends Field Indoor, Karachi.</p><div className="hero-actions"><a className="button" href="/booking">Book Turf <span aria-hidden="true">↗</span></a><a className="hero-secondary" href="/account">Meet your player account ↗</a></div>
      </div><div className="container hero-bottom"><span>FOOTBALL / CRICKET / ONE FIELD</span><a href="#about">Discover more <span aria-hidden="true">↓</span></a></div>
    </section>
    <section className="about section-space" id="about"><div className="container about-layout"><div><p className="eyebrow">01 / OUR FIELD, YOUR STORY</p><h2>Where Every<br />Game Matters<span className="dot">.</span></h2></div><div className="about-copy"><p>Football. Cricket. Your kind of game.</p><p>A single indoor turf venue in Karachi, with a community built around playing together. Create your player account, pick a demo slot, and bring your own team and a registered opponent into one game plan.</p><a className="text-link" href="#facilities">Find your next step <span aria-hidden="true">↗</span></a></div></div></section>
    <section className="facilities section-space" id="facilities"><div className="container"><div className="section-heading"><div><p className="eyebrow">02 / FROM PLAYER TO PLAYMAKER</p><h2>Your Game Starts Here<span className="dot">.</span></h2></div><p>Your profile. Your team.<br />One connected game plan.</p></div><div className="facility-grid">{highlights.map((item, index) => <article className="facility" key={item.title}><div className="facility-top"><Icon type={index} /><span>0{index + 1}</span></div><h3>{item.title}</h3><p>{item.description}</p><a className="text-link" href={item.href}>{item.action} ↗</a></article>)}</div></div></section>
    <section className="booking" id="booking"><div className="container booking-inner"><div><p className="eyebrow">YOUR FIELD IS CALLING</p><h2>Ready to Play?</h2><p>Your next game starts here.</p></div><div className="booking-action"><a className="button button-light" href="/booking">Book Turf <span aria-hidden="true">↗</span></a><p>Account → slot → your team → opponent. Demo requests only.</p></div></div></section>
  </main>;
}
