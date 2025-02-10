import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import styled from '@emotion/styled';
import FloorPlanEditor from '../components/FloorPlanEditor';
import CreateFloorPlanForm from '../components/CreateFloorPlanForm';
import { Button as MuiButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const url = process.env.BACKEND_URL ||
 'https://backend.openspaces.penguinserver.net/';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: linear-gradient(90deg, white, black);
  border-radius: 10px;
  height: calc(100vh - 200px);
`;

const DropdownContainer = styled.div`
  position: relative;
  width: 150px;
`;

const Dropdown = styled.select`
  width: 100%;
  padding: 10px 20px;
  background-color: #000;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  appearance: none; /* Remove default arrow */

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
  transform: translateY(-50%) ${props =>
    (props.active ? 'rotate(180deg)' : 'rotate(0deg)')};
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

const Button = styled(MuiButton)`
  padding: 10px 20px;
  background-color: #000;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background-color: #333;
  }
`;

const MessageBox = styled.div`
  padding: 5px;
  max-height: 40px;
  background-color: #f1ebb1;
  color: black;
  border-radius: 5px;
  text-align: center;
  margin-bottom: 10px;
  border: 3px solid white
`;

const FloorEdit = () => {
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [dropdownActive, setDropdownActive] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const token = Cookies.get('token');
  const userRole = Cookies.get('role');
  const isAdmin = userRole === 'Admin';

  const fetchFloors = useCallback(async () => {
    try {
      const response = await fetch(`${url}floorplan/list?token=${token}`);
      const data = await response.json();
      setFloors(data);
    } catch (error) {
      console.error('Error fetching floor plans:', error);
      alert('Error fetching floor plans:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchFloors();
  }, [fetchFloors]);

  const handleFloorChange = (event) => {
    const selectedFloorId = event.target.value;
    fetch(`${url}floorplan/get?token=${token}&floorplanID=${selectedFloorId}`)
      .then(response => response.json())
      .then(data => setSelectedFloor(data[0]))
      .catch(error => {
        console.error('Error fetching floor plan details:', error);
        alert('There was an error fetching the floor plan details!');
      });
  };

  const handleFormClose = () => {
    setShowForm(false);
    fetchFloors(); // Refresh the list of floors
  };

  if (!token || !isAdmin) {
    return <div>Please log in as an Admin to access this page</div>;
  }
  return (
    <Container>
      <DropdownContainer>
        <Dropdown
          onChange={handleFloorChange}
          onClick={() => setDropdownActive(!dropdownActive)}
          onBlur={() => setDropdownActive(false)}
        >
          <Option value="">Edit Floor</Option>
          {floors.map(floor => (
            <Option key={floor.FloorplanID} value={floor.FloorplanID}>
              {floor.Name}
            </Option>
          ))}
        </Dropdown>
        <Arrow active={dropdownActive} />
      </DropdownContainer>
      <Button
        onClick={() => setShowForm(true)}
        variant="contained"
      >
        <AddIcon /> Add New Floorplan
      </Button>
      {showForm && <CreateFloorPlanForm onClose={handleFormClose} />}
      {selectedFloor && (
        <>
          <MessageBox>
            Click on the image where you want a new space placed!
          </MessageBox>
          <FloorPlanEditor
            imageSrc={selectedFloor.Image}
            floorId={selectedFloor.FloorplanID}
            rerender={setSelectedFloor}
            pins={JSON.parse(selectedFloor.Pins)}
          />
        </>
      )}
    </Container>
  );
};

export default FloorEdit;
