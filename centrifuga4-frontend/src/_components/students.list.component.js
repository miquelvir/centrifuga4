import React, {useEffect, useState} from "react";
import StudentsDataService from "../_services/students.service";
import Pagination from '@material-ui/lab/Pagination';
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import ListItemText from "@material-ui/core/ListItemText";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Divider from "@material-ui/core/Divider";
import SearchBar from './/searchbar.component'
import Box from "@material-ui/core/Box";
import {useTranslation} from "react-i18next";
import {Chip, ListItemSecondaryAction} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import GetAppIcon from '@material-ui/icons/GetApp';
import Tooltip from "@material-ui/core/Tooltip";
import {useSnackbar} from 'notistack';
import report from "./snackbar.report";
import {useErrorHandler} from "../_helpers/handle-response";
import LoadingBackdrop from "./loadingBackdrop.component";

const useStyles = makeStyles((theme) => ({
    root: {
        maxHeight: "70vh",
        display: "flex",
        flexDirection: "column"
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

const StudentsList = (props) => {
    const setCurrentStudent = props.setCurrentStudent;
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const {t} = useTranslation();

    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const [pageSize, setPageSize] = useState(3);

    const classes = useStyles();

    const errorHandler = useErrorHandler();

    const [loading, setLoading] = useState(false);

    const onChangeSearchTerm = (e) => {
        console.log(e.target.value);
        setSearchTerm(e.target.value);
    };

    function search() {
        StudentsDataService.getAll(searchTerm, false, page).then(...errorHandler).then(
            function (result) {
                console.log("1");
                setStudents(result["data"]);
                setCount(result["_pagination"]["totalPages"]);
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
        setLoading(true);
        StudentsDataService
            .getAll(searchTerm, true, page)
            .then(...errorHandler)
            .finally(()=>{
                setLoading(false);
            });
    }

    return (
        <Box className={classes.root}>
            <LoadingBackdrop loading={loading}/>
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
                {students && students.map((student, index) => (
                    <div>
                        <ListItem key={index} button
                                  onClick={() => {
                                      setCurrentStudent(student);
                                  }}>
                            <ListItemAvatar>
                                <Avatar>{student.name.charAt(0).toUpperCase()}</Avatar>
                            </ListItemAvatar>
                            <ListItemText id="name" primary={student.name}/>
                            <Tooltip title={t("export .csv")}
                                     aria-label={t("export student as .csv")}>
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" aria-label="export">
                                        <GetAppIcon/>
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </Tooltip>
                        </ListItem>
                        <Divider/>
                    </div>
                ))}
            </List>
        </Box>
    );
};

export default StudentsList;
