import { useCallback, useEffect, useRef, useState, useMemo } from "react";

export interface UndoRedoOptions {
    shouldDebounce?: boolean;
    debounceMs?: number;
    fieldKey?: string; // For per-field debouncing
}

export function useUndoRedoFormState<T>(initialState: T) {
    const MAX_HISTORY = 50;
    const DEFAULT_DEBOUNCE_MS = 800;

    const [history, setHistory] = useState<T[]>([initialState]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    // Per-field pending states for debounced changes
    const [pendingByField, setPendingByField] = useState<Map<string, T>>(new Map());
    const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

    // Get the most recent state (considering all pending changes)
    const visibleState: T = useMemo(() => {
        if (pendingByField.size === 0) {
            return history[currentIndex];
        }
        // Return the most recently updated pending state
        const pendingEntries = Array.from(pendingByField.entries());
        const mostRecent = pendingEntries[pendingEntries.length - 1];
        return mostRecent[1];
    }, [history, currentIndex, pendingByField]);

    // Commit a specific field's pending state
    const commitPendingField = useCallback((fieldKey: string, state: T) => {
        const currentState = history[currentIndex];
        if (JSON.stringify(currentState) === JSON.stringify(state)) {
            return; // No change
        }

        setHistory(prev => {
            const trimmed = prev.slice(0, currentIndex + 1);
            const updated = [...trimmed, state];
            const final = updated.length > MAX_HISTORY
                ? updated.slice(updated.length - MAX_HISTORY)
                : updated;

            setTimeout(() => setCurrentIndex(final.length - 1), 0);
            return final;
        });
    }, [history, currentIndex]);

    // Clear pending state for a field
    const clearPendingField = useCallback((fieldKey: string) => {
        setPendingByField(prev => {
            const newMap = new Map(prev);
            newMap.delete(fieldKey);
            return newMap;
        });

        const timer = timersRef.current.get(fieldKey);
        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(fieldKey);
        }
    }, []);

    // Main setState function
    const setState = useCallback((
        updater: T | ((prev: T) => T),
        options: UndoRedoOptions = {}
    ) => {
        const {
            shouldDebounce = false,
            debounceMs = DEFAULT_DEBOUNCE_MS,
            fieldKey = 'default'
        } = options;

        // Calculate new state based on the most current state
        const baseState = pendingByField.get(fieldKey) || history[currentIndex];
        const newState = typeof updater === "function"
            ? (updater as (p: T) => T)(baseState)
            : updater;

        if (!shouldDebounce) {
            // Immediate commit - clear any pending state for this field first
            clearPendingField(fieldKey);

            // Clear all pending states when doing immediate commit
            timersRef.current.forEach(timer => clearTimeout(timer));
            timersRef.current.clear();
            setPendingByField(new Map());

            // Commit immediately to history
            setHistory(prev => {
                const trimmed = prev.slice(0, currentIndex + 1);
                const last = trimmed[trimmed.length - 1];

                if (JSON.stringify(last) === JSON.stringify(newState)) {
                    return prev; // No change
                }

                const updated = [...trimmed, newState];
                const final = updated.length > MAX_HISTORY
                    ? updated.slice(updated.length - MAX_HISTORY)
                    : updated;

                setTimeout(() => setCurrentIndex(final.length - 1), 0);
                return final;
            });
        } else {
            // Debounced update - set pending state for this field
            setPendingByField(prev => {
                const newMap = new Map(prev);
                newMap.set(fieldKey, newState);
                return newMap;
            });

            // Clear existing timer for this field
            const existingTimer = timersRef.current.get(fieldKey);
            if (existingTimer) {
                clearTimeout(existingTimer);
            }

            // Set new timer for this field
            const newTimer = setTimeout(() => {
                commitPendingField(fieldKey, newState);
                clearPendingField(fieldKey);
            }, debounceMs);

            timersRef.current.set(fieldKey, newTimer);
        }
    }, [history, currentIndex, pendingByField, commitPendingField, clearPendingField]);

    // Undo function
    const undo = useCallback(() => {
        // First, check if there are any pending changes to cancel
        if (pendingByField.size > 0) {
            // Cancel all pending changes
            timersRef.current.forEach(timer => clearTimeout(timer));
            timersRef.current.clear();
            setPendingByField(new Map());
            return;
        }

        // Move back in history
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex, pendingByField.size]);

    // Redo function
    const redo = useCallback(() => {
        // Cancel any pending changes first
        if (pendingByField.size > 0) {
            timersRef.current.forEach(timer => clearTimeout(timer));
            timersRef.current.clear();
            setPendingByField(new Map());
        }

        // Move forward in history
        if (currentIndex < history.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    }, [currentIndex, history.length, pendingByField.size]);

    // Initialize state without creating history entry
    const initializeState = useCallback((newState: T) => {
        // Clear all pending states and timers
        timersRef.current.forEach(timer => clearTimeout(timer));
        timersRef.current.clear();
        setPendingByField(new Map());

        setHistory([newState]);
        setCurrentIndex(0);
    }, []);

    const canUndo = currentIndex > 0 || pendingByField.size > 0;
    const canRedo = currentIndex < history.length - 1 && pendingByField.size === 0;

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            timersRef.current.forEach(timer => clearTimeout(timer));
            // eslint-disable-next-line react-hooks/exhaustive-deps
            timersRef.current.clear();
        };
    }, []);

    return {
        state: visibleState,
        setState,
        initializeState,
        undo,
        redo,
        canUndo,
        canRedo,
    };
}

export default useUndoRedoFormState;