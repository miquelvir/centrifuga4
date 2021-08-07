import React from "react";
import {useTranslation} from "react-i18next";
import {useErrorHandler} from "../_helpers/handle-response";
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
