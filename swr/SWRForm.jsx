import React, { Component, } from 'react';
import { Button, Form, FormGroup, Label, Col, Input, } from 'reactstrap';
import FetchUtilities from 'js/universal/FetchUtilities';
import Validator from 'validatorjs';
import { SearchSWR } from 'js/app/models/TrkLookUp';
import Required from "js/universal/Required";
import classnames from 'classnames';
import Spinner from 'js/universal/spinner';

const swrTypeList = '/api/v1/swr/types/';

let rules = {
    swr_number: ['required']
}

let messages = {
    'required': 'This field is required.'
}

const ADMIN_ROLES = ['System Admin', 'ChangeLink Admin', 'Sample Coordinator'];

class SWRForm extends Component {

    constructor(props) {
        super(props);
        var initialState = {
            data: {},
            showSpinner: false,
            swrList: [],
            swr: {
                id: '',
                swr_number: ''
            },
            swrDetails: [],
            details: {},
            validity: {},
            errors: {},
            canEdit: false
        }
        this.state = initialState;
        this.fetchSWRType = this.fetchSWRType.bind(this);
        this.fetchSWRData = this.fetchSWRData.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
    }

    toggleSpinner() {
        this.setState({
            showSpinner: !this.state.showSpinner
        });
    }

    // Handle form validation
    validate() {
        let validation = new Validator(this.state.swr, rules, messages);
        validation.passes(); // Trigger validation

        let formValidity = {};
        let formErrors = {};
        Object.keys(this.state.details).forEach(field => {
            formValidity[field] = !validation.errors.has(field);
            formErrors[field] = validation.errors.has(field) ? validation.errors.first(field) : null;
        });

        this.setState({
            validity: formValidity,
            errors: formErrors
        });

        return validation.passes();
    }

    fetchSWRData(swrNumber) {
        fetch("/api/v1/swr/fetchOne/" + swrNumber, {
            credentials: 'include',
            headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            })
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then((json) => {
                this.setState({ data: json })
                this.toggleSpinner();
            })
            .catch(error => FetchUtilities.handleError(error))
    }

    fetchSWRDetails(swr) {
        const getDetails = "/api/v1/swr/fetch/";
        fetch(getDetails + swr.swr_number, {
            credentials: 'include',
            headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            })
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then((json) => {
                this.checkIfExists(swr.swr_number);
                this.setState({ swrDetails: json })
                this.toggleSpinner();
            })
            .catch(error => FetchUtilities.handleError(error))
    }

    checkIfExists(swrNumber) {
        fetch("/api/v1/swr/check/" + swrNumber, {
            credentials: 'include',
            headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            })
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then((json) => {
                this.setState({
                    id: JSON.stringify(json)
                    }, () => this.convertDetails())
            })
            .catch(error => FetchUtilities.handleError(error))
    }

    convertDetails() {
        this.state.swrDetails.forEach((key, i) => {
            this.setState({
                details: {
                    dieName: key.DIENAME,
                    swrTitle: key.SWRTITLE,
                    swrStatus: key.SWRSTATUS,
                    swrNumber: key.SWRNUMBER,
                    requestor: key.REQUESTOR,
                    io: key.IO,
                    atSite: key.ATSITE,
                    dieLotNumber: key.dieLotNumber,
                    lineItem: key.LINEITEM,
                    swrDevice: key.SWRDEVICE,
                    sbe: key.SBE,
                    sbe1: key.SBE1,
                    sbe2: key.SBE2,
                    qtyBuilt: key.QTYBUILT,
                    retPackPc: key.RETPACKPC,
                    atShippedDate: key.ATSHIPPEDDATE,
                    atFinishedDate: key.ATFINISHEDDATE,
                    atAcceptedDate: key.ATACCEPTEDDATE,
                    atStartedDate: key.ATSTARTEDDATE,
                    comments: this.state.data.comments,
                    swrType: this.state.data.swrType,
                    assyLotTraceCode: this.state.data.assyLotTraceCode,
                    qtyShipped: this.state.data.qtyShipped,
                    id: this.state.id
                }
            })
        })
    }

    fetchSWRType() {
        fetch(swrTypeList, {
            credentials: 'include',
            headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            })
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then((json) => this.setState({ swrList: json }))
            .catch(error => FetchUtilities.handleError(error))
    }

    handleInputChange = (e) => {
        const target = e.target;
        let value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState((previousState) => {
            return previousState.data = { ...previousState.data, [name]: value };
        }, () => this.convertDetails());
    }

    handleSubmit = (e) => {
      e.preventDefault();
      let queryData = this.state.swrDetails < 1 ? this.state.data : this.state.details
      this.setState({ queryData: queryData })
      if (typeof this.props.onSubmit  === 'function')
        this.props.onSubmit(queryData)
    }

    handleCancel = (e) => {
        e.preventDefault();
        if (typeof this.props.onClose  === 'function')
          this.props.onClose()
    }

    onUpdateSwr = (swr) => {
        this.toggleSpinner();
        this.setState({ swr: swr });
        this.fetchSWRDetails(swr);
    }

    componentDidMount() {
        let swrNumber = this.props.match.params.swrNumber
        this.fetchSWRType();

        if (!(swrNumber === null || swrNumber === undefined)) {
            this.toggleSpinner()
            this.fetchSWRData(swrNumber)
        }

        if (this.props.userAccess)
            this.setState({ canEdit: this.props.hasRole(ADMIN_ROLES) })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
            this.setState({
                canEdit: nextProps.hasRole(ADMIN_ROLES)
            })
    }

    render() {
        const swrNumber = this.props.match.params.swrNumber
        const options = this.state.swrList.map((e) => <option key={e}>{e}</option>)

        const isSaveVisible = this.state.canEdit
        const isSaveDisabled = (this.state.swr.swr_number === '' && Object.keys(this.state.data).length === 0) || this.state.data.swrNumber === null || Object.keys(this.state.swr).length === 0 
        return (
            <div className="card card-body">
                {
                    swrNumber === null || swrNumber === undefined
                        ? <h4> Create SWR {swrNumber} </h4>
                        : !!this.state.canEdit
                            ? <h4> Edit SWR {swrNumber} </h4>
                            : <h4> SWR {swrNumber} </h4>
                }
                <Form onSubmit={this.handleSubmit}>
                    <Spinner showSpinner={this.state.showSpinner} />
                    <FormGroup row>
                        <Col sm={3}>
                            <Label for="swrNumber"><Required required> Number: </Required></Label>
                            {this.state.data.swrNumber !== null && this.state.data.swrNumber !== undefined ? (
                                <Input
                                    name="swrNumber"
                                    value={this.state.data.swrNumber}
                                    disabled />
                            ) : (
                                    <SearchSWR onUpdate={this.onUpdateSwr} name="swr_number" />
                                )}
                            <div className={classnames({ "valid-feedback": this.state.validity.swr_number }, { "invalid-feedback": !this.state.validity.swr_number })} style={{ display: 'block' }}>{this.state.errors.swr_number}</div>
                        </Col>

                        <Col sm={3}>
                            <Label for="swrType"> Type: </Label>
                            {
                                this.state.canEdit
                                    ? <Input
                                        name="swrType"
                                        type="select"
                                        value={this.state.data.swrType ? this.state.data.swrType : ''}
                                        bsSize="sm"
                                        onChange={this.handleInputChange}>
                                        {options}
                                    </Input>
                                    : <Input
                                        name="swrType"
                                        value={this.state.data.swrType ? this.state.data.swrType : ''}
                                        disabled />
                            }
                        </Col>

                        <Col sm={3}>
                            <Label for="assyLotTraceCode"> Assy Lot Trace Code: </Label>
                            {
                                this.state.canEdit
                                    ? <Input
                                        name="assyLotTraceCode"
                                        type="text"
                                        value={this.state.data.assyLotTraceCode ? this.state.data.assyLotTraceCode : ''}
                                        onChange={this.handleInputChange} />
                                    : <Input
                                        name="assyLotTraceCode"
                                        type="text"
                                        value={this.state.data.assyLotTraceCode ? this.state.data.assyLotTraceCode : ''}
                                        disabled />
                            }
                        </Col>

                        <Col sm={3}>
                            <Label for="qtyShipped"> Qty Shipped: </Label>
                            {
                                this.state.canEdit
                                    ? <Input
                                        name="qtyShipped"
                                        type="number"
                                        value={this.state.data.qtyShipped ? this.state.data.qtyShipped : ''}
                                        onChange={this.handleInputChange} />
                                    : <Input
                                        name="qtyShipped"
                                        type="number"
                                        value={this.state.data.qtyShipped ? this.state.data.qtyShipped : ''}
                                        disabled />
                            }
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Col sm={3}>
                            <Label for="swrStatus"> Status: </Label>
                            {this.state.swrDetails.length < 1 ? (
                                <Input
                                    name="swrStatus"
                                    type="text"
                                    value={this.state.data.swrStatus ? this.state.data.swrStatus : ''}
                                    disabled />
                            ) : (
                                    <Input
                                        name="swrStatus"
                                        type="text"
                                        value={this.state.details.swrStatus ? this.state.details.swrStatus : ''}
                                        disabled />
                                )}
                        </Col>

                        <Col sm={3}>
                            <Label for="swrTitle"> Title: </Label>
                            {this.state.swrDetails < 1 ? (
                                <Input
                                    name="swrTitle"
                                    value={this.state.data.swrTitle ? this.state.data.swrTitle : ''}
                                    type="text"
                                    disabled />
                            ) : (
                                    <Input
                                        name="swrTitle"
                                        value={this.state.details.swrTitle ? this.state.details.swrTitle : ''}
                                        type="text"
                                        disabled />
                                )}

                        </Col>

                        <Col sm={3}>
                            <Label for="swrDevice"> Device: </Label>
                            {this.state.swrDetails < 1 ? (
                                <Input
                                    name="swrDevice"
                                    type="text"
                                    value={this.state.data.swrDevice ? this.state.data.swrDevice : ''}
                                    disabled />
                            ) : (
                                    <Input
                                        name="swrDevice"
                                        type="text"
                                        value={this.state.details.swrDevice ? this.state.details.swrDevice : ''}
                                        disabled />
                                )}
                        </Col>

                        <Col sm={3}>
                            <Label for="requestor"> Requestor: </Label>
                            {this.state.swrDetails < 1 ? (
                                <Input
                                    name="requestor"
                                    value={this.state.data.requestor ? this.state.data.requestor : ''}
                                    type="text"
                                    disabled />
                            ) : (
                                    <Input
                                        name="requestor"
                                        value={this.state.details.requestor ? this.state.details.requestor : ''}
                                        type="text"
                                        disabled />
                                )}
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Col sm={3}>
                            <Label for="sbe"> SBE: </Label>
                            {this.state.swrDetails < 1 ? (
                                <Input
                                    name="sbe"
                                    type="text"
                                    value={this.state.data.sbe ? this.state.data.sbe : ''}
                                    disabled />
                            ) : (
                                    <Input
                                        name="sbe"
                                        type="text"
                                        value={this.state.details.sbe ? this.state.details.sbe : ''}
                                        disabled />
                                )}
                        </Col>

                        <Col sm={3}>
                            <Label for="sbe1"> SBE1: </Label>
                            {this.state.swrDetails < 1 ? (
                                <Input
                                    name="sbe1"
                                    type="text"
                                    value={this.state.data.sbe1 ? this.state.data.sbe1 : ''}
                                    disabled />
                            ) : (
                                    <Input
                                        name="sbe1"
                                        type="text"
                                        value={this.state.details.sbe1 ? this.state.details.sbe1 : ''}
                                        disabled />
                                )}
                        </Col>

                        <Col sm={3}>
                            <Label for="sbe2"> SBE2: </Label>
                            {this.state.swrDetails < 1 ? (
                                <Input
                                    name="sbe2"
                                    type="text"
                                    value={this.state.data.sbe2 ? this.state.data.sbe2 : ''}
                                    disabled />
                            ) : (
                                    <Input
                                        name="sbe2"
                                        type="text"
                                        value={this.state.details.sbe2 ? this.state.details.sbe2 : ''}
                                        disabled />
                                )}
                        </Col>

                        <Col sm={3}>
                            <Label for="atSite"> A/T Site: </Label>
                            {this.state.swrDetails < 1 ? (
                                <Input
                                    name="atSite"
                                    type="text"
                                    value={this.state.data.atSite ? this.state.data.atSite : ''}
                                    disabled />
                            ) : (
                                    <Input
                                        name="atSite"
                                        type="text"
                                        value={this.state.details.atSite ? this.state.details.atSite : ''}
                                        disabled />
                                )}
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Col sm={3}>
                            <Label for="qtyBuilt"> QTY Build: </Label>
                            {this.state.swrDetails < 1 ? (
                                <Input
                                    name="qtyBuilt"
                                    type="number"
                                    value={this.state.data.qtyBuilt ? this.state.data.qtyBuilt : ''}
                                    disabled />
                            ) : (
                                    <Input
                                        name="qtyBuilt"
                                        type="number"
                                        value={this.state.details.qtyBuilt ? this.state.details.qtyBuilt : ''}
                                        disabled />
                                )}
                        </Col>

                        <Col sm={3}>
                            <Label for="IO"> IO #:</Label>
                            {this.state.swrDetails < 1 ? (
                                <Input
                                    name="IO"
                                    type="text"
                                    value={this.state.data.IO ? this.state.data.IO : ''}
                                    disabled />
                            ) : (
                                    <Input
                                        name="IO"
                                        type="text"
                                        value={this.state.details.IO ? this.state.details.IO : ''}
                                        disabled />
                                )}
                        </Col>

                        <Col sm={3}>
                            <Label for="PO"> PO #: </Label>
                            {this.state.swrDetails < 1 ? (
                                <Input
                                    name="PO"
                                    type="text"
                                    value={this.state.data.PO ? this.state.data.PO : ''}
                                    disabled />
                            ) : (
                                    <Input
                                        name="PO"
                                        type="text"
                                        value={this.state.details.PO ? this.state.details.PO : ''}
                                        disabled />
                                )}
                        </Col>

                        <Col sm={3}>
                            <Label for="lineItem"> Lite Item: </Label>
                            {this.state.swrDetails < 1 ? (
                                <Input
                                    name="lineItem"
                                    type="text"
                                    value={this.state.data.lineItem ? this.state.data.lineItem : ''}
                                    disabled />
                            ) : (
                                    <Input
                                        name="lineItem"
                                        type="text"
                                        value={this.state.details.lineItem ? this.state.details.lineItem : ''}
                                        disabled />
                                )}
                        </Col>

                    </FormGroup>
                    <FormGroup row>
                        <Col sm={3}>
                            <Label type="genericDevice"> Generic Device: </Label>
                            {this.state.swrDetails < 1 ? (
                                <Input
                                    name="genericDevice"
                                    type="text"
                                    value={this.state.data.genericDevice ? this.state.data.genericDevice : ''}
                                    disabled />
                            ) : (
                                    <Input
                                        name="genericDevice"
                                        type="text"
                                        value={this.state.details.genericDevice ? this.state.details.genericDevice : ''}
                                        disabled />
                                )}
                        </Col>
                        <Col sm={3}>
                            <Label type="dieName"> Die Name: </Label>
                            {this.state.swrDetails < 1 ? (
                                <Input
                                    name="dieName"
                                    type="text"
                                    value={this.state.data.dieName ? this.state.data.dieName : ''}
                                    disabled />
                            ) : (
                                    <Input
                                        name="dieName"
                                        type="text"
                                        value={this.state.details.dieName ? this.state.details.dieName : ''}
                                        disabled />
                                )}
                        </Col>

                        <Col sm={3}>
                            <Label for="atShippedDate"> A/T Shipped Date: </Label>
                            {this.state.swrDetails < 1 ? (
                                <Input
                                    name="atShippedDate"
                                    type="text"
                                    value={this.state.data.atShippedDate ? this.state.data.atShippedDate : ''}
                                    disabled />
                            ) : (
                                    <Input
                                        name="atShippedDate"
                                        type="text"
                                        value={this.state.details.atShippedDate ? this.state.details.atShippedDate : ''}
                                        disabled />
                                )}

                        </Col>

                        <Col sm={3}>
                            <Label for="atFinishedDate"> A/T Finished Date: </Label>
                            {this.state.swrDetails < 1 ? (
                                <Input
                                    name="atFinishedDate"
                                    type="text"
                                    value={this.state.data.atFinishedDate ? this.state.data.atFinishedDate : ''}
                                    disabled />
                            ) : (
                                    <Input
                                        name="atFinishedDate"
                                        type="text"
                                        value={this.state.details.atFinishedDate ? this.state.details.atFinishedDate : ''}
                                        disabled />
                                )}
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Col sm={3}>
                            <Label for="atAcceptedDate"> A/T Accepted Date: </Label>
                            {this.state.swrDetails < 1 ? (
                                <Input
                                    name="atAcceptedDate"
                                    type="text"
                                    value={this.state.data.atAcceptedDate ? this.state.data.atAcceptedDate : ''}
                                    disabled />
                            ) : (
                                    <Input
                                        name="atAcceptedDate"
                                        type="text"
                                        value={this.state.details.atAcceptedDate ? this.state.details.atAcceptedDate : ''}
                                        disabled />
                                )}
                        </Col>

                        <Col sm={3}>
                            <Label for="atStartedDate"> A/T Started Date: </Label>
                            {this.state.swrDetails < 1 ? (
                                <Input
                                    name="atStartedDate"
                                    type="text"
                                    value={this.state.data.atStartedDate ? this.state.data.atStartedDate : ''}
                                    disabled />
                            ) : (
                                    <Input
                                        name="atStartedDate"
                                        type="text"
                                        value={this.state.details.atStartedDate ? this.state.details.atStartedDate : ''}
                                        disabled />
                                )}
                        </Col>

                        <Col sm={3}>
                            <Label for="retPackPc"> RetPackPc: </Label>
                            {this.state.swrDetails < 1 ? (
                                <Input
                                    name="retPackPc"
                                    type="text"
                                    value={this.state.data.retPackPc ? this.state.data.retPackPc : ''}
                                    disabled />
                            ) : (
                                    <Input
                                        name="retPackPc"
                                        type="text"
                                        value={this.state.details.retPackPc ? this.state.details.retPackPc : ''}
                                        disabled />
                                )}
                        </Col>
                        <Col sm={3}>
                            <Label for="comments"> Comments: </Label>
                            {
                                this.state.canEdit
                                    ? <Input
                                        name="comments"
                                        type="textarea"
                                        value={this.state.data.comments ? this.state.data.comments : ''}
                                        onChange={this.handleInputChange} />
                                    : <Input
                                        name="comments"
                                        type="textarea"
                                        value={this.state.data.comments ? this.state.data.comments : ''}
                                        disabled />
                            }
                        </Col>
                    </FormGroup>
                    
                    <span className='pull-right'>
                        {
                            isSaveVisible 
                            ? <Button className="mr-1" type="submit" color="primary" id="btn-swr-save" 
                                      onClick={(event) => this.handleSubmit(event, true)} disabled={isSaveDisabled}>
                                  <span aria-hidden="true" className="fa fa-save"></span> Save 
                              </Button>
                            : undefined
                        }
                        <Button color="secondary" outline className="mr-1" onClick={this.handleCancel}>Cancel</Button>
                    </span>
                </Form>
            </div>
        )
    }
}

export default SWRForm;