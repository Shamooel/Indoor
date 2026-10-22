import React from 'react';
import '../styles/phase2.css';

export default function PageHeader({ eyebrow, title, children }) {
  return <div className="page-heading">
    <p className="eyebrow">{eyebrow}</p>
    <h1>{title}<span className="dot">.</span></h1>
    <p>{children}</p>
  </div>;
}
