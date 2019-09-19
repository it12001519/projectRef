import React, { Component, } from 'react';
import { withRouter, } from 'react-router-dom';

let withLink = (InnerComponent) => {
  return withRouter(class extends Component {

    componentWillMount() {
      this.elementProps = this.generateElementProps(this.props);
    }

    componentWillReceiveProps(props) {
      this.elementProps = this.generateElementProps(props);
    }

    generateElementProps(props) {
      var out = Object.assign({}, props);
      let history = out.history;
      delete out.match;
      delete out.location;
      delete out.history;
      delete out.staticContext;

      let orig_href = out.href;
      out.href = /*(!/^https?:\/\//i.test(out.href) ? 'quack' : '') +*/ out.href;
      out.onSelect = undefined;
      out.onClick = function(e) {
        if (!e.ctrlKey && e.nativeEvent.which !== 2) {
          e.preventDefault();
          history.push(orig_href);
        } else {
          return;
        }
      };
      return out;
    }

    render () {
      return (
        <InnerComponent {...this.elementProps} />
      );
    }
  });
};

export default withLink;