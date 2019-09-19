import React from 'react'
import FetchUtilities from 'js/universal/FetchUtilities';
import withLayout from 'js/app/models/withLayout';
import ReactiveTable, { ReactiveTableStore, }  from 'reactive-tables';
import { GridLinkCell, GridTextCell } from 'js/universal/GridCells';
import ChangeLinkBreadcrumb from "js/app/models/ChangeLinkBreadcrumb";

const URL = "/api/v1/feedbacks/";

const COLUMN_FEEDBACK = 'feedbackNumber';
const COLUMN_PCN = 'pcnNumber';
const COLUMN_EMAIL = 'contactEmail';

const ADMIN_ROLES = ['ChangeLink Admin'];

let columns = [
    {
        key: 'feedbackNumber',
        label: 'Feedback Number',
    }, {
        key: 'pcnNumber',
        label: 'PCN Number'
    }, {
        key: 'response',
        label: 'Feedback Response',
    }, {
        key: 'state',
        label: 'Feedback State'
    }, {
        key: 'feedback',
        label: 'Feedback',
    }, {
        key: 'submitter',
        label: 'Feedback Submitter'
    }, {
        key: 'pcnTitle',
        label: 'PCN Header'
    }, {
        key: 'contactName',
        label: 'Contact Name'
    }, {
        key: 'companyName',
        label: 'Company Name'
    }, {
        key: 'companySoldTo',
        label: 'Company Sold-To'
    }, {
        key: 'contactEmail',
        label: 'Contact Email'
    }, {
        key: 'comments',
        label: 'Comments'
    }, {
        key: 'devicesApproved',
        label: 'Devices Approved'
    }, {
        key: 'devicesPending',
        label: 'Devices Pending'
    }, {
        key: 'details',
        label: 'Details'
    }, {
        key: 'coordinator',
        label: 'Coordinator'
    }, {
        key: 'dateCreated',
        label: 'Date Created'
    }
]

let FeedbackReportPage = class extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            canEdit: props.hasRole(ADMIN_ROLES)
        }
        this.table = null;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
            this.setState({
                canEdit: nextProps.hasRole(ADMIN_ROLES)
            })
    }

    render() {
        const crumbs = [
            { text: 'Home', to: '/' },
            { text: 'Feedback', active: true }
        ]

        let MyFeedbackRow = (props) => {
            return <FeedbackRow {...props} canEdit={this.state.canEdit} refreshTable={() => this.table.refresh()} />
        }
        return (
            <div>
                <ChangeLinkBreadcrumb crumbs={crumbs} />
                <ReactiveTableStore
                    credentials={'include'}
                    server
                    tableId="feedbacks_table"
                >
                <ReactiveTable
                    server
                    striped columnFilters advancedColumns
                    credentials={'include'}
                    fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                    fetchErrorHandler={FetchUtilities.handleError}
                    row={MyFeedbackRow}
                    ref={(table) => this.table = table}
                    columns={columns}
                    url={URL}
                    mirrorCustomTopBar
                />
                </ReactiveTableStore>
            </div>
        )
    }

}

class FeedbackRow extends React.Component {

    render() {
        const record = this.props.data
        const cells = this.props.columns.map((column) => {
            const key = 'column-' + column.key;

            if (column.key === COLUMN_FEEDBACK) {
                return <GridLinkCell key={key} url={`/feedback/${record[column.key]}`}>{record[column.key]}</GridLinkCell>
            } else if (column.key === COLUMN_PCN) {
                return <GridLinkCell key={key} url={`/pcn/${record[column.key]}/`}>{record[column.key]}</GridLinkCell>
            } else if (column.key === COLUMN_EMAIL) {
                if (!!record[column.key] && record[column.key] !== '') {
                    return <GridLinkCell key={key} url={`mailto:${record[column.key]}`} external>{record[column.key]}</GridLinkCell>
                } else {
                    return <GridTextCell key={key}></GridTextCell>
                }
            } else {
                return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
            }
        })

        return <tr>{cells}</tr>
    }
}

export default withLayout(FeedbackReportPage);