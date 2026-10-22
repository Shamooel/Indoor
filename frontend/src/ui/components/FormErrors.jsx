import React, { useEffect, useRef } from 'react';

export default function FormErrors({ errors }) {
  const summary = useRef(null);
  const messages = [...new Set(Object.values(errors).filter(Boolean))];
  const key = messages.join('|');
  useEffect(() => { if (key) summary.current?.focus(); }, [key]);
  return messages.length ? <div ref={summary} tabIndex="-1" className="form-error-summary" role="alert"><strong>Please check the following</strong><ul>{messages.map(message => <li key={message}>{message}</li>)}</ul></div> : null;
}
