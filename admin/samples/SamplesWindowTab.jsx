import React, { Component, } from 'react';
import { Button } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import FetchUtilities from 'js/universal/FetchUtilities';
import ReactiveTable from 'reactive-tables';
import { ComponentModal } from 'js/universal/Modals';
import { GridTextCell, GridActionCell } from 'js/universal/GridCells';
import SamplesWindowForm from 'js/app/views/admin/samples/SamplesWindowForm';
import { FloatNotifySuccess, } from 'js/app/models/FloatNotification';
import { ConfirmDeleteModal, InfoModal, } from 'js/universal/Modals';
import { showOverlaySpinner, hideOverlaySpinner } from 'js/universal/spinner';

const URL = "/api/v1/samples/window/";
const TABLE_COLUMNS = [
    { key: 'actions' },
    { key: 'customerNumber', label: 'Customer Number - Name' },
    { key: 'industrySector', label: 'Industry Sector' },
    { key: 'days', label: 'Days' }
]

const ADMIN_ROLES = ['System Admin','ChangeLink Admin','Sample Coordinator','Sample Admin'];

class SamplesWindowTab extends Component {
    constructor(props) {
        super(props);
        this.state = {
            key: 'tbl-samples',
            tableId: ~~(Math.random() * 9000),
            formVisible: false,
            tableRowData: {},
            canUpdate: props.hasRole(ADMIN_ROLES)
        }
        this.toggle = this.toggle.bind(this);
        this.refreshTable = this.refreshTable.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
            this.setState({
                canUpdate: nextProps.hasRole(ADMIN_ROLES)
            })
    }

    toggle() {
        this.setState({
            formVisible: !this.state.formVisible,
        });
    }

    refreshTable() {
        this.setState({
            tableid: ~~(Math.random() * 9000)
        });
    }

    // Handler for form button onSubmit
    handleFormSubmit(message, isSuccess) {
        if (isSuccess) {
            this.setState({
                notify: 'success',
                notifyText: 'Success: ' + message,
                formVisible: false // close form
            });
            this.refreshTable();
        } else {
            this.setState({
                notify: 'error',
                notifyText: 'Error: ' + message,
                formVisible: false // close form
            });
        }
    }


    render() {
        let columns = JSON.parse(JSON.stringify(TABLE_COLUMNS)); // Deep copy the old array
        // Remove the actions columns if uneditable
        if (!this.state.canUpdate) {
            delete columns[0]
        }

        let customTopBar = (
            this.state.canUpdate
                ? <div className="p-2 clearfix">
                    <Button className="mr-1 mb-1" size="sm" color="primary" onClick={() => this.toggle()}>
                        <FontAwesome name="plus" />&nbsp; New Request Window
                    </Button>
                  </div>
                : undefined
        )

        return (
            <div>
                <ReactiveTable server
                    url={URL}
                    key={"table" + this.state.tableId}
                    row={GridRow}
                    customTopBar={customTopBar}
                    credentials={'include'}
                    fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                    fetchErrorHandler={FetchUtilities.handleError}
                    columns={columns}
                    striped columnFilters advancedColumns />

                {
                    this.state.canUpdate
                    ? <ComponentModal show={this.state.formVisible} title={'Add a Request Window'}>
                        <SamplesWindowForm onSubmit={this.handleFormSubmit} toggle={this.toggle} />
                      </ComponentModal>
                    : undefined
                }

                {
                    /* Notify for success/failure/error */
                    this.state.notify === 'success' ? (
                        <FloatNotifySuccess message={this.state.notifyText} />
                    ) : this.state.notify === 'error' ? (
                        <InfoModal icon='exclamation-circle' color='danger'
                            title='Error' message={this.state.notifyText}
                            handleClose={() => this.toggleAlert(undefined)} />
                    ) : undefined
                }
            </div>
        )
    }
}

class GridRow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formVisible: false,
            tableRowData: {}
        }
        this.toggle = this.toggle.bind(this);
        this.handleModal = this.handleModal.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
        this.toggleCannotDeleteModal = this.toggleCannotDeleteModal.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    // Handler for form button onSubmit
    handleFormSubmit(message, isSuccess) {
        if (isSuccess) {
            this.setState({
                notify: 'success',
                notifyText: 'Success: ' + message,
                formVisible: false // close form
            });

            // HACK: Refresh the page. Once available, only refresh ReactiveTables.
            window.location.reload(true);
            //this.props.refreshTable();
        } else {
            this.setState({
                notify: 'error',
                notifyText: 'Error: ' + message,
                formVisible: false // close form
            });
        }
    }

    handleModal() {
        let row = arguments[0];
        if (row) {
            this.setState({
                tableRowData: row.data,
            })
        }
        this.setState({
            formVisible: !this.state.formVisible,
        });
    }

    toggle() {
        this.setState({
            formVisible: !this.state.formVisible,
        });
    }

    // Toggles the delete confirmation modal
    toggleDeleteModal(row) {
        this.setState({
            tableRowData: row,
            deleteModal: !this.state.deleteModal
        });
    }

    toggleCannotDeleteModal(row) {
        this.setState({
            tableRowData: row,
            cannotDeleteModal: !this.state.cannotDeleteModal
        })
    }

    toggleCheckDelete(row) {
        if(row.customerNumber === 'DEFAULT' && row.industrySector === 'DEFAULT') {
            this.toggleCannotDeleteModal(row) 
        } else {
            this.toggleDeleteModal(row)
        }
    }

    handleDelete(id, customerNumber, industrySector) {
        showOverlaySpinner();

        this.toggleDeleteModal(undefined);
        fetch(URL + id + "?customerNumber=" + encodeURIComponent(customerNumber) + "&industrySector=" + industrySector,
            {
                method: 'DELETE',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }),
                credentials: 'include',
            })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(() => {
                hideOverlaySpinner();
                this.handleFormSubmit('Request Window has been deleted.', true);
            })
            .catch((error) => {
                hideOverlaySpinner();
                this.handleFormSubmit(error, false);
            });
    }

    render() {
        const record = this.props.data;
        const buttons = [
            { 'icon': 'pencil', 'title': 'Edit', 'callback': () => this.toggle(record) },
            { 'icon': 'trash', 'title': 'Delete', 'callback': () => this.toggleCheckDelete(record) }
        ];

        const cells = this.props.columns.map((column) => {
            const key = 'column-' + column.key;
            if (column.key === 'actions') {
                return <GridActionCell key={key} buttons={buttons} />
            } else {
                return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
            }
        });

        return (<tr>{cells}
            {
                <ComponentModal show={this.state.formVisible}
                    title={'Edit Request Window'}>
                    <SamplesWindowForm record={record} onSubmit={this.handleFormSubmit} toggle={this.toggle} />
                </ComponentModal>
            }
            {
                /* Modal for confirming deletion */
                this.state.deleteModal ? (
                    <ConfirmDeleteModal
                        show={this.state.deleteModal}
                        message={'You are about to delete request window ID # "' + this.state.tableRowData.id + '". Deleted request windows cannot be recovered. Would you like to proceed?'}
                        handleClose={() => this.toggleDeleteModal(undefined)}
                        handleConfirmation={() => this.handleDelete(this.state.tableRowData.id, this.state.tableRowData.customerNumber, this.state.tableRowData.industrySector)}
                    />
                ) : undefined
            }
            {
                this.state.cannotDeleteModal ? (
                    <InfoModal
                        show={this.state.cannotDeleteModal}
                        message={"You are not allowed to delete the default configuration for request window."}
                        handleClose={() => this.toggleCannotDeleteModal(undefined)}
                        color="danger"
                        title="Action denied"
                    />
                ) : undefined 
            }
        </tr>)
    }

}

export default SamplesWindowTab;