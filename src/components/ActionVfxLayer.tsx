import type { CSSProperties } from 'react';
import { ACTION_VFX_ASSETS, type ActionVfxKind } from '../core/actionVfx';

export interface ActionVfxBurst {
  id: number;
  x: number;
  y: number;
  kinds: ActionVfxKind[];
}

type ParticleStyle = CSSProperties & {
  '--vfx-drift': string;
  '--vfx-rise': string;
  '--vfx-rotate': string;
  '--vfx-delay': string;
  '--vfx-scale': string;
};

function particleStyle(seed: number): ParticleStyle {
  const drift = ((seed * 37) % 86) - 43;
  const rise = 72 + ((seed * 29) % 58);
  const rotate = ((seed * 53) % 110) - 55;
  const delay = (seed % 5) * 22;
  const scale = 0.72 + ((seed * 11) % 26) / 100;
  return {
    '--vfx-drift': `${drift}px`,
    '--vfx-rise': `${rise}px`,
    '--vfx-rotate': `${rotate}deg`,
    '--vfx-delay': `${delay}ms`,
    '--vfx-scale': String(scale),
  };
}

export function ActionVfxLayer({ bursts, reducedMotion }: { bursts: ActionVfxBurst[]; reducedMotion: boolean }) {
  return <div className={`action-vfx-layer ${reducedMotion ? 'reduced-motion' : ''}`} aria-hidden="true">
    {bursts.map(burst => {
      const perKind = reducedMotion ? 1 : Math.max(2, Math.floor(8 / Math.max(1, burst.kinds.length)));
      return <div className="action-vfx-burst" key={burst.id} style={{ left: burst.x, top: burst.y }}>
        {burst.kinds.flatMap((kind, kindIndex) => Array.from({ length: perKind }, (_, particleIndex) => {
          const seed = burst.id * 13 + kindIndex * 17 + particleIndex * 7;
          return <img
            className="action-vfx-particle"
            key={`${kind}-${particleIndex}`}
            src={ACTION_VFX_ASSETS[kind]}
            alt=""
            style={particleStyle(seed)}
            draggable={false}
          />;
        }))}
      </div>;
    })}
  </div>;
}
