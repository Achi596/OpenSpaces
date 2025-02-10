import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import styled from '@emotion/styled';
import FloorPlan from '../components/FloorPlan';

const url = process.env.BACKEND_URL ||
 'https://backend.openspaces.penguinserver.net/';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: linear-gradient(90deg, #fad234, #ffeda6);
  border-radius: 10px;
`;

const DropdownContainer = styled.div`
  position: relative;
  width: 150px;
`;

const Dropdown = styled.select`
  width: 100%;
  padding: 10px 20px;
  margin-bottom: 10px;
  background-color: #000;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  appearance: none;
  &:hover {
    background-color: #333;
  }
`;

const Arrow = styled.div`
  position: absolute;
  top: 40%;
  right: 10px;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid white;
  transform: translateY(-50%) ${
  ({ active }) => (active ? 'rotate(180deg)' : 'rotate(0deg)')
};
  transition: transform 0.2s ease-in-out;
`;

const Option = styled.option`
  background-color: #f1ebb1;
  color: black;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 99;
`;

const MessageBox = styled.div`
  background-color: #fff;
  color: #333;
  padding: 10px 20px;
  margin-bottom: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  font-size: 16px;
  text-align: center;
  border-bottom: 2px solid black;
  border-left: 2px solid black;
`;

const FloorSelect = () => {
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [dropdownActive, setDropdownActive] = useState(false);
  const token = Cookies.get('token');

  useEffect(() => {
    fetch(`${url}floorplan/list?token=${token}`)
      .then(response => response.json())
      .then(data => setFloors(data))
      .catch(error => {
        console.error('Error fetching floor plans:', error);
        alert('There was an error fetching the floor plans. Please try again.');
      });
  }, [token]);

  const handleFloorChange = async (event) => {
    const selectedFloorId = event.target.value;

    try {
      // Fetch floor plan details
      const floorResponse = await fetch(
        `${url}floorplan/get?token=${token}&floorplanID=${selectedFloorId}`
      );
      const floorData = await floorResponse.json();

      if (!floorResponse.ok) {
        throw new Error('Failed to fetch floor plan');
      }

      const pins = JSON.parse(floorData[0].Pins);

      // Fetch available spaces
      const now = new Date();
      const startTime = now.toISOString();
      const endTime = new Date(now.getTime() + 1 * 60 * 1000).toISOString();

      const spacesResponse = await fetch(
        `${url}bookings/availableSpaces/${selectedFloorId}?` +
        `startTime=${startTime}&endTime=${endTime}`
      );

      const spacesData = await spacesResponse.json();

      if (!spacesResponse.ok) {
        throw new Error('Failed to fetch available spaces');
      }

      // Create a Set of available space IDs
      const availableSpaceIds = new Set(spacesData.map(space => space.SpaceId));

      // Update pins based on available spaces
      const updatedPins = pins.map(pin => ({
        ...pin,
        available: availableSpaceIds.has(pin.spaceID),
      }));

      setSelectedFloor({
        ...floorData[0],
        Pins: updatedPins,
      });

    } catch (error) {
      console.error('Error fetch', error);
      alert('Error fetch', error);
    }
  };

  return (
    <Container>
      <DropdownContainer>
        <Dropdown
          onChange={handleFloorChange}
          onClick={() => setDropdownActive(!dropdownActive)}
          onBlur={() => setDropdownActive(false)}
        >
          <Option value="">Select a floor</Option>
          {floors.map(floor => (
            <Option key={floor.FloorplanID} value={floor.FloorplanID}>
              {floor.Name}
            </Option>
          ))}
        </Dropdown>
        <Arrow active={dropdownActive} />
      </DropdownContainer>
      {selectedFloor && (
        <>
          <MessageBox>Click, zoom, and drag to get a closer look!</MessageBox>
          <FloorPlan
            imageSrc={selectedFloor.Image}
            pins={selectedFloor.Pins}
          />
        </>
      )}
    </Container>
  );
};

export default FloorSelect;
