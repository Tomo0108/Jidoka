import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface NodeData {
  label: string;
}

const DiamondNode = ({ data }: NodeProps<NodeData>) => {
  return (
    <div className="w-40 h-28 flex items-center justify-center">
      <div className="relative w-full h-full bg-background border-2 border-primary rounded-md transform rotate-45 flex items-center justify-center">
        <div className="transform -rotate-45 text-center">
          {data.label}
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="!top-[-5px] !bg-teal-500" />
      <Handle type="target" position={Position.Left} className="!left-[-5px] !bg-teal-500" />
      <Handle type="source" position={Position.Right} className="!right-[-5px] !bg-teal-500" />
      <Handle type="source" position={Position.Bottom} className="!bottom-[-5px] !bg-teal-500" />
    </div>
  );
};

export default memo(DiamondNode); 