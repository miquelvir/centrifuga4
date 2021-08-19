import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {useTranslation} from "react-i18next";
import {textSchedulesForCourse} from "../../utils/localized-weekdays";
import { useHistory } from "react-router-dom";
import Skeleton from '@material-ui/lab/Skeleton';

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  action: {
    float: "bottom"
  },
  flexGrow: {
    flexGrow: 1 
  }
}));

export default function CourseCard(props) {
  const classes = useStyles();
  let history = useHistory();
  const { course = null} = props;
  const loading = course === null;
  const {t} = useTranslation();

  const courseId = course === null? null: course["id"];
  const handleViewCourse = () => history.replace(`/home/courses?id=${courseId}`);
  const handleTakeAttendance = () => history.replace(`/attendance?id=${courseId}`)
  return (
    <Card className={classes.root}>
        <CardContent>
        <Typography className={classes.title} color="textSecondary" gutterBottom>
            {loading? <Skeleton/> : t("course")}
          </Typography>

          <Typography variant="h5" component="h2">
            {loading? <Skeleton/> : course["name"]}
          </Typography>

          <Typography className={classes.pos} color="textSecondary">
            {loading? <Skeleton/> : textSchedulesForCourse(course)}
          </Typography>
          
        </CardContent>
        <div className={classes.flexGrow} />
        <CardActions className={classes.action}>
          {loading? <Skeleton variant="rect" width={75} height={30} />:
          <Button variant="outlined" size="small" onClick={handleViewCourse}>{t("view")}</Button>}
          {loading? <Skeleton variant="rect" width={210} height={30} />:
          <Button variant="outlined" color="secondary" size="small" onClick={handleTakeAttendance}>{t("take attendance")}</Button>}
        </CardActions>
      </Card>
  );
}