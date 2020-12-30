import IconButton from "@material-ui/core/IconButton";
import clsx from "clsx";
import MenuIcon from "@material-ui/icons/Menu";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import TranslateIcon from "@material-ui/icons/Translate";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import Toolbar from "@material-ui/core/Toolbar";
import React, {useContext} from "react";
import {useTranslation} from "react-i18next";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import i18next from "i18next";
import {makeStyles} from "@material-ui/core/styles";
import createStyles from "@material-ui/styles/createStyles";
import {userContext} from "../_context/user-context";
import {authenticationService} from "../_services/auth.service";
import {useErrorHandler} from "../_helpers/handle-response";

const languageMap = {
    eng: { label: "english", dir: "ltr", active: true },
    cat: { label: "català", dir: "ltr", active: false }
};

const useStyles = makeStyles(theme => (createStyles({
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
    },
    icon: { // TODO
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

export default function HomeToolbar(props){
    const changeTheme = props.changeTheme;
    const classes = useStyles();
    const errorHandler = useErrorHandler();

    const selected = localStorage.getItem("i18nextLng") || "eng";
    const { t } = useTranslation();

    const title = "centrífuga4";

    const [anchorEl, setAnchorEl] = React.useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const handleProfileMenuOpen = (event, ) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

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
        console.log(languageMap, selected);
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

    const userCtx = useContext(userContext);


    const userMenuId = 'primary-search-account-menu';
    const userMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            id={userMenuId}
            keepMounted
            transformOrigin={{vertical: 'top', horizontal: 'right'}}
            open={isMenuOpen}
            onClose={handleMenuClose}>


                     <MenuItem
                         onClick={(event) => {
                             userCtx["setUser"]({logged: false});
                             authenticationService.logout().then(...errorHandler({})).then();
                             handleMenuClose(event);
                         }}>
                         {t("log_out")}
                     </MenuItem>


        </Menu>
    );

    return (
    <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label={t("open_drawer")}
                        onClick={props.handleDrawerOpen}
                        edge="start"
                        className={clsx(classes.menuButton, {
                            [classes.hide]: props.open,
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
                            aria-controls={userMenuId}
                            aria-haspopup="true">
                            <AccountCircleIcon/>
                        </IconButton>
                    </Tooltip>


        {languageMenu}
        {userMenu}
                </Toolbar>
    )
};
