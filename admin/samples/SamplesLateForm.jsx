import React, { Component, } from 'react';
import { Button, Col, Label, Form, FormGroup, FormText } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import 'whatwg-fetch';
import FetchUtilities from 'js/universal/FetchUtilities';
import Required from "js/universal/Required";
import DatePicker from 'react-datepicker';
import moment from 'moment';
import Validator from 'validatorjs';
import classnames from 'classnames';
import LDAPSearchInput from 'js/universal/LDAPSearchInput';
import { SearchPCN, SearchCMS, SearchCustomerNumber, SearchOrderableMaterial } from 'js/app/models/TrkLookUp';
import Spinner from 'js/universal/spinner';

let rules = {
    lastDate: ['required'],
}

let more_rules = {
    lastDate: ['required'],
    userid: ['required_without_all:changeNumber,pcnNumber, customerNumber,orderableMaterial'],
    changeNumber: ['required_without_all:userid,pcnNumber,customerNumber,orderableMaterial'],
    pcnNumber: ['required_without_all:userid,changeNumber,orderableMaterial'],
    customerNumber: ['required_without_all:userid,changeNumber,pcnNumber,orderableMaterial'],
    orderableMaterial: ['required_without_all:userid,changeNumber,pcnNumber,customerNumber']
}

let messages = {
    'required': 'This field is required.',
    'required_without_all' :'Please select a value in at least one of these fields *.',
}
class SamplesLateForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                id: (this.props.record && this.props.record['id']) || null,
                userid: (this.props.record && this.props.record['userid']) || null,
                changeNumber: (this.props.record && this.props.record['changeNumber']) || null,
                pcnNumber: (this.props.record && this.props.record['pcnNumber']) || null,
                customerNumber: (this.props.record && this.props.record['customerNumber']) || null,
                orderableMaterial: (this.props.record && this.props.record['orderableMaterial']) || null,
                lastDate: null
            },
            validity: {},
            errors: {}
        }
        this.validate = this.validate.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    toggleSpinner() {
        this.setState({ showSpinner: !this.state.showSpinner });
    }

    handleChange = (e) => {
        const target = e.target;
        let value =target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState((previousState) => {
            return previousState.data = {...previousState.data, [name]: value};
        });
    }

    validate() {
        let validation;
        if(this.state.data.userid === null && this.state.data.changeNumber === null && this.state.data.pcnNumber === null &&
            this.state.data.customerNumber === null && this.state.data.orderableMaterial === null
        ) { 
            validation = new Validator(this.state.data, more_rules, messages);
        } else {
            validation = new Validator(this.state.data, rules, messages);
        }
        validation.passes();

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

    validateAndSaveChange(name, value) {
        let validation;
        validation = new Validator({ ...this.state.data, [name]: value}, rules, messages);
        validation.passes();

        this.setState((previousState) => {
            previousState.data = { ...previousState.data, [name]: value};
            this.state.data.lastDate = moment(this.state.data.lastDate).format("YYYY-MM-DD");
            previousState.validity = { ...previousState.validity, [name]: !validation.errors.has(name) };
            previousState.errors = { ...previousState.errors, [name]: validation.errors.has(name) ? validation.errors.first(name) : null };
            
            return previousState;
        })
    }

    handleSubmit(e) {
        e.preventDefault();
        if(this.validate()) {
            this.toggleSpinner();
            const URL = "/api/v1/samples/late/";
            fetch(URL,
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
                .then((response) => {
                    if(response.status === 200) {
                        this.confirmAlert('Late Sample added.', true);
                    }
                    window.location.reload(true);
                })
                .catch((error) => {
                    this.toggleSpinner();
                    this.confirmAlert(error);
                });
            }
    }

    confirmAlert(message, isSuccess) {
        if (isSuccess) {
            this.props.onSubmit(message, true);
        } else {
            alert(message.message, message);
        }
    }

    handleLDAPInput = (searchValue) => {
        this.setState((previousState) => {
            return previousState.data = { ...previousState.data, userid: searchValue.label };
        });
    }

    onUpdateCustomerNumber = (customerNumber) => {
        this.setState((previousState) => {
            return previousState.data = { ...previousState.data, customerNumber: customerNumber.customer_number };
        });
    }

    onUpdateCMS = (cms) => {
        this.setState((previousState) => {
            return previousState.data = { ...previousState.data, changeNumber: cms.cms_number };
        });
    }

    onUpdatePCN = (pcn) => {
        this.setState((previousState) => {
            return previousState.data = { ...previousState.data, pcnNumber: pcn.pcn_number };
        });
    }

    onUpdateOrderMat = (orderableMaterial) => {
        this.setState((previousState) => {
            return previousState.data = { ...previousState.data, orderableMaterial: orderableMaterial.orderable_material };
        });
    }

    render() {
        return(
            <div>
                <Form onSubmit={this.handleSubmit}>
                <Spinner showSpinner={this.state.showSpinner} />
                    <FormGroup row>
                        <Col sm={12}>
                            <Label for="userid"> User ID: </Label>
                                <LDAPSearchInput onSelectLdap={this.handleLDAPInput} placeholder={'Enter user'} 
                                selected={this.state.data.userid}
                                maxLength="20"/>
                                <div className={classnames({"valid-feedback": this.state.validity.userid}, {"invalid-feedback": !this.state.validity.userid})} style={{ display: 'block' }}>{this.state.errors.userid}</div>
                        </Col>
                        <Col sm={12}>
                            <Label for="changeNumber"> Change Number: </Label>
                            <SearchCMS onUpdate={this.onUpdateCMS} 
                            selected={this.state.data.changeNumber}/>
                                <div className={classnames({"valid-feedback": this.state.validity.changeNumber}, {"invalid-feedback": !this.state.validity.changeNumber})} style={{ display: 'block' }}>{this.state.errors.changeNumber}</div>
                        </Col>
                        <Col sm={12}>
                            <Label for="pcnNumber"> PCN Number: </Label>
                                <SearchPCN onUpdate={this.onUpdatePCN} selected={this.state.data.pcnNumber}/> 
                                <div className={classnames({"valid-feedback": this.state.validity.pcnNumber}, {"invalid-feedback": !this.state.validity.pcnNumber})} style={{ display: 'block' }}>{this.state.errors.pcnNumber}</div>
                        </Col>
                        <Col sm={12}>
                            <Label for="customerNumber"> Customer: </Label>
                                <SearchCustomerNumber onUpdate={this.onUpdateCustomerNumber}
                                selected={this.state.data.customerNumber}
                                />
                                <div className={classnames({"valid-feedback": this.state.validity.customerNumber}, {"invalid-feedback": !this.state.validity.customerNumber})} style={{ display: 'block' }}>{this.state.errors.customerNumber}</div>
                        </Col>
                        <Col sm={12}>
                            <Label for="orderableMaterial"> Orderable Material: </Label>
                            <SearchOrderableMaterial onUpdate={this.onUpdateOrderMat} selected={this.state.data.orderableMaterial}/>
                                <div className={classnames({"valid-feedback": this.state.validity.orderableMaterial}, {"invalid-feedback": !this.state.validity.orderableMaterial})} style={{ display: 'block' }}>{this.state.errors.orderableMaterial}</div>
                                
                        </Col>
                        <Col sm={12}>
                            <Label for="lastDate"><Required required> Last Date: </Required></Label>
                            <DatePicker 
                                name="lastDate"
                                format="YYYY-MM-DD HH:MI:SS"
                                selected={this.state.data.lastDate ? moment(this.state.data.lastDate): undefined}
                                todayButton={"Today"}
                                placeholderText="YYYY-MM-DD HH:MI:SS"
                                onChange={(value) => this.validateAndSaveChange('lastDate', value)}
                                className={classnames("form-control")}
                                invalid={!this.state.validity.lastDate}
                                required />
                            <FormText color="muted">All date and time are in CST</FormText>
                            <div className={classnames({"valid-feedback": this.state.validity.lastDate}, {"invalid-feedback": !this.state.validity.lastDate})} style={{ display: 'block' }}>{this.state.errors.lastDate}</div>
                        </Col>
                    </FormGroup>
                    <Button  onClick={() => this.props.toggle()} className="mr-1 pull-right" color="secondary"> Cancel </Button>
                    <Button className="mr-1 pull-right" color="primary" onClick={this.handleSubmit}><FontAwesome name="save" /> &nbsp; Save</Button>
                </Form>
            </div>
        )
    }
}

export default SamplesLateForm;