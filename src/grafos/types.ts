// ============================================================
//  MODELO DE DATOS DEL GRAFO
// ============================================================
//  Estas tres interfaces son la base de todo el proyecto. La
//  decisión clave está en `GraphEdge`: cada arista tiene un `id`
//  propio y está separada del vértice.
//
//  ¿Por qué importa eso? El algoritmo de Hierholzer necesita
//  marcar "esta arista YA se usó". Si las aristas vivieran
//  dentro del vértice (como `Connections: Node[]`), no habría
//  forma de distinguir la arista 1–2 de la 2–1, y en un grafo
//  no dirigido terminaríamos recorriendo la misma arista dos
//  veces. El `id` es lo que hace posible consumirlas.
// ============================================================

// Un vértice. `x` e `y` son su posición fija en el lienzo;
// el usuario puede arrastrarlo y se guarda aparte (ver
// GraphCanvas.tsx).
export interface GraphNode {
  id: string
  label: string
  x: number
  y: number
}

// Una arista. En un grafo no dirigido `from` y `to` no
// implican dirección: ambos extremos son equivalentes.
export interface GraphEdge {
  id: string
  from: string
  to: string
}

// Un grafo completo. `directed` decide si el algoritmo exige
// grado par (no dirigido) o equilibrio entrante/saliente
// (dirigido).
export interface Graph {
  id: string
  name: string
  description: string
  directed: boolean
  nodes: GraphNode[]
  edges: GraphEdge[]
}

// Si existe un recorrido que use cada arista exactamente una
// vez: `circuito` (empieza y termina en el mismo vértice) o
// `camino` (empieza y termina en vértices distintos).
export type EulerKind = 'circuito' | 'camino'

// Resultado de validar el grafo antes de ejecutar el
// algoritmo. Si `ok` es false, `error` explica por qué.
export interface Validacion {
  ok: boolean
  kind: EulerKind | null
  start: string | null
  error: string | null
}

// Los cuatro tipos de paso que puede registrar el algoritmo.
export type StepKind =
  | 'inicio' // se eligió el vértice inicial
  | 'avance' // se recorrió una arista y se avanzó
  | 'retroceso' // el vértice se quedó sin salida y retrocedimos
  | 'fin' // el recorrido terminó

// Una instantánea del algoritmo en un momento dado.
//
// ESTA ES LA IDEA CENTRAL DEL VISUALIZADOR: cada paso guarda
// una COPIA completa del estado (pila, circuito, aristas
// usadas). Por eso el reproductor es solo un índice sobre este
// arreglo — avanzar y retroceder funcionan igual de fácil, y no
// hay que recalcular nada.
//
// Fíjate además en que las copias usan `[...pila]` y no la
// referencia directa. Si guardáramos la referencia, todos los
// pasos apuntarían al mismo arreglo y al retroceder se vería
// el estado final en todos.
export interface Step {
  kind: StepKind
  node: string | null // vértice donde "estamos" ahora
  edge: string | null // arista que se acaba de recorrer
  popped: string | null // vértice sacado de la pila (en retroceso)
  stack: string[]
  circuit: string[]
  usedEdges: string[]
  text: string // explicación de este paso
}
