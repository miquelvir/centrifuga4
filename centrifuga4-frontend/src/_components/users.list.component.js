import React, {useEffect, useState} from "react";
import UsersDataService from "../_services/users.service";
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
import {Accordion, AccordionDetails, AccordionSummary, Chip, ListItemSecondaryAction} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import GetAppIcon from '@material-ui/icons/GetApp';
import Tooltip from "@material-ui/core/Tooltip";
import {useErrorHandler} from "../_helpers/handle-response";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import StudentsDataService from "../_services/students.service";
import ExportSearchChip from "./ExportSearchChip.component";

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
    chip: {
        margin: theme.spacing(2)
    },
    avatar: {},
    selectedAvatar: {
        backgroundColor: theme.palette.primary.dark
    },
    chips: {
        flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0.5),
    },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
    }
}));

const UsersList = (props) => {
    const setCurrentUserId = props.setCurrentUserId;
    const currentUserId = props.currentUserId;
    const users = props.users;
    const setUsers = props.setUsers;

    const [searchTerm, setSearchTerm] = useState("");

    const {t} = useTranslation();

    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const errorHandler = useErrorHandler();

    const classes = useStyles();

    const onChangeSearchTerm = (e) => {
        setSearchTerm(e.target.value);
    };

    function search() {

        UsersDataService
            .getAll({name: 'full_name', value: searchTerm}, page, ['id', 'full_name'])
            .then(...errorHandler({}))  // todo everywhere
            .then(function (res) {
                    setUsers(res["data"]);
                    setCount(res["_pagination"]["totalPages"]);
                });
    }

    useEffect(search, [page]);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    return (
        <Box className={classes.root}>
            <Box className={classes.box}>
                <SearchBar
                    label={t("users")}
                    value={searchTerm}
                    onChange={onChangeSearchTerm}
                    onSearch={search}
                />

                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}
                    >
                        <Typography className={classes.heading}>{t("filters_actions")}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box className={classes.chips}>
                            <ExportSearchChip
                                searchTerm={searchTerm}
                                page={page}
                                dataService={UsersDataService}
                            />
                            <ExportSearchChip
                                searchTerm={searchTerm}
                                page={page}
                                dataService={UsersDataService}
                                exportAll={true}
                            />
                        </Box>
                    </AccordionDetails>
                </Accordion>

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
                {users && users.map((user) => (
                    <div key={user["id"]}>
                        <ListItem key={user["id"]} button
                                  onClick={() => {
                                      setCurrentUserId(user['id']);
                                  }}>
                            <ListItemAvatar>
                                <Avatar className={user["id"] === currentUserId? classes.selectedAvatar: classes.avatar}>
                                    {user['full_name'].charAt(0).toUpperCase()}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText id="name" primary={user['full_name']}/>

                                <ListItemSecondaryAction>
                                    <Tooltip title={t("export") + " .csv"}>
                                    <IconButton edge="end" aria-label={t("export")} onClick={(e) => {
                                        UsersDataService
                                            .downloadOneCsv(user['id'])
                                            .then(...errorHandler({}));
                                    }}>
                                        <GetAppIcon/>
                                    </IconButton>
                                        </Tooltip>
                                </ListItemSecondaryAction>

                        </ListItem>
                        <Divider/>
                    </div>
                ))}
            </List>
        </Box>
    );
};

export default UsersList;
