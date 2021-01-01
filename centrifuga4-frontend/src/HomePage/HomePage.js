import {makeStyles} from "@material-ui/core/styles";
import createStyles from "@material-ui/styles/createStyles";
import React from "react";
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
import {history} from "../_helpers/history";

const drawerWidth = 240;
const useStyles = makeStyles(theme => (createStyles({
    root: {
        display: 'flex',
        height: '100%'
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
        flexGrow: 1,
        padding: theme.spacing(3),
        height: "100%"
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
    const [currentRoute, setCurrentRoute] = React.useState('/');

    const handleDrawerOpen = () => {
        setOpen(true);
    };
    const handleDrawerClose = () => {
        setOpen(false);
    };

    const onItemClick = p => {
        setCurrentRoute(p.path);
    };

    return (
        <div className={classes.root}>
            <CssBaseline/>
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
            <BrowserRouter history={history} basename={`${process.env.PUBLIC_URL}/`}>
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
                        {Routes.map((prop) =>(
                                  <ListItem  key={prop.title} button to={prop.path} component={Link} onClick={() => onItemClick(prop)}>
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
                <main className={classes.content}>
                    <div className={classes.toolbar}/>
                    {Routes.map((prop, key) => {
                        return (
                            <Route key={prop.title} exact path={prop.path} component={prop.component}/>)
                    })}
                </main>
            </BrowserRouter>
        </div>
    );
}

export default HomePage;