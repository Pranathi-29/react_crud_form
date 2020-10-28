import React from "react";
import ReactDOM from "react-dom";
import Main from "./ui.js";
import Master from "./master.js";
import FireCess from "./FireCess";
import { Component } from "react";
import { BrowserRouter, Route,Link, Switch } from "react-router-dom";

class App extends Component{
    render(){
        return(
        <div className="root">
        <BrowserRouter>
          <Switch>
          <Route exact path="/masters/:tenant/PropertyTax/FireCess" component={FireCess}/>
          <Route exact path="/masters/pb/tenant/tenants" component={Master} />
          <Route exact path='/' component={Main} />
           
          </Switch>
        </BrowserRouter>
      </div>
        );
    }
}

export default App