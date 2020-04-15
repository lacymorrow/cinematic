import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import Button from './button'

const WrapperX = styled.div`
	display: inline-block;
	margin-right: 1rem;
	flex: 1 1 180px;
	height: 40px;
	transition-property: color, background-color;
	color: ${props => props.theme.buttonColor};
	background-color: ${props => props.theme.buttonBgColor};

	position: relative;
`

const ButtonX = styled( Button )`
	padding: .5rem .5rem .5rem 2.5rem;
	height: 100%;
	color: ${props => props.theme.onPrimaryColor};
	background-color: ${props => props.theme.primaryColor};
`

const IconX = styled.div`
	position: absolute;
	top: 0;
	bottom: 0;
	left: .5rem;

	display: flex;
	align-items: center;
	flex-direction: row;
`

const FileInput = props => {

	const { data, children, handleChange, icon } = props

	return (
		<WrapperX>
			<ButtonX handleChange={handleChange} {...props}>
				{icon && <IconX>{icon}</IconX>}
				{children || data}
			</ButtonX>
		</WrapperX>
	)

}

FileInput.propTypes = {
	children: PropTypes.node,
	data: PropTypes.string,
	handleChange: PropTypes.func,
	icon: PropTypes.node
}

FileInput.defaultProps = {
	data: ''
}

export default FileInput
