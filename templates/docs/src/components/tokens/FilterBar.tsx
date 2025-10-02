
'use client';
import React from 'react';
type Props = { query: string; onQuery: (v: string) => void; unit?: 'raw'|'px'|'rem'; onUnit?: (u:'raw'|'px'|'rem')=>void; showUnitToggle?: boolean; };
export function FilterBar({ query, onQuery, unit='raw', onUnit, showUnitToggle=true }: Props) {
  return (
    <div className="tk-filterbar">
      <input className="tk-input" placeholder="Filter tokens…" value={query} onChange={(e)=>onQuery(e.target.value)} />
      {showUnitToggle && onUnit && (
        <div className="tk-seg" role="group" aria-label="Units">
          <button aria-pressed={unit==='raw'} onClick={()=>onUnit('raw')}>raw</button>
          <button aria-pressed={unit==='px'} onClick={()=>onUnit('px')}>px</button>
          <button aria-pressed={unit==='rem'} onClick={()=>onUnit('rem')}>rem</button>
        </div>
      )}
    </div>
  );
}
