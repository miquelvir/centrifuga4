import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import {useTranslation} from "react-i18next";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
}));

export default function SearchBar({label, searchTitle, onChange, onSearch}) {
  const classes = useStyles();

  const { t } = useTranslation();

  return (
    <Paper className={classes.root}>
      <InputBase
        className={classes.input}
        placeholder={t("search")+ " " + label}
        inputProps={{ 'aria-label': 'search ' + label}}
        value={searchTitle}
        onChange={onChange}
        onKeyDown={(e) => {
          if(e.code === 'Enter') onSearch();
        }}
      />
      <IconButton
          type="submit"
          className={classes.iconButton}
          aria-label="search"
            onClick={onSearch}>
        <SearchIcon/>
      </IconButton>
    </Paper>
  );
}