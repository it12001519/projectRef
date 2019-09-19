import React, { Component, } from 'react';
import {
  Button, Form, FormGroup, FormText, FormFeedback, Label, Input
} from 'reactstrap';
import DatePicker from 'react-datepicker';
import Dropzone from 'react-dropzone';
import FontAwesome from 'react-fontawesome';
import styled from 'styled-components';

import Required from 'js/universal/Required';

class FormTab extends Component {
  render() {
    return (
      <div className={this.props.className}>

        <div className="clearfix" style={{ height: '1em' }} />
        <h5>Form Elements</h5>

        <Form className="mb-1">
          <FormGroup>
            <Label>Text</Label>
            <Input type="text" />
          </FormGroup>
          <FormGroup>
            <Label><Required>Required Field</Required></Label>
            <Input type="text" className="is-invalid" />
            <FormFeedback>This field is required</FormFeedback>
          </FormGroup>
          <FormGroup>
            <Label><Required>Another Required Field</Required></Label>
            <Input type="text" className="is-valid" value="I have a value" />
          </FormGroup>
          <FormGroup>
            <Label>Text with Placeholder</Label>
            <Input type="text" placeholder="This text will go away when user starts typing here" />
          </FormGroup>
          <FormGroup>
            <Label>Date Picker</Label>
            <DatePicker
              dateFormat="YYYY-MM-DD"
              todayButton={"Today"}
              placeholderText="YYYY-MM-DD"
              className="form-control" />
            <FormText color="muted">All date and time are in CST</FormText>
          </FormGroup>
          <FormGroup>
            <Label>Select Input</Label>
            <Input type="select">
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
              <option>Option 4</option>
              <option disabled>Option 5</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="exampleSelectMulti">Select Multiple</Label>
            <FormText color="muted">
              <b>Under Construction:</b>{' '}A standard multiple select input is being worked on using a third-party library. It will be first used in the Email Matrix Admin UI.
            </FormText>
          </FormGroup>
          <FormGroup>
            <Label>Text Area</Label>
            <Input type="textarea" value="The quick brown fox jumps over the lazy dog." />
          </FormGroup>
          <FormGroup>
            <Label>File Browser / Attach File</Label>
            {/* <CustomInput type="file" /> */}
            <Dropzone name="uploadFile" className="chg-dropzone-compact">
              <p><FontAwesome name="cloud-upload" />{' '}Drop files to attach, or <a href={`#`}>browse</a>.</p>
            </Dropzone>
            <FormText color="muted">
              This is some placeholder block-level help text for the above input. It's a bit lighter and easily wraps to a new line.
            </FormText>
          </FormGroup>
          <FormGroup>
            <Label>Checkboxes</Label>
            <FormGroup check>
              <Label check> <Input type="checkbox" checked />{' '} Checkbox 1 </Label>
            </FormGroup>
            <FormGroup check>
              <Label check> <Input type="checkbox" />{' '} Checkbox 2 </Label>
            </FormGroup>
            <FormGroup check>
              <Label check> <Input type="checkbox" disabled />{' '} Disabled Checkbox </Label>
            </FormGroup>
          </FormGroup>
          <FormGroup>
            <Label for="exampleCheckbox">Radios</Label>
            <FormGroup check>
              <Label check> <Input type="radio" checked />{' '} Radio 1 </Label>
            </FormGroup>
            <FormGroup check>
              <Label check> <Input type="radio" />{' '} Radio 2 </Label>
            </FormGroup>
            <FormGroup check>
              <Label check> <Input type="radio" disabled />{' '} Disabled Radio </Label>
            </FormGroup>
          </FormGroup>
          <FormGroup>
            <Label for="exampleCheckbox">Inline</Label>
            <div>
              <FormGroup check inline>
                <Label check><Input type="checkbox" /> I have read and accept the Terms of Use</Label>
              </FormGroup>
              <FormGroup check inline>
                <Label check><Input type="checkbox" /> ...and the Privacy Policy</Label>
              </FormGroup>
            </div>
          </FormGroup>


          <Button color="primary" className="mr-1"><FontAwesome name="save" />{' '}Save Changes</Button>
          <Button color="secondary" className="mr-1"><FontAwesome name="pause-circle" />{' '}Put on Hold</Button>
          <Button color="danger" className="mr-1"><FontAwesome name="trash" />{' '}Delete Record</Button>

          <Button color="secondary" outline className="float-right">Cancel</Button>
          <Button color="secondary" outline className="float-right mr-1">Reset</Button>
        </Form>

      </div >
    );
  }
}

export default styled(FormTab) `
.chg-dropzone-compact
{
  position: relative;
  width: 100%;
  height: 2em;
  text-align: center;
  border-width: 1px;
  border-color: #c0c4c8;
  border-style: dashed;
  border-radius: 5px;
}

.chg-dropzone-compact > p
{
  margin-bottom: 0;
}
`;