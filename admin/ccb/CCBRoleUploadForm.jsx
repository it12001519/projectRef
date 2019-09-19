import React, { Component, } from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { FormValidator } from 'js/universal/FormUtilities';

class CCBUploadForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                file: '',
            },
            options: [],
        }
        // Bind functions
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
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

    handleDelete() {
        // TODO place ajax DELETE stuff here...
        let isSuccess = true;

        if (typeof this.props.onSubmit === 'function') {
            this.props.onSubmit({}, isSuccess);
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

        // Validate
        FormValidator.validateForm(e);

        // Set state using function to granularly modify data
        this.setState((previousState) => {
            return previousState.data = { ...previousState.data, [name]: value };
        });
    }

    render() {
        return (
            <div className="animated FadeIn">
                <Form onSubmit={this.handleSubmit} autoComplete="off" noValidate>
                    <FormGroup>
                        <Label for="file"> File: </Label>
                        <Input type="file" name="file" id="file" />
                    </FormGroup>
                    <FormGroup style={{ textAlign: 'right' }}>
                        <Button type="submit" color="primary" className="mr-1"> Submit </Button>
                        <Button onClick={() => this.props.toggleForm()} color="secondary" className="mr-1"> Cancel </Button>
                    </FormGroup>
                </Form>
            </div>
        )
    }
}


export default CCBUploadForm;