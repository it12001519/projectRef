import React, { Component, Fragment, } from 'react';
import { Row, Col, } from 'reactstrap';
import 'whatwg-fetch';
import FetchUtilities from 'js/universal/FetchUtilities';
import FontAwesome from 'react-fontawesome';
import { Link } from 'react-router-dom';
import Pagination from "js/app/models/Pagination";
import { ComponentModal, } from 'js/universal/Modals';

// === URLs ===
const SEARCH_URL = "/api/v1/search";

// Styles
let faSmallStyle = {fontSize: '.6em'}
let badgeWeightStyle = {fontWeight: 'normal'}
let hrStyle = {marginTop: '.5em', marginBottom: '.5em'}

// Utilities
function titleCase(str) {
    if(!Boolean(str)) {
        return str;
    }
    return str.toLowerCase().split(' ').map(function(word) {
      return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
}

function upperCase(str) {
    return str.toUpperCase();
}

function stripValue(str, valueToReplace) {
    str = str.replace(valueToReplace, ""); 
    return str;
}

function sIfPlural(length) {
    if(length > 1) {
        return "s";
    } else {
        return "";
    }
}

// Remove trailing _t and replace _ with " ".
// Note, if title changes to something other than _t,
// then obviously this function must change as well.
function scrubTitle(title) {
    let len = title.lastIndexOf("_t");
    let str = title.substr(0, len);
    str = str.replace(/_/g, " "); 
    return str;
}

// Using dangerous html to leverage using the <mark> css class. 
// Note, can remove if this is viewed as a problem. Just saying.
function createMarkup(html) {
    return {__html: html};
}

// Iterate related field sub-component. This will create comma-delimited list in a single span.
// Note, this relies on the suffix ending in -attribute.
const Related = ({related}) => {
    if(related.length===0) {
        return null;
    }

    let uniqueRelated = [...new Set(related.map(item => upperCase(stripValue(item.subType,"-attribute"))))];
    let relatedEntitiesString = uniqueRelated.join("/")

    return ( 
        <div>
            <div>
                <strong><FontAwesome name="link" />&nbsp;
                Related {relatedEntitiesString}{upperCase(sIfPlural(related.length))}&nbsp;-&nbsp;
                </strong>
                {related.map(function (result, index) {                   
                    if(related.length===index+1) {
                        // Last Row, no comma
                        return <span key={index.toString()}><Link to={"/" + result.linkUrl}>{result.link}</Link></span>
                    } else {
                        // Other Row, use comma
                        return <span key={index.toString()}><Link to={"/" + result.linkUrl}>{result.link}</Link>,&nbsp;</span>
                    }
                })}
            </div>
        </div>
    );
};

// Iterate highlights sub-component.
const Highlights = ({highlights}) => (
    <div>
        <div>
            <strong><FontAwesome name="search" />&nbsp;
            Search Results</strong>
        </div>
        {Object.keys(highlights).map(function (key, index) {
            let value = highlights[key];            
            return (
                <div key={index.toString()} className="ml-3">
                    <FontAwesome name="quote-left" className="text-dark" style={faSmallStyle} />&nbsp;
                    <span className="text-secondary">[{titleCase(scrubTitle(key))}]</span>&nbsp;
                    <span dangerouslySetInnerHTML={createMarkup(value)} />&nbsp;
                    <FontAwesome name="quote-right" className="text-dark" style={faSmallStyle} />
                </div> 
            )
        })}
    </div>
);

// Primary component
let Search = class extends Component {
    constructor(props) {
        super(props);     
        this.state = {
            page: 1,
            rows: 8, // How many rows returned per page
            data: {},
            isOpen: false,
            isLoading: false,
            showLoading: false // Not needed for small "rows" value
        }
    }

    // Used to flag whether data has been returned or not.
    hasData = () => {
        let arr = [];
        if (this.state.data.resultDetails !== undefined) {
            arr = this.state.data.resultDetails;
        }
        if (arr.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    // Change page and then search
    searchPagination =(data) => {
        // Set state using function and callback to eliminate async issues
        this.setState({
            page: + data.currentPage
        }, () => {
            this.search()
        })
    }

    // Http search
    search = () => {   
        this.setState({ isLoading: true });
        fetch(SEARCH_URL, {
            method: 'POST',
            headers: new Headers({
              'Content-Type': 'application/json',
              'Pragma': 'no-cache',
              'Cache-Control': 'no-cache'
            }),
            credentials: 'include',
            body: JSON.stringify({
                searchData: this.props.searchData,
                searchType: this.props.searchType.value,
                page: this.state.page,
                rows: this.state.rows,
            }),
        })
        .then(FetchUtilities.checkStatusWithSecurity)
        .then((response) => {
            return response.json();
        })
        .then((json) => {
            this.setState({ data: json, isLoading: false });
        })
        .catch((ex) => {
            console.error(ex);
            // throw ex;
        });
    }

    // Toggle closed, also invoke callback function from calling program
    toggleClosed = () => {  
        this.setState({
            isOpen: false
        }, () => {
            this.props.onClose()
        })
    }

    componentDidMount() {
        // ...
    }

    componentDidUpdate(prevProps) {
        if( 
            // If props searchData and searchType has a value
            ( 
                (this.props.searchData!=="") &&
                (this.props.searchType.value!=="") &&
                (this.props.searchData!==undefined) &&
                (this.props.searchType.value!==undefined) 
            ) &&
            // And the timestamp has changed since the last search request
            (
                (this.props.searchTimestamp !== prevProps.searchTimestamp)
            )
        ) 
        {
            // Then open, set page to 1 and perform search
            this.setState({
                isOpen: true,
                page: 1,
                data: {}
            }, () => {
                this.search()
            })
        }
    } 

    render() {
        const msg = `Searching for '` + this.props.searchData + `' in `+titleCase(this.props.searchType.value);
        const isLoading = this.state.isLoading;
        const showLoading = this.state.showLoading;
        return (
            <div>
                <ComponentModal
                    clickOutside
                    show={this.state.isOpen}
                    toggleModal={this.toggleClosed}
                    size='lg' 
                    color='white' 
                    icon='search' 
                    title={msg}
                >

                    {/* Begin Search Logic */}
                    <Fragment>

                            {/* isLoading */}
                            {isLoading && showLoading && (
                                <Row>
                                    <Col>
                                        <div className="mb-2">
                                            Searching...
                                        </div> 
                                    </Col>
                                </Row>
                            )}

                            {/* Data found */}
                            {this.hasData() && (
                                <div className="container-fluid">
                                    <Pagination
                                        totalRecords={this.state.data.numRowsTotal}
                                        pageLimit={this.state.data.rows}
                                        pageNeighbours={1}
                                        onPageChanged={this.searchPagination}
                                    />
                                    {this.state.data.resultDetails.map((result, index) => (   
                                        <div key={index.toString()} style={{margin:".4em"}} >                                                   
                                            <hr style={hrStyle}/> 
                                            <Row>
                                                <Col>
                                                    {/* <div> */}
                                                        <a href={"/" + result.linkUrl}>{result.link}</a>&nbsp;
                                                        <strong>{result.description}</strong>
                                                        <span className="text-muted">&nbsp;
                                                            <span className="badge badge-light text-secondary" style={badgeWeightStyle} >
                                                                Type&nbsp;is&nbsp;{upperCase(result.type)}
                                                            </span>
                                                            &nbsp;<FontAwesome name="ellipsis-v" style={faSmallStyle} />&nbsp;
                                                            <span className="badge badge-light text-secondary" style={badgeWeightStyle} >
                                                                Subtype&nbsp;is&nbsp;{upperCase(result.subType)}
                                                            </span>
                                                        </span>
                                                    {/* </div> */}
                                                    <Related related={result.relatedDetail} />
                                                    <Highlights highlights={result.highlights}/>
                                                </Col>
                                            </Row> 
                                        </div>
                                    ))}        
                                    {/* <Pagination
                                        totalRecords={this.state.data.numRowsTotal}
                                        pageLimit={this.state.data.rows}
                                        pageNeighbours={1}
                                        onPageChanged={this.searchPagination}
                                    /> */}
                                </div>
                            )}
                            
                            {/* Data not found and not loading */}
                            {!this.hasData() && !isLoading && (
                                <Row>
                                    <Col>
                                        <div className="mb-2">
                                            <span dangerouslySetInnerHTML={createMarkup("No results found for <mark>" + this.props.searchData + "</mark> when searching in " + titleCase(this.props.searchType.value))} />
                                        </div> 
                                    </Col>
                                </Row>
                            )}
                    </Fragment> 
                    {/* End Search Logic */}
                
                </ComponentModal>
        </div>
        )
  }
}

export default Search;
