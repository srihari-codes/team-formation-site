import { lazy, Suspense, useState } from "react";
import { useIsDesktop } from "@/hooks/useMediaQuery";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface SplineBackgroundProps {
  sceneUrl: string;
  className?: string;
}

export function SplineBackground({ sceneUrl, className = "" }: SplineBackgroundProps) {
  const isDesktop = useIsDesktop();
  const [loaded, setLoaded] = useState(false);

  // Only render on desktop
  if (!isDesktop) {
    return null;
  }

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <Suspense fallback={null}>
        <div 
          className={`w-full h-full transition-opacity duration-1000 ${loaded ? 'opacity-30' : 'opacity-0'}`}
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
