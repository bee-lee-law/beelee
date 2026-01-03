"use client";

import { useMediaQuery } from './useMediaQuery';

export function useIsMobile() {
  const { matches, mounted } = useMediaQuery('(max-width: 768px)');
  return { isMobile: matches, mounted };
}

export function useIsTablet() {
  const { matches, mounted } = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  return { isTablet: matches, mounted };
}

export function useIsDesktop() {
  const { matches, mounted } = useMediaQuery('(min-width: 1025px)');
  return { isDesktop: matches, mounted };
}
