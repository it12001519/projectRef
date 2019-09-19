import React, { Component, } from 'react';
import PropTypes from 'prop-types'
import { render, unmountComponentAtNode } from 'react-dom'
import {
  Modal, ModalHeader, ModalBody, ModalFooter, Button
} from 'reactstrap';
import FontAwesome from 'react-fontawesome';

class BaseModal extends Component {

  static defaultProps = {
    id: 'chglk-notify-modal',
    icon: '',
    show: true,
    color: 'light',
    hideModal: false,
    style: {}
  }

  handleClickOutside = () => {
    if (typeof this.props.onClose === 'function')
      this.props.onClose()
    this.destroyModal()
  }

  handleButtonClick = (e, button) => {
    if (!!button.onClick && typeof button.onClick === 'function') button.onClick(e);
    if (button.bypassCloseAfterClick === undefined || !button.bypassCloseAfterClick)  { 
      this.destroyModal()
    }
  }

  destroyModal = () => { 
    if (this.props.hideModal) {
      // Only hide the modal, do NOT destroy
      this.setState({ show: false })
    } else {
      const target = document.getElementById(this.props.id)
      unmountComponentAtNode(target)
      target.parentNode.removeChild(target)
    }
  }

  componentWillMount() {
    this.setState({ show: this.props.show })
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ show: nextProps.show })
  }

  render() { 
    let textcolor = '';
    if (this.props.color === 'dark' || this.props.color === 'danger' || this.props.color === 'success' ||
        this.props.color === 'info' || this.props.color === 'secondary') {
      textcolor = 'text-light';
    }
    return (
      <div>
        <Modal id={this.props.id}
          isOpen={this.state.show}
          toggle={this.props.clickOutside ? this.handleClickOutside : undefined}
          size={this.props.size} fade={true} backdrop 
          style={this.props.style}>
          <ModalHeader className={`bg-${this.props.color} ${textcolor}`} toggle={this.props.toggleModal}>
            <FontAwesome name={this.props.icon} />{' '}{this.props.title}
          </ModalHeader>
          <ModalBody>
            {this.props.children}
          </ModalBody>
          {
            !!this.props.buttons ? (
              <ModalFooter>
                {
                  this.props.buttons.map((button, i) => (
                    <Button key={`bsmdl-btn-${this.props.id}-${i}`} disabled={button.disabled} color={button.color} outline={button.outline} className="mr-1" 
                            onClick={(e) => {this.handleButtonClick(e, button)}}>
                      {button.label}
                    </Button>
                  ))
                }
              </ModalFooter>
            ) : undefined
          }
        </Modal>
      </div>
    );
  }
}

class InfoModal extends Component {

  static defaultProps = {
    id: 'chglk-info-modal',
    icon: 'info-circle',
    show: true,
    color: 'info',
    title: 'Information'
  }

  render() {
    const {...props} = this.props;
    return (
      <BaseModal {...props} clickOutside hideModal buttons={
        [{ color: 'secondary', outline: true, label: 'Close', onClick: this.props.handleClose }]
      }>{this.props.message}</BaseModal>
    );
  }
}

class ConfirmModal extends Component {

  static defaultProps = {
    id: 'chglk-confirm-modal',
    show: true,
    color: 'secondary',
    title: 'Confirm',
    message: 'Are you sure?'
  }

  render() {
    const {...props} = this.props;
    return (
      <BaseModal {...props} className='chglk-confirm-modal' hideModal buttons={
        [
          { color: this.props.color, label: 'Yes, I\'m Sure', onClick: this.props.handleConfirmation },
          { color: 'secondary', label: 'No', onClick: this.props.handleClose },
        ]
      }>{this.props.message}</BaseModal>
    );
  }
}

class ConfirmDeleteModal extends Component {

  static defaultProps = {
    id: 'chglk-delete-modal',
    show: true,
    title: 'Confirm Delete',
    message: 'Deletion of this record is permanent and cannot be reversed. Do you still wish to proceed?'
  }

  render() {
    const {...props} = this.props;
    return (
      <BaseModal {...props} color='danger' hideModal buttons={
        [
          { color: 'danger', label: <React.Fragment><FontAwesome name="trash" />{' '}Yes, Delete the Record</React.Fragment>, onClick: this.props.handleConfirmation },
          { color: 'secondary', outline: true, label: 'Go Back', onClick: this.props.handleClose },
        ]
      }>{this.props.message}</BaseModal>
    );
  }
}

class ComponentModal extends Component {

  static defaultProps = {
    show: true,
    size: 'md'
  }

  render() {
    const {...props} = this.props;
    return (
      <BaseModal hideModal {...props}>{this.props.children}</BaseModal>
    );
  }
}

function createBaseModal(props, content) {
  let divTarget = document.getElementById(props.id)
  if (!!divTarget && !!props.id) {
    // Rerender - the mounted Modal
    render(<BaseModal {...props}>{content}</BaseModal>, divTarget)
  } else {
    // Mount the Modal component
    divTarget = document.createElement('div')
    divTarget.id = props.id
    document.body.appendChild(divTarget)
    render(<BaseModal {...props}>{content}</BaseModal>, divTarget)
  }
}

export function createModal(props, onClose) {
  const defaultProps = {
    id: 'chglk-generic-modal',
    title: 'Alert',
    buttons: [{ color: 'secondary', outline: true, label: 'Ok', onClick: onClose }]
  }

  // Set default values for possible empty attributes
  props.id = props.id || defaultProps.id
  props.title = props.title || defaultProps.title
  props.buttons = props.buttons || defaultProps.buttons

  createBaseModal(props, props.message)
}

export function infoModal(message, onClose) {
  const props = {
    id: 'chglk-info-modal',
    icon: 'info-circle',
    show: true,
    color: 'info',
    title: 'Information',
    clickOutside: true,
    onClose: onClose,
    buttons: [{ color: 'secondary', outline: true, label: 'Ok', onClick: onClose }]
  }
  createBaseModal(props, message)
}

export function successModal(message, onClose) {
  const props = {
    id: 'chglk-success-modal',
    icon: 'check-circle',
    show: true,
    color: 'success',
    title: 'Success',
    clickOutside: true,
    onClose: onClose,
    buttons: [{ color: 'secondary', outline: true, label: 'Ok', onClick: onClose }]
  }
  createBaseModal(props, message)
}

export function warningModal(message, onClose) {
  const props = {
    id: 'chglk-warning-modal',
    icon: 'exclamation-circle',
    show: true,
    color: 'warning',
    title: 'Warning',
    clickOutside: true,
    onClose: onClose,
    buttons: [{ color: 'secondary', outline: true, label: 'Ok', onClick: onClose }]
  }
  createBaseModal(props, message)
}

export function errorModal(message, onClose) {
  const props = {
    id: 'chglk-error-modal',
    icon: 'exclamation-circle',
    show: true,
    color: 'danger',
    title: 'Error',
    clickOutside: true,
    onClose: onClose,
    buttons: [{ color: 'secondary', outline: true, label: 'Ok', onClick: onClose }]
  }
  createBaseModal(props, message)
}

export function confirmModal(message, onConfirm, onDecline) {
  let onConfirmFunction = typeof onConfirm === 'function' ? () => onConfirm() : () => { return }
  let onDeclineFunction = typeof onDecline === 'function' ? () => onDecline() : () => { return }
  
  const props = {
    id: 'chglk-confirm-modal',
    icon: 'question-circle',
    show: true,
    color: 'secondary',
    title: 'Confirm',
    onClose: onDeclineFunction,
    buttons: [
      { color: 'primary', label: 'Yes, I\'m Sure', onClick: onConfirmFunction },
      { color: 'secondary', label: 'No', onClick: onDeclineFunction },
    ]
  }
  createBaseModal(props, message)
}

export function confirmDeleteModal(message, onConfirm, onDecline) {
  let onConfirmFunction = typeof onConfirm === 'function' ? () => onConfirm() : () => { return }
  let onDeclineFunction = typeof onDecline === 'function' ? () => onDecline() : () => { return }
  
  const props = {
    id: 'chglk-delete-modal',
    icon: 'times-circle',
    show: true,
    color: 'danger',
    title: 'Confirm Delete',
    onClose: onDeclineFunction,
    buttons: [
      { color: 'danger', label: <React.Fragment><FontAwesome name="trash" />{' '}Yes, Delete the Record</React.Fragment>, onClick: onConfirmFunction },
      { color: 'secondary', outline: true, label: 'Go Back', onClick: onDeclineFunction },
    ]
  }
  createBaseModal(props, message)
}

export { InfoModal, ConfirmModal, ConfirmDeleteModal, ComponentModal };
