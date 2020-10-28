import React from "react";
import Admin from "react-crud-admin";
import Form from "react-jsonschema-form";
import axios from "axios";
import Select from 'react-select';
import Master from "./master.js";

import { BrowserRouter, Route,Link, Switch } from "react-router-dom";

import "react-crud-admin/css"; //optional css import
const _ = require("lodash");
function paginate(array, page_size, page_number) {
  // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
  return array.slice((page_number - 1) * page_size, page_number * page_size);
}


export default class Main extends Admin {
  constructor() {
    super();
   
    
    this.name = "Tenant";
    this.name_plural = "Tenants";
    this.list_display_links = ["master"];
    this.list_display = ["master","moduleName",  "tenantId"];
   
    this.list_per_page = 10;
  
    
    this.showMaster=false;
    this.state.filterVal=false;
  }
  

  get_queryset(page_number, list_per_page, queryset) {


    axios.get("/masters",{
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
      console.log(typeof(response.data));
      console.log(response.data);
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
    axios.post("/masters/pb/tenant/tenants/add", {
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
    axios.post("/masters/pb/tenant/tenants/update", {
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

        axios.post("/masters/pb/tenant/tenants/delete", {
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

  _handle_filter_change(values) {
    if (!(values instanceof Array) && values != null) {
      values = [values];
    }
 
    this.setState({ filter_values: values || [] });
 
    if (values == null || values.length <= 0) {
      this.set_queryset(
        this.get_queryset(
          this.state.page_number,
          this.get_list_per_page(),
          this.state.queryset
        )
      );
      return;
    }
 
    let filters = this.get_filters();
    for (let value of values) {
      let filtered_queryset = filters[value._filter_].filter_function(
        value,
        this.state.queryset
      );
      this.setState({ queryset: filtered_queryset,
      filterVal:true});
    }
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

_get_table_body() {
  return this._get_ordered_queryset().map((object, i) => {
    return (
      <tr key={"row-" + i}>
        <td>
          {" "}
          <input
            type="checkbox"
            id={i + "_checkbox"}
            onChange={this._select_one(object)}
            checked={this.state.selected_objects.contains(object)}
          />{" "}
          <label htmlFor={i + "_checkbox"}>&nbsp;</label>{" "}
        </td>
        {this.get_list_display().map(item => {
          return (
            <td key={item}>
            
              {" "}
              {this.get_list_display_links().find(a => {
                return item == a;
              })
                ? this._create_object_link(
                    object,
                    this._display_field(object, item)
                  )
                : this._display_field(object, item)}{" "}
            </td>
          );
        })}
      </tr>
    );
  });
}


_create_object_link(object, label) {
  //this.setState({ viewMaster: false });
  if (this.has_change_permission(object)) {
    return (
      /*<a href={object.tenantId.split('.').pop()+"/"+object.moduleName+"/"+object.master}>
       <a onClick={this._object_link_clicked(object)} href="#"> */
        <a href={"masters/"+object.tenantId.split('.').pop()+"/"+object.moduleName+"/"+object.master}>
        {" "}
        {label}{" "}
      </a>  
       
      
      
      

      
    );
  } else {
    return <span> {label} </span>;}
  }
  _get_table_body() {
    return this._get_ordered_queryset().map((object, i) => {
      return (
        <tr key={"row-" + i}>
          <td>
            {" "}
            <input
              type="checkbox"
              id={i + "_checkbox"}
              onChange={this._select_one(object)}
              checked={this.state.selected_objects.contains(object)}
            />{" "}
            <label htmlFor={i + "_checkbox"}>&nbsp;</label>{" "}
          </td>
          {this.get_list_display().map(item => {
            return (
              <td key={item}>
                {" "}
                {this.get_list_display_links().find(a => {
                  return item == a;
                })
                  ? this._create_object_link(
                      object,
                      this._display_field(object, item)
                    )
                    
                  : this._display_field(object, item)}{" "}
              </td>
            );
          })}
        </tr>
      );
    });
  }
  componentDidMount(){
    axios.get("/schema/PropertyTax/FireCess",{
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    
    }).then(response => {
    
      console.log(typeof(response.data));
      console.log(response.data);
      this.schema=response.data;
      
    });
  }

  get_form(object = null) {

    // TODO:
    // read params tenantId, module, master
    // load schema using API for tenantId, module and master
    // use that schema for editing

  
    if (!object) {
      return <Form schema={this.schema} onSubmit={this.form_submit.bind(this)} />;
    } else {
      console.log("return form with data", object);
      return <Form schema={this.schema} formData={object} onSubmit={this.form_submit.bind(this)} />;
    } 
  }
  _handleClick() {
    this.setState({
      showMaster: true,
    });
  }
  render() {
    if (!this.has_module_permission()) {
      return this.render_permission_denied();
    }
    return <div id="react-crud-admin">{this.render_list_page()}</div>;

    
  }

}