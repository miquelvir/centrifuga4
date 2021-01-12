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
import LoadingBackdrop from "./loadingBackdrop.component";
import {useErrorHandler} from "../_helpers/handle-response";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";

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

const StudentsList = (props) => {
    const setCurrentStudentId = props.setCurrentStudentId;
    const currentStudentId = props.currentStudentId;
    const students = props.students;
    const setStudents = props.setStudents;

    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        onlyEnrolled: false,
        onlyEarlyUnenrolled: false,
        onlyPreEnrolled: false,
        onlyCash: false,
        onlyBankTransfer: false,
        onlyDirectDebit: false
    });

    const {t} = useTranslation();

    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const errorHandler = useErrorHandler();

    const classes = useStyles();

    const [loading, setLoading] = useState(false);  // todo

    const onChangeSearchTerm = (e) => {
        setSearchTerm(e.target.value);
    };

    function getFilters(fs){
        let myFilters = {};

        if (fs.onlyEnrolled) {
            myFilters['enrollment_status'] = 'enrolled';
        } else if (fs.onlyEarlyUnenrolled) {
            myFilters['enrollment_status'] = 'early-unenrolled';
        } else if (fs.onlyPreEnrolled) {
            myFilters['enrollment_status'] = 'pre-enrolled'
        }

        if (fs.onlyCash) {
            myFilters['default_payment_method'] = 'cash';
        } else if (fs.onlyBankTransfer) {
            myFilters['default_payment_method'] = 'bank-transfer';
        } else if (fs.onlyDirectDebit) {
            myFilters['default_payment_method'] = 'bank-direct-debit';
        }

        return myFilters;
    }

    function search() {

        StudentsDataService
            .getAll({name: 'full_name', value: searchTerm}, page, ['id', 'full_name'], getFilters(filters))
            .then(...errorHandler({}))  // todo everywhere
            .then(function (res) {
                    setStudents(res["data"]);
                    setCount(res["_pagination"]["totalPages"]);
                });
    }

    useEffect(search, [page, setStudents, filters]);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    function exportCsv() {
        setLoading(true);  // todo clean this and the loading background
        StudentsDataService
            .downloadAllCsv(searchTerm, page, getFilters(filters))
            .finally(()=>{
                setLoading(false);
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

                    <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography className={classes.heading}>{t("filters_actions")}</Typography>
        </AccordionSummary>
        <AccordionDetails><Box className={classes.chips}>
          <Tooltip title={t("export_results_csv")} aria-label={t("export_results_csv")}>
                        <Chip variant="outlined"
                              color="primary"
                              size="small"
                              avatar={<Avatar>csv</Avatar>}
                              label={t("export")}
                              onClick={exportCsv}/>
                        </Tooltip>

                    { [{label: "enrolled", tooltip: "only_enrolled", value: 'onlyEnrolled'},
                        {label: "pre-enrolled", tooltip: "only_preenrolled", value: 'onlyPreEnrolled'},
                        {label: "early-unenrolled", tooltip: "only_earlyunenrolled", value: 'onlyEarlyUnenrolled'},
                    {label: "cash", tooltip: "only_cash", value: 'onlyCash'},
                    {label: "bank-transfer", tooltip: "only_banktransfer", value: 'onlyBankTransfer'},
                    {label: "bank-direct-debit", tooltip: "only_bankdirectdebit", value: 'onlyDirectDebit'}].map(x => (
                            <Tooltip key={x.label} title={t(x.tooltip)} aria-label={t(x.tooltip)}>
                                <Chip size="small"
                                      color={filters[x.value]? "primary": "normal"}
                                      label={t(x.label)}
                                      onClick={(e) => {
                                          let newFilters = {...filters};
                                          if (x.value === 'onlyEnrolled' ||
                                              x.value === 'onlyPreEnrolled' ||
                                              x.value === 'onlyEarlyUnenrolled'
                                          ) {
                                              newFilters['onlyEnrolled'] = false;
                                              newFilters['onlyPreEnrolled'] = false;
                                              newFilters['onlyEarlyUnenrolled'] = false;
                                          }

                                          if (x.value === 'onlyBankTransfer' ||
                                              x.value === 'onlyCash' ||
                                              x.value === 'onlyDirectDebit'
                                          ) {
                                              newFilters['onlyBankTransfer'] = false;
                                              newFilters['onlyCash'] = false;
                                              newFilters['onlyDirectDebit'] = false;
                                          }

                                          newFilters[x.value] = !filters[x.value];
                                          setFilters(newFilters);
                                      }}/>
                            </Tooltip>
                    ))}

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

                                <ListItemSecondaryAction>
                                    <Tooltip title={t("export") + " .csv"}>
                                    <IconButton edge="end" aria-label={t("export")} onClick={(e) => {
                                        StudentsDataService
                                            .downloadOneCsv(student['id'])
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

export default StudentsList;
