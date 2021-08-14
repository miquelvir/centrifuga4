import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {useTranslation} from "react-i18next";
import {textSchedulesForCourse} from "../../utils/localized-weekdays";

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 150,
    [theme.breakpoints.up('sm')]: {maxWidth: 300 },
    [theme.breakpoints.down('sm')]:{width: "100%" }
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
}));

export default function CourseCard({course}) {
  const classes = useStyles();
  const bull = <span className={classes.bullet}>•</span>;

  const {t} = useTranslation();
  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography className={classes.title} color="textSecondary" gutterBottom>
          {t("course")}
        </Typography>
        <Typography variant="h5" component="h2">
          {course["name"]}
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
          {textSchedulesForCourse(course)}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">{t("take attendance")}</Button>
      </CardActions>
    </Card>
  );
}