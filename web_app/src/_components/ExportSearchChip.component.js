import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {useTranslation} from "react-i18next";
import {Chip, CircularProgress} from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import Tooltip from "@material-ui/core/Tooltip";
import {useErrorHandler} from "../_helpers/handle-response";
import {themeContext} from "../_context/theme-context";
import {loadingContext} from "../_context/loading-context";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
}));

export default function ExportSearchChip({searchTermField="full_name", searchTerm=null, page=null, dataService, exportAll=false, getFilters=null}) {
  const classes = useStyles();

  const {t} = useTranslation();
  const errorHandler = useErrorHandler();
  const loadingCtx = React.useContext(loadingContext);

  return (
      <Tooltip title={t(exportAll ? "export_all_csv" : "export_results_csv")}
               aria-label={t(exportAll ? "export_all_csv" : "export_results_csv")}>

        <Chip variant="outlined"
              color="primary"
              size="small"
              disabled={loadingCtx.loading}
              avatar={<Avatar>csv</Avatar>}
              label={t(exportAll ? "export_all" : "export")}
              onClick={() => {
                if (loadingCtx.loading) return;

                loadingCtx.startLoading();
                dataService
                    .downloadCsv(searchTermField, searchTerm,
                        exportAll ? "*" : page,
                        getFilters === null ? {} : getFilters(),
                        exportAll)
                    .then(...errorHandler({}))
                    .finally(() => {
                      loadingCtx.stopLoading();
                    })
              }}/>
      </Tooltip>

  );
}