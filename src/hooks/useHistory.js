import { useState, useCallback, useRef } from 'react';

export function useHistory(initialState, maxHistory = 50) {
  const [history, setHistory] = useState([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isUndoRedoRef = useRef(false);

  const pushState = useCallback(
    (newState) => {
      // Don't push state during undo/redo operations
      if (isUndoRedoRef.current) return;

      setHistory((prev) => {
        const newHistory = prev.slice(0, currentIndex + 1);
        newHistory.push(newState);

        // Limit history size
        if (newHistory.length > maxHistory) {
          newHistory.shift();
          return newHistory;
        }

        return newHistory;
      });

      setCurrentIndex((prev) => {
        const newIndex = prev + 1;
        return newIndex >= maxHistory ? maxHistory - 1 : newIndex;
      });
    },
    [currentIndex, maxHistory]
  );

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      isUndoRedoRef.current = true;
      setCurrentIndex((prev) => prev - 1);
      const previousState = history[currentIndex - 1];
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 0);
      return previousState;
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      isUndoRedoRef.current = true;
      setCurrentIndex((prev) => prev + 1);
      const nextState = history[currentIndex + 1];
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 0);
      return nextState;
    }
    return null;
  }, [currentIndex, history]);

  const reset = useCallback((newInitialState) => {
    setHistory([newInitialState]);
    setCurrentIndex(0);
  }, []);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    currentState: history[currentIndex],
    pushState,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  };
}
