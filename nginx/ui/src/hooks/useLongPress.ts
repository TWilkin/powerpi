import { useEffect, useState } from "react";

export default function useLongPress(callback: () => void, ms = 300) {
  const [startLongPress, setStartLongPress] = useState(false);

  useEffect(() => {
    let timer: number | undefined;

    if (startLongPress) {
      timer = window.setTimeout(callback, ms);
    } else {
      clearTimeout(timer!);
    }

    return () => {
      clearTimeout(timer!);
    };
  }, [callback, ms, startLongPress]);

  const start = () => setStartLongPress(true);
  const stop = () => setStartLongPress(false);

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop
  };
}
