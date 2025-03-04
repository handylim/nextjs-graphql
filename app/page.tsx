'use client';

import React, { useState }                                    from 'react';
import { ApolloProvider, ApolloError, useQuery, useMutation } from '@apollo/client';
import { Alert, Flex, List, Typography }                      from 'antd';
import { DeleteOutlined, EditOutlined }                       from '@ant-design/icons';
import { Nullable, Undefinable }                              from 'tsdef';
import Form                                                   from '@/components/Form';
import { client }                                             from '@/lib/apollo/client';
import { CREATE_DUTY, DUTIES, UPDATE_DUTY, DELETE_DUTY }      from '@/lib/apollo/duty';

export default function Home() {
	const queryResult                    = useQuery<{ duties: Array<Duty> }>(DUTIES, { client, fetchPolicy: 'no-cache' });
	const [createDuty, createDutyResult] = useMutation<Duty>(CREATE_DUTY, { client, fetchPolicy: 'no-cache', onCompleted: () => queryResult.refetch() });
	const [updateDuty, updateDutyResult] = useMutation<Duty>(UPDATE_DUTY, { client, fetchPolicy: 'no-cache', onCompleted: () => queryResult.refetch() });
	const [deleteDuty, deleteDutyResult] = useMutation<Duty>(DELETE_DUTY, { client, fetchPolicy: 'no-cache', onCompleted: () => queryResult.refetch() });

	const [state, setState] = useState({
		                                   editedIndex : null as Nullable<string>,
		                                   errorMessage: queryResult.error?.message as Undefinable<string>
	                                   });

	const _handleClearAlert = () => setState({
		                                         ...state,
		                                         errorMessage: undefined
	                                         });

	const _handleOnCreate = async (name: string) => {
		try {
			await createDuty({ variables: { name } });
		}
		catch (e) {
			if (e instanceof ApolloError)
				setState({
					         ...state,
					         errorMessage: e.message
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
		}
		catch (e) {
			if (e instanceof ApolloError)
				setState({
					         ...state,
					         errorMessage: e.message
				         });
		}
	};

	const _handleOnDelete = (id: string) => async (e: React.MouseEvent<HTMLSpanElement>) => {
		try {
			_handleClearAlert();
			await deleteDuty({ variables: { id } });
		}
		catch (e) {
			if (e instanceof ApolloError)
				setState({
					         ...state,
					         errorMessage: e.message
				         });
		}
	};

	const PAGE_SIZE = 5;
	const duties    = queryResult.data?.duties ?? [];
	// adding placeholder items to prevent layout shifts and maintain consistent list height across pagination states
	if (duties.length > 0 && duties.length % PAGE_SIZE > 0) {
		const placeholderCount          = PAGE_SIZE - (duties.length % PAGE_SIZE);
		const placeholders: Array<Duty> = Array(placeholderCount).fill(null)
		                                                         .map((_, index) =>
			                                                              ({
				                                                              id  : `empty-${index}`,
				                                                              name: 'emptyDuty'
			                                                              }));
		duties.push(...placeholders);
	}

	return (
		<ApolloProvider client={ client }>
			<Flex style={ { padding: '6rem', minHeight: '100vh' } }
			      vertical
			      gap='middle'
			      justify='center'
			      align='center'>

				{
					state.errorMessage &&
					<Alert message='Error'
					       description={ state.errorMessage }
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
				      dataSource={ duties }
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
					      else if (item.id.startsWith('empty-')) // for placeholder items to prevent layout shifts
							  return (
								  <List.Item key={ item.id }
								             style={ { visibility: 'hidden' } }>
									  { item.name }
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