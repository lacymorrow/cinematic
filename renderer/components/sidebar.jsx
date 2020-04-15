import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { FiRotateCw as RefreshIcon } from 'react-icons/fi'

import strings from '../helpers/strings'

import Button from './sidebar-button'
import IconButton from './icon-button'

const WrapperX = styled.div`
	flex: 0 0 280px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: stretch;

	overflow: auto;
	transition-timing-function: ease-out;
	transition-property: color, background-color;
	color: ${props => props.theme.sidebarColor};
	background-color: ${props => props.theme.sidebarBgColor};
	padding-bottom: 100px;
	box-shadow: 0 5px 10px rgba(0,0,0,0.19), 0 3px 3px rgba(0,0,0,0.23);
`

const BottomWrapperX = styled.div``

const ListX = styled.ul`
	list-style: none;
	padding: 0;
	margin: 0;
`

const ItemX = styled.li``

const LabelX = styled.p`
	font-weight: 700;
	width: 100%;
	padding: 0 2rem;
`

const BadgeX = styled.span`
	transition-timing-function: ease-out;
	transition-property: color, background-color;
	background-color: ${props => props.theme.highlightColor};
	color: ${props => props.theme.sidebarBgColor};


	vertical-align: middle;
	white-space: nowrap;
	text-align: center;
	border-radius: 20px;
	padding: .2rem .5rem;
`

const Sidebar = props => {

	const { data, handleChange, handleRefresh, current, movieCount } = props

	return (
		<WrapperX>
			<ListX>
				<ItemX>
					<LabelX>{strings.sidebar.label} {movieCount > 1 && ( <BadgeX>{movieCount}</BadgeX> )}</LabelX>
				</ItemX>

				<ItemX>
					<Button active={current === 'movies'} data-active={current === 'movies'} handleChange={() => handleChange( 'movies' )}>{strings.sidebar.main}</Button>
				</ItemX>

				<ItemX>
					<LabelX>Genres</LabelX>
				</ItemX>

				{data && data.map( genre => {

					if ( genre.items.length > 0 ) {

						return (
							<ItemX key={genre._id}>
								<Button active={current === genre._id} data-id={genre._id} handleChange={e => handleChange( e.currentTarget.dataset.id )}>
									{genre.name}
									{/* <BadgeX>{genre.items.length}</BadgeX> */}
								</Button>
							</ItemX>
						)

					}

					return false

				} )}
			</ListX>

			{/* <BottomWrapperX>
				<IconButton icon={<RefreshIcon size={16}/> } handleChange={handleRefresh}>
					Reset
				</IconButton>
			</BottomWrapperX> */}
		</WrapperX>
	)

}

Sidebar.propTypes = {
	current: PropTypes.string,
	data: PropTypes.array,
	handleChange: PropTypes.func,
	handleRefresh: PropTypes.func,
	movieCount: PropTypes.number
}

Sidebar.defaultProps = {
	data: []
}

export default Sidebar
