import React, { Component, } from 'react';
import { CardColumns, Card, CardHeader, CardBody, ListGroup } from 'reactstrap';
import styled from 'styled-components';
import PhaseActionItem from "js/app/views/change/PhaseActionItem";

class PhaseActions extends Component {

  constructor(props) {
    super(props);

    // Set the default state
    this.state = {
      data: props.data
    }
  }

  render() {
    return (
      <CardColumns className={this.props.className}>
        {
          this.state.data.map((subphase) => {
            return (
              <Card>
                <CardHeader tag="h6" className="subphase-header" style={{ 'backgroundColor': '#bcc5cd' }}>
                  <strong>{subphase.subphase}</strong>
                </CardHeader>
                <CardBody>
                  {
                    subphase.checklist.map((chklist) => {
                      return (
                        <Card>
                          <CardHeader tag="h6">
                            <strong>{chklist.role}</strong>
                          </CardHeader>
                          <ListGroup flush>
                            {
                              chklist.list.map((item) => {
                                return (
                                  <PhaseActionItem data={item} />
                                );
                              })
                            }
                          </ListGroup>
                        </Card>
                      );
                    })
                  }
                </CardBody>
              </Card>
            );
          })
        }
      </CardColumns>
    )
  }
}

export default styled(PhaseActions) `
  .subphase-header
  {
    background-color: '#bcc5cd';
  }
`;