import React from 'react';
import { Nav, NavItem, NavLink, TabContent, TabPane, Card, Button } from 'reactstrap';
import classnames from 'classnames';
import 'whatwg-fetch';
import FetchUtilities from 'js/universal/FetchUtilities';

import SummaryCard from 'js/app/models/SummaryCard';
import Spinner from 'js/universal/spinner';
import { ComponentModal, } from 'js/universal/Modals';
import { FormWidgetSelect, FormWidgetStatic } from 'js/universal/FormFieldWidgets'
import SampleForm from './SampleForm';
import SwrForm from 'js/app/views/swr/SWRForm';
import { BadAlert } from'js/app/models/ChangelinkUI';

const STATUS_URL = '/api/v1/trksample/findByNumber';
const URL_FETCH_SUMMARY = '/api/v1/trksample/dashboard/summary';

const ADMIN_ROLES = ['System Admin', 'Sample Coordinator'];

let headers = new Headers({
  'Pragma': 'no-cache',
  'Cache-Control': 'no-cache'
})

class SampleFormWizard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      sampleNumber: null,
      coordinator: null,
      coordinatorList: [],
      isLoading: true,
      showSampleCoordinatorModal: false,
      canUpdate: props.hasRole(ADMIN_ROLES)
    }

    this.loadSummary = this.loadSummary.bind(this);
    this.loadState = this.loadState.bind(this);
    this.refreshForm = this.refreshForm.bind(this);
    this.toggleTab = this.toggleTab.bind(this);
    this.modalSampleCoordinator = this.modalSampleCoordinator.bind(this);
    this.attachSwr = this.attachSwr.bind(this);
  }

  loadState(sample) {
    if (sample !== undefined) {
      fetch(`${STATUS_URL}/${sample}`, { credentials: 'include', headers: headers })
        .then((response) => { return response.json() })
        .then((json) => {
          this.setState({
            activeTab: json.trkSample.status,
            coordinator: json.trkSample.coordinatorName
          })
        })
        .catch((ex) => { throw ex });
    }
  }

  loadSummary(sample) {
    if (sample !== undefined) {
      let URL = `${URL_FETCH_SUMMARY}/${sample}`; // Live API data
      // let URL = '/json/samples/mock-summary.json'; // Mock data

      fetch(URL, { credentials: 'include', headers: headers })
        .then(FetchUtilities.checkStatusWithSecurity)
        .then((response) => { return response.json() })
        .then((json) => {
          this.setState({ summary: json, isLoading: false })
        })
        .catch((ex) => { throw ex });
    }
  }

  modalSampleCoordinator() {
    this.setState({ showSampleCoordinatorModal: !this.state.showSampleCoordinatorModal });
  }

  changeSampleCoordinator(sampleCoordinator) {
    let i = sampleCoordinator.lastIndexOf("(") + 1;
    let badge = sampleCoordinator.substring(i, i + 8);

    if (badge !== undefined && badge !== null && badge !== '') {
      this.setState({ isLoading: true })
      fetch(`/api/v1/trksample/dashboard/s/${this.state.sampleNumber}/updateCoordinator/${badge}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: new Headers({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
          }),
        })
        .then(FetchUtilities.checkStatusWithSecurity)
        .then((response) => {
          if (response.status >= 200 && response.status < 300) {
            this.loadState(this.state.sampleNumber);
            this.loadSummary(this.state.sampleNumber);
            this.modalSampleCoordinator();
          } else {
            return response.json()
          }
        })
        .then((json) => {
          if (!!json && !!json.message) {
            this.setState({ isLoading: false, showSampleCoordinatorModal: !this.state.showSampleCoordinatorModal });
            this.props.notify('error', json.message);
          }
        })
        .catch((error) => {
          this.setState({ isLoading: false, showSampleCoordinatorModal: !this.state.showSampleCoordinatorModal });
          this.props.notify('error', error.message);
        });
    } else {
      this.props.notify('warning', 'Please select a sample coordinator');
    }
  }

  attachSwr(data) {
    this.setState({ isLoading: true })
    fetch(`/api/v1/swr/upsert/with-sample/${this.state.sampleNumber}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
        credentials: 'include',
        headers: new Headers({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }),
      })
      .then(FetchUtilities.checkStatusWithSecurity)
      .then((response) => {
        this.loadSummary(this.state.sampleNumber);
      })
      .catch((error) => {
        this.setState({ isLoading: false })
        this.handleError(error);
      });
  }

  componentDidMount() {
    this.setState({ isLoading: true, tabs: this.props.statusList, })
    this.loadState(this.props.sample);
    this.loadSummary(this.props.sample);

    if (this.props.coordinatorList) {
      let coordinatorList = JSON.parse(JSON.stringify(this.props.coordinatorList)) || []
      coordinatorList.unshift('') // Add an empty value in front of the list
      this.setState({ coordinatorList: coordinatorList })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.sample !== this.state.sampleNumber || !this.state.tabs) {
      this.setState({ isLoading: true, tabs: nextProps.statusList, sampleNumber: nextProps.sample })
      this.loadState(nextProps.sample);
      this.loadSummary(nextProps.sample);
    }

    if (nextProps.coordinatorList) {
      let coordinatorList = JSON.parse(JSON.stringify(nextProps.coordinatorList)) || []
      coordinatorList.unshift('') // Add an empty value in front of the list
      if (this.state.coordinatorList !== coordinatorList) {
        this.setState({ coordinatorList: coordinatorList })
      }
    }

    if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
      this.setState({
        canUpdate: nextProps.hasRole(ADMIN_ROLES)
      })
  }

  refreshForm(state) {
    if (this.state.activeTab !== state) {
      this.props.refreshPage()
    } else {
      // Just reload the form 
      this.loadSummary(this.state.sampleNumber)
      this.toggleTab(state)
    }
  }

  toggleTab(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({ activeTab: tab });
    }
  }

  render() {
    const { ...other } = this.props;

    const blankState = this.props.sample === undefined && this.state.activeTab === undefined && this.state.summary === undefined
    const loadingState = this.state.isLoading
    const readyState = !blankState && !loadingState

    if (blankState) return (
      <Card body>
        <p className='text-muted'>First, select a sample to see data in this screen</p>
      </Card>
    )
    if (loadingState) return (
      <Card body className='p-2' style={{ height: '5rem' }}>
        <Spinner showSpinner overlay={false} />
      </Card>
    )
    if (readyState) return (
      <Card body className='p-3'>
        {
          this.state.showSampleCoordinatorModal
            ? <SampleCoordinatorModal sampleNumber={this.state.sampleNumber}
              coordinator={this.state.coordinator} coordinatorList={this.state.coordinatorList}
              toggleModal={this.modalSampleCoordinator} changeSampleCoordinator={this.changeSampleCoordinator.bind(this)} />
            : undefined
        }
        {
          this.state.summary.fields.forEach((key, value) => {
            if(key.label === 'Late Sample' && key.value === 'Y') {
              return <BadAlert message="This is a late sample."/>
            }
          })
        }
        <SummaryCard data={this.state.summary} className='mb-2'
          canSubscribe={false} canDelete={false} canPin={false} />
        <ActionsPane {...other} className='mb-2' onSubmit={this.attachSwr}
          changeSampleCoordinator={this.modalSampleCoordinator.bind(this)} />
        {
          this.state.tabs
          ? <React.Fragment>  
            <Nav tabs className="chg-horizontal-tabs">
              {
                this.state.tabs.map((tab, i) => {
                  return (
                    <NavItem key={`smpdbtab-${tab}-${i}`}>
                      <NavLink
                        className={classnames({ active: this.state.activeTab === tab })}
                        onClick={() => { this.toggleTab(tab); }}
                      >
                        {tab}
                      </NavLink>
                    </NavItem>
                  )
                })
              }
            </Nav>
            <TabContent activeTab={this.state.activeTab}>
              <TabPane tabId={this.state.activeTab}>
                {
                  this.state.activeTab !== undefined
                    ? <SampleForm {...other}
                      sample={this.state.sampleNumber}
                      state={this.state.activeTab}
                      states={this.state.tabs}
                      refreshForm={this.refreshForm} />
                    : <div className='p-2' style={{ height: '5rem' }}>
                      <Spinner showSpinner overlay={false} />
                    </div>
                }
              </TabPane>
            </TabContent>
          </React.Fragment>  
          : <Spinner showSpinner overlay={false} />
        }
      </Card>
    )
    return null
  }

}

class SampleCoordinatorModal extends React.Component {

  state = {
    coordinator: this.props.coordinatorList.indexOf(this.props.coordinator) > 0 ? this.props.coordinator : ''
  }

  onChange = (name, value) => {
    this.setState({ coordinator: value });
  }

  render() {
    return (
      <ComponentModal show={true} title='Change Sample Coordinator'
        toggleModal={this.props.toggleModal}>
        <div className={this.props.className}>

          <FormWidgetStatic id='fld-sampdb-coormdl-number' name='sampleNumber' label='Sample Number'
            value={this.props.sampleNumber} inline />
          <FormWidgetSelect id='fld-sampdb-coormdl-coord' name='coordinator' label='Sample Coordinator' options={this.props.coordinatorList}
            value={this.state.coordinator} onChange={this.onChange} inline required />

          <hr />
          <span className='float-right'>
            <Button color="primary" className="mr-1" onClick={() => this.props.changeSampleCoordinator(this.state.coordinator)}>
              <span aria-hidden="true" className="fa fa-save"></span>{' '}Save Changes
            </Button>
            <Button color="secondary" outline className="mr-1" onClick={this.props.toggleModal}>Cancel</Button>
          </span>

        </div>
      </ComponentModal>
    )
  }
}

class ActionsPane extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      showSwr: false,
      canUpdate: props.hasRole(ADMIN_ROLES)
    }

    this.onSubmit = this.onSubmit.bind(this)
    this.toggleShowSwr = this.toggleShowSwr.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
      this.setState({
        canUpdate: nextProps.hasRole(ADMIN_ROLES)
      })
  }

  onSubmit(data) {
    this.toggleShowSwr()
    this.props.onSubmit(data)
  }

  toggleShowSwr() {
    this.setState({ showSwr: !this.state.showSwr })
  }

  render() {
    const { ...other } = this.props
    if (this.state.showSwr) {
      return (
        <Card body className={this.props.className}>
          <h5>Add SWR</h5>
          <SwrForm {...other}
            onSubmit={this.onSubmit}
            onClose={this.toggleShowSwr}
          />
        </Card>
      )
    } else {
      if (this.state.canUpdate) {
        return (
          <div className={this.props.className}>
            <Button className="mr-1 mb-1" size="sm" color="primary" onClick={this.props.changeSampleCoordinator}>
              <span aria-hidden="true" className="fa fa-user"></span> Change Sample Coordinator
            </Button>
            <Button className="mr-1 mb-1" size="sm" color="primary" onClick={this.toggleShowSwr}>
              <span aria-hidden="true" className="fa fa-plus"></span> Add SWR
            </Button>
          </div>
        )
      }
      return null
    }
  }
}

export default SampleFormWizard
