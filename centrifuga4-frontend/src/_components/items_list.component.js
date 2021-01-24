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
import {Accordion, AccordionDetails, AccordionSummary, Chip, ListItemSecondaryAction} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import GetAppIcon from '@material-ui/icons/GetApp';
import Tooltip from "@material-ui/core/Tooltip";
import {useErrorHandler} from "../_helpers/handle-response";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import ExportSearchChip from "./ExportSearchChip.component";
import UsersDataService from "../_services/users.service";

const useStyles = makeStyles((theme) => ({
    root: {
        flex: 1,
        overflow: 'auto',
        display: "flex",
        flexDirection: "column"
    },
    list: {
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: '150px'
    },
    searchAndFilters: {
        display: "flex",
        flexDirection: "column",
    },
    pagination: {
        margin: theme.spacing(3)
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

const ItemsList = ({setCurrentItemId, currentItemId, items, setItems, displayNameField="full_name",
                       usableFilters=[], defaultSearchBy="full_name", searchByOptions=["full_name"],
                        dataService, searchBarLabel, exportPage=true, exportItem=true, exportAllPages=true}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState(usableFilters.reduce((map, f) => {
        map[f.name] = f.initialValue;
        return map;
        }, {})
    );
    const [searchBy, setSearchBy] = useState(defaultSearchBy);

    const {t} = useTranslation();

    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const errorHandler = useErrorHandler();

    const classes = useStyles();

    const onChangeSearchTerm = (e) => {
        setSearchTerm(e.target.value);
    };

    const resetSearchBy = () => {
        setSearchBy(defaultSearchBy);
    }

    function getFilters(){
        return Object.fromEntries(Object.entries(filters).filter(([k,v]) => (v !== null)))
    }

    function search() {
        dataService
            .getAll({name: searchBy, value: searchTerm}, page,
               [...new Set(['id', displayNameField])], getFilters())
            .then(...errorHandler({}))  // todo everywhere
            .then(function (res) {
                setItems(res["data"]);
                setCount(res["_pagination"]["totalPages"]);
            });
    }

    // we don't want the search to trigger for each searchTerm change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        setPage(1);
    }, [filters]);  // todo
    useEffect(search, [page, filters, searchBy]);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    return (
        <Box className={classes.root}>
            <Box className={classes.searchAndFilters}>
                <SearchBar
                    label={t(searchBarLabel)}
                    value={searchTerm}
                    onChange={onChangeSearchTerm}
                    onSearch={() => {
                        if (page === 1){
                            search();
                        } else {
                            setPage(1);  // search will be triggered
                        }

                    }}
                />

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                        <Typography className={classes.heading}>{t("filters_actions")}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box className={classes.chips}>

                            {exportPage && <ExportSearchChip
                                searchTerm={searchTerm}
                                page={page}
                                dataService={StudentsDataService}
                                getFilters={getFilters}
                            />}
                            {exportAllPages && <ExportSearchChip
                                searchTerm={searchTerm}
                                page={page}
                                dataService={StudentsDataService}
                                exportAll={true}
                                getFilters={getFilters}
                            />}

                            {searchByOptions.map(option => (
                                <Tooltip key={option} title={`${t("search_by")} ${t(option)}`}>
                                    <Chip size="small"
                                          color={searchBy === option ? "primary" : "default"}
                                          label={`${t("search_by")} ${t(option)}`}
                                          onClick={(e) => {
                                              if (searchBy === option) {
                                                  resetSearchBy();
                                              } else {
                                                  setSearchBy(option);
                                              }
                                          }}/>
                                </Tooltip>
                            ))}



                            {usableFilters.map(f => (
                                f['options'].map(option => (
                                    <Tooltip key={f.name+option.name}
                                        title={t(option.tooltip)}
                                        aria-label={t(option.tooltip)}>
                                    <Chip size="small"
                                          color={filters[f.name] === option.name ? "primary" : "default"}
                                          label={t(option.label)}
                                          onClick={(e) => {
                                              setFilters({...filters, [f.name]: (filters[f.name] === option.name)? null: option.name})
                                          }}/>
                                </Tooltip>
                                    )
                                )
                                ))
                            }
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
                {items && items.map((item) => (
                    <div key={item["id"]}>
                        <ListItem key={item["id"]} button
                                  onClick={() => {
                                      setCurrentItemId(item['id']);
                                  }}>
                            <ListItemAvatar>
                                <Avatar
                                    className={item["id"] === currentItemId ? classes.selectedAvatar : classes.avatar}>{item[displayNameField].charAt(0).toUpperCase()}</Avatar>
                            </ListItemAvatar>
                            <ListItemText id="name" primary={item[displayNameField]}/>

                            {exportItem &&
                            <ListItemSecondaryAction>
                                <Tooltip title={t("export") + " .csv"}>
                                    <IconButton edge="end" aria-label={t("export")} onClick={(e) => {
                                        dataService
                                            .downloadOneCsv(item['id'])
                                            .then(...errorHandler({}));
                                    }}>
                                        <GetAppIcon/>
                                    </IconButton>
                                </Tooltip>
                            </ListItemSecondaryAction>}

                        </ListItem>
                        <Divider/>
                    </div>
                ))}
            </List>
        </Box>
    );
};

export default ItemsList;
