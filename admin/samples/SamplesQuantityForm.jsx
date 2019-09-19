import React, { Component, } from 'react';
import { Button, Col, Label, Input, Form, FormGroup, FormFeedback } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import Required from "js/universal/Required";
import Validator from 'validatorjs';
import 'whatwg-fetch';
import FetchUtilities from 'js/universal/FetchUtilities';
import classnames from 'classnames';
import { SearchCustomerNumber, SearchNiche, } from 'js/app/models/TrkLookUp';
import Spinner from 'js/universal/spinner';

let rules = {
    maxQuantity: ['required']
};

let more_rules = {
    maxQuantity: ['required'],
    customer: ['required_without_all:sbe,sbe1,sbe2,niche,category'],
    sbe: ['required_without_all:customer,sbe1,sbe2,niche,category'],
    sbe1: ['required_without_all:customer,sbe,sbe2,niche,category'],
    sbe2: ['required_without_all:customer,sbe,sbe1,niche,category'],
    niche: ['required_without_all:customer,sbe,sbe1,sbe2,category'],
    category: ['required_without_all:customer,sbe,sbe1,sbe2,niche'],

}

let messages = {
    'required': 'This field is required.',
    'required_without_all': 'Please select a value in at least one of these fields. *'
};

let headers = new Headers({
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache'
})

class SamplesQuantityForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                id: (this.props.record && this.props.record['id']) || null,
                customer: (this.props.record && this.props.record['customer']) || null,
                category: (this.props.record && this.props.record['category']) || null,
                sbe: (this.props.record && this.props.record['sbe']) || null,
                sbe1: (this.props.record && this.props.record['sbe1']) || null,
                sbe2: (this.props.record && this.props.record['sbe2']) || null,
                niche: (this.props.record && this.props.record['niche']) || null,
                maxQuantity: (this.props.record && this.props.record['maxQuantity']) || null,
                maxPrice: (this.props.record && this.props.record['maxPrice']) || null,
            },
            validity: {},
            errors: {},
            sbeList: [],
            sbe1List: [],
            sbe2List: [],
            sbe1FullList: [],
            sbe2FullList: [],
            categoryList: []
        }
        this.validate = this.validate.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    validate() {
        let validation;
        if(this.state.data.customer === null && this.state.data.sbe === null &&
            this.state.data.sbe === null && this.state.data.sbe1 === null &&
            this.state.data.sbe2 === null && this.state.data.niche === null &&
            this.state.data.category === null
        ) {
            validation = new Validator(this.state.data, more_rules, messages);
        } else {
            validation = new Validator(this.state.data, rules, messages);
        }
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

        if(target.name === "sbe" && target.value !== null) {
            this.fetchSBE1List(target.value);
        } else if (target.name === "sbe1" && target.value !== null) {
            this.fetchSBE2List(target.value);
        }
    }

    
    componentDidMount() {
        this.fetchSBEList();
        this.fetchSBE1FullList();
        this.fetchSBE2FullList();
        this.fetchCategoryList();
    }

    fetchSBEList() {
        fetch("/api/v1/samples/sbe/", {
            credentials: 'include', headers: headers
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then((json) => this.setState({sbeList: json}))
            .catch(error => FetchUtilities.handleError(error))
    }

    fetchSBE1FullList() {
        fetch("/api/v1/samples/sbe1/", {
            credentials: 'include', headers: headers
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then((json) => this.setState({sbe1FullList: json}))
            .catch(error => FetchUtilities.handleError(error))
    }

    fetchSBE2FullList() {
        fetch("/api/v1/samples/sbe2/", {
            credentials: 'include', headers: headers
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then((json) => this.setState({sbe2FullList: json}))
            .catch(error => FetchUtilities.handleError(error))
    }

    
    fetchSBE1List(sbe) {
        fetch("/api/v1/samples/sbe1/" + sbe + "/", {
            credentials: 'include', headers: headers
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then((json) => this.setState({sbe1List: json}))
            .catch(error => FetchUtilities.handleError(error))
    }

    
    fetchSBE2List(sbe1) {
        fetch("/api/v1/samples/sbe2/" + sbe1 + "/", {
            credentials: 'include', headers: headers
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then((json) => this.setState({sbe2List: json}))
            .catch(error => FetchUtilities.handleError(error))
    }
    
    fetchCategoryList() {
        fetch("/api/v1/samples/categoryList/", {
            credentials: 'include', headers: headers
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then((json) => this.setState({categoryList: json}))
            .catch(error => FetchUtilities.handleError(error))
    }

    handleSubmit(e) {
        e.preventDefault();
        if(this.validate()) {
            this.toggleSpinner();
            const URL = "/api/v1/samples/quantity/";
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
                        this.confirmAlert('Sample Quantity added.', true);
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
            return previousState.data = { ...previousState.data, 'customer': customerNumber.customer_number };
        });
    }

    onUpdateNiche = (niche) => {
        this.setState((previousState) => {
            return previousState.data = { ...previousState.data, 'niche': niche.niche };
        });
    }

    render() {
        return(
            <div>
                <Form onSubmit={this.handleSubmit}>
                <Spinner showSpinner={this.state.showSpinner} />
                    <FormGroup row>
                        <Col sm={12}>
                            <Label for="customer">Customer: </Label>
                            {this.state.data.customer === 'DEFAULT' ? (
                                <Input type="text" value={this.state.data.customer} disabled/>
                            ) : (
                                <SearchCustomerNumber onUpdate={this.onUpdateCustomerNumber}
                                selected={this.state.data.customer}
                                />
                            )}
                                <div className={classnames({"valid-feedback": this.state.validity.customer}, {"invalid-feedback": !this.state.validity.customer})} style={{ display: 'block' }}>{this.state.errors.customer}</div>
                        </Col>
                        <Col sm={12}>
                            <Label for="category"> Category: </Label>
                            {this.state.data.category === 'DEFAULT' ? (
                                <Input type="text" value={this.state.data.category} disabled/>
                            ) : (
                                <Input name="category" type="select"
                                value={this.state.data.category ? this.state.data.category: ''}
                                onChange={this.handleChange}>
                                <option></option>
                                {
                                    this.state.categoryList.map((key) => <option key={key}>{key}</option>)
                                }
                                </Input>
                            )}
                            <div className={classnames({"valid-feedback": this.state.validity.category}, {"invalid-feedback": !this.state.validity.category})} style={{ display: 'block' }}>{this.state.errors.category}</div>
                        </Col>
                        <Col sm={12}>
                            <Label for="sbe"> SBE: </Label>
                                {this.state.data.sbe === 'DEFAULT' ? (
                                    <Input type="text" value={this.state.data.sbe} disabled/>
                                ) : (
                                    <Input name="sbe" type="select"
                                    value={this.state.data.sbe ? this.state.data.sbe: ''}
                                    onChange={this.handleChange}>
                                    <option></option>
                                    {
                                        this.state.sbeList.map((key) => <option key={key}>{key}</option>)
                                        
                                    }
                                    </Input>
                                )}
                                <div className={classnames({"valid-feedback": this.state.validity.sbe}, {"invalid-feedback": !this.state.validity.sbe})} style={{ display: 'block' }}>{this.state.errors.sbe}</div>
                        </Col>
                        <Col sm={12}>
                            <Label for="sbe1"> SBE1: </Label>
                            {this.state.data.sbe1 === 'DEFAULT' ? (
                                <Input type="text" value={this.state.data.sbe1} disabled/>
                            ) : (
                                <Input name="sbe1" type="select"
                                value={this.state.data.sbe1 ? this.state.data.sbe1: ''}
                                onChange={this.handleChange}>
                                <option></option>
                                { this.state.data.sbe1 !== null ? (
                                    this.state.sbe1FullList.map((key) => <option key={key}>{key}</option>)
                                ): (
                                    this.state.sbe1List.map((key) => <option key={key}>{key}</option>)
                                )}
                                </Input>
                            )}
                                <div className={classnames({"valid-feedback": this.state.validity.sbe1}, {"invalid-feedback": !this.state.validity.sbe1})} style={{ display: 'block' }}>{this.state.errors.sbe1}</div>
                        </Col>
                        <Col sm={12}>
                            <Label for="sbe2"> SBE2: </Label>
                            {this.state.data.sbe2 === 'DEFAULT' ? (
                                <Input type="text" value={this.state.data.sbe2} disabled/>
                            ) : (
                                <Input name="sbe2" type="select"
                                value={this.state.data.sbe2 ? this.state.data.sbe2: ''}
                                onChange={this.handleChange}>
                                <option></option>
                                { this.state.data.sbe2 !== null ? (
                                    this.state.sbe2FullList.map((key) => <option key={key}>{key}</option>)
                                ) : (
                                    this.state.sbe2List.map((key) => <option key={key}>{key}</option>)
                                )}
                                </Input>
                            )}
                                <div className={classnames({"valid-feedback": this.state.validity.sbe2}, {"invalid-feedback": !this.state.validity.sbe2})} style={{ display: 'block' }}>{this.state.errors.sbe2}</div>
                        </Col>
                        <Col sm={12}>
                            <Label for="niche"> Niche: </Label>
                            {this.state.data.niche === 'DEFAULT' ? (
                                <Input type="text" value={this.state.data.niche} disabled/>
                            ) : (
                                <SearchNiche onUpdate={this.onUpdateNiche} selected={this.state.data.niche}/>
                            )}
                                
                                <div className={classnames({"valid-feedback": this.state.validity.niche}, {"invalid-feedback": !this.state.validity.niche})} style={{ display: 'block' }}>{this.state.errors.niche}</div>
                        </Col>
                        <Col sm={12}>
                            <Label for="maxQuantity"><Required required> Max Quantity: </Required></Label>
                            <Input name="maxQuantity" type="number" 
                                value={this.state.data.maxQuantity ? this.state.data.maxQuantity: ''}
                                onChange={this.handleChange}
                                invalid={!this.state.validity.maxQuantity}
                                required/>
                                <FormFeedback>{this.state.errors.maxQuantity}</FormFeedback>
                        </Col>
                        <Col sm={12}>
                            <Label for="maxPrice"> Max Price: </Label>
                            {this.state.data.customer === 'DEFAULT' && this.state.data.category === 'DEFAULT' && this.state.data.sbe === 'DEFAULT' && this.state.data.sbe1 === 'DEFAULT' && this.state.data.sbe2 === 'DEFAULT' ? (
                                <Input type="text" value="DEFAULT" disabled/>
                            ) : (
                                <Input name="maxPrice" type="number"
                                value={this.state.data.maxPrice ? this.state.data.maxPrice: ''}
                                onChange={this.handleChange} />
                            )}
                        </Col>
                    </FormGroup>
                    <Button onClick={() => this.props.toggle()} className="mr-1 pull-right" color="secondary"> Cancel </Button>
                    <Button className="mr-1 pull-right" color="primary" onClick={this.handleSubmit}><FontAwesome name="save" /> &nbsp; Save</Button>
                </Form>
            </div>
        )
    }
}

export default SamplesQuantityForm;