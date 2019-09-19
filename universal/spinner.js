import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import 'css/spinner.css'

const id = 'chglk-spinner-overlay-wrpr'

const Spinner = ({ overlay, showSpinner }) => {
  // Set default values
  if (overlay === undefined)
    overlay = true

  const mainClass = overlay ? "spinner-overlay" : "spinner-main"
  return (
    showSpinner !== undefined && showSpinner
      ? (
        <div className={mainClass}>
          <div className="spinner-center">
            <div className="sc-cube-grid">
              <div className="sc-cube sc-cube1"></div>
              <div className="sc-cube sc-cube2"></div>
              <div className="sc-cube sc-cube3"></div>
              <div className="sc-cube sc-cube4"></div>
              <div className="sc-cube sc-cube5"></div>
              <div className="sc-cube sc-cube6"></div>
              <div className="sc-cube sc-cube7"></div>
              <div className="sc-cube sc-cube8"></div>
              <div className="sc-cube sc-cube9"></div>
            </div>
          </div>
        </div>
      ) : <div></div>
  )
}

export function showOverlaySpinner() { 
  let divTarget = document.getElementById(id)
  if (divTarget) {
    render(<Spinner showSpinner />, divTarget)
  } else {
    divTarget = document.createElement('div')
    divTarget.id = id
    document.body.appendChild(divTarget)
    render(<Spinner showSpinner />, divTarget)
  }
}

export function hideOverlaySpinner() {
  const target = document.getElementById(id)
  unmountComponentAtNode(target)
  target.parentNode.removeChild(target)
}

export default Spinner