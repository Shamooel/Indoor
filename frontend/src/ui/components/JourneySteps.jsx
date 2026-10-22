import React, { useEffect, useRef } from 'react';
export default function JourneySteps({ labels, step }) {
  const list = useRef(null);
  useEffect(() => { const current = list.current?.children[step]; if (current && list.current.scrollWidth > list.current.clientWidth) list.current.scrollLeft = current.offsetLeft - list.current.offsetLeft; }, [step]);
  return <ol className="journey-steps" ref={list} aria-label="Progress">{labels.map((label,i) => <li key={label} aria-current={i === step ? 'step' : undefined}><b>{i < step ? '✓' : String(i+1).padStart(2,'0')}</b>{label}</li>)}</ol>;
}
