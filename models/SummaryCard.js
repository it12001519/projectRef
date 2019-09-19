import React, { Component, } from 'react';
import { Badge, Button, Card, CardSubtitle, CardText, Row, Col,
    Modal, ModalHeader, ModalBody, UncontrolledCollapse } from 'reactstrap';
import styled from 'styled-components';
import FontAwesome from 'react-fontawesome';
import { ConfirmDeleteModal, } from 'js/universal/Modals';

class SummaryCard extends Component {

    constructor(props) {
        super(props);
        this.state = { 
            collapse: false,
            modal: false,
            modalData: undefined,
            modalVisible: false
        };

        this.collapseCard = this.collapseCard.bind(this);
        this.handleModal = this.handleModal.bind(this);
        this.redirectToHome = this.redirectToHome.bind(this);
    }

    collapseCard() {
        this.setState({ collapse: !this.state.collapse });
    }

    toggleModal(data) {
        this.setState({ 
            modal: !this.state.modal,
            modalData: data
        });
    }

    handleModal() {
        this.setState({
            modalVisible: !this.state.modalVisible
        });
    }

    redirectToHome() {
        window.location = "/";
    }
    
    generateField(item, i) {
        return (
            item.type === 'grouped-list' ? (
                <span key={`summaryfld-${item.label}-groupedlist`}>
                    <strong>{item.label} :</strong> &nbsp;
                    {
                        <span>
                            <Button color="secondary" size="sm" onClick={() => this.toggleModal(item)}>{'Show ' + item.size + ' items'}</Button>
                        </span>
                    }
                </span>
            ) : item.type === 'list' ? (
                <span key={`summaryfld-${item.label}-list`}>
                    <strong>{item.label} :</strong> &nbsp; 
                        {
                            item.values
                            ? item.values.map((value, z) => {
                                let elem = []
                                elem.push(value.link 
                                    ? (<a href={value.link} target='_blank' rel='noopener noreferrer' key={`summaryfld-${item.label}-list-${z}`}>{value.value}</a>)
                                    : (<span key={`summaryfld-${item.label}-list-${z}`}>{value.value}</span>))
                                elem.push(z < item.values.length - 1 ? <span>{', '}</span> : undefined)
                                return (elem);
                            })
                            : ''
                        }
                    </span>
            ) : item.type === 'badge-list' ? (
                <span key={`summaryfld-${item.label}-badgelist`}>
                    <strong>{item.label} :</strong> &nbsp;
                    <Button color="secondary" size="sm" id={'summaryItem' + i}>{'Show/Hide ' + item.value.length + ' items'}</Button>
                    <UncontrolledCollapse toggler={'#summaryItem' + i}>
                        {
                            item.values.map((value, y) => {
                                return (
                                    <Badge color="dark" className="summary-field-badge"  key={`summaryfld-${item.label}-badgelist-${y}`}>{value}</Badge>
                                );
                            })
                        }
                    </UncontrolledCollapse>
                </span>
            ) : item.type === 'hidden' ? (
                <span className="hidden" key={`summaryfld-${item.label}-field`}><strong>{item.label} :</strong> &nbsp; {item.value}</span>
            ) : (
                <span key={`summaryfld-${item.label}-field`}><strong>{item.label} :</strong> &nbsp; {item.value}</span>
            )
        );
    }

    render() {
        var fieldsCol1 = [];
        var fieldsCol2 = [];
        if (this.props.data !== undefined && 
            this.props.data.fields !== undefined && this.props.data.fields !== null) {
            var MAX_SINGLE_COLUMN_COUNT = 3;
            var fields = this.props.data.fields;

            // Only divide the fields into columns if they are more than 3 fields
            if (fields.length > MAX_SINGLE_COLUMN_COUNT) {
                var median = Math.ceil(fields.length / 2);
                for (var i = 0; i < median; i++) {
                        fieldsCol1.push(this.generateField(fields[i], i));
                        fieldsCol1.push(<br key={`summaryfld-br-${i}`} />);
                }
                for (var j = median; j < fields.length; j++) {
                        fieldsCol2.push(this.generateField(fields[j], j));
                        fieldsCol2.push(<br key={`summaryfld-br-${j}`} />);
                }
            } else {
                for (var k = 0; k < fields.length; k++) {
                        fieldsCol1.push(this.generateField(fields[k], k));
                        fieldsCol1.push(<br key={`summaryfld-br-${k}`} />);
                }
            }
        }

        return (
            <div className={this.props.className}>

                {
                    this.props.data !== undefined && 
                    this.props.data.fields !== undefined &&
                    this.props.data.fields !== null ? (
                        <ConfirmDeleteModal
                            show={this.state.modalVisible}
                            message={'You are about to move this change to the Trash Bin. Would you like to proceed?'}
                            handleClose={this.handleModal}
                            handleConfirmation={this.redirectToHome}
                        />
                    ) : undefined
                }
                {
                    this.props.data !== undefined && 
                    this.props.data.fields !== undefined &&
                    this.props.data.fields !== null ? (
                        <Card body>
                            {
                                fieldsCol2.length === 0 ? (
                                    this.props.canSubscribe || this.props.canPin || this.props.canDelete ? (
                                        <Row>
                                            <Col sm={10} xs={10} md={10} lg={10} xl={10}>{fieldsCol1}</Col>
                                            <Col sm={2} xs={2} md={2} lg={2} xl={2}>
                                                <Button color="danger" onClick={this.handleModal}>
                                                    <FontAwesome name="trash" /> Delete Change
                                                </Button>
                                            </Col>
                                        </Row>
                                    ) : (
                                        <Row>
                                            <Col xs={12}>{fieldsCol1}</Col>
                                        </Row>
                                    )
                                ) : (
                                    this.props.canSubscribe || this.props.canPin || this.props.canDelete ? (
                                        <Row>
                                            <Col sm={12} md={5} lg={5} xl={5}>{fieldsCol1}</Col>
                                            <Col sm={12} md={5} lg={5} xl={5}>{fieldsCol2}</Col>
                                            <Col sm={12} md={2} lg={2} xl={2}>
                                                <Button color="danger" onClick={this.handleModal}>
                                                    <FontAwesome name="trash" /> Delete Change
                                                </Button>
                                            </Col>
                                        </Row>
                                    ) : (
                                        <Row>
                                            <Col sm={12} md={6}>{fieldsCol1}</Col>
                                            <Col sm={12} md={6}>{fieldsCol2}</Col>
                                        </Row>
                                    )
                                )
                            }
                            {
                                this.props.data.phase !== null && this.props.data.phase !== undefined ? (
                                    <Row>
                                        <Col xs={12}>
                                            <strong>{this.props.data.phase.label} :</strong> &nbsp;
                                                {
                                                this.props.data.phase.list.map((phase, i) => {
                                                    let phaseColor = 'secondary';
                                                    phaseColor = phase.status === 'DONE' ? 'success' : phaseColor;
                                                    phaseColor = phase.status === 'PENDING' ? 'warning' : phaseColor;
                                                    phaseColor = phase.status === 'HOLD' ? 'warning' : phaseColor;
                                                    phaseColor = phase.status === 'REJECTED' ? 'danger' : phaseColor;
                                                    phaseColor = phase.status === 'CLOSED' ? 'secondary' : phaseColor;
                                                    phaseColor = phase.status === 'COMPLETE' ? 'success' : phaseColor;
                                                    phaseColor = phase.status === 'SUBMITTED' ? 'warning' : phaseColor;
                                                    phaseColor = phase.status === 'NOT APPROVED' ? 'danger' : phaseColor;
                                                    phaseColor = phase.status === 'NOTIFIED' ? 'info' : phaseColor;
                                                    phaseColor = phase.status === 'SUBMITTED TO PCN' ? 'warning' : phaseColor;
                                                    return (
                                                        <Badge className="phase-badge" color={phaseColor} key={i}>{phase.label}</Badge>
                                                    );
                                                })
                                            }
                                        </Col>
                                    </Row>
                                ) : undefined
                            }
                        </Card>
                    ) : undefined
                }
                { 
                    this.state.modalData !== undefined ? (
                        <Modal size="lg" fade={true} backdrop={true}
                               isOpen={this.state.modal} toggle={() => this.toggleModal(undefined)}>
                            <ModalHeader toggle={() => this.toggleModal(undefined)}>{this.state.modalData.label}</ModalHeader>
                            <ModalBody>                                    
                                <Row>
                                {
                                    this.state.modalData.values.map((group) => {
                                        return (
                                            <Col md={6} sm={12} style={{ marginBottom: '0.5em' }}>
                                                <Card body style={{ padding: '15px' }}>
                                                    <CardSubtitle>{group.group}</CardSubtitle><br/>
                                                    <CardText>
                                                    <ul style={{ marginBottom: '0', marginTop: '0.5em', paddingLeft: '1em' }}>
                                                        {
                                                            group.list.map((value) => {
                                                                return (
                                                                    <li style={{ fontSize: '75%', fontWeight: '500' }}>{value}</li>                                                                    
                                                                );
                                                            })
                                                        }
                                                    </ul>
                                                    </CardText>
                                                </Card>
                                            </Col>
                                        );
                                    })
                                }
                                </Row>
                            </ModalBody>
                        </Modal>
                    ) : undefined
                }
            </div>
        );
    }
}

export default styled(SummaryCard)`
div.card-body
{
  padding: .5em 1.5em;
}

div.row {
  margin-left: -30px;
  margin-right: -30px;
}

p
{
  margin-bottom: 0;
}

.summary-field-badge
{
  margin-right: 0.3rem;
  text-align: left;
  white-space: normal;
}

.phase-badge 
{
  line-height: inherit;
  margin-right: .3em;
}

.hidden{
    display: none;
}
`;
