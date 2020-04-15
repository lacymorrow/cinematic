import React, { useEffect } from 'react'
import NProgress from 'nprogress'
import PropTypes from 'prop-types'

import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  #nprogress {
    pointer-events: none;
  }
  #nprogress .bar {
    background: ${props => props.theme.progressColor};
    position: fixed;
    z-index: 1031;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
  }
  #nprogress .peg {
    display: block;
    position: absolute;
    right: 0px;
    width: 100px;
    height: 100%;
    box-shadow: 0 0 10px ${props => props.theme.progressColor}, 0 0 5px ${props => props.theme.progressColor};
    opacity: 1;
    -webkit-transform: rotate(3deg) translate(0px, -4px);
    -ms-transform: rotate(3deg) translate(0px, -4px);
    transform: rotate(3deg) translate(0px, -4px);
  }
  #nprogress .spinner {
    display: "block";
    position: fixed;
    z-index: 1031;
    top: 15px;
    right: 15px;
  }
  #nprogress .spinner-icon {
    width: 18px;
    height: 18px;
    box-sizing: border-box;
    border: solid 2px transparent;
    border-top-color: ${props => props.theme.progressColor};
    border-left-color: ${props => props.theme.progressColor};
    border-radius: 50%;
    -webkit-animation: nprogresss-spinner 400ms linear infinite;
    animation: nprogress-spinner 400ms linear infinite;
  }
  .nprogress-custom-parent {
    overflow: hidden;
    position: relative;
  }
  .nprogress-custom-parent #nprogress .spinner,
  .nprogress-custom-parent #nprogress .bar {
    position: absolute;
  }
  @-webkit-keyframes nprogress-spinner {
    0% {
      -webkit-transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
    }
  }
  @keyframes nprogress-spinner {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`

const Progress = props => {

	const { data } = props

	// Setup and tear-down communication
	useEffect( () => {

		// Depends on [], so never re-run
		// componentDidMount()
		NProgress.configure( {
			easing: 'ease-in',
			minimum: 0.01,
			speed: 200
		} )

		return () => {

			// ComponentWillUnmount()
			// Unregister things
			NProgress.done()

		}

	}, [] )

	useEffect( () => {

		if ( data === 0 || data === 1 ) {

			NProgress.done()

		} else if ( data <= 0.01 ) {

			NProgress.set( data )

		} else {

			NProgress.set( data )
			NProgress.start()

		}

	}, [ data ] )

	return (
		<GlobalStyle {...props}/>
	)

}

Progress.propTypes = {
	data: PropTypes.number
}

Progress.defaultProps = {
	data: 0
}

export default Progress
