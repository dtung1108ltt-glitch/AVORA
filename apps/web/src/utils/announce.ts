let liveRegion: HTMLElement | null = null;

const getLiveRegion = () => {
  if (typeof document === 'undefined') return null;
  if (liveRegion) return liveRegion;

  const region = document.createElement('div');
  region.setAttribute('aria-live', 'polite');
  region.setAttribute('aria-atomic', 'true');
  region.className = 'sr-only';
  document.body.appendChild(region);
  liveRegion = region;
  return region;
};

export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const region = getLiveRegion();
  if (!region) return;

  region.setAttribute('aria-live', priority);
  region.textContent = '';
  window.requestAnimationFrame(() => {
    region.textContent = message;
  });
}
