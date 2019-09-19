import React from 'react'
import { Container, Row, Col, Form, FormGroup, Input, } from 'reactstrap'
import withLayout from 'js/app/models/withLayout'
import 'whatwg-fetch'
import queryString from 'query-string'
import FetchUtilities from 'js/universal/FetchUtilities'
import { isNullOrBlank, } from 'js/universal/commons'

import Spinner, { showOverlaySpinner, hideOverlaySpinner, } from 'js/universal/spinner'
import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb'
import SearchBox from 'js/app/models/SearchBox'
import TreeSidebar from 'js/app/models/TreeSidebar'
import SampleListSidebar from './SampleListSidebar'
import SampleFormWizard from './SampleFormWizard'
import { createModal, infoModal, errorModal } from 'js/universal/Modals'

// API live data
const URL_FETCH_COORDINATORS = '/api/v1/trksample/list/coordinators' 
const URL_FETCH_STATUSTREE = '/api/v1/trksample/list/status-tree'
const URL_SEARCH = '/api/v1/trksample/findByNumber'

// Mock static data
// const URL_FETCH_COORDINATORS = '/json/samples/list-coordinators.json'
// const URL_FETCH_STATUSTREE = '/json/samples/tree-status.json'
// const URL_SEARCH = '/json/samples/mock-sample.json'
// const MOCK_STATUS = 'Orders / Waiting PO'
// const MOCK_SAMPLE_ID = '20051117000SRF0007'

let headers = new Headers({
  'Pragma': 'no-cache',
  'Cache-Control': 'no-cache'
})

class SampleDashboard extends React.Component {

  constructor(props) {
    super(props);

    const parsedQuery = queryString.parse(this.props.location.search);
    let srf = parsedQuery.srf;
    this.state = {
      statusTree: [],
      status: '',
      searchTerm: !!srf && srf !== '' ? srf : undefined
    }

    this.loadStatus = this.loadStatus.bind(this);
    this.onSelectCoordinator = this.onSelectCoordinator.bind(this);
    this.onSelectStatus = this.onSelectStatus.bind(this);
    this.onSelectSample = this.onSelectSample.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.notify = this.notify.bind(this);
    this.refreshPage = this.refreshPage.bind(this);

    // Search for SRF, when already given
    if (!!srf && srf !== '')
      this.onSearch(srf)
  }

  componentDidMount() {
    // Fetch the list of coordinators
    fetch(URL_FETCH_COORDINATORS, { credentials: 'include', headers: headers })
      .then(FetchUtilities.checkStatusWithSecurity)
      .then((response) => { return response.json() })
      .then((json) => { this.setState({ coordinatorList: json, coordinator: '' }) })
      .catch((ex) => { throw ex })
    this.loadStatus('')
  }

  loadStatus(coordinator) {
    fetch(`${URL_FETCH_STATUSTREE}?c=${coordinator}`, { credentials: 'include', headers: headers })
      .then(FetchUtilities.checkStatusWithSecurity)
      .then((response) => { return response.json() })
      .then((json) => {
        let mylist = []
        for (let i = 0; i < json.length; i++) {
          mylist.push(json[i].label)
        }
        this.setState({ statusTree: json, statusList: mylist })
      })
      .catch((ex) => { throw ex });
  }

  onSelectCoordinator(event) {
    let coordinator = event.target.value;
    this.setState({
      coordinator: coordinator,
      statusTree: undefined,
      status: '',
      active: undefined
    });
    // Refetch the data values for the rest of the page
    this.loadStatus(coordinator);
  }

  onSelectStatus(status) {
    this.setState({
      status: status,
      active: undefined
    })
  }

  onSelectSample(sample) {
    if (this.state.status === undefined || this.state.status === null || this.state.status === '') {
      // If status isn't selected yet, fetch the status based on selected sample
      fetch(`${URL_SEARCH}/${sample}`, { credentials: 'include', headers: headers })
      .then((response) => { return response.json() })
      .then((json) => { 
        this.setState({ 
          active: sample,
          status: json.trkSample.status 
        }) 
      })
      .catch((ex) => { throw ex });
    } else {
      this.setState({ 
        active: sample
      }) 
    }
  }

  onSearch(value) {
    let sample = value.trim().toUpperCase()
    if (sample !== '') {
      showOverlaySpinner()
      FetchUtilities.fetchGet(`${URL_SEARCH}/${sample}`,
        (httpStatus, response) => {
          if ( isNullOrBlank(response.trkSample)
            || isNullOrBlank(response.trkSample.sampleNumber)
            || isNullOrBlank(response.trkSample.status)) {
            this.notify('warning', `Sample Number ${sample} not found`)
          } else {
            this.setState({ active: response.trkSample.sampleNumber, status: response.trkSample.status, coordinator: '' })
          }
          hideOverlaySpinner()
        }, _=> hideOverlaySpinner()
      )
    } else {
      this.notify('info', 'Please enter a sample number')
    }
  }

  notify(alertType, alertMessage) {
    if (alertType !== undefined) {
      if (alertType === 'warning') {
        createModal({ color: 'warning', icon: 'exclamation-circle', title: 'Alert', message: alertMessage })
      } else if (alertType === 'error') {
        errorModal(alertMessage)
      } else {
        infoModal(alertMessage)
      }
    }
  }

  refreshPage() {
    this.loadStatus('')
    // Search for SRF, when already given
    if (!!this.state.active)
      this.onSearch(this.state.active)
  }

  render() {
    const { ...other } = this.props;

    let crumbs = [
      { text: 'Home', to: "/" },
      { text: 'Admin', active: true },
      { text: 'Sample Coordinator Dashboard', active: true }
    ]

    if (this.state !== undefined && this.state !== null) {
      
      return (
        <Container fluid>
          <Row className='mb-1'>
            <Col>
              <ChangeLinkBreadcrumb className="pull-left" crumbs={crumbs} />
              <Form inline className="pull-right">
                <FormGroup className="mb-1 mr-1">
                  <Input type="select" name="selSampleCoordinator" id="selSampleCoordinator"
                    value={this.state.coordinator} onChange={this.onSelectCoordinator}>
                    <option value=''>All Sample Coordinators</option>
                    {
                      !!this.state.coordinatorList
                        ? this.state.coordinatorList.map((option, index) => {
                          let i = option.lastIndexOf("(") + 1;
                          let badge = option.substring(i, i + 8);
                          return <option key={`selSampleCoordinator-opt${index}`} value={badge}>{option}</option>
                        }) : undefined
                    }
                  </Input>
                </FormGroup>
                <FormGroup className="mb-1 mr-1">
                  <SearchBox label='SRF' placeholder='Search for an SRF' value={this.state.searchTerm} onSubmit={this.onSearch} clearAfterSearch />
                </FormGroup>
              </Form>
            </Col>
          </Row>
          <Row>
            <Col xs={12} sm={6} md={3} lg={2}>
              <TreeSidebar title='Status' data={this.state.statusTree} active={this.state.status} expandAll
                onClickCallback={this.onSelectStatus} />
            </Col>
            <Col xs={12} sm={6} md={3} lg={2}>
              <SampleListSidebar status={this.state.status} coordinator={this.state.coordinator} active={this.state.active}
                onSelectCallback={this.onSelectSample} />
            </Col>
            <Col sm={12} md={6} lg={8}>
              <SampleFormWizard { ...other } sample={this.state.active} 
                statusList={this.state.statusList} coordinatorList={this.state.coordinatorList} 
                notify={this.notify} refreshPage={this.refreshPage} />
            </Col>
          </Row>

        </Container>
      )
    } else {
      return (
        <Container fluid>
          <Col sm={12}>
            <ChangeLinkBreadcrumb crumbs={crumbs} />
            <Spinner showSpinner />
          </Col>
        </Container>
      )
    }
  }

}

export default withLayout(SampleDashboard)
