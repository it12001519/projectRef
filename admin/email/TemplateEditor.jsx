import React, { Component, } from 'react';
import ReactDOM from 'react-dom';
import {
  Collapse, Button, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon,
} from 'reactstrap';
import Required from "js/universal/Required";
import FontAwesome from 'react-fontawesome';
import { EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';

import withLayout from 'js/app/models/withLayout';
import styled from 'styled-components';
import classnames from 'classnames';

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

const MOCK_DATA = {
  title: 'ChangeLink Editorial Template',
  subject: 'Changelink $CHANGE_NUMBER$, CCB $CCB$ has been Submitted for a Fast Track Datasheet Editorial Change',
  state: 'Submitted',
  phase: 'Phase 1: Define Change',
  message: ''
}
const MOCK_PHASES = [
  'Define Change', 'Qualification', 'Qual Execution',
  'PCN Notification', 'Customer Approval', 'Implementation'
]
const MOCK_DATA_TAGS = [
  {
    group: 'CMS',
    list: [
      { label: 'Change Number', tag: '$CHANGE_NUMBER$' },
      { label: 'Change Title', tag: '$CHANGE_TITLE$' },
      { label: 'Change Owner', tag: '$CHANGE_OWNER$' },
    ]
  },
  {
    group: 'PCN',
    list: [
      { label: 'PCN Number', tag: '$PCN_NUMBER$' },
      { label: 'PCN Title', tag: '$PCN_TITLE$' },
      { label: 'Expiration Date', tag: '$PCN_EXPR_DTTM$' },
      { label: 'etc...', tag: '$$$' },
    ]
  }
]

class TemplateEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      editorState: EditorState.createEmpty(),
      phases: MOCK_PHASES,
      tags: MOCK_DATA_TAGS,
      states: ['Draft', 'Hold', 'Submitted', 'Rejected', 'Complete'],
      showHelper: false,
      isExpanded: false
    }

    this.toggleHelper = this.toggleHelper.bind(this);
    this.toggleExpand = this.toggleExpand.bind(this);
    this.onEditorStateChange = this.onEditorStateChange.bind(this);
  }

  toggleHelper(event) {
    event.preventDefault();
    this.setState({ showHelper: !this.state.showHelper });
  }

  toggleExpand() {
    this.setState({ isExpanded: !this.state.isExpanded });
  }

  onEditorStateChange(contentState) {
    this.setState({
      editorState: contentState
    });
  };

  componentDidMount() {
    this.setState((previousState) => {
      previousState.data = MOCK_DATA;
      // previousState.editorState = { ...previousState.blocks, 'text': MOCK_DATA.message };

      return previousState;
    });
  }

  render() {
    const { editorState } = this.state;
    return (
      <div className={this.props.className}>

        <div class="clearfix">
          <h5 class="pull-left">Email Template Editor</h5>
          <span class="pull-right">
            <Button color="primary" className="mb-1 mr-1 "><FontAwesome name="save" />{' '}Save Changes</Button>
            <Button color="danger" className="mb-1 mr-1"><FontAwesome name="trash" />{' '}Delete Template</Button>
            <Button color="secondary" outline className="mb-1 mr-1">Close</Button>
          </span>
        </div>

        <Form autoComplete="off" noValidate>
          <FormGroup>
            <Label><Required required>Template Name</Required></Label>
            <Input
              value={this.state.data.title}
              type="text"
              required />
          </FormGroup>
          <FormGroup>
            <Label><Required required>Subject</Required></Label>
            <Input
              value={this.state.data.subject}
              type="text"
              required />
          </FormGroup>
          <FormGroup>
            <Label><Required required>Change State</Required></Label>
            <Input
              value={this.state.data.subject}
              type="select"
              required>
              {
                this.state.states.map((state) => {
                  return <option value={state}>{state}</option>
                })
              }
            </Input>
          </FormGroup>
          <FormGroup>
            <Label><Required required>Applicable Phase</Required></Label><br/>
            {
              this.state.phases.map((phase, i) => {
                return (
                  <FormGroup check inline>
                    <Label check className="mr-2">
                      <Input type="checkbox" checked />{` Phase ${i+1}: ${phase}`} 
                    </Label>
                  </FormGroup>
                )
              })
            }
          </FormGroup>
          <FormGroup id='tmpl-editor-wrapper' className={classnames({'tmpl-editor-wrapper-full': this.state.isExpanded})}>
            <Label><Required required>Message</Required></Label>
            {
              this.state.isExpanded 
              ? (
                <Button size='sm' color='primary' outline className='pull-right' title='Compress'
                    onClick={this.toggleExpand}><FontAwesome name='compress'/></Button>
              )
              : (
                <a href='#tmpl-editor-wrapper' class='btn-sm btn-primary-outline pull-right' title='Expand'
                    onClick={this.toggleExpand} id='btn-expand'><FontAwesome name='expand'/></a>
              )
            }
            <span class="pull-right mr-1">
              <a href="#" onClick={(event) => this.toggleHelper(event)}>Template Helper</a>
            </span>
            <Collapse isOpen={this.state.showHelper}>
              <InputGroup>
                <Input type="select">
                  {
                    this.state.tags.map((taggroup) => {
                      return (
                        <optgroup label={taggroup.group}>
                          {
                            taggroup.list.map((tag) => {
                              return <option value={tag.tag}>{tag.label}</option>
                            })
                          }
                        </optgroup>
                      )
                    })
                  }
                </Input>
                <InputGroupAddon addonType="append"><Button color="primary">Insert to template</Button></InputGroupAddon>
              </InputGroup>
            </Collapse>
            <Editor
              editorState={editorState}
              editorClassName={classnames('form-control', {'tmpl-editor-full' : this.state.isExpanded}, {'tmpl-editor' : !this.state.isExpanded})}
              onEditorStateChange={this.onEditorStateChange}
              toolbar={{
                options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'image', 'remove', 'history']
              }}
            />
          </FormGroup>
        </Form>
        {/* <label>Sample Output:</label>
        <textarea readonly>{draftToHtml(convertToRaw(editorState.getCurrentContent()))}</textarea> */}
      </div>
    )
  }
}

export default styled(withLayout(TemplateEditor))`
.tmpl-editor-wrapper-full
{
  height: 100vh;
}

.tmpl-editor
{
  height: 20em;
}

.tmpl-editor-full
{
  height: calc(100vh - 82px);
}
`;