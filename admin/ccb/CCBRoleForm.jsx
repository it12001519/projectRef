import React, { Component, } from 'react';
import { Button, Form, FormGroup, Label, Input, Row } from 'reactstrap';
import { FormValidator } from 'js/universal/FormUtilities';
import Validator from 'validatorjs';
import FetchUtilities from 'js/universal/FetchUtilities';


let rules_min = {
    roleName: ['required'],
    roleDescription: ['required'],
    rolePosition: ['required'],
    rolePosition: ['required']
};

let messages = {
    'required': 'This field is required'
};

let rules_all = {
    roleName: ['required', "max:200"],
    roleDescription: ['required', "max:200"],
    rolePosition: ['required', "max:200"],
    rolePosition: ['required', "max:200"]
};

const URL = '/api/v1/ccb/roles/';

class CCBRoleForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                roleId: this.props.data['roleId'] || 0,
                roleName: this.props.data['roleName'] || null,
                roleDescription: this.props.data['roleDescription'] || null,
                rolePosition: this.props.data['rolePosition'] || null,
                roleCategory: this.props.data['roleCategory'] || null,
                roleCcbId: this.props.ccbId || 0,
                roleIsObsolete: this.props.data['roleIsObsolete'] || '',
                roleAutoApproval: this.props.data['roleAutoApproval'] || 0
            },
            options: [],
            validity: {},
            errors: {},
            emptyForm: this.props.data['roleId'] === undefined || this.props.data['roleId'] === null,
        }

        // Bind functions
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
    }


    // Handler for form submit
    handleSubmit(e) {
        // Prevent legacy form post
        e.preventDefault();

        // Validate
        if (FormValidator.validateForm(e)) {
            // TODO place ajax POST / PUT stuff here...
            let isSuccess = true;

            if (typeof this.props.onSubmit === 'function') {
                this.props.onSubmit(this.state.data, isSuccess);
            }
        }
    }

    // Validator
    validate() {
        let validation;
        // Pick how we will validate the form, if start and end dates are not both filled up, don't validate for their range
        if (this.state.data.startDttm !== null && this.state.data.endDttm !== null) {
            validation = new Validator(this.state.data, rules_all, messages);
        } else {
            validation = new Validator(this.state.data, rules_min, messages);
        }
        validation.passes(); // Trigger validation

        let formValidity = {};
        let formErrors = {};
        Object.keys(this.state.data).map(field => {
            formValidity[field] = !validation.errors.has(field);
            formErrors[field] = validation.errors.has(field) ? validation.errors.first(field) : null;
        });

        this.setState({
            validity: formValidity,
            errors: formErrors
        });

        return validation.passes();
    }

    // Handler for form change
    handleChange(e) {
        // Prevent legacy form post
        e.preventDefault();

        // Get field name and value from event
        const target = e.target;
        let value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        // Validate
        //  FormValidator.validateForm(e);

        // Set state using function to granularly modify data
        this.setState((previousState) => {
            return previousState.data = { ...previousState.data, [name]: value };
        });
    }

    // Handler for form submit
    handleSubmit(e) {
        // Prevent legacy form post
        e.preventDefault();

        // Validate
        if (this.validate()) {
            // Show the spinner
            this.toggleSpinner();

            // Set the form data to be submitted
            let formdata = {
                roleId: this.state.data.roleId,
                roleName: this.state.data.roleName,
                roleDescription: this.state.data.roleDescription,
                rolePosition: this.state.data.rolePosition,
                roleCategory: this.state.data.roleCategory,
                roleCcbId: this.state.data.roleCCBId,
                roleIsObsolete: this.roleIsObsolete,
                roleAutoApproval: this.state.data.roleAutoApproval
            };

            fetch(URL,
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
                    if (response.status === 200) {
                        return response
                    } else {
                        // Handle validation errors
                        let formValidity = {};
                        let formErrors = {};
                        this.toggleSpinner();
                        Object.keys(response.errorDetails).map(field => {
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
                    // resolve();
                    if (typeof this.props.onSubmit === 'function') {
                        if (this.state.emptyForm) {
                            this.props.onSubmit('Role added.', true);
                        } else {
                            this.props.onSubmit('Role updated.', true);
                        }
                    }
                })
                .catch((error) => {
                    // reject(error);
                    this.handleError(error);
                });
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

    // Toggles the visibility of the spinner
    toggleSpinner() {
        if (typeof this.props.toggleSpinner === 'function') {
            this.props.toggleSpinner();
        }
    }

    render() {
        return (
            <Form autoComplete="off" noValidate>
                <FormGroup>
                    <Label for="roleName"> Role Name: </Label>
                    <Input
                        name="roleName"
                        value={this.state.data['roleName'] || ''}
                        onChange={this.handleChange}
                        type="text"
                        maxLength="100"
                        placeholder="Role Name"
                        required />
                </FormGroup>
                <FormGroup>
                    <Label for="roleDescription"> Role Description: </Label>
                    <Input
                        name="roleDescription"
                        value={this.state.data['roleDescription']}
                        onChange={this.handleChange}
                        type="text"
                        maxLength="100"
                        placeholder="Role Description"
                        required />
                </FormGroup>
                <FormGroup>
                    <Label for="rolePosition"> Position: </Label>
                    <Input
                        name="rolePosition"
                        value={this.state.data['rolePosition']}
                        onChange={this.handleChange}
                        type="text"
                        maxLength="100"
                        placeholder="Position"
                        required />
                </FormGroup>
                <FormGroup>
                    <Label for="roleCategory"> Category: </Label>
                    <Input
                        name="roleCategory"
                        value={this.state.data['roleCategory']}
                        onChange={this.handleChange}
                        type="select"
                        required>
                        <option></option>
                        {this.props.categories.map((item, i) => {
                            return <option key={item.value} value={item.value}>{item.label}</option>
                        })
                        }
                    </Input>
                </FormGroup>
                <FormGroup>
                    <Label for="roleAutoApproval"> Role Auto Approval: </Label>
                    <Input
                        name="roleAutoApproval"
                        value={this.state.data['roleAutoApproval']}
                        onChange={this.handleChange}
                        type="text"
                        maxLength="100"
                        placeholder="Role Auto Approval"
                        required />
                </FormGroup>
                <FormGroup>
                    <Label for="roleIsObsolete" md={3}> Obsolete: </Label>
                    <Input
                        name="roleIsObsolete"
                        md={3}
                        value={this.state.data['roleIsObsolete'] == 'Y' ? true : false}
                        onChange={this.handleChange}
                        type="checkbox"
                        required />
                </FormGroup>

                <FormGroup style={{ textAlign: 'right' }}>
                    <Button type="submit" color="primary" className="mr-1" onClick={this.handleSubmit}> Submit </Button>
                    <Button onClick={() => this.props.toggleForm()} color="secondary" className="mr-1"> Cancel </Button>
                </FormGroup>
            </Form>
        )
    }
}


export default CCBRoleForm;