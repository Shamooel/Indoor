import React, { useState } from 'react';

export default function FormField({ label, name, error, type = 'text', ...props }) {
  const [visible, setVisible] = useState(false);
  const password = type === 'password';
  return <div className="form-field">
    <label htmlFor={name}>{label}</label>
    <div className="input-wrap">
      <input {...props} id={name} name={name} type={password && visible ? 'text' : type}
        aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined} />
      {password && <button type="button" className="password-toggle" aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? 'Hide' : 'Show'}</button>}
    </div>
    {error && <p id={`${name}-error`} className="field-error">{error}</p>}
  </div>;
}
