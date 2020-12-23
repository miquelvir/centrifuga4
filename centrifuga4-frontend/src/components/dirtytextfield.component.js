import React, {useEffect, useState} from 'react';
import {withStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const withStylesProps = styles =>
  Component =>
    props => {
      const Comp = withStyles(styles(props))(Component);
      return <Comp {...props} />;
    };

const styles = props => ({
  root: {
    '& label.Mui-focused':  {color: props.isDirty? '#ffcf3d': null},
    '& .MuiInput-underline:after': {borderBottomColor: props.isDirty? '#ffcf3d': null},
      '& label':  {color: props.isDirty? '#ffcf3d': null},
  },
});

const DirtyTextField = props => {
    const [savedValue, setSavedValue] = useState(props.value);
    const StyledTextField = withStylesProps(styles)(TextField);

    return <StyledTextField
            isDirty={savedValue !== props.value}
            {...props}
            />;
}


export default DirtyTextField;