import React from 'react';
export default function SectionNav({ current, group = 'competition' }) {
 const links = group === 'performance' ? [['/rankings','Team Rankings'],['/leaderboards','Player Leaderboards'],['/matches','Match Center']] : [['/teams','Teams'],['/players','Players'],['/rivalries','Rivalries']];
 return <nav className="secondary-nav" aria-label={group === 'performance' ? 'Results and rankings' : 'Team competition'}>{links.map(([href,label]) => <a key={href} href={href} aria-current={current === href ? 'page' : undefined}>{label}</a>)}</nav>;
}
