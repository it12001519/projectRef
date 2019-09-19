import React, { Component, } from 'react';
import { Button, Form, FormFeedback, FormGroup, Label, Input } from 'reactstrap';
import Required from "js/universal/Required";
import Validator from 'validatorjs';
import LDAPSearchInput from 'js/universal/LDAPSearchInput';
import FetchUtilities from 'js/universal/FetchUtilities';

// const roles = "/json/roles.json";
const rolesURL = "/usersvc/authorities/managed";
const addURL = "/usersvc/authority";

let rules_min = {
    userName: ['required'],
    role: ['required']
};

let messages = {
    'required': 'This field is required'
};

class SecurityForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                role: '',
                userName: ''
            },
            validity: {},
            errors: {},
            options: []
        }
        // Bind functions
        this.handleCancel = this.handleCancel.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
    }

    componentDidMount() {
        this.toggleSpinner();
        fetch(rolesURL, {
            method: 'GET',
            credentials: 'include',
            headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            })
        })
            .then((res) => {
                return res.json();
            }).then((json) => {
                var roles = json;
                this.setState({ options: roles });
                this.setState((previousState) => {
                    return previousState.data = { ...previousState.data, 'role': json === undefined ? '' : json[0] };
                });
                this.toggleSpinner();
            });
    }

    handleSecurityFormCancel() {
        if (typeof this.props.onCancel === 'function') {
            this.props.onCancel();
        }
    }

    handleCancel() {
        if (typeof this.props.onCancel === 'function') {
            this.props.onCancel();
        }
    }

    // Toggles the visibility of the spinner
    toggleSpinner() {
        if (typeof this.props.toggleSpinner === 'function') {
            this.props.toggleSpinner();
        }
    }

    // Handles errors from the server
    handleError(error) {
        console.log(error);
        if (typeof this.props.onSubmit === 'function') {
            this.props.onSubmit(error.message, false);
        } else {
            alert('Error: ' + error.message);
        }
    }

    // Handler for form submit
    handleSubmit(e) {
        // Prevent legacy form post
        e.preventDefault();
        e.stopPropagation()
        // Validate
        if (this.validate()) {
            // Set the form data to be submitted
            let formdata = {
                userName: this.state.data.userName,
                role: this.state.data.role,
            };
            this.toggleSpinner();
            fetch(addURL,
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
                .then((response) => {
                    this.toggleSpinner();
                    if (response.status === 200) {
                        return response
                    } else {
                        // Handle validation errors
                        let formValidity = {};
                        let formErrors = {};
                        Object.keys(response.errorDetails).forEach(field => {
                            formValidity[field.key] = false;
                            formErrors[field.key] = field.value;
                        });
                        this.setState({
                            validity: formValidity,
                            errors: formErrors
                        });
                    }
                })
                .then(() => {
                    if (typeof this.props.onSubmit === 'function') {
                        this.props.onSubmit('User added.', true);
                    }
                })
                .catch((error) => {
                    this.toggleSpinner();
                    this.handleError(error);
                });
        }
    }

    // Handler for form change
    handleChange(e) {
        // Prevent legacy form post
        e.preventDefault();

        // Get field name and value from event
        const target = e.target;
        let value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        // Set state using function to granularly modify data
        this.setState((previousState) => {
            return previousState.data = { ...previousState.data, [name]: value };
        });
    }

    handlePrimarySearch = (searchValue) => {
        this.setState((previousState) => {
            return previousState.data = { ...previousState.data, 'userName': searchValue.label };
        });
    }

    // Validator
    validate() {
        let validation = new Validator(this.state.data, rules_min, messages);
        validation.passes(); // Trigger validation

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

    render() {
        return (
            <Form onSubmit={this.handleSubmit} autoComplete="off" noValidate>
                <FormGroup>
                    <Label for="userName"><Required required>User</Required></Label>
                    <LDAPSearchInput onSelectLdap={this.handlePrimarySearch} placeholder="Enter Name or ID" name="userName" required={true}
                    />
                    <Input type="hidden" name="" invalid={!this.state.validity.userName} />
                    <FormFeedback>{this.state.errors.userName}</FormFeedback>
                </FormGroup>
                <FormGroup>
                    <Label for="role"><Required required>Role</Required></Label>
                    <Input type="select" name="role" onChange={this.handleChange} required>
                        {this.state.options.map((option) => {
                            return (<option value={option} key={option}>{option}</option>)
                        })}
                    </Input>
                    <Input type="hidden" name="" invalid={!this.state.validity.role} />
                    <FormFeedback>{this.state.errors.role}</FormFeedback>
                </FormGroup>

                <span className="float-right">
                    <Button type="submit" color="primary" className="mr-1" onClick={(event) => this.handleSubmit(event, false)}> Submit </Button>
                    <Button onClick={this.handleCancel} color="secondary" outline className="mr-1"> Cancel </Button>
                </span>
            </Form>
        )
    }
}

export default SecurityForm;