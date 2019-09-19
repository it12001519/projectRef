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
    customerNumber: ['required'],
    numRequests: ['required']
};
let messages = {
    'required': 'This field is required.'
};

class SampleRequestForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                id: (this.props.record && this.props.record['id']) || null,
                customerNumber: (this.props.record && this.props.record['customerNumber']) || null,
                numRequests: (this.props.record && this.props.record['numRequests']) || null,
            },
            validity: {},
            errors: {},
        }
        /* validation to be added */
        //this.validate = this.validate.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    validate() {
        let validation;
        validation = new Validator(this.state.data, rules, messages);
        validation.passes();

        let formValidity = {};
        let formErrors = {};
        
        Object.keys(this.state.data).forEach(field => {
            formValidity[field] = !validation.errors.has(field);
            formErrors[field] = validation.errors.has(field) ? validation.errors.first(field) : null;
          });
      
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
        let value =target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState((previousState) => {
            return previousState.data = {...previousState.data, [name]: value};
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        //validate
        if(this.validate()) {
            this.toggleSpinner();
            const URL = "/api/v1/samples/request/";
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
                        this.confirmAlert('Customer Request added.', true);
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
        return(
            <div>
                <Form onSubmit={this.handleSubmit}>
                <Spinner showSpinner={this.state.showSpinner} />
                    <FormGroup row>
                        <Col sm={12}>
                        <Label for="customerNumber"><Required required> Customer: </Required></Label>
                        {this.state.data.customerNumber === 'DEFAULT' ? (
                            <Input type="text" value={this.state.data.customerNumber} disabled/>
                        ): (
                            <SearchCustomerNumber onUpdate={this.onUpdateCustomerNumber}
                            selected={this.state.data.customerNumber}
                            />
                        )}
                        <div className={classnames({"valid-feedback": this.state.validity.customerNumber}, {"invalid-feedback": !this.state.validity.customerNumber})} style={{ display: 'block' }}>{this.state.errors.customerNumber}</div>
                        </Col>
                        <Col sm={12}>
                            <Label for="numRequests"><Required required> Number of Requests: </Required></Label>
                            <Input type="number" 
                            name="numRequests" 
                            value={this.state.data.numRequests ? this.state.data.numRequests : ''}
                            onChange={this.handleChange}
                            invalid={!this.state.validity.numRequests}
                            required 
                            min="0"/>
                            <FormFeedback>{this.state.errors.numRequests}</FormFeedback>
                        </Col>
                    </FormGroup>

                    <Button onClick={() => this.props.toggle()} className="mr-1 pull-right" color="secondary"> Cancel </Button>
                    <Button type="submit" className="mr-1 pull-right" color="primary" onClick={this.handleSubmit}><FontAwesome name="save" /> &nbsp; Save</Button>
                </Form>
            </div>
        )
    }
}

export default SampleRequestForm;