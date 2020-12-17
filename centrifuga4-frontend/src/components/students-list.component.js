import React, {Component, useEffect, useState} from "react";
import StudentsDataService from "../services/students.service";
import Pagination from '@material-ui/lab/Pagination';
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import ListItemText from "@material-ui/core/ListItemText";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Divider from "@material-ui/core/Divider";
import SearchBar from '../components/searchbar.component'
import Box from "@material-ui/core/Box";
import {useTranslation} from "react-i18next";

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    flexGrow: 1
  },
  content: {
    width: '100%%',
    height: '100%',
    flexGrow: 1
  },
  pagination: {
    margin: '30px'
  }
}));


const StudentsList = () => {
  const [tutorials, setTutorials] = useState([]);
  const [currentTutorial, setCurrentTutorial] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchTitle, setSearchTitle] = useState("");

  const { t } = useTranslation();

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(3);

  const pageSizes = [3, 6, 9];
  const classes = useStyles();

  const onChangeSearchTitle = (e) => {
    const searchTitle = e.target.value;
    setSearchTitle(searchTitle);
  };

  const getRequestParams = (searchTitle, page, pageSize) => {
    let params = {};

    if (searchTitle) {
      params["title"] = searchTitle;
    }

    if (page) {
      params["page"] = page - 1;
    }

    if (pageSize) {
      params["size"] = pageSize;
    }

    return params;
  };

  const retrieveTutorials = () => {
    const params = getRequestParams(searchTitle, page, pageSize);

    /*StudentsDataService.getAll(params)
      .then((response) => {
        const { tutorials, totalPages } = response.data;

        setTutorials(tutorials);
        setCount(totalPages);

        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });*/

    let response = StudentsDataService.getAll(params);
    console.log(response);
    const tutorials = response.data;

        setTutorials(tutorials);
        setCount(2);

        console.log(response.data);
  };

  useEffect(retrieveTutorials, [page, pageSize]);


  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setPage(1);
  };

  return (
      <div className={classes.root}>
          <SearchBar
              label={t("students")}
            value={searchTitle}
            onChange={onChangeSearchTitle}
            onSearch={retrieveTutorials}
          />
        <Box my={2}>
          <Pagination
              className="pagination"
              count={count}
              page={page}
              size="small"
              showFirstButton
              showLastButton
              siblingCount={1}
              boundaryCount={1}
              color="primary"
              onChange={handlePageChange}
          /></Box>

          <List className={classes.content}>
            {tutorials && tutorials.map((tutorial, index) => (
                <div>
               <ListItem key={index} button
                    onClick={() => setCurrentTutorial(tutorial)}>
                    <ListItemAvatar>
                      <Avatar>{tutorial.name.charAt(0).toUpperCase()}</Avatar>
                    </ListItemAvatar>
                    <ListItemText id="name" primary={tutorial.name} />
                  </ListItem>
                <Divider/>
                </div>
              ))}
          </List>

      </div>
  );
};

export default StudentsList;
