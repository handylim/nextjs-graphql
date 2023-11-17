'use client';

import React, { useEffect, useState } from 'react';
import { Button, Form, Input }        from 'antd';

interface FormProps {
	initialValue?: { id: string, name: string }
	handleCancelEdit?: () => void
	isLoading: boolean
	handleClearAlert: () => void
}

interface CreateFormProps extends FormProps {
	handleSubmit: (name: string) => Promise<void>
}

interface UpdateFormProps extends FormProps {
	initialValue: { id: string, name: string }
	handleSubmit: (id: string, name: string) => Promise<void>
}

type FormItem = {
	id?: string
	name: string
};

const form: React.FC<CreateFormProps | UpdateFormProps> = props => {
	const [form] = Form.useForm<FormItem>();

	const [state, setState] = useState({ isError: false });
	const values            = Form.useWatch([], form);
	useEffect(() => {
		setTimeout(() => { // to prevent `Warning: An update to Form inside a test was not wrapped in act(...)` in `Form.test.tsx`
			form.validateFields({ validateOnly: true })
			    .then(() => setState({ isError: false }),
			          () => setState({ isError: true }));
		}, 0);
	}, [values]);

	const _handleCancelEditing = (e: React.MouseEvent<HTMLSpanElement>) => props.handleCancelEdit && props.handleCancelEdit();

	const _handleOnValuesChange = (changedValues: string, values: FormItem) => props.handleClearAlert();

	const _handleOnFinish       = async (value: FormItem) => {
		if (value.id) // update duty
			props.handleSubmit(value.id, value.name);
		else // create duty
			(props as CreateFormProps).handleSubmit(value.name);
		form.resetFields();
	};

	return (
		<Form form={ form }
		      layout='inline'
		      autoComplete='off'
		      style={ { width: '100%' } }
		      onValuesChange={ _handleOnValuesChange }
		      onFinish={ _handleOnFinish }>
			<Form.Item name='id' hidden initialValue={ props.initialValue?.id }>
				<Input type='hidden' />
			</Form.Item>

			<Form.Item name='name'
			           style={ { width: '100%' } }
			           initialValue={ props.initialValue?.name ?? '' }
			           rules={ [{ required: true, message: "Duty's name is required" }] }>
				<Input autoFocus
				       placeholder="Duty's name"
				       aria-placeholder="Duty's name"
				       suffix={
					       <>
						       <Button type='primary'
						               loading={ props.isLoading }
						               style={ props.initialValue ? {
							               background : '#faad14',
							               borderColor: '#faad14'
						               } : undefined }
						               disabled={ state.isError }
						               htmlType='submit'>
							       { props.initialValue ? 'Update' : 'Add Duty' }
						       </Button>
						       {
							       props.initialValue &&
							       <Button danger
							               type='primary'
							               loading={ props.isLoading }
							               onClick={ _handleCancelEditing }>
								       Cancel
							       </Button>
						       }
					       </>
				       } />
			</Form.Item>
		</Form>
	);
};

form.displayName = 'Form';

export default form;