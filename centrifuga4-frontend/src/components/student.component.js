import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import {useTranslation} from "react-i18next";
import StudentsList from "./students-list.component";
import Box from "@material-ui/core/Box";
import {TextField} from "@material-ui/core";
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import useTheme from "@material-ui/core/styles/useTheme";
import Typography from "@material-ui/core/Typography";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: '25ch',
    },
  },
  contentPanel: {
    height: "80vh", //TODO
    boxSizing: "border-box"
  }
}));


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  const { t } = useTranslation();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
            <Box px={2}>
              <h1>student</h1>
              <TextField id="standard-basic" label={t("name")}/>
              <TextField id="standard-basic" label={t("surname1")}/>
              <TextField id="standard-basic" label={t("surname2")}/>

              <TextField id="standard-basic" label={t("id")}
                         InputProps={{readOnly: true,}}/>

              <TextField id="standard-basic" label={t("email")} type="email"/>

              <TextField id="standard-basic" label={t("phone")} type="tel"/>
              <TextField id="standard-basic" label={t("address")}/>
              <TextField id="standard-basic" label={t("city")}/>
              <TextField id="standard-basic" label={t("zip")} type="number"/>

              <TextField id="standard-basic" label={t("dni")}/>

              <TextField id="standard-basic" label={t("gender")}/>
              <TextField id="standard-basic" label={t("birthdate")} type="date"/>
              <TextField id="standard-basic" label={t("country_of_origin")}/>
            </Box>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

export default function Students() {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
    const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  let contacts = [1,2];

  return (
    <div className={classes.root}>
      <Grid container spacing={3} className={classes.grid}>
        <Grid item xs={4}>
          <h1>{t("students")}</h1>
          <StudentsList/>
        </Grid>

        <Grid item xs={8}>
          <Paper elevation={3} square className={classes.contentPanel}>
            <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label={t("student")} {...a11yProps(0)} />
          {
          contacts && contacts.map((contact, index) => (
          <Tab label={t("contact ") + (index+1)} {...a11yProps(index)} />
              ))}
        </Tabs>
      </AppBar>
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={value}
        onChangeIndex={handleChangeIndex}
      >
        <TabPanel value={value} index={0} dir={theme.direction}/>
        {
          contacts && contacts.map((contact, index) => (
               <TabPanel value={value} index={index+1} dir={theme.direction}/>
              ))}

}
      </SwipeableViews>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
