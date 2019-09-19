import React, {Component} from 'react';
import ReactiveTable, { ReactiveTableStore, }  from 'reactive-tables';
import FetchUtilities from 'js/universal/FetchUtilities';
import {Button, ButtonGroup, Modal, ModalHeader, ModalBody, Row, Col, Input, Alert, FormText, Label, Form, ModalFooter } from 'reactstrap';
import { GridTextCell, GridCheckboxCell, GridActionButton, GridActionCell } from 'js/universal/GridCells';

class DeviceHistory extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            changeNumber : this.props.changeNumber,
            columns : [
                {
                    key: 'timestamp',
                    label: 'DTTM'
                },{
                    key: 'material',
                    label: 'Device'
                },{
                    key: 'enteredBy',
                    label: 'Name'
                },{
                    key: 'changeDescription',
                    label: 'Description'
                },{
                    key: 'characteristics',
                    label: 'Comment'
                }
            ],
            deviceHistoryVisible: false
        }
    }

    toggleDeviceHistory = () => {
        this.setState({deviceHistoryVisible : !this.state.deviceHistoryVisible})
    }

    render(){
        let url = `/api/v1/device-history/${this.state.changeNumber}`;
        return(
            <div style={{'display':'inline-block'}}>
                <Modal
                    isOpen={this.state.deviceHistoryVisible}
                    fade={true}
                    backdrop={true}
                    size={"lg"} 
                    style={{'maxWidth':'95%'}}>
                    <ModalHeader toggle={this.toggleForm}>Device History</ModalHeader>
                    <ModalBody>
                    {this.props.changeNumber !== undefined || this.props.changeNumber !== null ? 
                        <ReactiveTable server
                        credentials={'include'}
                        fetchPostHandler={FetchUtilities.checkStatusWithSecurity}
                        fetchErrorHandler={FetchUtilities.handleError}
                        striped columnFilters advancedColumns
                        columns={this.state.columns}
                        ref={(table) => this.table = table}
                        row={DeviceHistoryRow}
                        url={url} /> :
                        <span></span>
                    }
                    </ModalBody>
                    <ModalFooter>
                        <Button color="default" onClick={this.toggleDeviceHistory}>Close</Button>
                    </ModalFooter>
                </Modal>
                <Button onClick={this.toggleDeviceHistory}>Device History</Button>
            </div>
        )
    }
}

class DeviceHistoryRow extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            data : this.props.data
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: this.props.data
        }, () => {
            this.refresh();
        });
    }

    refresh = () => {
        this.setState({data: this.props.data});
    }

    render(){
        const record = this.props.data;
        const cells = this.props.columns.map((column) => {
            const key = 'column-' + column.key;
            if (column.key === 'timestamp') {
                // let doc = new DOMParser().parseFromString(record[column.key], "text/xml");
                let date = record[column.key].indexOf("</span>") !== -1 ? record[column.key].split("</span>").pop() : record[column.key];
                return <GridTextCell key={key}>{date}</GridTextCell>
            } else {
                return <GridTextCell key={key}>{record[column.key]}</GridTextCell>
            }
        })
        return(
            <tr key={`${record.id}-${record.material}`}>
                {cells}
            </tr>
        );
    }
}

export default DeviceHistory