import React from 'react';
import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb';
import ReactiveTable, { ReactiveTableStore, } from 'reactive-tables';
import withLayout from 'js/app/models/withLayout';
import FetchUtilities from 'js/universal/FetchUtilities';
import { GridTextCell, GridLinkCell, GridActionButton } from 'js/universal/GridCells';

import "css/approval-matrix-button-bar.css";

const URL = "/api/v1/change/data";

const columns = [
    {
        key: 'link-redirect',
        label: ''
    }, {
        key: 'changeNumber',
        label: 'Change Number'
    }, {
        key: "changeType",
        label: "Change Group"
    }, {
        key: "mccbName",
        label: "CCB"
    }, {
        key: "createdBy",
        label: "Change Owner"
    }, {
        key: "ccbChairPrimary",
        label: "Change Coordinator"
    }, {
        key: "changeState",
        label: "Change Status"
    }, {
        key: "changeTitle",
        label: "Change Title"
    }, {
        key: "projectName",
        label: "Project Name"
    }, {
        key: "changeDescription",
        label: "Change Description"
    }, {
        key: "notificationStatus",
        label: "Notification Status"
    }, {
        key: "isAutomotive",
        label: "Is Automotive"
    }
]
class ChangeListPage extends React.Component {

    render() {
        return (
            <div>
                <ChangeLinkBreadcrumb crumbs={[
                    { text: 'Home', to: "/" },
                    { text: 'Changes', active: true }
                ]} />
                <ReactiveTableStore server credentials={'include'} tableId="main_changes">
                    <ReactiveTable server
                        credentials={'include'}
                        fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                        fetchErrorHandler={FetchUtilities.handleError}
                        row={CustomerDeviceRow}
                        striped columnFilters advancedColumns
                        columns={columns}
                        url={URL}
                    />
                </ReactiveTableStore>
            </div>
        )
    }

}

class CustomerDeviceRow extends React.Component {

    render() {

        const record = this.props.data
        const cells = this.props.columns.map((column) => {

            const key = 'column-' + column.key;

            if (column.key === 'link-redirect') {
                return <GridLinkCell key={key} url={"/change/" + record['changeNumber']}>
                    <GridActionButton key={key + '-btn'} icon='eye' title='View' />
                </GridLinkCell>
            } else {
                return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
            }
        })

        return (
            <tr>{cells}</tr>
        )
    }
}

export default withLayout(ChangeListPage)
