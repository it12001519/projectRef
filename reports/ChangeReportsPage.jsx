import React, { Component, } from 'react'
import withLayout from 'js/app/models/withLayout'
import FetchUtilities from 'js/universal/FetchUtilities'
import { PageHeader } from 'js/app/models/ChangelinkUI'
import FormWidget, { FormWidgetLazyLoadSelect } from 'js/universal/FormFieldWidgets'
import Spinner, { showOverlaySpinner, hideOverlaySpinner } from 'js/universal/spinner'
import { PrimaryButton } from 'js/app/models/ChangelinkUI'
import { Redirect } from "react-router-dom"
import { Container, Row, Col, Card, FormText } from 'reactstrap'
import TreeSidebar from 'js/app/models/TreeSidebar'
import moment from 'moment'
import Validator from 'validatorjs'
import update from 'immutability-helper';

const URL_REPORT_NAMES = '/api/dropdown/report-name'
const URL_REPORT_BASE = '/api/v1/forms/slug/{slug}/'

class ChangeReportsPage extends React.Component {
    state = {
        reportName: '', reportLabel: '', 
        form: { report: {} },
        data: { report: {} },
        validation: { report: {} },
        referrer: '',
        open: true,
        sideBarOpen: true
    }

    onSetSidebarOpen = (open) => {
        this.setState({
            sidebarOpen: open
        })
    }

    componentDidUpdate(prevProps) {
        if(prevProps.location.key !== this.props.location.key) {
            window.location.reload(true)
        }
    }

    componentDidMount() {
        showOverlaySpinner()
        FetchUtilities.fetchGet(`${URL_REPORT_NAMES}`,
          (httpStatus, response) => {
            this.setState({ reportNames: response })
          })
          
          hideOverlaySpinner()
      }

      routeChange = () => {
        if(this.isValid()) {
            let path = '/view/report'
            this.setState({
              referrer: path
            })
        }
      }

      isValid = () => {
          let reportValidator = new Validator(this.state.data.report, this.state.validation.report, FormWidget.defaultValidationMessages)
        return reportValidator.passes()
        }

      toggleTab = (value) => {
        showOverlaySpinner()
        this.setState({ form: { report: {}},
                        data: { report: {}}
        })
          let activeTabTitle = this.fetchTabLabel(value, this.state.reportNames)
          const label = this.state.reportNames.find(item => { return item.value === value})
          this.setState({
              reportName: value,
              reportLabel: label.label
          })
          if (value !== undefined && value !== '') {
            FetchUtilities.fetchGet(URL_REPORT_BASE.replace('{slug}', value),
                (httpStatus, response) => {
                    let form = { ...this.state.form }, rules = { ...this.state.validation }, newrules = {}
                    response.forEach(({ name, validation }, i) => {
                    if (!!validation && validation !== null)
                        newrules[name] = eval(validation)
                    })
                    rules.report = newrules
                    form.report = response
                    this.setState({ form })
                    this.setState({ validation: rules })
                    this.setState({
                        activeTab: value,
                        activeTabTitle: activeTabTitle
                    }, () => hideOverlaySpinner())
                })
            }

            if(value === 'metric-changes-state' 
            || value === 'metric-changes-type' 
            ||value === 'metric-cycle-time') {
                this.setState({
                    data: {
                        report: {
                            PERIOD_TYPE: 'Monthly',
                            NUMBER_OF_PERIODS: '6'
                        }
                    }
                })
            }
      }

      onChange_ChangeData = (name, value) => { 
        if(name === 'FROM_DATE' 
            || name === 'TO_DATE' 
            || name === 'EARLY_DISPOSITION_DATE'
            || name === 'LATE_DISPOSITION_DATE'
            || name === 'EARLY_APPROVED_DATE'
            || name === 'LATE_APPROVED_DATE'
        ) {
            value = moment(value).format("MM/DD/YYYY");
        }

        if((name === 'SBE' || name === 'SBE1' || name === 'CUSTOMER_WW_NAME' || name === 'CUSTOMER_WW_NO' || name === 'CUSTOMER_NAME') && value.length !== 0) {
            let result = 0;

            switch(name) {
                case 'SBE': 
                    result = this.state.form.report.filter(obj => { return (obj.name === 'SBE1')})
                    break;
                case 'SBE1':
                    result = this.state.form.report.filter(obj => { return (obj.name === 'SBE2')})
                    break;
                case 'CUSTOMER_WW_NAME':
                    result = this.state.form.report.filter(obj => { return (obj.name === 'CUSTOMER_WW_NO')})
                    break;
                case 'CUSTOMER_WW_NO':
                        result = this.state.form.report.filter(obj => { return (obj.name === 'CUSTOMER_NAME')})
                        break;
                case 'CUSTOMER_NAME':
                        result = this.state.form.report.filter(obj => { return (obj.name === 'CUSTOMER_NO')})
                        break;
            }

            let index = result[0].id - 1

            FetchUtilities.fetchGet(URL_REPORT_BASE.replace('{slug}', this.state.reportName) + name + '/' + value.join(","),
                (httpStatus, response) => {
                    let form = { ...this.state.form }
                    form.report = response
                    const newForm = update(this.state.form, {report: { [index]: { $set : response[0]}}})
                    this.setState({ form: { report: { [index]: {}}}})
                    this.setState({ form: newForm})
            })
        }

        this.setState((previousState) => {
          if (Array.isArray(value))
            previousState.data.report = { ...previousState.data.report, [name]: value.filter((v, i, a) => a.indexOf(v) === i) };
          else
            previousState.data.report = { ...previousState.data.report, [name]: value };
          return previousState;
        });
      }

    fetchTabLabel(tab, tabList) {
        for (let i in tabList) {
            if (tabList[i].value === tab)
                return tabList[i].label
        }
        return undefined
    }

    render() {
        const { referrer } = this.state
        if (referrer ) return <Redirect to={{ pathname: referrer, state: {data: this.state.data.report, report: this.state.reportLabel, reportSlug: this.state.reportName}}}/>
        
        return (<Container fluid>
            <PageHeader>
                {!!this.state.reportLabel ? `Generate Report: ${this.state.reportLabel}` : `Generate Reports`}
            </PageHeader>
            <hr/> 
            <Row>
                <Col xs={12} sm={6} md={3} lg={2}>
                    <TreeSidebar data={this.state.reportNames} active={this.state.activeTabTitle} expandAll
                        onClickCallback={this.toggleTab} />
                </Col>
                <Col xs={12} sm={6} md={9} lg={10}>
                {!!this.state.reportLabel ? 
                (<React.Fragment>
                    <Spinner overlay={false} />
                    {
                        !!this.state.form.report ?
                        <FormWidget fields={this.state.form.report} rules={this.state.validation.report} values={this.state.data.report}
                        onChange={this.onChange_ChangeData}
                        />
                        : <Card body>Select a tab from the list on the left</Card>
                    }
                    <React.Fragment>
                    <PrimaryButton icon='file' label='Generate Report' className="mr-1 mt-1 pull-right" onClick={this.routeChange}/>
                    </React.Fragment>
                </React.Fragment>) : undefined
            }
                </Col>
            </Row>
        </Container>)
    }
}

export default withLayout(ChangeReportsPage);