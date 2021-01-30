import {makeStyles} from "@material-ui/core/styles";
import createStyles from "@material-ui/styles/createStyles";
import React, {useEffect} from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import clsx from "clsx";
import IconButton from "@material-ui/core/IconButton";
import Drawer from "@material-ui/core/Drawer";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Tooltip from '@material-ui/core/Tooltip';
import ListItemText from "@material-ui/core/ListItemText";
import useTheme from "@material-ui/core/styles/useTheme";
import Routes from "./routes";
import {BrowserRouter, Link, Route} from "react-router-dom";
import {useTranslation} from "react-i18next";
import HomeToolbar from "../_components/toolbar.home.component";
import {useNeeds} from "../_helpers/needs";
import {
    Backdrop,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    useMediaQuery
} from "@material-ui/core";
import {loadingContext} from '../_context/loading-context';
import {confirmContext} from '../_context/confirm-context';
import {tabContext} from '../_context/tab-context';
import DialogContentText from "@material-ui/core/DialogContentText";
import Button from "@material-ui/core/Button";
import { useHistory } from "react-router-dom";

const drawerWidth = 240;
const useStyles = makeStyles(theme => (createStyles({
    root: {
        display: 'flex',
        height: '100vh'
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        background: theme.palette.neutral.main,
        color: theme.palette.neutral.emphasisText.medium,
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: 36,
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: theme.spacing(7) + 1,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9) + 1,
        },
    },backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
    },
    content: {
        display: 'flex',
        flexFlow: 'column',
        height: "100%",
        width: "100%",
        overflow: 'auto'
    },
    main: {
        flex: 1,
        padding: theme.spacing(3),
        overflow: 'auto'
    },
    icon: {
      '&': {
          color: theme.palette.neutral.emphasisText.medium,
      }
    },
    selectedIcon: {
      '&': {
          color: theme.palette.primary.main,
      }
    },
    grow: {
        flexGrow: 1,
    },
})));

const HomePage = (props) => {
    const theme = useTheme();
    const classes = useStyles();

    const { t } = useTranslation();

    const [open, setOpen] = React.useState(false);
    const [currentRoute, setCurrentRoute] = React.useState('/students');
    const [hasNeeds, NEEDS] = useNeeds();

    const handleDrawerOpen = () => {
        setOpen(true);
    };
    const handleDrawerClose = () => {
        setOpen(false);
    };

    const onItemClick = p => {
        setCurrentRoute(p.path);
    };

    const [loading, setLoading] = React.useState(false);
      const handleClose = () => {
        setLoading(false);
      };

      const [confirmDialog, setConfirmDialog] = React.useState({
          open: false,
          title: null,
          subtitle: null,
          success: () => {},
          cancel: () => {},
          args: []
      });
      const confirm = (title, subtitle, successCallable, cancelCallable=null, args=[]) => {
          setConfirmDialog(
              {
                open: true,
                title: title,
                subtitle: subtitle,
                success: successCallable,
                cancel: cancelCallable === null? () => {}: cancelCallable,
                  args: args
              }
          );
      }
      const handleCloseConfirm = () => {
          setConfirmDialog({...confirmDialog, open: false});
      }

      const routerRef = React.createRef();

    return (
        <div className={classes.root}>
            <CssBaseline/>
                <loadingContext.Provider value={{loading: loading, startLoading: () => {setLoading(true)}, stopLoading: () =>{setLoading(false)}}}>
                    <confirmContext.Provider value={{confirm: confirm}}>

                            <AppBar
                                position="fixed"
                                className={clsx(classes.appBar, {
                                    [classes.appBarShift]: open,
                                })}>
                                <HomeToolbar
                                    changeTheme={props.changeTheme}
                                    handleDrawerOpen={handleDrawerOpen}
                                    handleDrawerClose={handleDrawerClose}
                                    open={open}
                                />
                            </AppBar>
                            <BrowserRouter ref={routerRef} basename="/app/home">
                                <tabContext.Provider value={{currentTab: currentRoute, goTo: (res, id=null) => {
                                setCurrentRoute(res);
                                if (id === null) {
                                    routerRef.current.history.push(res);
                                } else {
                                    routerRef.current.history.push(`${res}?id=${id}`);
                                }
                            }}}>
                                <Drawer
                                    variant="permanent"
                                    className={clsx(classes.drawer, {
                                        [classes.drawerOpen]: open,
                                        [classes.drawerClose]: !open,
                                    })}
                                    classes={{
                                        paper: clsx({
                                            [classes.drawerOpen]: open,
                                            [classes.drawerClose]: !open,
                                        }),
                                    }}
                                >
                                    <div className={classes.toolbar}>
                                        <IconButton onClick={handleDrawerClose}>
                                            {theme.direction === 'rtl' ? <ChevronRightIcon/> : <ChevronLeftIcon/>}
                                        </IconButton>
                                    </div>
                                    <Divider/>
                                    <List>
                                        {Routes
                                            .filter(route => hasNeeds(route.needs))
                                            .map((prop) =>(
                                                  <ListItem key={prop.title} to={prop.path } button component={Link} onClick={() => onItemClick(prop)}>
                                                    <ListItemIcon className={prop.path === currentRoute? classes.selectedIcon: classes.icon}>
                                                        <Tooltip title={t(prop.title)} aria-label={t(prop.title)}>
                                                            {<prop.icon/>}
                                                        </Tooltip>
                                                    </ListItemIcon>
                                                    <ListItemText primary={t(prop.title)}/>
                                                </ListItem>
                                                ))}
                                    </List>
                                </Drawer>


                                <div className={classes.content}>
                                    <div className={classes.toolbar}/>
                                    <main className={classes.main}>
                                        {Routes
                                            .filter(route => hasNeeds(route.needs))
                                            .map((prop) => {
                                            return (
                                                <Route key={prop.title} path={prop.path} component={prop.component}/>)
                                        })}
                                    </main>
                                </div>
                                     </tabContext.Provider>
                            </BrowserRouter>

                    <Backdrop className={classes.backdrop} open={loading} onClick={handleClose}>
                    <CircularProgress color="inherit" />
                  </Backdrop>

                        <Dialog
        open={confirmDialog.open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        {confirmDialog.title &&
        <DialogTitle id="responsive-dialog-title">
            {t(confirmDialog.title)}
        </DialogTitle>
        }
        {confirmDialog.subtitle && <DialogContent>
            <DialogContentText>
                {t(confirmDialog.subtitle)}
            </DialogContentText>
        </DialogContent>}
        <DialogActions>
          <Button autoFocus onClick={() => {
              confirmDialog.cancel(...confirmDialog.args);
              handleCloseConfirm();
          }} color="primary">
              {t("cancel")}
          </Button>
          <Button onClick={() => {
              confirmDialog.success(...confirmDialog.args);
              handleCloseConfirm();
          }} color="primary" autoFocus>
              {t("continue")}
          </Button>
        </DialogActions>
      </Dialog>

                    </confirmContext.Provider>
            </loadingContext.Provider>
        </div>
    );
}

export default HomePage;