import { useEffect, useState } from "react";

export function useClickOutside(ref: React.RefObject<HTMLElement>, callback: () => void) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback(); // Invoke the callback if clicked outside
      }
    };

    document.addEventListener("click", handleClickOutside);

    // Cleanup the event listener when the component unmounts
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [ref, callback]);
}

export function useWindowResize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup the event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return size;
}

export const useRelativePositionCallback = (childSelector: string, parentSelector: string, callback: (position: { top: number; left: number }) => void) => {
  useEffect(() => {
    let childElement: Element | null = null;
    let parentElement: Element | null = null;

    const updatePosition = () => {
      if (childElement && parentElement) {
        const parentRect = parentElement.getBoundingClientRect();
        const childRect = childElement.getBoundingClientRect();

        callback({
          top: Math.round(childRect.top - parentRect.top), // Stabilize top value
          left: Math.round(childRect.left - parentRect.left), // Stabilize left value
        });
      }
    };

    const observeElements = () => {
      childElement = document.querySelector(childSelector);
      parentElement = document.querySelector(parentSelector);

      if (childElement && parentElement) {
        // Initial position update
        updatePosition();

        // Observe size and layout changes
        const resizeObserver = new ResizeObserver(() => updatePosition());
        resizeObserver.observe(childElement);
        resizeObserver.observe(parentElement);

        // Observe DOM mutations
        const mutationObserver = new MutationObserver(() => updatePosition());
        mutationObserver.observe(document.body, { attributes: true, childList: true, subtree: true });

        // Cleanup
        return () => {
          resizeObserver.disconnect();
          mutationObserver.disconnect();
        };
      } else {
        console.warn(`Elements not found for selectors: ${childSelector}, ${parentSelector}`);
      }
    };

    // Retry until the elements are found
    const interval = setInterval(() => {
      if (document.querySelector(childSelector) && document.querySelector(parentSelector)) {
        clearInterval(interval);
        observeElements();
      }
    }, 100); // Check every 100ms

    return () => clearInterval(interval);
  }, [childSelector, parentSelector, callback]);
};
