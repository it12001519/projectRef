import React from 'react'
import { Button, } from 'reactstrap'
import FontAwesome from 'react-fontawesome'
import styled from 'styled-components'
import classnames from 'classnames'
import withLayout from 'js/app/models/withLayout'
import FetchUtilities from 'js/universal/FetchUtilities'
import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb'
import ChangeLinkHelp from 'js/app/models/ChangeLinkHelp'
import Spinner from 'js/universal/spinner'

const ADMIN_ROLES = ['System Admin', 'ChangeLink Admin']

const ROLES_URL = '/json/usersvc/role-list.json' // Mock data
const DATA_URL = '/json/usersvc/data-list.json' // Mock data
const CUSTOM_URL = '/json/usersvc/custom-list.json' // Mock data
// const ROLES_URL = '/api/v1/permission/roles' // API live data
// const DATA_URL = '/api/v1/permission/data' // API live data
// const CUSTOM_URL = '/api/v1/permission/custom' // API live data

let headers = new Headers({
  'Pragma': 'no-cache',
  'Cache-Control': 'no-cache'
})

class PermissionMain extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      roles: [],
      data: undefined,
      // canUpdate: props.hasRole(ADMIN_ROLES),
      canUpdate: false,
      isDirty: false,
      notifyType: undefined,
      notifyMessage: ''
    }

    this.loadRoles = this.loadRoles.bind(this)
    this.loadData = this.loadData.bind(this)
    this.loadCustomRules = this.loadCustomRules.bind(this)
  }

  // TODO - use this version

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.userAccess && (nextProps.userAccess !== this.props.userAccess))
  //       this.setState({
  //           canUpdate: nextProps.hasRole(ADMIN_ROLES)
  //       })
  // }

  componentWillReceiveProps(nextProps) {
    if (nextProps.userAccess) {
      let canUpdate = false;
      for (let i in ADMIN_ROLES) {
        canUpdate = nextProps.userAccess.includes(ADMIN_ROLES[i]) ? true : canUpdate
      }
      this.setState({ canUpdate })
    }
  }

  componentDidMount() {
    this.loadRoles()
    this.loadData()
    this.loadCustomRules()
  }

  loadRoles() {
    // Fetch the list of roles
    fetch(ROLES_URL, { credentials: 'include', headers: headers })
      .then(FetchUtilities.checkStatusWithSecurity)
      .then((response) => { return response.json() })
      .then((json) => { this.setState({ roles: json }) })
      .catch((ex) => { throw ex })
  }

  loadData() {
    // Fetch the data for page rules
    fetch(DATA_URL, { credentials: 'include', headers: headers })
      .then(FetchUtilities.checkStatusWithSecurity)
      .then((response) => { return response.json() })
      .then((json) => {
        this.setState((previousState) => {
          previousState.data = { ...previousState.data, pages: json }
          return previousState
        })
      })
      .catch((ex) => { throw ex })
  }

  loadCustomRules() {
    // Fetch the data for custom rules
    fetch(CUSTOM_URL, { credentials: 'include', headers: headers })
      .then(FetchUtilities.checkStatusWithSecurity)
      .then((response) => { return response.json() })
      .then((json) => {
        this.setState((previousState) => {
          previousState.data = { ...previousState.data, custom: json }
          return previousState
        })
      })
      .catch((ex) => { throw ex })
  }

  updatePagePermission(id, role, type, state) {
    this.setState({ isDirty: true })
  }

  updateCustomPermission(id, role, state) {
    this.setState({ isDirty: true })
  }

  handleSave() {
    alert('Under Construction...')
  }

  render() {
    if (this.state.data !== undefined) {
      return (
        <div className={this.props.className}>

          <div className='mb-1 clearfix'>
            <div className='float-left'>
              <ChangeLinkBreadcrumb className='float-left' crumbs={[
                { text: 'Home', to: "/" },
                { text: 'Admin' },
                { text: 'Permissions', active: true }
              ]} />
              <ChangeLinkHelp text='This page allows admins to enable or disable role permissions for Changelink pages and functions' />
            </div>
            {/* TODO uncomment
              <div className='float-right'>
              {
                this.state.canUpdate
                  ?
                  this.state.isDirty
                    ? <Button color="primary" className="mr-1" onClick={this.handleSave.bind(this)}><FontAwesome name="save" />{' '}Save Changes</Button>
                    : <Button color="primary" className="mr-1" disabled><FontAwesome name="save" />{' '}Save Changes</Button>
                  : undefined
              }
            </div> */}
          </div>

          {/* <div className='table-responsive clearfix'> */}
            <table className='table table-bordered table-striped table-sm table-hover'>
              <thead className='thead-light'>
                <tr>
                  <th scope='col'></th>
                  {
                    this.state.roles.map((role) => {
                      return <th scope='col'>{role}</th>
                    })
                  }
                </tr>
              </thead>
              <tbody>
                {
                  this.state.data.pages !== undefined
                    ? this.state.data.pages.map((page) => {
                      return (
                        <tr>
                          <td scope='row'>{page.description}</td>
                          {
                            this.state.roles.map((role) => {
                              return <td className='td-icons'>
                                <PermissionPageToggle id={page.id} role={role}
                                  permissions={page.permissions[role]} callback={this.updatePagePermission.bind(this)} />
                              </td>
                            })
                          }
                        </tr>
                      )
                    })
                    : undefined
                }
                {
                  this.state.data.custom !== undefined
                    ? (
                      this.state.data.custom.length > 0
                        ? <tr className='table-active'>
                          <td colspan='99'>{' '}</td>
                        </tr>
                        : undefined
                    ) : undefined
                }
                {
                  this.state.data.custom !== undefined
                    ? (
                      this.state.data.custom.map((page) => {
                        return (
                          <tr>
                            <td scope='row'>{page.description}</td>
                            {
                              this.state.roles.map((role) => {
                                return <td className='td-icons'>
                                  <PermissionCustomToggle id={page.id} role={role}
                                    permissions={page.permissions[role]} callback={this.updateCustomPermission.bind(this)} />
                                </td>
                              })
                            }
                          </tr>
                        )
                      })
                    ) : undefined
                }
              </tbody>
            </table>
          {/* </div> */}
        </div>
      )
    } else {
      return (
        <div className={this.props.className}>
          <div className='mb-1'>
            <ChangeLinkBreadcrumb crumbs={[
              { text: 'Home', to: "/" },
              { text: 'Admin' },
              { text: 'Permissions', active: true }
            ]} />
          </div>
          <div>
            <Spinner showSpinner overlay={false} />
          </div>
        </div>
      )
    }
  }
}

const READ = 'R'
const ADD = 'A'
const EDIT = 'E'
const DELETE = 'D'

let PermissionPageToggle = class extends React.Component {

  static defaultProps = {
    permissions: ''
  }

  constructor(props) {
    super(props);
    this.state = {
      canRead: props.permissions.indexOf(READ) > -1,
      canAdd: props.permissions.indexOf(ADD) > -1,
      canEdit: props.permissions.indexOf(EDIT) > -1,
      canDelete: props.permissions.indexOf(DELETE) > -1
    }

    this.togglePermission = this.togglePermission.bind(this)
  }

  togglePermission(type) {
    //let type = e.target.value
    let state = undefined
    switch (type) {
      case READ:
        state = !this.state.canRead
        this.setState({ canRead: state })
        break
      case ADD:
        state = !this.state.canAdd
        this.setState({ canAdd: state })
        break
      case EDIT:
        state = !this.state.canEdit
        this.setState({ canEdit: state })
        break
      case DELETE:
        state = !this.state.canDelete
        this.setState({ canDelete: state })
        break
    }

    // Make sure to update the parent as well
    if (this.props.callback.type === 'function') {
      this.props.callback(this.props.id, this.props.role, type, state)
    }
  }

  render() {
    return (
      <span>
        <div>
          <i className={classnames('fa fa-fw fa-lg clickable-icon fa-eye', { 'fa-disabled': !this.state.canRead })}
            onClick={() => this.togglePermission(READ)} title='view' />
          <i className={classnames('fa fa-fw fa-lg clickable-icon fa-plus', { 'fa-disabled': !this.state.canAdd })}
            onClick={() => this.togglePermission(ADD)} title='add' />
        </div>
        <div>
          <i className={classnames('fa fa-fw fa-lg clickable-icon fa-pencil', { 'fa-disabled': !this.state.canEdit })}
            onClick={() => this.togglePermission(EDIT)} title='edit' />
          <i className={classnames('fa fa-fw fa-lg clickable-icon fa-trash', { 'fa-disabled': !this.state.canDelete })}
            onClick={() => this.togglePermission(DELETE)} title='delete' />
        </div>
      </span>
    )
  }
}

let PermissionCustomToggle = class extends React.Component {

  static defaultProps = {
    permissions: ''
  }

  constructor(props) {
    super(props);
    this.state = {
      canDo: props.permissions !== ''
    }

    this.togglePermission = this.togglePermission.bind(this)
  }

  togglePermission(type) {
    let state = !this.state.canDo
    this.setState({ canDo: state })

    // Make sure to update the parent as well
    if (this.props.callback.type === 'function') {
      this.props.callback(this.props.id, this.props.role, state)
    }
  }

  render() {
    return (
      this.state.canDo
        ? <i className='fa fa-check-square fa-fw fa-lg clickable-icon' onClick={this.togglePermission} />
        : <i className='fa fa-square-o fa-fw fa-lg clickable-icon' onClick={this.togglePermission} />
    )
  }
}

export default styled(withLayout(PermissionMain)) `
tbody > tr > td.td-icons { text-align: center; width: 85px; } 
.clickable-icon { cursor: pointer }
.fa-disabled { color: darkgrey }
`;