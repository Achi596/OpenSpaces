import React, { useState } from 'react';
import Cookies from 'js-cookie';
import styled from '@emotion/styled';
import { Button, TextField, IconButton,
  FormHelperText, Card, CardMedia} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const url = process.env.BACKEND_URL ||
 'https://backend.openspaces.penguinserver.net/';

const FormOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 1000;
`;

const FormContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 400px;
  position: relative;
  margin-top: 100px;
`;

const FileInputButton = styled(Button)`
  margin: 10px 0;
  width: 100%;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CreateButton = styled(Button)`
  background-color: #000;
  color: white;
  margin-top: 10px;

  &:hover {
    background-color: #333;
  }
`;

const CancelButton = styled(IconButton)`
  position: absolute;
  top: 0px;
  right: 4px;
`;

const ErrorText = styled(FormHelperText)`
  color: red;
`;

const ImagePreviewCard = styled(Card)`
  margin-top: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ImagePreview = styled(CardMedia)`
  max-height: 400px;
  object-fit: contain;
`;

const CreateFloorPlanForm = ({ onClose }) => {
  const [name, setName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [nameError, setNameError] = useState('');
  const [fileError, setFileError] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && !['image/jpeg', 'image/png'].includes(file.type)) {
      setFileError('Please select a valid image file (JPEG or PNG).');
      setSelectedFile(null);
      setImagePreview('');
    } else {
      setFileError('');
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNameError('');
    setFileError('');

    if (!name) {
      setNameError('Floorplan name is required.');
      return;
    }

    if (!selectedFile) {
      setFileError('Image file is required.');
      return;
    }

    try {
      const token = Cookies.get('token');
      let imageURL = '';
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
      const response = await fetch(`${url}floorplan/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          Name: name,
          Pins: '[]',
          Image: imageURL,
        }),
      });

      if (response.ok) {
        alert('Floorplan created successfully');
        onClose();
      } else {
        const errorData = await response.json();
        const errorMessage = errorData || 'An unknown error occurred';
        alert(`Error ${response.status}: ${errorMessage}`);
      }
    } catch (error) {
      console.error('There was an error creating floorplan', error);
      alert('There was an error creating the floorplan!');
    }
  };

  return (
    <FormOverlay>
      <FormContainer>
        <CancelButton onClick={onClose}>
          <CloseIcon />
        </CancelButton>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Floorplan Name"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            error={!!nameError}
          />
          <ErrorText>{nameError}</ErrorText>

          <FileInputButton
            variant="contained"
            component="label"
            startIcon={<AddPhotoAlternateIcon />}
          >
            Choose Image File
            <input
              type="file"
              accept="image/jpeg,image/png"
              hidden
              onChange={handleFileChange}
            />
          </FileInputButton>
          <ErrorText>{fileError}</ErrorText>

          {imagePreview && (
            <ImagePreviewCard>
              <ImagePreview
                component="img"
                image={imagePreview}
                alt="Image preview"
              />
            </ImagePreviewCard>
          )}

          <CreateButton
            type="submit"
            variant="contained"
          >
            Create Floorplan
          </CreateButton>
        </form>
      </FormContainer>
    </FormOverlay>
  );
};

export default CreateFloorPlanForm;
