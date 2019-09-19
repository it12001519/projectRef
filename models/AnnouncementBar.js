import React, { Component, } from 'react';
import { Alert, Badge, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import FetchUtilities from 'js/universal/FetchUtilities';

// Mock data - using static json file in /public/json
// const URL_ONE = "/json/announcements/100001.json";

// API data
const URL_ONE = "/api/v1/announcements/";

// Set up the default headers to disable browser cache fetches
var headers = new Headers();
headers.append('pragma', 'no-cache')
headers.append('cache-control', 'no-cache')

const localStorageSelectionList = 'announcementBarHiddenList';

let AnnouncementBar = class extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: props.userDetails.id,
            data: props.unreadAnnouncement,
            hiddenList: [],
            modalData: {},
            modalVisible: false
        }

        // Bind this to functions
        this.checkIfNotHidden = this.checkIfNotHidden.bind(this);
        this.showDetails = this.showDetails.bind(this);
        this.hideDetails = this.hideDetails.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.markDismissed = this.markDismissed.bind(this);
        this.markRead = this.markRead.bind(this);
    }

    checkIfNotHidden(id) {
        var result = true;
        this.state.hiddenList.map(item => item === id ? result = false : undefined);
        return result;
    }

    showDetails(id) {
        // Fetch the selected announcement
        FetchUtilities.fetchGet(URL_ONE + id, 
            (httpStatus, response) => {
                this.setState({
                    modalVisible: true,
                    modalData: response
                });
            })
    }

    hideDetails() {
        this.setState({
            modalVisible: false
        });
    }

    toggleModal() {
        this.setState({
            modalVisible: !this.state.modalVisible
        });
    }

    markDismissed(id) {
        var newList = this.state.hiddenList.slice();
        newList.push(id);
        this.setState({ hiddenList: newList });
        sessionStorage.setItem(`${localStorageSelectionList}-${this.state.user}`, JSON.stringify(newList));
    }

    markRead(id) {
        // Hide an announcement as read
        FetchUtilities.fetchPost(URL_ONE + id + '/mark/read', null,
            _=> {
                this.hideDetails()
                this.markDismissed(id)
            }
        )
    }

    componentDidMount() {
        // Fetch the hidden announcements from session storage
        // Note: this does get called on each render of this component, 
        // however it is not terribly expensive since it is within browser.
        var rawList = sessionStorage.getItem(`${localStorageSelectionList}-${this.state.user}`)
        if (rawList !== undefined && rawList !== null) {
            this.setState({ hiddenList: JSON.parse(rawList) });
        }
    }

    componentDidUpdate(prevProps) {
        // Handle props changes on unreadAnnouncement
        if (prevProps.unreadAnnouncement !== this.props.unreadAnnouncement) {
            this.setState({ data: this.props.unreadAnnouncement });
        }
    }

    render() {
        //var SmartTimeAgo = require('react-smart-time-ago');
        return (
            <div className={this.props.className}>
                {
                    this.state.data.map((e, i) => {
                        return (
                            this.checkIfNotHidden(e.id) ? (
                                <Alert key={i} color="info" className="bar-alert clearfix" style={{ marginBottom: '0.5rem', paddingRight: '0.5rem' }}>
                                    <FontAwesome name="bullhorn" />&nbsp; {e.teaser}
                                    <span className='float-right' style={{ display: 'inline-block' }}>
                                        <Button outline color="secondary" size="sm" className="btn-alert-action" onClick={() => { this.markDismissed(e.id) }} title="Leave Unread and Dismiss">
                                            <FontAwesome name="eye-slash" />
                                        </Button>&nbsp;
                                        <Button outline color="secondary" size="sm" className="btn-alert-action"
                                            onClick={() => { this.showDetails(e.id) }}
                                            style={{ margin: '0 2px' }}>Read More</Button>&nbsp;
                                    </span>
                                </Alert>
                            ) : undefined
                        );
                    })
                }
                {
                    this.state.data.length > 0
                        ? <Modal
                            isOpen={this.state.modalVisible}
                            toggle={this.toggleModal}
                            fade={true}
                            backdrop={true}
                            size="lg">
                            <ModalHeader toggle={this.toggleModal}><FontAwesome name="bullhorn" />&nbsp; Announcement</ModalHeader>
                            <ModalBody>
                                <h6 className="modal-teaser" style={{ color: '#CC0000' }}>{this.state.modalData.teaser}</h6>
                                <p>{this.state.modalData.message}</p>
                                <Badge color="info" className="modal-tag float-right" style={{ margin: '0 2px' }}>{this.state.modalData.lastUpdateByName}</Badge>
                                <Badge color="info" className="modal-tag float-right" style={{ margin: '0 2px' }}>
                                    {this.state.modalData.lastUpdateDttm}
                                    {/* <SmartTimeAgo value={this.state.modalData.lastUpdateDttm} /> */}
                                </Badge>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onClick={() => { this.markRead(this.state.modalData.id) }}>Mark as Read</Button>
                                <Button outline color="secondary" onClick={() => { this.hideDetails() }}>Leave Unread and Close</Button>
                            </ModalFooter>
                        </Modal>
                        : undefined
                }
            </div>
        )
    }
}

export default AnnouncementBar;
