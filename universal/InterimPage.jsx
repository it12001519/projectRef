import React from 'react';
import 'whatwg-fetch';
import { Link, } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';

import { Col, Jumbotron, Alert } from 'reactstrap';
import { PageHeader } from 'js/app/models/ChangelinkUI';
import Spinner from 'js/universal/spinner';

let InterimPcnPage = class extends React.Component {

  constructor(props) {
    super(props);
    let pcnNumber = !!this.props.match.params.pcnNumber ? this.props.match.params.pcnNumber : undefined;
    let type = !!this.props.match.params.type ? this.props.match.params.type : undefined;

    let typeResult = {}
    if (type === 'feedback') {
      typeResult.key = 'feedback'
      typeResult.header = 'Customer Feedback'
      typeResult.item = 'customer feedback'
    } else if (type === 'sample') {
      typeResult.key = 'sample'
      typeResult.header = 'Sample Request'
      typeResult.item = 'sample request'
    }

    this.state = {
      pcnNumber: pcnNumber,
      type: typeResult,
      helpUrl: undefined
    }
  }

  getConfigValues = () => {
    let fetchURL = '/api/v1/config/configuration/name/interim.pcn.help.url.' + this.state.type.key;

    // Fetch the config value
    fetch(fetchURL, {
      method: 'GET',
      credentials: 'include',
      headers: new Headers({
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      })
    })
      .then((response) => { return response.json() })
      .then((json) => { this.setState({ helpUrl: json.value }) })
      .catch((ex) => { throw ex });
  }

  componentDidMount() {
    // Fetch the config values
    this.getConfigValues();
  }

  render() {
    if (this.state.pcnNumber !== undefined && this.state.type.key !== undefined) {
      if (this.state.helpUrl !== undefined) {
        let linkClass = 'btn btn-primary btn-sm';
        return (
          <div className='mt-3'>
            <Col>
              <Jumbotron>
                <h1 className="display-3"><FontAwesome name="info-circle" /> {this.state.type.header}</h1>
                <p className="lead">
                  To create a {this.state.type.item}, please visit the Customer Approval Matrix in <Link to={`/pcn/${this.state.pcnNumber}/approval-matrix`}>ChangeLink</Link>.
                  <br />
                  <Link to={`/pcn/${this.state.pcnNumber}/approval-matrix`} className={linkClass}>Create {this.state.type.item} <FontAwesome name="arrow-right" /></Link>
                </p>
                <hr className="my-2" />
                <Alert color='warning' className="lead">
                  <FontAwesome name="question-circle" /> <b>Need help?</b> Please see instructions <a href={this.state.helpUrl}>here</a> on how to create a {this.state.type.item} in ChangeLink.
                </Alert>
              </Jumbotron>
            </Col>
          </div>
        )
      } else {
        return (
          <div><Spinner showSpinner={true} /></div>
        )
      }

    } else {
      return (
        <div><PageHeader>Page Not Found</PageHeader></div>
      )
    }
  }
};

export { InterimPcnPage, };
