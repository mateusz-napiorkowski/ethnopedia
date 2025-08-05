import { useEffect, useRef, useState } from "react";

export function useUndoRedoFormState<T>(initialState: T) {
    const [state, setState] = useState<T>(initialState);
    const [history, setHistory] = useState<T[]>([initialState]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [isRestoring, setIsRestoring] = useState(false);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const updateState = (newState: T) => {
        setState(newState);
    };

    // Zmiana stanu i zapis do historii (debounced)
    useEffect(() => {
        if (isRestoring) {
            setIsRestoring(false);
            return;
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setHistory(prev => {
                const trimmed = prev.slice(0, historyIndex + 1);
                const last = trimmed[trimmed.length - 1];

                if (JSON.stringify(last) === JSON.stringify(state)) return trimmed;

                const updated = [...trimmed, state];
                if (updated.length > 30) updated.shift();

                setHistoryIndex(updated.length - 1);
                return updated;
            });
        }, 500); // 500ms debounce

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [state]);

    const undo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setIsRestoring(true);
            setHistoryIndex(newIndex);
            setState(history[newIndex]);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setIsRestoring(true);
            setHistoryIndex(newIndex);
            setState(history[newIndex]);
        }
    };

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
