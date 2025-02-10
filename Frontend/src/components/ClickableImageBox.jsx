import React, { useRef, useState  } from 'react';
import styled from '@emotion/styled';
import AddSpacePopup from './AddSpacePopup';
import SpacesCreateForm from './SpacesCreateForm';

const ClickableImageBoxContainer = styled.div`
  display: block;
  width: 100%;
  height: 80%;
  position: relative;
`;

const ClickableImageBox =
({ imgRef, floorId, rerender, infoOpen, children }) => {
  const viewportRef = useRef(null);
  const [popup, setPopup] = useState(null);
  const [trueCoords, setTrueCoords] = useState(null);
  const [isPopen, setIsPopen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleClick = (e) => {
    if (!viewportRef.current || !imgRef.current) {
      return;
    }
    if (isPopen || isFormOpen || infoOpen) {
      return;
    }
    const rect = viewportRef.current.getBoundingClientRect();
    const imgElement = imgRef.current;

    // Get natural dimensions from imgRef
    const imgWidth = imgElement.naturalWidth;
    const imgHeight = imgElement.naturalHeight;

    // Calculate scale factors
    const viewportWidth = viewportRef.current.offsetWidth;
    const viewportHeight = viewportRef.current.offsetHeight;
    const scaleX = viewportWidth / imgWidth;
    const scaleY = viewportHeight / imgHeight;

    // Calculate the position relative to the image
  	let x = (e.clientX - rect.left) / scaleX;
    let y = (e.clientY - rect.top) / scaleY;

    // Clamp coordinates to be within natural dimensions
    x = Math.max(0, Math.min(x, imgWidth));
    y = Math.max(0, Math.min(y, imgHeight));

    //console.log(`Click position: (${Math.round(x)}, ${Math.round(y)})`);
    setPopup({ x: e.clientX - rect.left, y: e.clientY - rect.top});
    setTrueCoords({ x: Math.round(x), y: Math.round(y) });
    setIsPopen(true);
    //console.log(floorId);
  };

  const handleClosePopup = () => {
    //setPopup(null);
    setIsPopen(false);
  };

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setIsPopen(false);
  };

  React.useEffect(() => {
    if (infoOpen) {
      setIsPopen(false);
    }
  }, [infoOpen]);

  return (
    <ClickableImageBoxContainer ref={viewportRef} onClick={handleClick}>
      {children}
      {isPopen && !isFormOpen && !infoOpen && (
        <AddSpacePopup
          position={popup}
          onClose={handleClosePopup}
          onOpenForm={handleOpenForm}
          onCloseForm={handleCloseForm}
        />
      )}
      {isFormOpen &&
      <SpacesCreateForm
        onClose={handleCloseForm}
        floorId={floorId}
        coords={trueCoords}
        rerender={rerender}/>}

    </ClickableImageBoxContainer>
  );
};

export default ClickableImageBox;
