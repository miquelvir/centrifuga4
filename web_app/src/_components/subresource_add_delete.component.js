import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import React, {useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import AddCircleIcon from '@material-ui/icons/AddCircle';
import {
    AppBar,
    Dialog,
    Slide
} from "@material-ui/core";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import {IconButtonSkeleton} from "../_skeletons/iconButton";
import {useNeeds} from "../_helpers/needs";
import ItemsListSecondary from "./items_list_secondary.component";
import ItemsListTerciary from "./items_list_terciary.component";
import Skeleton from "@material-ui/lab/Skeleton";
import {tabContext} from "../_context/tab-context";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


const useStyles = makeStyles((theme) => ({
  list: {
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        flex: 1
    },
    box: {
        display: "flex",
        flexDirection: "column",
    },
    pagination: {
        margin: '30px'
    },
    appBar: {
    position: 'relative',
  },
  newLine: {
    width: '100%',
       marginTop: theme.spacing(1),
        display: "flex",
    flexDirection: "column"
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  }, actionIcon: {
      float: 'right'
    }
}));


function AddDeleteSubresource({  defaultSearchBy, displayText, auxFields, parentItemDataService, itemDataService, add_message_confirm, parent_id, secondaryDisplayNameField, searchByOptions, resourceName, displayNameField, add_message,onSubresourceAdded, onSubresourceDeleted, ...other}) {
  const { t } = useTranslation();
  const classes = useStyles();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const handleAddDialogClose = () => {
        setAddDialogOpen(false);
  };
  const handleAddDialogOpen = () => {
      setAddDialogOpen(true);
  }

   const [hasNeeds, NEEDS] = useNeeds();
  const loading = parent_id === null;
  const [items, setItems] = useState([]);
const navigator = React.useContext(tabContext);

  return (

        <Box p={3}>  {// todo simplify everywhere
        } <Box px={2}>

            <Dialog fullScreen open={addDialogOpen} onClose={handleAddDialogClose} TransitionComponent={Transition}>
        <AppBar className={classes.appBar} color="secondary">
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
                {t(add_message)}
            </Typography>
            <Button autoFocus color="inherit" onClick={handleAddDialogClose}>
                {t("cancel")}
            </Button>
          </Toolbar>
        </AppBar>
        <Box className={classes.box} m={3}>
            <ItemsListTerciary
                    dataService={itemDataService}
                    dataServiceSR={parentItemDataService}
                    defaultSearchBy={defaultSearchBy}
                    searchByOptions={searchByOptions}
                    searchBarLabel={resourceName}
                    displayNameField={displayNameField}
                    secondaryDisplayNameField={secondaryDisplayNameField}
                    parent_id={parent_id}
                    add_message={add_message_confirm}
                    onAdded={(id, body) => {
                        setItems([...items, body]);
                        onSubresourceAdded(id);
                        handleAddDialogClose();
                    }}
                />
            </Box>
          </Dialog>

              {loading?
                  <IconButtonSkeleton className={classes.actionIcon}/>
              :
              hasNeeds([NEEDS.post]) && <Tooltip className={classes.actionIcon} title={t(add_message)} aria-label={t(add_message)}>
                <IconButton onClick={handleAddDialogOpen}>
                  <AddCircleIcon />
                </IconButton>
              </Tooltip>
              }


              <div className={classes.newLine}>
                  {loading?
                      <Skeleton width="100%" height="250px"/>
                  :
                <ItemsListSecondary
                    dataService={parentItemDataService}
                    defaultSearchBy={defaultSearchBy}
                    searchByOptions={searchByOptions}
                    items={items}
                    setItems={setItems}
                    displayText={displayText}
                    auxFields={auxFields} 
                    searchBarLabel={resourceName}
                    displayNameField={displayNameField}
                    parent_id={parent_id}
                    deleteTooltip={"delete"}
                    delete_message={t("delete") + " " + t(resourceName)}
                    onItemDeleted={(id) => {
                        setItems(items.filter(x => x.id !== id));
                        onSubresourceDeleted(id);
                    }}
                    onItemClick={(id) => {
                        navigator.goTo(resourceName, id);
                    }}
                />}
              </div>
            </Box>
        </Box>

  );
}

export default AddDeleteSubresource;
