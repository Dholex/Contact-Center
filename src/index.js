import React from "react";
import ReactDOM from "react-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap-css-only/css/bootstrap.min.css";
//import "mdbreact/dist/css/mdb.css";
import "./assets/scss/mdb-pro.scss"
import "./index.css";

import registerServiceWorker from './registerServiceWorker';
import ContactCenter from "./ContactCenter";

ReactDOM.render( <ContactCenter /> , document.getElementById('root'));

registerServiceWorker();
