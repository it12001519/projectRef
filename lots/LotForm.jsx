import React, { Component, } from 'react';
import { Button, Form, FormFeedback, FormGroup, Label, Input } from 'reactstrap';
import { FormValidator } from 'js/universal/FormUtilities';

class LotForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data
    };

    // Bind functions
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  // Default props
  static defaultProps = {
    data: {}
  }

  // Handler for form cancel
  handleCancel() {
    if (typeof this.props.onCancel === 'function') {
      this.props.onCancel();
    }
  }
  
  // Handler for form submit
  handleSubmit(e) {
    // Prevent legacy form post
    e.preventDefault();
    
    // Validate
    if (FormValidator.validateForm(e)) {
      // TODO place ajax POST / PUT stuff here...
      let isSuccess = true;

      if (typeof this.props.onSubmit === 'function') {
        this.props.onSubmit(this.state.data, isSuccess);
      }
    }
  }
 
  // Handler for form delete
  handleDelete() {     
    // TODO place ajax DELETE stuff here...
    let isSuccess = true;

    if (typeof this.props.onSubmit === 'function') {
      this.props.onSubmit({}, isSuccess);
    }
  }

  // Handler for form change
  handleChange(e) {
    // Prevent legacy form post
    e.preventDefault();

    // Get field name and value from event
    const target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
  
    // Validate
    FormValidator.validateForm(e); 

    // Set state using function to granularly modify data
    this.setState((previousState) => {
      return previousState.data = { ...previousState.data, [name]: value };
    });
  }

  render() {
    return (
      <Form onSubmit={this.handleSubmit} autoComplete="off" noValidate> 
        <FormGroup>
          <Label for="lot">Lot</Label>
          <Input 
            name="lot" 
            value={this.state.data.lot}
            onChange={this.handleChange}
            type="text" pattern="\d*" maxLength="7"
            required />
            <FormFeedback>Number max length = 7</FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label for="lpt">Lpt</Label>
          <Input 
            name="lpt" 
            value={this.state.data.lpt}
            onChange={this.handleChange}
            type="text" pattern="\d*" maxLength="4"
            required />
            <FormFeedback>Number max length = 4</FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label for="facility">Facility</Label>
          <Input 
            name="facility" 
            value={this.state.data.facility}
            onChange={this.handleChange}
            type="text" maxLength="6"
            required />
            <FormFeedback>Text max length = 6</FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label for="curQty">Qty</Label>
          <Input 
            name="curQty" 
            value={this.state.data.curQty}
            onChange={this.handleChange}
            type="text" pattern="\d*" maxLength="3"
            required />
            <FormFeedback>Number max length = 3</FormFeedback>
        </FormGroup>
        {/* Can optionally use onClick, but will not have default "form" submit-on-enter behavior */}
        {/* <Button color="primary" onClick={this.handleSubmit} className="mr-1">Submit</Button> */} 
        <Button type="submit" color="primary" className="mr-1">Submit</Button>       
        <Button onClick={() => { if (window.confirm('Are you sure?')) this.handleDelete() }} color="danger" className="mr-1">Delete</Button>
        <Button onClick={this.handleCancel} color="secondary" outline className="mr-1">Close</Button>
      </Form>
    )
  }
}

export default LotForm;
