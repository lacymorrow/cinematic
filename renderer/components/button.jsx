import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import strings from '../helpers/strings'

import BaseButton from './base-button'

const ButtonX = styled( BaseButton )`
	transition-property: color, background-color, outline, transform;
	display: inline-flex;
	flex-direction: row;
	jusify-content: space-between;
	align-items: center;

	${props => props.size && `
		font-size: ${props.size}px;
	`}

	/* A11y styles */
	&:hover{
	    color: ${props => props.theme.buttonHoverColor};
	    background-color: ${props => props.theme.buttonHoverBgColor};
	}

	&:focus {
	    outline: 1px solid ${props => props.theme.buttonFocusColor};
	    outline-offset: -4px;
	}

	&:active {
	    transform: scale(0.99);
	}
`

const Button = props => {

	const { children, data, handleChange } = props

	return (
		<ButtonX {...props} onClick={handleChange}>{children || data}</ButtonX>
	)

}

Button.propTypes = {
	children: PropTypes.node,
	data: PropTypes.string,
	handleChange: PropTypes.func
}

Button.defaultProps = {
	data: strings.button.init
}

export default Button
