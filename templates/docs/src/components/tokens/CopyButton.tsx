
'use client';
import React from 'react';
type Props = { text: string; label?: string };
export function CopyButton({ text, label = 'Copy' }: Props) {
  const [copied, setCopied] = React.useState(false);
  const onCopy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch { return; }
  };
  return <button className="tk-copy" onClick={onCopy} aria-label={`Copy ${text}`}>{copied ? 'Copied' : label}</button>;
}
