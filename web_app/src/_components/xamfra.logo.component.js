import React from 'react';
import Box from "@material-ui/core/Box";
import {themeContext} from "../_context/theme-context";
import {PUBLIC_URL, RECAPTCHA} from "../config";


export default function XamfraLogo() {
    const themeCtx = React.useContext(themeContext);


    return <Box mx={2} style={{textAlign: "left"}}>
    <img src={ `${PUBLIC_URL}/logo_xamfra_${themeCtx.label}.png`} alt="Logo Xamfrà"
         style={{height: "35px"}}/>
        </Box>
}