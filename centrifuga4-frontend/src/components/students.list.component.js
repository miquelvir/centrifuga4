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
import {Chip, ListItemSecondaryAction} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import GetAppIcon from '@material-ui/icons/GetApp';
import Tooltip from "@material-ui/core/Tooltip";

const useStyles = makeStyles((theme) => ({
    root: {
      maxHeight: "70vh",
      height: "100%",
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",

    },
  list: {
    overflow: "auto",
    // maxHeight: "60vh",
    display: "flex",
	flexDirection: "column",
    flex: 1,
  },
  box: {
      display: "flex",
	flexDirection: "column",
  },
    pagination: {
        margin: '30px'
    }
}));

const StudentsList = () => {
    const [students, setStudents] = useState([]);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    const {t} = useTranslation();

    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const [pageSize, setPageSize] = useState(3);

    const pageSizes = [3, 6, 9];
    const classes = useStyles();

    const onChangeSearchTerm = (e) => {
        console.log(e.target.value);
        setSearchTerm(e.target.value);
    };

    function search(){
        console.log(searchTerm);
        StudentsDataService.getAll(searchTerm).then(function(result) {
            setStudents(result["data"]);
            setCount(result["_pagination"]["totalPages"]);
        }, function(err) {
          console.log(err); // TODO snackbar
        });
    }

    useEffect(search, [page, pageSize]);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handlePageSizeChange = (event) => {
        setPageSize(event.target.value);
        setPage(1);
    };

    function exportCsv() {
        StudentsDataService.getAll(searchTerm, true).then(function(result) {}, function(err) {
          console.log(err); // TODO snackbar
        });
    }

    return (
        <Box className={classes.root}>
<Box className={classes.box}>
            <SearchBar
                label={t("students")}
                value={searchTerm}
                onChange={onChangeSearchTerm}
                onSearch={search}
            />
            <Box my={1}>
                <Tooltip title={t("export search results as .csv")} aria-label={t("export search results as .csv")}>
                    <Chip variant="outlined" size="small" avatar={<Avatar>csv</Avatar>} label="export"
                          onClick={exportCsv}/>
                </Tooltip>
            </Box>
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
                />
                </Box>
        </Box>
                <List className={classes.list}>
                    {students && students.map((tutorial, index) => (
                        <div>
                            <ListItem key={index} button
                                      onClick={() => setCurrentStudent(tutorial)}>
                                <ListItemAvatar>
                                    <Avatar>{tutorial.name.charAt(0).toUpperCase()}</Avatar>
                                </ListItemAvatar>
                                <ListItemText id="name" primary={tutorial.name}/>
                                <Tooltip title={t("export .csv")}
                                         aria-label={t("export student as .csv")}><ListItemSecondaryAction>

                                    <IconButton edge="end" aria-label="export">

                                        <GetAppIcon/>


                                    </IconButton>
                                </ListItemSecondaryAction></Tooltip>
                            </ListItem>
                            <Divider/>
                        </div>
                    ))}
                </List>
        </Box>
    );
};

export default StudentsList;
