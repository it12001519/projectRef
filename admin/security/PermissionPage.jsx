import React, { Component, } from 'react';
import withLayout from 'js/app/models/withLayout';
import FontAwesome from 'react-fontawesome';
import { Table } from 'reactstrap';

import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb';
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap';
import PermissionForm from 'js/pages/admin/security/PermissionForm';

//const roles = "/json/roles.json";
const ROLE_DATA = [
    {
        name: 'Permission',
        grid: [
            {
                "role": "System Admin",
            },
            {
                "role": "ChangeLink Admin",
            },
            {
                "role": "CCB Coordinator",
            },
            {
                "role": "Change Coordinator",
            },
            {
                "role": "Sample Admin",
            },
            {
                "role": "Sample Coordinator",
            },
            {
                "role": "AVL Coordinator",
            },
            {
                "role": "ChangeLink User",
            }
        ]
    }
];

const permissions = [
    "Assigns roles to people – add, chg, del",
    "Manages tasks - add, chg, del",
    "Issues PCN",
    "Manages Customer responses",
    "Change state override",
    "Configuration tables – add, chg, del entries",
    "Customer Exclusion List",
    "Customer contacts",
    "Sample requesting window",
    "Approval Matrix – check off approved",
    "Define roles in CCBs",
    "Assign people to CCB roles",
    "Set up sample coordinators/ SBE's",
    "AVL list – READ",
    "AVL list – UPDATE",
    "Change diary entries",
    "Create a change",
    "Edit a change if change owner",
    "Edit others’ changes"
];

const ADMIN_ROLES = ['System Admin','ChangeLink Admin'];

class PermissionPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formVisible: false,
            alertVisible: false,
            alertColor: '',
            alertText: '',
            tableRowData: {},
            data: ROLE_DATA,
            perm_data: permissions,
            canUpdate: props.hasRole(ADMIN_ROLES)
        }

        this.handleNewRoleButtonClick = this.handleNewRoleButtonClick.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleTableRowClick = this.handleTableRowClick.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleAlertClick = this.handleAlertClick.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
            this.setState({
                canUpdate: nextProps.hasRole(ADMIN_ROLES)
            })
    }

    handleNewRoleButtonClick() {
        this.setState({
            formVisible: true
        });
    }

    handleCancel() {
        this.setState({
            formVisible: false
        });
    }

    //Might remove this function - no longer needed?
    handleTableRowClick(row) {
        this.setState({
            tableRowData: row.data,
            formVisible: true
        });
    }

    handleFormSubmit(row, isSuccess) {
        if (isSuccess) {
            this.setState({
                alertColor: 'success',
                alertVisible: true,
                alertText: 'Success: ' + JSON.stringify(row),
                formVisible: false
            });
        } else {
            this.setState({
                alertColor: 'danger',
                alertVisible: true,
                alertText: 'Error: ' + JSON.stringify(row),
                formVisible: false
            })
        }
    }

    handleAlertClick() {
        this.setState({
            alertVisible: false,
            alertText: ''
        });
    }

    render() {
        const perm_data = permissions.map((permission) =>
            <tr>
                <td> {permission} </td>
                {/* TO DO: Dynamic checkbox */}
                <td align="center"> <input type="checkbox" /></td>
                <td align="center"> <input type="checkbox" /></td>
                <td align="center"> <input type="checkbox" /></td>
                <td align="center"> <input type="checkbox" /></td>
                <td align="center"> <input type="checkbox" /></td>
                <td align="center"> <input type="checkbox" /></td>
                <td align="center"> <input type="checkbox" /></td>
                <td align="center"> <input type="checkbox" /></td>
            </tr>);
        return (
            <div className={this.props.className}>
                {
                    this.state.data.map((roles) => {
                        return (
                            <div>
                                <ChangeLinkBreadcrumb crumbs={[
                                    { text: 'Home', to: "/" },
                                    { text: 'Admin', active: true },
                                    { text: 'Permissions', active: true }
                                ]} />

                                {
                                    this.state.canUpdate
                                        ? <Button color="primary" id="btn-new-user" onClick={this.handleNewRoleButtonClick}
                                            className="mb-1 mr-1">
                                            <FontAwesome name="plus" /> Add Role
                                          </Button>
                                        : undefined
                                }

                                <Table bordered>
                                    <thead>
                                        <th> Activity or Role</th>
                                        {
                                            roles.grid.map((row) => {
                                                return (
                                                    <th> {row.role} </th>
                                                );
                                            })
                                        }
                                    </thead>
                                    <tbody>
                                        {perm_data}
                                    </tbody>
                                </Table>

                                <Button color="primary" className="float-right"> Save Changes </Button>

                                <Modal
                                    isOpen={this.state.formVisible}
                                    toggle={this.toggleForm}
                                    fade={true}
                                    backdrop={true}>

                                    <ModalHeader toggle={this.toggleForm}> Role and Permissions </ModalHeader>
                                    <ModalBody>
                                        <PermissionForm
                                            data={this.state.tableRowData}
                                            onCancel={this.handleCancel}
                                            onSubmit={this.handleSubmit} />
                                    </ModalBody>
                                </Modal>
                            </div>
                        );
                    })
                }
            </div>
        )
    }
}

export default withLayout(PermissionPage);