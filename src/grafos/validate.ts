import type { Graph, Validacion } from './types'

function degreeMap(g: Graph): Map<string, number> {
  const deg = new Map<string, number>()
  for (const n of g.nodes) deg.set(n.id, 0)
  for (const e of g.edges) {
    deg.set(e.from, (deg.get(e.from) ?? 0) + 1)
    deg.set(e.to, (deg.get(e.to) ?? 0) + 1)
  }
  return deg
}

function deltaMap(g: Graph): Map<string, number> {
  const d = new Map<string, number>()
  for (const n of g.nodes) d.set(n.id, 0)
  for (const e of g.edges) {
    d.set(e.from, (d.get(e.from) ?? 0) + 1)
    d.set(e.to, (d.get(e.to) ?? 0) - 1)
  }
  return d
}

function reachableFrom(g: Graph, start: string, directed: boolean): Set<string> {
  const adj = new Map<string, string[]>()
  for (const n of g.nodes) adj.set(n.id, [])
  for (const e of g.edges) {
    adj.get(e.from)?.push(e.to)
    if (!directed) adj.get(e.to)?.push(e.from)
  }
  const seen = new Set<string>([start])
  const queue = [start]
  while (queue.length) {
    const cur = queue.shift()!
    for (const nx of adj.get(cur) ?? []) {
      if (!seen.has(nx)) {
        seen.add(nx)
        queue.push(nx)
      }
    }
  }
  return seen
}

function labelOf(g: Graph, id: string): string {
  return g.nodes.find((n) => n.id === id)?.label ?? id
}

function listLabels(g: Graph, ids: string[]): string {
  return ids.map((id) => labelOf(g, id)).join(', ')
}

export function validate(g: Graph): Validacion {
  const fail = (error: string): Validacion => ({
    ok: false,
    kind: null,
    start: null,
    error,
  })

  if (g.nodes.length === 0) return fail('El grafo no tiene vértices.')
  if (g.edges.length === 0) return fail('El grafo no tiene aristas, así que no hay nada que recorrer.')

  const isolated = g.nodes.filter(
    (n) => !g.edges.some((e) => e.from === n.id || e.to === n.id),
  )
  if (isolated.length > 0) {
    return fail(
      `El vértice ${labelOf(g, isolated[0].id)} está aislado: no pertenece a ninguna arista.`,
    )
  }

  const degreeInfo = g.directed ? null : degreeMap(g)
  const delta = g.directed ? deltaMap(g) : null

  let start: string | null = null
  let kind: 'circuito' | 'camino' | null = null

  if (g.directed && delta) {
    const starts: string[] = []
    const ends: string[] = []
    let invalid = false
    for (const [id, d] of delta) {
      if (d === 1) starts.push(id)
      else if (d === -1) ends.push(id)
      else if (d !== 0) invalid = true
    }
    if (invalid) {
      return fail(
        'En un grafo dirigido cada vértice debe tener grado entrante igual a saliente (±1 como máximo). Revisa las aristas.',
      )
    }
    if (starts.length === 0 && ends.length === 0) {
      kind = 'circuito'
      start = g.nodes[0].id
    } else if (starts.length === 1 && ends.length === 1) {
      kind = 'camino'
      start = starts[0]
    } else {
      return fail(
        `Debe haber exactamente un vértice con un arco saliente extra y uno con un arco entrante extra. Se hallaron ${starts.length} y ${ends.length}.`,
      )
    }
  } else if (degreeInfo) {
    const odd = g.nodes.filter((n) => (degreeInfo.get(n.id) ?? 0) % 2 === 1).map((n) => n.id)
    if (odd.length === 0) {
      kind = 'circuito'
      start = g.nodes[0].id
    } else if (odd.length === 2) {
      kind = 'camino'
      start = odd[0]
    } else {
      return fail(
        `El grafo tiene ${odd.length} vértices de grado impar (${listLabels(g, odd)}). Un circuito o camino euleriano exige 0 o 2, así que no existe.`,
      )
    }
  }

  if (!start || !kind) return fail('No se pudo determinar el vértice inicial.')

  const reached = reachableFrom(g, start, g.directed)
  const unreachable = g.nodes.filter((n) => !reached.has(n.id)).map((n) => n.id)
  if (unreachable.length > 0) {
    return fail(
      `El grafo no es conexo: el vértice ${labelOf(g, unreachable[0])} no se alcanza desde ${labelOf(g, start)}. Una sola pasada no puede cubrir todas las aristas.`,
    )
  }

  return { ok: true, kind, start, error: null }
}