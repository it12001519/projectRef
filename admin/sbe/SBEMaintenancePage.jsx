import React, { Component, } from 'react';
import { Button } from 'reactstrap';
import withLayout from 'js/app/models/withLayout';
import FetchUtilities from 'js/universal/FetchUtilities';

import ReactiveTable, {ReactiveTableStore,} from 'reactive-tables';
import { GridBadgeCell } from 'js/universal/GridCells';

import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb';
import { ComponentModal } from 'js/universal/Modals';
import SBECCBForm from './SBECCBForm';
import { InfoModal, } from 'js/universal/Modals';
import { FloatNotifySuccess, } from 'js/app/models/FloatNotification';
import FontAwesome from 'react-fontawesome';

const URL = '/api/v1/admin/sbe-list/';
const COLUMNS = [
    { key: 'row-select', label: '' },
    { key: 'sbe', label: 'SBE Name' },
    { key: 'sbe1', label: 'SBE-1' },
    { key: 'sbe2', label: 'SBE-2' },
    { key: 'status', label: 'Status' },
    { key: 'ccbName', label: 'CCBName' }
];
const colorMapping = {
    'MAPPED': 'success',
    'NEW': 'warning'
}

const ADMIN_ROLES = ['System Admin','ChangeLink Admin'];

class SBEMaintenancePage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            activeModal: undefined,
            tableId: ~~(Math.random() * 9000),
            formVisible: false,
            canUpdate: props.hasRole(ADMIN_ROLES)
        }
        this.toggle = this.toggle.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.refreshTable = this.refreshTable.bind(this);
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
            tableId: ~~(Math.random() * 9000)
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

            // HACK: Refresh the page. Once available, only refresh ReactiveTables.
            // window.location.reload(true);
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
        let columns = JSON.parse(JSON.stringify(COLUMNS)); // Deep copy the old array
        // Remove the actions columns if uneditable
        if (!this.state.canUpdate) {
            delete columns[0]
        }

        let SbeMatrixRow = (props) => {
            return <SBEMatrixRow {...props} refreshTable={() => { this.refreshTable() }} />
        }

        let customBar = (
            <div className="p-2 clearfix">
                {
                    this.state.canUpdate
                        ? <div className="float-left">
                            <Button className="mr-1 mb-1" size="sm" color="primary" onClick={() => this.toggle()}><FontAwesome name="plus" /> Add CCB-SBE Mapping</Button>
                        </div>
                        : undefined
                }
            </div>
        );

        return (
            <div className={this.props.className}>

                <ChangeLinkBreadcrumb crumbs={[
                    { text: 'Home', to: "/" },
                    { text: 'Admin', active: true },
                    { text: 'SBE Maintenance', active: true }
                ]} />
                <ReactiveTableStore
                    credentials={'include'}
                    server
                    tableId="sbe_maintenance_page"
                >
                <ReactiveTable server
                    
                    url={URL}
                    key={"table" + this.state.tableId}
                    credentials={'include'}
                    fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                    fetchErrorHandler={FetchUtilities.handleError}
                    columns={columns}
                    row={SbeMatrixRow}
                    customTopBar={customBar}
                    mirrorCustomTopBar
                    striped columnFilters advancedColumns />
                </ReactiveTableStore>

                {
                    this.state.canUpdate
                        ? <ComponentModal show={this.state.formVisible}
                            title={'Add CCB Mapping'}>
                            <SBECCBForm onSubmit={this.handleFormSubmit} toggle={this.toggle} />
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
        );
    }
}

class SBEMatrixRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formVisible: false,
            tableRowData: {}
        }
        this.toggle = this.toggle.bind(this);
        this.handleModal = this.handleModal.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
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
            // window.location.reload(true);
            this.props.refreshTable();
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

    toggleSpinner() {
        this.setState({ showSpinner: !this.state.showSpinner });
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

    toggleAlert() {
        this.setState({
            notify: undefined
        });
    }

    toggle() {
        this.setState({
            formVisible: !this.state.formVisible,
        });
    }

    handleSubmit() {
        this.setState({
            formVisible: !this.state.formVisible,
        });
    }

    render() {
        const record = this.props.data
        const cells = this.props.columns.map((column, i) => {
            const colKey = 'column-' + column.key + '-' + record['ccbId'] + record['sbe'] + record['sbe1'] + record['sbe2'];
            if (column.key === 'row-select') {
                let buttonLabel = record['status'] === 'NEW' ? 'Map to CCB' : record['ccbName'];
                return <td key={colKey}>
                    <ComponentModal show={this.state.formVisible}
                        title={'Map SBE to CCB'}>
                        <SBECCBForm record={record} onSubmit={this.handleFormSubmit} toggle={this.toggle} />
                    </ComponentModal>
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
                    <SBEIconCell record={record} toggle={this.toggle} buttonLabel={buttonLabel} />
                </td>
            } else if (column.key === 'row-select' && record['status'] === 'MAPPED') {
                return <td key={colKey}>
                    <div style={{ textAlign: 'center' }}>Business</div>
                </td>
            } else if (column.key === 'status') {
                return <GridBadgeCell key={colKey} data={record[column.key]} colorMapping={colorMapping} />
            } else {
                return <td key={colKey}><SBEDefaultCell record={record} column={column} /></td>
            }
        })

        let rowStyle = { display: this.state.display }

        return (
            <tr style={rowStyle}>{cells}</tr>
        )
    }
}

class SBEIconCell extends React.Component {
    render() {
        return (
            <div style={{ width: "100%", textAlign: "center" }}>
                <Button size="sm" color="dark" outline className="mr-2 mb-1" title="Map to CCB"
                    ref={'chkbox_' + this.props.record.id} onClick={() => this.props.toggle()}>{this.props.buttonLabel}</Button>
            </div>
        );
    }
}

class SBEDefaultCell extends React.Component {
    render() {
        return <span>{this.props.record[this.props.column.key]}</span>
    }
}

export default withLayout(SBEMaintenancePage);
