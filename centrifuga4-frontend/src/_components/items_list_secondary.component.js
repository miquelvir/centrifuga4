import React, {useEffect, useState} from "react";
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
import ItemsList from "./items_list.component";
import DeleteIcon from "@material-ui/icons/Delete";
import {NEEDS} from "../_helpers/needs";
import {confirmContext} from "../_context/confirm-context";


const ItemsListSecondary = ({dataService, parent_id, deleteTooltip, delete_message, onItemDeleted = () => {}, ...props}) => {
    const errorHandler = useErrorHandler();
    const confirm = React.useContext(confirmContext);
    const {t} = useTranslation();

    return <ItemsList
        secondaryAction={true}
        withFiltersBox={false}
        withAvatar={false}
        secondaryActionCallable={(id) => {
             confirm.confirm(delete_message, "not_undone", () => {
                dataService
                .delete(parent_id, id)
                .then(...errorHandler({snackbarSuccess:true}))
                .then(function (r) {
                    onItemDeleted(id);
                });
            });
        }}
        parent_id={parent_id}
        secondaryActionTooltip={deleteTooltip}
        secondaryActionNeeds={[NEEDS.delete]}
        secondaryActionIcon={<DeleteIcon/>}
        dataService={dataService}
        {...props}
    />
};

export default ItemsListSecondary;
