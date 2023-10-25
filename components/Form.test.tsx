import Form                        from '@/components/Form';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent }               from '@testing-library/user-event';
import { faker }                   from '@faker-js/faker';

const handleCancelEditMocked = jest.fn();
const handleClearAlertMocked = jest.fn();
const handleSubmitMocked     = jest.fn();

describe('Form component', () => {
	beforeAll(() => {
		Object.defineProperty(window, "matchMedia", {
			writable: true,
			value   : jest.fn().mockImplementation(query => ({
				matches            : false,
				media              : query,
				onchange           : null,
				addListener        : jest.fn(), // Deprecated
				removeListener     : jest.fn(), // Deprecated
				addEventListener   : jest.fn(),
				removeEventListener: jest.fn(),
				dispatchEvent      : jest.fn(),
			}))
		});
	});

	afterEach(() => jest.clearAllMocks());

	describe('on create new duty', () => {
		it('initialize the form with empty value', () => {
			render(<Form isLoading={ false }
			             handleClearAlert={ handleClearAlertMocked }
			             handleSubmit={ handleSubmitMocked } />);

			const nameInput = screen.queryByPlaceholderText("Duty's name");

			expect(nameInput).toBeInTheDocument();
			expect(nameInput?.getAttribute('value')).toBe('');

			expect(handleClearAlertMocked).not.toBeCalled();
			expect(handleSubmitMocked).not.toBeCalled();
		});

		it('initialize the form with `Add Duty` button', () => {
			render(<Form isLoading={ false }
			             handleClearAlert={ handleClearAlertMocked }
			             handleSubmit={ handleSubmitMocked } />);

			const addDutyButton = screen.queryByRole('button', { name: 'Add Duty' });
			const updateButton  = screen.queryByRole('button', { name: 'Update' });
			const cancelButton  = screen.queryByRole('button', { name: 'Cancel' });

			expect(addDutyButton).toBeInTheDocument();
			expect(updateButton).not.toBeInTheDocument();
			expect(cancelButton).not.toBeInTheDocument();

			expect(handleClearAlertMocked).not.toBeCalled();
			expect(handleSubmitMocked).not.toBeCalled();
		});

		it('should show errors on empty values', async () => {
			const user = userEvent.setup();

			render(<Form isLoading={ false }
			             handleClearAlert={ handleClearAlertMocked }
			             handleSubmit={ handleSubmitMocked } />);

			const nameInput = screen.getByPlaceholderText("Duty's name") as HTMLInputElement;
			const dutyName  = faker.person.jobDescriptor();
			await user.type(nameInput, dutyName);

			await user.keyboard(`{Backspace>${dutyName.length}/}`);

			await waitFor(() => expect(screen.queryByText("Duty's name is required")).not.toBeNull());
		});

		it('should disable `Add Duty` button on error empty values', async () => {
			const user = userEvent.setup();

			render(<Form isLoading={ false }
			             handleClearAlert={ handleClearAlertMocked }
			             handleSubmit={ handleSubmitMocked } />);

			const nameInput = screen.getByPlaceholderText("Duty's name") as HTMLInputElement;
			const dutyName  = faker.person.jobDescriptor();
			await user.type(nameInput, dutyName);
			await user.keyboard(`{Backspace>${dutyName.length}/}`);

			const addDutyButton = screen.getByRole('button', { name: 'Add Duty' });
			expect(addDutyButton).toHaveAttribute('disabled');
		});

		it('should clear form error after user type in some values', async () => {
			const user = userEvent.setup();

			render(<Form isLoading={ false }
			             handleClearAlert={ handleClearAlertMocked }
			             handleSubmit={ handleSubmitMocked } />);

			const nameInput = screen.getByPlaceholderText("Duty's name") as HTMLInputElement;
			const dutyName  = faker.person.jobDescriptor();
			await user.type(nameInput, dutyName);
			await user.keyboard(`{Backspace>${dutyName.length}/}`);
			await user.type(nameInput, faker.string.alpha({ length: 1 }));

			expect(screen.queryByText("Duty's name is required")).not.toBeNull();
		});

		it('should enable back `Add Duty` button after user type in some values', async () => {
			const user = userEvent.setup();

			render(<Form isLoading={ false }
			             handleClearAlert={ handleClearAlertMocked }
			             handleSubmit={ handleSubmitMocked } />);

			const nameInput = screen.getByPlaceholderText("Duty's name") as HTMLInputElement;
			const dutyName  = faker.person.jobDescriptor();
			await user.type(nameInput, dutyName);
			await user.keyboard(`{Backspace>${dutyName.length}/}`);
			await user.type(nameInput, faker.string.alpha({ length: 1 }));

			const addDutyButton = screen.getByRole('button', { name: 'Add Duty' });
			expect(addDutyButton).not.toHaveAttribute('disabled');
		});

		it('should clear alert after user type in some values', async () => {
			const user = userEvent.setup();

			render(<Form isLoading={ false }
			             handleClearAlert={ handleClearAlertMocked }
			             handleSubmit={ handleSubmitMocked } />);

			await user.type(screen.getByPlaceholderText("Duty's name"), faker.string.alpha({ length: 1 }));

			expect(handleClearAlertMocked).toBeCalledTimes(1);
		});

		it('submits form with newly created value', async () => {
			const user = userEvent.setup();

			render(<Form isLoading={ false }
			             handleClearAlert={ handleClearAlertMocked }
			             handleSubmit={ handleSubmitMocked } />);

			const dutyName = faker.person.jobDescriptor();
			await user.type(screen.getByPlaceholderText("Duty's name"), dutyName);
			await user.click(screen.getByRole('button', { name: 'Add Duty' }));

			expect(handleSubmitMocked).toBeCalledTimes(1);
			expect(handleSubmitMocked).toBeCalledWith(dutyName);
		});
	});

	describe('on updating a duty', () => {
		it('initialize the form with initial value', () => {
			const initialValue = {
				id  : faker.string.uuid(),
				name: faker.person.jobDescriptor()
			};

			render(<Form isLoading={ false }
			             initialValue={ initialValue }
			             handleCancelEdit={ handleCancelEditMocked }
			             handleClearAlert={ handleClearAlertMocked }
			             handleSubmit={ handleSubmitMocked } />);

			const nameInput = screen.queryByPlaceholderText("Duty's name");

			expect(nameInput).toBeInTheDocument();
			expect(nameInput?.getAttribute('value')).toBe(initialValue.name);

			expect(handleCancelEditMocked).not.toBeCalled();
			expect(handleClearAlertMocked).not.toBeCalled();
			expect(handleSubmitMocked).not.toBeCalled();
		});

		it('initialize the form with `Update` button', () => {
			const initialValue = {
				id  : faker.string.uuid(),
				name: faker.person.jobDescriptor()
			};

			render(<Form isLoading={ false }
			             initialValue={ initialValue }
			             handleCancelEdit={ handleCancelEditMocked }
			             handleClearAlert={ handleClearAlertMocked }
			             handleSubmit={ handleSubmitMocked } />);

			const addDutyButton = screen.queryByRole('button', { name: 'Add Duty' })
			const updateButton  = screen.queryByRole('button', { name: 'Update' });
			const cancelButton  = screen.queryByRole('button', { name: 'Cancel' });

			expect(addDutyButton).not.toBeInTheDocument();
			expect(updateButton).toBeInTheDocument();
			expect(cancelButton).toBeInTheDocument();

			expect(handleCancelEditMocked).not.toBeCalled();
			expect(handleClearAlertMocked).not.toBeCalled();
			expect(handleSubmitMocked).not.toBeCalled();
		});

		it('can cancel edit', async () => {
			const user         = userEvent.setup();
			const initialValue = {
				id  : faker.string.uuid(),
				name: faker.person.jobDescriptor()
			};

			render(<Form isLoading={ false }
			             initialValue={ initialValue }
			             handleCancelEdit={ handleCancelEditMocked }
			             handleClearAlert={ handleClearAlertMocked }
			             handleSubmit={ handleSubmitMocked } />);

			await user.click(screen.getByRole('button', { name: 'Cancel' }));

			expect(handleCancelEditMocked).toBeCalledTimes(1);
			expect(handleClearAlertMocked).not.toBeCalled();
			expect(handleSubmitMocked).not.toBeCalled();
		});

		it('should show errors on empty values', async () => {
			const user         = userEvent.setup();
			const initialValue = {
				id  : faker.string.uuid(),
				name: faker.person.jobDescriptor()
			};

			render(<Form isLoading={ false }
			             initialValue={ initialValue }
			             handleCancelEdit={ handleCancelEditMocked }
			             handleClearAlert={ handleClearAlertMocked }
			             handleSubmit={ handleSubmitMocked } />);

			await user.keyboard(`{Backspace>${initialValue.name.length}/}`);

			await waitFor(() => expect(screen.queryByText("Duty's name is required")).not.toBeNull());
		});

		it('should disable `Update` button on error empty values', async () => {
			const user         = userEvent.setup();
			const initialValue = {
				id  : faker.string.uuid(),
				name: faker.person.jobDescriptor()
			};

			render(<Form isLoading={ false }
			             initialValue={ initialValue }
			             handleCancelEdit={ handleCancelEditMocked }
			             handleClearAlert={ handleClearAlertMocked }
			             handleSubmit={ handleSubmitMocked } />);

			await user.keyboard(`{Backspace>${initialValue.name.length}/}`);

			const updateDutyButton = screen.getByRole('button', { name: 'Update' });
			expect(updateDutyButton).toHaveAttribute('disabled');
		});

		it('should enable `Cancel` button on error empty values', async () => {
			const user         = userEvent.setup();
			const initialValue = {
				id  : faker.string.uuid(),
				name: faker.person.jobDescriptor()
			};

			render(<Form isLoading={ false }
			             initialValue={ initialValue }
			             handleCancelEdit={ handleCancelEditMocked }
			             handleClearAlert={ handleClearAlertMocked }
			             handleSubmit={ handleSubmitMocked } />);

			await user.keyboard(`{Backspace>${initialValue.name.length}/}`);

			const cancelDutyButton = screen.getByRole('button', { name: 'Cancel' });
			expect(cancelDutyButton).not.toHaveAttribute('disabled');
		});

		it('should clear form error after user type in some values', async () => {
			const user         = userEvent.setup();
			const initialValue = {
				id  : faker.string.uuid(),
				name: faker.person.jobDescriptor()
			};

			render(<Form isLoading={ false }
			             initialValue={ initialValue }
			             handleCancelEdit={ handleCancelEditMocked }
			             handleClearAlert={ handleClearAlertMocked }
			             handleSubmit={ handleSubmitMocked } />);

			const nameInput = screen.getByPlaceholderText("Duty's name") as HTMLInputElement;
			await user.keyboard(`{Backspace>${initialValue.name.length}/}`);
			await user.type(nameInput, faker.string.alpha({ length: 1 }));

			expect(screen.queryByText("Duty's name is required")).not.toBeNull();
		});

		it('should enable back `Update` button after user type in some values', async () => {
			const user         = userEvent.setup();
			const initialValue = {
				id  : faker.string.uuid(),
				name: faker.person.jobDescriptor()
			};

			render(<Form isLoading={ false }
			             initialValue={ initialValue }
			             handleCancelEdit={ handleCancelEditMocked }
			             handleClearAlert={ handleClearAlertMocked }
			             handleSubmit={ handleSubmitMocked } />);

			const nameInput = screen.getByPlaceholderText("Duty's name") as HTMLInputElement;
			await user.keyboard(`{Backspace>${initialValue.name.length}/}`);
			await user.type(nameInput, faker.string.alpha({ length: 1 }));

			const updateDutyButton = screen.getByRole('button', { name: 'Update' });
			expect(updateDutyButton).not.toHaveAttribute('disabled');
		});

		it('should clear alert after user type in some values', async () => {
			const user         = userEvent.setup();
			const initialValue = {
				id  : faker.string.uuid(),
				name: faker.person.jobDescriptor()
			};

			render(<Form isLoading={ false }
			             initialValue={ initialValue }
			             handleCancelEdit={ handleCancelEditMocked }
			             handleClearAlert={ handleClearAlertMocked }
			             handleSubmit={ handleSubmitMocked } />);

			await user.type(screen.getByPlaceholderText("Duty's name"), faker.string.alpha({ length: 1 }));

			expect(handleClearAlertMocked).toBeCalledTimes(1);
		});

		it('submits form with updated value', async () => {
			const user         = userEvent.setup();
			const initialValue = {
				id  : faker.string.uuid(),
				name: faker.person.jobDescriptor()
			};

			render(<Form isLoading={ false }
			             initialValue={ initialValue }
			             handleCancelEdit={ handleCancelEditMocked }
			             handleClearAlert={ handleClearAlertMocked }
			             handleSubmit={ handleSubmitMocked } />);

			const nameInput = screen.getByPlaceholderText("Duty's name") as HTMLInputElement;
			await user.keyboard(`{Backspace>${initialValue.name.length}/}`);
			const newName = faker.person.jobDescriptor();
			await user.type(nameInput, newName);
			await user.click(screen.getByRole('button', { name: 'Update' }));

			expect(handleSubmitMocked).toBeCalledTimes(1);
			expect(handleSubmitMocked).toBeCalledWith(initialValue.id, newName);
		});
	});
});