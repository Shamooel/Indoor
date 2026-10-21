import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { CanvasTexture, Shape, ShapeGeometry, SRGBColorSpace } from 'three';
const extrusionOptions = { depth: .1, bevelEnabled: true, bevelSize: .025, bevelThickness: .025, bevelSegments: 2, steps: 1 };

function writeLine(context, text, x, y, maxWidth) {
  let value = String(text);
  while (context.measureText(value).width > maxWidth && value.length > 1) value = value.slice(0, -2) + '…';
  context.fillText(value, x, y);
}
function makeTexture(player, sport, teamName, photo, back = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 560; canvas.height = 820;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Card texture unavailable');
  ctx.fillStyle = '#24382c'; ctx.fillRect(0, 0, 560, 820);
  ctx.strokeStyle = '#98ad80'; ctx.lineWidth = 2; ctx.strokeRect(28, 34, 504, 730);
  ctx.fillStyle = '#d1dfbe'; ctx.font = '600 16px Arial';
  ctx.fillText('LEGENDS FIELD', 54, 80); ctx.textAlign = 'right'; ctx.fillText('DEMO / ' + (sport === 'Football' ? 'FB' : 'CR'), 506, 80); ctx.textAlign = 'left';
  if (back) {
    ctx.textAlign = 'center'; ctx.font = '700 112px Arial'; ctx.fillStyle = '#a8be91'; ctx.fillText('LF', 280, 290);
    ctx.fillStyle = '#f6f5f0'; ctx.font = '700 34px Arial'; writeLine(ctx, player.name, 280, 395, 445);
    ctx.font = '18px Arial'; ctx.fillStyle = '#c4d1b9'; ctx.fillText(player.id.toUpperCase(), 280, 438);
    ctx.font = '26px Arial'; ctx.fillText(sport, 280, 535);
    ctx.font = '18px Arial'; writeLine(ctx, teamName || 'Independent demo player', 280, 578, 430);
    ctx.font = '14px Arial'; ctx.fillText('FICTIONAL PLAYER / NO OVERALL RATING', 280, 697);
    ctx.textAlign = 'left';
  } else {
    // Crop the local illustrative portrait; no network requests or external fonts in the scene.
    const size = Math.min(photo.width, photo.height);
    ctx.save(); ctx.beginPath(); ctx.rect(78, 129, 404, 382); ctx.clip();
    ctx.drawImage(photo, (photo.width - size) / 2, (photo.height - size) / 2, size, size, 78, 129, 404, 404); ctx.restore();
    ctx.fillStyle = '#b6d989'; ctx.fillRect(98, 482, 364, 48);
    ctx.fillStyle = '#223522'; ctx.font = '600 21px Arial'; ctx.textAlign = 'center'; writeLine(ctx, sport === 'Football' ? player.positions[0] : player.role, 280, 513, 335);
    ctx.fillStyle = '#f6f5f0'; ctx.font = '700 38px Arial'; writeLine(ctx, player.name, 280, 594, 450);
    ctx.fillStyle = '#c3d0b8'; ctx.font = '19px Arial'; writeLine(ctx, teamName || 'Independent demo player', 280, 635, 440);
    ctx.strokeStyle = '#6b805d'; ctx.beginPath(); ctx.moveTo(58, 677); ctx.lineTo(502, 677); ctx.stroke();
    ctx.textAlign = 'left'; ctx.font = '17px Arial'; ctx.fillText(sport.toUpperCase(), 58, 715);
    ctx.textAlign = 'right'; ctx.font = '15px Arial'; ctx.fillText(player.id.toUpperCase(), 502, 715); ctx.textAlign = 'left';
  }
  const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace;
  return texture;
}
function CardMesh({ player, sport, teamName, flipped, target, invalidateRef }) {
  const group = useRef(null);
  const photo = useTexture(player.photo);
  const invalidate = useThree(state => state.invalidate);
  const front = useMemo(() => makeTexture(player, sport, teamName, photo.image), [player, sport, teamName, photo]);
  const back = useMemo(() => makeTexture(player, sport, teamName, photo.image, true), [player, sport, teamName, photo]);
  const shape = useMemo(() => {
    const value = new Shape();
    value.moveTo(-1.19, 2.05); value.lineTo(1.19, 2.05); value.lineTo(1.4, 1.78); value.lineTo(1.4, -1.55); value.lineTo(1.12, -1.85); value.lineTo(0, -2.05); value.lineTo(-1.12, -1.85); value.lineTo(-1.4, -1.55); value.lineTo(-1.4, 1.78); value.closePath();
    return value;
  }, []);
  const faceGeometry = useMemo(() => {
    const geometry = new ShapeGeometry(shape);
    const position = geometry.getAttribute('position'); const uv = geometry.getAttribute('uv');
    for (let i = 0; i < position.count; i++) uv.setXY(i, position.getX(i) / 2.8 + .5, position.getY(i) / 4.1 + .5);
    uv.needsUpdate = true;
    return geometry;
  }, [shape]);
  useEffect(() => () => { front.dispose(); back.dispose(); }, [front, back]);
  useEffect(() => { invalidateRef.current = invalidate; invalidate(); return () => { invalidateRef.current = null; }; }, [invalidate, invalidateRef]);
  useEffect(() => { invalidate(); }, [flipped, sport, teamName, invalidate]);
  useFrame((state, delta) => {
    const mesh = group.current;
    if (!mesh) return;
    const x = target.current.x;
    const y = (flipped ? Math.PI : 0) + target.current.y;
    const blend = 1 - Math.exp(-10 * Math.min(delta, .05));
    mesh.rotation.x += (x - mesh.rotation.x) * blend;
    mesh.rotation.y += (y - mesh.rotation.y) * blend;
    if (Math.abs(x - mesh.rotation.x) + Math.abs(y - mesh.rotation.y) > .001) state.invalidate();
  });
  return <group ref={group}>
    <mesh position={[0, 0, -.05]}><extrudeGeometry args={[shape, extrusionOptions]} /><meshStandardMaterial color="#81936a" metalness={.6} roughness={.4} /></mesh>
    <mesh geometry={faceGeometry} position={[0, 0, .081]}><meshStandardMaterial map={front} roughness={.7} metalness={.08} /></mesh>
    <mesh geometry={faceGeometry} position={[0, 0, -.081]} rotation={[0, Math.PI, 0]}><meshStandardMaterial map={back} roughness={.7} metalness={.08} /></mesh>
  </group>;
}

export default function PlayerCardScene({ player, sport, teamName, flipped, fallback, onFailure }) {
  const target = useRef({ x: 0, y: 0 });
  const invalidate = useRef(null);
  function move(event) {
    if (event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    target.current = { x: -(event.clientY - rect.top - rect.height / 2) / rect.height * .18, y: (event.clientX - rect.left - rect.width / 2) / rect.width * .28 };
    invalidate.current?.();
  }
  function reset() { target.current = { x: 0, y: 0 }; invalidate.current?.(); }
  return <div className="webgl-player-card" onPointerMove={move} onPointerLeave={reset} aria-hidden="true">
    <Canvas camera={{ position: [0, 0, 7], fov: 39 }} dpr={[1, 1.5]} frameloop="demand" gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }} fallback={fallback} onCreated={({ gl }) => { gl.domElement.addEventListener('webglcontextlost', onFailure, { once: true }); }}>
      <ambientLight intensity={1.5} /><directionalLight position={[3, 4, 5]} intensity={2.5} /><directionalLight position={[-3, -1, 2]} intensity={.6} color="#d3e4bd" />
      <CardMesh player={player} sport={sport} teamName={teamName} flipped={flipped} target={target} invalidateRef={invalidate} />
    </Canvas>
  </div>;
}
