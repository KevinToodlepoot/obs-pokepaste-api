'use client';

import { useState, useMemo, useEffect } from 'react';
import { FORMAT_PARAMS } from '@/lib/formatParams';

const DEFAULT_PASTE_URL = 'https://pokepast.es/fb2174b33a72fa27';

function buildDefaultParams() {
  const defaults = {};
  for (const p of FORMAT_PARAMS) {
    if (p.type === 'number') defaults[p.key] = p.default;
  }
  defaults.bg = 'FFFFFFFF'; // default color when bg is enabled
  return defaults;
}

function slugFromPasteUrl(pasteUrl) {
  // Strip protocol, keep "pokepast.es/..."
  return pasteUrl.replace(/^https?:\/\//, '');
}

function buildIframeSrc(pasteUrl, bgEnabled, params) {
  const slug = slugFromPasteUrl(pasteUrl.trim());
  if (!slug) return null;

  const query = new URLSearchParams();
  if (bgEnabled) {
    for (const p of FORMAT_PARAMS) {
      const val = params[p.key];
      if (p.type === 'color8') {
        if (val) query.set(p.key, val);
      } else if (p.type === 'number' && val !== p.default) {
        query.set(p.key, val);
      }
    }
  }
  const qs = query.toString();
  return `/${slug}${qs ? '?' + qs : ''}`;
}

function buildCopyUrl(origin, pasteUrl, bgEnabled, params) {
  const src = buildIframeSrc(pasteUrl, bgEnabled, params);
  if (!src) return '';
  return origin + src;
}

// Split 8-digit hex into { hex6, alpha0to100 }
function splitColor8(color8) {
  const hex6 = '#' + color8.slice(0, 6);
  const alpha = Math.round((parseInt(color8.slice(6, 8), 16) / 255) * 100);
  return { hex6, alpha };
}

// Merge hex6 (#rrggbb) + alpha (0-100) into 8-digit hex
function mergeColor8(hex6, alpha) {
  const rgb = hex6.replace('#', '');
  const a = Math.round((alpha / 100) * 255).toString(16).padStart(2, '0').toUpperCase();
  return rgb.toUpperCase() + a;
}

function ColorControl({ value, onChange }) {
  const { hex6, alpha } = splitColor8(value);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={hex6}
          onChange={e => onChange(mergeColor8(e.target.value, alpha))}
          className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent p-0"
        />
        <span className="text-gray-300 font-mono text-sm">{value}</span>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-gray-400 text-xs w-14">Opacity</label>
        <input
          type="range"
          min={0}
          max={100}
          value={alpha}
          onChange={e => onChange(mergeColor8(hex6, Number(e.target.value)))}
          className="flex-1 accent-blue-500"
        />
        <span className="text-gray-300 text-xs w-8 text-right">{alpha}%</span>
      </div>
    </div>
  );
}

function NumberControl({ param, value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={param.min}
        max={param.max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 accent-blue-500"
      />
      <input
        type="number"
        min={param.min}
        max={param.max}
        value={value}
        onChange={e => {
          const n = parseFloat(e.target.value);
          if (!isNaN(n)) onChange(Math.min(param.max, Math.max(param.min, n)));
        }}
        className="w-16 bg-gray-700 text-white text-sm rounded px-2 py-1 text-right"
      />
      {param.unit && <span className="text-gray-400 text-xs w-4">{param.unit}</span>}
    </div>
  );
}

export default function Home() {
  const [pasteUrl, setPasteUrl] = useState(DEFAULT_PASTE_URL);
  const [bgEnabled, setBgEnabled] = useState(false);
  const [params, setParams] = useState(buildDefaultParams);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');
  useEffect(() => { setOrigin(window.location.origin); }, []);

  const iframeSrc = useMemo(
    () => buildIframeSrc(pasteUrl, bgEnabled, params),
    [pasteUrl, bgEnabled, params]
  );

  function setParam(key, value) {
    setParams(prev => ({ ...prev, [key]: value }));
  }

  function handleCopy() {
    const url = buildCopyUrl(origin, pasteUrl, bgEnabled, params);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <main className="min-h-screen flex bg-gray-900 text-white font-['Montserrat',sans-serif]">
      {/* Controls panel */}
      <div className="w-80 shrink-0 flex flex-col gap-5 p-6 bg-gray-800 overflow-y-auto">
        <h1 className="text-2xl font-bold">OBS Pokepaste</h1>

        {/* Pokepaste URL */}
        <section className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Pokepaste URL
          </label>
          <input
            type="text"
            value={pasteUrl}
            onChange={e => setPasteUrl(e.target.value)}
            placeholder="https://pokepast.es/..."
            className="bg-gray-700 text-white text-sm rounded px-3 py-2 w-full placeholder-gray-500"
          />
        </section>

        {/* Background toggle */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Background Shape
            </label>
            <button
              onClick={() => setBgEnabled(v => !v)}
              className={`w-11 h-6 rounded-full transition-colors duration-200 relative overflow-hidden shrink-0 ${bgEnabled ? 'bg-blue-500' : 'bg-gray-600'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${bgEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {bgEnabled && (
            <div className="flex flex-col gap-4">
              {FORMAT_PARAMS.map(param => (
                <div key={param.key} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-200">{param.label}</span>
                    {param.hint && (
                      <span className="text-xs text-gray-500">— {param.hint}</span>
                    )}
                  </div>
                  {param.type === 'color8' ? (
                    <ColorControl
                      value={params.bg}
                      onChange={v => setParam('bg', v)}
                    />
                  ) : (
                    <NumberControl
                      param={param}
                      value={params[param.key]}
                      onChange={v => setParam(param.key, v)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Generated URL + copy */}
        <section className="flex flex-col gap-2 mt-auto pt-4 border-t border-gray-700">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            OBS URL
          </label>
          <div className="bg-gray-700 rounded px-3 py-2 text-xs text-green-400 font-mono break-all">
            {iframeSrc
              ? origin + iframeSrc
              : <span className="text-gray-500">Enter a pokepaste URL above</span>
            }
          </div>
          <button
            onClick={handleCopy}
            disabled={!iframeSrc}
            className="mt-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded transition-colors duration-150"
          >
            {copied ? 'Copied!' : 'Copy URL'}
          </button>
        </section>
      </div>

      {/* Live preview */}
      <div className="flex-1 flex flex-col">
        <div className="px-4 py-3 bg-gray-850 border-b border-gray-700 text-xs text-gray-400">
          Live Preview
        </div>
        <div className="flex-1 relative bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%3E%3Crect%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23555%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23555%22%2F%3E%3Crect%20x%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23444%22%2F%3E%3Crect%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23444%22%2F%3E%3C%2Fsvg%3E')]">
          {iframeSrc ? (
            <iframe
              key={iframeSrc}
              src={iframeSrc}
              className="absolute inset-0 w-full h-full border-0"
              title="Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Enter a pokepaste URL to preview
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
