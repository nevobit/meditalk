
'use client';
import React from 'react';
import { CopyButton } from './CopyButton';
import { FilterBar } from './FilterBar';
import { Preview, formatValue } from './TokenPreview';
import type { Token } from '../../../src/tokens';

type Kind = 'radius' | 'swatch' | 'shadow' | 'space' | 'text' | 'size' | 'z' | 'breakpoint';

type Props = { title?: string; tokens: Token[]; kind: Kind; showUnitToggle?: boolean; };

function useFilter(tokens: Token[]) {
  const [q, setQ] = React.useState('');
  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return tokens;
    return tokens.filter(t =>
      t.key.toLowerCase().includes(query) ||
      t.cssVar.toLowerCase().includes(query) ||
      t.value.toLowerCase().includes(query) ||
      (t.description ?? '').toLowerCase().includes(query)
    );
  }, [q, tokens]);
  return { q, setQ, filtered };
}

export function TokenTable({ title, tokens, kind, showUnitToggle=true }: Props) {
  const { q, setQ, filtered } = useFilter(tokens);
  const [unit, setUnit] = React.useState<'raw'|'px'|'rem'>('raw');
  return (
    <section>
      {title && <h2 style={{ margin: '1rem 0 .25rem' }}>{title}</h2>}
      <FilterBar query={q} onQuery={setQ} unit={unit} onUnit={setUnit} showUnitToggle={showUnitToggle} />
      <table className="tk-table">
        <thead>
          <tr>
            <th style={{ width: 80 }}>Preview</th>
            <th>Name</th>
            <th>Value</th>
            <th style={{ width: '30%' }}>Description</th>
            <th style={{ width: 160 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((t) => (
            <tr className="tk-row" key={t.key}>
              <td><Preview token={t} kind={kind} /></td>
              <td><span className="tk-chip">{t.cssVar}</span></td>
              <td><code>{formatValue(t.value, unit)}</code></td>
              <td>{t.description ?? '—'}</td>
              <td className="tk-actions">
                <CopyButton text={t.cssVar} label="Copy var" />
                <CopyButton text={t.value} label="Copy value" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
