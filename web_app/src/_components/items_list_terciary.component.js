import React, {useState} from "react";
import {useErrorHandler} from "../_helpers/handle-response";
import ItemsList from "./items_list.component";
import {confirmContext} from "../_context/confirm-context";


const ItemsListTerciary = ({dataService, dataServiceSR, add_message, parent_id, onAdded = () => {}, ...props}) => {
    const errorHandler = useErrorHandler();
    const confirm = React.useContext(confirmContext);
    const [items, setItems] = useState([]);
    return <ItemsList
        secondaryAction={false}
        items={items}
        setItems={setItems}
        withFiltersBox={false}
        withAvatar={false}
        dataService={dataService}
        onItemClick={(id) => {
            confirm.confirm(add_message,null,  () => {
                dataServiceSR
                    .postWithId(parent_id, id)
                    .then(...errorHandler({snackbarSuccess: true}))
                    .then((newItem) => {
                        onAdded(id, newItem["data"]);
                    })
            });

        }
        }
        {...props}
    />
};

export default ItemsListTerciary;
