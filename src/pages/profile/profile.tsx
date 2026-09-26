import { ProfileUI } from '@ui-pages';
import { useEffect, useState } from 'react';
import { clearAuthError, updateUser } from '@slices/authSlice';
import { useDispatch, useSelector } from '../../services/store';
import type { ChangeEvent, SyntheticEvent } from 'react';

export const Profile = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { user, pending, error } = useSelector((state) => state.auth);
  const [saved, setSaved] = useState(false);
  const [formValue, setFormValue] = useState({ name: user?.name ?? '', email: user?.email ?? '', password: '' });
  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);
  useEffect(() => {
    setFormValue({ name: user?.name ?? '', email: user?.email ?? '', password: '' });
  }, [user]);
  const isFormChanged = formValue.name !== user?.name || formValue.email !== user?.email || !!formValue.password;
  const handleSubmit = (event: SyntheticEvent): void => {
    event.preventDefault();
    if (pending || !isFormChanged) return;
    setSaved(false);
    void dispatch(updateUser({ name: formValue.name.trim(), email: formValue.email.trim(), ...(formValue.password ? { password: formValue.password } : {}) }))
      .unwrap().then(() => { setSaved(true); setFormValue((value) => ({ ...value, password: '' })); }).catch(() => undefined);
  };
  const handleCancel = (event: SyntheticEvent): void => {
    event.preventDefault();
    setFormValue({ name: user?.name ?? '', email: user?.email ?? '', password: '' });
    dispatch(clearAuthError()); setSaved(false);
  };
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSaved(false);
    setFormValue((value) => ({ ...value, [event.target.name]: event.target.value }));
  };
  return <ProfileUI formValue={formValue} isFormChanged={isFormChanged} handleCancel={handleCancel}
    handleSubmit={handleSubmit} handleInputChange={handleInputChange} updateUserError={error ?? undefined}
    isLoading={pending} saved={saved} />;
};
