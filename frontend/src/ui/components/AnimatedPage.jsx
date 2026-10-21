import React, { useEffect, useRef } from 'react';

export default function AnimatedPage({ children, pageKey }) {
  const root = useRef(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
      else {
        window.scrollTo({ top: 0, behavior: 'instant' });
        const main = root.current?.querySelector('main');
        main?.setAttribute('tabindex', '-1');
        main?.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [pageKey]);
  useEffect(() => {
    if (!window.IntersectionObserver || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let observer;
    const elements = [...root.current.querySelectorAll('h2, .about-copy, .facility, .section-heading > p, .form-section, .summary-panel, .auth-panel, .registration-aside, .page-heading, .booking-inner, .hero-image, .player-tile, .team-tile, .community-section, .management-column')];
    try {
      observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-ready', 'is-revealed');
          observer.unobserve(entry.target);
        }
      }), { threshold: 0.08 });
      elements.forEach((element, index) => {
        // Keep every element visible until its observer callback starts a finite animation.
        element.style.setProperty('--reveal-delay', `${element.matches('.facility, .player-tile, .team-tile') ? index % 3 * 75 : 0}ms`);
        observer.observe(element);
      });
    } catch {
      elements.forEach(element => element.classList.remove('reveal-ready'));
    }
    return () => { observer?.disconnect(); elements.forEach(element => element.classList.remove('reveal-ready', 'is-revealed')); };
  }, [pageKey]);
  return <div ref={root} className="page-transition">{children}</div>;
}
