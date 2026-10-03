import type { Graph, Step } from './types'
import { validate } from './validate'

export interface Traza {
  ok: boolean
  steps: Step[]
  start: string | null
  kind: 'circuito' | 'camino' | null
  error: string | null
  finalOrder: string[]
}

function labelOf(g: Graph, id: string): string {
  return g.nodes.find((n) => n.id === id)?.label ?? id
}

export function buildTrace(g: Graph): Traza {
  const v = validate(g)
  if (!v.ok || !v.start) {
    return {
      ok: false,
      steps: [],
      start: null,
      kind: null,
      error: v.error,
      finalOrder: [],
    }
  }

  const adjacency = new Map<string, string[]>()
  for (const n of g.nodes) adjacency.set(n.id, [])
  for (const e of g.edges) {
    adjacency.get(e.from)?.push(e.to)
    if (!g.directed) adjacency.get(e.to)?.push(e.from)
  }

  const steps: Step[] = []
  const usedEdges: string[] = []
  const usedSet = new Set<string>()
  const stack: string[] = [v.start]
  const circuit: string[] = []

  steps.push({
    kind: 'inicio',
    node: v.start,
    edge: null,
    popped: null,
    stack: [...stack],
    circuit: [],
    usedEdges: [],
    text: `Elegimos ${labelOf(g, v.start)} como vértice inicial y lo empujamos a la pila. ${
      v.kind === 'camino'
        ? 'Buscamos un camino euleriano: terminará en otro vértice.'
        : 'Buscamos un circuito euleriano: deberemos terminar aquí mismo.'
    }`,
  })

  while (stack.length > 0) {
    const current = stack[stack.length - 1]
    const neighbors = adjacency.get(current) ?? []

    let chosen: string | null = null
    for (const n of neighbors) {
      const id = g.directed
        ? g.edges.find((e) => e.from === current && e.to === n && !usedSet.has(e.id))?.id ?? null
        : g.edges.find(
            (e) =>
              !usedSet.has(e.id) &&
              ((e.from === current && e.to === n) || (e.to === current && e.from === n)),
          )?.id ?? null
      if (id) {
        chosen = id
        break
      }
    }

    if (chosen) {
      const edge = g.edges.find((e) => e.id === chosen)!
      const next = edge.from === current ? edge.to : edge.from
      usedSet.add(chosen)
      usedEdges.push(chosen)
      stack.push(next)
      steps.push({
        kind: 'avance',
        node: next,
        edge: chosen,
        popped: null,
        stack: [...stack],
        circuit: [...circuit],
        usedEdges: [...usedEdges],
        text: `Desde ${labelOf(g, current)} tomo la arista ${labelOf(g, current)}–${labelOf(
          g,
          next,
        )}, que aún no se había recorrido, y avanzo a ${labelOf(g, next)}.`,
      })
    } else {
      const popped = stack.pop()!
      circuit.push(popped)
      const nowAt = stack.length > 0 ? stack[stack.length - 1] : null
      steps.push({
        kind: 'retroceso',
        node: nowAt,
        edge: null,
        popped,
        stack: [...stack],
        circuit: [...circuit],
        usedEdges: [...usedEdges],
        text:
          nowAt === null
            ? `La pila quedó vacía: el recorrido terminó.`
            : `${labelOf(g, popped)} no tiene aristas sin usar, así que lo saco de la pila y lo agrego al circuito. Regreso a ${labelOf(g, nowAt)}.`,
      })
    }
  }

  const finalOrder = [...circuit].reverse()
  steps.push({
    kind: 'fin',
    node: null,
    edge: null,
    popped: null,
    stack: [],
    circuit: [...finalOrder],
    usedEdges: [...usedEdges],
    text:
      v.kind === 'camino'
        ? `Camino euleriano encontrado: ${finalOrder.map((id) => labelOf(g, id)).join(' → ')}.`
        : `Circuito euleriano encontrado: ${finalOrder
            .map((id) => labelOf(g, id))
            .join(' → ')}.`,
  })

  return { ok: true, steps, start: v.start, kind: v.kind, error: null, finalOrder }
}