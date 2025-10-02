'use client';
import React from 'react';
import s from './styles.module.css';
import type { Token } from '../../tokens/types';

type Kind =
  | 'radius'
  | 'swatch'
  | 'shadow'
  | 'space'
  | 'text'
  | 'size'
  | 'z'
  | 'breakpoint';

function isPx(v: string) {
  return /-?\d+(\.\d+)?px$/.test(v);
}
function toRem(px: string) {
  const n = parseFloat(px.replace('px', ''));
  return `${(n / 16).toFixed(3).replace(/\.0+$/, '')}rem`;
}

export function formatValue(v: string, unit: 'raw' | 'px' | 'rem'): string {
  if (unit === 'raw') return v;
  if (unit === 'px') return v;
  if (unit === 'rem') {
    if (isPx(v)) return toRem(v);
    return v;
  }
  return v;
}

export function Preview({ token, kind }: { token: Token; kind: Kind }) {
  const v = token.value;

  if (kind === 'radius')
    return <div className={s.previewRadius} style={{ borderRadius: v }} />;

  if (kind === 'swatch') {
    const bg = v.startsWith('oklch') || v.startsWith('#') ? v : `var(${token.cssVar})`;
    return <div className={s.previewSwatch} style={{ background: bg }} />;
  }

  if (kind === 'shadow')
    return <div className={s.previewShadow} style={{ boxShadow: v }} />;

  if (kind === 'space') {
    const px = isPx(v) ? parseFloat(v) : 0;
    const pct = Math.min(100, (px / 64) * 100);
    return (
      <div className={s.previewSpace}>
        <span style={{ width: pct + '%' }} />
      </div>
    );
  }

  if (kind === 'size')
    return (
      <div
        className={s.preview}
        style={{
          width: v,
          height: v,
          borderRadius: 6,
          background:
            'color-mix(in oklab, oklch(var(--ds-color-primary, 0.62 0.12 265)) 25%, white)',
          border: '1px solid var(--ds-color-border, #e6e7eb)'
        }}
      />
    );

  if (kind === 'z') return <div className={s.preview}>z={v}</div>;
  if (kind === 'breakpoint') return <div className={s.preview}>{v}</div>;
  if (kind === 'text') return <div style={{ fontSize: v, lineHeight: 1.3 }}>Ag</div>;

  return null;
}
