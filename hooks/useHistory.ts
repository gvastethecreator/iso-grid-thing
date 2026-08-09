import { useState, useCallback } from "react";

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useHistory<T>(initialPresent: T) {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialPresent,
    future: [],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const undo = useCallback(() => {
    setState((currentState) => {
      if (currentState.past.length === 0) return currentState;

      const previous = currentState.past[currentState.past.length - 1];
      const newPast = currentState.past.slice(0, currentState.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [currentState.present, ...currentState.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((currentState) => {
      if (currentState.future.length === 0) return currentState;

      const next = currentState.future[0];
      const newFuture = currentState.future.slice(1);

      return {
        past: [...currentState.past, currentState.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  /**
   * Sets the state, pushing the previous 'present' to 'past'.
   * Use this for discrete actions (clicks, key presses).
   */
  const set = useCallback((newPresent: T | ((curr: T) => T)) => {
    setState((currentState) => {
      const value = newPresent instanceof Function ? newPresent(currentState.present) : newPresent;

      if (JSON.stringify(value) === JSON.stringify(currentState.present)) {
        return currentState;
      }

      return {
        past: [...currentState.past, currentState.present],
        present: value,
        future: [],
      };
    });
  }, []);

  /**
   * Updates the 'present' state WITHOUT pushing to 'past'.
   * Use this for continuous updates (dragging a slider).
   * IMPORTANT: Call saveSnapshot() BEFORE starting a sequence of ephemeral updates.
   */
  const setEphemeral = useCallback((newPresent: T | ((curr: T) => T)) => {
    setState((currentState) => {
      const value = newPresent instanceof Function ? newPresent(currentState.present) : newPresent;
      return {
        ...currentState,
        present: value,
      };
    });
  }, []);

  /**
   * Explicitly saves the current 'present' state to 'past'.
   * Call this onMouseDown or onDragStart before ephemeral updates.
   */
  const saveSnapshot = useCallback(() => {
    setState((currentState) => {
      // Avoid duplicating history if logic triggers multiple saves without changes
      if (
        currentState.past.length > 0 &&
        JSON.stringify(currentState.past[currentState.past.length - 1]) ===
          JSON.stringify(currentState.present)
      ) {
        return currentState;
      }
      return {
        past: [...currentState.past, currentState.present],
        present: currentState.present,
        future: [],
      };
    });
  }, []);

  return {
    state: state.present,
    set,
    setEphemeral,
    saveSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
    historyState: state,
  };
}
