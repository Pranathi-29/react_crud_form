import React from "react";
import Admin from "react-crud-admin";
import Form from "react-jsonschema-form";
import axios from "axios";
import Select from 'react-select';
import Master from "./master.js";

import { BrowserRouter, Route,Link, Switch, useParams } from "react-router-dom";

import "react-crud-admin/css"; //optional css import
const _ = require("lodash");

let path=""
function paginate(array, page_size, page_number) {
  // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
  return array.slice((page_number - 1) * page_size, page_number * page_size);
}


export default class FireCess extends Admin {
  constructor(props) {
    super();
   
    
    this.name = "Tenant";
    this.name_plural = "Tenants";
    this.list_display_links = ["rate"];
    this.list_display = ["rate","fromFY"];
   
    this.list_per_page = 10;
  
    //const t=this.prop.match.params.tenant;
    //console.log(this.t);
    path=props.location.pathname
    console.log(props.location.pathname)
   
    console.log(typeof(path))

  
  }
  

  get_queryset(page_number, list_per_page, queryset) {
    console.log(path)
    axios.get(path,{
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    
    }).then(response => {

      /* let data = paginate(response.data, list_per_page, page_number)
      this.set_queryset(data);
      this.set_total(response.data.length);
      this.pages_in_pagination = response.data.length / list_per_page;
      console.log("You is amazee!"); */
      //log(typeof(response.data));
      //console.log(response.data);
      this.set_queryset(response.data);

    });

    return queryset;


  }

  form_submit(form) {
    let tenant = form.formData;

    if (form.edit) {
      console.log("This is a edit", tenant)
      this.state.queryset.splice(this.state.queryset.indexOf(this.state.object), 1, tenant);

      //var ind=this.state.queryset.indexOf(this.state.object);
      //console.log(ind);
      this.response_change(tenant);
    }
    else {

      this.response_add(tenant);
    }
  }


  response_add(d) {
    console.log(d);
    axios.post(path+"/add", {
      headers: {
        'Content-Type': 'application/json'
      },
      body: d
    }).then(response => {


      this.set_queryset(response.data);

      console.log(typeof (response.data));
      console.log(response.data);

    });

    this.setState({
      object: null,
      queryset: this.get_queryset(this.state.page_number, this.list_per_page, this.state.queryset)
    });
  }

  response_change(d) {
    console.log(d);
    axios.post(path+"/update", {
      headers: {
        'Content-Type': 'application/json'
      },
      body: d
    }).then(response => {


      this.set_queryset(response.data);

      console.log(typeof (response.data));
      console.log(response.data);

    });
    this.setState({
      object: null,
      queryset: this.get_queryset(this.state.page_number, this.list_per_page, this.state.queryset)
    });
  }

  get_actions() {
    return {
      "delete": (selected_objects) => {
        console.log(selected_objects);

        axios.post(path+"/delete", {
          headers: {
            'Content-Type': 'application/json'
          },
          body: selected_objects
        }).then(response => {


          this.set_queryset(response.data);
          console.log(typeof (response.data));
          console.log(response.data);

        })


        //this.set_queryset(this.get_queryset());
        this.setState({

          queryset: this.get_queryset(this.state.page_number, this.list_per_page, this.state.queryset)
        });

      }
    }

  }
  render_list_view() {
    return (
      <div>
        {this.render_add_button()}
        {this.render_below_add_button()}
        {this.render_search_field()}
        {this.render_below_search_field()}
        {this.render_actions()}
        {this.render_below_actions()}
        {this.render_filters()}
        {this.render_below_filters()}
        {this.render_table()}
        {this.render_add_button()}
        {this.render_below_table()}
        {this.render_progress(this.state.loading)}
        {this.render_below_progress()}
        {this.render_pagination()}
      </div>
    );
  }
  action_selected(event) {
    let action = event.target.value;
 
    console.log(this.state.selected_objects.getItems());
    this.get_actions()[action](this.state.selected_objects.getItems());
    this.get_queryset(this.state.page_number, this.get_list_per_page());
  }

  
  render_actions() {
    
    return (
      <select
        className="ra-action-button"
        onChange={this.action_selected.bind(this)}
        defaultValue={""}
        value=""
         
      >
        <option key="key" selected value="" disabled={true}>
          Choose an action
        </option>
        {_.keys(this.get_actions()).map(action => {
          return (
            <option key={action} value={action}>
              {" "}
              {_.startCase(action)}
            </option>
            
          );
        })}
      
      </select>
    );
    
  }



  get_filters()
{
  
  
  return {
    
    by_master_name: {
       options: [
        { value: "FireCess", label: "FireCess" },
        { value: "boundary-data", label: "boundary-data" }
      ], 
      filter_function: (option, queryset) => {
        let grouped = _.groupBy(queryset, "master");

        return _.has(grouped, option.value) ? grouped[option.value] : [];
      }
    },
     by_module_name: {
      options: [
        { value: "PropertyTax", label: "PropertyTax" },
        { value: "egov-location", label: "egov-location" }
      ],
      filter_function: (option, queryset) => {
        let grouped = _.groupBy(queryset, "moduleName");

        return _.has(grouped, option.value) ? grouped[option.value] : [];
      }
    } 
    
  };
}


 
  componentDidMount(){
    axios.get("/schema/PropertyTax/FireCess",{
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    
    }).then(response => {
    
      //console.log(typeof(response.data));
      //console.log(response.data);
      this.schema=response.data;
      
    });
  }

  get_form(object = null) {

  
    if (!object) {
      return <Form schema={this.schema} onSubmit={this.form_submit.bind(this)} />;
    } else {
      console.log("return form with data hmmmmmm", object);
      return <Form schema={this.schema} formData={this.object} onSubmit={this.form_submit.bind(this)} />;
    } 
  }
 

}