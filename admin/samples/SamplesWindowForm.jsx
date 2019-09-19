import React, { Component, } from 'react';
import { Button, Col, Label, Input, Form, FormGroup, FormFeedback } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import Required from "js/universal/Required";
import Validator from 'validatorjs';
import 'whatwg-fetch';
import FetchUtilities from 'js/universal/FetchUtilities';
import { SearchCustomerNumber } from 'js/app/models/TrkLookUp';
import classnames from 'classnames';
import Spinner from 'js/universal/spinner';

let rules = {
    days: ['required'],
    customerNumber: ['required_without_all:industrySector'],
    industrySector: ['required_without_all:customerNumber']
}

let messages = {
    'required': 'This field is required.',
    'required_without_all': 'Please select a value in at least one of these fields. *'
}
class SamplesWindowForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                id: (this.props.record && this.props.record['id']) || null,
                customerNumber: (this.props.record && this.props.record['customerNumber']) || null,
                industrySector: (this.props.record && this.props.record['industrySector']) || null,
                days: (this.props.record && this.props.record['days']) || null,
            },
            validity: {},
            errors: {},
            industrySectorList: []
        }
        this.validate = this.validate.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this.fetchIndustrySector();
    }

    fetchIndustrySector() {
        fetch("/api/v1/samples/industrySector/", {
            headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }), credentials: 'include'
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then((json) => this.setState({ industrySectorList: json }))
            .catch(error => FetchUtilities.handleError(error))
    }

    validate() {
        let validation;
        validation = new Validator(this.state.data, rules, messages);
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

    toggleSpinner() {
        this.setState({ showSpinner: !this.state.showSpinner });
    }

    handleChange = (e) => {
        const target = e.target;
        let value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState((previousState) => {
            return previousState.data = { ...previousState.data, [name]: value };
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        if (this.validate()) {
            this.toggleSpinner();
            const URL = "/api/v1/samples/window/";
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
                    if (response.status === 200) {
                        this.confirmAlert('Request Window added.', true);
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

    onUpdateCustomerNumber = (customerNumber) => {
        this.setState((previousState) => {
            return previousState.data = { ...previousState.data, 'customerNumber': customerNumber.customer_number };
        });
    }

    render() {
        return (
            <div>
                <Form onSubmit={this.handleSubmit}>
                <Spinner showSpinner={this.state.showSpinner} />
                    <FormGroup row>
                        <Col sm={12}>
                            <Label for="customerNumber"> Customer: </Label>
                            {this.state.data.customerNumber === 'DEFAULT' ? (
                                <Input type="text" value={this.state.data.customerNumber} disabled/>
                            ) : (
                                <SearchCustomerNumber onUpdate={this.onUpdateCustomerNumber}
                                selected={this.state.data.customerNumber} />
                            )}
                            <div className={classnames({"valid-feedback": this.state.validity.customerNumber}, {"invalid-feedback": !this.state.validity.customerNumber})} style={{ display: 'block' }}>{this.state.errors.customerNumber}</div>
                        </Col>
                        <Col sm={12}>
                            <Label for="industrySector"> Industry Sector: </Label>
                            {this.state.data.industrySector === 'DEFAULT' ? (
                                <Input type="text" value={this.state.data.industrySector} disabled/>
                            ) : (
                                <Input name="industrySector"
                                type="select"
                                value={this.state.data.industrySector ? this.state.data.industrySector : ''}
                                onChange={this.handleChange}>
                                <option></option>
                                {
                                    this.state.industrySectorList.map((key) => <option key={key}>{key}</option>)
                                }
                                </Input>
                            )}
                            <div className={classnames({"valid-feedback": this.state.validity.industrySector}, {"invalid-feedback": !this.state.validity.customerNumber})} style={{ display: 'block' }}>{this.state.errors.customerNumber}</div>            
                        </Col>
                        <Col sm={12}>
                            <Label for="days"><Required required> Days: </Required></Label>
                            <Input name="days" type="number"
                                value={this.state.data.days ? this.state.data.days : ''}
                                onChange={this.handleChange}
                                invalid={!this.state.validity.days}
                                required />
                            <FormFeedback>{this.state.errors.days}</FormFeedback>
                        </Col>
                    </FormGroup>
                    <Button onClick={() => this.props.toggle()} className="mr-1 pull-right" color="secondary"> Cancel </Button>
                    <Button className="mr-1 pull-right" color="primary" onClick={this.handleSubmit}><FontAwesome name="save" /> &nbsp; Save</Button>
                </Form>
            </div>
        )
    }
}

export default SamplesWindowForm;