import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFormValidation } from "../../src/hooks/useFormValidation.js";

describe("useFormValidation", () => {
  describe("setValue", () => {
    it("should update value", () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.setValue("riderWeight", 82);
      });

      expect(result.current.values.riderWeight).toBe(82);
    });

    it("should clear error when valid value set", () => {
      const { result } = renderHook(() =>
        useFormValidation({ riderWeight: 30 }),
      );

      act(() => {
        result.current.setValue("riderWeight", 82);
      });

      expect(result.current.errors.riderWeight).toBeUndefined();
    });

    it("should set error for invalid weight", () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.setValue("riderWeight", 30);
      });

      expect(result.current.errors.riderWeight).toContain("40");
    });
  });

  describe("reset", () => {
    it("should reset to initial values", () => {
      const initialValues = { riderWeight: 75 };
      const { result } = renderHook(() => useFormValidation(initialValues));

      act(() => {
        result.current.setValue("riderWeight", 100);
      });

      expect(result.current.values.riderWeight).toBe(100);

      act(() => {
        result.current.reset();
      });

      expect(result.current.values.riderWeight).toBe(75);
    });
  });
});
