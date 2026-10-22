import React, { useEffect, useRef, useState } from 'react';

export default function ImageUpload({ value, onChange, onStatusChange, id = "team-logo", label = "Team logo" }) {
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const version = useRef(0);
  const input = useRef(null);
  useEffect(() => () => { version.current += 1; }, []);
  function status(isPending, message = '') { setPending(isPending); setError(message); onStatusChange(isPending || Boolean(message)); }
  function reset() { version.current += 1; onChange(''); status(false); if (input.current) input.current.value = ''; }
  function upload(event) {
    const file = event.target.files?.[0];
    reset();
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { status(false, 'Choose a JPG, PNG, or WebP image.'); return; }
    if (file.size > 2 * 1024 * 1024) { status(false, 'Choose an image of 2 MB or less.'); return; }
    status(true);
    const current = version.current;
    const reader = new FileReader();
    const fail = () => { if (current === version.current) status(false, 'This image could not be read. Choose another file or remove it.'); };
    reader.onerror = fail;
    reader.onload = () => {
      const image = new Image();
      image.onerror = fail;
      image.onload = () => {
        if (current !== version.current) return;
        // Downsample large logos so local demo state stays small across page navigation.
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 400 / Math.max(image.width, image.height));
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        if (!context) { fail(); return; }
        try {
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          onChange(canvas.toDataURL('image/png'));
          status(false);
        } catch { fail(); }
      };
      image.src = reader.result;
    };
    try { reader.readAsDataURL(file); } catch { fail(); }
  }
  return <div className="team-logo-upload"><div className="upload-preview">{value ? <img src={value} alt={`Selected ${label.toLowerCase()} preview`} /> : <span aria-hidden="true">LF</span>}</div><div><label htmlFor={id}>{label} <span className="helper">(optional)</span></label><input id={id} ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} aria-invalid={Boolean(error)} aria-describedby={`${id}-help ${id}-status`} /><p className="helper" id={`${id}-help`}>JPG, PNG, or WebP · Up to 2 MB. A default image is used if you skip this.</p>{(value || error || pending) && <button type="button" className="text-button" onClick={reset}>Remove image</button>}<p id={`${id}-status`} className={error ? 'field-error' : 'helper'} role="status">{pending ? 'Preparing image…' : error}</p></div></div>;
}
