import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import strings from '../helpers/strings'

const TitleX = styled.h1`
	flex: 0 0 280px;
	transition-property: color;
	color: ${props => props.theme.titleColor};
	// text-align: center;
	padding: 0 1rem;
`

const Logo = props => {

	const { data } = props

	return (
		<TitleX {...props}>
			{data}
		</TitleX>
	)

}

Logo.propTypes = {
	data: PropTypes.string
}

Logo.defaultProps = {
	data: strings.app.title
}

export default Logo
