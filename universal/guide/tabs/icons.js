import React, { Component, } from 'react';
import {
  ListGroup, ListGroupItem
} from 'reactstrap';
import FontAwesome from 'react-fontawesome';

class IconsTab extends Component {
  render() {
    return (
      <div className={this.props.className}>

        <div className="clearfix" style={{ height: '1em' }} />
        <h5>Icons</h5>

        <p>Below is the list of icons which are used to represent objects/pages in Changelink and how we will be using them.</p>

        <ListGroup flush>
          <ListGroupItem><FontAwesome name="tasks" />{' '}Actions / Tasks</ListGroupItem>
          <ListGroupItem><FontAwesome name="cog" />{' '}Admin / Settings / Options</ListGroupItem>
          <ListGroupItem><FontAwesome name="bullhorn" />{' '}Announcements</ListGroupItem>
          <ListGroupItem><FontAwesome name="paperclip" />{' '}Attachment</ListGroupItem>
          <ListGroupItem><FontAwesome name="edit" />{' '}Change</ListGroupItem>
          <ListGroupItem><FontAwesome name="comment" />{' '}Comment</ListGroupItem>
          <ListGroupItem><FontAwesome name="envelope" />{' '}Email / PCN</ListGroupItem>
          <ListGroupItem><FontAwesome name="star" />{' '}Favorites / Starred</ListGroupItem>
          <ListGroupItem><FontAwesome name="th-large" />{' '}Grid / Matrix</ListGroupItem>
          <ListGroupItem><FontAwesome name="home" />{' '}Home Page / Dashboard</ListGroupItem>
          <ListGroupItem><FontAwesome name="question-circle" />{' '}Help / Tooltip</ListGroupItem>
          <ListGroupItem><FontAwesome name="info-circle" />{' '}Information</ListGroupItem>
          <ListGroupItem><FontAwesome name="link" />{' '}Link</ListGroupItem>
          <ListGroupItem><FontAwesome name="key" />{' '}Log in / Log out</ListGroupItem>
          <ListGroupItem><FontAwesome name="clock-o" />{' '}Recent</ListGroupItem>
          <ListGroupItem><FontAwesome name="file" />{' '}Reports</ListGroupItem>
          <ListGroupItem><FontAwesome name="search" />{' '}Search / Lookup / Filter</ListGroupItem>
          <ListGroupItem><FontAwesome name="bolt" />{' '}System / Auto-generated Object</ListGroupItem>
          <ListGroupItem><FontAwesome name="trash" />{' '}Trash Can / Recycle Bin</ListGroupItem>
          <ListGroupItem><FontAwesome name="user" />{' '}User / Account / Role Management</ListGroupItem>
        </ListGroup>

        <div className="clearfix" style={{ height: '1em' }} />

        <p>Below is the list of icons which are used to represent actions in Changelink and how we will be using them.</p>

        <ListGroup flush>
          <ListGroupItem><FontAwesome name="plus" />{' '}Used to denote the function of adding a record</ListGroupItem>
          <ListGroupItem><FontAwesome name="pencil" />{' '}Used to denote the function of editing a record</ListGroupItem>
          <ListGroupItem><FontAwesome name="trash" />{' '}Used to denote the function of deleting a record</ListGroupItem>
          <ListGroupItem><FontAwesome name="eye" />{' '}Used to denote the function of showing/viewing a record</ListGroupItem>
          <ListGroupItem><FontAwesome name="eye-slash" />{' '}Used to denote the function of hiding a record</ListGroupItem>
          <ListGroupItem><FontAwesome name="save" />{' '}Used to denote the function of saving a record</ListGroupItem>
          <ListGroupItem><FontAwesome name="upload" />{' '}Used to denote the function of uploading an object</ListGroupItem>
          <ListGroupItem><FontAwesome name="download" />{' '}Used to denote the function of downloading an object</ListGroupItem>
          <ListGroupItem><FontAwesome name="copy" />{' '}Used to denote the function of duplicating/copying a record</ListGroupItem>
          <ListGroupItem><FontAwesome name="undo" />{' '}Used to denote the function of restoring of a record from trash/recycle bin</ListGroupItem>
          <ListGroupItem><FontAwesome name="star" />{' '}Used to denote adding/removing something as favorite/starred</ListGroupItem>
        </ListGroup>

        <div className="clearfix" style={{ height: '1em' }} />

        <p>Miscellaneous icons used in the site.</p>

        <ListGroup flush>
          <ListGroupItem><FontAwesome name="plus-square" />{' '}Indicates an element can be expanded</ListGroupItem>
          <ListGroupItem><FontAwesome name="minus-square" />{' '}Indicates an element can be collapsed</ListGroupItem>
          <ListGroupItem><FontAwesome name="angle-double-left" />{' '}Go Back</ListGroupItem>
          <ListGroupItem><FontAwesome name="angle-double-right" />{' '}Go Forward</ListGroupItem>          
          <ListGroupItem><FontAwesome name="caret-down" />{' '}Usually used to indicate a dropdown option or to show more details</ListGroupItem>
          <ListGroupItem><FontAwesome name="check-square" />{' '}Usually used to indicate approval/completion</ListGroupItem>
        </ListGroup>

      </div>
    );
  }
}

export default IconsTab;