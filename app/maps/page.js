"use client"

import { useIsMobile } from '@/hooks/useIsMobile';
import { useRef, useEffect } from 'react';

export default function Home() {

  const { isMobile, mounted } = useIsMobile();
  const screenSizeRef = useRef({ width: 600, height: 700, radius: 20, loaded: false });

  useEffect(() => {
    if (!mounted) return; // Wait until mounted to initialize

    const updateScreenSize = () => {
      // Calculate responsive height based on viewport
      const viewportHeight = window.innerHeight;
      const mobileHeight = Math.min(viewportHeight - 100, 800); // Max 800px, leave 100px margin for mobile browser UI
      const desktopHeight = Math.min(viewportHeight - 100, 700); // Max 700px, leave 80px margin

      screenSizeRef.current = {
        width: isMobile ? 375 : 600,
        height: isMobile ? mobileHeight : desktopHeight,
        radius: isMobile ? 10 : 20,
        loaded: true
      };
    };

    updateScreenSize();

    // Listen for resize/orientation changes
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, [isMobile, mounted]);

  const containerStyle = {
    position: 'relative',
    width: screenSizeRef.current.width,
    height: screenSizeRef.current.height,
    background: '#1a1a1a',
    borderRadius: screenSizeRef.current.radius,
    overflow: 'hidden',
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <main className="max-w-2xl w-full">
        <div style={containerStyle}>
          hi
        </div>
      </main>
    </div>
  );
}
