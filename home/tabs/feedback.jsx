import React from 'react'
import FetchUtilities from 'js/universal/FetchUtilities';
import ReactiveTable, { ReactiveTableStore, }  from 'reactive-tables';
import { GridLinkCell, GridTextCell } from 'js/universal/GridCells';

const URL = "/api/v1/dashboard_data/feedback/";

const COLUMN_FEEDBACK = 'feedbackNumber';
const COLUMN_PCN = 'pcnNumber';
const COLUMN_EMAIL = 'contactEmail';

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

class FeedbackTab extends React.Component {

    render() {
        return (
            <div>
                <ReactiveTableStore
                    credentials={'include'}
                    server
                    tableId="dashboard_feedback_tab"
                >
                <ReactiveTable
                    server
                    striped columnFilters advancedColumns
                    credentials={'include'}
                    fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                    fetchErrorHandler={FetchUtilities.handleError}
                    row={FeedbackRow}
                    columns={columns}
                    url={URL}
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

export default FeedbackTab