import React, { Component, } from 'react';
import {
  Card, CardHeader, Button, Form, FormGroup, Label, Input, ListGroup, ListGroupItem,
} from 'reactstrap';
import Required from "js/universal/Required";
import FontAwesome from 'react-fontawesome';

const MOCK_DATA_EMAILS = [
  'ChangeLink Editorial Template',
  'ChangeLink In Progress',
  'ChangeLink Hold Reminder',
  'ChangeLink Bundled Email',
  'ChangeLink Rejected Email'
]
const MOCK_DATA_CMS = ['C00132552', 'C00132534', 'C00180052', 'C00100112', 'C00180501']

class Subscriptions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      emails: [],
      changes: []
    }

  }

  componentDidMount() {
    this.setState({
      emails: MOCK_DATA_EMAILS,
      changes: MOCK_DATA_CMS
    });
  }

  render() {
    // TODO: Put each section below into its own component (or better yet, a reusable component), then import it
    return (
      <div className={this.props.className}>
        {
          (this.state.emails === undefined || this.state.emails.length < 0) && 
          (this.state.changes === undefined || this.state.changes.length < 0)
            ? <p className='lead'>You have no subscriptions</p>
            : undefined
        }
        {
          !!this.state.emails && this.state.emails.length > 0
            ? (
              <Card className="mb-2">
                <CardHeader tag="h6">
                  My Email Subscriptions
                  <span className="pull-right">
                    <Button color="primary" className="mb-1 mr-1 "><FontAwesome name="save" />{' '}Save Changes</Button>
                    <Button color="secondary" outline className="mb-1 mr-1">Close</Button>
                  </span>
                </CardHeader>

                <ListGroup flush>
                  {
                    this.state.emails.map((item) => {
                      return (
                        <ListGroupItem>
                          <FormGroup check inline>
                            <Label check>
                              <Input type="checkbox" checked />{' '} {item}
                            </Label>
                          </FormGroup>
                        </ListGroupItem>
                      )
                    })
                  }
                </ListGroup>
              </Card>
            ) : undefined
        }

        {
          !!this.state.changes && this.state.changes.length > 0
            ? (
              <Card className="mb-2">
                <CardHeader tag="h6">
                  My Change Subscriptions
                  <span className="pull-right">
                    <Button color="primary" className="mb-1 mr-1 "><FontAwesome name="save" />{' '}Save Changes</Button>
                    <Button color="secondary" outline className="mb-1 mr-1">Close</Button>
                  </span>
                </CardHeader>

                <ListGroup flush>
                  {
                    this.state.changes.map((item) => {
                      return (
                        <ListGroupItem>
                          <FormGroup check inline>
                            <Label check>
                              <Input type="checkbox" checked />{' '} {item}
                            </Label>
                          </FormGroup>
                        </ListGroupItem>
                      )
                    })
                  }
                </ListGroup>
              </Card>
            ) : undefined
        }
      </div>
    )
  }
}


export default Subscriptions;