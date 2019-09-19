import React, { Component, } from 'react';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import ReactiveTable, { ReactiveTableStore } from 'reactive-tables';
import FontAwesome from 'react-fontawesome';
import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb';
import Spinner from 'js/universal/spinner';
import 'whatwg-fetch';
import FetchUtilities from 'js/universal/FetchUtilities';

import withLayout from 'js/app/models/withLayout';
import { GridTextCell, GridActionCell } from 'js/universal/GridCells';
import { ConfirmDeleteModal, InfoModal, } from 'js/universal/Modals';
import { FloatNotifySuccess, } from 'js/app/models/FloatNotification';
import AnnouncementForm from 'js/app/views/admin/announcement/AnnouncementForm';

//const URL = "/json/announcements/list.json"; // Mock data
const URL = "/api/v1/announcements"; // API data

const ADMIN_ROLES = ['System Admin', 'ChangeLink Admin'];

// Table columns
const TABLE_COLUMNS = [
    {
        key: 'actions',
        label: ''
    }, {
        key: 'teaser',
        label: 'Teaser'
    }, {
        key: 'status',
        label: 'Status'
    }, {
        key: 'lastUpdateDttm',
        label: 'Last Update'
    }, {
        key: 'lastUpdateByName',
        label: 'Updated By'
    }
];

class AnnouncementMgrPage extends Component {

    static emptyForm;

    constructor(props) {
        super(props);

        this.state = {
            formVisible: false,
            deleteModal: false,
            showSpinner: false,
            tableRowData: {},
            tableId: 0,
            canUpdate: props.hasRole(ADMIN_ROLES)
        }

        this.table = null

        this.emptyForm = {
            id: null,
            teaser: null,
            message: null,
            status: 'NEW',
            startDttm: null,
            endDttm: null,
            author: null,
            publishDttm: null,
            requireToRead: false
        }

        // Bind functions
        this.handleNewAnnouncementButtonClick = this.handleNewAnnouncementButtonClick.bind(this);
        this.handleFormCancel = this.handleFormCancel.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.refreshTable = this.refreshTable.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
        this.toggleForm = this.toggleForm.bind(this);
        this.toggleAlert = this.toggleAlert.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
            this.setState({
                canUpdate: nextProps.hasRole(ADMIN_ROLES)
            })
    }

    // Handler for new announcement button click
    handleNewAnnouncementButtonClick() {
        this.setState({
            tableRowData: this.emptyForm,
            formVisible: true
        });
    }

    // Handler for form button onCancel
    handleFormCancel() {
        this.setState({
            tableRowData: this.emptyForm,
            formVisible: false
        });
    }

    // Handler for form button onSubmit
    handleFormSubmit(message, isSuccess) {
        if (isSuccess) {
            this.setState({
                notify: 'success',
                notifyText: `Success: ${message}`,
                showSpinner: false,
                formVisible: false // close form
            })

            this.refreshTable()
        } else {
            this.setState({
                notify: 'error',
                notifyText: `${message}`,
                showSpinner: false,
                formVisible: false // close form
            })
        }
    }

    refreshTable() {
        this.table.refresh()
    }

    toggleSpinner() {
        this.setState({ showSpinner: !this.state.showSpinner });
    }

    toggleForm() {
        this.setState({ formVisible: !this.state.formVisible });
    }

    toggleAlert() {
        this.setState({
            notify: undefined
        });
    }

    render() {
        let columns = JSON.parse(JSON.stringify(TABLE_COLUMNS)); // Deep copy the old array
        // Remove the actions columns if uneditable
        if (!this.state.canUpdate) {
            delete columns[0]
        }

        let MyGridRow = (props) => {
            return <GridRow {...props} refreshTable={this.refreshTable} toggleSpinner={this.toggleSpinner} onSubmit={this.handleFormSubmit} />
        }

        return (
            <div className={this.props.className}>
                <Spinner showSpinner={this.state.showSpinner} />

                <ChangeLinkBreadcrumb crumbs={[
                    { text: 'Home', to: "/" },
                    { text: 'Admin', active: true },
                    { text: 'Announcements', active: true }
                ]} />
                {
                    this.state.canUpdate
                        ? <Button color="primary" id="btn-announcement-new" onClick={this.handleNewAnnouncementButtonClick}
                            className='mb-1'>
                            <FontAwesome name="plus" />&nbsp; New Announcement
                          </Button>
                        : undefined
                }
                {/* <ReactiveTableStore
                    credentials={'include'}
                    server
                    tableId="announcement-table-main"
                > */}
                <ReactiveTable server
                    credentials={'include'}
                    url={URL}
                    columns={columns}
                    fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                    fetchErrorHandler={FetchUtilities.handleError}
                    row={MyGridRow} ref={(table) => this.table = table}
                    striped columnFilters advancedColumns />
                {/* </ReactiveTableStore> */}
                {/* Modal wrapping AnnouncementForm component */}
                {
                    this.state.canUpdate
                        ? <Modal
                            isOpen={this.state.formVisible}
                            toggle={this.toggleForm}
                            fade={true}
                            backdrop={true}
                            size="lg">
                            <ModalHeader toggle={this.toggleForm}>New Announcement</ModalHeader>
                            <ModalBody>
                                <AnnouncementForm
                                    data={this.state.tableRowData}
                                    onCancel={this.handleFormCancel}
                                    onSubmit={this.handleFormSubmit}
                                    toggleSpinner={this.toggleSpinner} />
                            </ModalBody>
                        </Modal>
                        : undefined
                }

                {/* Modal for confirming deletion */}
                {
                    this.state.canUpdate
                        ? <ConfirmDeleteModal
                            show={this.state.deleteModal}
                            message={'You are about to delete the announcement ' + (<b>{this.state.tableRowData.teaser}</b>) + '. Deleted announcements cannot be recovered. Would you like to proceed?'}
                            handleClose={this.toggleDeleteModal}
                            handleConfirmation={(event) => this.handleDelete(event, this.state.tableRowData.id)}
                        />
                        : undefined
                }

                {
                    /* Notify for success/failure/error */
                    this.state.notify === 'success' ? (
                        <FloatNotifySuccess message={this.state.notifyText} autoDismiss />
                    ) : this.state.notify === 'error' ? (
                        <InfoModal icon='exclamation-circle' color='danger'
                            title='Error' message={this.state.notifyText}
                            handleClose={() => this.toggleAlert(undefined)} />
                    ) : undefined
                }
            </div>
        );
    }
}

class GridRow extends Component {

    constructor(props) {
        super(props);
        this.state = {
            formVisible: false,
            deleteModal: false,
            tableRowData: {}
        }

        // Bind functions
        this.handleDelete = this.handleDelete.bind(this);
        this.handleFormCancel = this.handleFormCancel.bind(this);
        this.toggleForm = this.toggleForm.bind(this);
        this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
    }

    // Toggles the edit form modal
    toggleForm(row) {
        this.setState({
            tableRowData: row,
            formVisible: !this.state.formVisible
        });
    }

    // Toggles the delete confirmation modal
    toggleDeleteModal(row) {
        this.setState({
            tableRowData: row,
            deleteModal: !this.state.deleteModal
        });
    }

    // Handler for delete button
    handleDelete(id) {
        // Show the spinner
        this.props.toggleSpinner();

        this.toggleDeleteModal(undefined);
        FetchUtilities.fetchDelete(URL + '/' + id, 
            (httpStatus, response) => {
            if (httpStatus === 200)
                this.props.onSubmit('Announcement permanently deleted.', true)
            else
                throw new Error('Transaction failed')
            }, _=> this.props.toggleSpinner()
        )
    }

    // Handler for form button onCancel
    handleFormCancel() {
        this.setState({
            tableRowData: this.emptyForm,
            formVisible: false
        });
    }

    componentDidMount() {
        this.setState({ showSpinner: false });
    }

    render() {
        const record = this.props.data;
        const buttons = [
            { 'icon': 'pencil', 'title': 'Edit', 'callback': () => this.toggleForm(record) },
            { 'icon': 'trash', 'title': 'Delete', 'callback': () => this.toggleDeleteModal(record) }
        ];

        const cells = this.props.columns.map((column) => {
            const key = 'column-' + column.key;
            if (column.key === 'actions') {
                return <GridActionCell key={key} buttons={buttons} />
            } else {
                return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
            }
        });

        return (
            <tr>
                {cells}
                <td>
                    {
                        /* Modal wrapping AnnouncementForm component */
                        this.state.formVisible ? (
                            <Modal
                                isOpen={this.state.formVisible}
                                toggle={this.toggleForm}
                                fade={true}
                                backdrop={true}
                                size="lg">
                                <ModalHeader toggle={this.toggleForm}>Update Announcement</ModalHeader>
                                <ModalBody>
                                    <AnnouncementForm
                                        data={this.state.tableRowData}
                                        onCancel={this.handleFormCancel}
                                        onSubmit={this.props.onSubmit}
                                        toggleSpinner={this.props.toggleSpinner} />
                                </ModalBody>
                            </Modal>
                        ) : undefined
                    }
                    {
                        /* Modal for confirming deletion */
                        this.state.deleteModal ? (
                            <ConfirmDeleteModal
                                show={this.state.deleteModal}
                                message={'You are about to delete the announcement "' + this.state.tableRowData.teaser + '". Deleted announcements cannot be recovered. Would you like to proceed?'}
                                handleClose={() => this.toggleDeleteModal(undefined)}
                                handleConfirmation={() => this.handleDelete(this.state.tableRowData.id)}
                            />
                        ) : undefined
                    }
                </td>
            </tr>
        );
    }
}

export default withLayout(AnnouncementMgrPage);
