import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import strings from '../helpers/strings'

// TODO styles
const WrapperX = styled.div`
	background-color: ${props => props.theme.primaryColor};
	color: ${props => props.theme.onPrimaryColor};
	position: absolute;
	bottom: 0;
	max-width: 30%;

	font-size: 9px;
	border-top-right-radius: 5px;
	box-shadow: 0 5px 10px rgba(0,0,0,0.19), 0 3px 3px rgba(0,0,0,0.23);

	p {
		padding: 0 .5rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
`
const Messagebox = props => {

	const { data } = props

	return (
		<WrapperX>
			<p>{data}</p>
		</WrapperX>
	)

}

Messagebox.propTypes = {
	data: PropTypes.string
}

Messagebox.defaultProps = {
	data: strings.messagebox.init
}

export default Messagebox
