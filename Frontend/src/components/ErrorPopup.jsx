import React, { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function ErrorPopup (props) {
  const [showError, setShowError] = useState(!!props.showError);
  const errorMessage = props.errorMessage;

  useEffect(() => {
    setShowError(!!props.showError);
  }, [props.showError]);

  const closeError = () => {
    setShowError(false);
    props.closeErrorPopup();
  };

  return (
    <Dialog open={showError} onClose={closeError}>
      <DialogTitle>Error</DialogTitle>
      <DialogContent>
        <DialogContentText>{errorMessage}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeError} color='primary' autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ErrorPopup;
