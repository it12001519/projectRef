import React from 'react'
import FetchUtilities from 'js/universal/FetchUtilities'
import FontAwesome from 'react-fontawesome'
import styled from 'styled-components'
import Validator from 'validatorjs'

import { Button, ListGroup, ListGroupItem, } from 'reactstrap'
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc'
import AdminComponent from 'js/app/views/admin/AdminComponent'
import { FormWidgetText, FormWidgetSelect, FormWidgetStatic } from 'js/universal/FormFieldWidgets'
import Spinner from 'js/universal/spinner'

const ADMIN_ROLES = ['ChangeLink Admin', 'System Admin']
const URL = '/api/v1/trksample/adm/cfg/sampledb-summary/'
const KEYLIST_URL = '/api/dropdown/sampledb-summary-keys'
const COLUMN_ID = 'key'
let columns = [
    {
        key: 'source',
        label: 'Source',
    }, {
        key: 'label',
        label: 'Label'
    }
]
let keyList = []

let rules = {
    key: ['required'],
    label: ['required', 'max:50']
}
let messages = {
    'required': 'This field is required',
    'max': 'Maximum :max characters only'
}

const SortableItem = SortableElement(
    ({ value }) => (
        <ListGroupItem className='sortable-list-li'>
            <FontAwesome name='sort' />{' '}
            {value['label']}
        </ListGroupItem>
    )
)

const SortableList = SortableContainer(
    ({ items }) => {
        return (
            <ListGroup>
                {items.map((value, i) => (
                    <SortableItem key={`item-${i}`} index={i} value={value} />
                ))}
            </ListGroup>
        )
    }
)

let SampleDashboardSummary = class extends React.Component {

    constructor(props) {
        super(props)
        this.state = { showSpinner: false, reorderMode: false }

        this.toggleMode = this.toggleMode.bind(this)
        this.onDrop = this.onDrop.bind(this)
        this.saveOrder = this.saveOrder.bind(this)
    }

    toggleMode() {
        this.setState({ showSpinner: true })
        if (!this.state.reorderMode) {
            fetch(`${URL}/list`, {
                headers: new Headers({
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }), credentials: 'include'
            })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then((response) => { return response.json() })
            .then((json) => { this.setState({ items: json, reorderMode: !this.state.reorderMode, showSpinner: false }) })
            .catch((ex) => { throw ex })
        } else {
            this.setState({ items: undefined, reorderMode: !this.state.reorderMode, showSpinner: false })
        }
    }

    onDrop = ({ oldIndex, newIndex }) => {
        this.setState({
            items: arrayMove(this.state.items, oldIndex, newIndex),
        });
    }

    saveOrder() {
        this.setState({ showSpinner: true })
        fetch(`${URL}/reorder`, {
            method: 'POST',
            body: JSON.stringify(this.state.items),
            headers: new Headers({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }),
            credentials: 'include',
        })
        .then(FetchUtilities.checkStatusWithSecurity)
        .then((response) => {
            if (response.status !== 200) {
                throw response
            } else {
                this.toggleMode()
            }
        })
        .catch((error) => {
            this.setState({ showSpinner: false })
            FetchUtilities.handleError(error)
        })
    }

    componentDidMount() {
        // Fetch the list of keys
        fetch(KEYLIST_URL, {
            headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }), credentials: 'include'
        })
        .then((response) => { return response.json() })
        .then((json) => { 
            json.unshift({ value: '', label: '' })
            keyList = json 
        })
        .catch((ex) => { throw ex })
    }

    render() {
        if (this.state.reorderMode) {
            return (
                <div className={this.props.className}>
                    <Spinner showSpinner={this.state.showSpinner} />
                    <div className='mb-1'>
                        <Button color='secondary' outline className='mr-1' onClick={this.toggleMode}><FontAwesome name='angle-double-left' />{' '}Cancel</Button>
                        <Button color='primary' className='mr-1' onClick={this.saveOrder}><FontAwesome name="save" />{' '}Save</Button>
                    </div>

                    <div>
                        {
                            this.state.items !== null
                                ? <SortableList items={this.state.items} onSortEnd={this.onDrop} />
                                : undefined
                        }
                    </div>
                </div>
            )
        } else {
            let buttons = <Button color='primary' className='mr-1' onClick={this.toggleMode}><FontAwesome name='sort' />{' '}Reorder Records</Button>
            return (
                <div className={this.props.className}>
                    <AdminComponent
                        recordNameSingular='summary field' recordNamePlural='summary fields'
                        adminRoles={ADMIN_ROLES} userAccess={this.props.userAccess}
                        gridURL={`${URL}`} columns={columns} id={COLUMN_ID}
                        form={SampleDashboardSummaryForm} extraButtons={buttons}
                    />
                </div>
            )
        }
    }
}

class SampleDashboardSummaryForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showSpinner: false,
            data: {
                key: null,
                label: null
            },
            validity: {
                key: true,
                label: true
            },
            errors: {}
        }
        this.onChange = this.onChange.bind(this)
        this.onSave = this.onSave.bind(this)
        this.validate = this.validate.bind(this)
    }

    componentDidMount() {
        if (this.props.id !== undefined && this.props.id !== null && this.props.id !== '') {
            // Fetch the data for this.props.id
            fetch(URL + this.props.id, {
                headers: new Headers({
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }), credentials: 'include'
            })
                .then(FetchUtilities.checkStatusWithSecurity)
                .then((response) => { return response.json() })
                .then((record) => {
                    this.setState({ data: record })
                })
                .catch((error) => {
                    this.props.parentCallback(`Encountered error while loading record for key: ${this.props.id}. ${error.message}`, false)
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

            let isUpdate = this.state.data.source !== undefined
            let url, method, successMessage
            if (isUpdate) {
                url = `${URL}${this.state.data.key}`
                method = 'POST'
                successMessage = 'Summary field sucessfully edited'
            } else {
                url = `${URL}`
                method = 'PUT'
                successMessage = 'Summary field sucessfully added'
            }

            fetch(url,
                {
                    method: method,
                    body: JSON.stringify(this.state.data),
                    headers: new Headers({
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache'
                    }),
                    credentials: 'include',
                }
            )
            .then(FetchUtilities.checkStatusWithSecurity)
            .then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    this.props.parentCallback(successMessage, true)
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
            formValidity[field] = !validation.errors.has(field)
            formErrors[field] = validation.errors.has(field) ? validation.errors.first(field) : null
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

                {
                    this.props.id !== undefined && this.props.id !== null && this.props.id !== ''
                        ? <FormWidgetStatic id='fld-adm-sdbflds-key' name='key' label='Source' 
                            value={this.state.data.source} inline />
                        : <FormWidgetSelect id='fld-adm-sdbflds-key' name='key' label='Source' options={keyList}
                            value={this.state.data.key} onChange={this.onChange} inline required
                            invalid={!this.state.validity.key} validationMessage={this.state.errors.key} />
                }
                <FormWidgetText id='fld-adm-sdbflds-lbl' name='label' label='Label'
                    value={this.state.data.label} onChange={this.onChange} inline required
                    invalid={!this.state.validity.label} validationMessage={this.state.errors.label} />

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

export default styled(SampleDashboardSummary) `
.sortable-list-li
{
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
}
`