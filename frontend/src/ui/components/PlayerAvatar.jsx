import React, { useState } from 'react';
import { defaultPhoto } from '../data/identity';
export default function PlayerAvatar({ player, size = 48, className = '', alt, ...props }) {
  const [failedSource,setFailedSource] = useState(null);
  const src = player?.photo && failedSource !== player.photo ? player.photo : defaultPhoto;
  return <img {...props} className={`player-avatar ${className}`} src={src} width={size} height={size} alt={alt ?? `${player?.name || 'Player'} profile picture`} loading="lazy" onError={() => { if (src !== defaultPhoto) setFailedSource(src); }}/>;
}
