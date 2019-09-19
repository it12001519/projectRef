import React, { Component, } from 'react';
import { Jumbotron, Container } from 'reactstrap';
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';

import withLayout from 'js/app/models/withLayout';

class FatalError extends Component {

  render() {
    return (
      <div className={this.props.className}>
        <Jumbotron fluid>
          <Container fluid>
            <h1 className="display-3" style={{ color: '#CC0000' }}><FontAwesome name="exclamation-triangle" />{' '}System Error</h1>
            
            <p className="lead">
              System has encountered an error. <br />
              An email has been sent to notify the support group. <br />
              We apologize for any inconvenience.
            </p>

            <p>
              If you keep encountering this issue, please submit a ticket at help.ti.com. <br />
              File it under Manufacturing > Quality Apps > ChangeLink. <br />
              {/* TODO: Finalize this piece and add links where necessary */}
            </p>

            <Link to="/" className="btn btn-lg btn-primary"><FontAwesome name="home" />{' '}Take me back to the Home page</Link>
          </Container>
        </Jumbotron>

      </div>
    );
  }
}

export default withLayout(FatalError);
