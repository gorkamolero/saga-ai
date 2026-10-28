'use client';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ImageIcon, TextCursorInput, ZoomIn, ZoomOut } from 'lucide-react';
import { EditorContext } from './editor-context';
import { type WordType } from '@/lib/validators/words';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Player, timelineTime } from './bottom-player';

export const TranscriptDisplay = ({ words }: { words: WordType[] }) => {
  const {
    assets,
    currentTime,
    duration,
    seekTo,
    selectedAsset,
    setSelectedAsset,
    saveAsset,
  } = useContext(EditorContext);
  const [zoom, setZoom] = useState(110);
  const [range, setRange] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const drag = useRef<'start' | 'end' | null>(null);
  const active = words.findIndex(
    (word) => currentTime * 1000 >= word.start && currentTime * 1000 < word.end,
  );
  const step = zoom >= 150 ? 1 : zoom >= 65 ? 2 : 5;
  const width = Math.max(duration * zoom, 800);
  const zoomTo = (value: number) => setZoom(Math.min(320, Math.max(30, value)));

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const x = currentTime * zoom;
    if (x < el.scrollLeft + 24 || x > el.scrollLeft + el.clientWidth - 80) {
      el.scrollLeft = Math.max(0, x - el.clientWidth * 0.3);
    }
  }, [currentTime, zoom]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        setZoom((value) =>
          Math.min(320, Math.max(30, value * Math.exp(-event.deltaY * 0.005))),
        );
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const assign = async (start: WordType, end: WordType) => {
    if (!selectedAsset || saving || start.start >= end.end) return;
    setSaving(true);
    setStatus('');
    try {
      await saveAsset({
        id: selectedAsset.id,
        start: start.start,
        end: end.end,
        startWordIndex: start.index,
        endWordIndex: end.index,
      });
      setStatus('Timing saved');
    } catch {
      setStatus('Could not save timing. Try again.');
    } finally {
      setSaving(false);
    }
  };
  const finishDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const boundary = drag.current;
    drag.current = null;
    if (!boundary || !selectedAsset || !canvas.current) return;
    const time =
      ((event.clientX - canvas.current.getBoundingClientRect().left) / zoom) *
      1000;
    const word = words.reduce<WordType | undefined>(
      (nearest, item) =>
        !nearest ||
        Math.abs(item[boundary] - time) < Math.abs(nearest[boundary] - time)
          ? item
          : nearest,
      undefined,
    );
    if (!word) return;
    // Existing clips need not already fall exactly on a word boundary.
    if (boundary === 'start' && word.start < (selectedAsset.end ?? 0)) {
      setSaving(true);
      saveAsset({
        id: selectedAsset.id,
        start: word.start,
        startWordIndex: word.index,
      })
        .then(() => setStatus('Timing saved'))
        .catch(() => setStatus('Could not save timing. Try again.'))
        .finally(() => setSaving(false));
    } else if (boundary === 'end' && word.end > (selectedAsset.start ?? 0)) {
      setSaving(true);
      saveAsset({
        id: selectedAsset.id,
        end: word.end,
        endWordIndex: word.index,
      })
        .then(() => setStatus('Timing saved'))
        .catch(() => setStatus('Could not save timing. Try again.'))
        .finally(() => setSaving(false));
    }
  };

  return (
    <section aria-label="Video timeline" className="shrink-0 border-t bg-card">
      <div className="flex h-14 items-center justify-between gap-4 border-b px-4">
        <Player />
        <div className="text-xs flex items-center gap-2 text-muted-foreground">
          <span className="mr-2 hidden font-semibold uppercase tracking-widest lg:inline">
            Timeline
          </span>
          <span className="hidden xl:inline">
            Click to seek · Shift-click to select a range
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ZoomOut className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            aria-label="Timeline zoom"
            type="range"
            min="30"
            max="320"
            value={zoom}
            onChange={(e) => zoomTo(Number(e.target.value))}
            className="w-28 accent-slate-500"
          />
          <ZoomIn className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs w-12 text-right font-mono text-muted-foreground">
            {Math.round((zoom / 110) * 100)}%
          </span>
        </div>
      </div>
      <div className="flex">
        <div className="text-xs z-20 w-32 shrink-0 border-r bg-card">
          <div className="h-9 border-b px-4 pt-3 font-mono text-[10px] text-muted-foreground">
            MIN : SEC
          </div>
          <div className="flex h-24 items-center gap-2 border-b px-4">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            Visuals
          </div>
          <div className="flex h-[72px] items-center gap-2 px-4">
            <TextCursorInput className="h-4 w-4 text-muted-foreground" />
            Narration
          </div>
        </div>
        <div
          ref={scroller}
          data-testid="timeline-scroll"
          className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain"
        >
          <div ref={canvas} className="relative h-[208px]" style={{ width }}>
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px)',
                backgroundSize: `${zoom * step}px 100%`,
                opacity: 0.45,
              }}
            />
            <div className="relative h-9 border-b" aria-label="Time ruler">
              {Array.from(
                { length: Math.floor(duration / step) + 1 },
                (_, i) => (
                  <button
                    key={i}
                    onClick={() => seekTo?.(i * step)}
                    className="absolute top-0 h-9 border-l border-muted-foreground/40 pl-2 text-[10px] text-muted-foreground"
                    style={{ left: i * step * zoom }}
                    aria-label={`Seek to ${timelineTime(i * step)}`}
                  >
                    {timelineTime(i * step)}
                  </button>
                ),
              )}
            </div>
            <div className="relative h-24 border-b bg-muted/20">
              {[...assets]
                .sort((a, b) => (a.start ?? 0) - (b.start ?? 0))
                .map(
                  (asset, i) =>
                    asset.start != null &&
                    asset.end != null && (
                      <button
                        key={asset.id}
                        aria-label={`Clip ${i + 1}: ${asset.description ?? 'Visual'}`}
                        onClick={() => {
                          setSelectedAsset?.(asset);
                          seekTo?.((asset.start ?? 0) / 1000);
                          setStatus('');
                        }}
                        className={cn(
                          'absolute top-3 h-[72px] overflow-hidden rounded-md border bg-muted text-left transition-shadow hover:ring-2 hover:ring-muted-foreground',
                          selectedAsset?.id === asset.id &&
                            'ring-2 ring-foreground',
                        )}
                        style={{
                          left: (asset.start / 1000) * zoom,
                          width: Math.max(
                            2,
                            ((asset.end - asset.start) / 1000) * zoom - 2,
                          ),
                        }}
                      >
                        <div
                          className="absolute inset-0 opacity-70"
                          style={{
                            backgroundImage: asset.url
                              ? `url("${asset.url}")`
                              : undefined,
                            backgroundSize: 'auto 100%',
                            backgroundRepeat: 'repeat-x',
                          }}
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/70 px-2 py-1 text-[11px] text-white">
                          <span className="mr-2 font-mono text-white/60">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          {asset.description ?? 'Visual asset'}
                        </div>
                      </button>
                    ),
                )}
            </div>
            <div className="relative h-[72px] bg-muted/30">
              {words.map((word, i) => (
                <button
                  key={word.index}
                  data-index={i}
                  data-active={active === i}
                  title={`${word.text} · ${(word.start / 1000).toFixed(2)}–${(word.end / 1000).toFixed(2)}s`}
                  onClick={(event) => {
                    setRange(event.shiftKey && range ? [range[0], i] : [i, i]);
                    seekTo?.(word.start / 1000);
                  }}
                  className={cn(
                    'word text-xs absolute top-4 h-9 overflow-hidden whitespace-nowrap rounded-sm border border-border bg-card px-1 text-left transition-colors hover:bg-accent focus-visible:z-20 focus-visible:outline focus-visible:outline-2',
                    selectedAsset &&
                      word.start >= (selectedAsset.start ?? 0) &&
                      word.end <= (selectedAsset.end ?? 0) &&
                      'border-slate-400 bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
                    range &&
                      i >= Math.min(...range) &&
                      i <= Math.max(...range) &&
                      'ring-1 ring-inset ring-foreground',
                    active === i &&
                      '!border-amber-400 !bg-amber-200 !text-slate-950',
                  )}
                  style={{
                    left: (word.start / 1000) * zoom,
                    width: Math.max(
                      1,
                      ((word.end - word.start) / 1000) * zoom - 1,
                    ),
                  }}
                >
                  {word.text}
                </button>
              ))}
              {selectedAsset &&
                (['start', 'end'] as const).map((boundary) => (
                  <button
                    key={boundary}
                    aria-label={`Drag asset ${boundary} to a word`}
                    title={`Drag ${boundary} to a word; or select words and use Assign range`}
                    disabled={saving}
                    onPointerDown={(event) => {
                      drag.current = boundary;
                      event.currentTarget.setPointerCapture(event.pointerId);
                    }}
                    onPointerUp={finishDrag}
                    onPointerCancel={() => {
                      drag.current = null;
                    }}
                    className="absolute top-1 z-30 h-14 w-2 -translate-x-1/2 cursor-ew-resize touch-none rounded-sm border border-background bg-foreground"
                    style={{
                      left: ((selectedAsset[boundary] ?? 0) / 1000) * zoom,
                    }}
                  />
                ))}
            </div>
            <div
              data-testid="playhead"
              className="pointer-events-none absolute bottom-0 top-0 z-40 w-px bg-amber-400"
              style={{ left: currentTime * zoom }}
            >
              <div className="absolute -left-1 top-0 h-3 w-[9px] rounded-b-sm bg-amber-400" />
            </div>
          </div>
        </div>
      </div>
      <div className="text-xs flex h-11 items-center justify-between gap-3 border-t px-4 text-muted-foreground">
        <span className="truncate">
          {selectedAsset
            ? 'Drag the boundary handles to retime this clip.'
            : 'Select a visual clip to adjust its timing.'}{' '}
          <span role="status">{status}</span>
        </span>
        <div className="flex shrink-0 items-center gap-3">
          <span>
            {range
              ? `${Math.abs(range[1] - range[0]) + 1} ${range[0] === range[1] ? 'word' : 'words'} selected`
              : `${words.length} words`}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7"
            disabled={!range || !selectedAsset || saving}
            onClick={() => {
              if (range) {
                const start = words[Math.min(...range)];
                const end = words[Math.max(...range)];
                if (start && end) void assign(start, end);
              }
            }}
          >
            {saving ? 'Saving…' : 'Assign range to clip'}
          </Button>
        </div>
      </div>
    </section>
  );
};
