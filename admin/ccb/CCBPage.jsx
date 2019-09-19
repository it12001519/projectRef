import React, { Component, } from 'react';
import { Button, Modal, ModalHeader, Form, ModalBody, Table, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import ReactiveTable from 'reactive-tables';
import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb';
import Spinner from 'js/universal/spinner';
import 'whatwg-fetch';
import FetchUtilities from 'js/universal/FetchUtilities';
import withLayout from 'js/app/models/withLayout';
import { Link, Redirect } from "react-router-dom";
import { GridTextCell, GridActionCell } from 'js/universal/GridCells';
import "css/approval-matrix-button-bar.css";

const URL = "/api/v1/ccb";
const filteredURL = "/api/v1/ccb/filter/";
const TABLE_COLUMNS = [
    { key: 'actions', },
    { key: 'ccb', label: 'CCB', sortable: true },
    { key: 'position', label: 'Position', sortable: true},
    { key: 'role', label: 'CCB Role', sortable: true },
    { key: 'name', label: 'Primary', sortable: true },
    { key: 'delegate', label: 'Delegate', sortable: true },
    { key: 'ccbStatus', label: 'Status', sortable: true },
    { key: 'changeGrpId', label: 'Change Group', sortable: true },
    { key: 'changeType', label: 'Change Type', sortable: true },
    { key: 'sbeId', label: 'SBE', sortable: true },
    { key: 'sbeOneId', label: 'SBE1', sortable: true },
    { key: 'sbeTwoId', label: 'SBE2', sortable: true },
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'indSec', label: 'Industry Sector', sortable: true },
    { key: 'gidep', label: 'GIDEP', sortable: true },
    { key: 'applicationPhase', label: 'Applicable Phase(s)', sortable: true },
    { key: 'curFabSite', label: 'Current Fab Site', sortable: true },
    { key: 'curAssy', label: 'Current Assy', sortable: true },
    { key: 'updateATSS', label: 'Update ATSS', sortable: true },
    { key: 'isoDev', label: 'ISO Device', sortable: true },
    { key: 'safeCert', label: 'Safety Certification', sortable: true },
    { key: 'pkgGrp', label: 'Pkg Group', sortable: true },
    { key: 'pachinko', label: 'Pachinko', sortable: true },
    { key: 'niche', label: 'Niche', sortable: true },
    { key: 'roleAutoApprove', label: 'Role Auto Approve', sortable: true },
    { key: 'numOfDays', label: 'Number of Days', sortable: true },
    { key: 'dataSource', label: 'Data Source', sortable: true },
    { key: 'pcnRequired', label: 'PCN Required', sortable: true},
    { key: 'manualSelection', label: 'Manual Selection', sortable: true}
]

const ADMIN_ROLES = ['System Admin','ChangeLink Admin','CCB Coordinator'];

class CCBPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            key: 'tbl-ccb',
            tableId: ~~(Math.random() * 9000),
            formVisible: false,
            alertVisible: false,
            alertColor: '',
            alertText: '',
            showSpinner: true,
            tableRowData: {},
            position: '',
            dropdownOpen: false,
            modalVisible: false,
            autoCCBData: {},
            canUpdate: props.hasRole(ADMIN_ROLES),
            dropDownVal: 'Business'
        };
        this.toggleSpinner = this.toggleSpinner.bind(this);
        this.toggleForm = this.toggleForm.bind(this);
        this.toggle = this.toggle.bind(this);
        this.handleAutoApproval = this.handleAutoApproval.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.refreshTable = this.refreshTable.bind(this);
        this.table = null;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
            this.setState({
                canUpdate: nextProps.hasRole(ADMIN_ROLES)
            })
    }

    refreshTable() {
        this.table.refresh();
    }

    componentDidMount() {
        this.setState({ showSpinner: false });
    }

    toggleSpinner() {
        this.setState({ showSpinner: !this.state.showSpinner });
    }

    toggleForm() {
        this.setState({ formVisible: !this.state.formVisible });
    }

    
    toggle() {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

    toggleModal() {
        this.setState({ modalVisible: !this.state.modalVisible });
    }

    closeModal() {
        this.setState({ modalVisible: false });
    }

    handleAutoApproval() {
        fetch(`/scheduled/autoChangeApproval`, {
            method: 'GET',
            credentials: 'include',
            headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            })
        }).then((response) => {
            if (!response.ok) {
                throw new Error({});
            } else {
                return response.json();
            }
        }).then((json) => {
            this.setState({ autoCCBData: json, modalVisible: !this.state.modalVisible });
        });
    }

    handleCCBTable = (value) => {
        this.setState({
            dropDownVal: value
        })
        this.refreshTable();
    }


    render() {
        let columns = JSON.parse(JSON.stringify(TABLE_COLUMNS)); // Deep copy the old array
        // Remove the actions columns if uneditable
        if (!this.state.canUpdate) {
            delete columns[0]
        }

        let customBar = (
            <div className="p-2">
                <Form inline>
                    <SelectCCB onSelect={this.handleCCBTable}/>

                    {
                        this.state.canUpdate
                    ? <Link to={{ pathname: '/admin/ccb/form', state: { data: this.state.tableRowData } }}>
                                <button className="mr-1 mt-1 btn btn-primary btn-sm"><span aria-hidden="true" className="fa fa-plus"></span> Add CCB Role</button>
                              </Link>
                            : undefined
                    }
                            
                    <button className="mr-1 mt-1 btn btn-primary btn-sm"><span aria-hidden="true" className="fa fa-download"></span> Download Template </button>

                    {
                        this.state.canUpdate                  
                    ?  <button className="mr-1 mt-1 btn btn-primary btn-sm"><span aria-hidden="true" className="fa fa-upload"></span> Upload from Template </button>
                            : undefined
                    }
                    {
                        this.state.canUpdate
                            ? <Button size="sm" color="primary" className="mr-1 mt-1 btn btn-primary btn-sm float-right" onClick={() => { this.handleAutoApproval() }}><span aria-hidden="true" className="fa fa-check-square"></span> Auto Change Approval</Button> 
                            : undefined
                    }
                    {
                        this.state.canUpdate
                    ? <Link to={{ pathname: '/admin/ccb/reorder', state: { dropDownVal: this.state.dropDownVal} }}>
                        <Button size="sm" color="primary" className="mr-1 mt-1 btn btn-primary btn-sm float-right"><span aria-hidden="true" className="fa fa-sort"></span> Role Reordering </Button>
                        </Link>
                          : undefined
                    }
                </Form>
            </div>);
        return (
            <div>
                <Modal
                    isOpen={this.state.modalVisible}
                    fade={true}
                    backdrop={true}
                    size={"lg"}>
                    <ModalHeader toggle={this.toggleForm}>Auto Approved Changes</ModalHeader>
                    <ModalBody>
                        <AutoChangeApproval record={this.state.autoCCBData} />
                        <Button color="danger" className="float-right" onClick={this.closeModal}>Close</Button>
                    </ModalBody>
                </Modal>

                <Spinner showSpinner={this.state.showSpinner} />
                <ChangeLinkBreadcrumb crumbs={[
                    { text: 'Home', to: "/" },
                    { text: 'Admin', active: false },
                    { text: 'CCB Maintenance', active: true }
                ]} />

                <ReactiveTable server
                    credentials={'include'}
                    fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                    fetchErrorHandler={FetchUtilities.handleError}
                    striped={true}
                    columnFilters={true}
                    url={this.state.dropDownVal === 'Business' || this.state.dropDownVal === 'DLP' ? filteredURL + this.state.dropDownVal : URL}
                    ref={(table) => this.table = table}
                    row={CCBRow}
                    customTopBar={customBar}
                    mirrorCustomTopBar
                    columns={columns} />
            </div>
        )
    }
}

class CCBRow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formVisible: false,
            showSpinner: true,
            tableRowData: {}
        }
        this.handleCCBPosition = this.handleCCBPosition.bind(this);
        this.handleFormCancel = this.handleFormCancel.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
    }

    handleCCBPosition(row) {
        this.setState({
            tableRowData: row,
            formVisible: true
        });
    }

    handleFormCancel() {
        this.setState({
            formVisible: false,
        })
    }

    toggleSpinner() {
        this.setState({ showSpinner: !this.state.showSpinner });
    }

    // Handler for form button onSubmit
    handleFormSubmit(message, isSuccess) {
        if (isSuccess) {
            this.setState({
                notify: 'success',
                notifyText: 'Success: ' + message,
            });

            window.location.reload(true);
        } else {
            this.setState({
                notify: 'error',
                notifyText: 'Error: ' + message,
            });
        }

        // Hide the spinner
        this.toggleSpinner();
    }

    handleChange(e) {
        // Prevent legacy form post
        //e.preventDefault();
        // Get field name and value from event
        const target = e.target;
        let value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        // Set state using function to granularly modify data
        this.setState((previousState) => {
            return previousState.data = { ...previousState.data, [name]: value };
        });
    }

    toggleCCBForm() {
        this.setState({
            ccbForm: "/admin/ccb/form/",
            mode: "upsert"
        })
    }

    toggleCopy() {
        this.setState({
            ccbForm: "/admin/ccb/form/",
            mode: "copy"
        })
    }

    render() {
        const { ccbForm } = this.state;
        if(ccbForm) return <Redirect to={{pathname: "/admin/ccb/form/", state: {data: this.props.data, mode: this.state.mode}}}/>;

        const record = this.props.data

        const buttons = [
            {'icon': 'pencil', 'title': 'Edit', 'callback': () => this.toggleCCBForm(record)},
            {'icon': 'copy', 'title': 'Copy', 'callback': () => this.toggleCopy(record)}
        ]

        const cells = this.props.columns.map((column) => {
            const key = 'column-' + column.key;
            if (column.key === 'actions') {
                return <p className="buttons-nowrap" ><GridActionCell className="buttons-nowrap" key={key} buttons={buttons}/></p>
            } else {
                return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
            }
        })

        return (
            <tr>{cells}</tr>
        )
    }
}

class AutoChangeApproval extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            autoCCBData: this.props.record
        }
    }
    render() {
        let ccbData;
        if (this.state.autoCCBData.content.length !== 0) {
            ccbData = this.state.autoCCBData.content.map((e) => {
                return (
                    <tr key={e.CHANGEID}>
                        <td>{e.CHANGENO}</td>
                        <td>{e.FUNCTIONNAME}</td>
                        <td>{e.PRIMARYNAME}</td>
                        <td>{e.DELEGATENAME}</td>
                    </tr>
                )
            });
        } else {
            ccbData = <tr><td colspan="4">Nothing to Approve</td></tr>
        }
        return (
            <div>
                <Table>
                    <thead>
                        <tr>
                            <th>CHANGE NUMBER</th>
                            <th>FUNCTION NAME</th>
                            <th>PRIMARY NAME</th>
                            <th>DELEGATE NAME</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ccbData}
                    </tbody>
                </Table>
            </div>
        );
    }
}


class SelectCCB extends Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.select = this.select.bind(this);
        this.state = {
            dropdownOpen: false,
            value: 'Business'
        };
    }

    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }

    select(event) {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen,
            value: event.target.innerText
        }, () => this.handleBusinessCCB(this.state.value));
    }

    handleBusinessCCB(value) {
        this.props.onSelect(value);
    }

    render() {
        return (
            <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                <DropdownToggle caret size="sm" className="mr-1 mt-1 btn btn-sm">{this.state.value}</DropdownToggle>
                <DropdownMenu>
                <DropdownItem onClick={this.select}>Business</DropdownItem>
                <DropdownItem onClick={this.select}>DLP</DropdownItem>
                <DropdownItem onClick={this.select}>Show All</DropdownItem>
                </DropdownMenu>
            </ButtonDropdown>
        )
    }
}


export default withLayout(CCBPage);