import React from 'react'
import FetchUtilities from 'js/universal/FetchUtilities'
import FontAwesome from 'react-fontawesome'
import Validator from 'validatorjs'

import { Button, } from 'reactstrap'
import AdminComponent from 'js/app/views/admin/AdminComponent'
import { FormWidgetText } from 'js/universal/FormFieldWidgets'
import Spinner from 'js/universal/spinner'

const ADMIN_ROLES = ['ChangeLink Admin','System Admin','PCN Admin']
const URL = '/api/v1/pcn/adm/cfg/pcn-projectname/'
const COLUMN_ID = 'id'

let columns = [
    {
        key: 'id',
        label: 'ID',
    }, {
        key: 'version',
        label: 'Version',
    }, {
        key: 'name',
        label: 'Name'
    }
]

let rules = {
    name: ['required', 'max:255']
}
let messages = {
    'required': 'This field is required',
    'max': 'Maximum :max characters only'
}

let PCNProjectName = class extends React.Component {
    render() {
        return (
            <div className={this.props.className}>
                <AdminComponent
                    recordNameSingular='PCN Project Name' recordNamePlural='PCN Project Names'
                    adminRoles={ADMIN_ROLES} userAccess={this.props.userAccess}
                    gridURL={URL} columns={columns} id={COLUMN_ID}
                    form={PCNProjectNameForm}
                    currentTab='PCNProjName'
                />
            </div>
        )
    }
}

class PCNProjectNameForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showSpinner: false,
            data: {
                id: null,
                version: null,
                name: null
            },
            validity: {
                status: true
            },
            errors: {}
        }
        this.onChange = this.onChange.bind(this)
        this.onSave = this.onSave.bind(this)
        this.validate = this.validate.bind(this)
    }

    componentDidMount() {
        if (this.props.id !== undefined) {
            // Fetch the data for this.props.id
            fetch(URL + this.props.id, { headers: new Headers({
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }), credentials: 'include' })
                .then(FetchUtilities.checkStatusWithSecurity)
                .then((response) => { return response.json() })
                .then((record) => {
                    this.setState({ data: record })
                })
                .catch((error) => {
                    this.props.parentCallback(`Encountered error while loading record for ID: ${this.props.id}. ${error.message}`, false)
                })
        }
    }

    onChange(name, value) {
        let validation = new Validator({ ...this.state.data, [name]: value }, rules, messages);
        validation.passes();

        // Set state using function to granularly modify data
        this.setState((previousState) => {
            previousState.data = { ...previousState.data, [name]: value };
            previousState.validity = { ...previousState.validity, [name]: !validation.errors.has(name) };
            previousState.errors = { ...previousState.errors, [name]: validation.errors.has(name) ? validation.errors.first(name) : null };
            return previousState;
        });
    }

    onSave() {
        if (this.validate()) {
            // Show the spinner
            this.setState({ showSpinner: true })

            let id = !!this.state.data.id ? this.state.data.id : ''

            fetch(URL + id,
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
                    if (response.status >= 200 && response.status < 300) {
                        if (id === '')
                            this.props.parentCallback('Project Name sucessfully added', true)
                        else
                            this.props.parentCallback('Project Name sucessfully edited', true)
                        return undefined
                    } else {
                        return response.json()
                    }
                })
                .then((json) => {
                    if (json !== undefined) {
                        if (json.message !== undefined)
                            this.props.parentCallback(json.message, false)
                        else
                            this.props.parentCallback('System error encountered. Transaction aborted.', false)
                    }
                })
                .catch((error) => {
                    this.props.parentCallback('Encountered error: ' + error.message, false)
                });
        }
    }

    validate() {
        let validation = new Validator(this.state.data, rules, messages);
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
            <div className={this.props.className}>

                <FormWidgetText id='fld-adm-version' name='version' label='Version' inline
                    value={this.state.data.version !== null ? this.state.data.version : ''} disabled />
                <FormWidgetText id='fld-adm-name' name='name' label='Name'
                    value={this.state.data.name !== null ? this.state.data.name : ''} onChange={this.onChange} inline
                    invalid={!this.state.validity.status} validationMessage={this.state.errors.name} />
                
                <hr />
                <span className='float-right'>
                    <Button color="primary" className="mr-1" onClick={this.onSave}><FontAwesome name="save" />{' '}Save Changes</Button>
                    <Button color="secondary" outline className="mr-1" onClick={this.props.toggleForm}>Cancel</Button>
                </span>

                <Spinner showSpinner={this.state.showSpinner} />
            </div>
        )
    }
}

export default PCNProjectName;