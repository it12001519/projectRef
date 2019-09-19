import React from 'react';

class SummaryDetails extends React.Component {

  render() {
    return (
      <div className={this.props.className}>
        {
          this.props.compact
            ? (
              <h6>
                {
                  this.props.data.map((field, i) => {
                    let value = field.value !== '' ? field.value : '-'
                    return (
                      <span key={`sumdtl-fld-${i}`} title={field.label}>
                        {
                          i > 0
                            ? (` | ${value}`)
                            : (`${value}`)
                        }
                      </span>
                    )
                  })
                }
              </h6>
            )
            : (
              this.props.data.map((field, j) => {
                return (
                  <div key={`sumdtl-fld-${j}`}>
                    <strong>{field.label}</strong>{' : '}
                    <span>{field.value}</span>
                  </div>
                )
              })
            )
        }
      </div>
    )
  }

}

export default SummaryDetails
