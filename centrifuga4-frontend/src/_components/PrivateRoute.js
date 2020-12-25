import { Route, Redirect } from 'react-router-dom';
import React from "react";
import { authenticationService } from '../_services/auth.service';

function PrivateRoute({ component: Component, ...rest }) {
    return (
        <Route {...rest} render={props => {
        const currentUser = authenticationService.currentUserValue;
        if (!currentUser) {
            // not logged in so redirect to login page with the return url
            return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        }

        // authorised so return component
        return <Component {...props} {...rest}/>
    }} />
    );
}


export default PrivateRoute;