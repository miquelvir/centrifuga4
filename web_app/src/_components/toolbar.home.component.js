import IconButton from "@material-ui/core/IconButton";
import clsx from "clsx";
import MenuIcon from "@material-ui/icons/Menu";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
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
import TranslateButton from "./translate_button.component";
import ThemeButton from "./theme_button.component";
import {DOCS_URL} from "../config";
import DescriptionIcon from '@material-ui/icons/Description';
import SchoolIcon from '@material-ui/icons/School';
import { withRouter } from "react-router";
import { useHistory } from "react-router-dom";
import FolderSharedIcon from '@material-ui/icons/FolderShared';
import TeacherDashboardButton from "./teacher_dashboard_button";

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
    grow: {
        flexGrow: 1,
    },
})));

export default withRouter(function HomeToolbar(props){
    let history = useHistory();
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
            {Object.keys(languageMap)?.map(key => (
              <MenuItem key={key} onClick={() => changeLanguage(key)}>{languageMap[key].label}</MenuItem>
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
                             authenticationService
                                 .logout()
                                 .then(...errorHandler({}))
                                 .then(() => {
                                     userCtx["setUser"]({logged: false, ping: false});
                                 });
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


                    <TeacherDashboardButton/>


                    <Tooltip title={t("docs")}>
                        <IconButton
                            color="inherit"
                            onClick={() => window.open(DOCS_URL, "_blank")}
                            aria-label={t("docs")}
                            aria-haspopup="false">
                            <DescriptionIcon/>
                        </IconButton>
                    </Tooltip>
                    <TranslateButton/>
                    <ThemeButton />


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
});
