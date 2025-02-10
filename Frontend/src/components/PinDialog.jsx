import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Fallback from '../assets/Fallback.png';

function BookingDialog (props) {
  const [showDialog, setShowDialog] = useState(!!props.showDialog);
  const Name = props.Name;
  const Thumbnail = props.Thumbnail || Fallback;
  const SpaceID = props.SpaceID;
  const nav = useNavigate();

  useEffect(() => {
    setShowDialog(!!props.showDialog);
  }, [props.showDialog]);

  const closeError = () => {
    setShowDialog(false);
    props.closeErrorPopup();
  };

  const goBook = () => {
    nav('/book?space='+ SpaceID);
  };

  return (
    <Dialog open={showDialog} onClose={closeError}>
      <DialogTitle>{Name}</DialogTitle>
      <DialogContent>
        <Card>
          <CardMedia
            component="img"
            alt="Thumbnail"
            style={{ width: '200px', height: '200px' }}
            image={Thumbnail}
          />
        </Card>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeError} color='primary' autoFocus>
          Close
        </Button>
        <Button onClick={goBook} color='primary' autoFocus>
          Book...
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BookingDialog;
