import { useEffect, useMemo, useState } from 'react'
import GraphCanvas from './components/GraphCanvas.tsx'
import Sidebar from './components/Sidebar.tsx'
import { GRAFOS } from './data/graphs.ts'
import { buildTrace } from './grafos/hierholzer.ts'

export default function App() {
  const [graphId, setGraphId] = useState(GRAFOS[0].id)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)

  const graph = useMemo(() => GRAFOS.find((g) => g.id === graphId)!, [graphId])
  const trace = useMemo(() => buildTrace(graph), [graph])
  const last = trace.steps.length - 1

  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => {
      const next = Math.min(last, index + 1)
      setIndex(next)
      if (next >= last) setPlaying(false)
    }, speed)
    return () => clearTimeout(t)
  }, [playing, index, speed, last])

  function selectGraph(id: string) {
    setGraphId(id)
    setIndex(0)
    setPlaying(false)
  }

  const step = trace.ok ? (trace.steps[index] ?? null) : null

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <header className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-800 px-4 py-2">
        <div className="mr-2">
          <h1 className="text-base font-semibold leading-tight">Algoritmo de Hierholzer</h1>
          <p className="text-[11px] leading-tight text-slate-400">
            Visualizador paso a paso de circuitos y caminos eulerianos.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {GRAFOS.map((g) => (
            <button
              key={g.id}
              onClick={() => selectGraph(g.id)}
              className={
                g.id === graphId
                  ? 'rounded bg-sky-600 px-2.5 py-1 text-xs hover:bg-sky-500'
                  : 'rounded bg-slate-800 px-2.5 py-1 text-xs hover:bg-slate-700'
              }
            >
              {g.name}
            </button>
          ))}
        </div>
      </header>

      <main className="flex min-h-0 flex-1 gap-3 p-3">
        <div className="flex min-h-0 min-w-[26rem] flex-1 items-start">
          <div className="w-full">
            <GraphCanvas key={graph.id} graph={graph} step={step} />
          </div>
        </div>
        <Sidebar
          graph={graph}
          trace={trace}
          step={step}
          index={index}
          playing={playing}
          speed={speed}
          onIndex={setIndex}
          onTogglePlay={() => setPlaying((p) => !p)}
          onSpeed={setSpeed}
        />
      </main>
    </div>
  )
}