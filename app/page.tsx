'use client';

import React, { useState }               from 'react';
import {
	ApolloClient,
	ApolloProvider,
	ApolloError,
	InMemoryCache,
	NormalizedCacheObject,
	gql,
	useQuery,
	useMutation
}                                        from "@apollo/client";
import { Alert, Flex, List, Typography } from 'antd';
import { DeleteOutlined, EditOutlined }  from '@ant-design/icons';
import Form                              from '@/components/Form';
import { Nullable, Undefinable }         from 'tsdef';
import { v4 as uuidv4 }                  from 'uuid';

const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({ cache: new InMemoryCache(), uri: '/api/graphql' });
const dutyQuery          = gql`query Duties {
	duties { id name }
}`;
const createDutyMutation = gql`mutation Duty($id: String!, $name: String!) {
	createDuty(id: $id, name: $name) { id name }
}`;
const updateDutyMutation = gql`mutation Duty($id: String!, $name: String!) {
	updateDuty(id: $id, name: $name) { id name }
}`;
const deleteDutyMutation = gql`mutation Duty($id: String!) {
	deleteDuty(id: $id) { id name }
}`;

export default function Home() {
	const queryResult = useQuery<{ duties: Array<Duty> }>(dutyQuery, { client, fetchPolicy: 'no-cache' });
	const [createDuty, createDutyResult] = useMutation<Duty>(createDutyMutation, { client, fetchPolicy: 'no-cache' });
	const [updateDuty, updateDutyResult] = useMutation<Duty>(updateDutyMutation, { client, fetchPolicy: 'no-cache' });
	const [deleteDuty, deleteDutyResult] = useMutation<Duty>(deleteDutyMutation, { client, fetchPolicy: 'no-cache' });

	const [state, setState] = useState({
		                                   editedIndex: null as Nullable<string>,
		                                   apolloError: queryResult.error as Undefinable<ApolloError>
	                                   });

	const _handleClearAlert = () => setState({
		                                         ...state,
		                                         apolloError: undefined
	                                         });

	const _handleOnCreate = async (name: string) => {
		try {
			const id = uuidv4();
			await createDuty({ variables: { id, name } });
			queryResult.refetch();
		}
		catch (e) {
			if (e instanceof ApolloError)
				setState({
					         ...state,
					         apolloError: e
				         });
		}
	};

	const _handleOnEdit = (id: string) => (e: React.MouseEvent<HTMLSpanElement>) => setState({
		                                                                                         ...state,
		                                                                                         editedIndex: id
	                                                                                         });

	const _handleCancelEdit = () => setState({
		                                         ...state,
		                                         editedIndex: null
	                                         });

	const _handleOnUpdate = async (id: string, name: string) => {
		try {
			await updateDuty({ variables: { id, name }});
			_handleCancelEdit();
			queryResult.refetch();
		}
		catch (e) {
			if (e instanceof ApolloError)
				setState({
					         ...state,
					         apolloError: e
				         });
		}
	};

	const _handleOnDelete = (id: string) => async (e: React.MouseEvent<HTMLSpanElement>) => {
		try {
			_handleClearAlert();
			await deleteDuty({ variables: { id } });
			queryResult.refetch();
		}
		catch (e) {
			if (e instanceof ApolloError)
				setState({
					         ...state,
					         apolloError: e
				         });
		}
	};

	const PAGE_SIZE = 5;
	return (
		<ApolloProvider client={ client }>
			<Flex style={ { padding: '6rem', minHeight: '100vh' } }
			      vertical
			      gap='middle'
			      justify='center'
			      align='center'>

				{
					state.apolloError &&
					<Alert message='Error'
					       description={ `${state.apolloError.name}: ${state.apolloError.message}` }
					       style={ { width: 750 } }
					       type='error'
					       showIcon />
				}

				<List style={ { width: 750 } }
				      header={ <Typography.Title level={ 3 } style={ { margin: 0 } }>Duty</Typography.Title> }
				      footer={ state.editedIndex ?
				               undefined :
				               <Form isLoading={ createDutyResult.loading } // create duty form
				                     handleClearAlert={ _handleClearAlert }
				                     handleSubmit={ _handleOnCreate } /> }
				      loading={ queryResult.loading || deleteDutyResult.loading }
				      bordered
				      size='large'
				      pagination={ queryResult.data?.duties.length ?? 0 > PAGE_SIZE ? { pageSize: PAGE_SIZE } : false }
				      dataSource={ queryResult.data?.duties ?? [] }
				      renderItem={ item => {
					      if (item.id === state.editedIndex) // editing mode
						      return (
							      <List.Item key={ item.id }>
								      <Form initialValue={ { id: item.id, name: item.name } }
								            isLoading={ updateDutyResult.loading }
								            handleCancelEdit={ _handleCancelEdit }
								            handleClearAlert={ _handleClearAlert }
								            handleSubmit={ _handleOnUpdate } />
							      </List.Item>
						      );
					      else
						      return (
							      <List.Item key={ item.id }
							                 actions={ [<EditOutlined style={ { color: '#faad14', fontSize : '1.25em' } }
							                                          onClick={ _handleOnEdit(item.id) } />,
							                            <DeleteOutlined style={ { color: '#f5222d', fontSize : '1.25em' } }
							                                            onClick={ _handleOnDelete(item.id) } />] }>
								      { item.name }
							      </List.Item>
						      );
					  }
				} />
			</Flex>
		</ApolloProvider>
	);
};