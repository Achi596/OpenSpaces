import React, { useRef, useEffect, useState } from 'react';
import styled from '@emotion/styled';

const PanBoxContainer = styled.div`
  display: block;
  width: 100%;
  height: 80%;
  overflow: hidden;
  position: relative;
  cursor: grab;

  &.manipulating {
    cursor: grabbing;
  }
`;

const Viewport = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

const ZoomableContent = styled.div`
  transform-origin: top left;
  transition: transform 0.2s ease;
  width: 100%;
  height: 100%;
`;

const PanBox = ({
  children,
  zoom,
  minZoom,
  maxZoom,
}) => {
  const viewportRef = useRef(null);
  const [scale, setScale] = useState(zoom);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointer, setLastPointer] = useState({ x: 0, y: 0 });
  const [lastScroll, setLastScroll] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const viewport = viewportRef.current;

    const handleWheel = (e) => {
      e.preventDefault();
      let newScale = scale + e.deltaY * -0.01;
      newScale = Math.min(Math.max(newScale, minZoom), maxZoom);
      setScale(newScale);
    };

    const handlePointerDown = (e) => {
      e.preventDefault();
      setIsDragging(true);
      setLastPointer({ x: e.clientX, y: e.clientY });
      setLastScroll({ x: viewport.scrollLeft, y: viewport.scrollTop });
      viewport.classList.add('manipulating');
    };

    const handlePointerMove = (e) => {
      if (!isDragging) { return; }
      const deltaX = e.clientX - lastPointer.x;
      const deltaY = e.clientY - lastPointer.y;
      viewport.scrollLeft = lastScroll.x - deltaX;
      viewport.scrollTop = lastScroll.y - deltaY;
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      viewport.classList.remove('manipulating');
    };

    viewport.addEventListener('wheel', handleWheel);
    viewport.addEventListener('pointerdown', handlePointerDown);
    viewport.addEventListener('pointermove', handlePointerMove);
    viewport.addEventListener('pointerup', handlePointerUp);
    viewport.addEventListener('pointerleave', handlePointerUp);

    return () => {
      viewport.removeEventListener('wheel', handleWheel);
      viewport.removeEventListener('pointerdown', handlePointerDown);
      viewport.removeEventListener('pointermove', handlePointerMove);
      viewport.removeEventListener('pointerup', handlePointerUp);
      viewport.removeEventListener('pointerleave', handlePointerUp);
    };
  }, [scale, isDragging, lastPointer, lastScroll, minZoom, maxZoom]);

  return (
    <PanBoxContainer>
      <Viewport ref={viewportRef}>
        <ZoomableContent style={{ transform: `scale(${scale})` }}>
          {children}
        </ZoomableContent>
      </Viewport>
    </PanBoxContainer>
  );
};

export default PanBox;
