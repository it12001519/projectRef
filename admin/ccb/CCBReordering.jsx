import React from 'react';
import FontAwesome from 'react-fontawesome';
import styled from 'styled-components';
import { Label, Input, Row, Badge, ListGroup, ListGroupItem, Button, Form, FormGroup, Col} from 'reactstrap';
import { SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';
import FetchUtilities from 'js/universal/FetchUtilities';
import classnames from 'classnames';
import Spinner from 'js/universal/spinner';
import withLayout from 'js/app/models/withLayout';
import { Link } from 'react-router-dom';
import ChangeLinkBreadcrumb from 'js/app/models/ChangeLinkBreadcrumb';

let ReorderInput;
const SortableItem = SortableElement(({value}) => <ListGroupItem className="listGroup">
    {/* c<ReorderInput data={value} />&nbsp; */}
    <Label>Position: <Badge pill>{value["position"]}</Badge></Label>&nbsp;{'/'}&nbsp;
    <Label>Role: {value["role"]}</Label>&nbsp;{'/'}&nbsp;
    <Label>Primary Name: {value["name"]}</Label>&nbsp;{'/'}&nbsp;
    <Label>Delegate Name: {value["delegate"]}</Label>
</ListGroupItem>);

const SortableList = SortableContainer(({items}) => {
  return (
    <div>
        <ListGroup>
        {items.map((value, index) => (
            <SortableItem key={`item-${index}`} index={index} value={value} />
        ))}
        </ListGroup>
    </div>
  );
});

let CCBReorder = withLayout(class CCBReorder extends React.Component{
    constructor(props){
        super();
        this.state = {
            items: [{'key': 'value-1', 'test': 'test-value'}],
            showSpinner: false,
            dropDownVal: ''
        }
        this.handleClick = this.handleClick.bind(this);
        this.toggleSpinner = this.toggleSpinner.bind(this);
        this.loadData = this.loadData.bind(this);
    }

    componentDidMount(){
        this.toggleSpinner();
        this.setState({
            dropDownVal: this.props.location.state.dropDownVal
        }, () => this.loadData());
    }

    loadData(){
        fetch('/api/v1/fetchAllCCB/' + this.state.dropDownVal, { 
            credentials: 'include',
            headers: new Headers({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            })
        }).then(
            FetchUtilities.checkStatusWithSecurity
        ).then((response) => { 
            return response.json() 
        }).then((json) => { 
            this.state = json;
            this.setState({items : this.state.content});
            this.toggleSpinner();
        }).catch((ex) => { 
            throw ex });
    }

    toggleSpinner(){
        this.setState({
            showSpinner: !this.state.showSpinner
        })
    }

    onSortEnd = ({oldIndex, newIndex}) => {
        this.setState({
          items: arrayMove(this.state.items, oldIndex, newIndex),
        });
    };

    handleClick(){
        this.toggleSpinner();
        let data = [];
        this.state.items.forEach((o) => {
            let keyValue = {};
            keyValue.id = o.id;
            keyValue.role = o.roleId;
            data.push(keyValue);
        });
        fetch('/api/v1/reorderCCBPosition',
        {
            method: 'POST',
            body: JSON.stringify(data),
            headers: new Headers({
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }),
            credentials: 'include',
        })
        .then(FetchUtilities.checkStatusWithSecurity)
        .then((response) => {
            if (response.status !== 200) {
                throw response;
            }else{
                this.loadData();
            }
        })
        .catch((error) => {
            FetchUtilities.handleError(error);
        });
        this.toggleSpinner();
    }

    render() {
        return (
            <div className={classnames('mainHolder', `${this.props.className}`)}>
                <Spinner showSpinner={this.state.showSpinner} />
                <ChangeLinkBreadcrumb crumbs={[
                    { text: 'Home', to: "/" },
                    { text: 'CCB', to: "/admin/ccb" },
                    { text: 'CCB Role Reorder', active: true }
                ]} />
                
                <Row>
                    <Col sm="9"><Label>Drag and drop the rows to reorder</Label></Col>
                    <Col sm="3">
                        <Button className="mr-1 pull-right" color="primary" onClick={this.handleClick}><FontAwesome name="save" /> Save</Button>
                        <Link to="/admin/ccb/"><Button className="mr-1 pull-right" color="secondary"> Cancel </Button></Link>
                        </Col>
                </Row>

                {this.state.items !== null ? (
                    <SortableList items={this.state.items} onSortEnd={this.onSortEnd} />
                ) : (
                    <h6>Loading Data</h6>
                )}
                
                <Row>
                    <Col sm="9"><Label>Drag and drop the rows to reorder</Label></Col>
                    <Col sm="3"><Button className="mr-1 pull-right" color="primary" onClick={this.handleClick}><FontAwesome name="save" /> Save</Button>
                    <Link to="/admin/ccb/"><Button className="mr-1 pull-right" color="secondary"> Cancel </Button></Link></Col>
                </Row>
            </div>
        );
    }
});

ReorderInput = styled(class extends React.Component{
    constructor(props) {
    super(props);
    this.state = {
      data: this.props.data,
      old_position: this.props.data.POSITION,
      new_position: 0
    };
    this.handleFocus = this.handleFocus.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleChange(e) {
    e.preventDefault();
    const target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState((previousState) => {
        previousState.data = { ...previousState.data, [name]: value };
        return previousState;
    });
  }

  componentWillReceiveProps(next){
        this.setState({
            data: null,
        }, () => {
            this.refresh();
        });
    }

  refresh(){
      this.setState({
          data: this.props.data,
          old_position: this.props.data.POSITION
      })
  }

  handleFocus(){
  }

  handleClick(){      
  }

  render() {
      let divStyle = {
            display: 'inline-block',
            maxWitdh: '200px'
      }
    return (
        
        <div style={divStyle} className={classnames('fieldHolder', `${this.props.className}`)}>
            {this.state.data !== null ? (<Form inline>
                <FormGroup>
                    <Input
                    name="POSITION"
                    value={this.state.data.POSITION ? this.state.data.POSITION : 0}
                    defaultValue={''}
                    onChange={this.handleChange}
                    onFocus={this.handleFocus}
                    type="number" />
                </FormGroup>
                {' '}
                <Button color="primary" onClick={this.handleClick}><FontAwesome name="check" /></Button>
            </Form>
            ) : (
                <Form>
                    <FormGroup>
                        <Input
                        name="POSITION"
                        defaultValue={''}
                        onChange={this.handleChange}
                        onFocus={this.handleFocus}
                        type="number" />
                    </FormGroup>
                    <Button color="primary" onClick={this.handleClick}><FontAwesome name="check" /></Button>
                </Form>
            )}
        </div>
    );
  }
})`
li{
    list-style: none;
}

input{
    max-width: 75px;
    display: inline-block;
}

.list-group-item{
    padding: .4rem 1.25rem;
}
.custom-placeholder{
    z-index: 9999px;
}
.fieldHolder{
    width: 200px !important;
    display: inline-block;
}
`;

export default styled(CCBReorder)`
div
{
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.row
{
    margin: .5rem 0;
}
`;