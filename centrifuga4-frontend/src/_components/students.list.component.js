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
import SearchBar from './searchbar.component'
import Box from "@material-ui/core/Box";
import {useTranslation} from "react-i18next";
import {Chip, ListItemSecondaryAction} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import GetAppIcon from '@material-ui/icons/GetApp';
import Tooltip from "@material-ui/core/Tooltip";
import LoadingBackdrop from "./loadingBackdrop.component";
import {useErrorHandler} from "../_helpers/handle-response";

const useStyles = makeStyles((theme) => ({
    root: {
        flex: 1,
        overflow: 'auto',
        display: "flex",
        flexDirection: "column"
    },
    list: {
        overflow: "auto",
        // maxHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: '150px'
    },
    box: {
        display: "flex",
        flexDirection: "column",
    },
    pagination: {
        margin: '30px'
    },
    avatar: {},
    selectedAvatar: {
        backgroundColor: theme.palette.primary.dark
    }
}));

const StudentsList = (props) => {
    const setCurrentStudentId = props.setCurrentStudentId;
    const currentStudentId = props.currentStudentId;

    const [students, setStudents] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");

    const {t} = useTranslation();

    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const errorHandler = useErrorHandler();

    const classes = useStyles();

    const [loading, setLoading] = useState(false);

    const onChangeSearchTerm = (e) => {
        setSearchTerm(e.target.value);
    };

    function search() {
        StudentsDataService
            .getAll(searchTerm, page, ['id', 'full_name'])
            .then(...errorHandler({}))  // todo everywhere
            .then(function (res) {
                    setStudents(res["data"]);
                    setCount(res["_pagination"]["totalPages"]);
                });
    }

    useEffect(search, [page, setStudents]);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    function exportCsv() {
        setLoading(true);  // todo clean this and the loading background
        StudentsDataService
            .downloadAllCsv(searchTerm, page)
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
                    <Tooltip title={t("export_results_csv")} aria-label={t("export_results_csv")}>
                        <Chip variant="outlined" size="small" avatar={<Avatar>csv</Avatar>} label={t("export")}
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
                    <div key={student["id"]}>
                        <ListItem key={student["id"]} button
                                  onClick={() => {
                                      setCurrentStudentId(student['id']);
                                  }}>
                            <ListItemAvatar>
                                <Avatar className={student["id"] === currentStudentId? classes.selectedAvatar: classes.avatar}>{student['full_name'].charAt(0).toUpperCase()}</Avatar>
                            </ListItemAvatar>
                            <ListItemText id="name" primary={student.full_name}/>
                            <Tooltip title={t("export") + " .csv"}>
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" aria-label={t("export")}>
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
