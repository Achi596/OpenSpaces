import React, { useState, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';

function EditorPinDialog (props) {
  const [showDialog, setShowDialog] = useState(!!props.showDialog);
  const Name = props.Name;
  // move to asset folder
  const Thumbnail = props.Thumbnail ||
  'https://cdn.openspaces.penguinserver.net/i/8470e535-7c78-42b9-9ec1-135e5eb3dc17.jpg'; // eslint-disable-line max-len

  useEffect(() => {
    setShowDialog(!!props.showDialog);
  }, [props.showDialog]);

  const closeError = () => {
    setShowDialog(false);
    props.closeErrorPopup();
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
    </Dialog>
  );
}

export default EditorPinDialog;
