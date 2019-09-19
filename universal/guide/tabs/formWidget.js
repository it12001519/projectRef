import React, { Component, } from 'react'
import { Row, Col, Card, CardHeader, CardBody, } from 'reactstrap'
import FormWidget, {
  FormWidgetStatic, FormWidgetText, FormWidgetTextArea, FormWidgetReactSelect, FormWidgetReactMultiSelect,
  FormWidgetDatePicker, FormWidgetRadioButtonGroup, FormWidgetButtonYesNo
} from 'js/universal/FormFieldWidgets'
import { AwesomeCheckbox, } from 'js/app/models/ChangelinkUI'

const rules = {
  'required': ['required'],
  'required2': ['required']
}
const OPTIONS_SOURCE = "/json/dropdown/beverages.json";
const OPTIONS = [
  { "value": "Coke", "label": "Coke" },
  { "value": "Pepsi", "label": "Pepsi" },
  { "value": "Water", "label": "Water" }
]

const values = {
  static: 'Static text',
  text: 'A text-type input',
  required: 'A required input',
  required2: '',
  disabled: 'A disabled input',
  selectOne: 'Water',
  selectMulti: ['Coke', 'Pepsi'],
  date: '01/01/2010',
  number: 100,
  employee: 'a0284538 / Oliver Vence Gonzales',
  boolean: true
}
const form1 = [
  { widget: 'STATIC', name: 'static', label: 'Static Text' },
  { widget: 'TEXT', name: 'text', label: 'Text' },
  { widget: 'TEXT', name: 'required', label: 'Required Field' },
  { widget: 'TEXT', name: 'required2', label: 'Invalid Field' },
  { widget: 'TEXT', name: 'disabled', label: 'Disabled Field', disabled: true },
  { widget: 'TEXTAREA', label: 'Text Area', name: 'text' },
  { widget: 'TYPEAHEAD', label: 'Type Ahead one', name: 'selectOne', optionsSource: OPTIONS_SOURCE },
  { widget: 'TYPEAHEAD_MULTI', label: 'Type Ahead multiple', name: 'selectMulti', optionsSource: OPTIONS_SOURCE },
  { widget: 'SELECT', label: 'Select one', name: 'selectOne', options: OPTIONS, optionsSource: OPTIONS_SOURCE },
  { widget: 'MULTISELECT', label: 'Select multiple', name: 'selectMulti', options: OPTIONS, optionsSource: OPTIONS_SOURCE },
  { widget: 'DATE', label: 'Date', name: 'date' },
  { widget: 'NUMBER', label: 'Number field', name: 'number' },
  { widget: 'LDAP', label: 'TI Employee', name: 'employee' },
  { widget: 'RADIO', label: 'Button Group', name: 'selectOne', options: OPTIONS, optionsSource: OPTIONS_SOURCE },
  { widget: 'CHECKBOX', label: 'Have you read the Terms and Conditions?', name: 'boolean' },
]
const form2 = [
  { widget: 'STATIC', name: 'static', label: 'Static Text', size: 'xl' },
  { widget: 'TEXT', name: 'text', label: 'Text', size: 'xl' },
  { widget: 'TEXT', name: 'required', label: 'Required Field', size: 'xl' },
  { widget: 'TEXT', name: 'required2', label: 'Invalid Field', size: 'xl' },
  { widget: 'TEXT', name: 'disabled', label: 'Disabled Field', disabled: true, size: 'xl' },
  { widget: 'TEXTAREA', label: 'Text Area', name: 'text', size: 'xl' },
  { widget: 'TYPEAHEAD', label: 'Type Ahead one', name: 'selectOne', optionsSource: OPTIONS_SOURCE, size: 'xl' },
  { widget: 'TYPEAHEAD_MULTI', label: 'Type Ahead multiple', name: 'selectMulti', optionsSource: OPTIONS_SOURCE, size: 'xl' },
  { widget: 'SELECT', label: 'Select one', name: 'selectOne', options: OPTIONS, optionsSource: OPTIONS_SOURCE, size: 'xl' },
  { widget: 'MULTISELECT', label: 'Select multiple', name: 'selectMulti', options: OPTIONS, optionsSource: OPTIONS_SOURCE, size: 'xl' },
  { widget: 'DATE', label: 'Date', name: 'date', size: 'xl' },
  { widget: 'NUMBER', label: 'Number field', name: 'number', size: 'xl' },
  { widget: 'LDAP', label: 'TI Employee', name: 'employee', size: 'xl' },
  { widget: 'RADIO', label: 'Button Group', name: 'selectOne', options: OPTIONS, optionsSource: OPTIONS_SOURCE, size: 'xl' },
  { widget: 'CHECKBOX', label: 'Have you read the Terms and Conditions?', name: 'boolean', size: 'xl' },
]

class FormWidgetTab extends Component {

  onChange = (name, value) => {
    alert('Updated field with value: ' + value)
  }

  render() {
    return (
      <div className={this.props.className}>

        <div className="clearfix" style={{ height: '1em' }} />
        <h5>Form Widgets</h5>

        <Row>
          <Col md={6} sm={12} className="pl-0 mb-3">
            <Card>
              <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                Default Layout
              </CardHeader>
              <CardBody>
                <FormWidget fields={form1} values={values} rules={rules} onChange={this.onChange}
                            onChangeCallbacks={{
                              selectOne: (value) => {
                                alert('Callback!\nValue: '+value)
                              },
                              selectMulti: (value) => {
                                alert('Callback!\nValue: '+JSON.stringify(value))
                              }
                            }} />
              </CardBody>
            </Card>
          </Col>

          <Col md={6} sm={12} className="pl-0 mb-3">
            <Card>
              <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                Inline Layout
              </CardHeader>
              <CardBody>
                <FormWidget fields={form2} values={values} rules={rules} onChange={this.onChange} inline />
              </CardBody>
            </Card>
          </Col>

          <Col md={6} sm={12} className="pl-0 mb-3">
            <Card>
              <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                With Validations
              </CardHeader>
              <CardBody>
                <FormWidgetText label='Text' name='text' value='A text input' required invalid validationMessage='This field is so invalid' inline />
                <FormWidgetText label='Invalid Input' name='text' value='' required invalid validationMessage='This field is so invalid' inline />
                <FormWidgetTextArea label='TextArea' name='textarea' value='A textarea input' required invalid validationMessage='This field is so invalid' inline />
                <FormWidgetReactSelect label='Select' name='select' value='Option Z' required invalid validationMessage='This field is so invalid' inline
                  options={[{ value: "Option A", label: "Option A" }, { value: "Option B", label: "Option B" }, { value: "Option Z", label: "Option Z" }]} />
                <FormWidgetReactMultiSelect label='Multi-Select' name='select' value={['Option A', 'Option Z']} required invalid validationMessage='This field is so invalid' inline
                  options={[{ value: "Option A", label: "Option A" }, { value: "Option B", label: "Option B" }, { value: "Option Z", label: "Option Z" }]} />
                <FormWidgetDatePicker label='Date' name='date' value='01/01/2018' required invalid validationMessage='This field is so invalid' inline />
                <FormWidgetButtonYesNo label='Yes or No?' name='yesno' value='Y' required invalid validationMessage='This field is so invalid' inline />
                <FormWidgetRadioButtonGroup label='Button Group' name='btngrp' value='C' required invalid validationMessage='This field is so invalid' inline
                  options={[{ value: "A", label: "Coke" }, { value: "B", label: "Pepsi" }, { value: "C", label: "Water" }]} />
              </CardBody>
            </Card>
          </Col>

          <Col md={6} sm={12} className="pl-0 mb-3">
            <Card>
              <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                Disabled Inputs
              </CardHeader>
              <CardBody>
                <FormWidgetStatic label='Static' value='A static text' disabled inline />
                <FormWidgetText label='Text' name='text' value='A text input' disabled inline />
                <FormWidgetTextArea label='TextArea' name='textarea' value='A textarea input' disabled inline />
                <FormWidgetReactSelect label='Select' name='select' value='Option Z' disabled inline
                  options={[{ value: "Option A", label: "Option A" }, { value: "Option B", label: "Option B" }, { value: "Option Z", label: "Option Z" }]} />
                <FormWidgetReactMultiSelect label='Multi-Select' name='select' value={['Option A', 'Option Z']} disabled inline
                  options={[{ value: "Option A", label: "Option A" }, { value: "Option B", label: "Option B" }, { value: "Option Z", label: "Option Z" }]} />
                <FormWidgetDatePicker label='Date' name='date' value='01/01/2018' disabled inline />
                <FormWidgetButtonYesNo label='Yes or No?' name='yesno' value='Y' disabled inline />
                <FormWidgetRadioButtonGroup label='Button Group' name='btngrp' value='C' disabled inline
                  options={[{ value: "A", label: "Coke" }, { value: "B", label: "Pepsi" }, { value: "C", label: "Water" }]} />
              </CardBody>
            </Card>
          </Col>

          <Col md={6} sm={12} className="pl-0 mb-3">
            <Card>
              <CardHeader tag="h6" className="text-white bg-dark text-center p-1">
                Customized Inputs
              </CardHeader>
              <CardBody>
                <FormWidgetText label='A text input with smaller paddings' name='text' value='Lorem ipsum' bsSize='sm' />
                <FormWidgetText label='A text input with larger paddings' name='text' value='Lorem ipsum' bsSize='lg' />
                <FormWidgetText label='A text input with customized styles' name='text' value='Lorem ipsum' 
                  style={{ input: { backgroundColor: 'yellow', width: '100px' }}} />
                <FormWidgetTextArea label='A textarea with customized styles' name='textarea' value='Lorem ipsum eveniet totam quaerat et eius eius asperiores eum cumque. Omnis voluptatem quia veniam iusto. Corporis ut omnis esse omnis voluptates repellendus. Dolorum autem omnis tempore. Id consequatur iusto soluta. ' 
                  style={{ input: { backgroundColor: 'yellow', border: '3px dashed #333', fontFamily: 'Georgia, serif' }}}/>
                <FormWidgetButtonYesNo label='Button group with larger buttons' name='yesno' value='Y' bsSize='lg' />
                <FormWidgetRadioButtonGroup label='Button Group with spaced colored buttons' name='btngrpspaced' value='B' inline spaced
                  options={[{ value: "A", label: "Coke", color: "danger" }, { value: "B", label: "Pepsi", color: "primary" }, { value: "C", label: "Water", color: "secondary" }]} />
                <b>Alternate checkbox</b><br/>
                <AwesomeCheckbox /> <AwesomeCheckbox checked /> <AwesomeCheckbox color='primary' checked/> <AwesomeCheckbox color='danger' checked/> <AwesomeCheckbox color='success' checked/> <AwesomeCheckbox color='warning' checked/> <br/>
                <AwesomeCheckbox size='sm' checked /> <AwesomeCheckbox checked /> <AwesomeCheckbox size='lg' checked /> <AwesomeCheckbox size='xl' checked />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div >
    );
  }
}

export default FormWidgetTab