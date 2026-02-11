import { useCallback } from 'react';
import { resolveCollision } from '../utils/helpers';

export function useCollision() {
  const checkAndResolveCollision = useCallback((movedNode, allNodes) => {
    if (!movedNode || !allNodes) return movedNode.position;

    const newPosition = resolveCollision(movedNode, allNodes, 20);

    return newPosition;
  }, []);

  return {
    checkAndResolveCollision,
  };
}
