import React from 'react';
import {useTranslation} from "react-i18next";
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {Button} from "@material-ui/core";

export default function CommentDialog({commentBox, setCommentBoxValue, handleCloseCommentBox, commentBoxValue, handleCloseCancelCommentBox}){
    const { t } = useTranslation();

    return <Dialog open={commentBox} onClose={handleCloseCommentBox} aria-labelledby="form-dialog-title">
    <DialogTitle id="form-dialog-title">{t("comment")}</DialogTitle>
    <DialogContent>
      <TextField
        value={commentBoxValue}
        onChange={(event) => {
          setCommentBoxValue(event.target.value);
        }}
        autoFocus
        margin="dense"
        multiline
        rows={4}
        variant="outlined"
        fullWidth
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={handleCloseCancelCommentBox} color="primary">
        {t("cancel")}
      </Button>
      <Button onClick={handleCloseCommentBox} color="primary">
        {t("save")}
      </Button>
    </DialogActions>
</Dialog>;
}