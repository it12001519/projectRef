import React, { Component, } from 'react';
import {
  CardColumns, Card, CardBody, CardTitle, CardText, Button, Table, Alert
} from 'reactstrap';
import FontAwesome from 'react-fontawesome';

import { InfoModal, ConfirmModal, ConfirmDeleteModal, ComponentModal, infoModal, confirmModal } from 'js/universal/Modals';

class ModalsTab extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activeModal: undefined,
    };
  }

  toggle = (index) => {
    this.setState({
      activeModal: index
    });
  }

  closeModal = () => {
    this.setState({
      activeModal: undefined
    });
  }

  triggerModalFunction = () => {
    infoModal('This modal is created with a function')
  }

  triggerConfirmModalFunction = () => {
    confirmModal(<p><strong>Warning:</strong> Clicking any of the buttons below will trigger an alert to pop up!</p>, 
      () => alert('You clicked YES'), () => alert('You clicked NO'))
  }

  render() {
    return (
      <div className={this.props.className}>

        <div className="clearfix" style={{ height: '1em' }} />
        <h4>Modal Popup Windows</h4>

        <CardColumns>

        <Card>
            <CardBody>
              <CardTitle>Information Modal</CardTitle>
              <CardText>Use an information modal to display non-critical information to the user.</CardText>
              <Button color="primary" onClick={() => this.toggle('info')}>
                Launch Modal
              </Button>
              <hr />
              <CardText>You can also use a customized information modal to display other kinds of information to the user.</CardText>
              <Button color="danger" onClick={() => this.toggle('info2')}>
                Launch Modal
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <CardTitle>Confirmation Modal</CardTitle>
              <CardText>You may use the confirmation modal to quickly ask the user a Yes/No question.</CardText>
              <Button color="secondary" className="mr-1" onClick={() => this.toggle('confirm')}>
                Launch Modal
              </Button>
            <hr />
              <CardText>An action that requires user caution may need a confirmation to make sure that the user is sure about triggering the system action.</CardText>
              <Button color="warning" onClick={() => this.toggle('confirm2')}>
                Launch Modal
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <CardTitle>Delete Confirmation Modal</CardTitle>
              <CardText>Make sure to confirm from the user when doing a dangerous action. In this example, deleting a record.</CardText>
              <Button color="danger" className="mr-1" onClick={() => this.toggle('delete')}>
                <FontAwesome name="trash" />{' '}Delete Record
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <CardTitle>Custom Modal</CardTitle>
              <CardText>You want a different kind of modal? You got it!</CardText>
              <Button color="primary" onClick={() => this.toggle('custom')}>
                Show Me!
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <CardTitle>Function Modal</CardTitle>
              <CardText>You want to create a modal with only a function?</CardText>
              <Button color="primary" onClick={this.triggerModalFunction}>
                You Got It!
              </Button>
              <Button color="primary" onClick={this.triggerConfirmModalFunction}>
                Another One!
              </Button>
            </CardBody>
          </Card>

        </CardColumns>

        <InfoModal
          show={this.state.activeModal === 'info'}
          message="Information on this page has been update by another user. Please refresh to view latest updates."
          handleClose={this.closeModal}
        />

        <InfoModal
          show={this.state.activeModal === 'info2'}
          icon="exclamation-circle"
          color="danger"
          title="Access Denied"
          message="You are not allowed to do that transaction. Please request access from your site admin."
          handleClose={this.closeModal}
        />

        <ConfirmModal
          show={this.state.activeModal === 'confirm'}
          handleClose={this.closeModal}
          handleConfirmation={this.closeModal}
        />

        <ConfirmModal
          show={this.state.activeModal === 'confirm2'}
          color="warning"
          title="Confirm Sending Email"
          message="Completing this action will send out emails to TI customers listed in the change. Are you sure you want to proceed?"
          handleClose={this.closeModal}
          handleConfirmation={this.closeModal}
        />

        <ConfirmDeleteModal
          show={this.state.activeModal === 'delete'}
          handleClose={this.closeModal}
          handleConfirmation={this.closeModal}
        />

        <ComponentModal
          show={this.state.activeModal === 'custom'}
          handleClose={this.closeModal}
          handleConfirmation={this.closeModal}
          size='lg' color='warning' icon='car' title='¡Advertencia! Conductor Rapido!'
          buttons={
            [{ color: 'secondary', outline: true, label: 'Cerrar', onClick: this.closeModal }]
          } >
          <Alert color='warning'>Por favor, evite los conductores enumerados a continuacion.</Alert>
          <Table bordered striped>
            <thead>
              <tr><th>Name</th><th>Number of Speeding Tickets</th></tr>
            </thead>
            <tbody>
              <tr><td>Dash Parr</td><td>54</td></tr>
              <tr><td>Flash Gordon</td><td>78</td></tr>
              <tr><td>Juan Rapido</td><td>103</td></tr>
            </tbody>
          </Table>
          <p>Please avoid the drivers listed above for safety precaution.</p>
        </ComponentModal>

      </div>
    );
  }
}

export default ModalsTab;