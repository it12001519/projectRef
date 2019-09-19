import React from 'react'
import { withRouter } from "react-router-dom";
import withLayout from "js/app/models/withLayout";
import { Link } from 'react-router-dom';
import ChangeLinkBreadcrumb from "js/app/models/ChangeLinkBreadcrumb";
import ReactiveTable, { ReactiveTableStore, } from "reactive-tables";
import FetchUtilities from "js/universal/FetchUtilities";
import { GridLinkCell, GridTextCell } from "js/universal/GridCells";
import FontAwesome from 'react-fontawesome';

const BASE_URL = "/api/v1"
const ADMIN_ROLES = ['System Admin', 'ChangeLink Admin', 'Sample Coordinator', 'Sample Admin']

class SampleListPage extends React.Component {

    columns = [{
        key: 'sampleSampleNumber',
        label: 'Sample Number',
        sortable: true,
        filterable: true
    }, {
        key: 'pcnPcnNumber',
        label: 'PCN Number',
        sortable: true,
        filterable: true
    }, {
        key: 'cmsCmsNumber',
        label: 'CMS Number',
        sortable: true,
        filterable: true
    }, {
        key: 'swrSwrNumber',
        label: 'SWR Number',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleStatus',
        label: 'Status',
        sortable: true,
        filterable: true
    }, {
        key: 'partOrderableMaterial',
        label: 'Orderable Material',
        sortable: true,
        filterable: true
    }, {
        key: 'deviceCustomerPartNumber',
        label: 'Customer Part Number',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleRequester',
        label: 'Requester',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleQuantity',
        label: 'Requested Quantity',
        sortable: true,
        filterable: true
    }, {
        key: 'deviceCustomerName',
        label: 'Customer Name',
        sortable: true,
        filterable: true
    }, {
        key: 'deviceCustomerNumber',
        label: 'Customer Number',
        sortable: true,
        filterable: true
    }, {
        key: 'deviceWwidName',
        label: 'WW Customer',
        sortable: true,
        filterable: true
    }, {
        key: 'deviceWwidNumber',
        label: 'WW Customer Number',
        sortable: true,
        filterable: true
    }, {
        key: 'deviceEndCustomerName',
        label: 'End Customer Name',
        sortable: true,
        filterable: true
    }, {
        key: 'deviceEndCustomerNumber',
        label: 'End Customer Number',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleCoordinator',
        label: 'Coordinator',
        sortable: true,
        filterable: true
    }, {
        key: 'deviceCategory',
        label: 'Category',
        sortable: true,
        filterable: true
    }, {
        key: 'deviceIsAutomotive',
        label: 'Is Automotive',
        sortable: true,
        filterable: true
    }, {
        key: 'partSbe',
        label: 'SBE',
        sortable: true,
        filterable: true
    }, {
        key: 'partSbe1',
        label: 'SBE 1',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleDateRequested',
        label: 'Date Requested',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleDateRequestedDeliver',
        label: 'Date Requested Deliver',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleDateExpectedApproval',
        label: 'Date Expected Approval',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleDateFollowupEmail',
        label: 'Date Followup Email',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleDateCanceled',
        label: 'Date Canceled',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleTiContact',
        label: 'TI Contact',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleRequesterEmail',
        label: 'Requester Email',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleRequesterRegion',
        label: 'Requester Region',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleRequesterCountry',
        label: 'Requester Country',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleCustomerAcceptStatus',
        label: 'Customer Accept Status',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleDateFeedback',
        label: 'Date Feedback',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleDateApproval',
        label: 'Date Approval',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleDateRejected',
        label: 'Date Rejected',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleCso',
        label: 'CSO',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleAso',
        label: 'ASO',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleDateEstimatedFinalApproval',
        label: 'Date Estimated Final Approval',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleDateShip',
        label: 'Date Ship',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleTsr',
        label: 'TSR',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleDateEstimatedShip',
        label: 'Date Estimated Ship',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleLateSampleRequest',
        label: 'Late Sample Request',
        sortable: true,
        filterable: true
    }, {
        key: 'sampleShippingInstructions',
        label: 'Shipping Instructions',
        sortable: true,
        filterable: true
    }, {
        key: 'changedPartPartNumber',
        label: 'Changed Part',
        sortable: true,
        filterable: true
    }, {
        key: 'pcnDescription',
        label: 'PCN Description',
        sortable: true,
        filterable: true
    }]

    componentWillReceiveProps(nextProps) { 
        if (nextProps.userAccess) {
          let canUpdate = false;
          for (let i in ADMIN_ROLES) {
            canUpdate = nextProps.userAccess.includes(ADMIN_ROLES[i]) ? true : canUpdate
          }
    
          // Reconfigure the table columns depending on the role update access
          // Add the actions columns if role can update
          if (canUpdate && this.columns.filter(columns => (columns.key === "adminActionColumn")).length === 0) {
            this.columns.unshift({
              key: 'adminActionColumn',
              label: '',
              sortable: false,
              filterable: false
            })
          }
          this.setState({ canUpdate: canUpdate })
        }
      }

    render() {

        const crumbs = [
            {
                text: 'Home',
                to: "/"
            }, {
                text: 'Samples',
                active: true
            }
        ]

        return (
            <div>
                <ChangeLinkBreadcrumb crumbs={crumbs} />
                <ReactiveTableStore
                    credentials={'include'}
                    server
                    tableId="sampleList_table"
                >
                    <ReactiveTable
                        server
                        ref={() => { }}
                        striped columnFilters advancedColumns
                        credentials='include'
                        fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                        fetchErrorHandler={FetchUtilities.handleError}
                        row={DeviceListRow}
                        columns={this.columns}
                        url={BASE_URL + '/samples/'}
                    />
                </ReactiveTableStore>
            </div>
        )
    }

}

class DeviceListRow extends React.Component {

    render() {
        const record = this.props.data
        const cells = this.props.columns.map(column => {
            const key = 'column-' + column.key;
            if (column.key === "adminActionColumn") {
                const sampleUri = "/admin/samples/dashboard?srf=" + record.sampleSampleNumber
                return <GridLinkCell key={key} url={sampleUri} button>
                    <FontAwesome name='pencil' />
                </GridLinkCell>
            } else if (column.key === "sampleSampleNumber") {
                const sampleUri = "/sample/" + record.sampleSampleNumber
                return <GridLinkCell key={key} url={sampleUri}>{record[column.key]}</GridLinkCell>
            } else if (column.key === "cmsCmsNumber") {
                const changeUri = "/change/" + record.cmsCmsNumber
                return <GridLinkCell key={key} url={changeUri}>{record[column.key]}</GridLinkCell>
            } else if (column.key === "pcnPcnNumber") {
                const changeUri = "/pcn/" + record.pcnPcnNumber
                return <GridLinkCell key={key} url={changeUri}>{record[column.key]}</GridLinkCell>
            } else if (column.key === "swrSwrNumber") {
                if (record[column.key] !== null) {
                    const swrUri = '/swr/form/'
                    let swrArray = record[column.key].split(',')
                    return (
                        <td key={key}>
                            {
                                swrArray.map((swr, i) => {
                                    let elems = [] 
                                    let newTo = { pathname: swrUri + swr,
                                                  search:'?ref=samples' }
                                    elems.push(<Link to={newTo}>{swr}</Link>)                                    
                                    elems.push(i < swrArray.length - 1 ? <span>{', '}</span> : undefined)
                                    return (elems)
                                })
                            }
                        </td>
                    )
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

export default withLayout(withRouter(SampleListPage))
