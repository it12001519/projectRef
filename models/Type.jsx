import React from 'react';
import TypeSearch from '../components/TypeSearch';

class Type extends React.Component {
    constructor() {
        super();
    }

    render () {
        const types = this.props.state.types;
        const optionItems = types.map((type) =>
                <option key={type.name}>{type.name}</option>
            );

        return (
         <div>
             <select>
                {optionItems}
                </select>
         </div>
        )
    }
}

export default Type;