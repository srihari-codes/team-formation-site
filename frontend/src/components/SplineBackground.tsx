import { lazy, Suspense, useState } from "react";
import { useIsDesktop } from "@/hooks/useMediaQuery";

import { SPLINE_SCENE_URL } from "@/config/assets";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface SplineBackgroundProps {
  sceneUrl?: string;
  className?: string;
}

export function SplineBackground({ sceneUrl = SPLINE_SCENE_URL, className = "" }: SplineBackgroundProps) {
  const isDesktop = useIsDesktop();
  const [loaded, setLoaded] = useState(false);

  // Only render on desktop
  if (!isDesktop) {
    return null;
  }

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      <Suspense fallback={null}>
        <div 
          className={`w-full h-full transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        >
          <Spline 
            scene={sceneUrl} 
            onLoad={() => setLoaded(true)}
          />
        </div>
      </Suspense>
    </div>
  );
}
