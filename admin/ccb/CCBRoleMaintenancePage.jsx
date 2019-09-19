import React, { Component, } from 'react';
import FontAwesome from 'react-fontawesome';
import ReactiveTable from 'reactive-tables'
import withLayout from 'js/app/models/withLayout';
import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb';
import CCBRoleForm from 'js/pages/admin/ccb/CCBRoleForm';
import CCBRoleUploadForm from 'js/pages/admin/ccb/CCBRoleUploadForm';
import { Button, Input, Col, Form, FormGroup, Label } from 'reactstrap';
import FetchUtilities from 'js/universal/FetchUtilities';
import { ComponentModal } from 'js/universal/Modals';
import { GridTextCell, GridActionCell } from 'js/universal/GridCells';
import CCBUploadForm from './CCBRoleUploadForm';
import { InfoModal, } from 'js/universal/Modals';
import { FloatNotifySuccess, } from 'js/app/models/FloatNotification';
import Spinner from 'js/universal/spinner';

const CATEGORIES = [
    { label: 'Datasheet', value: 'Datasheet' },
    { label: 'Typo Approver', value: 'Typo Approver' }
];

const roleDataURL = '/api/v1/ccb/roles/';
const mccbURL = '/api/v1/ccb/ccb';

const ADMIN_ROLES = ['System Admin','ChangeLink Admin','CCB Coordinator'];

class CCBRoleMaintenancePage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            columns: [
                {
                    key: 'roleId',
                    label: '',
                    sortable: false,
                    searchable: false
                },
                {
                    key: 'roleName',
                    label: 'Role Name',
                    sortable: true
                },
                {
                    key: 'roleDescription',
                    label: 'Description',
                    sortable: true
                },
                {
                    key: 'rolePosition',
                    label: 'Position',
                    sortable: true
                },
                {
                    key: 'roleCategory',
                    label: 'Category',
                    sortable: true
                },
                {
                    key: 'roleIsObsolete',
                    label: 'Obsolete',
                    sortable: true
                },
                {
                    key: 'roleAutoApproval',
                    label: 'Auto Approval Days',
                    sortable: true
                }
            ],
            data: [],
            mccbs: [],
            mccb: undefined,
            tableId: 1,
            activeModal: undefined,
            showSpinner: undefined,
            canUpdate: props.hasRole(ADMIN_ROLES)
        }
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.toggleSpinner();
        fetch(mccbURL, {
            headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }), credentials: 'include'
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then((json) => {
                this.setState({ mccbs: json, mccb: json[0].id });
                this.toggleSpinner();
            })
            .catch(error => FetchUtilities.handleError(error));
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
            this.setState({
                canUpdate: nextProps.hasRole(ADMIN_ROLES)
            })
    }

    toggle(modal) {
        this.setState({
            activeModal: modal
        })
    }

    toggleSpinner() {
        this.setState({ showSpinner: !this.state.showSpinner });
    }

    refreshTable() {
        this.table.refresh();
    }

    handleChange(e) {
        // Prevent legacy form post
        e.preventDefault();
        // Get field name and value from event
        const target = e.target;
        let value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        // Validate
        //  FormValidator.validateForm(e);

        // Set state using function to granularly modify data
        this.setState((previousState) => {
            return previousState.data = { ...previousState.data, [name]: value };
        });

        this.refreshTable();
    }

    handleFormUpload(formData) {

    }

    render() {
        let columns = JSON.parse(JSON.stringify(this.state.columns)); // Deep copy the old array
        // Remove the actions columns if uneditable
        if (!this.state.canUpdate) {
            delete columns[0]
        }

        let CcbRole = (props) => {
            return <CCBRoleMaintenanceRow {...props} ccbId={this.state.mccb} />
        }

        return (
            <div>
                <Spinner showSpinner={this.state.showSpinner} />
                <ChangeLinkBreadcrumb crumbs={[
                    { text: 'Home', to: "/" },
                    { text: 'Administration', to: "/admin", active: true },
                    { text: 'CCB Role Maintenance', active: true }
                ]} />
                <h4> CCB Role Maintenance</h4>

                <Form>
                    {
                        this.state.canUpdate
                            ? <Button color="primary" id="btn-new-ccb" onClick={() => { this.toggle('addModal') }}
                                style={{ marginBottom: '0.5rem', marginRight: '0.5rem' }}>
                                <FontAwesome name="plus" /> Add New CCB Role
                              </Button>
                            : undefined
                    }
                    {
                        this.state.canUpdate
                            ? <Button color="primary" id="btn-up-excel" onClick={() => { this.toggle('uploadExcel') }}
                                style={{ marginBottom: '0.5rem', marginLeft: '0.5rem' }}>
                                <FontAwesome name="upload" /> Upload from Excel
                              </Button>
                            : undefined
                    }

                    <FormGroup row>
                        <Label for="selectCategory" style={{ fontWeight: 'bold' }} sm={1}>Select CCB:{' '}</Label>
                        <Col sm={2}>
                            <Input type="select" name="mccb" id="selectCategory" onChange={this.handleChange}>
                                {this.state.mccbs.map((item, i) => {
                                    return <option key={item.id} value={item.id}>{item.name}</option>
                                })
                                }
                            </Input>
                        </Col>
                    </FormGroup>
                </Form>

                {
                    !!this.state.mccb ? (
                        <div>
                            <ReactiveTable server
                                key={'table-' + this.state.tableId}
                                credentials={'include'}
                                url={roleDataURL + this.state.mccb + '/'}
                                columns={columns}
                                fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                                fetchErrorHandler={FetchUtilities.handleError}
                                row={CcbRole}
                                // ref={(table)=>{this.table=table}}
                                striped columnFilters advancedColumns
                                ccbId={this.state.mccb} />
                        </div>
                    ) : undefined
                }

                {
                    this.state.canUpdate
                        ? <ComponentModal show={this.state.activeModal === 'addModal'}
                            title='Add CCB Role'>
                            <CCBRoleForm data={[]} categories={CATEGORIES} toggleForm={() => this.toggle(null)} refreshTable={() => this.refreshTable()} />
                          </ComponentModal>
                        : undefined
                }

                {
                    this.state.canUpdate
                        ? <ComponentModal show={this.state.activeModal === 'uploadExcel'}
                            title='Upload Excel'>
                            <CCBUploadForm data={[]} categories={CATEGORIES} toggleForm={() => this.toggle(null)} />
                          </ComponentModal>
                        : undefined
                }
                
                <Spinner showSpinner={this.state.showSpinner} />

            </div>
        );
    }
}

class CCBRoleMaintenanceRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formVisible: false,
            tableRowData: {},
            showSpinner: true,
            notify: undefined,
            notifyText: '',
            ccbId: this.props.ccbId
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

    toggleAlert() {
        this.setState({
            notify: undefined
        });
    }

    toggleForm() {
        this.setState({
            formVisible: !this.state.formVisible
        })
    }

    toggleSpinner() {
        this.setState({ showSpinner: !this.state.showSpinner });
    }


    render() {
        const record = this.props.data;
        const buttons = [
            { 'icon': 'pencil', 'title': 'Edit', 'callback': () => this.toggleForm() }
        ];

        const cells = this.props.columns.map((column) => {
            const colKey = 'column-' + column.key;
            if (column.key === 'roleId') {
                return <GridActionCell key={colKey} buttons={buttons} />
            } else {
                return <GridTextCell key={colKey}>{record[column.key]}</GridTextCell>
            }
        });

        return (
            <tr style={{ width: '100%', textAlign: 'center' }}>
                {cells}
                <td style={{ display: 'none' }}>
                    <ComponentModal show={this.state.formVisible}
                        title='Edit CCB Role'>
                        <CCBRoleForm data={record} ccbId={this.props.ccbId} onSubmit={() => this.handleFormSubmit()} categories={CATEGORIES} toggleForm={() => this.toggleForm()} />
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

                </td>
            </tr>
        )
    }
}

export default withLayout(CCBRoleMaintenancePage);