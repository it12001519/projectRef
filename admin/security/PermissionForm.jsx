import React, { Component, } from 'react';
//import classnames from 'classnames';
import {Button, Dropdown ,DropdownMenu, DropdownItem, DropdownToggle, Form, FormGroup, Label, Input} from 'reactstrap';
import { FormValidator } from 'js/universal/FormUtilities';


class PermissionForm extends Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.select = this.select.bind(this);
        this.state = {
            data: props.data,
            dropdownOpen: false,
            value: "Select"
        }
        // Bind functions
        this.handleCancel = this.handleCancel.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    toggle() {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

    select(event) {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen,
            value: event.target.innerText
        });
    }

    handleSecurityFormCancel() {
        if(typeof this.props.onCancel === 'function') {
            this.props.onCancel();
        }
    }

    handleCancel() {
      if (typeof this.props.onCancel === 'function') {
        this.props.onCancel();
      }
    }
  
    // Handler for form submit
    handleSubmit(e) {
      // Prevent legacy form post
      e.preventDefault();
  
      // Validate
      if (FormValidator.validateForm(e)) {
        // TODO place ajax POST / PUT stuff here...
        let isSuccess = true;
  
        if (typeof this.props.onSubmit === 'function') {
          this.props.onSubmit(this.state.data, isSuccess);
        }
      }
    }

    handleDelete() {
      // TODO place ajax DELETE stuff here...
      let isSuccess = true;
  
      if (typeof this.props.onSubmit === 'function') {
        this.props.onSubmit({}, isSuccess);
      }
    }

  
    // Handler for form change
    handleChange(e) {
      // Prevent legacy form post
      e.preventDefault();
  
      // Get field name and value from event
      const target = e.target;
      let value = target.type === 'checkbox' ? target.checked : target.value;
      const name = target.name;
  
      // Validate
      FormValidator.validateForm(e); 
  
      // Set state using function to granularly modify data
      this.setState((previousState) => {
        return previousState.data = { ...previousState.data, [name]: value };
      });
    }

    render() {
        return (
            <Form onSubmit={this.handleSubmit} autoComplete="off" noValidate>
                <FormGroup>
                    <Label for="newItem"> New: </Label>
                    <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                    <DropdownToggle caret>
                        {this.state.value}
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem onClick={this.select}> Role </DropdownItem>
                        <DropdownItem onClick={this.select}> Activity </DropdownItem>
                    </DropdownMenu>
                    </Dropdown>
                </FormGroup>
                <FormGroup>
                    <Label for="description"> Name: </Label>
                    <Input name="desc" value="" type="text" maxLength="100"/>
                </FormGroup>

                <Button type="submit" color="primary" className="mr-1"> Save </Button>
                <Button onClick={() => { if (window.confirm('Are you sure?')) this.handleDelete() }} color="danger" className="mr-1"> Delete </Button>

                <Button onClick={this.handleCancel} color="secondary" outline className="mr-1 float-right"> Close </Button>
            </Form>
        )
    }

}

export default PermissionForm;