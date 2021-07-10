import React from "react";
import {useTranslation} from "react-i18next";
import GetAppIcon from '@material-ui/icons/GetApp';
import {useErrorHandler} from "../_helpers/handle-response";
import ItemsList from "./items_list.component";


const ItemsListMain = ({dataService, ...props}) => {
    const errorHandler = useErrorHandler();
    const {t} = useTranslation();


    return <ItemsList
        secondaryAction={true}
        secondaryActionCallable={(id) => {
            dataService
                .downloadOneCsv(id)
                .then(...errorHandler({}));
        }}
        secondaryActionTooltip={t("export") + " .csv"}
        secondaryActionIcon={<GetAppIcon/>}
        dataService={dataService}
        {...props}
    />
};

export default ItemsListMain;
