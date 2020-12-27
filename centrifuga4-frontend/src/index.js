import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App/App';
import reportWebVitals from './reportWebVitals';
import { Helmet } from 'react-helmet';
import "./i18nextConf";

ReactDOM.render(
  <React.StrictMode>
      <head>
          <base href={`${process.env.PUBLIC_URL}/`}/>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
          <meta
              name="viewport"
              content="minimum-scale=1, initial-scale=1, width=device-width"/>
          <title>centrífuga4</title>
      </head>
      <Helmet>
          <title>centrífuga4</title>
      </Helmet>
      <App/>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
