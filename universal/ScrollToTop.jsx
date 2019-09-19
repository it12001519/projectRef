import React from 'react'
import styled from 'styled-components'

const ScrollToTop = ({ className }) => {

  const scrollUp = () => {
    let doc = document.documentElement
    let top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0)

    if (top > 0) {
      window.scrollTo(0, top - 25)
      setTimeout(scrollUp, 10)
    }
  }

  return (
    <div className={className} style={{ right: '30px' }}>
      <span className="fa-stack fa-2x text-dark" title="Scroll to Top" onClick={scrollUp}>
        <i className="fa fa-circle fa-stack-2x"></i>
        <i className="fa fa-arrow-up fa-stack-1x fa-inverse"></i>
      </span>
    </div>
  )
}

export default styled(ScrollToTop) `
position: fixed;
bottom: 20px;
cursor: pointer;
z-index: 999;
`
