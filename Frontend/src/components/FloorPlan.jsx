import React, { useRef, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import ComputerDeskIcon from './ComputerDeskIcon';
import MarkerIcon from './MarkerIcon';
import PanBox from './PanBox';
import Cookies from 'js-cookie';
import BookingDialog from './PinDialog.jsx';

const url = process.env.BACKEND_URL ||
 'https://backend.openspaces.penguinserver.net/';

const FloorPlanContainer = styled.div`
  max-width: 1500px;
  margin-bottom: 50px;
  padding-bottom: 0px;
  overflow: hidden;
  background-color: white;
  border-bottom: 5px solid black;
  border-left: 5px solid black;
  border-radius: 5px;
`;

const Image = styled.img`
  max-height: 60vh;
  max-width: 100%;
  object-fit: cover;
  margin-bottom: 0px;
  padding-bottom: 0px;
  @media (max-height: 719px) {
    max-height: 50vh;
  }
`;

const PinContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const Pin = styled.div`
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translate(-50%, -50%) scale(1.4);
  }
`;

const IconWrapper = styled.div`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FloorPlan = ({ imageSrc, pins }) => {
  const imgRef = useRef(null);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [Name, setName] = useState(null);
  const [Thumbnail, setThumbnail] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [SpaceID, setSpaceID] = useState(null);

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      const { width, height } = entry.contentRect;
      setImgDimensions({ width, height });
    });

    const imgElement = imgRef.current;
    if (imgElement) {
      observer.observe(imgElement);
    }

    return () => {
      if (imgElement) {
        observer.unobserve(imgElement);
      }
    };
  }, []);

  useEffect(() => {
    if (imgRef.current) {
      const { width, height } = imgRef.current.getBoundingClientRect();
      setImgDimensions({ width, height });
    }
  }, [imageLoaded]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handlePinDetails = (spaceID) => {
    const token = Cookies.get('token');

    fetch(`${url}spaces/get/${spaceID}?token=${token}`)
      .then(response => response.json())
      .then(body => {
        setName(body.Name);
        setThumbnail(body.Thumbnail);
        setSpaceID(body.SpaceID);
        setShowDialog(true);
      })
      .catch(error =>
        alert('Error fetching floor plan details:', error)
      );
  };

  const closeErrorPopup = () => {
    setShowDialog(false);
    setName(null);
    setThumbnail(null);
    setSpaceID(null);
  };

  const renderPins = () => {
    if (!imageLoaded || !imgRef.current) {
      return null;
    }

    const { naturalWidth, naturalHeight } = imgRef.current;
    const { width: containerWidth, height: containerHeight } = imgDimensions;

    // Calculate scale factors
    const scaleX = containerWidth / naturalWidth;
    const scaleY = containerHeight / naturalHeight;

    // Determine the scale factor to maintain the aspect ratio
    const scale = Math.min(scaleX, scaleY);

    // Pin size based on scale, with a maximum limit
    const baseSize = 40;
    const maxSize = 60;
    const size = Math.min(baseSize * scale, maxSize);

    // Calculate offsets for centering image
    const offsetX = (containerWidth - naturalWidth * scale) / 2;
    const offsetY = (containerHeight - naturalHeight * scale) / 2;

    return pins.map((pin, index) => {
      if (pin.coordinates.length === 2) {
        // Calculate pin position based on scale
        const pinX = pin.coordinates[0] * scale + offsetX;
        const pinY = pin.coordinates[1] * scale + offsetY;

        // Ensure pin is within container bounds
        const boundedPinX = Math.min(Math.max(pinX, 0), containerWidth);
        const boundedPinY = Math.min(Math.max(pinY, 0), containerHeight);

        const Icon = pin.type === 'Room' ? MarkerIcon : ComputerDeskIcon;
        const color = pin.available ? '#91ff93' : '#fa6171';

        return (
          <Pin
            key={index}
            style={{
              left: `${boundedPinX}px`,
              top: `${boundedPinY}px`,
              width: `${size}px`,
              height: `${size}px`,
            }}
            onClick={() => handlePinDetails(pin.spaceID)}
          >
            <IconWrapper size={size}>
              <Icon color={color} />
            </IconWrapper>
          </Pin>
        );
      }
      return null;
    });
  };

  return (
    <FloorPlanContainer>
      <PanBox zoom={1} minZoom={1} maxZoom={3}>
        <Image
          ref={imgRef}
          src={imageSrc}
          alt="Floor Plan"
          onLoad={handleImageLoad}
        />
        <PinContainer>
          {renderPins()}
        </PinContainer>
      </PanBox>

      {showDialog && (
        <BookingDialog
          Name={Name}
          Thumbnail={Thumbnail}
          showDialog={showDialog}
          SpaceID={SpaceID}
          closeErrorPopup={closeErrorPopup}
        />
      )}
    </FloorPlanContainer>
  );
};

export default FloorPlan;
