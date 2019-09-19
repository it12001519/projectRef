import React, { Component, } from 'react';
import { Container, Row, Button, Card, CardBody, Nav, NavItem, NavLink, TabContent, TabPane, Table } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import classnames from 'classnames';
import styled from 'styled-components';
import 'whatwg-fetch';
import { fetchGet } from 'js/universal/FetchUtilities';

import { PageHeader, BigBadge, } from 'js/app/models/ChangelinkUI'
import PhaseActions from "js/app/views/change/PhaseActions";

// Mock data - using static json file in /public/json
//const URL = "/json/change/phase-1.json";
const URL = "/api/v1/change/{1}/phases";

class PhasesTab extends Component {

  state = {
    data: [],
    phase: [],
    dashboardVisibility: true,
    activeTab: 'actions'
  }

  toggleDashboard = () => {
    this.setState({
      dashboardVisibility: !this.state.dashboardVisibility
    })
  }

  displayPhase = () => {
    this.toggleDashboard()
  }

  toggleTab = (tab) => {
    if (this.state.activeTab !== tab)
      this.setState({ activeTab: tab })
  }

  componentDidMount() {
    // Fetch the latest set of data
    fetchGet(URL.replace('{1}', this.props.changeNumber),
      (status, response) => {
        this.setState({ data: response })
      })
  }

  render() {
    return (
      <div className={this.props.className}>
        {
          this.state.dashboardVisibility ? (
            <div>
              <PageHeader>
                Phase Review Dashboard for {this.props.changeNumber}
              </PageHeader>

              <Table bordered responsive hover>
                <thead>
                  <tr>
                    <th>CCB</th>
                    <th>Product Group</th>
                    <th>Phase 1<br />Define Change</th>
                    <th>Phase 2<br />Qualification</th>
                    <th>Phase 3<br />Qual Execution</th>
                    <th>Phase 4<br />PCN Notification</th>
                    <th>Phase 5<br />Customer Approval</th>
                    <th>Phase 6<br />Implementation</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    this.state.data.map((changePhaseRow, i) => {
                      return (
                        <tr key={`phase-${i}`}>
                          <th>{changePhaseRow.mccb}</th>
                          <td>{changePhaseRow.productGroup}</td>

                          {
                            changePhaseRow.phaseStatusList.map((phase, j) => {
                              let phaseColor = 'secondary';
                              let phaseCaps = phase.toUpperCase();
                              phaseColor = (phaseCaps === 'APPROVED' || phaseCaps === 'COMPLETE' || phaseCaps === 'CLOSED') ? 'success' : phaseColor;
                              phaseColor = (phaseCaps === 'HOLD' || phaseCaps === 'SUBMITTED TO PCN' || phaseCaps === 'SUBMITTED') ? 'warning' : phaseColor;
                              phaseColor = (phaseCaps === 'NOT APPROVED' || phaseCaps === 'REJECTED') ? 'danger' : phaseColor;
                              phaseColor = (phaseCaps === 'DEFINITION' || phaseCaps === 'MODIFIED' || phaseCaps === 'NOTIFIED') ? 'info' : phaseColor;
                              phaseColor = (phaseCaps === 'REVIEWED') ? 'primary' : phaseColor;
                              return (
                                <td key={`phase-${i}-${j}`}>
                                  <BigBadge className="phase-badge" color={phaseColor}
                                  //onClick={this.displayPhase}
                                  >{phase}</BigBadge>
                                </td>
                              );
                            })
                          }
                        </tr>
                      );
                    })
                  }
                </tbody>
              </Table>
            </div>
          ) : (
              <div>
                <h5>
                  <Button outline size="sm" color="secondary" onClick={this.toggleDashboard}><FontAwesome name="angle-double-left" /> &nbsp; Back</Button>
                  &nbsp; Phase 1 - Define Change
                                </h5>

                <Card>
                  <CardBody>
                    <Nav tabs id="phase-tabs">
                      <NavItem>
                        <NavLink
                          className={classnames({ active: this.state.activeTab === 'actions' })}
                          onClick={() => { this.toggleTab('actions'); }}>
                          Actions
                                                </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames({ active: this.state.activeTab === 'signoffs' })}
                          onClick={() => { this.toggleTab('signoffs'); }}>
                          Signoffs
                                                </NavLink>
                      </NavItem>
                    </Nav>
                    <TabContent activeTab={this.state.activeTab}>
                      <TabPane tabId="actions">
                        <Container fluid>
                          <PhaseActions data={this.state.phase.data} changeNumber={this.props.changeNumber} />
                        </Container>
                      </TabPane>
                      <TabPane tabId="signoffs">
                        <Container fluid>
                          <Row>
                            <Table bordered responsive hover>
                              <thead>
                                <tr>
                                  <th>Approver</th>
                                  <th>Status</th>
                                  <th>Date Approved</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>John Smith</td>
                                  <td>Pending</td>
                                  <td></td>
                                </tr>
                                <tr>
                                  <td>Jane Doe</td>
                                  <td>Approved</td>
                                  <td>2018-03-15</td>
                                </tr>
                              </tbody>
                            </Table>
                          </Row>
                        </Container>
                      </TabPane>
                    </TabContent>
                  </CardBody>
                </Card>
              </div>
            )
        }
      </div>
    )
  }
}

export default styled(PhasesTab) `
  #phase-tabs
  {
    padding-left: 1rem;
    padding-right: 1rem;
    margin-left: -15px;
    margin-right: -15px;
    margin-bottom: 15px;
  
    > li > a
    {
      padding: .5rem .75rem;
      font-size: 14px;
      cursor: pointer;
      &.active
      {
        cursor: default;
      }
    }
  } 
  .phase-badge
  {
    cursor: pointer;
  }
`;