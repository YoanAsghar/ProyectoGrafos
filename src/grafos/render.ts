import type { Graph, Step } from './types'

export const VIEW_W = 860
export const VIEW_H = 480
export const R = 22

export const C = {
  edgeIdle: '#475569',
  edgeUsed: '#f59e0b',
  edgeNow: '#fde047',
  edgeCircuit: '#22c55e',
  nodeIdle: '#1e293b',
  nodeStack: '#f59e0b',
  nodeNow: '#f8fafc',
  nodeDone: '#22c55e',
  nodeStroke: '#334155',
}

export interface EdgeState {
  id: string
  color: string
  width: number
}

export function edgeStates(g: Graph, step: Step | null, finalOrder: string[]): EdgeState[] {
  return g.edges.map((e) => {
    if (!step) return { id: e.id, color: C.edgeIdle, width: 3 }
    if (step.kind === 'fin') return { id: e.id, color: C.edgeCircuit, width: 5 }
    if (step.edge === e.id) return { id: e.id, color: C.edgeNow, width: 6 }
    if (step.usedEdges.includes(e.id)) return { id: e.id, color: C.edgeUsed, width: 4 }
    if (finalOrder.length > 0 && inCircuit(e.id, g, finalOrder)) {
      return { id: e.id, color: C.edgeCircuit, width: 4 }
    }
    return { id: e.id, color: C.edgeIdle, width: 3 }
  })
}

function inCircuit(edgeId: string, g: Graph, order: string[]): boolean {
  const e = g.edges.find((x) => x.id === edgeId)
  if (!e) return false
  for (let i = 0; i < order.length - 1; i++) {
    const a = order[i]
    const b = order[i + 1]
    if ((a === e.from && b === e.to) || (!g.directed && a === e.to && b === e.from)) {
      return true
    }
  }
  return false
}

export function nodeColor(id: string, step: Step | null): string {
  if (!step) return C.nodeIdle
  if (step.kind === 'fin') return C.nodeDone
  if (step.node === id) return C.nodeNow
  if (step.stack.includes(id)) return C.nodeStack
  return C.nodeIdle
}

export function edgeGeometry(
  g: Graph,
  positions: Record<string, { x: number; y: number }>,
): Array<{ id: string; from: string; to: string; x1: number; y1: number; x2: number; y2: number }> {
  const at = (id: string) => ({ ...(g.nodes.find((n) => n.id === id)!), ...positions[id] })
  return g.edges.map((e) => {
    const a = at(e.from)
    const b = at(e.to)
    const dx = b.x - a.x
    const dy = b.y - a.y
    const dist = Math.hypot(dx, dy) || 1
    const ux = dx / dist
    const uy = dy / dist
    return {
      id: e.id,
      from: e.from,
      to: e.to,
      x1: a.x + ux * R,
      y1: a.y + uy * R,
      x2: b.x - ux * R,
      y2: b.y - uy * R,
    }
  })
}

export function adjacencyRows(g: Graph): Array<{ node: string; nbrs: string[] }> {
  return g.nodes.map((n) => {
    const nbrs = g.edges
      .filter((e) => e.from === n.id || (!g.directed && e.to === n.id))
      .map((e) => (e.from === n.id ? e.to : e.from))
    return { node: n.id, nbrs }
  })
}

export function edgeUsed(step: Step | null, edgeId: string): boolean {
  return step ? step.usedEdges.includes(edgeId) : false
}