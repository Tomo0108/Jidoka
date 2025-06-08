import { BaseEdge, EdgeProps, getStraightPath } from 'reactflow';

export default function DashedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
}: EdgeProps) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{ strokeDasharray: '6 6' }}
      // markerEnd is not set to remove the arrowhead
    />
  );
} 