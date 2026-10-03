import type { Graph, Step } from '../grafos/types'
import type { Traza } from '../grafos/hierholzer'
import { C, adjacencyRows, edgeUsed } from '../grafos/render'
import { validate } from '../grafos/validate'

interface Props {
  graph: Graph
  trace: Traza
  step: Step | null
  index: number
  playing: boolean
  speed: number
  onIndex: (i: number) => void
  onTogglePlay: () => void
  onSpeed: (s: number) => void
}

function labelOf(graph: Graph, id: string): string {
  return graph.nodes.find((n) => n.id === id)?.label ?? id
}

export default function Sidebar({
  graph,
  trace,
  step,
  index,
  playing,
  speed,
  onIndex,
  onTogglePlay,
  onSpeed,
}: Props) {
  const v = validate(graph)
  const last = trace.steps.length - 1
  const deg = new Map<string, number>()
  for (const n of graph.nodes) deg.set(n.id, 0)
  for (const e of graph.edges) {
    deg.set(e.from, (deg.get(e.from) ?? 0) + 1)
    deg.set(e.to, (deg.get(e.to) ?? 0) + 1)
  }

  const card = 'rounded-md border border-slate-800 bg-slate-900'

  return (
    <aside className="flex max-h-full w-[27rem] shrink-0 flex-col gap-2 overflow-y-auto pr-1 xl:w-[30rem]">
      {v.ok && trace.ok && step ? (
        <>
          <div className={`${card} px-3 py-2`}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-semibold">{graph.name}</span>
              <span className="shrink-0 text-[10px] text-slate-500">
                {graph.directed ? 'dirigido' : 'no dirigido'} · {graph.nodes.length}v ·{' '}
                {graph.edges.length}a
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-snug text-slate-400">
              {graph.description}
            </p>
          </div>

          <div className={`${card} px-3 py-2`}>
            <div className="mb-0.5 flex items-baseline justify-between gap-2">
              <span className="text-[10px] text-slate-500">
                Paso {index + 1} / {trace.steps.length}
              </span>
              <span className="text-[10px] capitalize text-sky-400">{step.kind}</span>
            </div>
            <p className="text-xs leading-snug">{step.text}</p>
          </div>

          <div className={`${card} flex flex-wrap items-center gap-1.5 px-2 py-2`}>
            <button
              onClick={() => onIndex(0)}
              className="rounded bg-slate-800 px-2 py-1 text-[11px] hover:bg-slate-700"
            >
              Inicio
            </button>
            <button
              onClick={() => onIndex(Math.max(0, index - 1))}
              disabled={index === 0}
              className="rounded bg-slate-800 px-2 py-1 text-[11px] hover:bg-slate-700 disabled:opacity-40"
            >
              ◀
            </button>
            <button
              onClick={onTogglePlay}
              className="rounded bg-sky-600 px-2 py-1 text-[11px] hover:bg-sky-500"
            >
              {playing ? '❚❚ Pausa' : '▶ Reproducir'}
            </button>
            <button
              onClick={() => onIndex(Math.min(last, index + 1))}
              disabled={index === last}
              className="rounded bg-slate-800 px-2 py-1 text-[11px] hover:bg-slate-700 disabled:opacity-40"
            >
              ▶
            </button>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500">
                {(2000 / speed).toFixed(1)}x
              </span>
              <input
                type="range"
                min={200}
                max={2000}
                step={100}
                value={2000 - speed}
                onChange={(e) => onSpeed(2000 - Number(e.target.value))}
                className="h-1 w-20 accent-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className={`${card} px-2.5 py-2`}>
              <div className="mb-1 text-[10px] text-slate-500">
                Pila · {step.stack.length}
              </div>
              <div className="font-mono text-[11px] leading-snug break-all">
                {step.stack.length
                  ? step.stack.map((id) => labelOf(graph, id)).join(' → ')
                  : '(vacía)'}
              </div>
            </div>
            <div className={`${card} px-2.5 py-2`}>
              <div className="mb-1 text-[10px] text-slate-500">
                Circuito · {step.circuit.length}
              </div>
              <div className="font-mono text-[11px] leading-snug break-all text-emerald-400">
                {step.circuit.length
                  ? step.circuit.map((id) => labelOf(graph, id)).join(' → ')
                  : '(vacío)'}
              </div>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-2 gap-2">
            <div className={`${card} flex min-h-0 flex-col px-2.5 py-2`}>
              <div className="mb-1 text-[10px] text-slate-500">Lista de aristas</div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <table className="w-full font-mono text-[11px]">
                  <tbody>
                    {graph.edges.map((e) => {
                      const used = edgeUsed(step, e.id)
                      return (
                        <tr key={e.id}>
                          <td className="pr-1 text-slate-400">
                            {labelOf(graph, e.from)}–{labelOf(graph, e.to)}
                          </td>
                          <td
                            className={`text-right ${used ? 'text-amber-500 line-through' : 'text-slate-600'}`}
                          >
                            {used ? 'usada' : 'libre'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={`${card} flex min-h-0 flex-col px-2.5 py-2`}>
              <div className="mb-1 text-[10px] text-slate-500">Lista de adyacencia</div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <table className="w-full font-mono text-[11px]">
                  <tbody>
                    {adjacencyRows(graph).map((row) => (
                      <tr key={row.node}>
                        <td className="pr-1 text-slate-400">{labelOf(graph, row.node)}</td>
                        <td className="pr-1 text-right text-slate-600">
                          ({deg.get(row.node) ?? 0})
                        </td>
                        <td className="text-right text-slate-500">
                          {row.nbrs.map((n) => labelOf(graph, n)).join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className={`${card} flex flex-wrap items-center gap-x-3 gap-y-1 px-2.5 py-1.5`}>
            <Legend color={C.edgeIdle} label="libre" />
            <Legend color={C.edgeUsed} label="recorrida" />
            <Legend color={C.edgeNow} label="en uso" />
            <Legend color={C.edgeCircuit} label="en circuito" />
            <span className="ml-auto text-[10px] text-slate-500">
              {step.usedEdges.length}/{graph.edges.length} aristas
            </span>
          </div>
        </>
      ) : (
        <>
          <div className={`${card} px-3 py-2`}>
            <div className="text-sm font-semibold">{graph.name}</div>
            <p className="mt-1 text-[11px] leading-snug text-slate-400">{graph.description}</p>
          </div>
          <div className="rounded-md border border-rose-800 bg-rose-950/40 px-3 py-2">
            <div className="text-xs font-semibold text-rose-300">
              No existe camino ni circuito euleriano
            </div>
            <p className="mt-1 text-[11px] leading-snug text-rose-200">{v.error}</p>
          </div>
          <div className={`${card} px-2.5 py-2`}>
            <div className="mb-1 text-[10px] text-slate-500">Lista de adyacencia</div>
            <table className="w-full font-mono text-[11px]">
              <tbody>
                {adjacencyRows(graph).map((row) => (
                  <tr key={row.node}>
                    <td className="pr-1 text-slate-400">{labelOf(graph, row.node)}</td>
                    <td className="pr-1 text-right text-slate-600">
                      ({deg.get(row.node) ?? 0})
                    </td>
                    <td className="text-right text-slate-500">
                      {row.nbrs.map((n) => labelOf(graph, n)).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </aside>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1 text-[10px] text-slate-400">
      <span className="inline-block h-1 w-4 rounded" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}