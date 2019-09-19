import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import styled from 'styled-components'
import classnames from 'classnames'
import Validator from 'validatorjs'
import { fetchGet, fetchPost, } from 'js/universal/FetchUtilities'

import { Form, FormGroup, FormText, Row, Col, Label, Input, ButtonGroup, Button } from 'reactstrap'
import { PrimaryButton, SecondaryButton, NeutralButton, } from 'js/app/models/ChangelinkUI'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import Required from 'js/universal/Required'
import { Typeahead } from 'react-bootstrap-typeahead'

const SELECT_SIZE_TALL = 5 // Default size of a tall default select component
const MIN_TYPEAHEAD_SEARCH_CHAR_LENGTH = 3 // Default number of characters to trigger a search in typeahead components

const defaultValidationMessages = {
  min: 'This field may not be less than :min characters',
  max: 'This field may not be greater than :max characters',
  integer: 'This field only accepts numeric values',
  numeric: 'This field only accepts numeric values',
  required: 'This field is required',
  required_if: 'This field is required',
  required_with: 'This field is required',
  required_without: 'This field is required',
}

let FormWidget = class extends React.Component {

  static defaultProps = {
    fields: [],
    values: {},
    rules: {},
    buttons: [],
    inline: false,
    readonly: false,
    noValidate: false
  }

  state = {
    validity: {}, 
    messages: {}
  }

  _onChange = (name, value) => {
    if (!this.props.noValidate) {
      let validator = new Validator({ [name]: value }, this.props.rules, defaultValidationMessages);
      validator.passes();
      this.setState((previousState) => {
        previousState.validity = { ...previousState.validity, [name]: !validator.errors.has(name) };
        previousState.errors = { ...previousState.messages, [name]: validator.errors.has(name) ? validator.errors.first(name) : null };
        return previousState;
      });
    }
    if (typeof this.props.onChange === 'function')
      this.props.onChange(name, value)
    if (!!this.props.onChangeCallbacks && typeof this.props.onChangeCallbacks[name] === 'function')
      this.props.onChangeCallbacks[name](value)
  }

  validate = (fields, values) => { 
    // Validate the form if rules are defined
    if (this.props.rules !== {}) {
      let validator = new Validator(values, this.props.rules, defaultValidationMessages);
      validator.passes();

      let formValidity = {};
      let formErrors = {};
      fields.forEach((field) => {
        formValidity[field.name] = !validator.errors.has(field.name);
        formErrors[field.name] = validator.errors.has(field.name) ? validator.errors.first(field.name) : null;
      })

      this.setState({ validity: formValidity, messages: formErrors })
    }
  }

  componentDidMount() { 
    if (!this.props.noValidate) {
      let fields = this.props.fields
      if (!Array.isArray(fields))
        fields = []
      this.validate(fields, this.props.values)
    }
  }

  componentWillReceiveProps(nextProps) {  
    if (!nextProps.noValidate) {
      let fields = nextProps.fields
      if (!Array.isArray(fields))
        fields = []
      this.validate(fields, nextProps.values)
    }
  }

  render() {
    const { fields, values, buttons, rules, inline, readonly } = this.props
    return (
      <Form noValidate>
        {fields.length > 0
          ? (
            <Row>
              {
                fields.map((field, i) => {
                  if (field.visible === undefined || field.visible) {
                    // Select Col options depending on given size option
                    let size = {};
                    switch (field.size) {
                      case 'sm':
                        size = { xs: 12, sm: 3 }
                        break
                      case 'lg':
                        size = { xs: 12, sm: 12, md: 9 }
                        break
                      case 'xl':
                        size = { xs: 12 }
                        break
                      case 'md':
                      default:
                        size = { xs: 12, sm: 12, md: 6 }
                    }
                    // Pick out the field value
                    let value = !!values && !!values[field.name] && values[field.name] !== null ? values[field.name] : ''
                    // Render the field depending on its widget type
                    switch (field.widget) {
                      case 'READONLY_TEXT':
                        return <Col key={`frm-col-${i}`} {...size}>
                          <FormWidgetText id={field.name} name={field.name} label={field.label} value={value} helptext={field.helptext}
                            readonly inline={inline} />
                        </Col>
                      case 'READONLY_DATE':
                        let dtvalue = values[field.name]
                        if (dtvalue !== undefined && dtvalue !== null && dtvalue !== '')
                          dtvalue = moment(dtvalue).format('YYYY-MM-DD [CST]')
                        return <Col key={`frm-col-${i}`} {...size}>
                          <FormWidgetText id={field.name} name={field.name} label={field.label} value={dtvalue} helptext={field.helptext}
                            readonly inline={inline} />
                        </Col>
                      case 'NUMBER':
                        return <Col key={`frm-col-${i}`} {...size}>
                          <FormWidgetNumber id={field.name} name={field.name} label={field.label} value={value} helptext={field.helptext}
                            onChange={this._onChange} required={!!rules[field.name] && !!rules[field.name].find(item => item === 'required')}
                            invalid={this.state.validity[field.name] !== undefined && !this.state.validity[field.name]} validationMessage={this.state.messages[field.name]}
                            disabled={field.disabled || readonly} readonly={readonly} inline={inline} />
                        </Col>
                      case 'TEXT':
                        return <Col key={`frm-col-${i}`} {...size}>
                          <FormWidgetText id={field.name} name={field.name} label={field.label} value={value} helptext={field.helptext}
                            onChange={this._onChange} required={!!rules[field.name] && !!rules[field.name].find(item => item === 'required')}
                            invalid={this.state.validity[field.name] !== undefined && !this.state.validity[field.name] !== undefined && !this.state.validity[field.name]} validationMessage={this.state.messages[field.name]}
                            disabled={field.disabled || readonly} readonly={readonly} inline={inline} />
                        </Col>
                      case 'TEXTAREA':
                        return <Col key={`frm-col-${i}`} {...size}>
                          <FormWidgetTextArea id={field.name} name={field.name} label={field.label} value={value} helptext={field.helptext}
                            onChange={this._onChange} required={!!rules[field.name] && !!rules[field.name].find(item => item === 'required')}
                            invalid={this.state.validity[field.name] !== undefined && !this.state.validity[field.name]} validationMessage={this.state.messages[field.name]}
                            disabled={field.disabled || readonly} readonly={readonly} inline={inline} />
                        </Col>
                      case 'DATE':
                        return <Col key={`frm-col-${i}`} {...size}>
                          <FormWidgetDatePicker id={field.name} name={field.name} label={field.label} value={value}
                            helptext={field.helptext}
                            onChange={this._onChange} required={!!rules[field.name] && !!rules[field.name].find(item => item === 'required')}
                            invalid={this.state.validity[field.name] !== undefined && !this.state.validity[field.name]} validationMessage={this.state.messages[field.name]}
                            disabled={field.disabled || readonly} readonly={readonly} inline={inline} />
                        </Col>
                      case 'SELECT':
                        return <Col key={`frm-col-${i}`} {...size}>
                          <FormWidgetLazyLoadSelect id={field.name} name={field.name} label={field.label} value={value}
                            helptext={field.helptext} optionsSource={field.optionsSource}
                            onChange={this._onChange} required={!!rules[field.name] && !!rules[field.name].find(item => item === 'required')}
                            invalid={this.state.validity[field.name] !== undefined && !this.state.validity[field.name]} validationMessage={this.state.messages[field.name]}
                            disabled={field.disabled || readonly} readonly={readonly} inline={inline} />
                        </Col>
                      case 'MULTISELECT':
                        return <Col key={`frm-col-${i}`} {...size}>
                          <FormWidgetLazyLoadMultiSelect id={field.name} name={field.name} label={field.label} value={values[field.name]}
                            helptext={field.helptext} optionsSource={field.optionsSource}
                            onChange={this._onChange} required={!!rules[field.name] && !!rules[field.name].find(item => item === 'required')}
                            invalid={this.state.validity[field.name] !== undefined && !this.state.validity[field.name]} validationMessage={this.state.messages[field.name]}
                            disabled={field.disabled || readonly} readonly={readonly} inline={inline} />
                        </Col>
                      case 'TYPEAHEAD':
                        return <Col key={`frm-col-${i}`} {...size}>
                          <FormWidgetTypeAheadSelect id={field.name} name={field.name} label={field.label} value={value}
                            helptext={field.helptext} optionsSource={field.optionsSource}
                            onChange={this._onChange} required={!!rules[field.name] && !!rules[field.name].find(item => item === 'required')}
                            invalid={this.state.validity[field.name] !== undefined && !this.state.validity[field.name]} validationMessage={this.state.messages[field.name]}
                            disabled={field.disabled || readonly} readonly={readonly} inline={inline} />
                        </Col>
                      case 'TYPEAHEAD_MULTI':
                        return <Col key={`frm-col-${i}`} {...size}>
                          <FormWidgetTypeAheadMultiSelect id={field.name} name={field.name} label={field.label} value={values[field.name]}
                            helptext={field.helptext} optionsSource={field.optionsSource}
                            onChange={this._onChange} required={!!rules[field.name] && !!rules[field.name].find(item => item === 'required')}
                            invalid={this.state.validity[field.name] !== undefined && !this.state.validity[field.name]} validationMessage={this.state.messages[field.name]}
                            disabled={field.disabled || readonly} readonly={readonly} inline={inline} />
                        </Col>
                      case 'RADIO':
                        return <Col key={`frm-col-${i}`} {...size}>
                          <FormWidgetLazyLoadRadioButtonGroup id={field.name} name={field.name} label={field.label} value={values[field.name]}
                            helptext={field.helptext} optionsSource={field.optionsSource}
                            onChange={this._onChange} required={!!rules[field.name] && !!rules[field.name].find(item => item === 'required')}
                            invalid={this.state.validity[field.name] !== undefined && !this.state.validity[field.name]} validationMessage={this.state.messages[field.name]}
                            disabled={field.disabled || readonly} readonly={readonly} inline={inline} />
                        </Col>
                      case 'CHECKBOX':
                        const val = (values[field.name] + '').toUpperCase()
                        return <Col key={`frm-col-${i}`} {...size}> 
                          <FormWidgetCheckbox id={field.name} name={field.name} label={field.label} value={values[field.name]} options={field.options}
                            helptext={field.helptext} checked={val === 'ON' || val === 'Y' || val === 'YES' || val === 'TRUE'}
                            onChange={this._onChange} required={!!rules[field.name] && !!rules[field.name].find(item => item === 'required')}
                            invalid={this.state.validity[field.name] !== undefined && !this.state.validity[field.name]} validationMessage={this.state.messages[field.name]}
                            disabled={field.disabled || readonly} readonly={readonly} inline={inline} />
                        </Col>
                      case 'LDAP':
                        return <Col key={`frm-col-${i}`} {...size}>
                          <FormWidgetLdapAutocomplete id={field.name} name={field.name} label={field.label} value={value} helptext={field.helptext}
                            onChange={this._onChange} required={!!rules[field.name] && !!rules[field.name].find(item => item === 'required')}
                            invalid={this.state.validity[field.name] !== undefined && !this.state.validity[field.name]} validationMessage={this.state.messages[field.name]}
                            disabled={field.disabled || readonly} readonly={readonly} inline={inline} badgeOnly />
                        </Col>
                      case 'STATIC_DATE':
                        return <Col key={`frm-col-${i}`} {...size}>
                          <FormWidgetStatic id={field.name} name={field.name} label={field.label} value={value} helptext={field.helptext}
                            inline={inline} type='date' />
                        </Col>
                      case 'STATIC':
                      default:
                        return <Col key={`frm-col-${i}`} {...size}>
                          <FormWidgetStatic id={field.name} name={field.name} label={field.label} value={value} helptext={field.helptext}
                            inline={inline} />
                        </Col>
                    }
                  }
                  else return undefined
                })
              }
            </Row>
          ) : <div>No fields defined in form</div>
        }
        {
          buttons.map((btn, i) => {
            switch (btn.type) {
              case 'primary': return <PrimaryButton key={`frm-btn-${i}`} label={btn.label} icon={btn.icon} className='mr-1' onClick={btn.onClick} />
              case 'secondary': return <SecondaryButton key={`frm-btn-${i}`} label={btn.label} icon={btn.icon} className='mr-1' onClick={btn.onClick} />
              default: return <NeutralButton key={`frm-btn-${i}`} label={btn.label} icon={btn.icon} className='mr-1' onClick={btn.onClick} />
            }
          })
        }
      </Form>
    )
  }
}
export default FormWidget

class FormWidgetBase extends React.Component {

  static defaultProps = {
    id: moment().unix(), // Just generate an id based on timestamp
    label: '',
    required: false,
    inline: false,
    styles: {},
    size: 'lg',
    children: <span />
  }

  render() {
    const { ...props } = this.props;
    if (this.props.inline) {
      return (
        this.props.size === 'sm'
          ? <FormGroup row className={`mb-1 ${this.props.className}`}>
            <Label for={`${this.props.id}`} sm={6} xs={12} style={this.props.styles.label}>
              <Required required={this.props.required}>
                <strong>{this.props.label}</strong>
              </Required>
            </Label>
            <Col sm={6} xs={12}>
              {this.props.children}
              <ValidationMessage {...props} />
              <HelpText content={this.props.helptext} />
            </Col>
          </FormGroup>
          : <FormGroup row className={`mb-1 ${this.props.className}`}>
            <Label for={`${this.props.id}`} md={3} sm={6} xs={12} style={this.props.styles.label}>
              <Required required={this.props.required}>
                <strong>{this.props.label}</strong>
              </Required>
            </Label>
            <Col md={9} sm={6} xs={12}>
              {this.props.children}
              <ValidationMessage {...props} />
              <HelpText content={this.props.helptext} />
            </Col>
          </FormGroup>
      )
    } else {
      return (
        <FormGroup className={`${this.props.className}`}>
          {
            !!this.props.label ? (
              <Label for={`${this.props.id}`} style={this.props.styles.label}>
                <Required required={this.props.required}>
                  <strong>{this.props.label}</strong>
                </Required>
              </Label>
            ) : undefined
          }
          {this.props.children}
          <ValidationMessage {...props} />
          <HelpText content={this.props.helptext} />
        </FormGroup>
      )
    }
  }
}

let ValidationMessage = styled(class extends React.Component {
  render() {
    return (
      this.props.invalid
        ? <div className={classnames({ "valid-feedback": !this.props.invalid }, { "invalid-feedback": this.props.invalid })}>{this.props.validationMessage}</div>
        : null
    )
  }
}) ` display: block `

let HelpText = class extends React.Component {
  render() {
    return (
      this.props.content
        ? <FormText><div dangerouslySetInnerHTML={{ __html: this.props.content }} /></FormText>
        : null
    )
  }
}

let FormWidgetStatic = styled(class extends React.Component {
  static defaultProps = {
    styles: {},
    type: 'text',
    delim: ','
  }

  render() {
    const { ...props } = this.props;
    let children = undefined;
    switch (this.props.type) {
      case 'date':
        let dtvalue = ''
        if (this.props.value !== undefined && this.props.value !== null && this.props.value !== '')
          dtvalue = moment(this.props.value).format('YYYY-MM-DD [CST]')
        children = <Input id={this.props.id} className={classnames({ "text-muted": this.props.disabled })} plaintext bsSize={this.props.bsSize} style={this.props.styles.input}>{dtvalue}</Input>
        break
      case 'datetime':
        let dttmvalue = ''
        if (this.props.value !== undefined && this.props.value !== null && this.props.value !== '')
          dttmvalue = moment(this.props.value).format('YYYY-MM-DD hh:mm:ssA [CST]')
        children = <Input id={this.props.id} className={classnames({ "text-muted": this.props.disabled })} plaintext bsSize={this.props.bsSize} style={this.props.styles.input}>{dttmvalue}</Input>
        break
      case 'list':
        children = (
          <Input id={this.props.id} className={classnames({ "text-muted": this.props.disabled })} plaintext bsSize={this.props.bsSize} style={this.props.styles.input}>
            {
              this.props.value !== undefined && this.props.value !== null && this.props.value !== ''
                ? <ul>
                  {
                    this.props.value.split(this.props.delim).map((item, i) => {
                      return <li>{item}</li>
                    })
                  }
                </ul>
                : <strong>{this.props.value}</strong>
            }
          </Input>
        )
        break
      case 'text':
      default:
        children = <Input id={this.props.id} className={classnames({ "text-muted": this.props.disabled })} plaintext bsSize={this.props.bsSize} style={this.props.styles.input}>{this.props.value}</Input>
    }
    return <FormWidgetBase {...props}>{children}</FormWidgetBase>
  }
}) `
.form-control-plaintext {
  word-wrap: break-word; /* IE>=5.5 */
  white-space: pre; /* IE>=6 */
  white-space: -moz-pre-wrap; /* For Fx<=2 */
  white-space: pre-wrap; /* Fx>3, Opera>8, Safari>3*/
}
`

const FormWidgetText = (props) => {
    const { ...myprops } = props
    let style = !!props.style ? props.style.input : {}
    return (
      <FormWidgetBase {...myprops}>
          <input type='text' id={props.id} name={props.name} value={props.value}
          maxLength={props.maxlength} disabled={props.disabled} readOnly={props.readonly}
          className={classnames('form-control', { 'is-invalid': props.invalid }, { 'form-control-sm': props.bsSize === 'sm' }, { 'form-control-lg': props.bsSize === 'lg' })} 
          onChange={(e) => props.onChange(props.name, e.target.value)} style={style} />
      </FormWidgetBase>
    )
}

const FormWidgetTextArea = (props) => {
  const { ...myprops } = props
  let style = !!props.style ? props.style.input : {}
  let value = props.value === null ? '' : props.value // convert null values into an empty string ''
  return (
    <FormWidgetBase {...myprops}>
      <textarea id={props.id} name={props.name} value={value}
        maxLength={props.maxlength} disabled={props.disabled} readOnly={props.readonly}
        className={classnames('form-control', { 'is-invalid': props.invalid }, { 'form-control-sm': props.bsSize === 'sm' }, { 'form-control-lg': props.bsSize === 'lg' })} 
        onChange={(e) => props.onChange(props.name, e.target.value)} style={style} />
    </FormWidgetBase>
  )
}

class FormWidgetSelect extends React.Component {
  static defaultProps = {
    options: [],
    styles: {},
    value: undefined
  }

  _onChange(e) {
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(this.props.name, e.target.value);
    }
  }

  render() {
    const { ...props } = this.props
    return (
      <FormWidgetBase {...props}>
        <Input type="select" id={this.props.id} name={this.props.name} value={this.props.value !== null ? this.props.value : ''}
          disabled={this.props.disabled} readOnly={this.props.readonly} invalid={this.props.invalid} onChange={this._onChange.bind(this)}
          bsSize={this.props.bsSize} style={this.props.styles.input}>
          {
            !!this.props.options
              ? (
                this.props.options.map((option) => {
                  // Check if the options has separate values for value and label, else fall back to simpler data forms
                  if (option.value !== undefined && option.label !== undefined)
                    return <option key={`sel-opt-${option.value}`} value={option.value}>{option.label}</option>
                  else if (option.value !== undefined)
                    return <option key={`sel-opt-${option.value}`} value={option.value}>{option.value}</option>
                  else
                    return <option key={`sel-opt-${option}`} value={option}>{option}</option>
                })
              ) : <option>{' '}</option>
          }
        </Input>
      </FormWidgetBase>
    )
  }
}

class FormWidgetReactSelect extends React.Component {
  static defaultProps = {
    disabled: false,
    loading: false,
    styles: {},
    value: null,
    options: []
  }

  _onChange = (name, selectedOption) => {
    if (typeof this.props.onChange === 'function') {
      if (selectedOption === undefined || selectedOption === null)
        this.props.onChange(this.props.name, '')
      else
        this.props.onChange(this.props.name, selectedOption.value)
    }
  }

  render() {
    const { ...props } = this.props;
    if (this.props.disabled || this.props.readonly) {
      return (
        <FormWidgetBase {...props}>
          <FormWidgetStaticSelection {...props} />
        </FormWidgetBase>
      )
    } else {
      return (
        <FormWidgetBase {...props}>
          <Select
            componentClass="select"
            name={this.props.name}
            placeholder="Select an option..."
            isLoading={this.props.loading}
            disabled={this.props.disabled || this.props.readonly}
            options={this.props.options}
            value={this.props.value !== null ? this.props.value : ''}
            onChange={this._onChange.bind(this, this.props.name)}
            closeOnSelect={true}
            style={this.props.styles.input}
          />
          {this.props.invalid ? <Input type='hidden' invalid /> : null}
        </FormWidgetBase>
      )
    }
  }
}

class FormWidgetReactMultiSelect extends React.Component {
  static defaultProps = {
    disabled: false,
    loading: false,
    styles: {},
    value: [],
    options: []
  }

  _onChange = (name, selectedOptions) => {
    let value = []
    selectedOptions.forEach(opt => value.push(opt.value))
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(this.props.name, value);
    }
  }

  render() {
    const { ...props } = this.props;
    if (this.props.disabled || this.props.readonly) {
      return (
        <FormWidgetBase {...props}>
          <FormWidgetStaticSelection {...props} />
        </FormWidgetBase>
      )
    } else {
      return (
        <FormWidgetBase {...props}>
          <Select
            componentClass="select" multi
            name={this.props.name}
            placeholder="Select options..."
            isLoading={this.props.loading}
            disabled={this.props.disabled || this.props.readonly}
            options={this.props.options}
            value={this.props.value !== null ? this.props.value : ''}
            onChange={this._onChange.bind(this, this.props.name)}
            closeOnSelect={false}
            style={this.props.styles.input}
          />
          {this.props.invalid ? <Input type='hidden' invalid /> : null}
        </FormWidgetBase>
      )
    }
  }
}

class FormWidgetLazyLoadSelect extends React.Component {

  state = {
    loading: true, options: []
  }

  componentDidMount() {
    if (!!this.props.optionsSource)
      fetchGet(this.props.optionsSource,
        (status, response) => {
          this.setState({ options: response, loading: false })
        })
  }

  render() {
    const { ...props } = this.props;
    return <FormWidgetReactSelect {...props} loading={this.state.loading} options={this.state.options} />
  }
}

class FormWidgetLazyLoadMultiSelect extends React.Component {
  state = {
    loading: true, options: []
  }

  componentDidMount() {
    if (!!this.props.optionsSource)
      fetchGet(this.props.optionsSource,
        (status, response) => {
          this.setState({ options: response, loading: false })
        })
  }

  render() {
    const { ...props } = this.props;
    return <FormWidgetReactMultiSelect {...props} loading={this.state.loading} options={this.state.options} />
  }
}

let FormWidgetTypeAheadSelect = class extends React.Component {

  static defaultProps = {
    disabled: false, readonly: false, invalid: false, loading: false,
    styles: {},
    value: ''
  }
  state = {
    // Generate a random number to serve as fetch ID to identify unique requests to the options source
    fetchId: Math.floor((Math.random() * 525600) + 1),
    options: []
  }

  _onChange = (selectedOption) => {
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(this.props.name, selectedOption);
    }
  }

  _onTypeAhead = (searchTerm) => {
    if (!!this.props.optionsSource && searchTerm.length > MIN_TYPEAHEAD_SEARCH_CHAR_LENGTH) {
      const newFetch = this.state.fetchId + 1
      this.setState({ loading: true, fetchId: newFetch })
      fetchGet(`${this.props.optionsSource}`.replace('{term}', encodeURI(searchTerm)).replace('{id}', newFetch),
        (status, response) => {
          // Only consider responses to fetches that are from recent searches
          // to avoid overwriting values from non-recent requests
          if (response.fetchId >= newFetch)
            this.setState({ options: response.values, loading: false })
        }, _ => this.setState({ options: [], loading: false }))
    }
  }

  clearValues = () => {
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(this.props.name, '');
    }
  }

  render() {
    const { ...props } = this.props;
    return (
      <FormWidgetBase {...props}>        
        <FormWidgetStaticSelection value={[this.state.value]} {...props}
          clearValues={this.clearValues} />
        {
          !this.props.disabled && !this.props.readonly
            ? <Select isClearable={false}
              isLoading={this.state.loading} disabled={this.props.disabled || this.props.readonly}
              componentClass="select" name={this.props.name}
              placeholder='Type to search...'
              options={this.state.options} noOptionsMessage='No matching options found'
              onChange={this._onChange}
              onInputChange={this._onTypeAhead}
              style={this.props.styles.input}
            />
            : undefined
        }
        {this.props.invalid ? <Input type='hidden' invalid /> : null}
      </FormWidgetBase>
    )
  }
}

let FormWidgetTypeAheadMultiSelect = class extends React.Component {

  static defaultProps = {
    disabled: false, readonly: false, invalid: false, loading: false,
    styles: {},
    value: []
  }
  state = {
    // Generate a random number to serve as fetch ID to identify unique requests to the options source
    fetchId: Math.floor((Math.random() * 525600) + 1),
    options: [], value: []
  }

  componentWillMount() {
    this.setState({ value: this.props.value })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.value)
      this.setState({ value: nextProps.value })
  }

  _onChange = (selectedOption) => {
    let value = []
    if (typeof this.props.value === 'string' || this.props.value instanceof String)
      value = this.props.value.split(",")
    else // Assume it is an array
      value = this.props.value.slice()
    value.push(selectedOption.value)
    // Reset the options list
    this.setState({ options: [], value: value })

    if (typeof this.props.onChange === 'function') {
      this.props.onChange(this.props.name, value);
    }
  }

  _onTypeAhead = (searchTerm) => {
    if (!!this.props.optionsSource && searchTerm.length > MIN_TYPEAHEAD_SEARCH_CHAR_LENGTH) {
      const newFetch = this.state.fetchId + 1
      this.setState({ loading: true, fetchId: newFetch })
      fetchGet(`${this.props.optionsSource}`.replace('{term}', encodeURI(searchTerm)).replace('{id}', newFetch),
        (status, response) => {
          // Only consider responses to fetches that are from recent searches
          // to avoid overwriting values from non-recent requests
          if (response.fetchId >= newFetch) {
            const options = response.values.filter((opt) => { return this.state.value.indexOf(opt.value) < 0 })
            this.setState({ options: options, loading: false })
          }
        }, _ => this.setState({ options: [], loading: false }))
    }
  }

  deselectValue = (deselectedOption) => {
    let value = []
    if (typeof this.props.value === 'string' || this.props.value instanceof String)
      value = this.props.value.split(",")
    else // Assume it is an array
      value = this.props.value.slice()
    let newvalue = value.filter(item => { return item !== deselectedOption })
    this.setState({ value: newvalue })
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(this.props.name, newvalue);
    }
  }

  clearValues = () => {
    this.setState({ value: [] })
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(this.props.name, []);
    }
  }

  render() {
    const { ...props } = this.props;
    let value = this.props.value
    if (typeof value === 'string' || value instanceof String)
      value = this.props.value.split(',')
    if (value === undefined || value === null || value === '')
      value = []
    return (
      <FormWidgetBase {...props}>
        <FormWidgetStaticSelection value={value} {...props}
          deselectValue={this.deselectValue} clearValues={this.clearValues} />
        {
          !this.props.disabled && !this.props.readonly
            ? <Select isClearable={false}
              isLoading={this.state.loading} disabled={this.props.disabled || this.props.readonly}
              componentClass="select" name={this.props.name}
              placeholder='Type to search...'
              options={this.state.options} noOptionsMessage='No matching options found'
              onChange={this._onChange}
              onInputChange={this._onTypeAhead}
              style={this.props.styles.input}
            />
            : undefined
        }
        {this.props.invalid ? <Input type='hidden' invalid /> : null}
      </FormWidgetBase>
    )
  }
}

let FormWidgetStaticSelection = styled(class extends React.Component {
  static defaultProps = {
    value: [],
    disabled: true,
    readonly: true,
    emptyMessage: 'No values selected...'
  }

  render() {
    const { className, disabled, readonly, deselectValue, clearValues, emptyMessage } = this.props
    let value = this.props.value
    if (value === undefined || value === null || value === '')
      value = []
    if (typeof value === 'string' || value instanceof String)
      value = value.split(',')
    return (
      <div className={`Select-control ${className}`}>
        {
          value.length > 0
            ? value.map((item, i) => {
              return <div className="Select-value" key={`tamsv-opt-${i}`}>
                {
                  !disabled && !readonly && deselectValue !== undefined && typeof deselectValue === 'function'
                    ? <span className="Select-value-icon" aria-hidden="true" onClick={_ => deselectValue(item)}>&times;</span>
                    : undefined
                }
                <span className="Select-value-label" role="option">{item}
                  <span className="Select-aria-only">&nbsp;</span>
                </span>
              </div>
            })
            : <div className="Select--empty">{emptyMessage}</div>
        }
        {
          !disabled && !readonly && clearValues !== undefined && typeof clearValues === 'function'
            ? <button type="button" className="close" aria-label="Close" onClick={clearValues}>
              <span aria-hidden="true">&times;</span>
            </button>
            : undefined
        }
      </div>
    )
  }
})`
.Select--empty {
  display: inline-block;
  margin-left: 9px;
  margin-top: 5px;
}
.Select-value {
  background-color: #ebf5ff;
  /* Fallback color for IE 8 */
  background-color: rgba(0, 126, 255, 0.08);
  border-radius: 2px;
  border: 1px solid #c2e0ff;
  /* Fallback color for IE 8 */
  border: 1px solid rgba(0, 126, 255, 0.24);
  color: #007eff;
  display: inline-block;
  font-size: 0.9em;
  line-height: 1.4;
  margin-left: 5px;
  margin-top: 5px;
  vertical-align: top;
}
.Select-value-icon,
.Select-value-label {
  display: inline-block;
  vertical-align: middle;
}
.Select-value-label {
  border-bottom-right-radius: 2px;
  border-top-right-radius: 2px;
  cursor: default;
  padding: 2px 5px;
}
a.Select-value-label {
  color: #007eff;
  cursor: pointer;
  text-decoration: none;
}
a.Select-value-label:hover {
  text-decoration: underline;
}
.Select-value-icon {
  cursor: pointer;
  border-bottom-left-radius: 2px;
  border-top-left-radius: 2px;
  border-right: 1px solid #c2e0ff;
  /* Fallback color for IE 8 */
  border-right: 1px solid rgba(0, 126, 255, 0.24);
  padding: 1px 5px 3px;
}
.Select-value-icon:hover,
.Select-value-icon:focus {
  background-color: #d8eafd;
  /* Fallback color for IE 8 */
  background-color: rgba(0, 113, 230, 0.08);
  color: #0071e6;
}
.Select-value-icon:active {
  background-color: #c2e0ff;
  /* Fallback color for IE 8 */
  background-color: rgba(0, 126, 255, 0.24);
}
`

class FormWidgetNumber extends React.Component {
  static defaultProps = {
    styles: {},
    value: undefined
  }

  _onChange = (e) => {
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(this.props.name, e.target.value);
    }
  }

  render() {
    const { ...props } = this.props;
    return (
      <FormWidgetBase {...props}>
        <input type='number' id={this.props.id} name={this.props.name} value={this.props.value !== null ? this.props.value : ''}
          disabled={this.props.disabled} readOnly={this.props.readonly} className={classnames('form-control', { "is-invalid": this.props.invalid })}
          onChange={this._onChange} style={this.props.styles.input} />
      </FormWidgetBase>
    )
  }
}

class FormWidgetDatePicker extends React.Component {
  static defaultProps = {
    styles: {},
    value: undefined
  }

  constructor(props) {
    super(props)
    this._onChange = this._onChange.bind(this)
  }

  componentWillMount() {
    this.setState({ value: this.props.value }) // Set the initial value
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.value !== nextProps.value)
      this.setState({ value: nextProps.value })
  }

  _onChange = (value) => {
    this.setState({ value: value })
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(this.props.name, value);
    }
  }

  render() {
    const { ...props } = this.props;
    const elem = <React.Fragment>
      <DatePicker
        id={this.props.id} name={this.props.name}
        dateFormat="YYYY-MM-DD" placeholderText="YYYY-MM-DD" todayButton={"Today"}
        selected={this.state.value !== undefined && this.state.value !== null && this.state.value !== '' ? moment(this.state.value) : undefined}
        className={classnames("form-control", { "is-invalid": this.props.invalid })}
        disabled={this.props.disabled} readonly={this.props.readonly}
        onChange={(value) => this._onChange(value)}
        style={this.props.styles.input} />
      <FormText color="muted">All date and time are in CST</FormText>
      {this.props.invalid ? <Input type='hidden' invalid /> : null}
    </React.Fragment>
    return (
      <FormWidgetBase {...props}>
        {
          !this.props.inline ? <div>{elem}</div> : elem
        }
      </FormWidgetBase>
    )
  }
}

class FormWidgetLdapAutocomplete extends React.Component {

  static defaultProps = {
    style: {},
    value: undefined,
    badgeOnly: false
  }

  state = {
    // Generate a random number to serve as fetch ID to identify unique requests to the options source
    fetchId: Math.floor((Math.random() * 525600) + 1),
    options: [], value: undefined, label: ['']
  }

  componentWillMount() { 
    this.setValueAndLabel(this.props.value, this.props.badgeOnly)
  }

  componentWillReceiveProps(nextProps) { 
    if (nextProps.value !== this.state.value)
      this.setValueAndLabel(nextProps.value, nextProps.badgeOnly)
  }

  setValueAndLabel = (value, isBadgeOnly) => {
    if (isBadgeOnly && value !== undefined && value !== null && value !== '')
      this._searchLdap(value, this._onSearchOne, value) // Search for the badge details
    else if (value === undefined || value === null || value === '')
      this.setState({ value: '', label: [''] }) // Set empty state
    else
      this.setState({ value: value, label: [value] }) // Set value as-is
  }

  _onChange = (selected) => {
    const value = selected[0] || {}
    if (value !== null && value !== undefined && value.label !== undefined) {
      if (this.props.badgeOnly) {
        if (value.userid !== this.state.value) {
          this.setState({ value: value.userid, label: [value.label] })
          if (typeof this.props.onChange === 'function')
            this.props.onChange(this.props.name, value.userid)
        }
      } else {
        if (value.label !== this.state.value) {
          this.setState({ value: value.label, label: [value.label] })
          if (typeof this.props.onChange === 'function')
            this.props.onChange(this.props.name, value.label)
        }
      }
    }
  }

  _onSearchOne = (items, defaultValue) => {
    if (items.length > 0) {
      const e = items[0]
      let label = this.generateLabel(e)
      this.setState({ 
        value: e.userid === undefined ? defaultValue : e.userid, 
        label: label === undefined ? [defaultValue] : [label] 
      })
    } else {
      this.setState({ value: defaultValue, label: [defaultValue] })
    }
  }

  _onSearch = (term) => {
    this.setState({ label: [term] })
    this._searchLdap(term, (items) => {
      items = items.map(e => {
        return { ...e, label: this.generateLabel(e) }
      })
      this.setState({ options: items })
    })
  }

  _searchLdap = (term, handleFetch, defaultValue) => { 
    const newFetch = moment().valueOf()
    this.setState({ loading: true, fetchId: newFetch })
    fetchPost(`/api/v1/ldap/lookup`, { search: term, fetchId: newFetch },
      (status, response) => {
        if (response.fetchId >= this.state.fetchId) {
          this.setState({ fetchId: response.fetchId }) 
          handleFetch(response.items, defaultValue)
        }
      }, _ => this.setState({ options: [], loading: false }))
  }

  generateLabel = (user) => {
    if (null == user.username && null == user.userid)
      return undefined
    // default format
    return `${user.username} (${user.userid}) / ${user.email}`
  }

  render() { 
    const { ...props } = this.props;
    return (
      <FormWidgetBase {...props}>
        {
          this.props.readonly || this.props.disabled
            ? <Input id={this.props.id} name={this.props.name} value={this.state.label}
              disabled={this.props.disabled} readOnly={this.props.readonly} bsSize={this.props.bsSize} style={this.props.style.input} />
            : <React.Fragment>
              <Typeahead 
                name={this.props.name}
                placeholder='Start typing name, badge or email'
                selected={this.state.label}
                options={this.state.options}
                onInputChange={this._onSearch}
                onChange={this._onChange}
                style={this.props.style.input}
              />
              {this.props.invalid ? <Input type='hidden' invalid /> : null}
            </React.Fragment>
        }
      </FormWidgetBase>
    )
  }
}

let FormWidgetRadioButtonGroup = styled(class extends React.Component {

  static defaultProps = {
    color: 'secondary',
    styles: {},
    value: undefined,
    spaced: false
  }

  componentWillMount() {
    this.setState({ value: this.props.value })
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value })
  }

  onRadioBtnClick = (e, value) => {
    this.setState({ value });
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(this.props.name, value);
    }
  }

  render() {
    const { ...props } = this.props
    return (
      <FormWidgetBase {...props}>
        {
          !!this.props.options
            ? (
              this.props.spaced
              ? <div>
                  {
                    this.props.options.map((option, i) => {
                      return (
                        <Button value={option.value} key={`radgrp-opt-${i}`} active={this.state.value === option.value}
                          color={option.color || this.props.color} outline={this.state.value !== option.value} disabled={this.props.disabled}
                          className={classnames('btn-spaced',{'btn-lg': this.props.bsSize === 'lg'},{'btn-sm': this.props.bsSize === 'sm'})}
                          onClick={(event) => this.onRadioBtnClick(event, `${option.value}`)}>
                          {option.label}
                        </Button>
                      )
                    })
                  }
                </div>
              : <ButtonGroup className={classnames({'btn-lg': this.props.bsSize === 'lg'},{'btn-sm': this.props.bsSize === 'sm'})} 
                           style={this.props.styles.input}>
                  {
                    this.props.options.map((option, i) => {
                      return (
                        <Button value={option.value} key={`radgrp-opt-${i}`} active={this.state.value === option.value}
                          color={this.props.color} outline={this.state.value !== option.value} disabled={this.props.disabled}
                          onClick={(event) => this.onRadioBtnClick(event, `${option.value}`)}>
                          {option.label}
                        </Button>
                      )
                    })
                  }
                </ButtonGroup>
            ) : undefined
        }
        {this.props.invalid ? <Input type='hidden' invalid /> : null}
      </FormWidgetBase>
    )
  }
})`
.btn-group { display: block !important }
.btn { margin-right: 0px }
.btn-spaced { margin: 0.5em }
`

class FormWidgetButtonYesNo extends React.Component {
  render() {
    const { ...props } = this.props;
    const yesNoButtons = [
      { label: 'Yes', value: 'Y' },
      { label: 'No', value: 'N' }
    ]
    return (
      <FormWidgetRadioButtonGroup {...props} options={yesNoButtons} />
    )
  }
}

class FormWidgetLazyLoadRadioButtonGroup extends React.Component {

  state = { loading: true, options: [] }

  componentDidMount() {
    if (!!this.props.optionsSource)
      fetchGet(this.props.optionsSource,
        (status, response) => {
          this.setState({ options: response, loading: false })
        })
  }

  render() {
    const { ...props } = this.props;
    return <FormWidgetRadioButtonGroup {...props} options={this.state.options} />
  }
}

class FormWidgetCheckboxGroup extends React.Component {

  static defaultProps = {
    color: 'secondary',
    styles: {},
    value: undefined
  }

  _onClick = (checked, selectedOption) => {
    let value = this.props.value.slice()
    value.push(selectedOption)
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(this.props.name, value);
    }
  }

  render() {
    const { ...props } = this.props;
    return (
      <FormWidgetBase {...props}>
        {
          !!this.props.options
            ? (
              <FormGroup check style={{ display: 'block' }}>
                {
                  this.props.options.map((option, i) => {
                    const checked = this.props.value.indexOf(option.value) > -1
                    return (
                      <Label check>
                        <Input type="checkbox" value={option.value} checked={checked} disabled={this.props.disabled}
                          id={`${this.props.name}-chkgrp-opt-${i}`} key={`${this.props.name}-chkgrp-opt-${i}`}
                          onChange={_ => this._onClick(!checked, option.value)}
                          bsSize={this.props.bsSize} style={this.props.styles.input} />{' '}
                        {option.label}
                      </Label>
                    )
                  })
                }
              </FormGroup>
            ) : undefined
        }
        {this.props.invalid ? <Input type='hidden' invalid /> : null}
      </FormWidgetBase>
    )
  }
}

class FormWidgetCheckbox extends React.Component {

  static defaultProps = {
    color: 'secondary',
    styles: {},
    value: undefined
  }

  componentWillMount() {
    this.setState({ value: this.props.value })
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value })
  }

  _onClick = (value) => {
    this.setState({ value })
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(this.props.name, value)
    }
  }

  render() {
    const { ...props } = this.props;
    return (
      <FormWidgetBase {...props} label={undefined}>
        <FormGroup check style={{ display: 'block' }}>
          <Label check>
            <Input type="checkbox" value={this.state.value} disabled={this.props.disabled} checked={this.props.checked}
              id={`${this.props.name}-chkbox`} onChange={_ => this._onClick(!this.props.checked)}
              bsSize={this.props.bsSize} style={this.props.styles.input} />{' '}
            {this.props.label}
          </Label>
        </FormGroup>
        {this.props.invalid ? <Input type='hidden' invalid /> : null}
      </FormWidgetBase>
    )
  }
}

export {
  FormWidgetStatic, FormWidgetText, FormWidgetTextArea,
  FormWidgetSelect, FormWidgetReactSelect, FormWidgetReactMultiSelect,
  FormWidgetLazyLoadSelect, FormWidgetLazyLoadMultiSelect,
  FormWidgetTypeAheadSelect, FormWidgetTypeAheadMultiSelect,
  FormWidgetNumber, FormWidgetDatePicker, FormWidgetLdapAutocomplete,
  FormWidgetRadioButtonGroup, FormWidgetButtonYesNo, FormWidgetLazyLoadRadioButtonGroup,
  FormWidgetCheckboxGroup, FormWidgetCheckbox
}
