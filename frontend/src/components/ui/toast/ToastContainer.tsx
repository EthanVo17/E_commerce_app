import { useToastStore } from "@/stores/toastStore";

const bgMap = {
  success: "bg-green-500",
  error: "bg-red-500",
  info: "bg-blue-500",
} as const;

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={`flex min-w-[280px] items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${bgMap[toast.type]} animate-[slideIn_0.3s_ease-out]`}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="ml-2 shrink-0 text-white/80 hover:text-white"
            aria-label="Đóng thông báo"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
