import React from 'react';
import ChangeLinkBreadcrumb from "js/app/models/ChangeLinkBreadcrumb";
import ReactiveTable, {ReactiveTableStore} from "reactive-tables";
import FetchUtilities from "js/universal/FetchUtilities";
import {GridBadgeCell, GridTextCell} from "js/universal/GridCells";
import withLayout from "js/app/models/withLayout";
import {Alert} from "reactstrap";

const URL = "/scheduled/v1/batchprocess";

const columns = [
    {
        key: 'ID',
        label: 'ID'
    }, {
        key: 'STATUS',
        label: 'Status'
    }, {
        key: 'NAME',
        label: 'Batch Process Name'
    }, {
        key: 'DATE_STARTED',
        label: 'Date Started'
    }, {
        key: 'DATE_STOPPED',
        label: 'Date Stopped'
    }, {
        key: 'STARTED_BY',
        label: 'Started By'
    }, {
        key: 'MESSAGE',
        label: 'Message'
    }
];

const hiddenColumns = ["ID"];

class BatchProcessPage extends React.Component {

    render() {

        return <div>

            <ChangeLinkBreadcrumb crumbs={[
                {text: 'Home', to: "/"},
                {text: 'Admin', active: false},
                {text: 'Batch Process', active: true}
            ]}/>

            <Alert color="info">
                This page shows the status of the various batch processes. The data shows if the process
                executed successfully, when it was ran and who started it. If Started By is blank, then
                the system started the process.
            </Alert>

            <ReactiveTableStore
                credentials='include'
                server
                tableId="batchprocess_table"
            >
                <ReactiveTable
                    server
                    credentials='include'
                    url={URL}
                    columns={columns}
                    hiddenColumns={hiddenColumns}
                    fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                    fetchErrorHandler={FetchUtilities.handleError}
                    row={BatchProcessRow} ref={(table) => this.table = table}
                    striped columnFilters advancedColumns/>
            </ReactiveTableStore>
        </div>
    }

}

class BatchProcessRow extends React.Component {

    colormap = {'SUCCESS': 'success', 'FAIL': 'danger', 'RUNNING': 'warning'};

    render() {
        const record = this.props.data;

        const cells = this.props.columns.map((column) => {
            const value = record[column.key];

            if (column.key === 'STATUS') {
                return <GridBadgeCell key={column.key} color={this.colormap[value]} data={value}/>
            } else {
                return <GridTextCell key={column.key}>{value}</GridTextCell>
            }
        });

        return <tr>{cells}</tr>
    }

}

export default withLayout(BatchProcessPage)
