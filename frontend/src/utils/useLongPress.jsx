// https://github.com/streamich/react-use/blob/master/src/useLongPress.ts
import { useCallback, useRef } from 'react';

function on(
  obj,
  ...args
) {
  if (obj && obj.addEventListener) {
    obj.addEventListener(...(args));
  }
}

function off(
  obj,
  ...args
) {
  if (obj && obj.removeEventListener) {
    obj.removeEventListener(...(args));
  }
}


const isTouchEvent = (ev) => {
  return 'touches' in ev;
};

const preventDefault = (ev) => {
  if (!isTouchEvent(ev)) return;

  if (ev.touches.length < 2 && ev.preventDefault) {
    ev.preventDefault();
  }
};

const useLongPress = (
  callback,
  { isPreventDefault = true, delay = 300 } = {}
) => {
  const timeout = useRef();
  const target = useRef();

  const start = useCallback(
    (event) => {
      // prevent ghost click on mobile devices
      if (isPreventDefault && event.target) {
        on(event.target, 'touchend', preventDefault, { passive: false });
        target.current = event.target;
      }
      timeout.current = setTimeout(() => callback(event), delay);
    },
    [callback, delay, isPreventDefault]
  );

  const clear = useCallback(() => {
    // clearTimeout and removeEventListener
    timeout.current && clearTimeout(timeout.current);

    if (isPreventDefault && target.current) {
      off(target.current, 'touchend', preventDefault);
    }
  }, [isPreventDefault]);

  return {
    onMouseDown: (e) => start(e),
    onTouchStart: (e) => start(e),
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchEnd: clear,
  };
};

export default useLongPress;
