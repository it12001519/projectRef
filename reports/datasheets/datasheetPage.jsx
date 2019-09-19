import React from 'react';
import ReactiveTable, { ReactiveTableStore, } from 'reactive-tables';
import { Modal, ModalHeader, ModalBody, Button, Table, } from "reactstrap";
import "css/approval-matrix-button-bar.css";
import FetchUtilities from 'js/universal/FetchUtilities';
import withLayout from 'js/app/models/withLayout';
import { GridLinkCell, } from "js/universal/GridCells";
import ChangeLinkBreadcrumb from "js/app/models/ChangeLinkBreadcrumb";

const URL = "/api/v1/pageableDatasheetDao";
class LitTab extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            columns: [],
            data: []
        }
    }

    componentWillMount() {
        this.setState({
            columns: [
                {
                    key: 'changeNumber',
                    label: 'Change Number',
                    sortable: true,
                },
                {
                    key: 'changeState',
                    label: 'Change Staus',
                    sortable: true,
                }, {
                    key: 'mccbName',
                    label: 'LIT#',
                    sortable: true,
                }, {
                    key: 'Published',
                    label: 'Published',
                    sortable: true,
                }, {
                    key: 'createdBy',
                    label: 'Created By',
                    sortable: true,
                }, {
                    key: 'createdDate',
                    label: 'Created Date',
                    sortable: true,
                }, {
                    key: 'changeOwner',
                    label: "DD Writer",
                    sortable: true,
                }
            ],
        });
    }

    render() {
        const crumbs = [
            { text: 'Home', to: '/' },
            { text: 'Datasheets', active: true }
        ]
        let customerUrl = URL
        return (
            <div>
                <ChangeLinkBreadcrumb crumbs={crumbs} />
                <ReactiveTableStore server
                    credentials={'include'}
                    tableId="datasheets_table">
                    <ReactiveTable server
                        ref={() => { }}
                        credentials={'include'}
                        fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                        fetchErrorHandler={FetchUtilities.handleError}
                        striped columnFilters advancedColumns
                        columns={this.state.columns}
                        url={customerUrl}
                        row={CustomerRow}
                    />
                </ReactiveTableStore>
            </div>
        )
    }
}

class CustomerRow extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            formVisible: false,
            data: this.props.record,
            tableRowData: {}
        }

        this.handleModal = this.handleModal.bind(this);
        this.handleFormCancel = this.handleFormCancel.bind(this);
    }

    // Handler for form button onCancel
    handleModal(row) {
        this.setState({
            tableRowData: row,
            formVisible: true
        });
    }

    // Handler for form button onCancel
    handleFormCancel() {
        this.setState({
            tableRowData: [],
            formVisible: false
        });
    }

    render() {
        const record = this.props.data;
        const cells = this.props.columns.map((column) => {
            const key = 'column-' + column.key;

            if (column.key === 'Published') {
                return <td key={key}><LitActionCell
                    record={record}
                    handleModal={this.handleModal} /></td>
            }
            else if (column.key === "changeNumber") {
                const changeUri = "/change/" + record.changeNumber
                return <GridLinkCell key={key} url={changeUri}>{record[column.key]}</GridLinkCell>
            }
            else {
                return <td key={key}><LitDefaultCell record={record} column={column} /></td>
            }
        })

        return (
            <tr key={`${record.published}-${record.published}`}>
                {cells}
                <Modal
                    isOpen={this.state.formVisible}
                    toggle={this.toggleForm}
                    fade={true}
                    backdrop={true}
                    size={"lg"}>
                    <ModalHeader toggle={this.toggleForm}>Lit version Information</ModalHeader>
                    <ModalBody>
                        <CustomerDetails record={this.state.tableRowData}
                            onCancel={this.handleFormCancel} />
                    </ModalBody>
                </Modal>
            </tr>
        )
    }
}

class CustomerDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: this.props.record,
            contactData: null,
            id: '',
            litNumber: '',
            addDate: ''

        }
        this.handleCancel = this.handleCancel.bind(this);
    }

    componentWillReceiveProps(next) {
        this.setState({
            contactData: null,
        }, () => {
            this.refresh();
        });
    }


    refresh() {
        // Fetch the latest set of data
        fetch("/api/v1/lits?lit=" + this.props.record.mccbName, {
            method: 'GET',
            credentials: 'include',
            headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            })
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then((response) => {

                return response.json();
            })
            .then((json) => {
                this.setState({ id: json.id, litNumber: json.litNumber, addDate: json.addDate });
            })
            .catch((ex) => {
                FetchUtilities.handleError(ex);
                throw ex;
            });
    }

    componentDidMount() {
        this.refresh();
    }

    // Handler for form cancel
    handleCancel(e) {
        e.preventDefault();
        if (typeof this.props.onCancel === 'function') {
            this.props.onCancel();
        }
    }

    render() {
        return (
            <div>
                <Table>
                    <thead>
                        <tr>
                            <th>Lit#</th>
                            <th>ID</th>
                            <th>When</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{this.state.litNumber}</td>
                            <td>{this.state.id}</td>
                            <td>{this.state.addDate}</td>
                        </tr>
                    </tbody>
                </Table>
                <Button color="secondary" outline onClick={(event) => this.handleCancel(event)} className="mr-1 float-right">Close</Button>
            </div>
        )
    }
}

class LitActionCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            formVisible: false
        }
        this.handleModal = this.handleModal.bind(this);
        this.refresh = this.refresh.bind(this);
    }

    componentWillMount() {
        this.refresh();
    }

    componentWillReceiveProps(next) {
        this.setState({
            data: this.props.record,
        }, () => {
            this.refresh();
        });
    }

    refresh() {
        this.setState({
            data: this.props.record
        })
    }

    handleModal = () => {
        this.props.handleModal(this.state.data);
    }


    render() {
        let litType;
        if (this.state.data.published === null ||
            this.state.data.published === undefined) {
            litType = <Button outline color="danger" disabled>No Data</Button>
        } else {
            if (this.state.data.published.includes('YES') || this.state.data.published.includes('Y')) {
                litType = <Button color="success" onClick={this.handleModal}>YES</Button>
            }
            else if (this.state.data.published === 'NO') {
                litType = <Button color="danger" onClick={this.handleModal}>NO</Button>
            }
            else if (this.state.data.published === 'NA') {
                litType = <Button color="dark" >NA</Button>
            }
            else if (this.state.data.published !== 'NA' && this.state.data.published !== 'YES' && this.state.data.published !== 'NO') {
                litType = <Button color="dark" >NA</Button>
            }
        }
        return (
            <div >
                {litType}
            </div>
        )
    }
}

class LitDefaultCell extends React.Component {
    render() {
        return <span>{this.props.record[this.props.column.key]}</span>
    }
}

export default withLayout(LitTab);