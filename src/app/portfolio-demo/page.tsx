import {
  CheckCircle2,
  Clapperboard,
  FileText,
  ImageIcon,
  Layers3,
  MessageSquareText,
  Sparkles,
  Wand2,
} from 'lucide-react';

const pipeline = [
  {
    title: 'Brief',
    detail: 'Explain the channel, audience, tone, and publishing goal.',
    status: 'Captured',
  },
  {
    title: 'Research',
    detail: 'Turn the idea into structured angles, references, and claims.',
    status: 'Grounded',
  },
  {
    title: 'Outline',
    detail: 'Sequence the story into hooks, beats, transitions, and payoff.',
    status: 'Approved',
  },
  {
    title: 'Draft',
    detail: 'Generate a publishable script with critique loops and variants.',
    status: 'Ready',
  },
];

const assets = [
  {
    label: 'Cold open',
    type: 'Script beat',
    copy: 'A founder realizes the old launch plan is already obsolete.',
  },
  {
    label: 'Voiceover',
    type: 'Narration',
    copy: 'Measured, sharp, cinematic. 87 seconds estimated runtime.',
  },
  {
    label: 'Visual prompt',
    type: 'Shot direction',
    copy: 'Late-night product room, monitor glow, timeline cards on glass.',
  },
];

const critique = [
  'Hook is concrete in the first five seconds.',
  'Claims are separated from mood language.',
  'Ending gives the viewer a repeatable framework.',
];

export default function PortfolioDemoPage() {
  return (
    <main className="h-screen overflow-hidden bg-[#0b0f19] text-slate-50">
      <div className="mx-auto flex h-full max-w-7xl flex-col gap-5 px-6 py-5">
        <header className="flex items-start justify-between gap-6 border-b border-white/10 pb-4">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-sm border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" />
              Public-safe deterministic demo
            </div>
            <h1 className="max-w-3xl text-[2.35rem] font-semibold leading-[1.08] tracking-normal text-white">
              Saga turns a creator brief into a production-ready story system.
            </h1>
            <p className="mt-4 max-w-2xl text-[1rem] leading-7 text-slate-300">
              This local portfolio route uses fake story data to show the core
              workflow without auth, database rows, provider calls, or private
              customer material.
            </p>
          </div>
          <div className="grid min-w-64 grid-cols-2 gap-3 text-sm">
            <Metric label="Provider calls" value="0" />
            <Metric label="Private data" value="None" />
            <Metric label="Demo state" value="Static" />
            <Metric label="Route" value="/portfolio-demo" />
          </div>
        </header>

        <section className="grid min-h-0 flex-1 grid-cols-[1.05fr_0.95fr] gap-5">
          <div className="flex min-h-0 flex-col gap-5">
            <div className="rounded-sm border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-cyan-100">
                <MessageSquareText className="h-4 w-4" />
                Active brief
              </div>
              <div className="rounded-sm border border-white/10 bg-black/25 p-4">
                <p className="text-lg leading-7 text-white">
                  "Create a short launch film for a bootstrapped AI product
                  that helps founders turn rough ideas into finished campaigns."
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-slate-300">
                  <Tag label="Audience" value="Technical founders" />
                  <Tag label="Tone" value="Cinematic, useful" />
                  <Tag label="Output" value="Script + shots" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {pipeline.map((step, index) => (
                <div
                  className="rounded-sm border border-white/10 bg-slate-950/55 p-4"
                  key={step.title}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">
                      0{index + 1}
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  </div>
                  <h2 className="text-base font-semibold text-white">
                    {step.title}
                  </h2>
                  <p className="mt-2 min-h-16 text-sm leading-5 text-slate-300">
                    {step.detail}
                  </p>
                  <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-emerald-200">
                    {step.status}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-3 gap-3">
              {assets.map((asset, index) => {
                const Icon =
                  index === 0 ? FileText : index === 1 ? Clapperboard : ImageIcon;

                return (
                  <div
                    className="rounded-sm border border-white/10 bg-white/[0.04] p-4"
                    key={asset.label}
                  >
                    <Icon className="mb-4 h-5 w-5 text-cyan-200" />
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                      {asset.type}
                    </p>
                    <h3 className="mt-2 text-base font-semibold text-white">
                      {asset.label}
                    </h3>
                    <p className="mt-2 text-sm leading-5 text-slate-300">
                      {asset.copy}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="flex min-h-0 flex-col gap-5">
            <div className="rounded-sm border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-cyan-100">
                  <Layers3 className="h-4 w-4" />
                  Generated structure
                </div>
                <span className="rounded-sm bg-emerald-300/10 px-2 py-1 text-xs text-emerald-200">
                  Ready for editor
                </span>
              </div>
              <div className="space-y-3">
                {[
                  ['Hook', 'The real launch starts after the product ships.'],
                  ['Turn', 'The team replaces a campaign doc with a story loop.'],
                  ['Payoff', 'Every asset now traces back to one clear promise.'],
                ].map(([label, line]) => (
                  <div
                    className="rounded-sm border border-white/10 bg-black/25 p-3"
                    key={label}
                  >
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                      {label}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-100">
                      {line}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-[0.9fr_1.1fr] gap-5">
              <div className="rounded-sm border border-white/10 bg-white/[0.04] p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-medium text-cyan-100">
                  <Wand2 className="h-4 w-4" />
                  Critique pass
                </div>
                <div className="space-y-3">
                  {critique.map((item) => (
                    <div className="flex gap-2 text-sm leading-5" key={item}>
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                      <span className="text-slate-200">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-sm border border-cyan-300/25 bg-cyan-300/10 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                  What this proves
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-100">
                  Saga has a real Next.js runtime surface that can present the
                  product workflow independently from private infrastructure.
                  Full provider-backed capture remains a separate disposable
                  environment task.
                </p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-white/10 bg-white/[0.04] p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-[1rem] font-semibold text-white">{value}</p>
    </div>
  );
}

function Tag({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm bg-white/[0.06] p-2">
      <p className="text-[0.7rem] uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-medium text-slate-100">{value}</p>
    </div>
  );
}
