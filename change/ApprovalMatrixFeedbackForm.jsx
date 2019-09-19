import React, { Component, } from 'react';
import {
  Row, Col, Table, Form, FormGroup, FormFeedback, Label, Input, Button, Badge
} from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import styled from 'styled-components';

import 'whatwg-fetch';
import FetchUtilities from 'js/universal/FetchUtilities';
import Validator from 'validatorjs';
import Required from "js/universal/Required";
import Dropzone from 'react-dropzone';
import { FormWidgetLdapAutocomplete, } from 'js/universal/FormFieldWidgets';

// Base URL
const URL_FEEDBACK = "/api/v1/approval-matrix/feedback";

// Mock Data
const mockFeedbackListReject = ['Open', 'In-Work', 'Complete']
const mockFeedbackListDataRequest = ['Open', 'In-Work', 'Complete', 'Data Sent', 'SDP Sent']
const mockDispositionList = [
  'SBE decision to implement change without customer approval',
  'New Part Number assigned',
  'EOL/LTB has been completed',
  'Retraction PCN has been sent',
  'Extended Evaluation Period granted',
  'Customer has approved'
]

const columns = [
  { id: 'deviceWwidName', label: 'Worldwide Customer Name' },
  { id: 'deviceCustomerNumber', label: 'Sold-to Customer' },
  { id: 'deviceCustomerName', label: 'Sold-to Customer Name' },
  { id: 'partOrderableMaterial', label: 'Orderable Material' },
  { id: 'pcnPcnType', label: 'PCN Grouping' }
];

const allowedFiles = [
  "zip", "7z", "msg", "css", "csv", "eml",
  "gif", "html", "json", "nsf", "oth", "opf",
  "oxt", "osf", "odc", "otc", "odf", "odft",
  "odi", "oti", "odp", "otp", "ods", "ots",
  "odt", "sxc", "stc", "sxw", "stw", "pic",
  "rtf", "rtx", "sql", "bmp", "rar", "doc",
  "docx", "xls", "xlsx", "ppt", "pptx", "txt",
  "csv", "pdf", "jpg", "jpeg", "png", "tiff",
  "xml"
];

const blockedFiles = [
  "action", "apk", "app", "bat", "bin", "cmd",
  "com", "command", "cpl", "csh", "dll", "exe", "gadget",
  "inf", "ins", "inx", "ipa", "isu", "job", "jse",
  "ksh", "lnk", "msc", "msi", "msp", "mst", "osx",
  "out", "paf", "pif", "prg", "ps1", "reg", "rgs",
  "run", "scr", "sct", "shb", "shs", "u3p", "vb",
  "vbe", "vbs", "vbscript", "workflow", "ws", "wsf",
  "wsh", "oxe", "73k", "89k", "a6p", "ac", "acc", "acr",
  "actm", "ahk", "air", "app", "arscript", "as", "asb",
  "awk", "azw2", "beam", "btm", "cel", "celx", "chm",
  "cof", "crt", "dek", "dld", "dmc", "docm", "dotm",
  "dxl", "ear", "ebm", "ebs", "ebs2", "ecf", "eham",
  "elf", "es", "ex4", "exopc", "ezs", "fas", "fky", "fpi",
  "frs", "fxp", "gs", "ham", "hms", "hpf", "hta", "iim",
  "ipf", "isp", "jar", "js", "jsx", "kix", "lo", "ls",
  "mam", "mcr", "mel", "mpx", "mrc", "ms", "mxe", "nexe",
  "obs", "ore", "otm", "pex", "plx", "potm", "ppam", 
  "ppsm", "pptm", "prc", "pvd", "pwc", "pyc", "pyo",
  "qpx", "rbx", "rox", "rpj", "s2a", "sbs", "sca", "scar",
  "scb", "script", "smm", "spr", "tcp", "thm", "tlb", 
  "udf", "upx", "url", "vlx", "vpm", "wcm", "widget",
  "wiz", "wpk", "wpm", "xap", "xbap", "xlam", "xlm",
  "xlsm", "xltm", "xqt", "xys", "zl9"
];

const ADMIN_ROLES = ['System Admin','ChangeLink Admin','PCN Admin','Sample Coordinator'];

let rules = {}; // Determine the validation rules dynamically based on feedback response
let messages = {
  'required.comments': 'Enter a reason for this status',
  'required.attachments': 'Attach automotive approval email'
};

class ApprovalMatrixFeedbackForm extends Component {

  static defaultProps = {
    status: '',
    selection: [],
    isAutomotive: false
  }

  constructor(props) {
    super(props);

  // TODO - modify to enforce having a role!
  let canEdit = true

    this.state = {
      feedbackList: [],
      dispositionList: [],
      tableData: [],
      status: this.props.status,
      // Form state data
      pcnNumber: undefined,
      isAutomotive: this.props.isAutomotive,
      values: {
        feedbackStatus: this.props.status === 'Rejected' || this.props.status === 'Data Request' ? 'Open' : '',
        dispositionStatus: '',
        comments: '',
        attachments: undefined
      },
      attachments: [],
      // Utility state fields
      validity: {},
      errors: {},
      nestedModal: false,
      // canEdit: props.hasRole(ADMIN_ROLES),
      canEdit: canEdit
    };
  }

  // componentWillReceiveProps(nextProps) {
  //     if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
  //         this.setState({
  //           canEdit: nextProps.hasRole(ADMIN_ROLES)
  //         })
  // }

  componentDidMount() {
    // Fetch the customer device table data
    fetch(`${URL_FEEDBACK}/init/?selection=${JSON.stringify(this.props.selection)}`, {
      credentials: 'include', headers: new Headers({
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      })
    })
      .then(FetchUtilities.checkStatusWithSecurity)
      .then((response) => { return response.json() })
      .then((json) => {
        this.setState({
          tableData: json,
          isAutomotive: json[0].deviceIsAutomotive === 'Y'
        })
        
        // Set some fields that are needed by the validation
        if (this.state.status === 'Rejected' || this.state.status === 'Not Applicable' || this.state.status === 'Data Request' || this.state.status === 'Inquiry')
          rules.comments = 'required'
        if ((this.state.status === 'Approved' || this.state.status === 'Not Applicable') && json[0].deviceIsAutomotive === 'Y')
          rules.attachments = 'required'
          
      })
      .catch((ex) => { throw ex });
    
    // Fetch PCN data
    fetch(`${URL_FEEDBACK}/pcn/?selection=${JSON.stringify(this.props.selection)}`, {
      credentials: 'include', headers: new Headers({
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      })
    })
      .then(FetchUtilities.checkStatusWithSecurity)
      .then((response) => { return response.json() })
      .then((json) => {
        this.setState((previousState) => {
          previousState.pcnNumber = json.pcnNumber;
          previousState.data = { ...previousState.data, 'coordinatorId': json.coordinatorId };
          return previousState;
        });
      })
      .catch((ex) => { throw ex });

    // Fetch dropdown / options data
    // HACK: Replace with data fetch from the database
    this.setState({
      feedbackList: this.props.status === 'Data Request' ? mockFeedbackListDataRequest : mockFeedbackListReject
    })

    // Fetch dropdown / options data
    // HACK: Replace with data fetch from the database
    this.setState({
      dispositionList: mockDispositionList
    })

    this.props.toggleSpinner();
  }

  validate = () => {
    let validation;
    validation = new Validator(this.state.values, rules, messages);
    validation.passes();

    let formValidity = {};
    let formErrors = {};
    Object.keys(this.state.values).forEach(field => {
      formValidity[field] = !validation.errors.has(field);
      formErrors[field] = validation.errors.has(field) ? validation.errors.first(field) : null;
    });

    this.setState({
      validity: formValidity,
      errors: formErrors
    });

    return validation.passes();
  }

  handleChange = (e) => {
    // Get field name and value from event
    const target = e.target;
    this.handleFieldChange(target.name, target.value)
  }

  handleFieldChange = (name, value) => {
    let validation;
    validation = new Validator({ ...this.state.values, [name]: value }, rules, messages);
    validation.passes(); // Trigger validation

    // Set state using function to granularly modify data
    this.setState((previousState) => {
      previousState.values = { ...previousState.values, [name]: value };
      previousState.validity = { ...previousState.validity, [name]: !validation.errors.has(name) };
      previousState.errors = { ...previousState.errors, [name]: validation.errors.has(name) ? validation.errors.first(name) : null };

      return previousState;
    });
  }

  saveAttachments = (data) => {
    if (this.state.attachments && this.state.attachments.length > 0) {

      var query = {
        LOCATION: 'Feedback', //page of the module
        CLASSIFICATION: data.feedbackNumber,
        APP_CONTEXT: data.pcnNumber, //PCN Number
        ATTACH_CONTEXT: data.id,
        DESCRIPTION: ''
      };

      //
      let attachments = new FormData();
      this.state.attachments.forEach((file) => {
        attachments.append(file.name, file);
      });
      fetch(`/attachsvc/upload?` +
        Object.keys(query)
        .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(query[key]))
        .join('&')
        .replace(/%20/g, '+'),{
          method: 'POST',
          body: attachments,
          credentials: 'include',
          headers: new Headers({
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
          })
        })
        .then((response) => {
          if (!response.ok)
            throw new Error({})
        });
    }
  }

  removeAttachment = (i) => {
    let newArr = []
    this.state.attachments.map((item, j) => {
      if (j !== i) {
        newArr.push(this.state.attachments[j])
        return this.state.attachments[j]
      } else {
        return undefined
      }
    })
    this.setState((previousState) => {
      previousState = { ...previousState, 'attachments': newArr };
      previousState.values = { ...previousState.values, 'attachments': newArr.length > 0 ? 'value' : undefined };
      return previousState;
    });
  }

  handleSubmit = (event) => {
    event.preventDefault()

    // Validate
    if (this.validate()) {
      // Show the spinner
      this.props.toggleSpinner();

      // Set the form data to be submitted
      let formdata = {
        pcnNumber: this.state.pcnNumber,
        response: this.state.status,
        state: this.state.values.state,
        comments: this.state.values.comments,
        feedbackStatus: this.state.values.feedbackStatus,
        dispositionStatus: this.state.values.dispositionStatus,
        coordinatorId: this.state.values.coordinatorId,
        coordinatorComments: this.state.values.coordinatorComments,
        customerContact: this.state.values.customerContact,
        tiContact: this.state.values.tiContact,
        newPartNumber: this.state.values.newPartNumber,
        devices: this.props.selection,
        custNumbers: this.state.tableData.map(function (row) { return row.deviceCustomerNumber })
      };
      
      fetch(`${URL_FEEDBACK}`,
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
        .then((response) => { return response.json() })
        .then((json) => {
          this.saveAttachments(json);
          this.props.toggleSpinner();
          this.props.onSubmit('Feedback added.', true);
        })
        .catch((ex) => {
          this.props.toggleSpinner();
          throw ex;
        });
    }
  }

  handleClose = () => {
    if (typeof this.props.onCancel === 'function') {
      this.props.onCancel();
    }
  }

  render() {
    const isReject = this.state.status === 'Rejected';
    const isApprove = this.state.status === 'Approved';
    const isNA = this.state.status === 'Not Applicable';
    const isDataRequest = this.state.status === 'Data Request';
    const isDisposition = this.state.status === 'Dispositioned';
    const isInquiry = this.state.status === 'Inquiry';
    const hasAutomotive = this.state.isAutomotive;

    return (
      <div className={this.props.className}>
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
              this.state.tableData !== undefined && this.state.tableData.length > 0
                ? (
                  this.state.tableData.map((row, i) => {
                    return (
                      <tr>
                        {
                          columns.map((column, j) => {
                            return (<td key={`appmtx-frm-${i}-${j}`}>{row[column.id]}</td>)
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

        <Form autoComplete="off" id="formApprovalMatrixFeedback" noValidate>
          <Input name="status" value={this.state.status} type="hidden" />

          <FormGroup>
            <Label for="comments"><Required required={isReject || isNA || isDataRequest || isInquiry}>Comments</Required></Label>
            <Input
              type="textarea" name="comments"
              value={this.state.values.comments ? this.state.values.comments : ''}
              invalid={(isReject || isNA || isDataRequest || isInquiry) && !this.state.validity.comments}
              onChange={this.handleChange}
            />
            <FormFeedback>{this.state.errors.comments}</FormFeedback>
          </FormGroup>

          <Row>
            <Col xs={12} md={6}>
              <FormGroup>
                <Label for="customerContact">Customer Contact</Label>
                <Input
                  name="customerContact"
                  value={this.state.values.customerContact ? this.state.values.customerContact : ''}
                  onChange={this.handleChange}
                />
              </FormGroup>
            </Col>

            <Col xs={12} md={6}>
              <FormWidgetLdapAutocomplete label="TI Contact" name="tiContact" value={this.state.values.tiContact}
                                          onChange={this.handleFieldChange} badgeOnly />
            </Col>
          </Row>

          {isDisposition && this.state.canEdit ? (
            <div>
              <hr />
              <FormGroup>
                <Label for="dispositionStatus">Disposition status</Label>
                <div>
                  {
                    this.state.dispositionList.map((disposition, i) => {
                      return (
                        <FormGroup check>
                          <Label check>
                            <Input type="radio" name="disposition" id={"disposition" + i}
                              value={disposition}
                              checked={this.state.values.disposition === disposition}
                              onChange={this.handleChange} />{' '}{disposition}
                          </Label>
                        </FormGroup>
                      )
                    })
                  }
                </div>
              </FormGroup>
              <FormGroup>
                <Label for="newPartNumber">New Part Number</Label>
                <Input
                  name="newPartNumber"
                  value={this.state.values.newPartNumber ? this.state.values.newPartNumber : ''}
                  onChange={this.handleChange}
                />
              </FormGroup>
              <FormGroup>
                <Label for="coordinatorComments">Resolution Comments</Label>
                <Input
                  type="textarea" name="coordinatorComments"
                  value={this.state.values.coordinatorComments ? this.state.values.coordinatorComments : ''}
                  onChange={this.handleChange}
                />
              </FormGroup>
            </div>
          ) : undefined
          }

          <FormGroup>
            <Label for="attachments"><Required required={(isApprove && hasAutomotive) || (isNA && hasAutomotive)}>Please select a file to attach</Required></Label>
            <Dropzone name="uploadFile" className='dropzone' 
              // accept={acceptedFileTypes}
              onDrop={(files) => {
                let accepted = [];
                let rejected = [];
                for(let i in files){
                  let fileName = files[i].name
                  let fileExt = fileName.split('.').pop();
                  if(blockedFiles.includes(fileExt.toLocaleLowerCase())){
                      rejected.push(files[i]);
                  }else{
                      accepted.push(files[i]);
                  }       
                }
                this.setState((previousState) => {
                  previousState = { ...previousState, attachments: this.state.attachments.concat(accepted) };
                  previousState.values = { ...previousState.values, attachments: 'value' };
                  previousState.validity = { ...previousState.validity, attachments: true };
                  return previousState;
                });
              }}>
              <p><FontAwesome name="cloud-upload" />{' '}Drop files to attach, or <a href="#" onClick={(event) => { event.preventDefault() }}>browse</a>.</p>
            </Dropzone>
            <Input type="hidden" name="attachments" invalid={!this.state.validity.attachments}/>
            <FormFeedback>{this.state.errors.attachments}</FormFeedback>
            {
              this.state.attachments !== undefined && this.state.attachments.length > 0
                ? (
                  <ul>
                    {
                      this.state.attachments.map((f, i) => {
                        return (
                          <li key={f.name} className="fileList">
                            <FontAwesome name="times-circle" onClick={() => this.removeAttachment(i)} />
                            {' '}{f.name}{' '}
                            <Badge color="dark" pill>{f.size} Bytes</Badge>
                          </li>
                        )
                      })
                    }
                  </ul>
                ) : undefined
            }
          </FormGroup>

          <Button color="primary" className="mr-1 float-right" onClick={this.handleSubmit}><FontAwesome name="save" />{' '}Save</Button>
          <Button color="secondary" outline className="mr-1 float-right" onClick={this.handleClose}>Close</Button>
        </Form>
      </div >
    )
  }
}

export default styled(ApprovalMatrixFeedbackForm) `
.dropzone
{
  width: 100% !important;
  height: 2.5em !important;
  border: 2px dashed rgb(206, 212, 218);
  text-align: center;
  padding-top: .25rem;
  font-size: 13px;
  border-radius: .3em;
}

ul
{
  list-style: none;  
  padding-left: 1em;
}

.fileList 
{
  > .fa
  {
    cursor: pointer;
  }
}
`;
