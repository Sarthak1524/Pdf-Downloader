import React, { useRef, useEffect } from 'react';

interface SplineViewerWrapperProps {
  url: string;
  className?: string;
}

const SplineViewerWrapper: React.FC<SplineViewerWrapperProps> = ({ url, className }) => {
  const splineRef = useRef<any>(null);

  useEffect(() => {
    if (splineRef.current && url) {
      // Set the URL property directly on the DOM element
      splineRef.current.url = url;
    }
  }, [url]);

  return (
    <spline-viewer
      ref={splineRef}
      className={className}
    />
  );
};

export default SplineViewerWrapper;