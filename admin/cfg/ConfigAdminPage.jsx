import React from 'react'
import { Container, Row, Col, Card, } from 'reactstrap'
import withLayout from 'js/app/models/withLayout'
import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb'
import TreeSidebar from 'js/app/models/TreeSidebar'
import Spinner from 'js/universal/spinner'

import SampleDashboardStatus from 'js/app/views/admin/cfg/SampleDashboardStatus'
import SampleDashboardSummary from 'js/app/views/admin/cfg/SampleDashboardSummary'
import SampleDashboardFields from 'js/app/views/admin/cfg/SampleDashboardFields'
import PCNGroupName from 'js/app/views/admin/cfg/PCNGroupName'
import PCNProjectName from 'js/app/views/admin/cfg/PCNProjectName'

const pageTitle = 'Configurations'
let ConfigAdminPage = class extends React.Component {

    constructor(props) {
        super(props)

        // Set default list of tabs
        let tabList = [
            { label: "Sample Status", value: "sample-status" },
            { label: "Sample Dashboard Summary Header", value: "sampledb-summary" },
            { label: "Sample Dashboard Form Fields", value: "sampledb-fields" },
            { label: "PCN Group Names", value: "pcn-grpnames" },
            { label: "PCN Project Names", value: "pcn-projectnames" },
        ]
        let defaultTab = !!this.props.match.params.tab ? this.props.match.params.tab : undefined;
        let defaultTabLabel = this.fetchTabLabel(defaultTab, tabList)

        this.state = {
            activeTab: defaultTab,
            activeTabTitle: defaultTabLabel,
            crumbs: this.fetchCrumbs(defaultTabLabel),
            tabList: tabList
        }

        this.toggleTab = this.toggleTab.bind(this)
    }

    toggleTab(activeTab) {
        let activeTabTitle = this.fetchTabLabel(activeTab, this.state.tabList)
        this.setState({
            activeTab: activeTab,
            activeTabTitle: activeTabTitle,
            crumbs: this.fetchCrumbs(activeTabTitle)
        })
    }

    fetchTabLabel(tab, tabList) {
        for (let i in tabList) {
            if (tabList[i].value === tab)
                return tabList[i].label
        }
        return undefined
    }

    fetchCrumbs(tabLabel) {
        let crumbs = [
            { text: 'Home', to: '/' },
            { text: 'Admin', active: false },
            { text: pageTitle, active: true }
        ]
        if (tabLabel !== undefined)
            crumbs.push({ text: tabLabel, active: false })
        return crumbs
    }

    render() {
        const { ...other } = this.props;

        let tabComponent = undefined;
        switch (this.state.activeTab) {
            case 'sample-status': tabComponent = <SampleDashboardStatus {...other} />
                break;
            case 'sampledb-summary': tabComponent = <SampleDashboardSummary {...other} />
                break;
            case 'sampledb-fields': tabComponent = <SampleDashboardFields {...other} />
                break;
            case 'pcn-grpnames': tabComponent = <PCNGroupName {...other} />
                break;
            case 'pcn-projectnames': tabComponent = <PCNProjectName {...other} />
                break;
            default: tabComponent = <Card body>Select a tab from the list on the left</Card>
        }
        return (
            <Container fluid>

                <ChangeLinkBreadcrumb crumbs={this.state.crumbs} />
                
                {
                    !!this.props.userAccess
                        ? <Row>
                            <Col xs={12} sm={6} md={3} lg={2}>
                                <TreeSidebar data={this.state.tabList} active={this.state.activeTabTitle} expandAll
                                    onClickCallback={this.toggleTab} />
                            </Col>
                            <Col xs={12} sm={6} md={9} lg={10}>
                                {tabComponent}
                            </Col>
                        </Row>
                        : <Card body className='p-2' style={{ height: '5rem' }}>
                            <Spinner showSpinner overlay={false} />
                        </Card>
                }
            </Container>
        )
    }
}

export default withLayout(ConfigAdminPage);