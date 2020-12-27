import { Route, Redirect } from 'react-router-dom';
import React from "react";
import {userContext} from '../_context/user-context';

function PrivateRoute({ component: Component, ...rest }) {
    const userCtx = React.useContext(userContext);
    return (
        <Route {...rest} render={props =>
        {
          if (!userCtx["user"]["logged"]) {
            // not logged in so redirect to login page with the return url
            return <Redirect to={{ pathname: `${process.env.PUBLIC_URL}/login`, state: { from: props.location } }} />
            }

            // authorised so return component
            return <Component {...props} {...rest}/>
      }}/>
    );
}


export default PrivateRoute;