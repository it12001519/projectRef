import React from 'react'
import { Alert, Form, } from 'reactstrap'
import { PrimaryButton, NeutralButton, } from 'js/app/models/ChangelinkUI'
import { GridTextCell, GridActionCell } from 'js/universal/GridCells'
import { ComponentModal, successModal, errorModal, confirmDeleteModal } from 'js/universal/Modals'
import { FormWidgetText, FormWidgetTextArea, FormWidgetSelect } from 'js/universal/FormFieldWidgets'
import { showOverlaySpinner, hideOverlaySpinner } from 'js/universal/spinner'
import ReactiveTable, { ReactiveTableStore } from 'reactive-tables'
import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb'

import FetchUtilities from 'js/universal/FetchUtilities'
import Validator from 'validatorjs'

const BASE_URL = "/api/v1/diary";
const ADMIN_ROLES = ['System Admin', 'ChangeLink Admin', 'PCN Coordinator', 'Sample Coordinator', 'Change Coordinator'];

class DiaryPage extends React.Component {

    constructor(props) {
        super(props);

        this.table = null
        const changeNumber = this.props.changeNumber
        const pcnNumber = this.props.pcnNumber
        const sampleNumber = this.props.sampleNumber

        if (changeNumber !== undefined && changeNumber !== null) {
            this.LIST_URL = `${BASE_URL}/change/${changeNumber}`
            this.contextId = changeNumber
            this.contextType = 'Change'
        }
        else if (pcnNumber !== undefined && pcnNumber !== null) {
            this.LIST_URL = `${BASE_URL}/pcn/${pcnNumber}`
            this.contextId = pcnNumber
            this.contextType = 'PCN'
        }
        else if (sampleNumber !== undefined && sampleNumber !== null) {
            this.LIST_URL = `${BASE_URL}/sample/${sampleNumber}`
            this.contextId = sampleNumber
            this.contextType = 'Sample'
        }
        else {
            errorModal('System encountered a fatal error')
        }

        this.state = {
            alert: { show: false, text: undefined, color: undefined },
            formVisible: false,
            formData: {},
            types: [],
            columns: [
                {
                    key: 'actions',
                    label: '',
                    sortable: false,
                },
                {
                    key: 'contextId',
                    label: this.contextType,
                    sortable: true,
                },
                {
                    key: 'comments',
                    label: 'Diary Entry',
                    sortable: true,
                },
                {
                    key: 'contextType',
                    label: 'Type',
                    sortable: true,
                },
                {
                    key: 'createdBy',
                    label: 'Created By',
                    sortable: true,
                },
                {
                    key: 'createdDttm',
                    label: 'Created',
                    sortable: true,
                }, {
                    key: 'lastUpdatedBy',
                    label: 'Updated By',
                    sortable: true,
                }, {
                    key: 'lastUpdatedDttm',
                    label: 'Updated',
                    sortable: true,
                }
            ],
            canUpdate: props.hasRole(ADMIN_ROLES)
        };
    }

    // Handler for initiating an add record transaction
    handleAdd = () => {
        this.setState({
            formData: {
                contextId: this.contextId,
                contextType: this.contextType,
                comments: '',
            },
            formVisible: true
        })
    }

    // Handler for initiating an update record transaction
    handleUpdate = (data) => {
        this.setState({
            formData: {
                id: data.id,
                contextId: data.contextId,
                contextType: data.contextType,
                comments: data.comments,
            },
            formVisible: true
        })
    }

    // Handler for initiating a delete record transaction
    handleDelete = (data) => {
        confirmDeleteModal(
            <span><p>Are you sure you want to delete the following diary entry?</p><tt>{data.comments}</tt></span>,
            () => {
                showOverlaySpinner()
                FetchUtilities.fetchDelete(`${BASE_URL}/${data.id}`, 
                    (httpStatus, response) => {
                        if (httpStatus === 200) {
                            hideOverlaySpinner()
                            successModal('Change diary entry permanently deleted.', true)
                            this.table.refresh()
                        } else throw new Error('Transaction failed')
                    }, _ => hideOverlaySpinner()
                )
            }
        )
    }

    handleFormSubmit = (method, data) => {
        if (method === 'INSERT') {
            showOverlaySpinner()
            FetchUtilities.fetchPost(`${BASE_URL}/`, data,
                (httpStatus, response) => {
                    if (httpStatus === 200) {
                        this.toggleForm()
                        hideOverlaySpinner()
                        successModal('Change diary entry added.', true)
                        this.table.refresh()
                    } else { throw new Error('Transaction failed') }
                }, _ => {
                    hideOverlaySpinner()
                }
            )
        }

        if (method === 'UPDATE') {
            showOverlaySpinner()
            FetchUtilities.fetchPut(`${BASE_URL}/${data.id}/`, data,
                (httpStatus, response) => {
                    if (httpStatus === 200) {
                        this.toggleForm()
                        hideOverlaySpinner()
                        successModal('Change diary entry changes saved.', true)
                        this.table.refresh()
                    } else { throw new Error('Transaction failed') }
                }, _ => {
                    hideOverlaySpinner()
                }
            )
        }
    }

    toggleForm = () => {
        this.setState({
            formVisible: !this.state.formVisible
        })
    }

    // Set up an alert notification
    notifyAlert = (type, message) => {
        this.setState({
            alert: {
                show: true,
                text: message,
                color: type
            }
        });
    }

    // Hide the alert notification
    closeAlert = () => {
        this.setState({
            alert: {
                show: false,
                text: undefined,
                color: undefined
            }
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
            this.setState({
                canUpdate: nextProps.hasRole(ADMIN_ROLES)
            })
    }

    componentDidMount() {
        const url = "/api/v1/diary/types"
        FetchUtilities.fetchGet(url,
            (httpStatus, data) => {
                this.setState({ types: data })
            }
        )
    }

    render() {
        let customBar = (
            this.state.canUpdate ? <div className="p-2">
                <PrimaryButton label='Add Entry' icon='plus' onClick={this.handleAdd} className="btn-sm" />
            </div> : undefined
        );

        let MyGridRow = (props) => {
            return <GridRow {...props} refreshTable={this.refreshTable}
                onUpdate={this.handleUpdate} onDelete={this.handleDelete} />
        }

        return (
            <React.Fragment>
                <ChangeLinkBreadcrumb crumbs={[{ text: 'Home', to: "/" }, { text: 'Changes Diary', active: true }]} />

                <Alert
                    className='mb-2'
                    color={this.state.alert.color}
                    isOpen={this.state.alert.show}
                    toggle={this.closeAlert}>
                    {this.state.alert.text}
                </Alert>

                <ReactiveTableStore
                    credentials={'include'}
                    server
                    tableId="diary_table">
                    <ReactiveTable
                        server striped
                        advancedColumns
                        credentials={'include'}
                        fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                        fetchErrorHandler={FetchUtilities.handleError}
                        columnFilters={{ CONTEXTTYPE: this.contextType }}
                        url={this.LIST_URL}
                        columns={this.state.columns}
                        row={MyGridRow}
                        ref={(table) => this.table = table}
                        customTopBar={customBar}
                        mirrorCustomTopBar
                    />
                </ReactiveTableStore>

                <ComponentModal
                    show={this.state.formVisible}
                    toggleModal={this.toggleForm}
                    title={this.state.formData === {} || this.state.formData.comments === '' ? 'Add Diary Entry' : 'Edit Diary Entry'}>
                    <DiaryForm types={this.state.types} contextType={this.contextType} data={this.state.formData} 
                        method={this.state.formData === {} || this.state.formData.comments === '' ? 'INSERT' : 'UPDATE'}
                        onSubmit={this.handleFormSubmit} onClose={this.toggleForm} />
                </ComponentModal>
            </React.Fragment>
        );
    }
}

class GridRow extends React.Component {

    render() {
        const record = this.props.data;
        const buttons = [
            { 'icon': 'pencil', 'title': 'Edit', 'callback': () => this.props.onUpdate(record) },
            { 'icon': 'trash', 'title': 'Delete', 'callback': () => this.props.onDelete(record) }
        ];

        const cells = this.props.columns.map((column) => {
            const key = 'column-' + column.key;
            if (column.key === 'actions') {
                return <GridActionCell key={key} buttons={buttons} />
            } else {
                return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
            }
        });

        return <tr>{cells}</tr>
    }
}

let rules = {
    comments: ['required', 'max:4000']
}
let messages = {
    'required': 'This field is required',
    'max': 'This field may not be greater than :max characters'
}

export class DiaryForm extends React.Component {

    state = {
        data: this.props.data,
        validity: {},
        errors: {}
    }

    handleChange = (name, value) => {
        // Set state using function to granularly modify data
        this.setState((previousState) => {
            return previousState.data = { ...previousState.data, [name]: value };
        })
        this.validate()
    }

    validate = () => {
        // Validate the form
        let validation = new Validator(this.state.data, rules, messages);
        let isValid = validation.passes(); // Trigger validation

        let formValidity = {};
        let formErrors = {};
        for (let field in this.state.data) {
            formValidity[field] = !validation.errors.has(field);
            formErrors[field] = validation.errors.has(field) ? validation.errors.first(field) : null;
        }

        this.setState({
            validity: formValidity,
            errors: formErrors
        })

        return isValid
    }

    onSubmit = (e) => {
        e.preventDefault()
        if (this.validate() && typeof this.props.onSubmit === 'function')
            this.props.onSubmit(this.props.method, this.state.data)
    }

    onClose = (e) => {
        e.preventDefault()
        if (typeof this.props.onClose === 'function')
            this.props.onClose()
    }

    render() {
        let contextTypeLabel = ''
        switch (this.props.contextType.toLowerCase()) {
            case 'change': contextTypeLabel = 'Change Number'; break;
            case 'pcn': contextTypeLabel = 'PCN Number'; break;
            case 'sample': contextTypeLabel = 'Sample Number'; break;
        }

        return (
            <Form autoComplete="off" noValidate name="sub" onSubmit={this.onSubmit}>
                <FormWidgetText label={contextTypeLabel} name='contextId' value={this.state.data.contextId} readonly disabled />
                <FormWidgetSelect label='Type' name='contextType' value={this.state.data.contextType} options={this.props.types} readonly disabled />
                <FormWidgetTextArea label='Diary Entry' name='comments' value={this.state.data.comments} onChange={this.handleChange}
                    maxlength={4000} required invalid={!this.state.validity.comments} validationMessage={this.state.errors.comments} />

                <hr />
                <span className='pull-right'>
                    <PrimaryButton label='Save Changes' onClick={this.onSubmit} />
                    <NeutralButton label='Close' onClick={this.onClose} className='ml-1' />
                </span>
            </Form>
        )
    }
}

export default DiaryPage