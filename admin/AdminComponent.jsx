import React from 'react';
import PropTypes from 'prop-types';
import 'whatwg-fetch';
import FetchUtilities from 'js/universal/FetchUtilities';
import FontAwesome from 'react-fontawesome';
import { Button, } from 'reactstrap';
import ReactiveTable, { ReactiveTableStore, } from 'reactive-tables';
import Spinner from 'js/universal/spinner';
import { GridTextCell, GridActionCell } from 'js/universal/GridCells';
import { ConfirmDeleteModal, InfoModal, ComponentModal, } from 'js/universal/Modals';
import { FloatNotifySuccess, } from 'js/app/models/FloatNotification';

// Set up the default headers to disable browser cache fetches
var headers = new Headers();
headers.append('pragma', 'no-cache')
headers.append('cache-control', 'no-cache')

let AdminComponent = class extends React.Component {

  static defaultProps = {
    recordNameSingular: 'Record',
    recordNamePlural: 'Records',
    columns: [],
    hiddenColumns: []
  }

  constructor(props) {
    super(props)

    this.state = {
      id: undefined,
      columns: this.props.columns,
      formVisible: false,
      deleteModal: false,
      showSpinner: false,
      canUpdate: false,
      data: undefined
    }

    this.table = null

    // Bind functions
    this.refreshTable = this.refreshTable.bind(this)
    this.toggleSpinner = this.toggleSpinner.bind(this)
    this.openDeleteModal = this.openDeleteModal.bind(this)
    this.toggleDeleteModal = this.toggleDeleteModal.bind(this)
    this.toggleForm = this.toggleForm.bind(this)
    this.notify = this.notify.bind(this)
    this._onEdit = this._onEdit.bind(this)
    this._onDelete = this._onDelete.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  componentWillMount() {
    if (this.props.userAccess) {
      let canUpdate = false;
      for (let i in this.props.adminRoles) {
        canUpdate = this.props.userAccess.includes(this.props.adminRoles[i]) ? true : canUpdate
      }

      // Reconfigure the table columns depending on the role update access
      // Add the actions columns if role can update
      let columns = this.props.columns

      if (canUpdate && columns.filter(columns => (columns.key === "adminActionColumn")).length === 0) {
        columns.unshift({
          key: 'adminActionColumn',
          label: ''
        })
      }
      this.setState({ canUpdate: canUpdate, columns: columns })
    }
  }

  refreshTable() {
    this.table.refresh()
  }

  toggleSpinner(state) {
    if (state !== undefined)
      this.setState({ showSpinner: state })
    else
      this.setState({ showSpinner: !this.state.showSpinner })
  }

  openDeleteModal(id) { 
    this.setState({ deleteModal: true, recordId: id, notifyType: undefined })
  }

  toggleDeleteModal() { 
    this.setState({ deleteModal: !this.state.deleteModal, notifyType: undefined })
  }

  toggleForm() {
    this.setState({ formVisible: !this.state.formVisible, notifyType: undefined })
  }

  notify(notifyType, notifyMessage) {
    this.setState({ notifyType: notifyType, notifyMessage: notifyMessage })
  }

  _onEdit(id) {
    this.setState({ recordId: id, command: 'Edit' })
    this.toggleForm();
  }

  _onDelete(id) {
    this.toggleSpinner(true)
    fetch(this.props.gridURL + '/' + id,
        {
            method: 'DELETE',
            credentials: 'include',
            headers: headers
        })
        .then(FetchUtilities.checkStatusWithSecurity)
        .then((response) => { 
          if (response.status >= 200 && response.status < 300) {
            this.toggleDeleteModal()
            this.toggleSpinner(false)
            this.onSubmit(`Successfully deleted ${this.props.recordNameSingular} with ID ${id}`, true)
          } else {
            return response.json() 
          }
        })
        .then((response) => {
          if (!!response && !(response.status >= 200 && response.status < 300)) {
            throw response
          }
        })
        .catch((error) => {
            this.toggleDeleteModal()
            this.toggleSpinner(false)
            if (error !== undefined && error.message !== undefined && error.message !== null && error.message !== '')
              this.notify('danger', error.message)
            else
              this.notify('danger', 'Error encountered while doing the transaction')
        });
  }

  onSubmit(message, isSuccess) {
    if (isSuccess !== undefined) {
      this.setState({ formVisible: false }) // Hide the modal form
      this.toggleSpinner(false) // Hide the spinner
      this.table.refresh()
      if (isSuccess) {
        this.notify('success', message)
      } else {
        this.notify('danger', message)
      }
    }
  }

  componentWillReceiveProps() {
    // Force table refresh when receiving new props
    this.table.refresh()
  }

  render() {
    const { ...other } = this.props;
    const idModal = this.state.command === "Add" ? '' : this.state.recordId;

    let MyGridRow = (props) => {
      return <GridRow {...props} {...other} canEdit={this.state.canEdit} _onEditCallback={this._onEdit} _onDeleteCallback={this.openDeleteModal} />
    }

    return (
      <div className={this.props.className}>
        <Spinner showSpinner={this.state.showSpinner} />

        <div className='mb-1'>
          {
            this.state.canUpdate
              ? <Button className="mr-1" color="primary" id="btn-admin-new" onClick={() => { this.setState({ command: 'Add' }); this.toggleForm(); }}>
                <FontAwesome name="plus" />&nbsp; New {this.props.recordNameSingular}
              </Button>
              : undefined
          }
          {
            this.props.extraButtons !== undefined
            ? this.props.extraButtons
            : undefined
          }
        </div>

        <ReactiveTableStore credentials={'include'} server tableId={`adm-cfg-${this.props.recordNamePlural}`}>
          <ReactiveTable
            credentials={'include'} server
            url={this.props.gridURL} ref={(table) => this.table = table}
            columns={this.state.columns}
            fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
            fetchErrorHandler={FetchUtilities.handleError}
            row={MyGridRow}
            striped columnFilters advancedColumns />
        </ReactiveTableStore>

        {
          /* Modal wrapping form component */
          this.state.canUpdate && this.state.formVisible
            ? (
              <ComponentModal show={this.state.formVisible}
                title={`${this.state.command} ${this.props.recordNameSingular}`}
                toggleModal={this.toggleForm}>
                <this.props.form id={idModal} parentCallback={this.onSubmit} toggleForm={this.toggleForm} />
              </ComponentModal>
            )
            : undefined
        }

        {
          /* Modal for confirming deletion */
          this.state.canUpdate
            ? <ConfirmDeleteModal
              show={this.state.deleteModal}
              message={`You are about to delete the ${this.props.recordNameSingular} with ID ${this.state.recordId}. Deleted ${this.props.recordNamePlural} cannot be recovered. Would you like to proceed?`}
              handleClose={this.toggleDeleteModal}
              handleConfirmation={() => this._onDelete(this.state.recordId)}
            />
            : undefined
        }

        {
          /* Notify for success/failure/error */
          this.state.notifyType === 'success' ? (
            <FloatNotifySuccess message={this.state.notifyMessage} autoDismiss />
          ) : this.state.notifyType === 'danger' ? (
            <InfoModal icon='exclamation-circle' color='danger'
              title='Error' message={this.state.notifyMessage}
              handleClose={() => this.setState({ notifyType: undefined })} />
          ) : undefined
        }
      </div>
    );
  }
}

class GridRow extends React.Component {

  render() {
    const record = this.props.data;
    const buttons = [
      { 'icon': 'pencil', 'title': 'Edit ' + this.props.recordNameSingular, 'callback': () => this.props._onEditCallback(record[this.props.id]) },
      { 'icon': 'trash', 'title': 'Delete ' + this.props.recordNameSingular, 'callback': () => this.props._onDeleteCallback(record[this.props.id]) }
    ];

    const cells = this.props.columns.map((column, row) => {
      const key = 'column-' + column.key + '-' + row;
      if (column.key === 'adminActionColumn') {
        return <GridActionCell key={key} buttons={buttons} />
      } else {
        return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
      }
    });

    return <tr>{cells}</tr>
  }
}

AdminComponent.propTypes = {
  recordNameSingular: PropTypes.string,
  recordNamePlural: PropTypes.string,
  adminRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  userAccess: PropTypes.arrayOf(PropTypes.string).isRequired,
  gridURL: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  id: PropTypes.string,
  form: PropTypes.oneOfType([
    PropTypes.element.isRequired,
    PropTypes.func.isRequired
  ])
};

export default AdminComponent;
