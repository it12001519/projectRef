import React, { Component, } from 'react';
import ReactiveTable from 'reactive-tables';
import { GridTextCell, GridLinkCell, GridBadgeCell, GridActionCell } from 'js/universal/GridCells';
import { InfoAlert, HelpAlert, } from 'js/app/models/ChangelinkUI'

class GridTab extends Component {

  state = {
    columns: [],
    data: []
  }

  componentWillMount() {

    this.setState({
      columns: [
        {
          key: 'actions',
          label: ''
        }, {
          key: 'id',
          label: 'Record ID'
        }, {
          key: 'status',
          label: 'Status'
        }, {
          key: 'link',
          label: 'Change'
        }, {
          key: 'data1',
          label: 'Some Important Data'
        }, {
          key: 'data2',
          label: 'Another Data Point'
        },
      ]

    });

    let counter = 0;
    const statuses = ["N/A", "PENDING", "APPROVED", "NOT APPROVED"]

    this.setState({
      data: Array(10001).fill().map(() => {
        return {
          id: Math.round(2385 * Math.random()),
          status: statuses[counter++ % 4],
          link: "C" + (100000 + Math.round(99999 * Math.random())),
          data1: "Data point " + Math.round(256 * Math.random()),
          data2: "Another data point " + Math.round(256 * Math.random())
        }
      })
    })

  }

  render() {
    return (
      <div className={this.props.className}>

        <div className="clearfix" style={{ height: '1em' }} />
        <h5>Grid using ReactiveTable</h5>

        <InfoAlert leadText='Note:'
          message={<span>For more information about ReactiveTable, check out the code at <a href="https://bitbucket.itg.ti.com/projects/SCTMGDT/repos/reactive-tables/browse" className="alert-link" target="new">BitBucket</a>.</span>} />

        <HelpAlert leadText='Pro Tip!' 
          message={`Order actions in the grid by frequency of use. Here's a suggestion for most common actions: view, edit, others, delete`} />

        <ReactiveTable
          row={GridRow}
          striped columnFilters advancedColumns
          columns={this.state.columns}
          data={this.state.data}
        />

      </div>
    );
  }
}

class GridRow extends React.Component {

  render() {
    const buttons = [
      { 'icon': 'eye', 'title': 'View' },
      { 'icon': 'pencil', 'title': 'Edit' },
      { 'icon': 'download', 'title': 'Download' },
      { 'icon': 'trash', 'title': 'Delete' }
    ];
    const colorMapping = {
      'N/A': 'secondary',
      'APPROVED': 'success',
      'NOT APPROVED': 'danger',
      'PENDING': 'warning'
    }
    const record = this.props.data;
    const cells = this.props.columns.map((column) => {
      const key = 'column-' + column.key;
      if (column.key === 'actions') {
        return <GridActionCell key={key} buttons={buttons} />
      } else if (column.key === 'link') {
        return <GridLinkCell key={key} url='#' external>{record[column.key]}</GridLinkCell>
      } else if (column.key === 'status') {
        return <GridBadgeCell key={key} data={record[column.key]} colorMapping={colorMapping} />
      } else {
        return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
      }
    });

    return (
      <tr>{cells}</tr>
    );
  }
}

export default GridTab;