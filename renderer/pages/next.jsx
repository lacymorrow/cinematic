import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

const Next = () => {

	return (
		<>
			<Head>
				<title>Next - Nextron (ipc-communication)</title>
			</Head>
			<div>
				<p>
					⚡ Electron + Next.js ⚡ -
					<Link href="/home">
						<a>Go to home page</a>
					</Link>
				</p>
			</div>
		</>
	)

}

export default Next
