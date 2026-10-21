import React from 'react';
const image = new URL('../assets/indoor-pitch.jpg', import.meta.url).href;
const highlights = [
  { title: 'The turf experience', description: 'A dedicated turf space for the game you love.' },
  { title: 'Take the game indoors', description: 'An indoor setting that keeps football at the centre.' },
  { title: 'Better, together', description: 'Bring your team and make every match count.' }
];
function Icon({ type }) {
  return <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">{type === 0 ? <><rect x="5" y="7" width="30" height="26" /><path d="M20 7v26M5 14h6v12H5m30-12h-6v12h6" /><circle cx="20" cy="20" r="5" /></> : type === 1 ? <path d="m4 17 16-12 16 12M8 16v18h24V16M14 34V23h12v11" /> : <><circle cx="15" cy="13" r="5" /><path d="M5 33v-5a10 10 0 0 1 20 0v5M27 8a5 5 0 0 1 0 10m3 5a8 8 0 0 1 5 8v2" /></>}</svg>;
}
export default function Home() {
  return <main id="main" tabIndex="-1">
    <section className="hero" id="home" aria-labelledby="hero-title">
      <img className="hero-image" src={image} width="1200" height="797" fetchPriority="high" alt="Illustrative indoor football turf beneath a covered roof" /><div className="hero-shade" />
      <div className="container hero-content"><p className="eyebrow"><i /> THE GAME BELONGS HERE</p>
        <h1 id="hero-title"><span className="hero-word" style={{ '--word-delay': '60ms' }}>Your</span>{' '}<span className="hero-word" style={{ '--word-delay': '160ms' }}>Game.</span><br /><span className="hero-word" style={{ '--word-delay': '260ms' }}>Your</span>{' '}<span className="hero-word" style={{ '--word-delay': '360ms' }}>Field<span className="dot">.</span></span></h1>
        <p className="hero-description">Experience the game at Legends Field Indoor. Your space to play, compete, and make every match count.</p><a className="button" href="/booking">Book Your Slot <span aria-hidden="true">↗</span></a>
      </div><div className="container hero-bottom"><span>BRING YOUR TEAM. MAKE IT YOUR GAME.</span><a href="#about">Explore the field <span aria-hidden="true">↓</span></a></div>
    </section>
    <section className="about section-space" id="about"><div className="container about-layout"><div><p className="eyebrow">01 / OUR FIELD, YOUR STORY</p><h2>Where Every<br />Game Matters<span className="dot">.</span></h2></div><div className="about-copy"><p>Some moments only happen on the field.</p><p>The first touch. The perfect pass. The goal everyone talks about. Legends Field Indoor is a space to come together, enjoy football, and turn a game with your team into something worth remembering.</p><a className="text-link" href="#facilities">Get to know the field <span aria-hidden="true">↗</span></a></div></div></section>
    <section className="facilities section-space" id="facilities"><div className="container"><div className="section-heading"><div><p className="eyebrow">02 / THE INDOOR EXPERIENCE</p><h2>Built for the Game<span className="dot">.</span></h2></div><p>A place to find your rhythm.<br />And leave it all on the field.</p></div><div className="facility-grid">{highlights.map((item, index) => <article className="facility" key={item.title}><div className="facility-top"><Icon type={index} /><span>0{index + 1}</span></div><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></div></section>
    <section className="booking" id="booking"><div className="container booking-inner"><div><p className="eyebrow">YOUR FIELD IS CALLING</p><h2>Ready to Play?</h2><p>Your next game starts here.</p></div><div className="booking-action"><a className="button button-light" href="/booking">Book Now <span aria-hidden="true">↗</span></a><p>Explore the booking preview.</p></div></div></section>
  </main>;
}
