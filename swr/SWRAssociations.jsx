import React, { Component, } from 'react';
import { Button, Card, CardBody, CardFooter, CardGroup, CardHeader, Form, ListGroupItem, ListGroup } from 'reactstrap';
import styled from 'styled-components';
import FetchUtilities from 'js/universal/FetchUtilities';
import { SearchPCN, SearchSamples, SearchCMS } from 'js/app/models/TrkLookUp';
import Spinner from 'js/universal/spinner';

let headers = new Headers({
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache'
})

class SWRAssociations extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                id: (this.props.record && this.props.record['id']) || '',
                swrNumber: (this.props.record && this.props.record['swrNumber'] || ''),
            },
            showSpinner: false,
            pcnAssociations: [],
            sampleAssociations: [],
            cmsAssociations: [],
            pcn: {
                id: '',
                pcn_number: ''
            },
            sample: {
                id: '',
                sample_number: ''
            },
            cms: {
                id: '',
                cms_number: ''
            }
        }
    }

    toggleSpinner = () => {
        this.setState({
            showSpinner: !this.state.showSpinner
        });
    }

    loadAssociation = (url, storage) => {
        fetch(url, {
            credentials: 'include', headers: headers
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then(response => response.json())
            .then((json) => this.setState({ [storage]: json }))
            .catch(error => FetchUtilities.handleError(error))
    }

    loadAssociations = () => {
        const id = this.state.data.id

        this.loadAssociation("/api/v1/swr/associations/pcn/" + id, 'pcnAssociations')
        this.loadAssociation("/api/v1/swr/associations/sample/" + id, 'sampleAssociations')
        this.loadAssociation("/api/v1/swr/associations/cms/" + id, 'cmsAssociations')
    }

    onUpdatePCN = (pcn) => {
        this.setState({ pcn: pcn });
    }

    onUpdateSample = (sample) => {
        this.setState({ sample: sample });
    }

    onUpdateCMS = (cms) => {
        this.setState({ cms: cms });
    }

    attach = (url) => {
        this.toggleSpinner();

        fetch(url, {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }),
                credentials: 'include',
            })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then((response) => {
                this.componentWillMount();
                this.toggleSpinner();
            })
            .catch((error) => {
                alert(error.message)
                FetchUtilities.handleError(error)
            })
    }

    attachPCN = () => {
        this.attach(`/api/v1/swr/${this.state.data.swrNumber}/associations/pcn/${this.state.pcn.pcn_number}/attach`)
    }

    attachSample = () => {
        this.attach(`/api/v1/swr/${this.state.data.swrNumber}/associations/sample/${this.state.sample.sample_number}/attach`)
    }

    attachCMS = () => {
        this.attach(`/api/v1/swr/${this.state.data.swrNumber}/associations/cms/${this.state.cms.cms_number}/attach`)
    }

    detach = (url) => {
        this.toggleSpinner();

        fetch(url, {
            method: 'DELETE',
            headers: new Headers({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }),
            credentials: 'include',
        })
            .then(FetchUtilities.checkStatusWithSecurity)
            .then((response) => {
                this.loadAssociations();
                this.toggleSpinner();
            })
            .catch((error) => {
                alert(error.message)
                FetchUtilities.handleError(error)
            })
    }

    detachPCN = (event) => {
        event.preventDefault()
        this.detach(`/api/v1/swr/${this.state.data.swrNumber}/associations/pcn/${event.currentTarget.dataset.id}/detach`)
    }

    detachSample = (event) => {
        event.preventDefault()
        this.detach(`/api/v1/swr/${this.state.data.swrNumber}/associations/sample/${event.currentTarget.dataset.id}/detach`)
    }

    detachCMS = (event) => {
        event.preventDefault()
        this.detach(`/api/v1/swr/${this.state.data.swrNumber}/associations/cms/${event.currentTarget.dataset.id}/detach`)
    }

    componentWillMount() {
        this.loadAssociations();
    }

    render() {
        return (
            <div>
                <Spinner showSpinner={this.state.showSpinner} />
                <Form>
                    <CardGroup>
                        <SwrAssociationCard
                            title="PCN" urlSlug='/pcn'
                            list={this.state.pcnAssociations}
                            searchBox={<SearchPCN onUpdate={this.onUpdatePCN} selected={''} />}
                            onAttach={this.attachPCN}
                            onDetach={this.detachPCN}
                            enableButton={ this.state.pcn.pcn_number !== '' }
                        />
                        <SwrAssociationCard
                            title="Sample" urlSlug='/sample'
                            list={this.state.sampleAssociations}
                            searchBox={<SearchSamples onUpdate={this.onUpdateSample} selected={''} />}
                            onAttach={this.attachSample}
                            onDetach={this.detachSample}
                            enableButton={ this.state.sample.sample_number !== '' }
                        />
                        <SwrAssociationCard
                            title="Changes" urlSlug='/change'
                            list={this.state.cmsAssociations}
                            searchBox={<SearchCMS onUpdate={this.onUpdateCMS} selected={''} />}
                            onAttach={this.attachCMS}
                            onDetach={this.detachCMS}
                            enableButton={ this.state.cms.cms_number !== '' }
                        />
                    </CardGroup>
                    <br />
                    <Button onClick={() => this.props.toggle()} className="mr-1 pull-right" color="secondary" outline> Close </Button>
                </Form>
            </div>
        )
    }
}

const SwrAssociationCardBare = ({ title, list, urlSlug, onAttach, onDetach, searchBox, enableButton, className }) => {

    return (
        <Card className={className}>
            <CardHeader tag="h6" className="text-center p-1"> {title} </CardHeader>
            <CardBody>
                {
                    list.length > 0 ? (
                        list.map((item) => {
                            return (
                                <ListGroup flush>
                                    <ListGroupItem tag="a" href={`${urlSlug}/${item}`} className='list-item'>
                                        {item} &nbsp;
                                        <Button className="btn btn-danger btn-sm list-item-btn" title={`Detach ${title}`} data-id={item} onClick={onDetach}><span className="fa fa-times" /></Button>
                                    </ListGroupItem>
                                </ListGroup>
                            )
                        })
                    ) : <div className='err-msg'>{`No ${title} associated.`}</div>
                }
            </CardBody>
            <CardFooter>
                <div className='fld-add'>{searchBox}</div>
                <Button color="success" title={`Attach ${title}`} disabled={!enableButton} onClick={onAttach}><span className="fa fa-paperclip" /></Button>
            </CardFooter>
        </Card>
    );
}

const SwrAssociationCard = styled(SwrAssociationCardBare) `
text-align: center !important;

.card-body {
    padding: 0;
}

.list-item {
    float: right;
    padding: .5rem 1rem !important;
    white-space: nowrap;
}

.list-item-btn {
    float: right;
    padding: 0 .25rem !important;
    vertical-align: unset;
}

.fld-add {
    float: left;
    width: calc(100% - 2.75rem);
}

.err-msg {
    font-weight: bold;
    margin: .5rem;
}
`

export default SWRAssociations;

