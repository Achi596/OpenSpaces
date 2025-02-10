import React, { useEffect } from 'react';
import styled from '@emotion/styled';

// Overlay to block interaction with other parts of the page
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

// Popup container
const PopupContainer = styled.div`
  position: absolute;
  background: white;
  border: 1px solid black;
  padding: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  border-radius: 5px;
  width: 100px; /* Adjust width for form content */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

// Tooltip arrow
const TooltipArrow = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid white;
  top: 100%;
  left: ${(props) => props.arrowOffset}px;
  transform: translateX(-50%);
  z-index: 1000;
`;

// Button to show form
const ShowFormButton = styled.button`
  background: black;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;

  &:hover {
    background: grey;
  }
`;

const AddSpacePopup = ({ position, onClose, onOpenForm, onCloseForm }) => {

  // Popup width and height
  const popupWidth = 100; // Width of the PopupContainer

  // Calculate the offset for the arrow based on popup width
  // Center the arrow horizontally
  const arrowOffset = popupWidth / 2;

  const left = position.x - (popupWidth / 2); // Center the popup horizontally
  const top = position.y - popupWidth + 15;

  useEffect(() => {
    const handleResize = () => {
      onClose();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [onClose]);

  return (
    <>
      <Overlay onClick={onClose} />
      <PopupContainer style={{ left: `${left}px`, top: `${top}px` }}>
        <TooltipArrow arrowOffset={arrowOffset} />
        <ShowFormButton onClick={onOpenForm}>Create Space</ShowFormButton>
      </PopupContainer>
    </>
  );
};

export default AddSpacePopup;
