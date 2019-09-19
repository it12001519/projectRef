import React from 'react';
import ReactiveTable, {ReactiveTableStore,} from 'reactive-tables';
import FetchUtilities from 'js/universal/FetchUtilities';
import {GridActionCell, GridTextCell} from 'js/universal/GridCells';
import Editrevision from "js/app/views/sample/Editrevision";
import {Modal, ModalBody, ModalHeader} from 'reactstrap';
import PcnRevisionsList from 'js/app/views/home/tabs/PcnRevisionsList'

const URL_BASE = '/api/v1/pcn/get/';

const COL_ACTIONS = 'actionColumn';

const ADMIN_ROLES = ['System Admin', 'ChangeLink Admin', 'PCN Coordinator'];

class NotificationHistory extends React.Component {
    state = {
        columns: []
    };

    constructor(props) {
        super(props);

        this.state = {
            formVisible: false,
            handleDelete: false,
            alertVisible: false,
            formVisible2: false,
            alertColor: '',
            alertText: '',
            tableRowData: {},
            columns: [],
            data: [],
            canUpdate: props.hasRole(ADMIN_ROLES)
        };

        // Bind functions
        this.handleButton = this.handleButton.bind(this);
        this.handleFormCancel = this.handleFormCancel.bind(this);
        this.toggleForm = this.toggleForm.bind(this);
        this.toggleForm2 = this.toggleForm2.bind(this);
    }

    componentWillMount() {
        let FETCH_URL = `${URL_BASE}/${this.props.pcnNumber}/revisions`; // API Live Data
        // let FETCH_URL = '/json/pcn/revisions.json'; // Mock data

        this.setState({
            //canUpdate: props.hasRole(ADMIN_ROLES),
            fetchUrl: FETCH_URL,
            formVisible: false,
            handleDelete: false,
            alertVisible: false,
            alertVisible2: false,
            alertColor: '',
            alertText: '',
            tableRowData: {},
            data: [],
            columns: [
                {
                    key: 'actionColumn',
                    label: '',
                    sortable: false,
                },
                {
                    key: 'id',
                    label: 'ID',
                    sortable: true,
                    filterable: true
                }, {
                    key: 'daysToExpir',
                    label: 'Revision',
                    sortable: true,
                    filterable: true
                }, {
                    key: 'sampleType',
                    label: 'Revision Type',
                    sortable: true,
                    filterable: true
                }, {
                    key: 'dateNotif',
                    label: 'Date Notification',
                    sortable: true,
                    filterable: true
                }, {
                    key: 'comments',
                    label: 'Comments',
                    sortable: true,
                    filterable: true
                }, {
                    key: 'dateExpir',
                    label: 'Days To Expire',
                    sortable: true,
                    filterable: true
                }, {
                    key: 'dateExpiration',
                    label: 'Expiration Date',
                    sortable: true,
                    filterable: true
                }, {
                    key: 'lastDayOrder',
                    label: 'Last Day To Order',
                    sortable: true,
                    filterable: true
                }, {
                    key: 'lastDayShip',
                    label: 'Last Day Ship',
                    sortable: true,
                    filterable: true
                }, {
                    key: 'fileName',
                    label: 'File Name',
                    sortable: true,
                    filterable: true
                }]
        });


    }

    toggleForm(row) {
        this.setState({
            tableRowData: row,
            formVisible: !this.state.formVisible
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
            this.setState({
                canUpdate: nextProps.hasRole(ADMIN_ROLES)
            })
    }

    toggleForm2(row) {
        this.setState({
            tableRowData: row,
            formVisible2: !this.state.formVisible2
        });
    }

    handleButton(row) {
        let chg = this.props.changeNumber;

        if (chg === 'undefined' || chg == null) {
            this.setState({
                tableRowData: row.data,
                formVisible3: true,
                change: this.props.changeNumber

            });

        } else {
            this.setState({
                tableRowData: row.data,
                formVisible: true,
                change: this.props.changeNumber

            });

        }
    }

// Handler for form button onCancel
    handleFormCancel() {
        this.setState({
            formVisible: false,
            formVisible2: false,
            formVisible3: false,
            handleDelete: false

        });
    }

    handleDelete(id) {
        // Show the spinner
        this.toggleSpinner();

        this.toggleDeleteModal(undefined);
        fetch(URL + '/' + id,
            {
                method: 'DELETE',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                }),
                credentials: 'include',
            })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(() => {
                this.handleFormSubmit('Announcement permanently deleted.', true);
            })
            .catch((error) => {
                this.handleFormSubmit(error, false);
            });
    }


    render() {
        let columns = JSON.parse(JSON.stringify(this.state.columns)); // Deep copy the old array

        return (
            <div className={this.props.className}>
                <ReactiveTableStore server credentials={'include'} tableId="notification_history">
                    <ReactiveTable
                        ref={() => {
                        }}
                        server striped columnFilters advancedColumns
                        fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                        fetchErrorHandler={FetchUtilities.handleError}
                        url={this.state.fetchUrl} credentials={'include'}
                        columns={columns}
                        row={RevisionGridRow}
                        canUpdate={this.state.canUpdate}
                    />
                </ReactiveTableStore>

                <Modal
                    isOpen={this.state.formVisible}
                    toggle={this.toggleForm}
                    data={this.state.tableRowData}
                    fade={true}
                    size="lg">
                    <ModalHeader toggle={this.toggleForm}>Edit Revision</ModalHeader>
                    <ModalBody>
                        <Editrevision
                            onCancel={this.handleFormCancel}
                            onDelete={this.handleDelete}
                        />
                    </ModalBody>
                </Modal>
            </div>
        )
    }

}

class RevisionGridRow extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            formVisible: false,
            formVisible2: false,
            handleDelete: false,
            deleteModal: false,
            showSpinner: true,
            tableRowData: {},
            canUpdate: this.props.table.props.canUpdate

        };
        this.handleFormCancel = this.handleFormCancel.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.toggleForm = this.toggleForm.bind(this);
        this.toggleForm2 = this.toggleForm2.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
            this.setState({
                canUpdate: nextProps.hasRole(ADMIN_ROLES)
            })
    }

    toggleForm2(row) {
        this.setState({
            tableRowData: row,
            formVisible2: !this.state.formVisible2
            // formVisible2: !this.state.formVisible2

        });
    }

    handleFormSubmit(message, isSuccess) {
        if (isSuccess) {
            this.setState({
                notify: 'success',
                notifyText: 'Success: ' + message,
                formVisible: false // close form
            });

            // HACK: Refresh the page. Once available, only refresh ReactiveTables.
            window.location.reload(true);
        } else {
            this.setState({
                notify: 'error',
                notifyText: message,
                formVisible: false // close form
            });
        }

        // Hide the spinner
        this.toggleSpinner();
    }

    toggleForm(row) {
        this.setState({
            tableRowData: row,
            formVisible: !this.state.formVisible
            // formVisible2: !this.state.formVisible2
        });
    }

    handleFormCancel() {
        this.setState({
            tableRowData: this.emptyForm,
            formVisible: false,
            formVisible2: false
        });
    }

    render() {
        const record = this.props.data
        const cells = this.props.columns.map((column) => {
            const key = 'column-' + column.key;
            if (column.key === COL_ACTIONS) {
                let buttons = '';

                if (!this.state.canUpdate) {

                    buttons = [
                        {'icon': 'eye', 'title': 'Edit', 'callback': () => this.toggleForm2(record)}
                    ];

                } else {

                    buttons = [
                        {'icon': 'pencil', 'title': 'Edit', 'callback': () => this.toggleForm(record)},
                        {'icon': 'eye', 'title': 'Edit', 'callback': () => this.toggleForm2(record)}
                    ];

                }

                return <GridActionCell key={key} buttons={buttons}/>
            } else {
                return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
            }
        });

        return <tr>{cells}
            <Modal
                isOpen={this.state.formVisible}
                toggle={this.toggleForm}
                fade={true}>
                <ModalHeader toggle={this.toggleForm}>Edit Revision</ModalHeader>
                <ModalBody>

                    <Editrevision
                        data={this.state.tableRowData}
                        onCancel={this.handleFormCancel}
                        onDelete={this.handleDelete}/>
                </ModalBody>
            </Modal>
            <Modal
                isOpen={this.state.formVisible2}
                toggle={this.toggleForm2}
                fade={true}
                size="lg">
                <ModalHeader toggle={this.toggleForm2}>Devices List</ModalHeader>
                <ModalBody>
                    <PcnRevisionsList
                        data={this.state.tableRowData}
                        id={this.props.data.id}
                        onCancel={this.handleFormCancel}
                        onSubmit={this.handleFormUpdateSubmit}
                        onDelete={this.handleDelete}/>
                </ModalBody>
            </Modal>
        </tr>
    }
}

export default NotificationHistory
