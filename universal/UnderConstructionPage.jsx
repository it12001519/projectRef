import React, { Component, } from 'react';
import { Jumbotron, Container } from 'reactstrap';
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';
import withLayout from 'js/app/models/withLayout';

class UnderConstructionPage extends Component {

  render() {
    return (
      <div className={this.props.className}>
        <Jumbotron fluid>
          <Container fluid>
            <h1 className="display-3"><FontAwesome name="wrench" />{' '}Under Construction</h1>
            
            <p className="lead">
              We are still working on this feature. Watch for the next release! 
            </p>

            {/* <p><img src="https://media.tenor.com/images/2452b33f0b233d0e8b174014927f50b4/tenor.gif" /></p> */}

            <Link to="/" className="btn btn-lg btn-primary"><FontAwesome name="home" />{' '}Take me to the Home page</Link>
          </Container>
        </Jumbotron>

      </div>
    );
  }
}

export default withLayout(UnderConstructionPage);
