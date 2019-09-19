import React from 'react'
import 'whatwg-fetch'
import FetchUtilities from 'js/universal/FetchUtilities'
import { Container, Row, Col, Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, 
  Modal, ModalBody, ModalHeader } from 'reactstrap'
import FontAwesome from 'react-fontawesome'
import Validator from 'validatorjs'

import {
  FormWidgetStatic, FormWidgetText, FormWidgetTextArea, FormWidgetNumber,
  FormWidgetReactSelect, FormWidgetReactMultiSelect, FormWidgetDatePicker, FormWidgetLdapAutocomplete
} from 'js/universal/FormFieldWidgets'
import { InfoModal, successModal, } from 'js/universal/Modals'
import Spinner, { showOverlaySpinner, hideOverlaySpinner } from 'js/universal/spinner'
import DiaryPage, { DiaryForm } from 'js/app/views/home/tabs/DiaryPage'

const URL = '/api/v1/trksample/dashboard/s' // Live data
const URL_STATE_ONLY = '/api/v1/trksample/dashboard/s/state' // Live data
const DIARY_BASE_URL = "/api/v1/diary";
const ADMIN_ROLES = ['ChangeLink Admin', 'System Admin', 'Sample Coordinator']

let headers = new Headers({
  'Pragma': 'no-cache',
  'Cache-Control': 'no-cache'
})

let rules = {
  QUANTITY: ['numeric'],
  SWR_FINAL_QUANTITY: ['numeric'],
  START_QUANTITY: ['numeric'],
  X_CHAIN: ['numeric']
}
let messages = {
  'numeric':'This field only accepts numeric values.'
}

class SampleForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      canUpdate: props.hasRole(ADMIN_ROLES),
      formVisible: false,
      formVisible2: false,
      showSpinner: false,
      dropdownOpen: false,
      tableRowData: {},
    };

    this.loadSampleData = this.loadSampleData.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.onChange = this.onChange.bind(this);
    this.validate = this.validate.bind(this)
    this.handleStateSelect = this.handleStateSelect.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleForm = this.toggleForm.bind(this)
    this.toggleForm2 = this.toggleForm2.bind(this)
    this.handleFormCancel = this.handleFormCancel.bind(this)
  }

  componentDidMount() {
    this.setState({ states: this.props.states })
    this.loadSampleData(this.props.sample, this.props.state)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.sample !== this.state.sampleNumber) {
      this.setState({ states: nextProps.states, data: undefined })
    }
    if (nextProps.sample !== this.state.sampleNumber || nextProps.state !== this.state.status) {
      this.setState({ data: undefined })
      this.loadSampleData(nextProps.sample, nextProps.state)
    }    
    if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess)) {
      this.setState({
          canUpdate: nextProps.hasRole(ADMIN_ROLES)
      })
    }
  }

  loadSampleData(sample, status) {
    let FETCH_URL = `${URL}/${sample}/${status}` // Live API data
    // let FETCH_URL = '/json/samples/mock-form.json' // Mock data

    fetch(FETCH_URL, { credentials: 'include', headers: headers })
      .then(FetchUtilities.checkStatusWithSecurity)
      .then((response) => { return response.json() })
      .then((json) => {
        let form = {}
        for (let i in json) {
          form[json[i].key] = json[i].value
        }
        this.setState({
          sampleNumber: sample, // Init the sample number
          status: status,       // Init the current state
          nextState: status,    // Init the next state, default to current state
          data: json,           // Init the fields data
          form: form            // Init the form data
        })
      })
      .catch((ex) => {
        this.setState({
          data: [],
          notifyType: 'danger',
          notifyMessage: `Error encountered while fetching the form for tab ${status}. Please contact support to report this problem.`
        })
      });
  }

  toggleDropdown() {
    this.setState({ dropdownOpen: !this.state.dropdownOpen });
  }

  notify(notifyType, notifyMessage) {
    this.setState({ notifyType: notifyType, notifyMessage: notifyMessage })
  }

  onChange(name, value) {
    // Set state using function to granularly modify data
    this.setState((previousState) => {
      previousState.form = { ...previousState.form, [name]: value };
      return previousState;
    });
  }

  // Handle form validation
  validate() {
    let validation = new Validator(this.state.form, rules, messages);
    let isValid = validation.passes(); // Trigger validation

    let formValidity = {};
    let formErrors = {};
    for (let field in this.state.form) {
      formValidity[field] = !validation.errors.has(field);
      formErrors[field] = validation.errors.has(field) ? validation.errors.first(field) : null;
    }

    this.setState({
      validity: formValidity,
      errors: formErrors
    });

    return isValid;
  }

  handleStateSelect(event, state) {
    event.preventDefault();
    this.setState({
      nextState: state
    });
  }

  handleSubmit() {
    if (this.state.data !== undefined && this.state.data.length > 0) {
      // Process the form and the state change
      if (this.validate()) {
        // Show the spinner
        this.setState({ showSpinner: true })

        let form = {}
        form.fields = this.state.data
        for (let i in form.fields) {
          form.fields[i].value = this.state.form[form.fields[i].key]
        }

        fetch(`${URL}/${this.state.sampleNumber}/${this.state.nextState}`,
          {
            method: 'POST',
            body: JSON.stringify(form),
            headers: new Headers({
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Pragma': 'no-cache',
              'Cache-Control': 'no-cache'
            }),
            credentials: 'include',
          })
          .then(FetchUtilities.checkStatusWithSecurity)
          .then((response) => {
            if (response.status >= 200 && response.status < 300) {
              this.notify('success', 'Sample record sucessfully updated')
              this.setState({ showSpinner: false })
              this.props.refreshForm(this.state.nextState)
            } else {
              return response.json()
            }
          })
          .then((json) => {
            this.setState({ showSpinner: false })
            if (json !== undefined) {
              if (json.message !== undefined)
                this.notify('danger', json.message)
              else
                this.notify('danger', 'System error encountered. Transaction aborted.')
            }
          })
          .catch((error) => {
            this.setState({ showSpinner: false })
            if (!!error && !!error.message)
              this.notify('danger', 'Encountered error: ' + error.message)
            else
              this.notify('danger', 'Transaction failed due to an error encountered by the system.')
          });
      }
    } else {
      // Only process the state
      if (this.state.nextState !== this.state.status) {
        fetch(`${URL_STATE_ONLY}/${this.state.sampleNumber}/${this.state.nextState}`,
          {
            method: 'POST',
            headers: new Headers({
              'Pragma': 'no-cache',
              'Cache-Control': 'no-cache'
            }),
            credentials: 'include',
          })
          .then(FetchUtilities.checkStatusWithSecurity)
          .then((response) => {
            if (response.status >= 200 && response.status < 300) {
              this.notify('success', 'Sample status sucessfully updated to ' + this.state.nextState)
              this.setState({ showSpinner: false })
              this.props.refreshForm(this.state.nextState)
            } else {
              return response.json()
            }
          })
          .then((json) => {
            this.setState({ showSpinner: false })
            if (json !== undefined) {
              if (json.message !== undefined)
                this.notify('danger', json.message)
              else
                this.notify('danger', 'System error encountered. Transaction aborted.')
            }
          })
          .catch((error) => {
            this.setState({ showSpinner: false })
            if (!!error && !!error.message)
              this.notify('danger', 'Encountered error: ' + error.message)
            else
              this.notify('danger', 'Transaction failed due to an error encountered by the system.')
          });
      } else {
        this.notify('warning', 'State is not changed. Current state: ' + this.state.status)
      }
    }
  }

  toggleForm(row) {
    this.setState({
      tableRowData: row,
      formVisible: !this.state.formVisible
    });
  }

  addDiary = (row) => {
    this.setState({
      tableRowData: row.data,
      formVisible: true,
      sample: this.props.sample
    });

  }

  toggleForm2(row) {
    this.setState({
      tableRowData: row,
      formVisible2: !this.state.formVisible2
    });
  }

  showDiary = (row) => {
    this.setState({
      tableRowData: row.data,
      formVisible2: true,
    });

  }

  handleFormCancel() {
    this.setState({
      formVisible: false,
      formVisible2: false,
      formVisible3: false,
      handleDelete: false
    });
  }

  handleAddDiary = (method, data) => {
    showOverlaySpinner()
    FetchUtilities.fetchPost(`${DIARY_BASE_URL}/`, data,
        (httpStatus, response) => {
            if (httpStatus === 200) {
                this.toggleForm()
                hideOverlaySpinner()
                successModal('Change diary entry added.', true)
            } else { throw new Error('Transaction failed') }
        }, _ => {
            hideOverlaySpinner()
        }
    )
  }

  render() {
    let others = {...this.props}
    if (this.state.data !== undefined) {
      let notifyIcon = this.state.notifyType === 'success' ? 'check-circle' : this.state.notifyType === 'danger' ? 'exclamation-circle' : 'info-circle'
      let notifyTitle = this.state.notifyType === 'success' ? 'Success' : this.state.notifyType === 'danger' ? 'Error' : 'Notice'
      
        return (
          <Container>
            
              <Modal
                isOpen={this.state.formVisible}
                toggle={this.toggleForm}
                fade={true}>
                <ModalHeader toggle={this.toggleForm}>Add Entry</ModalHeader>
                <ModalBody>
                  <DiaryForm types={['Sample']} contextType='Sample' data={{ contextId: this.props.sample, contextType: 'Sample' }} method={'INSERT'}
                        onSubmit={this.handleAddDiary} onClose={this.toggleForm} />
                </ModalBody>
              </Modal>

              <Modal
                isOpen={this.state.formVisible2}
                toggle={this.toggleForm2}
                fade={true} size='lg'>
                <ModalHeader toggle={this.toggleForm2}>Sample Diary Entries</ModalHeader>
                <ModalBody>
                  <DiaryPage {...others} sampleNumber={this.props.sample}/>
                </ModalBody>
              </Modal>
            
            { this.state.data.length > 0
              ? (
                <Row>
                  {
                    this.state.data.map((field, i) => {
                      switch (field.widget) {
                        case 'STATIC':
                          return <Col sm={12} md={6} key={`smpfrm-fld-${i}`}>
                            <FormWidgetStatic id={field.key} name={field.key} label={field.label} value={this.state.form[field.key]} onChange={this.onChange} />
                          </Col>
                        case 'NUMBER':
                          return <Col sm={12} md={6} key={`smpfrm-fld-${i}`}>
                            <FormWidgetNumber id={field.key} name={field.key} label={field.label} value={this.state.form[field.key]} onChange={this.onChange} />
                          </Col>
                        case 'TEXT':
                          return <Col sm={12} md={6} key={`smpfrm-fld-${i}`}>
                            <FormWidgetText id={field.key} name={field.key} label={field.label} value={this.state.form[field.key]} maxLength={field.maxlength} onChange={this.onChange} />
                          </Col>
                        case 'TEXTAREA':
                          return <Col sm={12} md={6} key={`smpfrm-fld-${i}`}>
                            <FormWidgetTextArea id={field.key} name={field.key} label={field.label} value={this.state.form[field.key]} maxLength={field.maxlength} onChange={this.onChange} />
                          </Col>
                        case 'DATE':
                          return <Col sm={12} md={6} key={`smpfrm-fld-${i}`}>
                            <FormWidgetDatePicker id={field.key} name={field.key} label={field.label} value={this.state.form[field.key] !== null ? this.state.form[field.key] : undefined} onChange={this.onChange} />
                          </Col>
                        case 'SELECT':
                          return <Col sm={12} md={6} key={`smpfrm-fld-${i}`}>
                            <FormWidgetReactSelect id={field.key} name={field.key} label={field.label} value={this.state.form[field.key]} onChange={this.onChange} />
                          </Col>
                        case 'MULTISELECT':
                          return <Col sm={12} md={6} key={`smpfrm-fld-${i}`}>
                            <FormWidgetReactMultiSelect id={field.key} name={field.key} label={field.label} value={this.state.form[field.key]} onChange={this.onChange} />
                          </Col>
                        case 'LDAP':
                          return <Col sm={12} md={6} key={`smpfrm-fld-${i}`}>
                            <FormWidgetLdapAutocomplete id={field.key} name={field.key} label={field.label} value={this.state.form[field.key]} onChange={this.onChange} badgeOnly />
                          </Col>
                        default:
                          return undefined
                      }
                    })
                  }
                </Row>
              ) : <div>No fields found in this tab</div> 
            }

            {
              this.state.canUpdate
                ? <Row>
                  <Col xs={12}>
                    <hr />
                    <span className='pull-right'>
                      <ButtonDropdown direction="up" isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown}>
                        <DropdownToggle caret color="primary">
                          {this.state.nextState}
                        </DropdownToggle>
                        <DropdownMenu>
                          {
                            this.props.states.map((state, j) => {
                              return (
                                <DropdownItem key={`smpfrm-nxt-${j}`} onClick={(event) => this.handleStateSelect(event, state)}>{state}</DropdownItem>
                              )
                            })
                          }
                        </DropdownMenu>
                      </ButtonDropdown>
                      <Button color='primary' className='ml-1' onClick={this.handleSubmit}><FontAwesome name="save" />{' '}Save</Button>
                    </span>
                    <span>
                      <button onClick={this.addDiary} className='btn btn-sm btn-primary mr-1' type='button'>
                        <FontAwesome name='plus' /> Add Diary Entry
                      </button>
                      <button onClick={this.showDiary} className='btn btn-sm btn-outline-secondary mr-1' type='button'>
                        Show Existing Diary Entries
                      </button>
                    </span>
                  </Col>
                </Row>
                : undefined
            }

            {
              !!this.state.notifyType ? (
                <InfoModal icon={notifyIcon} color={this.state.notifyType}
                  title={notifyTitle} message={this.state.notifyMessage}
                  handleClose={() => this.setState({ notifyType: undefined })} />
              ) : undefined
            }
            {!!this.state.showSpinner ? <Spinner showSpinner={this.state.showSpinner} /> : undefined}
          </Container>
        )
    } else {
      return (
        <div className='p-2' style={{ height: '10rem' }}>
          <Spinner showSpinner overlay={false} />
        </div>
      )
    }
  }

}

export default SampleForm
