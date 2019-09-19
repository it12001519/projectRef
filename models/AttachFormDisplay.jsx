import React, { Component, } from 'react';
import {
  Row, Col, Button, Form, FormFeedback, FormGroup, Label, Input
} from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import Spinner from 'js/universal/spinner';
import Validator from 'validatorjs';
import 'whatwg-fetch';
import FetchUtilities from 'js/universal/FetchUtilities';

// Base URL
//const URL = "/attachsvc/edit/update"; 
const URL = "/attachsvc/edit/"; 

let rules_min = {
  description: ['required', 'max:140']
};
let rules_all = {
  description: ['required', 'max:140']
};
let messages = {
  'required': 'This field is required'
};

class AttachFormDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      validity: {},
      errors: {}, 
      showSpinner: true
    };

    // Bind functions
    this.validate = this.validate.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggleSpinner = this.toggleSpinner.bind(this);
    this.validateAndSaveChange = this.validateAndSaveChange.bind(this);
  }

  // Validator
  validate() {
    let validation;
    // Pick how we will validate the form, if start and end dates are not both filled up, don't validate for their range
    if (this.state.data.startDttm !== null && this.state.data.endDttm !== null) {
      validation = new Validator(this.state.data, rules_all, messages);
    } else {
      validation = new Validator(this.state.data, rules_min, messages);
    }
    validation.passes(); // Trigger validation

    let formValidity = {};
    let formErrors = {};
    Object.keys(this.state.data).forEach(field => {
      formValidity[field] = !validation.errors.has(field);
      formErrors[field] = validation.errors.has(field) ? validation.errors.first(field) : null;
    });

    this.setState({
      validity: formValidity,
      errors: formErrors
    });

    return validation.passes();
  }

  // Handler for form cancel
  handleCancel(e) {
    e.preventDefault();
    if (typeof this.props.onCancel === 'function') {
      this.props.onCancel();
    }
  }

  // Handler for form submit
  handleSubmit(e) {
    // Prevent legacy form post
    e.preventDefault();

    // Show the spinner
    this.toggleSpinner();

    // Validate
    var form = document.getElementById('formAttachment');
    if (this.validate(form)) {
      // Show the spinner
      this.toggleSpinner(); 

      // Set the form data to be submitted
      let formdata = {
        id: this.state.data.id,
        description: this.state.data.description
      };

      fetch(URL,
        {
          method: 'POST',
          body: JSON.stringify(formdata),
          headers: new Headers({
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
          }),
          credentials: 'include',
        })
        .then(FetchUtilities.checkStatusWithSecurity)
        .then((response) => {
          if (response.status !== 200) {
            throw response;
          }else{
            this.props.onCancel();
          }
          
          this.toggleSpinner(); 
          this.props.onSubmit('Attachment updated.', true);
          this.setState({
            formVisible: false
          });
        })
        .catch((error) => {
          FetchUtilities.handleError(error);
        })
    } else {
      // Hide the spinner
      this.toggleSpinner();
    }
  }

  // Toggles the visibility of the spinner
  toggleSpinner() {
      this.setState({ showSpinner: !this.state.showSpinner });
  }

  // Handler for form change
  handleChange(e) {
    
    // Prevent legacy form post
    e.preventDefault();

    // Get field name and value from event
    const target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.validateAndSaveChange(name, value);
  }

  // Handler for form change for date inputs
  validateAndSaveChange(name, value) {
    // Since we may be comparing this field to other fields, use the full form instead of just the one field
    let validation;
    if (value !== null) {
      validation = new Validator({ ...this.state.data, [name]: value }, rules_all, messages);
    } else {
      validation = new Validator({ ...this.state.data, [name]: value }, rules_min, messages);
    }
    validation.passes(); // Trigger validation

    // Set state using function to granularly modify data
    this.setState((previousState) => {
      previousState.data = { ...previousState.data, [name]: value };
      previousState.validity = { ...previousState.validity, [name]: !validation.errors.has(name) };
      previousState.errors = { ...previousState.errors, [name]: validation.errors.has(name) ? validation.errors.first(name) : null };

      return previousState;
    });
  }
  // Handles errors from the server
  handleError(error) {
    if (typeof this.props.onSubmit === 'function') {
      this.props.onSubmit(error.message, false);
    } else {
      alert('Error: ' + error.message);
    }
  } 

  componentDidMount() {
    this.setState({ showSpinner: false });
    if (!this.state.emptyForm) {
      this.validate();
    }
  }

  render() {
    return (
     <Form onSubmit={this.handleSubmit} id="formAttachment" noValidate>
        <Spinner showSpinner={this.state.showSpinner} />
        <Input name="id" value={this.state.data.id ? this.state.data.id : ''} type="hidden" />
        <Row>
          <Col md="2">
            <Label><b>Filename: </b></Label>
          </Col>
          <Col md="10">
            <Label>{this.state.data.fileName}</Label>
          </Col>
        </Row>
        <Row>
          <Col md="12">
            <hr />
          </Col>
        </Row>
        <Row>
          <Col md="12">
            <FormGroup>
              <Label for="description">Description</Label>
              <Input
                name="description"
                value={this.state.data.description ? this.state.data.description : ''}
                onChange={this.handleChange}
                type="textarea"
                required />
              <FormFeedback>{this.state.errors.description}</FormFeedback>
            </FormGroup>
          </Col>
        </Row>
        
        <Button color="secondary" outline onClick={(event) => this.handleCancel(event)} className="mr-1 float-right">Close</Button>
        <Button color="primary" className="mr-1 float-right" onClick={(event) => this.handleSubmit(event, false)}><FontAwesome name="pencil" />{' '}Edit</Button>
      </Form>
    )
  }
}

export default AttachFormDisplay;
