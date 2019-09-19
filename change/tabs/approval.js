import React, {Component} from 'react'
import { Button, Row, Col, Card, Label, Input, CardBody, 
         CardTitle, Table, Form, InputGroup, InputGroupAddon, InputGroupText,
         Modal, ModalHeader, ModalBody, UncontrolledTooltip, Alert } from 'reactstrap'
import SuperCard from "js/universal/SuperCard"
import { PrimaryButton, SecondaryButton, DangerButton } from 'js/app/models/ChangelinkUI'
import { FormWidgetSelect, FormWidgetTextArea, FormWidgetText } from 'js/universal/FormFieldWidgets'
import FetchUtilities from 'js/universal/FetchUtilities'
import Spinner, { showOverlaySpinner, hideOverlaySpinner } from 'js/universal/spinner'
import { NeutralAlert, GoodAlert, AwesomeCheckbox }from 'js/app/models/ChangelinkUI'
import ReactiveTable, { ReactiveTableStore, }  from 'reactive-tables'
import Validator from 'validatorjs'
import { ConfirmDeleteModal, InfoModal, ComponentModal } from 'js/universal/Modals'
import classnames from 'classnames'
import ScrollToTop from 'js/universal/ScrollToTop'

let headers = new Headers({
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache'
})

let rules = {
    changeState: ['required'],
    notificationClass: ['required'],
    notificationPeriod: ['required'],
    notificationResp: ['required'],
}

let message = {
    'required': 'This field is required.',
    'required_if': 'This field is conditionally required.'
}

let URL = '/api/v1/change/approval/'
let saveURL = '/api/v1/change/approval/save/details'
let resetURL = '/api/v1/change/approval/reset/approvals/'

const ADMIN_ROLES = ['System Admin', 'ChangeLink Admin', 'Change Coordinator']
class ApprovalTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            changeNumber: this.props.changeNumber,
            changeStateValues: [],
            notificationClassValues: [],
            notificationPeriodValues: [],
            notificationResponsibilityValues: [],
            additionalComments: "",
            approverDetails: [],
            approvalDetails: [],
            modalVisible: false,
            canUpdate: props.hasRole(ADMIN_ROLES)            
        }
    }

    componentDidMount() {
        this.fetchDropdownValues();
        this.fetchApprovalDetails();
        this.fetchApprovers();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            canUpdate: nextProps.hasRole(ADMIN_ROLES)
        })
    }

    fetchApprovalDetails = () => {
        fetch(URL + "details/" + this.props.changeNumber, {
            credentials: 'include', headers: headers
        })
        .then(FetchUtilities.checkStatusWithSecurity)
        .then(response => response.json())
        .then((json) => {
            this.setState({ approvalDetails: json })
        })
        .catch(error => FetchUtilities.handleError(error))
    }

    fetchDropdownValues = () => {
        fetch(URL + "states", {
            credentials: 'include', headers: headers
        })
        .then(FetchUtilities.checkStatusWithSecurity)
        .then(response => response.json())
        .then((json) => {
            this.setState({changeStateValues: json })
        })
        .catch(error => FetchUtilities.handleError(error))

        fetch(URL + "notificationPeriod", {
            credentials: 'include', headers: headers
        })
        .then(FetchUtilities.checkStatusWithSecurity)
        .then(response => response.json())
        .then((json) => {
            this.setState({notificationPeriodValues: json })
        })
        .catch(error => FetchUtilities.handleError(error))

        fetch(URL + "notificationClass", {
            credentials: 'include', headers: headers
        })
        .then(FetchUtilities.checkStatusWithSecurity)
        .then(response => response.json())
        .then((json) => {
            this.setState({notificationClassValues: json })
        })
        .catch(error => FetchUtilities.handleError(error))

        fetch(URL + "notificationResp", {
            credentials: 'include', headers: headers
        })
        .then(FetchUtilities.checkStatusWithSecurity)
        .then(response => response.json())
        .then((json) => {
            this.setState({notificationResponsibilityValues: json })
        })
        .catch(error => FetchUtilities.handleError(error))
    }

    fetchApprovers = () => {
        showOverlaySpinner()
        fetch(URL + "approvers/" + this.props.changeNumber, {
            credentials: 'include', headers: headers
        })
        .then(FetchUtilities.checkStatusWithSecurity)
        .then(response => response.json())
        .then((json) => {
            this.setState({ approverDetails: json }, () => hideOverlaySpinner())
        })
        .catch(error => FetchUtilities.handleError(error))
    }

    toggleReasonsReport = () => {
        this.setState({ modalVisible: !this.state.modalVisible})
    }

    render() {
        const {...details} = this.state;
        return (
            <React.Fragment>
                <ApprovalDetails {...details} 
                                getApprovers={this.fetchApprovers} 
                                getReasonsReport={this.toggleReasonsReport} 
                                getDetails={this.fetchApprovalDetails}/>
                <ReasonsReport {...details} getReasonsReport={this.toggleReasonsReport} />
                <ScrollToTop placement="right" color="primary" />
            </React.Fragment>
        )
    }
}

class ApprovalDetails extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            toggleModal: false,
            indexModal: undefined,
            getAutoSelectApprovers: {
                message: null
            },
            validity: {},
            errors: {},
            checked: false,
            assigned: {},
            chosenApprovals: [],
            checkboxes: [],
            notSubmittedState: {
                length: 0
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        let notSubmittedState = nextProps.approvalDetails.filter(obj => {return (obj.changeStateId !== 2 )})
        let assigned = nextProps.approverDetails.map((d, i) => {
            let approvedCheck = false;
            let notApprovedCheck = false;
            let condApprovedCheck = false;

            if (d.approval === 'on') {
                approvedCheck = true
            } else if(d.approval === 'N') {
                notApprovedCheck = true
            } else if (d.approval === 'C') {
                condApprovedCheck = true
            } 

            if(d.assigned === 'Y' && d.additionalComments === 'AUTO-SELECTED') {
                return {
                    oldCheck: null,
                    checked: true,
                    mccbId: d.mccbId,
                    primaryName: d.primaryName,
                    primaryApprover: d.primaryEmpNo,
                    delegateName: d.delegateName,
                    delegateApprover: d.delegateEmpNo,
                    roleId: d.roleId,
                    approval: d.approval,
                    approvedCheck: approvedCheck,
                    notApprovedCheck: notApprovedCheck,
                    condApprovedCheck: condApprovedCheck,
                    approverComments: d.approverComments,
                    changeNumber: this.props.changeNumber,
                    mccbName: d.mccbName,

                }
            } else if (d.assigned === 'Y') {
                return {
                        oldCheck: true,
                        checked: true,
                        mccbId: d.mccbId,
                        primaryName: d.primaryName,
                        primaryApprover: d.primaryEmpNo,
                        delegateName: d.delegateName,
                        delegateApprover: d.delegateEmpNo,
                        roleId: d.roleId,
                        approval: d.approval,
                        approvedCheck: approvedCheck,
                        notApprovedCheck: notApprovedCheck,
                        condApprovedCheck: condApprovedCheck,
                        approverComments: d.approverComments, 
                        changeNumber: this.props.changeNumber,
                        mccbName: d.mccbName,
                        }
            } else {
                return {
                        oldCheck: false,
                        checked: false,
                        mccbId: d.mccbId,
                        primaryName: d.primaryName,
                        primaryApprover: d.primaryEmpNo,
                        delegateName: d.delegateName,
                        delegateApprover: d.delegateEmpNo,
                        roleId: d.roleId,
                        approval: d.approval,
                        approvedCheck: approvedCheck,
                        notApprovedCheck: notApprovedCheck,
                        condApprovedCheck: condApprovedCheck,
                        approverComments: d.approverComments, 
                        changeNumber: this.props.changeNumber,
                        mccbName: d.mccbName,
                       }
            }
        })

        this.setState({
            assigned: assigned
        })

        if(this.state.getAutoSelectApprovers.message === null) {
            let data = nextProps.approvalDetails.map((d, i) => {
                let notificationResp = "WW PCN Group"
                
                return {
                    changeState: d.changeState,
                    changeStateId: d.changeStateId,
                    notificationClass: d.notificationClass,
                    notificationPeriod: d.notificationPeriod,                 
                    notificationResp: d.notificationResp !== null ? d.notificationResp: notificationResp,
                    additionalComments: d.additionalComments,
                    daysRemaining: d.daysRemaining,
                    mccbId: d.mccbId,
                    changeId: d.changeId,
                    changeNumber: this.props.changeNumber,
                    mccbName: d.mccbName,
                    validity: {},
                    errors: {}
                }
            })

                this.setState({
                    data: data,
                    notSubmittedState: notSubmittedState
            })
        } 
    }

    validate = () => {
        let validation;
        let needApprovers = false;
        
        let result = this.state.assigned.filter(obj => { return (obj.checked === true || obj.approverComments === 'AUTO-SELECTED')} );
        let states = this.state.data.filter(obj => { return (obj.changeStateId !== 2)})
        let submittedStates = this.state.data.filter(obj => { return (obj.changeStateId === 2 && (obj.notificationClass !== null || obj.notificationClass !== ""))})


        this.state.data.forEach((item, index) => {
            let getResult = result.filter(obj => { return (obj.mccbId === item.mccbId)})
            //Rule: If change state is Reviewed 
            if(item.changeStateId === 3) {
                    validation = new Validator(item, rules, message);
                    validation.passes();

                    let formValidity = {}; 
                    let formErrors = {};

                    for(let field in item) {
                        formValidity[field] = !validation.errors.has(field);
                        formErrors[field] = validation.errors.has(field) ? validation.errors.first(field) : null;
                    }

                    this.setState(previousState => {
                        const data = [...previousState.data];
                        data[index] = { ...data[index], validity: formValidity, errors: formErrors};
                        return {data};
                    })
            //Rule: If change state is Submitted && there are other change states aside from "Submitted"
            } else if (item.changeStateId === 2 && states.length > 0) {
                //If checkbox is checked but no header is selected
                if( result.length > 0 && getResult.length > 0 ) {
                    validation = new Validator(item, rules, message);
                    validation.passes();

                    let formValidity = {}; 
                    let formErrors = {};

                    for(let field in item) {
                        formValidity[field] = !validation.errors.has(field);
                        formErrors[field] = validation.errors.has(field) ? validation.errors.first(field) : null;
                    }

                    this.setState(previousState => {
                        const data = [...previousState.data];
                        data[index] = { ...data[index], validity: formValidity, errors: formErrors};
                        return {data};
                    })
                } 
            //Rule: If change state is Submitted && there are two or more Submitted MCCBs
            } else if (item.changeStateId === 2) {
                //If checkbox is checked but no header is selected
                if(result.length > 0 && getResult.length > 0) {
                    if(item.notificationClass === null || item.notificationPeriod === null) {
                        validation = new Validator(item, rules, message);
                        validation.passes();

                        let formValidity = {}; 
                        let formErrors = {};

                        for(let field in item) {
                            formValidity[field] = !validation.errors.has(field);
                            formErrors[field] = validation.errors.has(field) ? validation.errors.first(field) : null;
                        }

                        this.setState(previousState => {
                            const data = [...previousState.data];
                            data[index] = { ...data[index], validity: formValidity, errors: formErrors};
                            return {data};
                        })
                    //If no checkbox is checked and no headers are selected
                    } else {
                        validation = new Validator(item, rules, message);
                        validation.passes();

                        let formValidity = {}; 
                        let formErrors = {};

                        for(let field in item) {
                            formValidity[field] = !validation.errors.has(field);
                            formErrors[field] = validation.errors.has(field) ? validation.errors.first(field) : null;
                        }

                        this.setState(previousState => {
                            const data = [...previousState.data];
                            data[index] = { ...data[index], validity: formValidity, errors: formErrors};
                            return {data};
                        })
                    }
                //If no checkboxes are selected -> pop up appears
                } else if (result.length === 0) {
                    needApprovers = true
                }
            //For other change states (!Submitted)
            } else {
                validation = new Validator(item, rules, message);
                validation.passes();

                let formValidity = {}; 
                let formErrors = {};

                for(let field in item) {
                    formValidity[field] = !validation.errors.has(field);
                    formErrors[field] = validation.errors.has(field) ? validation.errors.first(field) : null;
                }

                this.setState(previousState => {
                    const data = [...previousState.data];
                    data[index] = { ...data[index], validity: formValidity, errors: formErrors};
                    return {data};
                })
            }
        })

        if(needApprovers === true) {
            this.setState({
                indexModal: 'info'
            })
        } else {
            return validation.passes();
        }
    }

    handleInputChange = (index, name, value) => {
        //check for empty string
        if( value === "") {
            value = null
        }
        
        this.setState(previousState => {
            const data = [...previousState.data];
            data[index] = { ...data[index], [name]: value};
            return {data};
        })
    }

    handleApproverInputChange = (index, name, value) => {
        this.setState(previousState => {
            const assigned = [...previousState.assigned];
            assigned[index] = { ...assigned[index], [name]: value};
            return {assigned};
        }, () => this.setState(previousState => ({
            chosenApprovals: [ ...this.state.chosenApprovals, this.state.assigned[index]]
        })))
    }

    handleSave = () => {
        showOverlaySpinner()
        if(this.validate()) {
            let body = {
                details: this.state.data,
                approvals: this.state.assigned,
                chosenApprovals: this.state.chosenApprovals
            }
            this.setState({
                getAutoSelectApprovers: {
                    message: null
                }
            })

            fetch(saveURL, {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }),
                credentials: 'include',
                body: JSON.stringify(body)
            })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => {
                this.props.getApprovers();
                this.props.getDetails();
                if (typeof this.props.refresh === 'function') {
                    this.props.refresh() // Refresh the parent page to reflect updated data
                    this.setState({ canSubmit: false })
                } else {
                    window.location.reload() // Refresh the whole page as fallback
                }
            })
            .catch(error => FetchUtilities.handleError(error))
        }
        hideOverlaySpinner()
    }

    getAutoSelectApprovers = () => {
        showOverlaySpinner()
        fetch("/api/v1/auto_select_approvers/" + this.props.changeNumber, {
            credentials: 'include', headers: headers
        })
        .then(FetchUtilities.checkStatusWithSecurity)
        .then(response => response.json())
        .then((json) => {
            this.setState({ getAutoSelectApprovers: json }, () => this.props.getApprovers())
        })
        .catch(error => FetchUtilities.handleError(error))
    }

    changeCheckBoxFields = (index) => {
        
        let check = !this.state.assigned[index].checked

        this.setState(previousState => {
            const assigned = [...previousState.assigned]
            assigned[index] = { ...assigned[index], checked: check}
            return { assigned }
        })
    }

    approvalCheckBoxFields = (name, index) => {
        let check = !this.state.assigned[index][name]

            if ( name === 'approvedCheck' && check === true) {
                this.setState(previousState => {
                    const assigned = [ ...previousState.assigned]
                    assigned[index] = { ...assigned[index], 
                                        [name] : check, 
                                        approval: 'on', 
                                        notApprovedCheck: false, 
                                        condApprovedCheck: false
                                    }
                    return { assigned }
                }, () => this.setState(previousState => ({
                    chosenApprovals: [ ...this.state.chosenApprovals, this.state.assigned[index]]
                })))
            } else if ( name === 'notApprovedCheck' && check === true) {
                this.setState(previousState => {
                    const assigned = [ ...previousState.assigned]
                    assigned[index] = { ...assigned[index], 
                                        [name] : check, 
                                        approval: 'N', 
                                        approvedCheck: false, 
                                        condApprovedCheck: false
                                    }
                    return { assigned }
                }, () => this.setState(previousState => ({
                    chosenApprovals: [ ...this.state.chosenApprovals, this.state.assigned[index]]
                })))
            } else if ( name === 'condApprovedCheck' && check === true) { 
                this.setState(previousState => {
                    const assigned = [ ...previousState.assigned]
                    assigned[index] = { ...assigned[index], 
                                        [name] : check, 
                                        approval: 'C', 
                                        approvedCheck: false, 
                                        notApprovedCheck: false
                                    }
                    return { assigned }
                }, () => this.setState(previousState => ({
                    chosenApprovals: [ ...this.state.chosenApprovals, this.state.assigned[index]]
                })))
            } else {
                this.setState(previousState => {
                    const assigned = [ ...previousState.assigned]
                    assigned[index] = { ...assigned[index], 
                                        [name] : check,
                                        approval: ''
                                    }
                    return { assigned }
                }, () => this.setState(previousState => ({
                    chosenApprovals: [ ...this.state.chosenApprovals, this.state.assigned[index]]
                })))
            }
    }

    toggleModal = (index) => {
        this.setState({
            indexModal: index,
        })
    }

    toggleDeleteModal = (index, modalName) => {
        this.setState({
            indexModal: modalName,
            info: index
        })
    } 

    closeModal = () => {
        this.setState({
          indexModal: undefined
        });
      }

    handleResetApprovals = (index) => {
        fetch(resetURL, {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }),
            credentials: 'include',
            body: JSON.stringify(this.state.data[index])
        })
        .then(FetchUtilities.checkStatusWithSecurity)
        .then(response => {
            this.props.getApprovers();
            this.props.getDetails();
        })
        .catch(error => FetchUtilities.handleError(error))

        this.setState({
            indexModal: undefined
        })
    }

    render() {
        const {...props} = this.props;
        return(<React.Fragment>
            <Row>
                {this.props.canUpdate ? (
                    this.state.notSubmittedState.length ===  0 ? (
                        <React.Fragment>
                            {this.state.getAutoSelectApprovers.message === null ? (
                            <Col xs={8}>
                                <NeutralAlert message={'Click to auto-select approvers. Auto selection of approvers could only be done under the Submitted state. '}  />
                            </Col>
                        ) : (
                            <React.Fragment>
                                <Col xs={6}>
                                    <GoodAlert message={this.state.getAutoSelectApprovers.message}/>
                                </Col> 
                                <Col xs={2}>
                                    <SecondaryButton icon="file" label="Show Reasons Report" color="info" className="mr-1 mt-1 btn-block" bsSize="xs" onClick={this.props.getReasonsReport}/>
                                </Col>
                            </React.Fragment>
                        )}
                        <Col xs={2}>
                            <SecondaryButton icon='check' label='Auto Select Approvers'  className="mr-1 mt-1 btn-block" bsSize="xs" onClick={this.getAutoSelectApprovers} />  
                        </Col>
                        <Col xs={2}>
                            <PrimaryButton icon='save' label='Save Changes' className="mr-1 mt-1 btn-block" onClick={this.handleSave.bind(this)} type="button"/>
                    </Col>
                        </React.Fragment>
                    ): (
                        <React.Fragment>
                            <Col xs={10}>
                            <NeutralAlert message={'Auto selection of approvers could only be done under the Submitted state. '}  />
                            </Col>
                            <Col xs={2}>
                                <PrimaryButton icon='save' label='Save Changes' className="mr-1 mt-1 btn-block" onClick={this.handleSave.bind(this)} type="button"/>
                            </Col>
                        </React.Fragment>
                    )
                ) : undefined }
                </Row>
            { this.props.approvalDetails.map((details, index) => {
                const {...appDetails} = details;
                return (<SuperCard title={"MCCB: " + details.mccbName + " - " + details.changeState} collapsible={true} collapsed={false}>
                        <Card>
                            <CardBody>
                            <Form onSubmit={this.handleSave}>
                                <Row>
                                    <Col xs={2}>
                                        {/* Change State */}
                                        <FormWidgetSelect label="Change State:" 
                                            name="changeState"
                                            options={this.props.changeStateValues} 
                                            value={this.state.data[index].changeState}
                                            onChange={this.handleInputChange.bind(this, index)}
                                            bsSize="sm"
                                            required
                                            disabled={this.props.canUpdate === true ? false : true}
                                            />
                                            <div className={classnames({"valid-feedback": this.state.data[index].validity.changeState}, {"invalid-feedback": !this.state.data[index].validity.changeState})} style={{ display: 'block', marginTop: '-0.9rem' }}>{this.state.data[index].errors.changeState}</div>
                                    </Col>
                                    <Col xs={2}>
                                        {/* Notification Class */}
                                        <FormWidgetSelect label="Notification Class:"
                                            name="notificationClass" 
                                            options={this.props.notificationClassValues} 
                                            value={this.state.data[index].notificationClass}
                                            onChange={this.handleInputChange.bind(this, index)}
                                            bsSize="sm"
                                            required
                                            disabled={this.props.canUpdate === true ? false : true}
                                            />
                                            <div className={classnames({"valid-feedback": this.state.data[index].validity.notificationClass}, {"invalid-feedback": !this.state.data[index].validity.notificationClass})} style={{ display: 'block', marginTop: '-0.9rem' }}>{this.state.data[index].errors.notificationClass}</div>
                                    </Col>
                                    <Col xs={2}>
                                        {/* Notification Period */}
                                        <FormWidgetSelect label="Notification Period:"
                                            name="notificationPeriod" 
                                            options={this.props.notificationPeriodValues}
                                            value={this.state.data[index].notificationPeriod}
                                            onChange={this.handleInputChange.bind(this, index)} 
                                            bsSize="sm"
                                            required
                                            disabled={this.props.canUpdate === true ? false : true}
                                            />
                                            <div className={classnames({"valid-feedback": this.state.data[index].validity.notificationPeriod}, {"invalid-feedback": !this.state.data[index].validity.notificationPeriod})} style={{ display: 'block', marginTop: '-0.9rem' }}>{this.state.data[index].errors.notificationPeriod}</div>
                                    </Col>
                                    <Col xs={2}>
                                        {/* Notification Responsibility */}
                                        <FormWidgetSelect label="Notification Responsibility:" 
                                            name="notificationResp"
                                            options={this.props.notificationResponsibilityValues} 
                                            value={this.state.data[index].notificationResp}
                                            onChange={this.handleInputChange.bind(this, index)}
                                            bsSize="sm"
                                            required
                                            disabled={this.props.canUpdate === true ? false : true}
                                            />
                                            <div className={classnames({"valid-feedback": this.state.data[index].validity.notificationResp}, {"invalid-feedback": !this.state.data[index].validity.notificationResp})} style={{ display: 'block', marginTop: '-0.9rem' }}>{this.state.data[index].errors.notificationResp}</div>
                                    </Col>
                                    <Col xs={4}>
                                        {/* Additional Comments */}    
                                        <FormWidgetTextArea label="Additional Comments:"
                                            name="additionalComments"
                                            size="xs"
                                            onChange={this.handleInputChange.bind(this, index)}
                                            value={this.state.data[index].additionalComments}
                                            disabled={this.props.canUpdate === true ? false : true}
                                            />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={10}> 
                                    <FormWidgetText label="Remaining review period:" 
                                                    name='daysRemaining' 
                                                    type="number" 
                                                    onChange={this.handleInputChange.bind(this, index)}
                                                    value={this.state.data[index].daysRemaining} 
                                                    style={{ input : { "width": '60px' }}} inline
                                                    disabled={this.state.data[index].changeStateId !== 2 || this.props.canUpdate === false ? true : false}/>
                                    </Col>
                                    <Col xs={2}>
                                        {this.state.data[index].changeStateId === 2 && this.props.canUpdate === true ? (
                                            <DangerButton icon='trash' label='Delete all approvals' className="mr-1 mt-1 btn-block" onClick={() => this.toggleDeleteModal(index, 'delete')}/>
                                        ) : (
                                            undefined
                                        )} 
                                    </Col>
                                    </Row>
                                <hr/>
                                <Row>
                                    <Col xs={12}>
                                        <Spinner overlay={false}/>                            
                                        <Table bordered striped size="sm" hover>
                                            <thead>
                                                <tr> 
                                                    <th> Function </th>
                                                    <th> Primary </th>
                                                    <th> Delegate </th>
                                                    <th> Approver </th>
                                                    <th> Approved </th>
                                                    <th> Not Approved </th>
                                                    {details.pastConditionalApprovalCutOff === false ? (
                                                        <th> Conditionally Approved </th>
                                                    ): undefined}
                                                    <th> Comment </th>
                                                </tr>
                                            </thead>
                                            <tbody>

                                                { this.props.approverDetails.map((approver, index) => {
                                                    return details.mccbId === approver.mccbId ? (
                                                        <tr key={index}>
                                                            <td> {approver.functionName} </td>
                                                            <td> {approver.primaryName} </td>
                                                            <td> {approver.delegateName} </td>
                                                            {/* Approver column: if the state is not submitted, user can no longer select approvers */}
                                                            {details.changeStateId === 2 ? (
                                                                <td> 
                                                                    <AwesomeCheckbox size='sm'
                                                                            name={"approver:" +approver.functionName}
                                                                            onClick={() => this.changeCheckBoxFields(index)}
                                                                            checked={this.state.assigned[index].checked}
                                                                            disabled={this.props.canUpdate === true ? false : true}
                                                                    />
                                                                </td>
                                                            
                                                            ): (
                                                                <td>
                                                                    <AwesomeCheckbox
                                                                        size='sm' 
                                                                        name={"approver:" +approver.functionName}
                                                                        checked={true}
                                                                        disabled/>
                                                                </td>
                                                            )}
                                                            {/*Approval columns */}
                                                            {details.changeStateId === 3 ? (
                                                                <React.Fragment>
                                                                    {/*Approved column */}
                                                                    <td> 
                                                                        <AwesomeCheckbox size='sm' color='success'
                                                                            id={"approved:" +approver.functionName}
                                                                            ref="approvedCheckRef"
                                                                            onClick={() => this.approvalCheckBoxFields('approvedCheck', index)}
                                                                            checked={this.state.assigned[index].approvedCheck}
                                                                            disabled={this.props.canUpdate === true ? false : true}
                                                                            /> 
                                                                    </td>
                                                                    {/* Not Approved column */}
                                                                    <td> 
                                                                        <AwesomeCheckbox size='sm' color='danger' 
                                                                            name={"notApproved:" +approver.functionName}
                                                                            onClick={() => this.approvalCheckBoxFields('notApprovedCheck', index)}
                                                                            checked={this.state.assigned[index].notApprovedCheck}
                                                                            disabled={this.props.canUpdate === true ? false : true}
                                                                        />
                                                                    </td>
                                                                    {/* Conditionally Approved column */}
                                                                    {details.pastConditionalApprovalCutOff === false ? (
                                                                        <td> 
                                                                        <AwesomeCheckbox size='sm' color='warning'  
                                                                            name={"condApproved:" +approver.functionName}
                                                                            onClick={() => this.approvalCheckBoxFields('condApprovedCheck', index)}
                                                                            checked={this.state.assigned[index].condApprovedCheck}
                                                                            disabled={this.props.canUpdate === true ? false : true}
                                                                        />
                                                                    </td>
                                                                    ) : undefined} 
                                                                </React.Fragment>
                                                            ) : (
                                                                <React.Fragment>
                                                                    {/*Approved column */}
                                                                    <td> 
                                                                        <AwesomeCheckbox size="sm" color="success"
                                                                            name={"approved:" +approver.functionName}
                                                                            checked={approver.approval === 'on' ? true : false}
                                                                            disabled/>
                                                                    </td>
                                                                    {/* Not Approved column */}
                                                                    <td> 
                                                                        <AwesomeCheckbox size="sm" color="danger" 
                                                                            name={"notApproved:" +approver.functionName}
                                                                            checked={approver.approval === 'N' ? true: false}
                                                                            disabled/>  
                                                                    </td>
                                                                    {/* Conditionally Approved column */}
                                                                    {details.pastConditionalApprovalCutOff === false ? (
                                                                        <td> 
                                                                        <AwesomeCheckbox size="sm" color="warning" 
                                                                            name={"condApproved:" +approver.functionName}
                                                                            checked={approver.approval === 'C' ? true: false}
                                                                            disabled/>
                                                                        </td>
                                                                    ) : undefined}
                                                                </React.Fragment>
                                                            )}
                                                            {details.changeStateId === 3 ? (
                                                                <td> 
                                                                    <FormWidgetTextArea
                                                                        name="approverComments"
                                                                        size="xs"
                                                                        onChange={this.handleApproverInputChange.bind(this, index)}
                                                                        value={this.state.assigned[index].approverComments !== null ? this.state.assigned[index].approverComments : ''}
                                                                        style={{ input : { "marginBottom": '-15px' }}}
                                                                        disabled={this.props.canUpdate === true ? false : true}
                                                                    />
                                                                </td>
                                                            ) : (
                                                                <td> 
                                                                    {approver.approverComments}
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ) : undefined
                                                })
                                            }
                                            </tbody>
                                        </Table>
                                    </Col>
                                </Row>
                                </Form>
                            </CardBody> 
                        </Card>
                </SuperCard>
                )
                })
            }
            {
                <ConfirmDeleteModal 
                    show={this.state.indexModal === 'delete'}
                    message={"Are you sure you want to reset all approvals under this MCCB?"}
                    handleClose={() => this.closeModal()}
                    handleConfirmation={() => this.handleResetApprovals(this.state.info)}
                />
            }
            {
                <InfoModal
                show={this.state.indexModal === 'info'}
                message="Please select at least one approver."
                handleClose={() => this.closeModal()}
              />
            }
        </React.Fragment>)
    }
}

const TABLE_COLUMNS = [
    { key: 'role', label: 'CCB Role', sortable: true },
    { key: 'name', label: 'Primary', sortable: true },
    { key: 'delegate', label: 'Delegate', sortable: true },
    { key: 'changeGrpId', label: 'Change Type', sortable: true },
    { key: 'sbeId', label: 'SBE', sortable: true },
    { key: 'sbeOneId', label: 'SBE1', sortable: true },
    { key: 'sbeTwoId', label: 'SBE2', sortable: true },
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'indSec', label: 'Industry Sector', sortable: true },
    { key: 'gidep', label: 'GIDEP', sortable: true },
    { key: 'curFabSite', label: 'Current Fab Site', sortable: true },
    { key: 'curAssy', label: 'Current Assy', sortable: true },
    { key: 'updateATSS', label: 'Update ATSS', sortable: true },
    { key: 'isoDev', label: 'ISO Device', sortable: true },
    { key: 'safeCert', label: 'Safety Certification', sortable: true },
    { key: 'pkgGrp', label: 'Pkg Group', sortable: true },
    { key: 'pachinko', label: 'Pachinko', sortable: true },
    { key: 'niche', label: 'Niche', sortable: true },
    { key: 'dataSource', label: 'Data Source', sortable: true }
];

class ReasonsReport extends React.Component {
    
    render() {
        return (
                <ComponentModal
                    show={this.props.modalVisible}
                    size='lg' color='info' icon='' title='Auto Select Approver Criteria'
                    style={{'maxWidth':'95%'}}
                    buttons={
                        [{ color: 'secondary', outline: true, label: 'Close', onClick: this.props.getReasonsReport}]
                    } >
                    <Alert color='success'>Auto Select Approver Criteria: The following CCB Roles were auto selected because the Device attributes had a match on the CCB Role attribute </Alert>
                    <Row>
                            <ReactiveTable server
                                credentials={'include'}
                                fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                                fetchErrorHandler={FetchUtilities.handleError}
                                striped={true}
                                columnFilters={true}
                                url={'/api/v1/get_selected_approvers/' + this.props.changeNumber}
                                ref={(table) => this.table = table}
                                columns={TABLE_COLUMNS} />
                        </Row>
                </ComponentModal>
        )
    }
}

export default ApprovalTab