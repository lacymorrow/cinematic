import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import Button from './button'

const ButtonX = styled( Button )`
	// COLOR
	transition-property: color, background-color, border-right, transform;
	// color: ${props => props.theme.buttonColor};
	// background-color: ${props => props.theme.buttonBgColor};

	// FONT
	text-align: left;

	// SIZE
	width: 100%;
	padding: 1rem 2rem 1rem 3rem;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;

	${props => props.active && `
		background-color: ${props.theme.buttonActiveBgColor};
		color: ${props.theme.buttonActiveColor};
		border-right: 4px solid ${props.theme.highlightSecondaryColor};
		box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.5);
	`}

	&:focus {

	}

	&:active {
	    transform: scale(0.99);
	}

`

const SidebarButton = props => {

	const { children, data, handleChange } = props

	return (
		<ButtonX {...props} onClick={handleChange}>{children || data || '...'}</ButtonX>
	)

}

SidebarButton.propTypes = {
	children: PropTypes.node,
	data: PropTypes.string,
	handleChange: PropTypes.func
}

export default SidebarButton
