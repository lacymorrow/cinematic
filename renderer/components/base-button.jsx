import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const ButtonX = styled.button`
	/* Button reset: https://gist.github.com/MoOx/9137295 */
	border: none;
    margin: 0;
    padding: 0;
    width: auto;
    overflow: visible;
    cursor: pointer;

    /* inherit font & color from ancestor */
    font: inherit;
    color: inherit;
    background-color: inherit;

    /* Normalize 'line-height'. Cannot be changed from 'normal' in Firefox 4+. */
    line-height: normal;
`

const BaseButton = props => {

	const { children, data, handleChange } = props

	return (
		<ButtonX {...props} onClick={handleChange}>{children || data}</ButtonX>
	)

}

BaseButton.propTypes = {
	children: PropTypes.node,
	data: PropTypes.string,
	handleChange: PropTypes.func
}

export default BaseButton
