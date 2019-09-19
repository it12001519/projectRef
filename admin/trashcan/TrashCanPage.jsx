import React, { Component, } from 'react';
import FontAwesome from 'react-fontawesome';
import ReactiveTable from 'reactive-tables'
import withLayout from 'js/app/models/withLayout';
import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb';
import { Button, } from 'reactstrap';
import { ConfirmDeleteModal, } from 'js/universal/Modals';

class TrashCanPage extends Component{

    constructor(props) {
        super(props);
        this.state = {
            columns: [
                {
                    key: 'row-select',
                    label: ''
                },
                {
                    key: 'change_number',
                    label: 'Change Number'
                },
                {
                    key: 'change_title',
                    label: 'Change Title'
                },
                {
                    key: 'project_name',
                    label: 'Project Name'
                },
                {
                    key: 'change_group',
                    label: 'Change Group'
                },
                {
                    key: 'phase_status',
                    label: 'Phase Status'
                },
                {
                    key: 'change_status',
                    label: 'Change_Status'
                },
                {
                    key: 'change_owner',
                    label: 'Change Owner'
                },
                {
                    key: 'deleted_by',
                    label: 'Deleted By'
                },
                {
                    key: 'delete_date',
                    label: 'Delete Date'
                }
        ],
            data: []
        }
    }

    componentWillMount(){
        let counter = 0;
        this.setState({
            data: Array(20).fill().map(() => {
                return {
                    id: counter++,
                    change_number: "C" + Math.random().toString().slice(2,9),
                    change_title: "Test changes for mockup",
                    project_name: "Project Name -- Mockup",
                    change_group: "HPA, ASC",
                    phase_status: Math.random().toString().slice(2,3),
                    change_status: "Draft",
                    change_owner: "A0" + Math.random().toString().slice(2,8),
                    deleted_by: "a0220580",
                    delete_date: null
                }
            })
        })
    }

    render() {
        return (
            <div>
                 <ChangeLinkBreadcrumb crumbs={[
                        { text: 'Home', to: "/" },
                        { text: 'Administration', active: true },
                        { text: 'Trash can', active: true }
                    ]} />

                <h5>Admin &raquo; Trash Can</h5>

                <ReactiveTable
                    row={TrashCanMatrixRow}
                    striped columnFilters advancedColumns
                    columns={this.state.columns}
                    data={this.state.data}
                />
                
            </div>
        );
    }
}


class TrashCanMatrixRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formVisible: false,
            tableRowData: {}
        }
        this.handleModal = this.handleModal.bind(this);
        this.hideTableRow = this.hideTableRow.bind(this);
    }

    handleModal(){
        let row = arguments[0];
        if(row){
            this.setState({
                tableRowData: row.data,
            })
        }
        this.setState({
            formVisible: !this.state.formVisible,
        });
    }

    hideTableRow(){
        this.setState({
            display: "none"
        });
    }

    render() {
        const record = this.props.data
        const cells = this.props.columns.map((column) => {
            const key = 'column-' + column.key;
            if (column.key === 'row-select') {
                return <td key={key}><TrashIconCell record={record} hideTableRow={this.hideTableRow} handleModal={this.handleModal}/></td>
            } else {
                return <td key={key}><TrashCanMatrixDefaultCell record={record} column={column}/></td>
            }
        })
        
        let rowStyle = {display: this.state.display}

        return (
            <tr style={rowStyle}>{cells}
                <ConfirmDeleteModal
                    show={this.state.formVisible}
                    message={'The change will be permanently deleted. It will NOT be recoverable after this. Do you want to proceed?'}
                    handleClose={() => this.handleModal()}
                    handleConfirmation={() => { this.hideTableRow(); this.handleModal(); }}
                />
            </tr>
        )
    }
}

class TrashIconCell extends React.Component {
    render() {
        return (
            <div style={{width: "100%", textAlign: "center"}}>
                <Button size="sm" color="dark" outline className="mr-2 mb-1" title="Restore"
                        ref={'chkbox_'+this.props.record.id} onClick={()=>this.props.hideTableRow()}><FontAwesome name="undo" /></Button>
                {' '}
                <Button size="sm" color="dark" outline className="mr-2 mb-1" title="Permanently Delete"
                        ref={'chkbox_'+this.props.record.id} onClick={()=>this.props.handleModal(this.props.record)}><FontAwesome name="trash" /></Button>
            </div>
        );
    }
}

class TrashCanMatrixDefaultCell extends React.Component {
    render() {
        return <span>{this.props.record[this.props.column.key]}</span>
    }
}

export default withLayout(TrashCanPage);