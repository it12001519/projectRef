import React, { Component, } from 'react'
import FetchUtilities, { fetchGet, fetchPost, fetchPut, fetchDelete, } from 'js/universal/FetchUtilities'
import Validator from 'validatorjs'
import { Link } from 'react-router-dom'
import moment from 'moment'

import { Row, Col, Button, FormGroup, Label, Table, Collapse, Card, } from 'reactstrap'
import SuperCard from 'js/universal/SuperCard'
import { PrimaryButton, NeutralButton, SecondaryButton, DangerButton, InfoAlert, } from 'js/app/models/ChangelinkUI'
import FormWidget from 'js/universal/FormFieldWidgets'
import Spinner, { showOverlaySpinner, hideOverlaySpinner, } from 'js/universal/spinner'
import { confirmDeleteModal, successModal, warningModal, errorModal, } from 'js/universal/Modals'
import ScrollToTop from 'js/universal/ScrollToTop'


const URL_FORM_CHANGE_HEADER = '/api/v1/forms/slug/change-header/'
const URL_FORM_CHANGE = '/api/v1/forms/slug/change/'
const URL_FORM_BASE = '/api/v1/forms/{}/fields/'
const URL_SUBFORM_BASE = '/api/v1/forms/{1}/sub/{2}/fields/'

const URL_DATA_CHANGE = '/api/v1/forms/change/{}/data/'
const URL_DATA_ATTR = '/api/v1/forms/change/{}/attr/'
const URL_LEGACY_CHECK = '/api/v1/change/{}/legacy/'
const URL_CHANGE_SBE_DATA = '/api/v1/attributes/{}'
const URL_CHANGE = '/api/v1/change/{}'

const URL_CHANGE_LIST = '/changes/'
const URL_CHANGE_BASE = '/api/v1/change/{}'
const URL_CHANGE_COPY = '/api/v1/change/{}/copy'
const URL_CHANGE_DELETE = '/api/v1/change/{}/delete'
const URL_CHANGE_SUBMIT = '/api/v1/change/{}/state/submit'

const COPY_REDIRECT_SECONDS = 3

const SBE_COLS =
  [
    { key: 'sbe', label: 'SBE' },
    { key: 'sbe1', label: 'SBE-1' },
    { key: 'sbe2', label: 'SBE-2' },
  ]

  
class AttributesTab extends Component {
  
  state = {
    changeNumber: this.props.changeNumber,
    // data attributes
    form:       { change: {}, attr: [], subs: [] }, 
    data:       { change: {}, attr: {}, subs: [] },
    validation: { change: {}, attr: {}, subs: [] }, 
    // utility attributes
    editMode: false
  }

  toggleEditMode = () => {
    this.setState({ editMode: !this.state.editMode })
  }

  isValid = () => {
    let attrRules = { ...this.state.validation.attr }
    this.state.validation.subs.forEach((sub) => {
      Object.assign(attrRules, sub)
    })
    let changeValidator = new Validator(this.state.data.change, this.state.validation.change, FormWidget.defaultValidationMessages)
    let attrValidator = new Validator(this.state.data.attr, attrRules, FormWidget.defaultValidationMessages)
    return changeValidator.passes() && attrValidator.passes()
  }

  saveChanges = () => {
    if (this.isValid()) {
      showOverlaySpinner()

      fetchPost(URL_CHANGE_BASE.replace('{}', this.state.changeNumber), 
      JSON.stringify({
        "changeData": this.state.data.change,
        "groupData": this.state.data.attr
      }),
      (httpStatus, response) => { 
        this.setState({ editMode: false })
        this.resetSubFields()
        this.fetchChangeForm()
        hideOverlaySpinner()
      }, _=> { hideOverlaySpinner() })
    }
  }

  copyChange = () => {
    showOverlaySpinner()
    fetchPut(URL_CHANGE_COPY.replace('{}', this.state.changeNumber), {}, 
      (httpStatus, response) => {
        successModal(
          <span>Successfully copied change into new record <a href={`/change/${response.changeNumber}`}>{`${response.changeNumber}`}</a>
          <br/>{`Redirecting in ${COPY_REDIRECT_SECONDS} seconds...`}
          </span>
        )
        hideOverlaySpinner()
        // Automatically redirect user after a set amount of time
        let timer = setTimeout(_=> {
          if (typeof this.props.redirect === 'function')
            this.props.redirect(`/change/${response.changeNumber}`)
          else
            window.location = URL_CHANGE_LIST // By default, set location to change list
        }, COPY_REDIRECT_SECONDS * 1000)
      }, _=> hideOverlaySpinner())
  }

  submit = () => {
    if (this.isValid()) {
      showOverlaySpinner()
      fetchPost(URL_CHANGE_SUBMIT.replace('{}', this.state.changeNumber), 
        JSON.stringify({
          "changeData": this.state.data.change,
          "groupData": this.state.data.attr
        }),
        (httpStatus, response) => {
          hideOverlaySpinner()
          if (httpStatus >= 200 && httpStatus < 300) {
            successModal(`Updated change state for ${this.state.changeNumber} to Submitted`)
            if (typeof this.props.refresh === 'function') {
              this.props.refresh() // Refresh the parent page to reflect updated data
              this.setState({ canSubmit: false })
            } else {
              window.location.reload() // Refresh the whole page as fallback
            }
          } else {
            warningModal(response.message)
          }
        }, _=> hideOverlaySpinner()
      )
    } else {
      warningModal('Please review the form. Invalid field values found.')
      this.toggleEditMode()
    }
  }

  deleteChange = () => {
    confirmDeleteModal(`Are you sure you want to delete change ${this.state.changeNumber}?`, _=> {
      showOverlaySpinner()
      fetchDelete(URL_CHANGE_DELETE.replace('{}', this.state.changeNumber),  
      (httpStatus, response) => {
        hideOverlaySpinner()
        successModal(`Successfully deleted change record ${this.state.changeNumber}`, _=> { 
          if (typeof this.props.redirect === 'function')
            this.props.redirect(URL_CHANGE_LIST)
          else
            window.location = URL_CHANGE_LIST // By default, set location to change list
        })
      }, _=> hideOverlaySpinner())
    })
  }

  onChange_ChangeData = (name, value) => {
    this.setState((previousState) => {
      if (Array.isArray(value))
        previousState.data.change = { ...previousState.data.change, [name]: value.filter((v, i, a) => a.indexOf(v) === i) };
      else
        previousState.data.change = { ...previousState.data.change, [name]: value };
      return previousState;
    });
  }

  onChange_AttrData = (name, value) => { 
    // Check if the field is a checkbox with a sub-form trigger
    let filterField = this.state.form.attr.filter(attr => { return attr.name === name })
    if (filterField.length > 0 && filterField[0].widget === 'CHECKBOX') {
      const subId = this.state.form.attr.filter(attr => { return attr.name === name })[0].id
      if (value === true || value === 'true')
        this.fetchSubFields(subId, 'subs')
      else
        this.setState((previousState) => {
          // Remove the data from state
          this.state.form.subs.filter((s) => { return s.id === subId }).forEach((item, i) => {
            previousState.data.attr[item.name] = undefined
          })
          // Remove the fields from state
          previousState.form.subs = this.state.form.subs.filter((s) => { return s.id !== subId })
          return previousState
        })
    }

    this.setState((previousState) => {
      if (Array.isArray(value))
        previousState.data.attr = { ...previousState.data.attr, [name]: value.filter((v, i, a) => a.indexOf(v) === i) };
      else
        previousState.data.attr = { ...previousState.data.attr, [name]: value };
      return previousState;
    })
  }

  fetchFields = (url, attr) => { 
    fetchGet(url, 
    (httpStatus, response) => {
      let form = { ...this.state.form }, rules = { ...this.state.validation }, newrules = {}
      response.forEach(({ name, validation }, i) => {
        if (!!validation && validation !== null)
          newrules[name] = eval(validation)
      })

      rules[attr] = newrules
      form[attr] = response
    
      this.setState({ form })
      this.setState({ validation: rules })
    })
  }

  fetchSubFields = (id, attr) => {
    fetchGet(`${URL_SUBFORM_BASE}`
        .replace('{1}', this.state.data.change['CHANGE_GROUP_ID'])
        .replace('{2}', id), 
    (httpStatus, response) => { 
      if (typeof response !== 'undefined' && response.length > 0) {
        let form = { ...this.state.form }, rules = { ...this.state.validation }, newrules = {}
        response.forEach(({ name, validation }, i) => {
          if (!!validation && validation !== null)
            newrules[name] = eval(validation)
        })
        let formData = {}
        formData.id = id
        formData.fields = response

        rules[attr][id] = newrules
        form[attr].push(formData)
      
        this.setState({ form })
        this.setState({ validation: rules })
      }
    })
  }

  fetchData = (url, attr, callback) => {
    fetchGet(url, 
      (httpStatus, response) => {
        let data = { ...this.state.data }
        data[attr] = response
        this.setState({ data })
        if (typeof callback === 'function')
          callback(data)
      })
  }

  fetchChangeForm = () => {
    this.fetchFields(`${URL_FORM_CHANGE_HEADER}`, 'header')
    this.fetchFields(`${URL_FORM_CHANGE}`, 'change')
    this.fetchData(`${URL_DATA_CHANGE}`.replace('{}', this.state.changeNumber), 'change', (data) => this.fetchAttrForm(data)) 
    this.fetchSbeData(this.state.changeNumber)   
    this.fetchChange(this.state.changeNumber)
  }

  fetchAttrForm = (data) => {
    fetchGet(`${URL_LEGACY_CHECK}`.replace('{}', this.state.changeNumber), 
      (httpStatus, response) => {
        this.fetchFields(`${URL_FORM_BASE}?legacy=${response.isLegacy}`.replace('{}', data.change['CHANGE_GROUP_ID']), 'attr')
        this.fetchData(`${URL_DATA_ATTR}`.replace('{}', this.state.changeNumber), 'attr', (data2) => this.fetchAttrSubs(data2))
      })
  }

  fetchAttrSubs = (data) => {
    this.state.form.attr
      .filter(item => { return item.widget === 'CHECKBOX' })
      .forEach((elem, i) => {
        const value = data.attr[elem.name]
        if (value === 'on' || value === 'true') {
          const mainField = this.state.form.attr.filter(attr => { return attr.name === elem.name })[0]
          if (mainField !== undefined)
            this.fetchSubFields(mainField.id, 'subs')
        }
      })
  }

  fetchSbeData = (change) => {
    fetchGet(`${URL_CHANGE_SBE_DATA}`.replace('{}', change), 
      (httpStatus, response) => {
        this.setState({ 
          sbeData: response.changeSBE
        })
      })
  }

  fetchChange = (change) => {
    fetchGet(`${URL_CHANGE}`.replace('{}', change), 
      (httpStatus, response) => { 
        if (!!response && !!response.state)
          this.setState({ 
            change: response,
            canSubmit: response.state.toUpperCase() === 'DEFINITION' 
          })
      })
  }

  resetSubFields = () => {
    let form = { ...this.state.form }, rules = { ...this.state.validation }
    rules['attr'] = {}
    form['attr'] = [] // reset the main form at the bottom of the page
    form['subs'] = [] // reset the sub-forms at the bottom of the page
    this.setState({ form })
  }

  componentDidMount() {
    this.fetchChangeForm()
  }

  render() {
    console.log(this.state)
    return (
      <div className={this.props.className}>

        {
          !!this.state.change
          ? <InfoAlert message={`Last updated by ${this.state.change.updatedByName} (${this.state.change.updatedByBadge}) on ${moment(this.state.change.updatedDttm).format("YYYY-MM-DD")}`} />
          : undefined
        }

        {
          this.state.editMode
          ? <Row>
            <Col xs={12}>
              <span className='pull-right'>
                <PrimaryButton label='Save Changes' icon='save' className='mr-1' onClick={this.saveChanges}/>
                <NeutralButton label='Cancel' className='mr-1' onClick={this.toggleEditMode} />
              </span>
            </Col>
          </Row>
          : <Row>
            <Col xs={12} md={6}><ChangeSBE sbeData={this.state.sbeData} /></Col>
            <Col xs={12} md={6}>
              { this.props.canDelete ? <DangerButton label='Delete' icon='trash' className='m-1 pull-right' onClick={this.deleteChange} /> : undefined }
              { this.props.canCopy ? <SecondaryButton label='Copy' icon='clone' className='m-1 pull-right' onClick={this.copyChange} /> : undefined }
              { this.props.canEdit ? <PrimaryButton label='Edit' icon='pencil' className='m-1 pull-right' onClick={this.toggleEditMode} /> : undefined }
              { this.props.canEdit && this.state.canSubmit ? <PrimaryButton label='Submit' icon='forward' className='m-1 pull-right' onClick={this.submit} /> : undefined }
            </Col>
          </Row>
        }

        {
          !!this.state.form.header && !!this.state.form.change
            ? <FormWidget fields={this.state.form.change} rules={this.state.editMode ? this.state.validation.change : undefined} values={this.state.data.change}
                onChange={this.onChange_ChangeData} readonly={!this.state.editMode} />
            : <Spinner showSpinner overlay={false} />
        }        

        <hr />
        
        {
          !!this.state.form.attr 
          ? (
            <SuperCard title={`${this.state.data.change['CHANGE_GROUP']} Data`}>
              <FormWidget fields={this.state.form.attr} rules={this.state.editMode ? this.state.validation.attr : undefined} values={this.state.data.attr}
                onChange={this.onChange_AttrData} readonly={!this.state.editMode} />
                {
                  !!this.state.form.subs 
                  ? this.state.form.subs.map((sub, i) => {
                    return <FormWidget fields={sub.fields} rules={this.state.editMode ? this.state.validation.subs[sub.id] : undefined} values={this.state.data.attr}
                      onChange={this.onChange_AttrData} readonly={!this.state.editMode} key={`subform-${sub.id}`} />
                  })
                  : undefined
                }
            </SuperCard>
          )
          : undefined
        }
        
        <ScrollToTop placement="right" color="primary" />
      </div>
    )
  }
}

class ChangeSBE extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: false };
  }

  render() {
    return (
      <FormGroup>
        <Label for="sbeStructure" id="lblSbeStructure" onClick={() => this.setState({ isOpen: !this.state.isOpen })}><Button color="link">SBE Structure</Button></Label>
        <Collapse isOpen={this.state.isOpen}>
          <Card>
            <Table>
              <thead>
                <tr key={`tblSbeStructure::row::th`}>
                  {
                    SBE_COLS.map((column) => {
                      return (
                        <th key={`tblSbeStructure::col::${column.key}`}>{column.label}</th>
                      );
                    })
                  }
                </tr>
              </thead>
              <tbody>
                {
                  !!this.props.sbeData
                    ? this.props.sbeData.map((sbeInfo, row) => {
                      return (
                        <tr key={`tblSbeStructure::row::${row}`}>
                          {
                            SBE_COLS.map((column) => {
                              return (
                                <td key={`tblSbeStructure::cell::${column}::${sbeInfo[column.key]}`}>{sbeInfo[column.key]}</td>
                              );
                            })
                          }
                        </tr>
                      );

                    })
                    : <tr><td colSpan={100}>No records</td></tr>
                }

              </tbody>
            </Table>
          </Card>
        </Collapse>
      </FormGroup>
    );
  }

}

export default AttributesTab