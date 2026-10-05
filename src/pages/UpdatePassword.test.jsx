import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import UpdatePassword from './UpdatePassword'

const mocks = vi.hoisted(() => ({ auth: { user: { id: 'user-1' }, loading: false }, updateUser: vi.fn() }))
vi.mock('../auth/AuthContext', () => ({ useAuth: () => mocks.auth }))
vi.mock('../lib/supabase', () => ({ supabase: { auth: { updateUser: mocks.updateUser } } }))
vi.mock('../components/PageShell', () => ({ default: ({ children }) => <main>{children}</main> }))

function openForm() {
  return render(<MemoryRouter><UpdatePassword /></MemoryRouter>)
}
function enterPasswords(first, second) {
  fireEvent.change(screen.getByLabelText('New password'), { target: { value: first } })
  fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: second } })
  fireEvent.click(screen.getByRole('button', { name: 'Update password' }))
}

describe('password recovery completion', () => {
  beforeEach(() => {
    mocks.auth = { user: { id: 'user-1' }, loading: false }
    mocks.updateUser.mockReset()
  })
  it('locks pending updates and preserves passwords after a failed request', async () => {
    let finish
    mocks.updateUser.mockReturnValue(new Promise((resolve) => { finish = resolve }))
    openForm()
    enterPasswords('test-password-one', 'test-password-one')
    fireEvent.click(screen.getByText('Updating…'))
    expect(mocks.updateUser).toHaveBeenCalledTimes(1)
    expect(screen.getByLabelText('New password')).toBeDisabled()
    await act(async () => { finish({ error: new Error('Connection lost') }) })
    expect(screen.getByLabelText('New password')).toHaveValue('test-password-one')
    expect(screen.getByText('Update password')).toBeEnabled()
    mocks.updateUser.mockResolvedValue({ error: null })
    fireEvent.click(screen.getByText('Update password'))
    expect(await screen.findByRole('status')).toHaveTextContent('Password updated')
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument()
  })
  it('clears password drafts when account identity changes and ignores the previous completion', async () => {
    let finish
    mocks.updateUser.mockReturnValue(new Promise((resolve) => { finish = resolve }))
    const view = openForm()
    enterPasswords('test-password-one', 'test-password-one')
    mocks.auth = { user: { id: 'user-2' }, loading: false }
    view.rerender(<MemoryRouter><UpdatePassword /></MemoryRouter>)
    expect(screen.getByLabelText('New password')).toHaveValue('')
    expect(screen.getByLabelText('Confirm password')).toHaveValue('')
    await act(async () => { finish({ error: null }) })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByText('Update password')).toBeEnabled()
  })
  it('waits for session initialization', () => {
    mocks.auth.loading = true
    openForm()
    expect(screen.getByRole('status')).toHaveTextContent('Checking recovery session')
  })
  it('does not allow password updates without a session', () => {
    mocks.auth.user = null
    openForm()
    expect(screen.getByRole('alert')).toHaveTextContent('missing or expired')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
  it('rejects mismatched confirmation without sending credentials', () => {
    openForm()
    enterPasswords('test-password-one', 'test-password-two')
    expect(screen.getByRole('alert')).toHaveTextContent('matching passwords')
    expect(mocks.updateUser).not.toHaveBeenCalled()
  })
  it('updates the password through Supabase', async () => {
    mocks.updateUser.mockResolvedValue({ error: null })
    openForm()
    enterPasswords('test-password-one', 'test-password-one')
    expect(await screen.findByRole('status')).toHaveTextContent('Password updated')
    expect(mocks.updateUser).toHaveBeenCalledWith({ password: 'test-password-one' })
  })
  it('displays provider errors without claiming success', async () => {
    mocks.updateUser.mockResolvedValue({ error: new Error('Recovery session expired') })
    openForm()
    enterPasswords('test-password-one', 'test-password-one')
    expect(await screen.findByRole('alert')).toHaveTextContent('Recovery session expired')
    expect(screen.queryByText('Password updated.')).not.toBeInTheDocument()
  })
})
