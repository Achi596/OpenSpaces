import React, { useState, useRef } from 'react';
import styled from '@emotion/styled';
import { FormControl,
  InputLabel, MenuItem, Select, TextField, Button } from '@mui/material';
import Cookies from 'js-cookie';

const url = process.env.BACKEND_URL ||
 'https://backend.openspaces.penguinserver.net/';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const PopupContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border: 1px solid black;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  border-radius: 5px;
  width: 80%;
  max-width: 600px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
  width: 100%;
`;

const FormButton = styled(Button)`
  background: black;
  color: white;
  &:hover {
    background: grey;
  }
`;

const SpacesCreateForm = ({ onClose, floorId, coords, rerender }) => {
  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(0);
  const [projector, setProjector] = useState(0);
  const [whiteboard, setWhiteboard] = useState(0);
  const [desktops, setDesktops] = useState(0);
  const [thumbnail, setThumbnail] = useState(null);
  const [description, setDescription] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setThumbnail('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const submitCreateSpace = async () => {
    try {
      let imageURL = thumbnail;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);

        const uploadResponse = await fetch(`${url}data/upload`, {
          method: 'POST',
          body: formData,
        });

        const uploadResult = await uploadResponse.json();

        if (uploadResponse.ok) {
          imageURL = uploadResult.imageURL;
        } else {
          throw new Error(uploadResult.error || 'Error uploading image');
        }
      }

      setThumbnail(imageURL);

      const createSpaceResponse = await fetch(`${url}spaces/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: Cookies.get('token'),
          Name: name,
          Type: type,
          Capacity: capacity,
          Projector: projector,
          Whiteboard: whiteboard,
          Desktops: desktops,
          Thumbnail: imageURL,
          Description: description,
        }),
      });

      if (createSpaceResponse.ok) {
        const spaceIdText = await createSpaceResponse.text();
        const spaceIdMatch = spaceIdText.match(/SpaceId:\s*(\d+)/);
        const SpaceId = spaceIdMatch ? parseInt(spaceIdMatch[1], 10) : null;

        if (!SpaceId) {
          throw new Error('Error extracting SpaceId from response');
        }

        // Fetch current floorplan data
        const token = Cookies.get('token');
        const fetchUrl =
        `${url}floorplan/get/?token=${token}&floorplanID=${floorId}`;
        const floorplanResponse = await fetch(fetchUrl);
        const floorplanData = await floorplanResponse.json();

        if (!floorplanResponse.ok) {
          throw new Error('Error fetching floorplan data');
        }

        // Parse and update the pins list
        const parsedPins = JSON.parse(floorplanData[0].Pins);
        const newPin = {
          pinID: parsedPins.length + 1,
          spaceID: SpaceId,
          coordinates: [coords.x, coords.y],
          type: type,
        };
        parsedPins.push(newPin);

        // Send the updated floorplan data
        const editFloorplanResponse = await fetch(`${url}floorplan/edit/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: Cookies.get('token'),
            FloorplanID: floorId,
            Name: floorplanData[0].Name,
            Pins: JSON.stringify(parsedPins),
            Image: floorplanData[0].Image,
          }),
        });

        if (editFloorplanResponse.ok) {
          // Refresh the floorplan to trigger re-render
          const updatedFloorplanResponse = await fetch(
            `${url}floorplan/get/?token=${token}&floorplanID=${floorId}`);
          const updatedFloorplanData = await updatedFloorplanResponse.json();

          if (updatedFloorplanResponse.ok) {
            rerender(updatedFloorplanData[0]);
            alert('Space created and floorplan updated successfully');
            onClose();
          } else {
            throw new Error('Error fetching updated floorplan data');
          }
        } else {
          const errorData = await editFloorplanResponse.json();
          const errorMessage = errorData.error || 'Error updating floorplan';
          console.error('Error response:', {
            status: editFloorplanResponse.status,
            statusText: editFloorplanResponse.statusText,
            error: errorMessage,
          });
          alert(`Error ${editFloorplanResponse.status}: ${errorMessage}`);
        }
      } else {
        const errorText = await createSpaceResponse.text();
        console.error('Error response:', {
          status: createSpaceResponse.status,
          statusText: createSpaceResponse.statusText,
          error: errorText,
        });
        alert(`Error ${createSpaceResponse.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('There was an error creating the space!', error);
      alert('There was an error creating the space!');
    }
  };

  return (
    <>
      <Overlay onClick={onClose} />
      <PopupContainer>
        <h2>Create Space</h2>
        <FormGroup>
          <TextField
            required
            label="Name"
            variant="filled"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
        </FormGroup>
        <FormGroup>
          <FormControl fullWidth variant="filled">
            <InputLabel id="type-select-label">Type</InputLabel>
            <Select
              labelId="type-select-label"
              value={type}
              label="Type"
              onChange={handleTypeChange}
            >
              <MenuItem value="Room">Room</MenuItem>
              <MenuItem value="Hotdesk">Hotdesk</MenuItem>
            </Select>
          </FormControl>
        </FormGroup>
        <FormGroup>
          <TextField
            label="Capacity"
            type="number"
            variant="filled"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            fullWidth
          />
        </FormGroup>
        <FormGroup>
          <TextField
            label="Projector"
            type="number"
            variant="filled"
            value={projector}
            onChange={(e) => setProjector(Number(e.target.value))}
            fullWidth
          />
        </FormGroup>
        <FormGroup>
          <TextField
            label="Whiteboard"
            type="number"
            variant="filled"
            value={whiteboard}
            onChange={(e) => setWhiteboard(Number(e.target.value))}
            fullWidth
          />
        </FormGroup>
        <FormGroup>
          <TextField
            label="Desktops"
            type="number"
            variant="filled"
            value={desktops}
            onChange={(e) => setDesktops(Number(e.target.value))}
            fullWidth
          />
        </FormGroup>
        <FormGroup>
          <TextField
            required
            label="Description"
            variant="filled"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
          />
        </FormGroup>
        <FormGroup>
          <Button variant="contained" component="label">
            Upload Image of Space
            <input
              type="file"
              hidden
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </Button>
          {uploadedImage && (
            <div>
              <Button onClick={handleRemoveImage}>Remove Image</Button>
            </div>
          )}
        </FormGroup>
        <FormGroup>
          <FormButton onClick={submitCreateSpace}>Create Space</FormButton>
        </FormGroup>
        {uploadedImage && (
          <div>
            <img
              src={uploadedImage}
              alt="Uploaded Space"
              style={{ width: '100%', maxHeight: '200px', objectFit: 'cover'}}
            />
          </div>
        )}
      </PopupContainer>
    </>
  );
};

export default SpacesCreateForm;
