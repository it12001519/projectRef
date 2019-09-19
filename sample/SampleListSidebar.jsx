import React from 'react';
import { Card, Input, ListGroup, ListGroupItem, } from 'reactstrap';
import styled from 'styled-components';
import 'whatwg-fetch';
import FetchUtilities from 'js/universal/FetchUtilities';

import Spinner from 'js/universal/spinner';

const URL_FETCH_SAMPLES = '/api/v1/trksample/list/status-number'; // API live data
// const URL_FETCH_SAMPLES = '/json/samples/list-samples.json'; // Mock data

let headers = new Headers({
  'Pragma': 'no-cache',
  'Cache-Control': 'no-cache'
})

class SampleListSidebar extends React.Component {

  static defaultProps = {
    active: undefined,
    status: '',
    coordinator: ''
  }

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      searchTerm: ''
    }

    this.loadSampleList = this.loadSampleList.bind(this);
    this.onSelectSample = this.onSelectSample.bind(this);
    this.onSearch = this.onSearch.bind(this);
  }

  loadSampleList(status, coordinator) {
    fetch(`${URL_FETCH_SAMPLES}?s=${status}&c=${coordinator}`, { credentials: 'include', headers: headers })
      .then(FetchUtilities.checkStatusWithSecurity)
      .then((response) => { return response.json() })
      .then((json) => { this.setState({ data: json, searchTerm: '', isLoading: false }) })
      .catch((ex) => { this.setState({ data: [], searchTerm: '', isLoading: false }); throw ex });
  }

  onSelectSample(sample) {
    this.setState({ active: sample });
    if (typeof this.props.onSelectCallback === 'function') {
      this.props.onSelectCallback(sample)
    }
  }

  onSearch(e) {
    let term = e.target.value 
    this.setState({ searchTerm: term })
  }

  componentDidMount() {
    this.setState({ active: this.props.active })
    this.loadSampleList(this.props.status, this.props.coordinator) // Load all samples
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.status !== nextProps.status) {
      this.setState({ isLoading: true })
      this.loadSampleList(nextProps.status, nextProps.coordinator) // Update samples list      
    }
    this.setState({ active: nextProps.active })
  }

  render() {
    if (!this.state.isLoading) {
      return (
        <div className={this.props.className}>
          <p><strong>
            Samples
            {
              this.props.status
                ? <span>[{this.props.status}]</span>
                : undefined
            }
          </strong></p>
          <Input placeholder="Filter list..." className='mb-1' value={this.state.searchTerm} onChange={this.onSearch} />
          <Card body className='p-2'>
            <ListGroup flush>
              {
                !!this.state.data
                  ? this.state.data.length > 0
                    ? this.state.data.map((sample, index) => {
                      let isActive = this.state.active === sample;
                      let term = this.state.searchTerm.trim().toUpperCase()
                        return (
                          term === '' || sample.toUpperCase().indexOf(term) > -1
                          ? <ListGroupItem key={`sampleListSidebar-item${index}`}
                            active={isActive} tag="a" href="#" action
                            onClick={() => this.onSelectSample(sample)}>{sample}</ListGroupItem>
                          : undefined
                        )                      
                    }) : <p className='text-muted'>No records found</p>
                  : undefined
              }
            </ListGroup>
          </Card>
        </div>
      )
    } else {
      return (
        <div className={this.props.className}>
          <p><strong>Samples</strong></p>
          <Card body className='p-2' style={{ height: '5rem' }}>
            <Spinner showSpinner overlay={false} />
          </Card>
        </div>
      )
    }
  }

}

export default styled(SampleListSidebar) `

> p
{
  margin-bottom: .5rem;
}
> div
{
  max-height: calc(100vh - 82px);
  overflow-y: auto;
}

.list-group-item
{
  padding: 0.5rem .1rem;
}
`
