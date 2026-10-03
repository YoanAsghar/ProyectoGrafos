import { useRef, useState } from 'react'
import type { Graph, Step } from '../grafos/types'
import {
  C,
  R,
  VIEW_H,
  VIEW_W,
  edgeGeometry,
  edgeStates,
  nodeColor,
} from '../grafos/render'

interface Props {
  graph: Graph
  step: Step | null
}

export default function GraphCanvas({ graph, step }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({})
  const [dragging, setDragging] = useState<string | null>(null)

  function move(e: React.PointerEvent, id: string) {
    const svg = svgRef.current
    if (!svg) return
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const loc = pt.matrixTransform(svg.getScreenCTM()!.inverse())
    setPositions((p) => ({
      ...p,
      [id]: {
        x: Math.min(Math.max(loc.x, R), VIEW_W - R),
        y: Math.min(Math.max(loc.y, R), VIEW_H - R),
      },
    }))
  }

  const edges = edgeGeometry(graph, positions)
  const states = edgeStates(graph, step, step?.kind === 'fin' ? step.circuit : [])

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="max-h-full w-full touch-none rounded-lg border border-slate-800 bg-slate-900"
      preserveAspectRatio="xMidYMid meet"
      onPointerMove={(e) => {
        if (dragging) move(e, dragging)
      }}
      onPointerUp={() => setDragging(null)}
      onPointerLeave={() => setDragging(null)}
    >
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={C.edgeIdle} />
        </marker>
      </defs>

      {edges.map((e) => {
        const s = states.find((x) => x.id === e.id)!
        return (
          <g key={e.id}>
            <line
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              stroke={s.color}
              strokeWidth={s.width}
              strokeLinecap="round"
              markerEnd={graph.directed ? 'url(#arrow)' : undefined}
            />
          </g>
        )
      })}

      {graph.nodes.map((n) => {
        const p = positions[n.id] ?? { x: n.x, y: n.y }
        const isNow = step?.node === n.id
        const fill = nodeColor(n.id, step)
        return (
          <g key={n.id}>
            <circle
              cx={p.x}
              cy={p.y}
              r={R}
              fill={fill}
              stroke={isNow ? C.nodeNow : C.nodeStroke}
              strokeWidth={isNow ? 3 : 2}
              className="cursor-grab"
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId)
                setDragging(n.id)
              }}
            />
            <text
              x={p.x}
              y={p.y + 6}
              textAnchor="middle"
              fontSize="18"
              fontWeight="700"
              fill="#0f172a"
              className="pointer-events-none select-none"
            >
              {n.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}