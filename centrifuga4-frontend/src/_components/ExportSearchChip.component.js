import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import {useTranslation} from "react-i18next";
import {Chip} from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import UsersDataService from "../_services/users.service";
import Tooltip from "@material-ui/core/Tooltip";
import {useErrorHandler} from "../_helpers/handle-response";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  }
}));

export default function ExportSearchChip({searchTerm=null, page=null, dataService, exportAll=false, getFilters=null}) {
  const classes = useStyles();

  const { t } = useTranslation();
  const errorHandler = useErrorHandler();

  return (
    <Tooltip title={t(exportAll? "export_all_csv": "export_results_csv")}
             aria-label={t(exportAll? "export_all_csv": "export_results_csv")}>
        <Chip variant="outlined"
              color="primary"
              size="small"
              avatar={<Avatar>csv</Avatar>}
              label={t(exportAll? "export_all": "export")}
              onClick={() => {
                  dataService
                    .downloadCsv(searchTerm,
                        exportAll? "*": page,
                        getFilters === null? {}: getFilters(),
                                exportAll)
                    .then(...errorHandler({}))

              }}/>
    </Tooltip>
  );
}