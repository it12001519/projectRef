import React, { Component, } from 'react';

import ReactiveTable, {ReactiveTableStore} from 'reactive-tables';
import FetchUtilities from 'js/universal/FetchUtilities';

import { GridTextCell, GridActionCell } from 'js/universal/GridCells';

const TABLE_COLUMNS= [
  {
      key: 'link-redirect',
      label: ''
  },{
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
const URL = "/api/v1/dashboard_data/changes";

class ChangesTab extends Component {
  render() {
    return (
        <ReactiveTableStore server credentials={'include'} tableId="my_changes_table">
            <ReactiveTable server
            ref={()=>{}}
            credentials={'include'}
            fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
            fetchErrorHandler={FetchUtilities.handleError}
            striped columnFilters advancedColumns
            columns={TABLE_COLUMNS}
            url={URL}
            row={MyChangesRow}
            />
        </ReactiveTableStore>
    )
  }
}

class MyChangesRow extends React.Component{
  constructor(props){
      super(props);
      this.state = {
          link: null
      }
  }

  componentDidMount(){
    fetch("/api/v1/chg-mgmt-link", {
        credentials: 'include', headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            })
      })
      .then(FetchUtilities.checkStatusWithSecurity)
      .then((response) => {
          return response.json();
      })
      .then((json) => {
          this.setState({ link: json });
      })
      .catch((ex) => {
          FetchUtilities.handleError(ex);
          throw ex;
      });
  }
  
  render() {
    const record = this.props.data
    let externalUrl = "#";
    if(this.state.link !== null){
        externalUrl = this.state.link.content.chg_link + record['changeNumber'];
    }
    const cells = this.props.columns.map((column) => {
        const key = 'column-' + column.key;
        const buttons = [{ 'icon': 'eye', 'title': 'View', 'url': "/change/" + record['changeNumber'] },
                         { 'icon': 'link', 'title': 'View', 'url': externalUrl, 'external': true }];

        if (column.key === 'link-redirect') {
            return <GridActionCell key={key} buttons={buttons} />
        } else {
            return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
        }
    })

    return (
        <tr>{cells}</tr>
    )
  }

}

export default ChangesTab;