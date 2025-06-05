import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  freezeOnceVisible?: boolean;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
) => {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0.1,
    freezeOnceVisible = true
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false as any);
  const [hasIntersected, setHasIntersected] = useState(false as any);
  // Cambiar el tipo a HTMLElement para compatibilidad con React refs
  const elementRef = useRef(null as any);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !window.IntersectionObserver) {
      return;
    }

    if (freezeOnceVisible && hasIntersected) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasIntersected(true);
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [root, rootMargin, threshold, freezeOnceVisible, hasIntersected]);

  return { isIntersecting, hasIntersected, elementRef };
};