import React, { Component, } from 'react';
import { Button } from 'reactstrap';
import ReactiveTable, { ReactiveTableStore, } from 'reactive-tables';

import withLayout from 'js/app/models/withLayout';
import SecurityForm from 'js/app/views/admin/security/SecurityForm';

import 'whatwg-fetch';
import FontAwesome from 'react-fontawesome';
import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb';
import FetchUtilities from 'js/universal/FetchUtilities';
import Spinner from 'js/universal/spinner';
import { ConfirmDeleteModal, InfoModal, ComponentModal } from 'js/universal/Modals';
import { FloatNotifySuccess, } from 'js/app/models/FloatNotification';

const PAGEABLE_URL = "/usersvc/pageable/search/";
const AUTHORITY_URL = "/usersvc/authority";

const COLUMNS = [
    {
        key: 'row-select',
    },
    {
        key: 'userName',
        label: 'Name'
    },
    {
        key: 'role',
        label: 'Role'
    }
];

const ADMIN_ROLES = ['System Admin','ChangeLink Admin'];

class SecurityPage extends Component {

    constructor(props) {
        super(props);
        this.tableRef = React.createRef();
        this.state = {
            formVisible: false,
            alertVisible: false,
            alertColor: '',
            alertText: '',
            tableRowData: {},
            showSpinner: false,
            tableKey: 'tbl-security',
            floatKey: 'float',
            canUpdate: props.hasRole(ADMIN_ROLES),
            deletedItems: []
        }

        this.handleNewUserButtonClick = this.handleNewUserButtonClick.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleAlertClick = this.handleAlertClick.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
        this.toggleAlert = this.toggleAlert.bind(this);
        this.handleSecurityFormCancel = this.handleSecurityFormCancel.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        //  this.handleDeleteUserButtonClick = this.handleDeleteUserButtonClick.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
            this.setState({
                canUpdate: nextProps.hasRole(ADMIN_ROLES)
            })
    }

    handleNewUserButtonClick() {
        this.setState({
            formVisible: true
        });
    }

    handleSecurityFormCancel() {
        this.setState({
            formVisible: false
        });
    }


    toggleSpinner() {
        this.setState({ showSpinner: !this.state.showSpinner });
    }

    handleAlertClick() {
        this.setState({
            alertVisible: false,
            alertText: ''
        });
    }

    // Handler for form button onSubmit
    handleFormSubmit(message, isSuccess) {
        const { fetchUserAccess } = this.props; 
        var m = new Date().getMilliseconds();
        if (isSuccess) {
            this.setState({
                tableKey: 'tbl-security-' + m,
                floatKey: 'float-' + m,
                notify: 'success',
                notifyText: 'Success: ' + message,
                formVisible: false // close form
            });
            // Get latest roles
            if (typeof fetchUserAccess === 'function') {
                fetchUserAccess();
            }
            this.table.refresh();
            
        } else {
            this.setState({
                tableKey: 'tbl-security-' + m,
                floatKey: 'float-' + m,
                notify: 'error',
                notifyText: message,
                formVisible: false // close form
            });
        }
    }

    handleCheck(role) {
        var existingRoles = this.state.deletedItems;
        var existingRole;
        for (let i in existingRoles) {
            let ele = existingRoles[i]
            if (ele.userid && ele.role 
                && ele.userid === role.userid 
                && ele.role === role.role 
                && !existingRole) {
                existingRole = ele;
            }
        }

        if (existingRole) {
            // remove the data
            // this.state.deletedItems.map((item) => { });
        } else {
            // add the data
            var data = this.state.deletedItems;
            data.push(role);
            this.setState({
                deletedItems: data
            });
        }

        return true;
    }

    toggleAlert() {
        this.setState({
            notify: undefined
        });
    }

    render() {
        let columns = JSON.parse(JSON.stringify(COLUMNS)); // Deep copy the old array
        // Remove the actions columns if uneditable
        if (!this.state.canUpdate) {
            delete columns[0]
        }

        let SecPageRow = (props) => {
            return <SecurityPageRow {...props} handleCheck={this.handleCheck} handleFormSubmit={this.handleFormSubmit}
                toggleSpinner={this.toggleSpinner} />
        }

        return (
            <div>
                <Spinner showSpinner={this.state.showSpinner} />
                
                <ChangeLinkBreadcrumb crumbs={[
                    { text: 'Home', to: "/" },
                    { text: 'Admin', active: false },
                    { text: 'User Role Management', active: true }
                ]} />

                {
                    this.state.canUpdate
                        ? <Button color="primary" id="btn-new-user" onClick={this.handleNewUserButtonClick}
                            className="mr-1 mb-1">
                            <FontAwesome name="plus" /> Add User Authority
                        </Button>
                        : undefined
                }

                {/* <Button color="danger" id="btn-remove-user"
                    className="mr-1 mb-1">
                    <FontAwesome name="trash" /> Delete User Authority
                </Button> */}
                {/* <ReactiveTableStore credentials={'include'} server tableId={`adm-cfg-userMgmt`}> */}
                <ReactiveTable server
                    url={PAGEABLE_URL}
                    credentials={'include'}
                    ref={(table) => this.table = table}
                    fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                    fetchErrorHandler={FetchUtilities.handleError}
                    columns={columns}
                    row={SecPageRow}
                    key={this.state.tableKey}
                    striped columnFilters advancedColumns />
                {/* </ReactiveTableStore> */}

                <ComponentModal show={this.state.formVisible}
                    title={'Add User'}>
                    <SecurityForm
                        data={this.state.tableRowData}
                        onCancel={this.handleSecurityFormCancel}
                        onSubmit={this.handleFormSubmit}
                        toggleSpinner={this.toggleSpinner} />
                </ComponentModal>

                {
                    /* Notify for success/failure/error */
                    this.state.notify === 'success' ? (
                        <FloatNotifySuccess key={this.state.floatKey} message={this.state.notifyText} />
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

class SecurityPageRow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formVisible: false,
            tableRowData: {}
        }
        this.handleCheck = this.handleCheck.bind(this);
        this.toggle = this.toggle.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
    }

    handleCheck(record) {
        this.props.handleCheck(record);
    }

    handleFormSubmit(message, isSuccess) {
        this.props.handleFormSubmit(message, isSuccess)
    }

    toggleSpinner() {
        this.props.toggleSpinner();
    }

    toggle() {
        this.setState({
            formVisible: !this.state.formVisible,
        });
    }

    // Handles errors from the server
    handleError(error) {
        console.log(error);
        if (typeof this.props.handleFormSubmit === 'function') {
            this.props.handleFormSubmit(error.message, false);
        } else {
            alert('Error: ' + error.message);
        }
    }

    postDelete(record) {

        // Set the form data to be submitted
        this.toggleSpinner();
        fetch(AUTHORITY_URL + "/?userId=" + record.userid + "&authority=" + record.role,
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
            .then((response) => {
                this.toggleSpinner();
            })
            .then(() => {
                if (typeof this.props.handleFormSubmit === 'function') {
                    this.handleFormSubmit('User deleted.', true);
                }
            })
            .catch((error) => {
                console.log(error);
                this.toggleSpinner();
                this.handleError(error);
            });

    }

    render() {
        const record = this.props.data;
        const cells = this.props.columns.map((column, i) => {
            const colKey = 'column-' + column.key + '-' + record['ccbId'] + record['sbe'] + record['sbe1'] + record['sbe2'];
            if (column.key === 'row-select') {
                return <td key={colKey}> <div style={{ textAlign: 'center' }}>
                    {/*TODO: enable checkboxes in phase 2*/}
                    {/* <Input type="checkbox" onClick={()=>{this.handleCheck(record)}}></Input> {" "} */}
                    <Button size="sm" color="dark" outline className="mr-2 mb-1" title="Delete" onClick={() => { this.toggle() }}><FontAwesome name="trash" /></Button>
                </div>
                </td>
            } else {
                return <td key={colKey}>{record[column.key]}</td>
            }
        });
        let deleteMessage = "Are you sure you want to delete " + record['commonName'] + " (" + record['userid'] + ") | " + record['role'] + "?";

        return (
            <tr>{cells}
                <td style={{ display: 'none' }}>
                    <ConfirmDeleteModal
                        show={this.state.formVisible}
                        message={deleteMessage}
                        handleClose={this.toggle}
                        handleConfirmation={() => { this.postDelete(record) }}
                    />
                </td>
            </tr>
        )
    }
}

export default withLayout(SecurityPage);