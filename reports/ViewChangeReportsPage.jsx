import React, { Component } from 'react'
import withLayout from 'js/app/models/withLayout'
import { PageHeader } from 'js/app/models/ChangelinkUI'
import { Table, Button, Nav, NavItem, NavLink,
    TabContent, TabPane } from 'reactstrap'
import FetchUtilities from 'js/universal/FetchUtilities'
import ReactiveTable, { ReactiveTableStore } from 'reactive-tables'
import queryString from 'query-string'
import { GridLinkCell, GridTextCell } from 'js/universal/GridCells';
import { Redirect } from "react-router-dom"
import withLink from 'js/app/models/withLink';
import classnames from 'classnames';
import { Link } from 'react-router-dom'

const REPORT_URL = '/api/v1/change/reports'
const URL = '/api/v1/change/reports/fetch'
let RouterNavLink = withLink(NavLink);
class ViewChangeReportsPage extends React.Component {
    state = {
        data: this.props.location.state.data,
        reportName: this.props.location.state.report,
        reportSlug: this.props.location.state.reportSlug,
        columns: '',
        activeTab: 'matrix',
        changeParam: this.props.location.state.changeParam || null
    }

    componentDidMount() {
        this.getColumns();
    }

    componentDidUpdate(prevProps) {
        if(this.state.reportSlug !== 'report-device-overlap') {
            if(prevProps.location.key !== this.props.location.key) {
                window.location = window.location
            }
        }
    }

    getColumns = () => {
        if( this.state.reportSlug !== 'report-device-overlap' && this.state.reportSlug !== 'metric-changes-type' && this.state.reportSlug !== 'metric-changes-state' && this.state.reportSlug !== 'metric-cycle-time') {
        FetchUtilities.fetchGet(REPORT_URL + '/columns/' + this.state.reportSlug, 
            (httpStatus, response) => {
                this.setState({
                    columns: response
                });
            })
        } else if (this.state.reportSlug == 'metric-changes-type' || this.state.reportSlug == 'metric-changes-state' || this.state.reportSlug === 'metric-cycle-time') {
            FetchUtilities.fetchGet(REPORT_URL + '/dynamic/' + this.state.reportSlug + '/?' + queryString.stringify(this.state.data), 
            (httpStatus, response) => {
                this.setState({
                    columns: response
                });
            })
        } else {
            FetchUtilities.fetchGet(REPORT_URL + '/overlap/' + this.state.reportSlug  + '/matrix/' + '?' + queryString.stringify(this.state.data), 
            (httpStatus, response) => {
                this.setState({
                    columns: response
                });
            })

            FetchUtilities.fetchGet(REPORT_URL + '/overlap/' + this.state.reportSlug  + '/list/' + '?' + queryString.stringify(this.state.data), 
            (httpStatus, response) => {
                this.setState({
                    listColumns: response
                });
            })
        }
    }

    routeChange = () => {
        let path = '/reports'
        this.setState({
            referrer: path
        })
    }

    handleTabToggle = (tab) => {
        
      if (this.state.activeTab !== tab) {
        this.setState({
          activeTab: tab
        }, () => this.getColumns());
      }
    }
    
    render() {
        let tab = !!this.props.match.params.tab ? this.props.match.params.tab : 'matrix';
        const { referrer } = this.state
        if (referrer ) return <Redirect to={{ pathname: referrer}}/>
        let customTopBar = (
            <Button className="mr-1 mb-1" size="sm" color="primary" style={{ marginTop: '0.2rem', marginLeft: '0.2rem' }} onClick={this.routeChange}><span aria-hidden="true" className="fa fa-retweet"></span> Generate New Report </Button>
        )
        let row = (props) => {return (<ReportGridRow {...props} info={this.state.data} />)}
        
        return <React.Fragment>
            <PageHeader>
                {this.state.reportName} Report 
                {this.state.reportSlug === 'report-view-change-drilldown' ?
                    <React.Fragment> : {this.state.data[0]} - {this.state.data[2]}</React.Fragment> : undefined
                }
            </PageHeader>
            {this.state.reportSlug != 'report-view-change-drilldown' ?
                <Table bordered size="sm" striped hover>     
                    <tr>
                        <th colspan="2"> Selected Parameters </th>
                    </tr>
                    <tbody>
                        {Object.entries(this.state.data).map(([key, value]) => {
                            return (                    
                                <React.Fragment>
                                    <tr>
                                        <td><b> {key} </b></td>
                                        <td> {Array.isArray(value) ? value.join(",") : value} </td>
                                    </tr>
                            </React.Fragment>)
                        })}
                    </tbody>
                </Table>
        : undefined}

        {this.state.reportSlug !== 'report-device-overlap' ? (
            this.state.columns ? <ReactiveTable server
                credentials={'include'}
                url={URL + '/' + this.state.reportSlug + '/?' + queryString.stringify(this.state.data)}
                row={row}
                columns={this.state.columns}
                fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                fetchErrorHandler={FetchUtilities.handleError}
                ref={(table) => this.table = table}
                customTopBar={customTopBar}
            striped columnFilters advancedColumns /> : undefined
        ) : (
            <React.Fragment>
                <Nav tabs className="chg-horizontal-tabs">
                    <NavItem>
                        <RouterNavLink
                        className={classnames({ active: tab === 'matrix' })}
                        href='/view/report/matrix'>
                        Matrix View
                        </RouterNavLink>
                    </NavItem>
                    <NavItem>
                        <RouterNavLink
                        className={classnames({ active: tab === 'list' })}
                        href='/view/report/list'>
                        List View
                        </RouterNavLink>
                    </NavItem>
                    </Nav>

                    {/* TabContent */}
                    <TabContent activeTab={tab}>
                    <TabPane tabId="matrix">
                    {this.state.columns ? 
                        <ReactiveTable server
                            credentials={'include'}
                            url={URL + '/overlap/' + this.state.reportSlug + '/matrix' +'/?' + queryString.stringify(this.state.data)}
                            row={row}
                            columns={this.state.columns}
                            fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                            fetchErrorHandler={FetchUtilities.handleError}
                            ref={(table) => this.table = table}
                            customTopBar={customTopBar}
                            striped columnFilters advancedColumns /> : undefined}
                    </TabPane>
                    <TabPane tabId="list">
                    {this.state.listColumns ?
                    <ReactiveTable server
                            credentials={'include'}
                            url={URL + '/overlap/' + this.state.reportSlug + '/list' +'/?' + queryString.stringify(this.state.data)}
                            row={row}
                            columns={this.state.listColumns}
                            fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                            fetchErrorHandler={FetchUtilities.handleError}
                            ref={(table) => this.table = table}
                            customTopBar={customTopBar}
                    striped columnFilters advancedColumns /> : undefined}
                    </TabPane>
                    </TabContent>
            </React.Fragment>
            )
        }
        </React.Fragment>
    }
}

class ReportGridRow extends React.Component {
    render() {
        const record = this.props.data
        const details = this.props.info
        const cells = this.props.columns.map((column) => {
            const key = 'column-' + column.key;
            let info = [column.label, 
                        record.changeState === null || record.changeState === undefined ? 'CHANGE_TYPE' : 'CHANGE_STATE',
                        record.changeState === null  || record.changeState === undefined ? record.changeType : record.changeState,
                        details.MCCB,
                        details.PERIOD_TYPE]
            if(column.key === 'changeNo') {
                return <GridLinkCell key={key} url={`/change/${record[column.key]}`}>{record[column.key]}</GridLinkCell>
            } else if(column.key === 'deviceList') {
                return <GridLinkCell key={key} url={`/change/${record['CHANGE_NO']}/devices`}> Device List </GridLinkCell>
            } else if(column.key === 'pcnNumber') {
                return <GridLinkCell key={key} url={`/pcn/${record[column.key]}`}>{record[column.key]}</GridLinkCell>
            } else if(column.key.includes("TC") || column.key.includes("total") || column.key.includes("major") || column.key.includes("minor") || column.key.includes("informational")) {
                console.log("record[column.key]", record[column.key] === '0')
                if(record[column.key] === 0 || record[column.key] === '0') {
                    return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
                } else {
                    return <GridTextCell key={key}>
                            <Link to={{pathname: `/view/report`, 
                                    target:"_blank",
                                    state: {period: column.label, 
                                            details: details,
                                            record: record,
                                            data: info,
                                            report: 'Metric Report Drilldown',
                                            reportSlug: 'report-view-change-drilldown',
                                            changeParam: record.CHANGE_STATE === null ? record.CHANGE_TYPE : record.CHANGE_STATE,
                                        }}}>{record[column.key]}
                            </Link>
                        </GridTextCell>
                }
            } else {
                return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
            }
        })
        return <tr>{cells}</tr>
    }
}

export default withLayout(ViewChangeReportsPage)