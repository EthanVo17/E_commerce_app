import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import ToastContainer from "@/components/ui/toast/ToastContainer";
import { useToastStore } from "@/stores/toastStore";

describe("Toast Notification Store & Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useToastStore.setState({ toasts: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("adds and renders a welcome toast message", () => {
    render(<ToastContainer />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    act(() => {
      useToastStore.getState().addToast("Đăng nhập thành công! Chào mừng Võ Tấn Đạt", "success");
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Đăng nhập thành công! Chào mừng Võ Tấn Đạt")).toBeInTheDocument();
  });

  it("auto-dismisses toast after timer", () => {
    render(<ToastContainer />);

    act(() => {
      useToastStore.getState().addToast("Notification message", "info");
    });

    expect(screen.getByText("Notification message")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4500);
    });

    expect(screen.queryByText("Notification message")).not.toBeInTheDocument();
  });

  it("dismisses toast when close button is clicked", () => {
    render(<ToastContainer />);

    act(() => {
      useToastStore.getState().addToast("Close me", "error");
    });

    const closeBtn = screen.getByRole("button", { name: /đóng thông báo/i });
    act(() => {
      closeBtn.click();
    });

    expect(screen.queryByText("Close me")).not.toBeInTheDocument();
  });
});
