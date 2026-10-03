import type { Graph, Step } from './types'
import { validate } from './validate'

/**
 * Traza: Resultado completo de ejecutar el algoritmo de Hierholzer
 * sobre un grafo. Guarda tanto el resultado final como TODOS los
 * pasos intermedios para poder visualizarlo paso a paso.
 */
export interface Traza {
  ok: boolean                // true si se encontró camino/circuito euleriano
  steps: Step[]              // Lista de pasos ejecutados (para animación)
  start: string | null       // Vértice inicial elegido
  kind: 'circuito' | 'camino' | null  // Tipo de recorrido euleriano
  error: string | null       // Mensaje de error si no es posible
  finalOrder: string[]       // Secuencia final de vértices (orden euleriano)
}

/**
 * Obtiene la etiqueta (label) de un vértice a partir de su ID.
 * Esto se usa para generar los textos explicativos (más legibles).
 */
function labelOf(g: Graph, id: string): string {
  return g.nodes.find((n) => n.id === id)?.label ?? id
}

/**
 * buildTrace(g: Graph): Traza
 * 
 * Ejecuta el algoritmo de Hierholzer (versión iterativa con pila)
 * y genera una traza paso a paso del proceso.
 * 
 * 1. Valida el grafo (condiciones para circuito/camino euleriano)
 * 2. Construye la estructura de adyacencia
 * 3. Ejecuta Hierholzer con pila + circuito auxiliar
 * 4. Invierte el circuito para obtener el orden correcto
 * 5. Devuelve todos los pasos + resultado final
 */
export function buildTrace(g: Graph): Traza {
  // 1. VALIDACIÓN PREVIA
  // Comprobamos si el grafo cumple las condiciones teóricas
  const v = validate(g)
  if (!v.ok || !v.start) {
    // Si no es válido, devolvemos traza vacía con el error
    return {
      ok: false,
      steps: [],
      start: null,
      kind: null,
      error: v.error,
      finalOrder: [],
    }
  }

  // 2. CONSTRUCCIÓN DE LA ADYACENCIA
  // Creamos un mapa vértice -> lista de vértices vecinos.
  // Esto nos permite saber, desde un vértice, a dónde podemos ir.
  const adjacency = new Map<string, string[]>()
  for (const n of g.nodes) {
    adjacency.set(n.id, [])
  }
  for (const e of g.edges) {
    // Para grafo NO DIRIGIDO: la arista conecta ambos extremos
    adjacency.get(e.from)?.push(e.to)
    if (!g.directed) {
      adjacency.get(e.to)?.push(e.from)
    }
    // Para grafo DIRIGIDO: solo añadimos vecino de salida (from -> to)
  }

  // 3. ESTRUCTURAS PARA EL ALGORITMO DE HIERHOLZER (VERSIÓN ITERATIVA)
  const steps: Step[] = []        // Almacena cada paso para visualización
  const usedEdges: string[] = []   // Lista de IDs de aristas ya recorridas (orden de uso)
  const usedSet = new Set<string>() // Conjunto para buscar rápidamente si una arista fue usada
  // PILA: representa el camino actual que estamos explorando
  const stack: string[] = [v.start]
  // CIRCUITO AUXILIAR: guardamos vértices al retroceder
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

    // BUSCAR UNA ARISTA SIN USAR DESDE "current"
    // Recorremos los vecinos para encontrar la PRIMERA arista no usada
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
        break // Tomamos la primera arista sin usar encontrada
      }
    }

    if (chosen) {
      // CASO 1: HAY ARISTA SIN USAR → AVANZAR
      const edge = g.edges.find((e) => e.id === chosen)!
      // Determinamos el siguiente vértice (en no dirigido puede estar al revés)
      const next = edge.from === current ? edge.to : edge.from
      // Marcamos la arista como usada
      usedSet.add(chosen)
      usedEdges.push(chosen)
      // Empujamos el siguiente vértice a la pila (avanzamos por el camino)
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
      // CASO 2: NO HAY ARISTAS SIN USAR DESDE "current" → RETROCEDER
      const popped = stack.pop()!
      // Lo añadimos al circuito auxiliar (orden de cierre de subcaminos)
      circuit.push(popped)
      // Vemos dónde estamos ahora (nuevo tope de la pila)
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

  // 5. OBTENEMOS EL ORDEN FINAL DEL RECORRIDO
  // El array "circuit" se construye al SACAR vértices de la pila (retroceso).
  // Por eso está en ORDEN INVERSO al recorrido euleriano correcto.
  // Debemos darle la vuelta: reverse()
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

  // 6. DEVOLVEMOS LA TRAZA COMPLETA
  return { ok: true, steps, start: v.start, kind: v.kind, error: null, finalOrder }
}