import { gql } from '@apollo/client';

export const DUTIES = gql`
	query Duties {
		duties { id name }
	}
`;

export const CREATE_DUTY = gql`
	mutation Duty($name: String!) {
		createDuty(name: $name) { id name }
	}
`;

export const UPDATE_DUTY = gql`
	mutation Duty($id: String!, $name: String!) {
		updateDuty(id: $id, name: $name) { id name }
	}
`;

export const DELETE_DUTY = gql`
	mutation Duty($id: String!) {
		deleteDuty(id: $id) { id name }
	}
`;