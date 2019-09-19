import React from 'react'
import FetchUtilities from 'js/universal/FetchUtilities';
import withLayout from 'js/app/models/withLayout';
import styled from 'styled-components';
import moment from 'moment';

import { Container, Row, Col, Card, CardHeader, CardBody, Button, Table, FormGroup, Label, Input, } from 'reactstrap';
import {
  FormWidgetStatic, FormWidgetText, FormWidgetTextArea, FormWidgetSelect, FormWidgetDatePicker, FormWidgetLdapAutocomplete,
} from 'js/universal/FormFieldWidgets';
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';
import Validator from 'validatorjs';

import ChangeLinkBreadcrumb from "js/app/models/ChangeLinkBreadcrumb";
import Spinner from 'js/universal/spinner';

import AttachmentField from 'js/app/models/AttachmentField';
import { AttachmentDisplay, } from 'js/app/models/attachment';
import { InfoModal, } from 'js/universal/Modals';


const URL_PREFIX = '/api/v1/feedback/'; // API live data
const DD_TRKUSER_URL = '/api/dropdown/trkuser/'; // TRK_USER live data

// const URL_PREFIX = '/json/feedback/record.json'; // Mock data
// const DD_TRKUSER_URL = '/json/dropdown/trkuser.json'; // TRK_USER mock data

const columns = [
  { id: 'deviceWwidName', label: 'Worldwide Customer Name' },
  { id: 'deviceCustomerNumber', label: 'Sold-to Customer' },
  { id: 'deviceCustomerName', label: 'Sold-to Customer Name' },
  { id: 'partOrderableMaterial', label: 'Orderable Material' },
  { id: 'pcnPcnType', label: 'PCN Grouping' }
];

const ADMIN_ROLES = ['ChangeLink Admin', 'PCN Coordinator'];

const mockStateOptions = [
  { label: '', value: '' },
  { label: 'Open', value: 'Open' },
  { label: 'In-Work', value: 'In-Work' },
  { label: 'Complete', value: 'Complete' },
  { label: 'Disregard', value: 'Disregard' }
];
const mockStateOptionsMore = [
  { label: '', value: '' },
  { label: 'Open', value: 'Open' },
  { label: 'In-Work', value: 'In-Work' },
  { label: 'Data Sent', value: 'Data Sent' },
  { label: 'SDP Sent', value: 'SDP Sent' },
  { label: 'Complete', value: 'Complete' },
  { label: 'Disregard', value: 'Disregard' }
];
const mockDispositionOptions = [
  { label: '', value: '' },
  { label: 'SBE decision to implement change without customer approval', value: 'SBE decision to implement change without customer approval' },
  { label: 'New Part Number assigned', value: 'New Part Number assigned' },
  { label: 'EOL/LTB has been completed', value: 'EOL/LTB has been completed' },
  { label: 'Retraction PCN has been sent', value: 'Retraction PCN has been sent' },
  { label: 'Extended Evaluation Period granted', value: 'Extended Evaluation Period granted' },
  { label: 'Customer has approved', value: 'Customer has approved' },
  { label: 'Override - Invalid Rejection', value: 'Override - Invalid Rejection' }
];

const mockResponseOptions = [
  { label: '', value: '' },
  { label: 'Data Request', value: 'Data Request' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Not Applicable', value: 'Not Applicable' },
  { label: 'Inquiry', value: 'Inquiry' }
];

let headers = new Headers({
  'Pragma': 'no-cache',
  'Cache-Control': 'no-cache'
});

const validResponseOptions = mockResponseOptions.map((responseOption) => {
  return responseOption.value
});

let rules_all = {
  state: ['required'],
  feedback: ['required', 'max:255'],
  response: ['required', { 'in': validResponseOptions }],
  coordinatorId: ['required'],
  createdBy: ['required', 'max:255'],
  contactName: ['max:255'],
  email: ['max:255'],
  tiContactName: ['max:4000'],
  comments: ['max:4000'],
  briefComment: [{ 'required_if': ['response', 'Approved'] }, { 'required_if': ['response', 'Not Applicable'] }, 'max:4000'],
  charDetails: ['max:4000'],
  dateCreated: ['required']
};
let rules_rejected = {
  state: ['required'],
  dispositionState: [{ 'required_if': ['state', 'Complete'] }],
  feedback: ['required', 'max:255'],
  response: ['required', { 'in': validResponseOptions }],
  coordinatorId: ['required'],
  createdBy: ['required', 'max:255'],
  contactName: ['max:255'],
  email: ['max:255'],
  tiContactName: ['max:4000'],
  comments: ['max:4000'],
  briefComment: [{ 'required_if': ['response', 'Approved'] }, { 'required_if': ['response', 'Not Applicable'] }, 'max:4000'],
  charDetails: ['max:4000'],
  dateCreated: ['required']
};
let messages = {
  'required': 'This field is required',
  'required_if': 'This field is required',
  'max': 'This field may not be greater than :max characters'
};

class TrkFeedbackForm extends React.Component {

  static defaultProps = {
    canEdit: false
  };

  constructor(props) {
    super(props);
    this.state = {
      pcnNumber: '',
      feedbackNumber: this.props.match.params.feedbackNumber,
      isEditMode: false,
      isPartialEditMode: false,
      showSpinner: true,
      canUpdate: props.hasRole(ADMIN_ROLES),
      validity: [],
      errors: []
    };

    this.loadFeedbackData = this.loadFeedbackData.bind(this);
    this.loadCustomerDeviceData = this.loadCustomerDeviceData.bind(this);
    this.enableEditMode = this.enableEditMode.bind(this);
    this.enablePartialEditMode = this.enablePartialEditMode.bind(this);
    this.disableEditMode = this.disableEditMode.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onChange = this.onChange.bind(this);
    this.validate = this.validate.bind(this);
    this.handleAttachSubmit = this.handleAttachSubmit.bind(this);
    this.notify = this.notify.bind(this);
    this.closeNotifyModal = this.closeNotifyModal.bind(this)
  }

  componentDidMount() {
    this.loadFeedbackData();
    this.loadCustomerDeviceData();
    this.setState({ showSpinner: false });

    // Fetch the list of possible coordinators
    fetch(DD_TRKUSER_URL, { credentials: 'include', headers: headers })
      .then((response) => { return response.json() })
      .then((json) => { this.setState({ coordinatorList: json }) })
      .catch((ex) => { throw ex });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
      this.setState({
        canUpdate: nextProps.hasRole(ADMIN_ROLES)
      })
  }

  loadFeedbackData() {
    let fetchURL = URL_PREFIX + this.state.feedbackNumber; // API
    // let fetchURL = '/json/feedback/record.json'; // Mock

    // Fetch the feedback data
    fetch(fetchURL, { credentials: 'include', headers: headers })
      .then(FetchUtilities.checkStatusWithSecurity)
      .then((response) => { return response.json() })
      .then((json) => {
        this.setState({
          data: json,
          pcnNumber: json.pcnId,
          isOwner: this.props.userDetails.id.toUpperCase() === json.createdBy.slice(-8)
        });
        
        this.validate() // Initial form validation
      })
      .catch((ex) => { throw ex });
  }

  loadCustomerDeviceData() {
    let custdevURL = URL_PREFIX + this.state.feedbackNumber + '/custdev'; // API

    // Fetch the customer and device data
    fetch(custdevURL, { credentials: 'include', headers: headers })
      .then(FetchUtilities.checkStatusWithSecurity)
      .then((response) => { return response.json() })
      .then((json) => { this.setState({ custdevData: json }) })
      .catch((ex) => { throw ex });
  }

  enableEditMode() {
    this.setState({ isEditMode: true, read: JSON.parse(JSON.stringify(this.state.data)) })
  }

  enablePartialEditMode() {
    this.setState({ isPartialEditMode: true, read: JSON.parse(JSON.stringify(this.state.data)) })
  }

  disableEditMode() {
    this.setState({ isEditMode: false, isPartialEditMode: false, data: JSON.parse(JSON.stringify(this.state.read)) })
  }

  onSave() {
    if (this.validate()) {
      // Show the spinner
      this.setState({ showSpinner: true });

      let url = this.state.isPartialEditMode
        ? `${URL_PREFIX}u/${this.state.feedbackNumber}` : `${URL_PREFIX}${this.state.feedbackNumber}`;

      fetch(url,
        {
          method: 'POST',
          body: JSON.stringify(this.state.data),
          headers: new Headers({
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
          }),
          credentials: 'include',
        })
        .then(FetchUtilities.checkStatusWithSecurity)
        .then((response) => { return response.json() })
        .then((response) => {
          if (response.error) {
            this.setState({
              notifyType: 'danger',
              notifyText: `${response.message}: ${response.id}`,
              isEditMode: false,
              isPartialEditMode: false,
              showSpinner: false
            })
          } else {
            this.setState({ data: undefined });
            this.loadFeedbackData();
            this.setState({ isEditMode: false, isPartialEditMode: false, showSpinner: false })
          }
        })
        .catch((error) => {
          this.setState({
            notifyType: 'danger',
            notifyText: error.message ? error.message : 'System encountered an error while executing your transaction.',
            isEditMode: false,
            isPartialEditMode: false,
            showSpinner: false
          })
        });
    }
  }

  onChange(name, value) {
    // Set state using function to granularly modify data
    this.setState((previousState) => {
      previousState.data = { ...previousState.data, [name]: value };
      return previousState;
    });

    this.validate(); // Trigger validation
  }

  onChangeResponse(name, value) {
    if (value !== this.state.read.response) {
      this.setState((previousState) => {
        previousState.data = { ...previousState.data, state: '' };
        previousState.validity = { ...previousState.validity, state: false };
        previousState.errors = { ...previousState.errors, state: 'This field is required' };
        previousState.data = { ...previousState.data, dispositionState: '' };
        previousState.validity = { ...previousState.validity, dispositionState: true };
        previousState.errors = { ...previousState.errors, dispositionState: null };
        return previousState;
      });
    } else {
      // Reset the field State to previous state
      this.setState((previousState) => {
        previousState.data = { ...previousState.data, state: this.state.read.state };
        previousState.validity = { ...previousState.validity, state: true };
        previousState.errors = { ...previousState.errors, state: null };
        previousState.data = { ...previousState.data, dispositionState: this.state.read.dispositionState };
        previousState.validity = { ...previousState.validity, dispositionState: true };
        previousState.errors = { ...previousState.errors, dispositionState: null };
        return previousState;
      });
    }

    // Set state using function to granularly modify data
    this.setState((previousState) => {
      previousState.data = { ...previousState.data, [name]: value };
      return previousState;
    });
  }

  onChangeState(name, value) {
    const rules = this.state.data.response === 'Rejected' ? rules_rejected : rules_all;

    // Validate the field
    let validation = new Validator({ ...this.state.data, [name]: value }, rules, messages);
    validation.passes(); // Trigger validation

    let dateCompletedvalue;
    if (value === 'Complete') {
      // If state is Complete, auto-set the field Date Complete to today
      dateCompletedvalue = moment().toISOString()
    } else {
      // Reset the field Date Completed to previous state
      dateCompletedvalue = this.state.read.dateCompleted
    }

    let dateSentvalue;
    if (this.state.data.dateSent === null && this.state.data.response === 'Data Request' && (value === 'SDP Sent' || value === 'Data Sent')) {
      // If conditions are met, auto-set the field Date Sent to today
      dateSentvalue = moment().toISOString()
    } else {
      // Reset the field Date Sent to previous state
      dateSentvalue = this.state.read.dateSent
    }

    this.setState((previousState) => {
      previousState.data = { ...previousState.data, dateCompleted: dateCompletedvalue };
      previousState.data = { ...previousState.data, dateSent: dateSentvalue };
      previousState.validity = { ...previousState.validity, dispositionState: !validation.errors.has('dispositionState')};
      previousState.errors = { ...previousState.errors, dispositionState: validation.errors.has('dispositionState') ? validation.errors.first('dispositionState') : null };
      previousState.data = { ...previousState.data, [name]: value };
      previousState.validity = { ...previousState.validity, [name]: !validation.errors.has(name) };
      previousState.errors = { ...previousState.errors, [name]: validation.errors.has(name) ? validation.errors.first(name) : null };
      return previousState;
    });
  }

  onChangeDispositionState(name, value) {
    const rules = this.state.data.response === 'Rejected' ? rules_rejected : rules_all;

    // Validate the field
    let validation = new Validator({ ...this.state.data, [name]: value }, rules, messages);
    validation.passes(); // Trigger validation

    if (value === 'Customer has approved') {
      // If disposition state says Customer has approved, then make it so
      this.setState((previousState) => {
        previousState.data = { ...previousState.data, [name]: value };
        previousState.validity = { ...previousState.validity, [name]: !validation.errors.has(name) };
        previousState.errors = { ...previousState.errors, [name]: validation.errors.has(name) ? validation.errors.first(name) : null };
        return previousState;
      });
    } else {
      this.setState((previousState) => {
        previousState.data = { ...previousState.data, [name]: value };
        previousState.validity = { ...previousState.validity, [name]: !validation.errors.has(name) };
        previousState.errors = { ...previousState.errors, [name]: validation.errors.has(name) ? validation.errors.first(name) : null };
        return previousState;
      });
    }
  }

  validate() {
    const rules = this.state.data.response === 'Rejected' ? rules_rejected : rules_all;
    
    let validation = new Validator(this.state.data, rules, messages);
    let isValid = validation.passes(); // Trigger validation
    
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

    return isValid;
  }

  // Handler for form button onSubmit for attachment
  handleAttachSubmit(message, isSuccess) {
    if (isSuccess) {
      var m = new Date().getMilliseconds();
      this.setState({
        key: 'tbl-files-' + m, // Refresh the table
        formVisible: false // close form
      });
    } else {
      this.setState({
        formVisible: false // close form
      });
    }
  }

  notify(type, message) {
    this.setState({
      notifyType: type,
      notifyText: message
    });
  }

  closeNotifyModal() {
    this.setState({
      notifyType: undefined,
      notifyMessage: undefined
    });
  }

  render() {
    const crumbs = [
      { text: 'Home', to: '/' },
      { text: `${this.state.pcnNumber}`, to: `/pcn/${this.state.pcnNumber}` },
      { text: this.state.feedbackNumber, active: true }
    ];

    if (!!this.state.data) {
      let stateOptions;
      if (['Data Request', 'Inquiry'].includes(this.state.data.response)) {
        stateOptions = mockStateOptionsMore
      } else {
        stateOptions = mockStateOptions
      }

      let notify = {};
      if (this.state.notifyType !== undefined) {
        if (this.state.notifyType === 'warning') {
          notify = { color: 'warning', icon: 'exclamation-circle', title: 'Alert' }
        } else if (this.state.notifyType === 'danger') {
          notify = { color: 'danger', icon: 'exclamation-circle', title: 'Error' }
        } else {
          notify = { color: 'info', icon: 'info-circle', title: 'Notice' }
        }
      }

      let stateHelpText = undefined;
      if (this.state.data.response === 'Data Request') {
        if (this.state.data.state === 'Complete') {
          stateHelpText = 'When the "Complete" state is chosen, the Data Hold is removed immediately. The 30-Day timestamp does not apply.'
        } else if (this.state.data.state === 'Data Sent' || this.state.data.state === 'SDP Sent') {
          stateHelpText = 'When either the "Data Sent" or the "SDP Sent" state is chosen, the Data Hold is automatically removed 30 days after the data is sent to align with JEDEC.'
        }
      }

      return (
        <Container fluid className={this.props.className}>
          <Spinner showSpinner={this.state.showSpinner} />

          <Row>
            <Col className="pl-0">
              <ChangeLinkBreadcrumb crumbs={crumbs} className='float-left' />

              {
                this.state.canUpdate
                  ? this.state.isEditMode
                    ? (
                      <span className='float-right'>
                        <Button color="primary" className="mr-1" onClick={this.onSave}><FontAwesome name="save" />{' '}Save Changes</Button>
                        <Button color="secondary" outline className="mr-1" onClick={this.disableEditMode}>Cancel</Button>
                      </span>
                    )
                    : (
                      <span className='float-right'>
                        <Button color="primary" className="mr-1" onClick={this.enableEditMode}><FontAwesome name="pencil" />{' '}Edit</Button>
                      </span>
                    )
                  : undefined
              }
              {
                this.state.isOwner && !this.state.canUpdate && this.state.data.state !== 'Complete'
                  ? this.state.isPartialEditMode
                    ? (
                      <span className='float-right'>
                        <Button color="primary" className="mr-1" onClick={this.onSave}><FontAwesome name="save" />{' '}Save Changes</Button>
                        <Button color="secondary" outline className="mr-1" onClick={this.disableEditMode}>Cancel</Button>
                      </span>
                    )
                    : (
                      <span className='float-right'>
                        <Button color="primary" className="mr-1" onClick={this.enablePartialEditMode}><FontAwesome name="pencil" />{' '}Edit</Button>
                      </span>
                    )
                  : undefined
              }
            </Col>
          </Row>

          <Row>
            <Col md={6} sm={12} className="pl-0 mb-3">
              <Card>
                <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                  Feedback Summary
                  </CardHeader>
                <CardBody>
                  <FormWidgetStatic label='Feedback Number' value={this.state.data.feedbackNumber} size='md' inline />
                  {
                    this.state.isEditMode
                      ? (
                        <FormWidgetSelect label='State' name='state' value={this.state.data.state}
                          required disabled={!this.state.isEditMode} onChange={this.onChangeState.bind(this)}
                          invalid={!this.state.validity.state} validationMessage={this.state.errors.state}
                          /* TODO: Update the source of the select options */
                          options={stateOptions} helpText={stateHelpText} />
                      ) : <FormWidgetStatic label='State' value={this.state.data.state} size='md' inline />
                  }
                  {
                    !!this.state.data.dispositionState || this.state.data.response === 'Rejected'
                      ? (
                        this.state.isEditMode
                          ? <FormWidgetSelect label='Disposition State' name='dispositionState' value={this.state.data.dispositionState}
                            required={this.state.data.response === 'Rejected' && this.state.data.state === 'Complete'}
                            disabled={!this.state.isEditMode} onChange={this.onChange}
                            invalid={!this.state.validity.dispositionState} validationMessage={this.state.errors.dispositionState}
                            /* TODO: Update the source of the select options */
                            options={mockDispositionOptions} />
                          : <FormWidgetStatic label='Disposition State' value={this.state.data.dispositionState} size='md' inline />
                      ) : undefined
                  }
                  <Row>
                    <Col lg={this.state.isEditMode ? 6 : 12} md={12} sm={12}>
                      {
                        this.state.isEditMode
                          ? (
                            <FormWidgetDatePicker label='Date Created' name='dateCreated' value={this.state.data.dateCreated}
                              required disabled={!this.state.isEditMode} onChange={this.onChange}
                              invalid={!this.state.validity.dateCreated} validationMessage={this.state.errors.dateCreated} />
                          ) : <FormWidgetStatic label='Date Created' value={this.state.data.dateCreated} type='date' size='md' inline />
                      }
                      {
                        this.state.isEditMode
                          ? (
                            <FormWidgetDatePicker label='Date Completed' name='dateCompleted' value={this.state.data.dateCompleted}
                              disabled={!this.state.isEditMode} onChange={this.onChange} />
                          ) : <FormWidgetStatic label='Date Completed' value={this.state.data.dateCompleted} type='date' size='md' inline />
                      }
                    </Col>
                    <Col lg={this.state.isEditMode ? 6 : 12} md={12} sm={12}>
                      {
                        !!this.state.data.dateSent || (this.state.data.response === 'Data Request' && (this.state.data.state === 'SDP Sent' || this.state.data.state === 'Data Sent'))
                          ? (
                            this.state.isEditMode
                              ? <FormWidgetDatePicker label='Date Sent' name='dateSent' value={this.state.data.dateSent}
                                disabled={!this.state.isEditMode} onChange={this.onChange} />
                              : <FormWidgetStatic label='Date Sent' value={this.state.data.dateSent} type='date' size='md' inline />
                          ) : undefined
                      }
                      {
                        !!this.state.data.extendedEvalDate || (this.state.data.response === 'Rejected' && this.state.data.dispositionState === 'Extended Evaluation Period granted')
                          ? (
                            this.state.isEditMode
                              ? <FormWidgetDatePicker label='Extended Eval Date' name='extendedEvalDate' value={this.state.data.extendedEvalDate}
                                disabled={!this.state.isEditMode} onChange={this.onChange} />
                              : <FormWidgetStatic label='Extended Eval Date' value={this.state.data.extendedEvalDate} type='date' size='md' inline />
                          ) : undefined
                      }
                      {
                        !!this.state.data.newPartNumber || (this.state.data.response === 'Rejected' && this.state.data.dispositionState === 'New Part Number assigned')
                          ? (
                            this.state.isEditMode
                              ? <FormWidgetText label='New Part Number' name='newPartNumber' value={this.state.data.newPartNumber}
                                disabled={!this.state.isEditMode} onChange={this.onChange} />
                              : <FormWidgetStatic label='New Part Number' value={this.state.data.newPartNumber} size='md' inline />
                          ) : undefined
                      }
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
            <Col md={6} sm={12} className="pl-0 mb-3">
              <PcnPane {...this.state} />
            </Col>
            <Col lg={6} md={12} sm={12} className="pl-0 mb-3">
              <Card>
                <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                  Feedback Details
                  </CardHeader>
                <CardBody>
                  {
                    this.state.isEditMode
                      ? (
                        <FormWidgetText label='Feedback' name='feedback' value={this.state.data.feedback}
                          required disabled={!this.state.isEditMode} onChange={this.onChange}
                          invalid={!this.state.validity.feedback} validationMessage={this.state.errors.feedback} />
                      ) : <FormWidgetStatic label='Feedback' value={this.state.data.feedback} inline />
                  }
                  {
                    this.state.isEditMode
                      ? (
                        <FormWidgetSelect label='Response' name='response' value={this.state.data.response}
                          required disabled={!this.state.isEditMode} onChange={this.onChangeResponse.bind(this)}
                          invalid={!this.state.validity.response} validationMessage={this.state.errors.response}
                          /* TODO: Update the source of the select options */
                          options={mockResponseOptions} />
                      ) : <FormWidgetStatic label='Response' value={this.state.data.response} inline />
                  }
                  {
                    this.state.isEditMode
                      ? (
                        <FormWidgetSelect label='Coordinator' name='coordinatorId' value={this.state.data.coordinatorId}
                          required disabled={!this.state.isEditMode} onChange={this.onChange}
                          invalid={!this.state.validity.coordinatorId} validationMessage={this.state.errors.coordinatorId}
                          options={this.state.coordinatorList} />
                      ) : <FormWidgetStatic label='Coordinator' value={this.state.data.coordinatorName} inline />
                  }
                  {
                    this.state.isEditMode
                      ? (
                        <FormWidgetText label='Created By' name='createdBy' value={this.state.data.createdBy}
                          required disabled={!this.state.isEditMode} onChange={this.onChange}
                          invalid={!this.state.validity.createdBy} validationMessage={this.state.errors.createdBy} />
                      ) : <FormWidgetStatic label='Created By' value={this.state.data.createdBy} inline />
                  }
                  {
                    this.state.isEditMode
                      ? (
                        <FormWidgetText label='Customer Contact' name='contactName' value={this.state.data.contactName}
                          disabled={!this.state.isEditMode} onChange={this.onChange}
                          invalid={!this.state.validity.contactName} validationMessage={this.state.errors.contactName} />
                      ) : <FormWidgetStatic label='Customer Contact' value={this.state.data.contactName} inline />
                  }
                  {
                    this.state.isEditMode
                      ? (
                        <FormWidgetText label='Contact Email' name='email' value={this.state.data.email}
                          disabled={!this.state.isEditMode} onChange={this.onChange}
                          invalid={!this.state.validity.email} validationMessage={this.state.errors.email} />
                      ) : <FormWidgetStatic label='Contact Email' value={this.state.data.email} inline />
                  }
                  {
                    this.state.isEditMode
                      ? (
                        <FormWidgetLdapAutocomplete label='TI Contact' name='tiContactName' value={this.state.data.tiContactName}
                          onChange={this.onChange}
                          invalid={!this.state.validity.tiContactName} validationMessage={this.state.errors.tiContactName} />
                      ) : <FormWidgetStatic label='TI Contact' value={this.state.data.tiContactName} inline />
                  }
                  <hr />
                  {
                    this.state.isEditMode || this.state.isPartialEditMode
                      ? (
                        <FormWidgetTextArea label='Comment' name='briefComment' value={this.state.data.briefComment}
                          onChange={this.onChange} required={this.state.data.response === 'Approved' || this.state.data.response === 'Not Applicable'}
                          invalid={!this.state.validity.briefComment} validationMessage={this.state.errors.briefComment} />
                      ) : (
                        <FormWidgetTextArea label='Comment' name='briefComment' value={this.state.data.briefComment}
                          disabled readonly />
                      )
                  }
                  {
                    this.state.isEditMode
                      ? (
                        <FormWidgetTextArea label='Coordinator Comments' name='comments' value={this.state.data.comments}
                          disabled={!this.state.isEditMode} onChange={this.onChange}
                          invalid={!this.state.validity.comments} validationMessage={this.state.errors.comments} />
                      ) : (
                        <FormWidgetTextArea label='Coordinator Comments' name='comments' value={this.state.data.comments}
                          disabled={!this.state.isEditMode} readonly />
                      )
                  }
                  {
                    this.state.isEditMode
                      ? (
                        <FormWidgetTextArea label='Details' name='charDetails' value={this.state.data.charDetails}
                          disabled={!this.state.isEditMode} onChange={this.onChange}
                          invalid={!this.state.validity.charDetails} validationMessage={this.state.errors.charDetails} />
                      ) : <FormWidgetStatic label='Details' value={this.state.data.charDetails} />
                  }
                </CardBody>
              </Card>
            </Col>
            <Col lg={6} md={12} sm={12} className="pl-0 mb-3">
              <CustomerDevicePane {...this.state} />
            </Col>
            <Col sm={12} className="pl-0 mb-3">
              <Card>
                <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                  Attachments
                </CardHeader>
                <CardBody>
                  {
                    this.state.isEditMode || this.state.isPartialEditMode
                      ? (
                        <div>
                          <AttachmentField
                            id={this.state.data.id} //tracker id
                            loc='Feedback'
                            classification={this.props.match.params.feedbackNumber}
                            context={this.state.data.pcnId} //should be PCN number
                            onSubmit={this.handleAttachSubmit}
                          />
                          <AttachmentDisplay
                            id={this.state.data.id} //tracker id
                            loc='Feedback'
                            context={this.state.data.pcnId} //should be PCN number
                            key={this.state.key}
                            hideEdit={true}
                          />
                        </div>
                      )
                      : (
                        <AttachmentDisplay
                          id={this.state.data.id} //tracker id
                          loc='Feedback'
                          context={this.state.data.pcnId} //should be PCN number
                          key={this.state.key}
                          hideEdit={false}
                        />
                      )
                  }
                </CardBody>
              </Card>
            </Col>
          </Row>

          {
            this.state.notifyType !== undefined
              ? <InfoModal show
                icon={notify.icon}
                color={notify.color}
                title={notify.title}
                message={this.state.notifyMessage}
                handleClose={this.closeNotifyModal}
              />
              : undefined
          }
        </Container>
      )
    } else {
      return (
        <div className={this.props.className}>
          <ChangeLinkBreadcrumb crumbs={crumbs} />
          <div id='spinner-container'>
            <Spinner showSpinner={true} overlay={false} />
          </div>
        </div>
      )
    }
  }
}

class CustomerDevicePane extends React.Component {
  state = {
    custdevData: this.props.custdevData
  };

  componentWillReceiveProps(nextProps) {
    this.setState({ custdevData: nextProps.custdevData })
  }

  render() {
    return (
      <Card>
        <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
          Customer and Device Details
        </CardHeader>
        <CardBody>
          <Table bordered striped size="sm">
            <thead>
              <tr>
                {
                  columns.map((column) => {
                    return (<th key={`${this.props.className}-th-col-${column.label}`}>{column.label}</th>)
                  })
                }
              </tr>
            </thead>
            <tbody>
              {
                this.state.custdevData !== undefined && this.state.custdevData.length > 0
                  ? (
                    this.state.custdevData.map((row, j) => {
                      return (
                        <tr key={`tblcustdev-row-${j}`}>
                          {
                            columns.map((column, i) => {
                              return (<td key={`tblcustdev-row-${j}-col-${i}`}>{row[column.id]}</td>)
                            })
                          }
                        </tr>
                      )
                    })
                  )
                  : (
                    <tr><td colSpan="100">No records</td></tr>
                  )
              }
            </tbody>
          </Table>
        </CardBody>
      </Card>
    )
  }
}

class PcnPane extends React.Component {
  state = {
    data: this.props.data
  };

  componentWillReceiveProps(nextProps) {
    this.setState({ data: nextProps.data })
  }

  render() {
    return (
      <Card>
        <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
          PCN Details
        </CardHeader>
        <CardBody>
          <FormGroup row className='mb-0'>
            <Label md={3} sm={6} xs={12}><strong>PCN Number</strong></Label>
            <Col md={9} sm={6} xs={12}>
              <Input plaintext><Link to={`/pcn/${this.state.data.pcnId}`}><strong>{this.state.data.pcnId}</strong></Link></Input>
            </Col>
          </FormGroup>
          <FormWidgetStatic label='PCN Title' value={this.state.data.pcnHeader} size='md' inline />
        </CardBody>
      </Card>
    )
  }
}

export default styled(withLayout(TrkFeedbackForm)) `
.floating-card
{
  float: left;
}
`
