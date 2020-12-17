import {makeStyles} from "@material-ui/core/styles";
import createStyles from "@material-ui/styles/createStyles";
import React from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import clsx from "clsx";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Typography from "@material-ui/core/Typography";
import Drawer from "@material-ui/core/Drawer";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import Divider from "@material-ui/core/Divider";
import TranslateIcon from '@material-ui/icons/Translate';
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Tooltip from '@material-ui/core/Tooltip';
import ListItemText from "@material-ui/core/ListItemText";
import useTheme from "@material-ui/core/styles/useTheme";
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Routes from "../routes";
import {BrowserRouter, Route, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

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
        '&$focusVisible': {
        color: theme.palette.neutral.emphasisText.medium,
      },
      '&$selected': {
        color: theme.palette.neutral.emphasisText.high,
      },
      '&$disabled': {
        color: theme.palette.neutral.emphasisText.medium,
      },
      '&': {
          color: theme.palette.neutral.emphasisText.medium,
      }
    },
    grow: {
        flexGrow: 1,
    },
})));

const languageMap = {
  en: { label: "english", dir: "ltr", active: true },
  cat: { label: "català", dir: "ltr", active: false }
};


const Home = (props) => {
    const changeTheme = props.changeTheme;
    const classes = useStyles();

    const selected = localStorage.getItem("i18nextLng") || "en";
    const { t } = useTranslation();

    const [open, setOpen] = React.useState(false);
    const title = "centrífuga4";
    const theme = useTheme();

    const handleDrawerOpen = () => {
        setOpen(true);
    };
    const handleDrawerClose = () => {
        setOpen(false);
    };

    const [anchorEl, setAnchorEl] = React.useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    const onItemClick = title => () => {
        // setTitle(title);
    };
    const menuId = 'primary-search-account-menu';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            id={menuId}
            keepMounted
            transformOrigin={{vertical: 'top', horizontal: 'right'}}
            open={isMenuOpen}
            onClose={handleMenuClose}>
            <MenuItem onClick={handleMenuClose}>{t("log_out")}</MenuItem>
        </Menu>
    );

    const [anchorElLan, setAnchorElLan] = React.useState(null);
    const isLanguageMenuOpen = Boolean(anchorElLan);
    const handleLanguageMenuOpen = (event) => {
        setAnchorElLan(event.currentTarget);
    };
    const handleLanguageMenuClose = () => {
        setAnchorElLan(null);
    };
    const changeLanguage = (language) => {
        i18next.changeLanguage(language).then();
        handleLanguageMenuClose();
    }
    React.useEffect(() => {
        document.body.dir = languageMap[selected].dir;
      }, [anchorElLan, selected]);

    const languageMenuId = 'primary-language-select-menu';
    const languageMenu = (
        <Menu
            anchorEl={anchorElLan}
            anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            id={languageMenuId}
            keepMounted
            transformOrigin={{vertical: 'top', horizontal: 'right'}}
            open={isLanguageMenuOpen}
            onClose={handleLanguageMenuClose}>
            {Object.keys(languageMap)?.map(item => (
              <MenuItem key={item} onClick={() => changeLanguage(item)}>{languageMap[item].label}</MenuItem>
            ))}
        </Menu>
    );

    return (
        <div className={classes.root}>
            <CssBaseline/>
            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                })}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label={t("open_drawer")}
                        onClick={handleDrawerOpen}
                        edge="start"
                        className={clsx(classes.menuButton, {
                            [classes.hide]: open,
                        })}>
                        <MenuIcon/>
                    </IconButton>
                    <Typography variant="h6" noWrap>
                      {title}
                    </Typography>
                    <div className={classes.grow}/>

                    <Tooltip title={t("download_backup")}>
                        <IconButton
                            color="inherit"
                            aria-label={t("download_backup")}
                            onClick={() => changeTheme()}>
                            <CloudDownloadIcon/>
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={t("change_language")}>
                        <IconButton
                            color="inherit"
                            onClick={handleLanguageMenuOpen}
                            aria-label={t("change_language")}
                            aria-controls={languageMenuId}
                            aria-haspopup="true">
                            <TranslateIcon/>
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={t("dark_light_theme")}>
                        <IconButton
                            color="inherit"
                            aria-label={t("dark_light_theme")}
                            onClick={changeTheme}>
                            <Brightness4Icon/>
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={t("my_account")}>
                        <IconButton
                            color="inherit"
                            onClick={handleProfileMenuOpen}
                            aria-label={t("my_account")}
                            aria-controls={menuId}
                            aria-haspopup="true">
                            <AccountCircleIcon/>
                        </IconButton>
                    </Tooltip>

                </Toolbar>
            </AppBar>
            {renderMenu}
            {languageMenu}
            <BrowserRouter>
                <Drawer
                    variant="permanent"
                    onItemClick={onItemClick}
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
                        {Routes.map((prop, key) => {
                            return (
                                <ListItem button to={prop.path} component={Link} onClick={onItemClick(t(prop.title))}>
                                    <ListItemIcon className={classes.icon}>
                                        <Tooltip title={t(prop.title)} aria-label={t(prop.title)}>
                                            {<prop.icon/>}
                                        </Tooltip>
                                    </ListItemIcon>
                                    <ListItemText primary={t(prop.title)}/>
                                </ListItem>)
                        })}
                    </List>
                </Drawer>
                <main className={classes.content}>
                  <div className={classes.toolbar}/> {/* space placeholder */}
                    {Routes.map((prop, key) => {
                        return (
                            <Route exact path={prop.path} component={prop.component}/>)
                    })}
                </main>
            </BrowserRouter>
        </div>
    );
}

export default Home;