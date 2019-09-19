import React from 'react';
import ReactiveTable, { ReactiveTableStore, } from 'reactive-tables';
import withLayout from 'js/app/models/withLayout';
import FetchUtilities from 'js/universal/FetchUtilities';
import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb';
import { GridActionCell, GridTextCell } from 'js/universal/GridCells';

// const URL = '/json/pcn/list.json'; // Mock data
const URL = '/api/v1/pcn/list'; // API live data

const COL_ACTIONS = 'actionColumn';
const COL_PCN_NUMBER = 'pcnNumber';

class PcnListPage extends React.Component {

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
        }, {
          key: 'pcnNumber',
          label: 'PCN Number'
        }, {
          key: 'title',
          label: 'Title'
        }, {
          key: "description",
          label: "Brief Title"
        }, {
          key: "pcnOwner",
          label: "PCN Owner"
        }, {
          key: "qualOwner",
          label: "Change Owner"
        }, {
          key: "businessOwner",
          label: "Business Owner"
        }, {
          key: "fromSite",
          label: "From Site"
        }, {
          key: "toSite",
          label: "To Site"
        }, {
          key: "status",
          label: "PCN Status"
        }, {
          key: "programManager",
          label: "Program Manager"
        }, {
          key: "affectedBusiness",
          label: "Affected Businesses"
        }, {
          key: "groupName",
          label: "PCN Group Name"
        }, {
          key: "dateClosed",
          label: "Date Closed"
        }, {
          key: "approvalEnabled",
          label: "Approval Enabled"
        }, {
          key: "coordinatorUserName",
          label: "PCN Coordinator"
        }, {
          key: "pcnType",
          label: "PCN Type"
        }, {
          key: "qdbRequired",
          label: "QDB Required"
        }, {
          key: "source",
          label: "PCN Source"
        }, {
          key: "projectName",
          label: "Project Name"
        }
      ],
      hiddenColumns: ["description"
      ]
    });
  }

  render() {
    return (
      <div>
        <ChangeLinkBreadcrumb crumbs={[
          { text: 'Home', to: "/" },
          { text: 'PCNs', active: true }
        ]} />
        <ReactiveTableStore
                    credentials={'include'}
                    server
                    tableId="pcnlist_table"
                >        
          <ReactiveTable
          server
            ref={() => {}}
            striped columnFilters advancedColumns
            credentials={'include'}
            fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
            fetchErrorHandler={FetchUtilities.handleError}
            row={PcnGridRow}            
            columns={this.state.columns}
            hiddenColumns={this.state.hiddenColumns}
            url={URL}
          />
        </ReactiveTableStore>
      </div>
    )
  }

}

class PcnGridRow extends React.Component {

  render() {
    const record = this.props.data
    const buttons = [
      { 'icon': 'eye', 'title': 'View', 'url': `/pcn/${record[COL_PCN_NUMBER]}` },
    ]
    
    const cells = this.props.columns.map((column) => {
      const key = 'column-' + column.key;
      if (column.key === COL_ACTIONS) {
        return <GridActionCell key={key} buttons={buttons} />
      } else {
        return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
      }
    })

    return <tr>{cells}</tr>
  }
}

export default withLayout(PcnListPage)
