import React from 'react'
import withLayout from 'js/app/models/withLayout'
import FetchUtilities from 'js/universal/FetchUtilities'
import Validator from 'validatorjs'

import Spinner, { showOverlaySpinner, hideOverlaySpinner } from 'js/universal/spinner'
import SuperCard from 'js/universal/SuperCard'
import FormWidget, { FormWidgetLazyLoadSelect } from 'js/universal/FormFieldWidgets'
import { PageHeader, SubHeader, PrimaryButton, NeutralButton, } from 'js/app/models/ChangelinkUI'
import { createModal, warningModal, } from 'js/universal/Modals'

// Page constant attributes
const URL_CHANGE_TYPES = '/api/dropdown/change-type'
const URL_FORM_CHANGE = '/api/v1/forms/slug/change/'
const URL_FORM_BASE = '/api/v1/forms/{1}/fields/'
const URL_SUBFORM_BASE = '/api/v1/forms/{1}/sub/{2}/fields/'

const URL_CREATE_INIT = '/api/v1/change/create/init'
const URL_CREATE_POST = '/api/v1/change/create/{1}/'

const URL_CHANGE_PAGE = '/change/{1}'

let ChangeCreatePage = class extends React.Component {

  static contextTypes = {
    router: 'object'
  }

  static defaultProps = {
    changeNumber: ''
  }

  state = {
    type: '', typeLabel: '', activeTab: this.props.activeTab,
    form: { change: {}, attr: {}, subs: [] },
    data: { change: {}, attr: {} },
    validation: { change: {}, attr: {}, subs: [] },
  }

  onChangeType = (name, value) => {
    const label = this.state.changetypes.find(item => { return item.value === value })
    this.setState({ type: value, typeLabel: label.label })
    
    // Fetch the new set of form fields
    if (value !== undefined && value !== '') {
      FetchUtilities.fetchGet(URL_FORM_BASE.replace('{1}', value),
        (httpStatus, response) => {
          let form = { ...this.state.form }, rules = { ...this.state.validation }, newrules = {}
          response.forEach(({ name, validation }, i) => {
            if (!!validation && validation !== null)
              newrules[name] = eval(validation)
          })

          form.attr = response
          form.subs = []
          rules.attr = newrules

          this.setState((previousState) => {
            previousState.form = form
            previousState.validation = rules
            previousState.data = { attr: {} }
            return previousState;
          })
          this.fetchChangeData() // reset the change data
        })
      } else {
        // Remove the current form to force a loading state
        this.setState((previousState) => {
          previousState.form = { ...previousState.form, 'attr': undefined }
          previousState.form.subs = []
          previousState.data = { change: {}, attr: {} }
          return previousState
        })
      }
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
    let fields = this.state.form.attr.filter(attr => { return attr.name === name })
    if (fields.length > 0 && fields[0].widget === 'CHECKBOX') {
      const subId = this.state.form.attr.filter(attr => { return attr.name === name })[0].id
      if (value === true || value === 'true')
        this.fetchSubFields(subId)
      else
        this.setState((previousState) => {
          // Remove the data from state
          this.state.form.subs.filter((s) => { return s.id === subId }).forEach((form, i) => { 
            form.fields.forEach((item, j) => {
              previousState.data.attr[item.name] = undefined
            })
          })
          // Remove the fields from state
          previousState.form.subs = this.state.form.subs.filter((s) => { return s.id !== subId })
          return previousState
        })
    }

    this.setState((previousState) => {
      previousState.data.attr = { ...previousState.data.attr, [name]: value };
      return previousState;
    })
  }

  fetchSubFields = (id) => {
    FetchUtilities.fetchGet(`${URL_SUBFORM_BASE}`
      .replace('{1}', this.state.type)
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

          rules['subs'][id] = newrules
          form['subs'].push(formData)

          this.setState({ form })
          this.setState({ validation: rules })
        }
      })
  }

  fetchChangeData = () => {
    FetchUtilities.fetchGet(`${URL_CREATE_INIT}`,
      (httpStatus, response) => { 
        this.setState((previousState) => {
          previousState.data = { ...previousState.data, change: response };
          return previousState;
        })
      })
  }

  saveChanges = () => {
    if (this.isValid()) {
      showOverlaySpinner()

      FetchUtilities.fetchPost(`${URL_CREATE_POST}`.replace('{1}', this.state.type), 
      JSON.stringify({
        "changeData": this.state.data.change,
        "groupData": this.state.data.attr
      }),
      (httpStatus, response) => { 
        hideOverlaySpinner()
        if (!!response.change) {
          // Redirect to the newly created change
          let changeNumber = response.change.changeNumber
          let url = `${URL_CHANGE_PAGE}`.replace('{1}', changeNumber)

          let message = []
          let btnLabelDeviceList = 'Create Device List'
          message.push(<SubHeader>New Change Created: <b>{`${changeNumber}`}</b></SubHeader>)
          if (!!response.devices && !!response.devices.count && response.devices.count > 0) {
            btnLabelDeviceList = 'View Device List'
            message.push(<p style={{ clear: 'both' }}>Automatically created a Device List with {`${response.devices.count}`} devices</p>)
          }
          
          createModal({
            id: 'chglk-create-success-modal',
            icon: 'check-circle',
            show: true,
            color: 'success',
            title: 'Change Created',
            clickOutside: false,
            message: message,
            onClose:  _=> this.props.history.push(`${url}/devices`),
            buttons: [{ color: 'primary', label: btnLabelDeviceList, onClick: _=> this.props.history.push(`${url}/devices`) },
                      { color: 'secondary', outline: true, label: `Open Change Number ${changeNumber}`, onClick: _=> this.props.history.push(url) }]
          }, _=> this.props.history.push(`${url}/devices`))
        }
      }, _=> { hideOverlaySpinner() })
    } else {
      warningModal('Please review the form. Invalid field values found.')
    }
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

  componentDidMount() {
    showOverlaySpinner()
    // Fetch the list of change types
    FetchUtilities.fetchGet(`${URL_CHANGE_TYPES}`,
      (httpStatus, response) => {
        this.setState({ changetypes: response })
      })

    // Fetch the change form fields
    FetchUtilities.fetchGet(`${URL_FORM_CHANGE}`,
      (httpStatus, response) => {
        let form = { ...this.state.form }, rules = { ...this.state.validation }, newrules = {}
        response.forEach(({ name, validation }, i) => {
          if (!!validation && validation !== null)
            newrules[name] = eval(validation)
        })
        rules.change = newrules
        form.change = response
        this.setState({ form })
        this.setState({ validation: rules })
        hideOverlaySpinner();
      })

    this.fetchChangeData()
  }

  render() {
    return (
      <React.Fragment>
        <PageHeader>
          {!!this.state.typeLabel ? `Create Change : ${this.state.typeLabel}` : `Create Change`}
        </PageHeader>
        
        <hr/>

        <SelectChangeGroup value={this.state.type} onChange={this.onChangeType}
                           disabled={this.props.saved} inline required />

        {
          // Hide all the other form fields until a Change Group is selected
          !!this.state.typeLabel
            ? <React.Fragment>
              <hr />
              {
                !!this.state.form.change ?
                  <FormWidget fields={this.state.form.change} rules={this.state.validation.change} values={this.state.data.change}
                    onChange={this.onChange_ChangeData} />
                  : <Spinner showSpinner overlay={false} className='m-3 p-3' />
              }

              <hr />
              <SuperCard key={`create-chg-grp-form`} title={!!this.state.typeLabel ? `${this.state.typeLabel} Data` : 'Change Group Data'}>
                {
                  !!this.state.form.attr ?
                    <FormWidget fields={this.state.form.attr} rules={this.state.validation.attr} values={this.state.data.attr}
                      onChange={this.onChange_AttrData} />
                    : <Spinner showSpinner overlay={false} className='m-3 p-3' />
                }
                {
                  !!this.state.form.subs
                    ? this.state.form.subs.map((sub, i) => {
                      return <FormWidget fields={sub.fields} rules={this.state.validation.subs[sub.id]} values={this.state.data.attr}
                        onChange={this.onChange_AttrData} key={`subform-${sub.id}`} />
                    })
                    : undefined
                }
              </SuperCard>

              <span className='pull-right mb-3'>
                <PrimaryButton label='Save Changes' icon='save' className='mr-1' onClick={this.saveChanges} />
                <NeutralButton label='Cancel' className='mr-1' onClick={_=> this.context.router.history.goBack()} />
              </span>
            </React.Fragment>
            : undefined
        }
      </React.Fragment>
    )
  }
}

const SelectChangeGroup = ({ label, value, inline, required, disabled, onChange }) => {
  let mylabel = label || 'Change Group'
  let myinline = !!inline ? inline : true
  let myrequired = !!required ? required : false
  let mydisabled = !!disabled ? disabled : false
  const OPTIONS_SOURCE = '/api/dropdown/change-type'
  return <FormWidgetLazyLoadSelect label={mylabel} value={value} 
    inline={myinline} required={myrequired} disabled={mydisabled}
    optionsSource={OPTIONS_SOURCE} onChange={onChange} />
}

export default withLayout(ChangeCreatePage)