import React                     from 'react';
import type { Metadata }         from 'next';
import { Inter }                 from 'next/font/google';
import { ConfigProvider, theme } from 'antd';
import StyledComponentsRegistry  from '@/lib/antd/AntdRegistry';
import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title      : 'CRUD Duties App',
	description: 'Web app to create, read, update, and delete duties'
};

export default function RootLayout(props: React.PropsWithChildren) {
	return (
		<html lang='en'>
			<body className={ inter.className }>
				<ConfigProvider theme={ { algorithm: theme.darkAlgorithm } }>
					<StyledComponentsRegistry>
						{ props.children }
					</StyledComponentsRegistry>
				</ConfigProvider>
			</body>
		</html>
	);
};
