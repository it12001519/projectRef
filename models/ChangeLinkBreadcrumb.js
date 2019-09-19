import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import classnames from 'classnames';

/*

    Builds a bread crumb bar from an array of objects

    Usage example (inside of a component):

    render() {

        const crumbs = [
            {
                text: 'Home',           // the text displayed on the item (required)
                to: "/"                 // the link to follow when clicked (optional)
            },
            {
                text: 'Request Samples',
                to: "/sample/request"
            },
            {
                text: 'Submit Sample',
                active: true                // mark the last item as active (recommended)
            }
        ]

        return (
            <div>

                <ChangeLinkBreadcrumb crumbs={crumbs}/>

            ...

*/

let ChangeLinkBreadcrumb = styled(class extends React.Component {

    static defaultProps = {
        crumbs: []
    }

    render() {

        const items = this.props.crumbs.map((crumb, i) => {

            return (
                <li key={crumb.text} className={classnames('chgbreadcrumb-item', { active: crumb.active })}>
                    {
                        i > 0 ? <span className='chgbreadcrumb-delim'>/</span> : ''
                    }
                    {
                        (crumb.to)
                            ? <Link to={crumb.to}>{crumb.text}</Link>
                            : crumb.text
                    }
                </li>
            )

        })

        return (
            <nav className={classnames('changelink-breadcrumb', `${this.props.className}`)} aria-label='breadcrumb'>
                <ol className='breadcrumb'>
                    {items}
                </ol>
            </nav>
        )
    }
}) `

font-size: 0.8em;

> .breadcrumb {
    background-color: #ffffff;
    margin-bottom: .25rem;
    padding-left: 0;

    > .chgbreadcrumb-item {
        display: inline-block;
        padding-right: .5rem;

        > .chgbreadcrumb-delim {
            color: #6c757d;
            padding-right: .5rem;
        }
    }
}

`;

export default ChangeLinkBreadcrumb
