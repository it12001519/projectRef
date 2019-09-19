import React, { Component, } from 'react';
import { Row, Col, Badge, Button, Form, FormGroup, FormText, Input, Label, ListGroupItem, Modal, ModalBody } from 'reactstrap';
import FontAwesome from 'react-fontawesome';
import DatePicker from 'react-datepicker';
import AttachmentField from "js/app/models/AttachmentField";
import AttachmentTab from 'js/app/views/change/tabs/attachment';
import moment from 'moment';
import styled from 'styled-components';

class PhaseActionItem extends Component {

  constructor(props) {
    super(props);

    // Set the default state
    this.state = {
      action: props.data,
      modal: false
    }

    // Bind the methods
    this.toggleModal = this.toggleModal.bind(this);
  }

  toggleModal() {
    this.setState({ modal: !this.state.modal });
  }

  render() {
    let color = 'default';
    color = this.state.action.status === 'Done' ? 'success' : color;
    color = this.state.action.status === 'Due Soon' ? 'warning' : color;
    color = this.state.action.status === 'Overdue' ? 'danger' : color;

    return (
      <ListGroupItem color={color} className={this.props.className}>
        <div onClick={this.toggleModal}>
          <p className='summary-label'>
            {this.state.action.label}
          </p>
          <span class="clearfix">
            <Badge color='dark' className="float-left summary-badge">{this.state.action.owner}</Badge>
            <Badge color='dark' className="float-left summary-badge">{this.state.action.dueDate}</Badge>
            {
              this.state.action.attachments ? (
                <Badge color='dark' className="float-right summary-badge"><FontAwesome name="paperclip" /></Badge>
              ) : ''
            }
            {
              this.state.action.link ? (
                <Badge color='dark' className="float-right summary-badge"><FontAwesome name="link" /></Badge>
              ) : ''
            }
            {
              this.state.action.comment ? (
                <Badge color='dark' className="float-right summary-badge"><FontAwesome name="comment" /></Badge>
              ) : ''
            }
            {
              this.state.action.source === 'system' ? (
                <Badge color='dark' className="float-right summary-badge"><FontAwesome name="bolt" /></Badge>
              ) : ''
            }
          </span>
        </div>

        {/* Modal wrapping AnnouncementForm component */}
        <Modal
          isOpen={this.state.modal}
          toggle={this.toggleModal}
          fade={true}
          backdrop={true}
          size="lg">
          <ModalBody>
            <Form autoComplete="off" noValidate>
              <FormGroup>
                <Label>Action Name {this.state.action.source === 'system' ? <Badge color='dark'><FontAwesome name="bolt" />{' '} System Generated</Badge> : ''}</Label>
                <Input type="text"
                  value={this.state.action.label ? this.state.action.label : ''}
                  disabled={this.state.action.source === 'system' || this.state.action.statusDate}></Input>
              </FormGroup>
              <FormGroup>
                <Label>Action Link <Button size="sm" outline color="secondary" className="mr-1"><FontAwesome name="link" />{' '} Go to Link</Button></Label>
                <Input type="text"
                  value={this.state.action.link ? this.state.action.link : ''}
                  disabled={this.state.action.source === 'system' || this.state.action.statusDate}></Input>
              </FormGroup>
              <Row>
                <Col sm={12} md={6}>
                  <FormGroup>
                    <Label>Status</Label>
                    <h3><Badge color={color}>{this.state.action.status ? this.state.action.status : 'Pending'}</Badge></h3>
                  </FormGroup>
                </Col>
                <Col sm={12} md={6}>
                  <FormGroup>
                    <Label>Date Completed</Label>
                    <Input type="text"
                      value={this.state.action.statusDate ? this.state.action.statusDate : 'N/A'}
                      disabled />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col sm={12} md={6}>
                  <FormGroup>
                    <Label>Action Owner</Label>
                    <Input type="text" value={this.state.action.owner ? this.state.action.owner + ' (a0123456)' : ''} />
                  </FormGroup>
                </Col>
                <Col sm={12} md={6}>
                  <FormGroup>
                    <Label for="teaser">Due Date</Label>
                    <DatePicker
                      dateFormat="YYYY-MM-DD"
                      selected={this.state.action.dueDate ? moment(this.state.action.dueDate) : undefined}
                      todayButton={"Today"}
                      placeholderText="YYYY-MM-DD"
                      className="form-control"
                      disabled={this.state.action.statusDate} />
                    <FormText color="muted">All date and time are in CST</FormText>
                  </FormGroup>
                </Col>
              </Row>
              <FormGroup>
                <Label for="comment">Comment</Label>
                <Input type="textarea"
                  value={this.state.action.comment ? this.state.action.comment : ''}
                  disabled={this.state.action.statusDate} />
              </FormGroup>
              <FormGroup>
                <Label for="teaser">Attachments </Label>
                <AttachmentField id={this.props.changeNumber}/>
                <AttachmentTab {...this.props} isVisible={false} />
                
              </FormGroup>
            </Form>

            <Button color="primary" className="mr-1"><FontAwesome name="save" /> &nbsp; Save Changes</Button>
            {
              this.state.action.statusDate ? '' :
                <Button color="primary" className="mr-1"><FontAwesome name="check-square" /> &nbsp; Save and Mark Complete</Button>
            }
            <Button color="secondary" outline className="mr-1 float-right" onClick={this.toggleModal}>Close</Button>
          </ModalBody>
        </Modal>
      </ListGroupItem>
    );
  }
}

export default styled(PhaseActionItem)`
cursor: pointer;

.summary-label
{
  margin-bottom: 0.3rem;
}

.summary-badge
{
  margin-right: 2px;
  margin-top: 2px;
}
`;