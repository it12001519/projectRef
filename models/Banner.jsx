import React, { Component, } from 'react';
import { Alert, } from 'reactstrap';
import { Config } from 'js/universal/environmentConfig.js';
import styled from 'styled-components';

let Banner = class extends Component {

  render() {
    return (
      <span className={this.props.className}>
        {Config.banner.message.length > 0 ? (
          <div className='container-fluid'>
            <Alert className='p-1' color={Config.banner.color}>
              <strong>{Config.banner.message}</strong>
            </Alert>
          </div>
        ) : (
            undefined
          )
        }
      </span>
    )
  }
}

export default styled(Banner)`

// position: relative;
// top: -10px;

> div 
{
  padding-left: 0px;
  padding-right: 0px;

  // > div.alert
  // {
  //   margin-bottom: 0px;
  // }
}
`;
