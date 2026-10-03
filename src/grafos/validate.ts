import type { Graph, Validacion } from './types'

// ============================================================
// MAPAS DE GRADOS Y DESEQUILIBRIO
// ============================================================

// Calcula el grado de cada vértice para GRAFOS NO DIRIGIDOS.
// El grado de un vértice = número de aristas que inciden en él.
// Cada arista suma +1 tanto al origen (from) como al destino (to).
function degreeMap(g: Graph): Map<string, number> {
  const deg = new Map<string, number>()
  // Inicializamos todos los vértices con grado 0
  for (const n of g.nodes) deg.set(n.id, 0)
  // Sumamos 1 a cada extremo de cada arista
  for (const e of g.edges) {
    deg.set(e.from, (deg.get(e.from) ?? 0) + 1)
    deg.set(e.to, (deg.get(e.to) ?? 0) + 1)
  }
  return deg
}

// Calcula el desequilibrio para GRAFOS DIRIGIDOS.
// Definimos: delta(v) = grado_saliente(v) - grado_entrante(v)
// Arco from → to: +1 en from (sale), -1 en to (entra)
function deltaMap(g: Graph): Map<string, number> {
  const d = new Map<string, number>()
  // Inicializamos todos los vértices con desequilibrio 0
  for (const n of g.nodes) d.set(n.id, 0)
  // Por cada arista dirigida: +1 en origen, -1 en destino
  for (const e of g.edges) {
    d.set(e.from, (d.get(e.from) ?? 0) + 1) // aumenta arcos salientes
    d.set(e.to, (d.get(e.to) ?? 0) - 1)     // aumenta arcos entrantes
  }
  return d
}

// Comprueba si todos los vértices que tienen aristas son alcanzables
// desde el vértice de inicio.
// Esto es necesario para que exista UN ÚNICO recorrido que use TODAS las aristas.
function reachableFrom(g: Graph, start: string, directed: boolean): Set<string> {
  // Construimos la lista de adyacencia para hacer un recorrido BFS
  const adj = new Map<string, string[]>()
  for (const n of g.nodes) adj.set(n.id, [])
  for (const e of g.edges) {
    adj.get(e.from)?.push(e.to)
    if (!directed) adj.get(e.to)?.push(e.from)
  }
  // Recorrido por anchura (BFS) para encontrar todos los alcanzables desde start
  const seen = new Set<string>([start])
  const queue = [start]
  while (queue.length > 0) {
    const cur = queue.shift()!
    const vecinos = adj.get(cur) ?? []
    for (const nx of vecinos) {
      if (!seen.has(nx)) {
        seen.add(nx)
        queue.push(nx)
      }
    }
  }
  return seen
}

// Devuelve la etiqueta (label) de un vértice dado su ID.
// Si no la encuentra, devuelve el propio ID.
function labelOf(g: Graph, id: string): string {
  return g.nodes.find((n) => n.id === id)?.label ?? id
}

// Devuelve una lista de etiquetas separadas por comas (para mensajes de error)
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
  // El grafo debe tener al menos una arista
  // (sin aristas no tiene sentido hablar de camino/circuito euleriano)
  if (g.edges.length === 0) return fail('El grafo no tiene aristas, así que no hay nada que recorrer.')

  // 2. COMPROBAR VÉRTICES AISLADOS
  // Un vértice aislado no pertenece a ninguna arista.
  // No impide que exista un recorrido euleriano, pero sí es incoherente.
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

  // CASO A: GRAFO DIRIGIDO
  if (g.directed && delta) {
    const starts: string[] = [] // Vértices con delta = +1 (más salientes que entrantes)
    const ends: string[] = []   // Vértices con delta = -1 (más entrantes que salientes)
    let invalid = false
    // Analizamos el desequilibrio delta(v) = outdeg(v) - indeg(v) para cada vértice
    for (const [id, d] of delta) {
      if (d === 1) starts.push(id)        // candidato a vértice INICIAL
      else if (d === -1) ends.push(id)    // candidato a vértice FINAL
      else if (d !== 0) invalid = true   // |delta| > 1: no válido según teorema de Euler
    }
    // Si algún vértice tiene desequilibrio |delta| > 1 → no existe camino/circuito euleriano
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
    // Obtenemos vértices con grado impar
    const odd = g.nodes.filter((n) => (degreeInfo.get(n.id) ?? 0) % 2 === 1).map((n) => n.id)
    if (odd.length === 0) {
      // Todos los grados pares → existe CIRCUITO euleriano
      kind = 'circuito'
      start = g.nodes[0].id
    } else if (odd.length === 2) {
      // Exactamente 2 vértices de grado impar → existe CAMINO euleriano
      // El camino debe empezar en uno de ellos (el que tenga desequilibrio)
      kind = 'camino'
      start = odd[0]
    } else {
      // Más de 2 vértices de grado impar → no existe camino/circuito euleriano
      return fail(
        `El grafo tiene ${odd.length} vértices de grado impar (${listLabels(g, odd)}). Un circuito o camino euleriano exige 0 o 2, así que no existe.`,
      )
    }
  }

  if (!start || !kind) return fail('No se pudo determinar el vértice inicial.')

  // 4. COMPROBAR CONEXIDAD
  // Debemos poder alcanzar todos los vértices CON ARISTAS desde el inicio
  // (ignora vértices aislados). Esto garantiza que un único recorrido cubra TODAS las aristas.
  const reached = reachableFrom(g, start, g.directed)
  const unreachable = g.nodes.filter((n) => !reached.has(n.id)).map((n) => n.id)
  if (unreachable.length > 0) {
    return fail(
      `El grafo no es conexo: el vértice ${labelOf(g, unreachable[0])} no se alcanza desde ${labelOf(g, start)}. Una sola pasada no puede cubrir todas las aristas.`,
    )
  }

  return { ok: true, kind, start, error: null }
}