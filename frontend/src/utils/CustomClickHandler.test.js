/**
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useCustomClickHandler } from "./CustomClickHandler";

//Mock console.error
jest.spyOn(console, "error").mockImplementation(() => jest.fn());


//The test suite
describe("useCustomClickHandler", () => {
  let onClick, onDoubleClick, onLongPress;

  beforeEach(() => {
    onClick = jest.fn((a) => {});
    onDoubleClick = jest.fn((a) => {});
    onLongPress = jest.fn((a) => {});
  });


  it("throws an error if onClick is missing", () => {
    expect(() => renderHook(() => useCustomClickHandler({}))).toThrow("onClick is required.");
  });


  it("throws an error if onClick is not a function", () => {
    expect(() => renderHook(() => useCustomClickHandler({ onClick: "test" }))).toThrow("onClick must be a function.");
  });


  it("throws an error if onClick does not have 1 parameter", () => {
    expect(() => renderHook(() => useCustomClickHandler({ onClick: () => {} }))).toThrow("onClick must have 1 parameter.");
  });


  it("throws an error if onDoubleClick is missing", () => {
    expect(() => renderHook(() => useCustomClickHandler({ onClick }))).toThrow("onDoubleClick is required.");
  });


  it("throws an error if onDoubleClick is not a function", () => {
    expect(() => renderHook(() => useCustomClickHandler({ onClick, onDoubleClick: "test" }))).toThrow("onDoubleClick must be a function.");
  });


  it("throws an error if onDoubleClick does not have 1 parameter", () => {
    expect(() => renderHook(() => useCustomClickHandler({ onClick, onDoubleClick: () => {} }))).toThrow("onDoubleClick must have 1 parameter.");
  });


  it("throws an error if onLongPress is missing", () => {
    expect(() => renderHook(() => useCustomClickHandler({ onClick, onDoubleClick }))).toThrow("onLongPress is required.");
  });


  it("throws an error if onLongPress is not a function", () => {
    expect(() => renderHook(() => useCustomClickHandler({ onClick, onDoubleClick, onLongPress: "test" }))).toThrow("onLongPress must be a function.");
  });


  it("throws an error if onLongPress does not have 1 parameter", () => {
    expect(() => renderHook(() => useCustomClickHandler({ onClick, onDoubleClick, onLongPress: () => {} }))).toThrow("onLongPress must have 1 parameter.");
  });


  it("throws an error if doubleClickThreshold is not a number", () => {
    expect(() => renderHook(() => useCustomClickHandler({ onClick, onDoubleClick, onLongPress, doubleClickThreshold: "test" }))).toThrow("doubleClickThreshold must be a number.");
  });


  it("throws an error if longPressThreshold is not a number", () => {
    expect(() => renderHook(() => useCustomClickHandler({ onClick, onDoubleClick, onLongPress, longPressThreshold: "test" }))).toThrow("longPressThreshold must be a number.");
  });


  it("should handle single click", async () => {
    const { result } = renderHook(() => useCustomClickHandler({ onClick, onDoubleClick, onLongPress }));

    act(() => {
      result.current.onClick();
    });

    await waitFor(() => {
      expect(onClick).toHaveBeenCalled();
      expect(onDoubleClick).not.toHaveBeenCalled();
      expect(onLongPress).not.toHaveBeenCalled();
    });
  });


  it("should handle double click", async () => {
    const { result } = renderHook(() => useCustomClickHandler({ onClick, onDoubleClick, onLongPress }));

    act(() => {
      result.current.onClick();
      result.current.onClick();
    });

    await waitFor(() => {
      expect(onClick).not.toHaveBeenCalled();
      expect(onDoubleClick).toHaveBeenCalled();
      expect(onLongPress).not.toHaveBeenCalled();
    });
  });


  it("should handle long press", async () => {
    const { result } = renderHook(() => useCustomClickHandler({ onClick, onDoubleClick, onLongPress }));

    act(() => {
      result.current.onMouseDown({ target: {} });
    });

    await waitFor(() => {
      expect(onClick).not.toHaveBeenCalled();
      expect(onDoubleClick).not.toHaveBeenCalled();
      expect(onLongPress).toHaveBeenCalled();
    });
  });


  it("fast touch", async () => {
    const { result } = renderHook(() => useCustomClickHandler({ onClick, onDoubleClick, onLongPress }));

    act(() => {
      result.current.onTouchStart({ changedTouches: [{ clientX: 0, clientY: 0 }] });
      result.current.onTouchEnd({ changedTouches: [{ clientX: 0, clientY: 0 }] });
    });

    await waitFor(() => {
      expect(onClick).toHaveBeenCalled();
      expect(onDoubleClick).not.toHaveBeenCalled();
      expect(onLongPress).not.toHaveBeenCalled();
    });
  });


  it("touch but move", async () => {
    const { result } = renderHook(() => useCustomClickHandler({ onClick, onDoubleClick, onLongPress }));

    act(() => {
      result.current.onTouchStart({ changedTouches: [{ clientX: 0, clientY: 0 }] });
      result.current.onTouchMove();
      result.current.onTouchEnd({ changedTouches: [{ clientX: 0, clientY: 0 }] });
    });

    await waitFor(() => {
      expect(onClick).not.toHaveBeenCalled();
      expect(onDoubleClick).not.toHaveBeenCalled();
      expect(onLongPress).not.toHaveBeenCalled();
    });
  });


  it("touch, move but no release", async () => {
    const { result } = renderHook(() => useCustomClickHandler({ onClick, onDoubleClick, onLongPress }));

    act(() => {
      result.current.onTouchStart({ changedTouches: [{ clientX: 0, clientY: 0 }] });
      result.current.onTouchMove();
    });

    await waitFor(() => {
      expect(onClick).not.toHaveBeenCalled();
      expect(onDoubleClick).not.toHaveBeenCalled();
      expect(onLongPress).not.toHaveBeenCalled();
    });
  });


  it("click but touch again and move", async () => {
    const { result } = renderHook(() => useCustomClickHandler({ onClick, onDoubleClick, onLongPress }));

    act(() => {
      result.current.onClick();
      result.current.onTouchStart({ changedTouches: [{ clientX: 0, clientY: 0 }] });
      result.current.onTouchMove();
    });

    await waitFor(() => {
      expect(onClick).not.toHaveBeenCalled();
      expect(onDoubleClick).not.toHaveBeenCalled();
      expect(onLongPress).not.toHaveBeenCalled();
    });
  });


  it("long press then release", async () => {
    const { result } = renderHook(() => useCustomClickHandler({ onClick, onDoubleClick, onLongPress }));

    act(() => {
      result.current.onMouseDown({ target: {} });
    });

    await new Promise((r) => setTimeout(r, 700));

    act(() => {
      result.current.onTouchEnd({ changedTouches: [{ clientX: 0, clientY: 0 }] });
    });

    await waitFor(() => {
      expect(onClick).not.toHaveBeenCalled();
      expect(onDoubleClick).not.toHaveBeenCalled();
      expect(onLongPress).toHaveBeenCalled();
    });
  });


  it("long press then move", async () => {
    const { result } = renderHook(() => useCustomClickHandler({ onClick, onDoubleClick, onLongPress }));

    act(() => {
      result.current.onMouseDown({ target: {} });
    });

    await new Promise((r) => setTimeout(r, 800));

    act(() => {
      result.current.onTouchMove();
    });

    await waitFor(() => {
      expect(onClick).not.toHaveBeenCalled();
      expect(onDoubleClick).not.toHaveBeenCalled();
      expect(onLongPress).toHaveBeenCalled();
    });
  });


  it("long press then click", async () => {
    const { result } = renderHook(() => useCustomClickHandler({ onClick, onDoubleClick, onLongPress }));

    act(() => {
      result.current.onMouseDown({ target: {} });
    });

    await new Promise((r) => setTimeout(r, 800));

    act(() => {
      result.current.onClick();
    });

    await waitFor(() => {
      expect(onClick).not.toHaveBeenCalled();
      expect(onDoubleClick).not.toHaveBeenCalled();
      expect(onLongPress).toHaveBeenCalled();
    });
  });
});
