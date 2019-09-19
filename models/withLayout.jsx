import React, { Component, } from 'react';
import { AppContext } from 'router';
import { Link, } from 'react-router-dom';
import styled, { injectGlobal, } from 'styled-components';
import FontAwesome from 'react-fontawesome';
import classnames from 'classnames';
import enhanceWithClickOutside from 'react-click-outside';
import { Config } from 'js/universal/environmentConfig.js';
import FetchUtilities from 'js/universal/FetchUtilities';

import { HeaderSearch, TiNavBar, } from 'ti-react-components';
import Banner from 'js/app/models/Banner';
import Search from 'js/app/models/Search';
import AnnouncementBar from 'js/app/models/AnnouncementBar';

import tiBug from 'img/ti-bug-white.png';

let TopNavBar, Branding, AccountBadge, HelpLink;

const LOGOUT_URL = `/oidc/logout`

function withLayout(InnerComponent) {
  return styled(class extends Component {
    constructor(props, context) {
      super(props, context)
      this.state = {
        searchData: '',
        searchType: ''
      }
    }

    componentWillMount() {
      document.title = 'ChangeLink';
    }

    // Submit search request
    submitSearch = (data, type) => {
      if (data !== '') {
        this.setState({
          searchData: data,
          searchType: type,
          searchTimestamp: +new Date
        })
      }
    }

    // Close search callback
    closeSearch = () => {
      // Can handle if desired ...
    }

    render() {
      const { ...other } = this.props;
      const context = this.context;
      return (
        <AppContext.Consumer>
          {(context) => (
            context.user
              ? (
                <div>
                  <TopNavBar userDetails={context.user} userAccess={context.userAccess} submitSearch={this.submitSearch} />
                  <CipBanner />
                  <Banner />
                  <div className="container-fluid">
                    {!!context.user ? <AnnouncementBar userDetails={context.user} unreadAnnouncement={context.unreadAnnouncement} /> : undefined}
                  </div>
                  <div className="container-fluid">
                    <InnerComponent {...other} userDetails={context.user} userAccess={context.userAccess} hasRole={context.hasRole} fetchUserAccess={context.fetchUserAccess} />
                  </div>
                  <Search
                    searchData={this.state.searchData}
                    searchType={this.state.searchType}
                    searchTimestamp={this.state.searchTimestamp}
                    onClose={this.closeSearch}
                  />
                  <UserAccessCheck context={context} />
                </div>
              )
              : (<div></div>)
          )}
        </AppContext.Consumer>
      );
    }

  })`

  .dropdown-menu
  {
    padding: .125rem 0;
  
    > .dropdown-item
    {
      padding: .125rem .5rem;
    }
  
    > .dropdown-divider
    {
      margin: .25rem 0;
    }
  
    .dropdown-item:focus,
    .dropdown-item:hover,
    .dropdown-item.active,
    .dropdown-item.selected
    {
      background-color: #007BFF;
      color: #FFFFFF;
    }
  
  }

  `;
}

// Only function is to check if user roles have expired. If so,
// will call the fetchUserAccess method passed in props and refresh
// user roles. Note that this is only needed if the roles are not
// set to be auto-refreshed by a timer. See router.jsx 'finalRoleAutoRefresh' variable.
const UserAccessCheck = props => {
  const { context } = props;
  if (context.userAccessTimestamp) {
    let timeStamp = +new Date;
    let diffSeconds = (timeStamp - context.userAccessTimestamp) / 1000;
    if (diffSeconds >= context.roleExpirationSeconds) {
      context.fetchUserAccess();
    }
  }
  return null;
};

let CipBanner = styled(class extends Component {
  render() {
    return (
      <span className={this.props.className}>
        {Config.cip.message.length > 0 ? (
          <div className='container-fluid'>
            <strong>{Config.cip.message}</strong>
          </div>
          ) : (
          <div className='container-fluid'>
            &nbsp;
          </div>
          )
        }
      </span>
    );
  }
})`

> div 
{
  background-color: #115566;
  color: #ffffff;
  padding-left: 30px;
  padding-right: 30px;
}

`;

let CreateButton = styled(class extends Component {
  render() {
    return (
      <span className={this.props.className}>
        <Link to={{ pathname: '/change/create/' }}>
          <button className='btn btn-sm btn-default ml-2 text-dark'><FontAwesome name='plus' />{' '}Create</button>
        </Link>
      </span>
    );
  }
})`

padding: 0 !important;

> span
{
  height: 100%;
  padding: 5px;
}

`;

TopNavBar = class extends Component {
  
  // Filter links by role (only 1 level of items, no recursion)
  filterLinksByRole = (arr, roles) => {
      return arr.map(obj => {
        if(obj.items) { 
          obj.items = obj.items.filter(item => {
            if(item.role) {
              return roles.find(k => k.toLowerCase().trim()===item.role.toLowerCase().trim());
            }        
            return item;
          })
          return obj;
        } 
        return obj;
      }) 
  };

  render() {
    const { userAccess } = this.props;
    
    // Use 'role' property on item array objects to filter by role
    let leftMenu = this.filterLinksByRole([
      {
        icon: 'edit',
        label: 'Changes',
        routeTo: '/changes/'
      },
      {
        icon: 'envelope',
        label: 'PCNs',
        routeTo: '/pcns/',
      },
      {
        icon: 'file',
        label: 'Reports',
        items: [
          {
            icon: 'th-large',
            label: 'Implementation Matrix',
            routeTo: '/impl-matrix/'
          },
          // TODO add to top-level menu once performance is acceptable
          // {
          //     icon: 'th-large',
          //     label: 'Approval Matrix',
          //     ro  uteTo: '/approval-matrix/',
          // },
          {
            icon: 'microchip',
            label: 'Samples',
            routeTo: '/samples/',
          },
          {
            icon: 'comment',
            label: 'Feedbacks',
            routeTo: '/feedbacks/',
          },
          {
            icon: 'sticky-note',
            label: 'SWRs',
            routeTo: '/swr/',

          },
          {
            icon: 'tasks',
            label: 'Tasks',
            routeTo: '/tasks/',
          },
          {
            icon: 'sticky-note',
            label: 'Datasheets',
            routeTo: '/datasheets/',
          },
          {
            icon: 'sticky-note',
            label: 'PCN Revisions',
            routeTo: '/pcnRevisions/',
          },
          {
            icon: 'sticky-note',
            label: 'AdHoc Reports',
            href: `${Config.banner.urlAdhoc}`,
            target: '_blank'
          },
          {
            icon: 'sticky-note',
            label: 'Change Reports',
            routeTo: '/reports/'
          }
        ]
      },
      {
        icon: 'flag',
        label: 'Metrics',
        items: [
          {
            icon: 'microchip',
            label: 'CL Samples Backlog',
            routeTo: '/metrics/samplesBacklog/'
          }
        ]
      },
      {
        render: () => {
          return <CreateButton />;
        }
      }
    ], userAccess);

    // Use 'role' property on item array objects to filter by role
    let rightMenu = this.filterLinksByRole([
      {
        icon: 'cog',
        label: 'Admin',
        items: [
          {
            icon: 'bullhorn',
            label: 'Announcements',
            routeTo: '/admin/announcements'
          },
          {
            icon: 'cog',
            label: 'CCB Maintenance',
            routeTo: '/admin/ccb'
          },
          {
            icon: 'cog',
            label: 'SBE Maintenance',
            routeTo: '/admin/sbe'
          },
          // Comment this out for the first release
          // {
          //   icon: 'envelope',
          //   label: 'Emails',
          //   routeTo: '/admin/email'
          // },
          {
            icon: 'microchip',
            label: 'Samples Management',
            routeTo: '/admin/samples'
          },
          {
            icon: 'users',
            label: 'User Role Management',
            routeTo: '/admin/security'
          },
          // TODO Comment this out for the first release
          // {
          //   icon: 'users',
          //   label: 'Permission Management',
          //   routeTo: '/admin/permissions'
          // },
          {
            icon: 'microchip',
            label: 'Samples Dashboard',
            routeTo: '/admin/samples/dashboard'
          },
          // TODO Comment this out for the first release
          // {
          //   icon: 'trash',
          //   label: 'Trash Can',
          //   routeTo: '/admin/trashcan'
          // },
          {
            icon: 'calendar',
            label: 'Scheduled Jobs',
            routeTo: '/admin/scheduled'
          },
          {
            icon: 'calendar',
            label: 'Tracker Jobs',
            routeTo: '/admin/tracker'
          },
          {
            icon: 'cog',
            label: 'Configurations',
            routeTo: '/admin/config'
          },
          {
            icon: 'tasks',
            label: 'Batch Process Status',
            routeTo: '/admin/batchprocess'
          },
          {
            icon: 'git-square',
            label: 'Git Information',
            routeTo: '/admin/gitinfo',
            role: 'System Admin'
          },
        ],
      }
    ], userAccess);

    return (
      <TiNavBar

        userAccess={this.props.userAccess}

        upperLeft={<Branding />}
        upperCenter={
          <HeaderSearch
            onSubmit={this.props.submitSearch}
            types={[
              {
                label: 'Everything',
                value: 'everything',
                default: true,
              },
              {
                label: 'Changes',
                value: 'change',
              },
              {
                label: 'PCNs',
                value: 'pcn',
              },
              {
                label: 'Samples',
                value: 'sample',
              },
              {
                label: 'Feedback',
                value: 'feedback',
              },
              {
                label: 'SWR',
                value: 'swr',
              }
            ]}
          />
        }
        upperRight={<span>
          <HelpLink />
          <AccountBadge data={this.props.userDetails} userAccess={this.props.userAccess} />
        </span>}
        leftMenu={leftMenu}
        rightMenu={rightMenu}
      />
    );
  }

};

HelpLink = styled(class extends Component {
  render() {
    const context = this.context;
    return (
      <AppContext.Consumer>
        {(context) => (
          <React.Fragment>
            {context.helpLink ? (
              <div className={classnames('helpLink', `${this.props.className}`)}>
                <a href={context.helpLink.content.confluence} target="_blank" rel="noopener noreferrer">
                  <FontAwesome name="question" />&nbsp; Help
                </a>
              </div>
            ) : (
                null
              )}
          </React.Fragment>
        )}
      </AppContext.Consumer>
    );
  }
})`
display: inline-block;
float: left;
height: 100%;
align-items: center;
padding: 8px 8px 8px 0px;
a
{
  display: flex;
  text-decoration: none;
  height: 100%;
  color: #FFFFFF;
  align-items: center;

  &:hover
  {
    text-decoration: none;
  }

}
`;

Branding = styled(class extends Component {
  render() {
    return (
      <Link className={`branding ${this.props.className}`} to={'/'}>
        <img className="ti-bug" src={tiBug} alt="Texas Instruments" />
        <span className="app-name">
          changelink
        </span>
      </Link>
    );
  }
})`

display: inline-block;
float: left;
height: 100%;
align-items: center;
padding-top: 8px;
padding-bottom: 8px;

a
{
  display: flex;
  text-decoration: none;
  height: 100%;
  color: #FFFFFF;
  align-items: center;

  &:hover
  {
    text-decoration: none;
  }

}

.ti-bug
{
  margin-left: 5px;
  height: 100%;
}
.app-name
{
  font-size: 18px;
  font-weight: normal;
  margin-left: 5px;
  margin-right: 5px;
}

`;

AccountBadge = styled(enhanceWithClickOutside(class extends Component {

  constructor(props) {
    super(props)
    this.state = {
      isOpen: false
    }
  }

  logout = () => {
    FetchUtilities.fetchGet(LOGOUT_URL, _=> window.location.reload(true))
    sessionStorage.clear()
  }

  handleClickOutside() {
    this.setState({ isOpen: false, });
  }

  componentDidUpdate(prevProps) {
    // Handle props changes on userAccess
    if ((prevProps.userAccess.length>0) && (JSON.stringify(prevProps.userAccess) !== JSON.stringify(this.props.userAccess))) {
    }
  }
 
  render() {
    return (
      this.props.data
        ? (
          <div className={classnames('dropdown', `${this.props.className}`)}>
            <span
              aria-expanded={this.state.isOpen}
              aria-haspopup
              className="dropbtn"
              onClick={() => this.setState({ isOpen: !this.state.isOpen, })}
            >
              <span><FontAwesome name='user-circle' />&nbsp; {this.props.data.id} &nbsp;</span>
              <FontAwesome name={this.state.isOpen === true ? 'caret-up' : 'caret-down'} />
            </span>
            <div
              aria-hidden={!this.state.isOpen}
              className={classnames('dropdown-menu', { show: this.state.isOpen }, 'placement-right')}
              data-placement="bottom-start"
              onClick={() => this.setState({ isOpen: !this.state.isOpen, })}
              role="menu"
              tabIndex="-1"
              x-placement="bottom-start"
            >
              <div key={`${this.props.data.name}::${this.props.data.id}`} className='dropdown-item'>
                {this.props.data.name}
              </div>

              <hr />
              <span onClick={this.logout} style={{ cursor: 'pointer' }}>
                <div className='dropdown-item'>
                  <FontAwesome name='power-off' />&nbsp; Logout
                </div>
              </span>

              <hr />
              {/* <Link to={'/admin/permissions'}> */}
                <div className='dropdown-item'>
                  <FontAwesome name='lock' />&nbsp; My Roles
                <ul className="nav flex-column">
                    {this.props.userAccess.map((e, i) => (
                      <li key={i} className="nav-item"><FontAwesome name='check' />&nbsp; {e}</li>
                    ))}
                  </ul>
                </div>
              {/* </Link> */}
            </div>
          </div>
        )
        : (
          <span className={`${this.props.className}`}>
            <FontAwesome name="key" />{' '}Login
          </span>
        )
    )
  }
}))`

display: flex;
align-items: center;
height: 100%;
padding-left: 8px;
padding-right: 8px;

.dropdown-menu.show
{
  margin: 0px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;

  > a:hover, > a:focus
  {
    text-decoration: none;
  }
}

.dropdown-item {

  text-decoration: none;

  &:hover, &:focus 
  {
    background-color: #007bff;
    color: #ffffff;
    text-decoration: none;
  }
}

.placement-right
{
  right: 0;
  left: auto;
}

li
{
 margin-left:10px;
}

`;

injectGlobal`

body { font-size: .8rem; }

.form-control, .btn, .dropdown-menu,
.form-control-sm, .input-group-sm > .form-control, .input-group-sm > .input-group-append > .btn, .input-group-sm > .input-group-append > .input-group-text, .input-group-sm > .input-group-prepend > .btn, .input-group-sm > .input-group-prepend > .input-group-text
{ font-size: inherit; }

h5.modal-title { font-size: 1.25rem } 

.breadcrumb
{
  padding: .25rem .75rem;
  font-size: .825rem;
}

.bg-dark {
  background-color: rgb(17, 85, 102) !important;
}

`;

export default withLayout;
