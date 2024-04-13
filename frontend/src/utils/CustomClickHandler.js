import { useLongPress } from "react-use";

/**
 * Detects single, double, and long clicks on a component.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Function} params.onClick - Function to call on single click.
 * @param {Function} params.onDoubleClick - Function to call on double click.
 * @param {Function} params.onLongPress - Function to call on long press.
 * @param {number} [params.doubleClickThreshold] - Time threshold for double click in milliseconds. Default is 300.
 * @param {number} [params.longPressThreshold] - Time threshold for long press in milliseconds. Default is 600.
 *
 * @returns {Object} - The handlers for various events.
 */
export function useCustomClickHandler({ onClick, onDoubleClick, onLongPress, doubleClickThreshold = 300, longPressThreshold = 600 }) {
  //Check the parameters
  checkParameters(onClick, onDoubleClick, onLongPress, doubleClickThreshold, longPressThreshold);


  //Variables to track the click count and timeouts
  let clickTimeout = null;
  let clickCount = 0;
  let longPressDetected = false;
  let touchInProgress = false;
  let touchMoveDetected = false;


  //Handler for touch start event
  const handleTouchStart = () => {
    touchInProgress = true;
    touchMoveDetected = false;
  };


  //Handler for touch end event
  const handleTouchEnd = (event) => {
    if (longPressDetected) {
      longPressDetected = false;
      return;
    }
    if (touchInProgress && !touchMoveDetected) {
      handleClick(event);
      touchInProgress = false;
    }
  };


  //Handler for touch move event
  const handleTouchMove = () => {
    touchMoveDetected = true;
    if (longPressDetected) {
      longPressDetected = false;
      return;
    }
    touchInProgress = false;
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
      clickCount = 0;
    }
  };


  //Handler for click event
  const handleClick = (event) => {
    if (longPressDetected) {
      longPressDetected = false;
      return;
    }
    clickCount++;
    if (clickTimeout === null) {
      clickTimeout = setTimeout(() => {
        if (clickCount === 1) onClick(event);
        else onDoubleClick(event);
        clickCount = 0;
        clearTimeout(clickTimeout);
        clickTimeout = null;
      }, doubleClickThreshold);
    }
  };


  //Handler for long press event
  const handleLongPress = useLongPress((event) => {
    if (touchMoveDetected) {
      return;
    }
    clearTimeout(clickTimeout);
    clickTimeout = null;
    clickCount = 0;
    onLongPress(event);
    longPressDetected = true;
    touchInProgress = false;
  }, longPressThreshold);


  //Return the handlers for various events
  return {
    onClick: handleClick,
    onTouchStart: (event) => { handleTouchStart(event); handleLongPress.onTouchStart(event); },
    onTouchEnd: (event) => { handleTouchEnd(event); handleLongPress.onTouchEnd(event); },
    onTouchMove: handleTouchMove,
    onMouseDown: handleLongPress.onMouseDown,
    onMouseUp: handleLongPress.onMouseUp,
    onMouseLeave: handleLongPress.onMouseLeave,
  };
}


/**
 * Checks the parameters passed to useCustomClickHandler.
 */
function checkParameters(onClick, onDoubleClick, onLongPress, doubleClickThreshold, longPressThreshold) {
  if (onClick === undefined) {
    throw new Error("onClick is required.");
  }
  if (typeof onClick !== "function") {
    throw new Error("onClick must be a function.");
  }
  if (onClick.length !== 1) {
    throw new Error("onClick must have 1 parameter.");
  }

  if (onDoubleClick === undefined) {
    throw new Error("onDoubleClick is required.");
  }
  if (typeof onDoubleClick !== "function") {
    throw new Error("onDoubleClick must be a function.");
  }
  if (onDoubleClick.length !== 1) {
    throw new Error("onDoubleClick must have 1 parameter.");
  }

  if (onLongPress === undefined) {
    throw new Error("onLongPress is required.");
  }
  if (typeof onLongPress !== "function") {
    throw new Error("onLongPress must be a function.");
  }
  if (onLongPress.length !== 1) {
    throw new Error("onLongPress must have 1 parameter.");
  }

  if (doubleClickThreshold !== undefined && typeof doubleClickThreshold !== "number") {
    throw new Error("doubleClickThreshold must be a number.");
  }

  if (longPressThreshold !== undefined && typeof longPressThreshold !== "number") {
    throw new Error("longPressThreshold must be a number.");
  }
}
