import React from 'react'
import FetchUtilities from 'js/universal/FetchUtilities'
import moment from 'moment'
import withLayout from 'js/app/models/withLayout'

import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb'
import ReactiveTable, { ReactiveTableStore, } from 'reactive-tables'
import { GridTextCell } from 'js/universal/GridCells'

// Page configuration
const pageTitle = 'CL Samples Backlog'

const url = '/api/v1/metrics/samplesBacklog'

const hiddenColumns = ["agingStatus"
  , "shippingInstructions"]

export default withLayout(class CLSamplesBacklog extends React.Component {

  table = null
  crumbs = [
    { text: 'Home', to: '/' },
    { text: 'Metrics', active: false },
    { text: pageTitle, active: true }
  ]
  state = {
    columns: [],
    data: []
  }
  
  componentWillMount() {
    this.setState({
      columns: [
        {
          key: 'pcnNumber',
          label: 'PCN Number'
        }, {
          key: 'pm',
          label: 'PM'
        }, {
          key: 'pcnDescription',
          label: 'PCN Description'
        }, {
          key: 'srn',
          label: 'SRN'
        }, {
          key: 'dateRequested',
          label: 'Date Requested'
        }, {
          key: 'requestor',
          label: 'Requestor'
        }, {
          key: 'customerName',
          label: 'Customer Name'
        }, {
          key: 'customerCategoryCsr',
          label: 'Customer Category C/S/R'
        }, {
          key: 'quantityRequested',
          label: 'Quantity Requested'
        }, {
          key: 'partNumber',
          label: 'Part Number'
        }, {
          key: 'specDevice',
          label: 'Spec Device'
        }, {
          key: 'sbe',
          label: 'SBE'
        }, {
          key: 'sbe1',
          label: 'SBE 1'
        }, {
          key: 'planner',
          label: 'Planner'
        }, {
          key: 'deviceDieBuildable',
          label: 'Device Die (Buildable)'
        }, {
          key: 'deviceChipsPerWafer',
          label: 'Device Chips Per Wafer'
        }, {
          key: 'pin',
          label: 'Pin'
        }, {
          key: 'packageGroup',
          label: 'Package Group'
        }, {
          key: 'package',
          label: 'Package'
        }, {
          key: 'devicePrtech',
          label: 'Device PRTech'
        }, {
          key: 'deviceSiteAssembly',
          label: 'Device Site Assembly'
        }, {
          key: 'deviceSiteTest',
          label: 'Device Site Test'
        }, {
          key: 'swrNumber',
          label: 'SWR Number'
        }, {
          key: 'swrType',
          label: 'SWR Type'
        }, {
          key: 'swrStatus',
          label: 'SWR Status'
        }, {
          key: 'swrAssyLtc',
          label: 'SWR Assy LTC'
        }, {
          key: 'swrQuantityShipped',
          label: 'SWR Quantity Shipped'
        }, {
          key: 'receivedIntoPdc',
          label: 'Received Into PDC'
        }, {
          key: 'dateEmailToRequestor',
          label: 'Date Email To Requestor'
        }, {
          key: 'orderEntered',
          label: 'Order Entered'
        }, {
          key: 'orderNumber',
          label: 'Order Number'
        }, {
          key: 'orderQuantity',
          label: 'Order Quantity'
        }, {
          key: 'quantityShipped',
          label: 'Quantity Shipped'
        }, {
          key: 'dateShipped',
          label: 'Date Shipped'
        }, {
          key: 'dateEstimatedShip',
          label: 'Date Estimated Ship'
        }, {
          key: 'sampleStatus',
          label: 'Sample Status'
        }, {
          key: 'agingStatus',
          label: 'Aging Status'
        }, {
          key: 'sampleDateCanceled',
          label: 'Sample Date Canceled'
        }, {
          key: 'generalComments',
          label: 'General Comments'
        }, {
          key: 'pcnDeviceShannonsTool',
          label: 'PCN-Device (Shannon\'s tool)'
        }, {
          key: 'swrShannonsTool',
          label: 'SWR # (Shannon\'s tool)'
        }, {
          key: 'requestDateAfterCloseDate',
          label: 'Request Date after Close Date'
        }, {
          key: 'sampleCoordinatorName',
          label: 'Sample Coordinator Name'
        }, {
          key: 'swrRequestorName',
          label: 'SWR Requestor Name'
        }, {
          key: 'partIndustrySector',
          label: 'Part Industry Sector'
        }, {
          key: 'flowTest',
          label: 'Flow (Test)'
        }, {
          key: 'shippedDevice',
          label: 'Shipped Device'
        }, {
          key: 'deviceCustomerPartNumber',
          label: 'Device Customer Part Number'
        }, {
          key: 'swrDieName',
          label: 'SWR Die Name'
        }, {
          key: 'swrDieLotNumber',
          label: 'SWR Die Lot Number'
        }, {
          key: 'ageNotification',
          label: 'Age Notification'
        }, {
          key: 'revisionId',
          label: 'Revision ID'
        }, {
          key: 'revisionDaysExpiration',
          label: 'Revision Days Expiration'
        }, {
          key: 'revisionSampleRequestExpirationDate',
          label: 'Revision Sample Request Expiration Date'
        }, {
          key: 'category',
          label: 'Category'
        }, {
          key: 'shippingInstructions',
          label: 'Shipping Instructions'
        }, {
          key: 'generic',
          label: 'Generic'
        }, {
          key: 'bin',
          label: 'Bin'
        }, {
          key: 'sampleDateCreated',
          label: 'Sample Date Created'
        }, {
          key: 'pcnTitle',
          label: 'PCN Title'
        }, {
          key: 'ageRequest',
          label: 'Age Request'
        }, {
          key: 'partNiche',
          label: 'Part Niche'
        }, {
          key: 'partMpccFacility',
          label: 'Part MPCC Facility'
        }, {
          key: 'partSbe2',
          label: 'Part SBE 2'
        }, {
          key: 'ageFullfilled',
          label: 'Age Fullfilled'
        }, {
          key: 'cycletimeFullfilled',
          label: 'Cycletime Fullfilled'
        }, {
          key: 'deviceWwCustomerNumber',
          label: 'Device WW Customer number'
        }, {
          key: 'late',
          label: 'Late'
        }, {
          key: 'qaLotHold',
          label: 'QA Lot Hold'
        }, {
          key: 'qaLotRelease',
          label: 'QA Lot Release'
        }, {
          key: 'assyLtc',
          label: 'AssyLTC'
        }, {
          key: 'swrDieSap',
          label: 'SWR Die (SAP)'
        }, {
          key: 'lotNumberFab',
          label: 'Lot Number (Fab)'
        }, {
          key: 'swrWafer',
          label: 'SWR Wafer #'
        }, {
          key: 'deviceEndCustomerNumber',
          label: 'Device End Customer Number'
        }, {
          key: 'deviceEndCustomerName',
          label: 'Device End Customer Name'
        }, {
          key: 'pdc',
          label: 'PDC'
        }, {
          key: 'storageLocation',
          label: 'Storage Location'
        }
      ]
    });
  }

  render() { 
    let sysdate = moment().format('[Report generated on ] MMMM d, YYYY h:mm:ss [CST]')
    // let refreshDate = <div className='m-2 text-muted'>{sysdate} (<a href='#' onClick={_=> this.table.refresh()}>Refresh</a>)</div>
    return (      
          <React.Fragment>
            <ChangeLinkBreadcrumb crumbs={this.crumbs} />

            <ReactiveTableStore
                    credentials={'include'}
                    server
                    tableId="samplesBacklog_table"
                >        
              <ReactiveTable
              server
                ref={() => {}}
                striped columnFilters advancedColumns
                credentials={'include'}
                fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                fetchErrorHandler={FetchUtilities.handleError}
                row={ReportGridRow}            
                columns={this.state.columns}
                hiddenColumns={hiddenColumns}
                url={url}
              />
        </ReactiveTableStore>
          </React.Fragment>
    )
  }
})

class ReportGridRow extends React.Component {

  render() {
    const record = this.props.data    
    
    const cells = this.props.columns.map((column) => {
      const key = 'column-' + column.key;      
        return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
    })

    return <tr>{cells}</tr>
  }
}

