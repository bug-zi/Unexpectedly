import type { ThoughtBurstOptions } from '@/components/effects/ThoughtBurstProvider';
import type { MouseEvent } from 'react';

export type ThoughtBurstTrigger = (options: ThoughtBurstOptions) => void;

export function triggerThoughtBurstFromEvent(
  event: MouseEvent<HTMLElement>,
  triggerThoughtBurst: ThoughtBurstTrigger,
  options: Omit<ThoughtBurstOptions, 'x' | 'y'> = {}
) {
  triggerThoughtBurst({
    x: event.clientX,
    y: event.clientY,
    ...options,
  });
}

export function triggerThoughtBurstFromElement(
  element: HTMLElement | null,
  triggerThoughtBurst: ThoughtBurstTrigger,
  options: Omit<ThoughtBurstOptions, 'x' | 'y'> = {}
) {
  if (!element) {
    return;
  }

  const rect = element.getBoundingClientRect();
  triggerThoughtBurst({
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    ...options,
  });
}

export function runAfterThoughtBurst(action: () => void, delay = 120) {
  window.setTimeout(action, delay);
}
