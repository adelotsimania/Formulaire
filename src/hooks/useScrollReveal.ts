import { useEffect } from 'react';

/**
 * Ports the IntersectionObserver logic from the old index.html inline <script>.
 * Any element with class="reveal" fades in when it enters the viewport; nested
 * elements with class="item-reveal" inside it are staggered in one by one.
 *
 * Call this once per page that uses .reveal / .item-reveal sections.
 */
export function useScrollReveal(deps: React.DependencyList = []) {
  useEffect(() => {
    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');

          const subItems = entry.target.querySelectorAll('.item-reveal');
          subItems.forEach((item, index) => {
            setTimeout(() => {
              item.classList.add('active');
            }, index * 150);
          });

          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
