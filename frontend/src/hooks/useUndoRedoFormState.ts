import { useEffect, useRef, useState, useCallback } from "react";

export function useUndoRedoFormState<T>(initialState: T) {
    const [state, setState] = useState<T>(initialState);
    const [history, setHistory] = useState<T[]>([initialState]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isRestoringRef = useRef(false);
    const lastSavedStateRef = useRef<string>(JSON.stringify(initialState));

    const updateState = useCallback((newState: T | ((prev: T) => T)) => {
        setState(prev => {
            const computed = typeof newState === 'function'
                ? (newState as (prev: T) => T)(prev)
                : newState;
            return computed;
        });
    }, []);

    // Save to history when state changes (debounced)
    useEffect(() => {
        // Skip if we're in the middle of undo/redo
        if (isRestoringRef.current) {
            return;
        }

        const currentStateStr = JSON.stringify(state);

        // Don't save if state hasn't actually changed
        if (currentStateStr === lastSavedStateRef.current) {
            return;
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            // Double check the state hasn't changed during the timeout
            const finalStateStr = JSON.stringify(state);
            if (finalStateStr === lastSavedStateRef.current) {
                return;
            }

            setHistory(prevHistory => {
                setHistoryIndex(prevIndex => {
                    // Remove any history after current index (when undoing then making new changes)
                    const currentHistory = prevHistory.slice(0, prevIndex + 1);

                    // Add new state to history
                    const newHistory = [...currentHistory, state];

                    // Keep history size manageable
                    if (newHistory.length > 50) {
                        newHistory.shift();
                        return newHistory.length - 1;
                    } else {
                        return newHistory.length - 1;
                    }
                });

                // Update history
                const currentHistory = prevHistory.slice(0, historyIndex + 1);
                const newHistory = [...currentHistory, state];

                if (newHistory.length > 50) {
                    newHistory.shift();
                }

                return newHistory;
            });

            lastSavedStateRef.current = finalStateStr;
        }, 300);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [state, historyIndex]);

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            isRestoringRef.current = true;
            const newIndex = historyIndex - 1;
            const stateToRestore = history[newIndex];

            setHistoryIndex(newIndex);
            setState(stateToRestore);
            lastSavedStateRef.current = JSON.stringify(stateToRestore);

            // Clear the restoring flag after a brief delay
            setTimeout(() => {
                isRestoringRef.current = false;
            }, 10);
        }
    }, [historyIndex, history]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            isRestoringRef.current = true;
            const newIndex = historyIndex + 1;
            const stateToRestore = history[newIndex];

            setHistoryIndex(newIndex);
            setState(stateToRestore);
            lastSavedStateRef.current = JSON.stringify(stateToRestore);

            // Clear the restoring flag after a brief delay
            setTimeout(() => {
                isRestoringRef.current = false;
            }, 10);
        }
    }, [historyIndex, history]);

    // Reset history when initial state changes (but only if it's actually different)
    useEffect(() => {
        const initialStateStr = JSON.stringify(initialState);
        if (initialStateStr !== JSON.stringify(history[0])) {
            setHistory([initialState]);
            setHistoryIndex(0);
            setState(initialState);
            lastSavedStateRef.current = initialStateStr;
        }
    }, [initialState]);

    return {
        state,
        setState: updateState,
        undo,
        redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
    };
}

export default useUndoRedoFormState;