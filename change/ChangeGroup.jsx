import React, { Component, } from 'react';
import { Badge, Card, CardBody, Form, CustomInput, ListGroup, ListGroupItem, Row, Col } from 'reactstrap';
import styled from 'styled-components';

class ChangeGroup extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      activeTab: 0
    }

    // Bind functions
    this.handleTabToggle = this.handleTabToggle.bind(this);
  }

  // Handler for tab toggle
  handleTabToggle(event, tab) {
    event.preventDefault();
    this.setState({
      activeTab: tab
    });
  }

  render() {
    let activeTab = this.state.activeTab;
    return (
      <Row className={this.props.className}>
        <Col xs={12}>
          <h4>Change Groups</h4>
        </Col>
        <Col sm={4} md={3} lg={2}>
          <ListGroup>
            {
              this.state.data.map((change, i) => {
                return (
                  activeTab === i ? (
                    <ListGroupItem key={`chggrp-tab${i}`} tag="a" href="#" action active>
                      {change.groupName} <Badge color="light" pill>{change.checked}</Badge>
                    </ListGroupItem>
                  ) : (
                    <ListGroupItem key={`chggrp-tab${i}`} tag="a" href="#" action onClick={(event) => this.handleTabToggle(event, i)}>
                      {change.groupName} <Badge color="dark" pill>{change.checked}</Badge>
                    </ListGroupItem>
                  )
                );
              })
            }
          </ListGroup>
        </Col>
        <Col>
          <Card>
            <CardBody>
              {
                this.state.data[activeTab].typeList.map((group, j) => {
                  return (
                    <CustomInput type="checkbox" name="chg-group-item" key={'chg-group-item-'+j} id={'chg-group-item-'+j} label={group} />
                  );
                })
              }
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }
}

export default styled(ChangeGroup)`
`;
