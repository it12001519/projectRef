import React, { Component, } from 'react';
import classnames from 'classnames';
import { Row, Col, Badge, Button, Form, FormFeedback, FormGroup, FormText, Label, Input, } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'whatwg-fetch';
import FetchUtilities from 'js/universal/FetchUtilities';
import Validator from 'validatorjs';
import Required from "js/universal/Required";
import { ConfirmDeleteModal, } from 'js/universal/Modals';

// Base URL
const URL_DELETE = "/api/v1/announcements/";
const URL_SUBMIT = "/api/v1/announcements-submit/";

let rules_min = {
  teaser: ['required', 'max:140'],
  startDttm: ['date'],
  endDttm: ['date']
};
let rules_all = {
  teaser: ['required', 'max:140'],
  startDttm: ['date', 'before_or_equal:endDttm'],
  endDttm: ['date', 'after_or_equal:startDttm']
};
let messages = {
  'required': 'This field is required',
  'before_or_equal.startDttm': 'Start date should be before or the same as the end date',
  'after_or_equal.endDttm': 'End date should be after or the same as the start date'
};

class AnnouncementForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      validity: {},
      errors: {},
      emptyForm: props.data.status === 'NEW',
      nestedModal: false
    };

    // Bind functions
    this.validate = this.validate.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.validateAndSaveChange = this.validateAndSaveChange.bind(this);
    this.handleError = this.handleError.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleSpinner = this.toggleSpinner.bind(this);
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
    for (let field in this.state.data) {
      formValidity[field] = !validation.errors.has(field);
      formErrors[field] = validation.errors.has(field) ? validation.errors.first(field) : null;
    }

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
  handleSubmit(e, doPublish) { 
    // Prevent legacy form post
    e.preventDefault();

    // Validate
    if (this.validate()) {
      // Show the spinner
      this.toggleSpinner(); 

      // Set the form data to be submitted
      let formdata = {
        id: this.state.data.id || null,
        teaser: this.state.data.teaser,
        status: this.state.data.status,
        startDttm: !!this.state.data.startDttm ? moment(this.state.data.startDttm).format("YYYY-MM-DD") : null,
        endDttm: !!this.state.data.endDttm ? moment(this.state.data.endDttm).format("YYYY-MM-DD") : null,
        message: this.state.data.message,
      };

      // If this is a new announcement, set the status to DRAFT
      if (this.state.emptyForm) {
        formdata.status = 'DRAFT';
      }

      // If the status is already published, mark it as EDITED
      if (formdata.status === 'PUBLISHED') {
        formdata.status = 'EDITED';
      }

      // If the user wants to publish, update the status
      if (doPublish) {
        formdata.status = 'PUBLISHED';
      }

      FetchUtilities.fetchPost(URL_SUBMIT, formdata,
        (httpStatus, response) => {
          if (httpStatus === 200 || httpStatus === 201) {
            if (typeof this.props.onSubmit === 'function') {
              if (this.state.emptyForm) {
                this.props.onSubmit('Announcement added.', true);
              } else {
                this.props.onSubmit('Announcement updated.', true);
              }
            }
          } else if (httpStatus === 400) {
            let formValidity = {};
            let formErrors = {};
            this.toggleSpinner(); 
            Object.keys(response.errorDetails).forEach(field => {
              formValidity[field.key] = false;
              formErrors[field.key] = field.value;
            });
            this.setState({
              validity: formValidity,
              errors: formErrors
            });
          } else {
            throw new Error('Transaction failed')
          }
        }, _=> this.toggleSpinner()
      )
    }
  }

  // Handler for form delete
  handleDelete(e, id) {
    e.preventDefault();

    // Show the spinner
    this.toggleSpinner();

    this.toggleModal(e);
    FetchUtilities.fetchDelete(URL_DELETE + id, 
        (httpStatus, response) => {
          if (httpStatus === 200)
            this.props.onSubmit('Announcement permanently deleted.', true)
          else
            throw new Error('Transaction failed')
        }, _=> this.toggleSpinner()
    ) 
  }

  // Toggles the delete confirmation modal
  toggleModal(e) {
    e.preventDefault();
    this.setState({
      nestedModal: !this.state.nestedModal
    });
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

    this.validateAndSaveChange(name, value);
  }

  // Handler for form change for date inputs
  validateAndSaveChange(name, value) {
    // Since we may be comparing this field to other fields, use the full form instead of just the one field
    let validation;
    if (((this.state.data.startDttm !== null &&  name === 'endDttm') ||
         (this.state.data.endDttm !== null &&  name === 'startDttm') )
        && value !== null) {
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

      // Special rule: always update validation of start and end dates
      previousState.validity = { ...previousState.validity, 'startDttm': !validation.errors.has('startDttm') };
      previousState.validity = { ...previousState.validity, 'endDttm': !validation.errors.has('endDttm') };
      previousState.errors = { ...previousState.errors, 'startDttm': validation.errors.has('startDttm') ? validation.errors.first('startDttm') : null };
      previousState.errors = { ...previousState.errors, 'endDttm': validation.errors.has('endDttm') ? validation.errors.first('endDttm') : null };
      
      return previousState;
    });
  }

  // Handles errors from the server
  handleError(error) {
    console.log(error);
    if (typeof this.props.onSubmit === 'function') {
      this.props.onSubmit(error.message, false);
    } else {
      alert('Error: ' + error.message);
    }
  }

  componentDidMount() {
    if (!this.state.emptyForm) {
      this.validate();
    }
  }

  render() {
    return (
      <Form onSubmit={this.handleSubmit} autoComplete="off" id="formAnnouncement" noValidate>
        <Input
          name="id"
          value={this.state.data.id ? this.state.data.id : ''}
          type="hidden" />
        <FormGroup>
          <Label for="teaser">
            <Required required>Teaser</Required>
          </Label>
          <Input
            name="teaser"
            value={this.state.data.teaser ? this.state.data.teaser : ''}
            invalid={!this.state.validity.teaser}
            onChange={this.handleChange}
            type="text" maxLength="140"
            required />
          <FormFeedback>{this.state.errors.teaser}</FormFeedback>
        </FormGroup>
        <Row>
          <Col md={4}>
            <FormGroup>
              <Label for="status">Status</Label>
              {
                this.state.data.status === 'DRAFT' || this.state.data.status === 'NEW' ? (
                  <h3><Badge>{this.state.data.status}</Badge></h3>
                ) : (
                  <h3><Badge color="success">{this.state.data.status}</Badge></h3>
                )
              }
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup>
              <Label for="startDttm">Publish Start Date</Label>
              <DatePicker
                name="startDttm"
                id="inputStartDttm"
                dateFormat="YYYY-MM-DD"
                selected={this.state.data.startDttm ? moment(this.state.data.startDttm) : undefined}
                todayButton={"Today"}
                placeholderText="YYYY-MM-DD"
                className={classnames("form-control", {"is-valid": this.state.validity.startDttm && this.state.data.startDttm !== null}, {"is-invalid": !this.state.validity.startDttm && this.state.data.startDttm !== null})}
                onChange={(value) => this.validateAndSaveChange('startDttm', value)}
                selectsStart
                startDate={this.state.data.startDttm ? moment(this.state.data.startDttm) : undefined}
                endDate={this.state.data.endDttm ? moment(this.state.data.endDttm) : undefined} />
              <FormText color="muted">All date and time are in CST</FormText>
              <div className={classnames({"valid-feedback": this.state.validity.startDttm}, {"invalid-feedback": !this.state.validity.startDttm})} style={{ display: 'block' }}>{this.state.errors.startDttm}</div>
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup>
              <Label for="endDttm">Publish End Date</Label>
              <DatePicker
                name="endDttm"
                id="inputEndDttm"
                dateFormat="YYYY-MM-DD"
                selected={this.state.data.endDttm ? moment(this.state.data.endDttm) : undefined}
                todayButton={"Today"}
                placeholderText="YYYY-MM-DD"
                className={classnames("form-control", {"is-valid": this.state.validity.endDttm  && this.state.data.endDttm !== null}, {"is-invalid": !this.state.validity.endDttm && this.state.data.endDttm !== null})}
                onChange={(value) => this.validateAndSaveChange('endDttm', value)}
                selectsEnd
                startDate={this.state.data.startDttm ? moment(this.state.data.startDttm) : undefined}
                endDate={this.state.data.endDttm ? moment(this.state.data.endDttm) : undefined} />
              <FormText color="muted">All date and time are in CST</FormText>
              <div className={classnames({"valid-feedback": this.state.validity.endDttm}, {"invalid-feedback": !this.state.validity.endDttm})} style={{ display: 'block' }}>{this.state.errors.endDttm}</div>
            </FormGroup>
          </Col>
        </Row>
        <FormGroup>
          <Label for="message">Full Message</Label>
          <Input
            name="message"
            value={this.state.data.message ? this.state.data.message : ''}
            onChange={this.handleChange}
            type="textarea"
            required />
          <FormFeedback></FormFeedback>
        </FormGroup>

        <ConfirmDeleteModal
          show={this.state.nestedModal}
          message={'You are about to delete the announcement '+<b>{this.state.data.teaser}</b>+'. Deleted announcements cannot be recovered. Would you like to proceed?'}
          handleClose={(event) => this.toggleModal(event)}
          handleConfirmation={(event) => this.handleDelete(event, this.state.data.id)}
        />

        <Button color="primary" className="mr-1" onClick={(event) => this.handleSubmit(event, false)}><FontAwesome name="save" />{' '}Save</Button>
        {
          this.state.data.status === 'DRAFT' || this.state.data.status === 'NEW' ?
            <Button color="primary" className="mr-1" onClick={(event) => this.handleSubmit(event, true)} data-publish={true}><FontAwesome name="bullhorn" />{' '}Save and Publish</Button>
            : undefined
        }
        {
          this.state.emptyForm === false ?
            <Button color="danger" onClick={(event) => this.toggleModal(event)} className="mr-1"><FontAwesome name="trash" />{' '}Delete</Button>
            : undefined
        }
        <Button color="secondary" outline onClick={(event) => this.handleCancel(event)} className="mr-1 float-right">Close</Button>
      </Form>
    )
  }
}

export default AnnouncementForm;
