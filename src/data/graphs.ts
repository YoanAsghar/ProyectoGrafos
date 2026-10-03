import type { Graph } from '../grafos/types'

export const GRAFOS: Graph[] = [
  {
    id: 'doble-triangulo',
    name: 'Doble triángulo',
    description:
      'Dos triángulos que comparten el vértice 3. Todos los grados son pares, así que existe un circuito euleriano. Si empiezas en 1, el algoritmo se atasca y debe retroceder.',
    directed: false,
    nodes: [
      { id: '1', label: '1', x: 150, y: 300 },
      { id: '2', label: '2', x: 290, y: 120 },
      { id: '3', label: '3', x: 430, y: 300 },
      { id: '4', label: '4', x: 570, y: 120 },
      { id: '5', label: '5', x: 710, y: 300 },
    ],
    edges: [
      { id: 'e12', from: '1', to: '2' },
      { id: 'e23', from: '2', to: '3' },
      { id: 'e31', from: '3', to: '1' },
      { id: 'e34', from: '3', to: '4' },
      { id: 'e45', from: '4', to: '5' },
      { id: 'e53', from: '5', to: '3' },
    ],
  },
  {
    id: 'casa',
    name: 'La casa',
    description:
      'Cuadrado con un triángulo en el techo. a y d tienen grado 3 (impar) y los demás grado 2, así que hay camino euleriano de a a d, pero no circuito.',
    directed: false,
    nodes: [
      { id: 'a', label: 'a', x: 200, y: 250 },
      { id: 'b', label: 'b', x: 200, y: 400 },
      { id: 'c', label: 'c', x: 380, y: 400 },
      { id: 'd', label: 'd', x: 380, y: 250 },
      { id: 'e', label: 'e', x: 290, y: 130 },
    ],
    edges: [
      { id: 'ab', from: 'a', to: 'b' },
      { id: 'bc', from: 'b', to: 'c' },
      { id: 'cd', from: 'c', to: 'd' },
      { id: 'da', from: 'd', to: 'a' },
      { id: 'de', from: 'd', to: 'e' },
      { id: 'ea', from: 'e', to: 'a' },
    ],
  },
  {
    id: 'camino',
    name: 'Grafo con camino',
    description:
      'El grafo tiene exactamente dos vértices de grado impar (c y f), así que existe un camino euleriano que empieza en uno y termina en el otro.',
    directed: false,
    nodes: [
      { id: 'a', label: 'a', x: 130, y: 300 },
      { id: 'b', label: 'b', x: 260, y: 160 },
      { id: 'c', label: 'c', x: 400, y: 300 },
      { id: 'd', label: 'd', x: 540, y: 160 },
      { id: 'e', label: 'e', x: 670, y: 300 },
      { id: 'f', label: 'f', x: 400, y: 440 },
    ],
    edges: [
      { id: 'ab', from: 'a', to: 'b' },
      { id: 'bc', from: 'b', to: 'c' },
      { id: 'cd', from: 'c', to: 'd' },
      { id: 'de', from: 'd', to: 'e' },
      { id: 'ef', from: 'e', to: 'f' },
      { id: 'fc', from: 'f', to: 'c' },
      { id: 'bc2', from: 'b', to: 'c' },
    ],
  },
  {
    id: 'sin-solucion',
    name: 'Sin solución',
    description:
      'Un triángulo abc con dos patas: p cuelga de b y q cuelga de c. b, c, p y q quedan de grado impar (4 en total), así que no existe ni circuito ni camino euleriano.',
    directed: false,
    nodes: [
      { id: 'a', label: 'a', x: 430, y: 300 },
      { id: 'b', label: 'b', x: 250, y: 150 },
      { id: 'c', label: 'c', x: 610, y: 150 },
      { id: 'p', label: 'p', x: 150, y: 400 },
      { id: 'q', label: 'q', x: 710, y: 400 },
    ],
    edges: [
      { id: 'ab', from: 'a', to: 'b' },
      { id: 'bc', from: 'b', to: 'c' },
      { id: 'ca', from: 'c', to: 'a' },
      { id: 'bp', from: 'b', to: 'p' },
      { id: 'cq', from: 'c', to: 'q' },
    ],
  },
  {
    id: 'desconexo',
    name: 'Desconexo',
    description:
      'Dos triángulos separados. Todos los grados son pares, pero no se puede cubrir todo en una sola pasada.',
    directed: false,
    nodes: [
      { id: 'a', label: 'a', x: 160, y: 200 },
      { id: 'b', label: 'b', x: 300, y: 100 },
      { id: 'c', label: 'c', x: 300, y: 300 },
      { id: 'd', label: 'd', x: 560, y: 200 },
      { id: 'e', label: 'e', x: 700, y: 100 },
      { id: 'f', label: 'f', x: 700, y: 300 },
    ],
    edges: [
      { id: 'ab', from: 'a', to: 'b' },
      { id: 'bc', from: 'b', to: 'c' },
      { id: 'ca', from: 'c', to: 'a' },
      { id: 'de', from: 'd', to: 'e' },
      { id: 'ef', from: 'e', to: 'f' },
      { id: 'fd', from: 'f', to: 'd' },
    ],
  },
  {
    id: 'ciclo-dirigido',
    name: 'Ciclo dirigido',
    description:
      'Grafo dirigido donde cada vértice tiene un arco saliente y uno entrante: existe un circuito euleriano.',
    directed: true,
    nodes: [
      { id: '1', label: '1', x: 200, y: 160 },
      { id: '2', label: '2', x: 400, y: 100 },
      { id: '3', label: '3', x: 600, y: 200 },
      { id: '4', label: '4', x: 520, y: 380 },
      { id: '5', label: '5', x: 280, y: 380 },
    ],
    edges: [
      { id: 'a12', from: '1', to: '2' },
      { id: 'a23', from: '2', to: '3' },
      { id: 'a34', from: '3', to: '4' },
      { id: 'a45', from: '4', to: '5' },
      { id: 'a51', from: '5', to: '1' },
    ],
  },
  {
    id: 'camino-dirigido',
    name: 'Camino dirigido',
    description:
      'Ciclo 1→2→3→4→1 más un arco extra 2→4. El vértice 2 queda con un arco saliente de más y el 4 con uno entrante de más: hay camino euleriano de 2 a 4.',
    directed: true,
    nodes: [
      { id: '1', label: '1', x: 180, y: 300 },
      { id: '2', label: '2', x: 380, y: 140 },
      { id: '3', label: '3', x: 600, y: 200 },
      { id: '4', label: '4', x: 520, y: 400 },
    ],
    edges: [
      { id: 'a12', from: '1', to: '2' },
      { id: 'a23', from: '2', to: '3' },
      { id: 'a34', from: '3', to: '4' },
      { id: 'a41', from: '4', to: '1' },
      { id: 'a24', from: '2', to: '4' },
    ],
  },
]