import React, { Component, } from 'react';
import classnames from 'classnames';
import {
  Row, Col, Button, Form, FormFeedback, FormGroup, Label, Input,
} from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import 'whatwg-fetch';
import FetchUtilities from 'js/universal/FetchUtilities';

// Base URL
const URL = "/attachsvc/edit/"; 

class AttachmentForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      description: ''
    };

    // Bind functions
    this.validate = this.validate.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggleSpinner = this.toggleSpinner.bind(this);
  }

  // Validator
  // TODO move into external function
  validate(e) {
    const form = e.target;
    const formLength = form.length;
    if (formLength !== undefined) {
      // Form validation - onSubmit
      let retValue = true;
      for (let i = 0; i < formLength; i++) {
        const elem = form[i];
        if (elem.nodeName.toLowerCase() !== 'button') {
          if (!elem.checkValidity()) {
            elem.className = classnames('form-control', { 'is-invalid': true });
            retValue = false;
          } else {
            elem.className = classnames('form-control', { 'is-valid': true });
          }
        }
      }
      return retValue;
    } else {
      // Single input validation - onChange
      const elem = e.target;
      if (elem.nodeName.toLowerCase() !== 'button') {
        if (!elem.checkValidity()) {
          elem.className = classnames('form-control', { 'is-invalid': true });
          return false;
        } else {
          elem.className = classnames('form-control', { 'is-valid': true });
          return true;
        }
      }
      return true;
    }
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
      // Set the form data to be submitted
      let formdata = {
        id: this.state.data.id || null,
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
          if (typeof this.props.onSubmit === 'function') {
              this.props.onSubmit('Attachment updated.', true);
          }
        })
        .catch((error) => {
          FetchUtilities.handleError(error);
        });
    } else {
      // Hide the spinner
      this.toggleSpinner();
    }
  }

  // Toggles the visibility of the spinner
  toggleSpinner() {
    if (typeof this.props.toggleSpinner === 'function') {
      this.props.toggleSpinner();
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
    this.validate(e);

    // Set state using function to granularly modify data
    this.setState((previousState) => {
      return previousState.data = { ...previousState.data, [name]: value };
    });
  }

  render() {
    return (
      <Form onSubmit={this.handleSubmit} autoComplete="off" id="formAttachment" noValidate>
        <Input
          name="id"
          value={this.state.data.id ? this.state.data.id : ''}
          type="hidden" />
        
        <Row>
          <Col md="2">
            <Label><b>Filename: </b></Label>
          </Col>
          <Col md="10">
            <Label>{this.state.data.fileName}</Label>
          </Col>
        </Row>
        <Row>
          <Col md="2">
            <Label><b>Location: </b></Label>
          </Col>
          <Col md="10">
            <Label>{this.state.data.location}</Label>
          </Col>
        </Row><Row>
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
                type="textarea" maxLength="140"
                required />
              <FormFeedback>Maximum of 140 characters</FormFeedback>
            </FormGroup>
          </Col>
        </Row>
        
        <Button color="secondary" outline onClick={(event) => this.handleCancel(event)} className="mr-1 float-right">Close</Button>
        <Button color="primary" className="mr-1 float-right" onClick={(event) => this.handleSubmit(event, false)}><FontAwesome name="pencil" />{' '}Edit</Button>
      </Form>
    )
  }
}

export default AttachmentForm;
