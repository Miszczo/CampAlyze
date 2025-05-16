/* eslint-disable react/prop-types */
import * as React from "react";

// Typy dla komponentu toast
export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
}

// Typy dla kontekstu
type ToastActionType = "ADD_TOAST" | "UPDATE_TOAST" | "DISMISS_TOAST" | "REMOVE_TOAST";

interface Action {
  type: ToastActionType;
  toast?: ToastProps;
  toastId?: string;
}

interface State {
  toasts: ToastProps[];
}

const ToastContext = React.createContext<
  | {
      toasts: ToastProps[];
      toast: (props: ToastProps) => void;
      dismiss: (toastId: string) => void;
      update: (props: ToastProps) => void;
      remove: (toastId: string) => void;
    }
  | undefined
>(undefined);

function toastReducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [...state.toasts, { ...action.toast, id: action.toast?.id || String(Date.now()) }],
      };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast?.id ? { ...t, ...action.toast } : t)),
      };
    case "DISMISS_TOAST":
      // Logika dla DISMISS_TOAST (jeśli potrzebna) - obecnie mapuje, ale nie zmienia obiektu toastu
      // Jeśli celem jest np. oznaczenie jako odrzucony, trzeba by dodać odpowiednie pole do ToastProps
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toastId ? { ...t } : t)), // Możliwa pomyłka, to nie usuwa ani nie modyfikuje toastu
      };
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
    default:
      return state;
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(toastReducer, { toasts: [] });

  const toast = React.useCallback((props: ToastProps) => {
    const id = props.id || String(Date.now());
    dispatch({ type: "ADD_TOAST", toast: { ...props, id } });

    // Automatyczne usunięcie toastu po 5 sekundach
    setTimeout(() => {
      dispatch({ type: "REMOVE_TOAST", toastId: id });
    }, 5000);
  }, []);

  const update = React.useCallback((props: ToastProps) => {
    dispatch({ type: "UPDATE_TOAST", toast: props });
  }, []);

  const dismiss = React.useCallback((toastId: string) => {
    // Jeśli DISMISS_TOAST ma inne znaczenie niż REMOVE_TOAST, zaimplementuj tutaj
    // Na razie zakładam, że dismiss to po prostu remove
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, []);

  const remove = React.useCallback((toastId: string) => {
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, toast, dismiss, update, remove }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function Toaster() {
  const { toasts } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-72">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-lg border shadow-lg p-4 ${
            toast.variant === "destructive"
              ? "bg-destructive text-destructive-foreground border-destructive"
              : "bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700"
          }`}
          role="alert"
        >
          {toast.title && <div className="font-medium">{toast.title}</div>}
          {toast.description && <div className="text-sm mt-1">{toast.description}</div>}
        </div>
      ))}
    </div>
  );
}
