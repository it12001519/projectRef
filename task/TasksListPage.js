import React from 'react';
import { withRouter } from "react-router-dom";
import withLayout from "js/app/models/withLayout";
import ChangeLinkBreadcrumb from "js/app/models/ChangeLinkBreadcrumb";
import ReactiveTable, { ReactiveTableStore } from "reactive-tables";
import FetchUtilities from "js/universal/FetchUtilities";
import { GridActionCell, GridLinkCell, GridTextCell } from "js/universal/GridCells";

const URL = "/api/v1/tasks/";
const COL_ACTIONS = 'actionColumn';
//const COL_TASK_NUMBER = 'taskNumber';

class TasksListPage extends React.Component {

    state = {
        columns: [],
        data: []
    }

    componentWillMount() {
        this.setState({
            columns: [
                {
                    key: 'actionColumn',
                    label: '',
                    sortable: false
                },
                {
                    key: 'taskNumber',
                    label: 'Task Number',
                    sortable: true,
                    filterable: true
                }, {
                    key: 'name',
                    label: 'Name',
                    sortable: true,
                    filterable: true
                }, {
                    key: 'feedbackNumber',
                    label: 'Feedback Number',
                    sortable: true,
                    filterable: true
                }, {
                    key: 'pcnNumber',
                    label: 'PCN Number',
                    sortable: true,
                    filterable: true
                }, {
                    key: 'state',
                    label: 'Status',
                    sortable: true,
                    filterable: true
                }, {
                    key: 'owner',
                    label: 'Owner',
                    sortable: true,
                    filterable: true
                }, {
                    key: 'description',
                    label: 'Description',
                    sortable: true,
                    filterable: true
                }, {
                    key: 'comments',
                    label: 'Comments',
                    sortable: true,
                    filterable: true
                }, {
                    key: 'customers',
                    label: 'Customers',
                    sortable: true,
                    filterable: true
                }, {
                    key: 'dateOpened',
                    label: 'Date Opened',
                    sortable: true,
                    filterable: true
                }, {
                    key: 'dateCompleted',
                    label: 'Date Completed',
                    sortable: true,
                    filterable: true
                }]
        }
        )

    }



    render() {

        const crumbs = [
            {
                text: 'Home',
                to: '/'
            }, {
                text: 'Tasks',
                active: true
            }
        ]

        return <div>

            <ChangeLinkBreadcrumb crumbs={crumbs} />

            <ReactiveTableStore
                credentials={'include'}
                server
                tableId="tasks_table"
            >
                <ReactiveTable
                    server
                    ref={() => {}}
                    credentials={'include'}
                    fetchErrorHandler={FetchUtilities.handleError}
                    row={TaskListRow}
                    striped columnFilters advancedColumns
                    columns={this.state.columns}
                    url={URL}
                />
            </ReactiveTableStore>
        </div>
    }

}

class TaskListRow extends React.Component {
    
    render() {
        const record = this.props.data
        const buttons = [
            { 'icon': 'eye', 'title': 'View', 'url': '/task/' + record.taskNumber },
        ]

        const cells = this.props.columns.map(column => {
            const key = 'column-' + column.key;
            if (column.key === COL_ACTIONS) {
                return <GridActionCell key={key} buttons={buttons} />
            } else if (column.key === "feedbackNumber") {
                const changeUri = "/feedback/" + record.feedbackNumber
                return <GridLinkCell key={key} url={changeUri}>{record[column.key]}</GridLinkCell>
            } else if (column.key === "pcnNumber") {
                const pcnUri = "/pcn/" + record.pcnNumber
                return <GridLinkCell key={key} url={pcnUri}>{record[column.key]}</GridLinkCell>
            } else {
                return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
            }
        })

        return <tr>{cells}</tr>
    }
}

export default withLayout(withRouter(TasksListPage))
