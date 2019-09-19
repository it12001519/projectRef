import React, { Component, } from 'react';
import withLayout from 'js/app/models/withLayout';
import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import ReactiveTable, { ReactiveTableStore, } from 'reactive-tables';
import FetchUtilities from 'js/universal/FetchUtilities';
import { Link, } from "react-router-dom";
import { GridTextCell, GridActionCell } from 'js/universal/GridCells';
import SWRAssociations from 'js/app/views/swr/SWRAssociations';
import AttachmentField from 'js/app/models/AttachmentField';
import { AttachmentDisplay, } from 'js/app/models/attachment';
import { ComponentModal, } from 'js/universal/Modals';
import "css/approval-matrix-button-bar.css";
import { InfoModal, ConfirmDeleteModal } from 'js/universal/Modals';

const URL = "/api/v1/swr/fetchAll";
const TABLE_COLUMNS = [
    { key: 'actions', label: ' ' },
    { key: 'id', label: 'ID' },
    { key: 'swrNumber', label: 'SWR Number', sortable: true },
    { key: 'swrStatus', label: 'Status', sortable: true },
    { key: 'swrType', label: 'Type', sortable: true },
    { key: 'swrTitle', label: 'Title', sortable: true },
    { key: 'swrDevice', label: 'Device', sortable: true },
    { key: 'sbe', label: 'SBE', sortable: true },
    { key: 'sbe1', label: 'SBE1', sortable: true },
    { key: 'sbe2', label: 'SBE2', sortable: true },
    { key: 'requestor', label: 'Requestor', sortable: true },
    { key: 'atSite', label: 'A/T Site', sortable: true },
    { key: 'qtyBuilt', label: 'QTY Build', sortable: true },
    { key: 'IO', label: 'IO #', sortable: true },
    { key: 'PO', label: 'PO # ', sortable: true },
    { key: 'lineItem', label: 'Line Item', sortable: true },
    { key: 'genericDevice', label: 'Generic Device', sortable: true },
    { key: 'dieName', label: 'Die Name', sortable: true },
    { key: 'dieLotNumber', label: 'Die Lot Number', sortable: true },
    { key: 'assyLotTraceCode', label: 'Assy Lot Trace Code', sortable: true },
    { key: 'qtyShipped', label: 'Qty Shipped', sortable: true },
    { key: 'atShippedDate', label: 'A/T Shipped Date', sortable: true },
    { key: 'atFinishedDate', label: 'A/T Finished Date', sortable: true },
    { key: 'atAcceptedDate', label: 'A/T Accepted Date', sortable: true },
    { key: 'atStartedDate', label: 'A/T Started Date', sortable: true },
    { key: 'retPackPc', label: 'RetPackPc', sortable: true },
    { key: 'comments', label: 'Comments', sortable: true }
]

const ADMIN_ROLES = ['System Admin', 'ChangeLink Admin', 'Sample Coordinator'];

class SWRList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tableRowData: {},
            canUpdate: props.hasRole(ADMIN_ROLES)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
            this.setState({
                canUpdate: nextProps.hasRole(ADMIN_ROLES)
            })
    }

    render() {
        const { ...other } = this.props;

        // Define the bread crumbs
        const crumbs = [
            { text: 'Home', to: "/" },
            { text: 'SWR', active: true }
        ]

        // Hide the ation column if the user role is not allowed to do anything
        let columns = JSON.parse(JSON.stringify(TABLE_COLUMNS))
        if (!this.state.canUpdate) {
            delete columns[0]
        }

        // Set up the custom row
        let MyGridRow = (props) => {
            return <SWRRow {...props} {...other} />
        }

        // Add an "Add" button, if the user role is allowed
        let customBar = (
            this.state.canUpdate
                ? <div className="p-2">
                    <Link to={{ pathname: '/swr/form/', state: { data: this.state.tableRowData } }}>
                        <Button className="mr-1 mb-1" size="sm" color="primary"><span aria-hidden="true" className="fa fa-plus"></span> Add SWR </Button>
                    </Link>
                </div> : undefined
        )

        return (
            <div>
                <ChangeLinkBreadcrumb crumbs={crumbs} />

                <ReactiveTableStore
                    credentials={'include'}
                    server
                    tableId="swr_table"
                >
                    <ReactiveTable server
                        ref={() => { }}
                        credentials={'include'}
                        fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                        fetchErrorHandler={FetchUtilities.handleError}
                        striped={true}
                        columnFilters={true}
                        url={URL}
                        row={MyGridRow}
                        customTopBar={customBar}
                        mirrorCustomTopBar
                        columns={columns}
                    />
                </ReactiveTableStore>
            </div>
        )
    }
}

class SWRRow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            key: 'tbl-files',
            formVisible: false,
            tableRowData: {},
            assocCount: '',
            attachCount: ''
        }
        this.toggle = this.toggle.bind(this);
        this.toggleSWRUpload = this.toggleSWRUpload.bind(this);
        this.handleAttachSubmit = this.handleAttachSubmit.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.toggleCannotDeleteModal = this.toggleCannotDeleteModal.bind(this);
        this.toggleCheckDelete = this.toggleCheckDelete.bind(this);
    }

    // Handler for form button onSubmit for attachment
    handleAttachSubmit(message, isSuccess) {
        if (isSuccess) {
            var m = new Date().getMilliseconds();
            this.setState({
                key: 'tbl-files-' + m, // Refresh the table
                notify: 'success',
                notifyText: 'Success: ' + message,
                formVisible: false // close form
            });

        } else {
            this.setState({
                notify: 'error',
                notifyText: message,
                formVisible: false // close form
            });
        }
    }

    toggle() {
        this.setState({
            formVisible: !this.state.formVisible,
        });
    }

    toggleSWRUpload(record) {
        this.setState({
            tableRowData: record,
            uploadModal: !this.state.uploadModal
        })
    }

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
        });
    }

    toggleCheckAssoc(row) {
        fetch("/api/v1/swr/associations/" + row.id, {
            credentials: 'include',
            headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            })
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then((json) => this.setState({ assocCount: json }, () => this.toggleCheckAttach(row)))
            .catch(error => FetchUtilities.handleError(error))

    }

    toggleCheckAttach(row) {
        fetch("/api/v1/swr/fetch/attachments/" + row.swrNumber, {
            credentials: 'include',
            headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            })
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then((json) => this.setState({ attachCount: json }, () => this.toggleCheckDelete(row)))
            .catch(error => FetchUtilities.handleError(error))
    }

    toggleCheckDelete(row) {
        if (this.state.assocCount === 0 && this.state.attachCount === 0) {
            this.toggleDeleteModal(row);
        } else {
            this.toggleCannotDeleteModal(row);
        }
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

        // Hide the spinner
        this.toggleSpinner();
    }

    handleDelete(id) {
        this.toggleDeleteModal();
        fetch("/api/v1/swr/delete/" + id, {
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
                this.handleFormSubmit('SWR has been deleted.', true);
            })
            .catch((error) => {
                this.handleFormSubmit(error, false);
            })
    }

    render() {
        const record = this.props.data
        const buttons = [
            { 'icon': 'pencil', 'title': 'Edit', 'url': '/swr/form/' + record['swrNumber'] },
            { 'icon': 'link', 'title': 'Associations', 'callback': () => this.toggle(record) },
            { 'icon': 'paperclip', 'title': 'Upload', 'callback': () => this.toggleSWRUpload(record) },
            { 'icon': 'trash', 'title': 'Delete', 'callback': () => this.toggleCheckAssoc(record) }
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
            <ComponentModal show={this.state.formVisible}
                title={'SWR ' + this.props.data.swrNumber + ' Associations'} size="lg">
                <SWRAssociations record={record} toggle={this.toggle} />
            </ComponentModal>
            {
                /* Modal for attachment */
                this.state.uploadModal ? (
                    <Modal
                        isOpen={this.state.uploadModal}
                        toggle={this.toggleSWRUpload}
                        fade={true}
                        backdrop={true}
                        size="lg">
                        <ModalHeader toggle={this.toggleSWRUpload}> Upload Files: {this.state.tableRowData.swrNumber} </ModalHeader>
                        <ModalBody>
                            <AttachmentField
                                id={this.state.tableRowData.swrNumber}
                                loc='SWR'
                                context={this.state.tableRowData.swrNumber}
                                onCancel={this.handleFormCancel}
                                onSubmit={this.handleAttachSubmit}
                            />
                            <AttachmentDisplay
                                id={this.state.tableRowData.swrNumber}
                                loc='SWR'
                                context={this.state.tableRowData.swrNumber}
                                key={this.state.key}
                                hideEdit={true}
                            />
                        </ModalBody>
                    </Modal>
                ) : undefined
            }
            {
                /* Modal for confirming deletion */
                this.state.deleteModal ? (
                    <ConfirmDeleteModal
                        show={this.state.deleteModal}
                        message={"You are about to delete SWR # " + this.state.tableRowData.swrNumber + ". Deleted SWRs cannot be recovered. Would you like to proceed?"}
                        handleClose={() => this.toggleDeleteModal(undefined)}
                        handleConfirmation={() => this.handleDelete(this.state.tableRowData.id)}
                    />
                ) : undefined
            }
            {
                /* Modal for not allowing deletion */
                this.state.cannotDeleteModal ? (
                    <InfoModal
                        show={this.state.cannotDeleteModal}
                        message={"You are not allowed to delete SWR # " + this.state.tableRowData.swrNumber + " since there are still associations and attachments related to the SWR."}
                        handleClose={() => this.toggleCannotDeleteModal(undefined)}
                        color="danger"
                        title="Action denied"
                    />
                ) : undefined
            }
        </tr>
        )
    }

}


export default withLayout(SWRList);