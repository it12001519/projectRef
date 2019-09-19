import React from 'react';
import 'whatwg-fetch';
import FetchUtilities from 'js/universal/FetchUtilities';
import styled from 'styled-components';

import { Row, Col, Button, Form, FormGroup, Label } from 'reactstrap';
import { FormWidgetText, FormWidgetTextArea, FormWidgetSelect, FormWidgetButtonYesNo, } from 'js/universal/FormFieldWidgets';
import FontAwesome from 'react-fontawesome';
import Spinner from 'js/universal/spinner';
import Validator from 'validatorjs';
import { SubHeader } from 'js/app/models/ChangelinkUI';
import LDAPSearchInput from 'js/universal/LDAPSearchInput';


const PCN_URL_PREFIX = '/api/v1/pcn/get/'; // API live data
const URL_FETCH_COORDINATORS = '/api/dropdown/sample-coordinators'; // API live data
const ALLOW_EDIT_ROLES = ['ChangeLink Admin', 'System Admin', 'PCN Admin', 'PCN Coordinator']

const headers = new Headers({
  cache: 'no-store',
  Pragma: 'no-cache',
  'Cache-Control': 'no-cache'
})
const postHeaders = new Headers({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Pragma: 'no-cache',
  'Cache-Control': 'no-cache'
})

let rules = {
  description: ['required'],
  qdbRequired: ['required']
};
let messages = {
  'required': 'This field is required',
  'integer': 'This field must be a number'
};

let userAccess = undefined;

class PcnAttributes extends React.Component {

  static defaultProps = {
    canEdit: true
  }

  constructor(props) {
    super(props);
    this.state = {
      isEditMode: false,
      showSpinner: true,
      canUpdate: false,
      validity: [],
      errors: [],
      data: {

        id: this.props.id || null,
        pcnNumber: this.props.pcnNumber || null,
        pcnType: this.props.pcnType || null,
        groupName: this.props.groupName || null,
        description: this.props.description || null,
        qdbRequired: this.props.qdbRequired || null,
        projectName: this.props.projectName || null,
        pcnOwner: this.props.pcnOwner || null,
        defaultSampleCoordinator: this.props.defaultSampleCoordinator || null

      },
      optionsForCoordinators: [],
      optionsForPcnType: [],
      optionsForGroupName: [],
      optionsForProjectName: [],
      optionsForPriority: [],
      optionsForStatus: [],
      sampleCoordinatorList: [],
      optionsLoaded: false
    }

    this.enableEditMode = this.enableEditMode.bind(this)
    this.disableEditMode = this.disableEditMode.bind(this)
    this.onSave = this.onSave.bind(this)
    this.openLinkInNewTab = this.openLinkInNewTab.bind(this)
    this.validate = this.validate.bind(this)
    this.loadPcnAttributesData = this.loadPcnAttributesData.bind(this)
    this.loadOptions = this.loadOptions.bind(this)
    this.onChange = this.onChange.bind(this)
    this.loadUserAccess = this.loadUserAccess.bind(this)
  }


  enableEditMode() {
    if (!this.state.optionsLoaded) {
      this.loadOptions();
    }
    this.setState({ isEditMode: true, read: JSON.parse(JSON.stringify(this.state.data)) });
  }

  disableEditMode() {
    this.setState({ isEditMode: false, data: JSON.parse(JSON.stringify(this.state.read)) })
  }

  loadPcnAttributesData() {
    this.setState({ showSpinner: true });

    let fetchURL = PCN_URL_PREFIX + this.props.pcnNumber; // API

    // Fetch the summary data
    fetch(fetchURL, { credentials: 'include', headers: headers })
      .then(FetchUtilities.checkStatusWithSecurity)
      .then((response) => { return response.json() })
      .then((json) => {
        this.setState({
          data: json,
          showSpinner: false
        })
        this.validate() // Initial form validation
      })
      .catch((ex) => { throw ex });
  }

  onChange(name, value) {

    let validation = new Validator({ ...this.state.data, [name]: value }, rules, messages);
    validation.passes(); // Trigger validation

    // Set state using function to granularly modify data
    this.setState((previousState) => {
      previousState.data = { ...previousState.data, [name]: value };
      previousState.validity = { ...previousState.validity, [name]: !validation.errors.has(name) };
      previousState.errors = { ...previousState.errors, [name]: validation.errors.has(name) ? validation.errors.first(name) : null };
      return previousState;
    });
  }

  // Handle form validation
  validate() {
    let validation = new Validator(this.state.data, rules, messages);
    validation.passes(); // Trigger validation

    let formValidity = {};
    let formErrors = {};
    Object.keys(this.state.data).forEach((field) => {
      formValidity[field] = !validation.errors.has(field);
      formErrors[field] = validation.errors.has(field) ? validation.errors.first(field) : null;
    });

    this.setState({
      validity: formValidity,
      errors: formErrors
    });

    return validation.passes();
  }

  onSave(e) { console.log('onSave')
    var queryData = this.state.data;

    if (this.validate()) { console.log('validate true')
      // Show the spinner
      this.setState({ showSpinner: true })

      const URL_UPDATE_PCN = '/api/v1/pcn/update/';
      fetch(URL_UPDATE_PCN,
        {
          method: 'POST',
          body: JSON.stringify(queryData),
          headers: postHeaders,
          credentials: 'include',
        })
        .then(FetchUtilities.checkStatus)
        .then((response) => {
          if (response.status === 200) {            
            this.setState({
              isEditMode: !this.state.isEditMode,
              read: JSON.parse(JSON.stringify(this.state.data)),
              showSpinner: false
            });        
          }
        })
        .catch((error) => {
          alert(error.message);
        });
    }
  }

  loadOptions() {
    var queryData = this.state.data;

    this.setState({ showSpinner: true });

    fetch('/api/v1/pcn/pcnOptions/', {
      method: 'POST',
      body: JSON.stringify(queryData),
      headers: postHeaders,
      credentials: 'include'
    })
      .then((response) => response.json())
      .then((json) => {
        this.setState({
          //optionsForCoordinators: json.optionsForCoordinators,
          optionsForPcnType: json.optionsForPcnType,
          optionsForGroupName: json.optionsForGroupName,
          optionsForProjectName: json.optionsForProjectName,
          optionsForPriority: json.optionsForPriority,
          //optionsForStatus: json.optionsForStatus,
          optionsLoaded: true,
          showSpinner: false
        })
      })
      .catch((error) => {
        alert(error.message);
      });
  }

  openLinkInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
  }

  loadUserAccess() {
    if (this.props.userAccess || userAccess !== undefined) {
      let canUpdate = false;
      userAccess = this.props.userAccess ? this.props.userAccess : userAccess;
      for (var i in ALLOW_EDIT_ROLES) {
        canUpdate = userAccess.includes(ALLOW_EDIT_ROLES[i]) ? true : canUpdate
      }
      this.setState({
        canUpdate: canUpdate
      })
    }
  }

  componentDidMount() {
    this.loadUserAccess();
    this.loadPcnAttributesData();

    // Fetch the list of coordinators
    fetch(URL_FETCH_COORDINATORS, { credentials: 'include', headers: headers })
    .then(FetchUtilities.checkStatusWithSecurity)
    .then((response) => { return response.json() })
    .then((json) => { json.unshift(''); this.setState({ sampleCoordinatorList: json }); })
    .catch((ex) => { throw ex })
  }

  componentWillReceiveProps(nextProps) {
    this.loadUserAccess();
  }

  render() {
    let coordinator = this.state.sampleCoordinatorList.find(c => { return c.value === this.state.data.defaultSampleCoordinator})
    if (!!this.state.data) {
      return (
        <div className={this.props.className}>

          <Spinner showSpinner={this.state.showSpinner} />

          <Form autoComplete="off" id="formAttributes" noValidate>
            <Row>
              <Col>
                <SubHeader>PCN {this.state.data.pcnNumber}</SubHeader>
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
              </Col>
            </Row>

            <Row>
              <Col>
                <hr />
              </Col>
            </Row>

            <Row>
              <FieldWrapper>
                {
                  this.state.isEditMode
                    ? (
                      <FormWidgetSelect label='PCN Type' name="pcnType" value={this.state.data.pcnType}
                        disabled={!this.state.isEditMode}
                        options={this.state.optionsForPcnType}
                        onChange={this.onChange} />
                    ) : <FormWidgetText label='PCN Type' name='pcnType' value={this.state.data.pcnType} disabled readonly />
                }
              </FieldWrapper>

              <FieldWrapper>
                {
                  this.state.isEditMode
                    ? (
                      <FormWidgetTextArea label='Brief Title' name='description' value={this.state.data.description}
                        required disabled={!this.state.isEditMode}
                        onChange={this.onChange}
                        invalid={!this.state.validity.description} validationMessage={this.state.errors.description} />
                    ) : <FormWidgetText label='Brief Title' name='description' value={this.state.data.description} disabled readonly />
                }
              </FieldWrapper>

              <FieldWrapper>
                {
                  this.state.isEditMode
                    ? (
                      <FormWidgetSelect label='PCN Group Name' name="groupName"
                        value={this.state.data.groupName}
                        disabled={!this.state.isEditMode}
                        options={this.state.optionsForGroupName}
                        onChange={this.onChange} />
                    ) : <FormWidgetText label='PCN Group Name' name='groupName' value={this.state.data.groupName} disabled readonly />
                }
              </FieldWrapper>

              <FieldWrapper>
                {
                  this.state.isEditMode
                    ? (
                      <FormWidgetSelect label='Project Name' name="projectName"
                        value={this.state.data.projectName}
                        disabled={!this.state.isEditMode}
                        options={this.state.optionsForProjectName}
                        onChange={this.onChange} />
                    ) : <FormWidgetText label='Project Name' name='projectName' value={this.state.data.projectName} disabled readonly />
                }
              </FieldWrapper>

              <FieldWrapper>
                {
                  this.state.isEditMode
                    ? (
                      <FormGroup>
                        <Label for="programManager">Program Manager</Label>
                        <LDAPSearchInput
                          placeholder={'Enter user'}
                          selected={this.state.data.programManager}
                          onSelectLdap={(event) => this.onChange('programManager', event.label)} />
                      </FormGroup>
                    ) : <FormWidgetText label='Program Manager' name='programManager' value={this.state.data.programManager} disabled readonly />
                }
              </FieldWrapper>

              <FieldWrapperHalf>
                {
                  this.state.isEditMode
                    ? (
                      <FormWidgetSelect label='Priority' name="priority" value={this.state.data.priority}
                        disabled={!this.state.isEditMode}
                        options={this.state.optionsForPriority}
                        onChange={this.onChange} />
                    ) : <FormWidgetText label='Priority' name='priority' value={this.state.data.priority} disabled readonly />
                }
              </FieldWrapperHalf>

              <FieldWrapperHalf>
                {
                  this.state.isEditMode
                    ? (
                      <FormWidgetButtonYesNo label='Requires QDB' id='qdbRequired' name='qdbRequired' value={this.state.data.qdbRequired}
                        required disabled={!this.state.isEditMode}
                        onChange={this.onChange}
                        invalid={!this.state.validity.qdbRequired} validationMessage={this.state.errors.qdbRequired} />
                    ) : <FormWidgetText label='Requires QDB' name='qdbRequired' value={this.state.data.qdbRequired} disabled readonly />
                }
              </FieldWrapperHalf>

              <FieldWrapper>
                {
                  this.state.isEditMode
                    ? (
                      <FormWidgetSelect label='Default Sample Coordinator' name="defaultSampleCoordinator" value={!!coordinator ? coordinator.value : this.state.data.defaultSampleCoordinator}
                        disabled={!this.state.isEditMode}
                        options={this.state.sampleCoordinatorList}
                        onChange={this.onChange} />
                    ) : <FormWidgetText label='Default Sample Coordinator' name='defaultSampleCoordinator' value={!!coordinator ? coordinator.label : this.state.data.defaultSampleCoordinator} disabled readonly />
                }
              </FieldWrapper>
                      
              {/*
              <FieldWrapper>
                {
                  this.state.isEditMode
                    ? (
                      <FormGroup>
                        <Label for="pcnOwner">PCN Owner</Label>
                        <LDAPSearchInput
                          placeholder={'Enter user'}
                          selected={this.state.data.pcnOwner}
                          onSelectLdap={(event) => this.onChange('pcnOwner', event.label)} />
                      </FormGroup>
                    ) : <FormWidgetText label='PCN Owner' name='pcnOwner' value={this.state.data.pcnOwner} disabled readonly />
                }
              </FieldWrapper>      
              <Col sm={12} md={6}>
                <FormGroup>
                  <Label for="pcnNumber"> PCN Number: </Label>
                  <Input name="pcnNumber"
                    type="text"
                    value={this.state.data.pcnNumber}
                    disabled />
                </FormGroup>
              </Col>

              <Col xs={12} sm={6} md={3}>

                {
                  this.state.isEditMode
                    ? (
                      <FormWidgetButtonYesNo label='Approval Matrix Enabled' name="approvalEnabled" value={this.state.data.approvalEnabled}
                        required disabled={!this.state.isEditMode}
                        onChange={this.onChange}
                        invalid={!this.state.validity.approvalEnabled} validationMessage={this.state.errors.approvalEnabled} />
                    ) :
                    <FormGroup>
                      <Label for="approvalEnabled"> Approval Matrix Enabled: </Label>
                      <Input name="approvalEnabled"
                        type="text"
                        value={this.state.data.approvalEnabled}
                        disabled />
                    </FormGroup>
                }

              </Col>

              
              <Col sm={12} md={6}>
                {
                  this.state.isEditMode
                    ? (
                      <FormWidgetSelect label='Coordinator' name="coordinatorId"
                        value={this.state.data.coordinatorId}
                        disabled={!this.state.isEditMode}
                        options={this.state.optionsForCoordinators}
                        onChange={this.onChange} />
                    ) : <FormGroup>
                      <Label for="coordinatorId"> Coordinator: </Label>
                      <Input name="coordinatorId"
                        type="text"
                        value={`${this.state.data.coordinatorUserName} (${this.state.data.coordinatorUserId})`}
                        disabled />
                    </FormGroup>
                }
              </Col>

              <Col sm={12} md={6}>
                <FormGroup disabled={!this.state.isEditMode}>
                  <Label>URL</Label>
                  <InputGroup>
                    {
                      this.state.isEditMode
                        ? <Input value={this.state.data.url} name="url" onChange={this.onChange} />
                        : <Input value={this.state.data.url} disabled />
                    }
                    <InputGroupAddon addonType="append">
                      <Button onClick={() => this.openLinkInNewTab(this.state.data.url)}><FontAwesome name='link' />{' '}PCN</Button>
                    </InputGroupAddon>
                  </InputGroup>
                </FormGroup>
              </Col>

              <Col sm={12} md={6}>
                {
                  this.state.isEditMode
                    ? (
                      <FormWidgetText label='Title' name='title' value={this.state.data.title}
                        required disabled={!this.state.isEditMode}
                        onChange={this.onChange}
                        invalid={!this.state.validity.title} validationMessage={this.state.errors.title} />
                    ) : <FormGroup>
                      <Label for="title"> Title: </Label>
                      <Input name="title"
                        type="text"
                        value={this.state.data.title}
                        disabled />
                    </FormGroup>
                }
              </Col>

              <Col sm={12} md={6}>
                {
                  this.state.isEditMode
                    ? (
                      <FormWidgetSelect label='Sample Request Window Status' name="status"
                        value={this.state.data.status}
                        required disabled={!this.state.isEditMode}
                        selected={this.state.data.status}
                        options={this.state.optionsForStatus}
                        onChange={this.onChange} />
                    ) : <FormGroup>
                      <Label for="status"> Sample Request Window Status: </Label>
                      <Input name="status"
                        type="text"
                        value={this.state.data.status}
                        disabled />
                    </FormGroup>
                }
              </Col>

              <Col sm={12} md={6}>
                {
                  this.state.isEditMode
                    ? (
                      <FormWidgetText label='Change Type' name="changeType" value={this.state.data.changeType}
                        disabled={!this.state.isEditMode}
                        onChange={this.onChange} />
                    ) : <FormGroup>
                      <Label for="changeType"> Change Type: </Label>
                      <Input name="changeType"
                        type="text"
                        value={this.state.data.changeType}
                        disabled />
                    </FormGroup>
                }
              </Col>

              <Col sm={12} md={6}>
                <FormGroup>
                  <Label for="qualOwner">Qual Owner: </Label>
                  {
                    this.state.isEditMode
                      ? (
                        <LDAPSearchInput
                          placeholder={'Enter user'}
                          selected={this.state.data.qualOwner}
                          onSelectLdap={(event) => this.onChange('qualOwner', event.label)} />
                      ) :
                      <Input name="qualOwner"
                        type="text"
                        value={this.state.data.qualOwner}
                        disabled />
                  }
                </FormGroup>
              </Col>

              

              <Col sm={12} md={6}>
                {
                  this.state.isEditMode
                    ? (
                      <FormWidgetText label='Business Owner' name="businessOwner" value={this.state.data.businessOwner}
                        disabled={!this.state.isEditMode}
                        onChange={this.onChange} />
                    ) : <FormGroup>
                      <Label for="businessOwner"> Business Owner: </Label>
                      <Input name="businessOwner"
                        type="text"
                        value={this.state.data.businessOwner}
                        disabled />
                    </FormGroup>
                }
              </Col>

              <Col sm={12} md={6}>
                {
                  this.state.isEditMode
                    ? (
                      <FormWidgetText label='Affected Businesses' name="affectedBusiness" value={this.state.data.affectedBusiness}
                        disabled={!this.state.isEditMode}
                        onChange={this.onChange} />
                    ) : <FormGroup>
                      <Label for="affectedBusiness"> Affected Businesses: </Label>
                      <Input name="affectedBusiness"
                        type="text"
                        value={this.state.data.affectedBusiness}
                        disabled />
                    </FormGroup>
                }
              </Col>

              <Col xs={12} sm={6} md={3}>
                {
                  this.state.isEditMode
                    ? (
                      <FormWidgetText label='From Site' name="fromSite" value={this.state.data.fromSite}
                        disabled={!this.state.isEditMode}
                        onChange={this.onChange} />
                    ) : <FormGroup>
                      <Label for="fromSite"> From Site: </Label>
                      <Input name="fromSite"
                        type="text"
                        value={this.state.data.fromSite}
                        disabled />
                    </FormGroup>
                }
              </Col>

              <Col xs={12} sm={6} md={3}>
                {
                  this.state.isEditMode
                    ? (
                      <FormWidgetText label='To Site' name="toSite" value={this.state.data.toSite}
                        disabled={!this.state.isEditMode}
                        onChange={this.onChange} />
                    ) : <FormGroup>
                      <Label for="toSite"> To Site: </Label>
                      <Input name="toSite"
                        type="text"
                        value={this.state.data.toSite}
                        disabled />
                    </FormGroup>
                }
              </Col>

              

              <Col xs={12} sm={6} md={3}>
                {
                  this.state.isEditMode
                    ? (
                      <FormWidgetText label='Days Expiration' name='daysExpiration' value={this.state.data.daysExpiration}
                        disabled={!this.state.isEditMode}
                        onChange={this.onChange}
                        invalid={!this.state.validity.daysExpiration} validationMessage={this.state.errors.daysExpiration} />
                    ) : <FormGroup>
                      <Label for="daysExpiration"> Days Expiration: </Label>
                      <Input name="daysExpiration"
                        type="text"
                        value={this.state.data.daysExpiration}
                        disabled />
                    </FormGroup>
                }
              </Col>

              <Col xs={12} sm={6} md={3}>

                {
                  this.state.isEditMode
                    ? (
                      <FormWidgetDatePicker label='Date Published' name='datePublish'
                        value={this.state.data.datePublish !== null ? moment(this.state.data.datePublish, 'YYYY-MM-DD') : undefined}
                        disabled={!this.state.isEditMode}
                        onChange={this.onChange}
                        invalid={!this.state.validity.datePublish} validationMessage={this.state.errors.datePublish} />
                    ) :
                    <FormGroup>
                      <Label for="datePublish"> Date Published: </Label>
                      <Input name="datePublish"
                        type="text"
                        value={this.state.data.datePublish}
                        disabled />
                    </FormGroup>
                }

              </Col>

              <Col xs={12} sm={6} md={3}>
                {
                  this.state.isEditMode
                    ? (
                      <FormWidgetDatePicker label='Last Date for Samples' name='dateLastDateForSamples'
                        value={this.state.data.dateLastDateForSamples !== null ? this.state.data.dateLastDateForSamples : undefined}
                        disabled={!this.state.isEditMode} onChange={this.onChange}
                        invalid={!this.state.validity.dateLastDateForSamples} validationMessage={this.state.errors.dateLastDateForSamples} />
                    ) :
                    <FormGroup>
                      <Label for="dateLastDateForSamples"> Last Date for Samples: </Label>
                      <Input name="dateLastDateForSamples"
                        type="text"
                        value={this.state.data.dateLastDateForSamples}
                        disabled />
                    </FormGroup>
                }
              </Col>

              <Col xs={12} sm={6} md={3}>
                {
                  this.state.isEditMode
                    ? (
                      <FormWidgetDatePicker label='Date Closed' name='dateClosed'
                        value={this.state.data.dateClosed !== null ? this.state.data.dateClosed : undefined}
                        disabled={!this.state.isEditMode} onChange={this.onChange}
                        invalid={!this.state.validity.dateClosed} validationMessage={this.state.errors.dateClosed} />
                    ) :
                    <FormGroup>
                      <Label for="dateClosed"> Date Closed: </Label>
                      <Input name="dateClosed"
                        type="text"
                        value={this.state.data.dateClosed}
                        disabled />
                    </FormGroup>
                }

              </Col>

              <Col xs={12} sm={6} md={3}>
                {
                  this.state.isEditMode
                    ? (
                      <FormWidgetDatePicker label='Date Samples Complete' name='dateSamplesComplete'
                        value={this.state.data.dateSamplesComplete !== null ? this.state.data.dateSamplesComplete : undefined}
                        disabled={!this.state.isEditMode} onChange={this.onChange}
                        invalid={!this.state.validity.dateSamplesComplete} validationMessage={this.state.errors.dateSamplesComplete} />
                    ) :
                    <FormGroup>
                      <Label for="dateSamplesComplete"> Date Samples Complete: </Label>
                      <Input name="dateSamplesComplete"
                        type="text"
                        value={this.state.data.dateSamplesComplete}
                        disabled />
                    </FormGroup>
                }
              </Col>

              <Col xs={12} sm={6} md={3}>
                {
                  this.state.isEditMode
                    ? (
                      <FormWidgetDatePicker label='Date Cancelled' name='dateCanceled'
                        value={this.state.data.dateCanceled !== null ? this.state.data.dateCanceled : undefined}
                        disabled={!this.state.isEditMode} onChange={this.onChange}
                        invalid={!this.state.validity.dateCanceled} validationMessage={this.state.errors.dateCanceled} />
                    ) :
                    <FormGroup>
                      <Label for="dateCanceled"> Date Cancelled: </Label>
                      <Input name="dateCanceled"
                        type="text"
                        value={this.state.data.dateCanceled}
                        disabled />
                    </FormGroup>
                }
              </Col>

              <Col sm={12} md={6}>
                {
                  this.state.isEditMode
                    ? (
                      <FormWidgetTextArea label='Comment' name="comments" value={this.state.data.comments}
                        disabled={!this.state.isEditMode}
                        onChange={this.onChange} />
                    ) : <FormGroup>
                      <Label for="comments"> Comment: </Label>
                      <Input name="comments"
                        type="textarea"
                        value={this.state.data.comments}
                        disabled />
                    </FormGroup>
                }
              </Col>
              */}

            </Row>
          </Form>
        </div>
      )
    } else {
      return (
        <div className={this.props.className}>
          <div id='spinner-container'>
            <Spinner showSpinner={true} overlay={false} />
          </div>
        </div>
      )
    }

  }
}

const FieldWrapper = (props) => { return <Col sm={12} md={6}>{props.children}</Col> }
const FieldWrapperHalf = (props) => { return <Col xs={12} sm={6} md={3}>{props.children}</Col> }

export default styled(PcnAttributes) `

#spinner-container
{
  position: relative;
  padding-top: 4rem;
}
`