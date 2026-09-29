import { ProfileMenu } from '@components';
import { Button, Input } from '@krgaa/react-developer-burger-ui-components';

import type { ProfileUIProps } from './type';

import styles from './profile.module.css';

export const ProfileUI = ({
  isLoading = false,
  saved = false,
  formValue,
  isFormChanged,
  updateUserError,
  handleSubmit,
  handleCancel,
  handleInputChange,
}: ProfileUIProps): React.JSX.Element => (
  <main className={styles.container}>
    <div className={`mt-30 mr-15 ${styles.menu}`}>
      <ProfileMenu />
    </div>
    <form className={`mt-30 ${styles.form}`} onSubmit={handleSubmit}>
      <>
        <div className="pb-6">
          <Input
            required
            disabled={isLoading}
            type={'text'}
            placeholder={'Имя'}
            onChange={handleInputChange}
            value={formValue.name}
            name={'name'}
            error={false}
            errorText={''}
            size={'default'}
            icon={'EditIcon'}
          />
        </div>
        <div className="pb-6">
          <Input
            required
            disabled={isLoading}
            type={'email'}
            placeholder={'E-mail'}
            onChange={handleInputChange}
            value={formValue.email}
            name={'email'}
            error={false}
            errorText={''}
            size={'default'}
            icon={'EditIcon'}
          />
        </div>
        <div className="pb-6">
          <Input
            minLength={6}
            autoComplete="new-password"
            disabled={isLoading}
            type={'password'}
            placeholder={'Пароль'}
            onChange={handleInputChange}
            value={formValue.password}
            name={'password'}
            error={false}
            errorText={''}
            size={'default'}
            icon={'EditIcon'}
          />
        </div>
        {isFormChanged && (
          <div>
            <Button
              type="secondary"
              htmlType="button"
              size="medium"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Отменить
            </Button>
            <Button
              type="primary"
              size="medium"
              htmlType="submit"
              disabled={
                isLoading ||
                !formValue.name.trim() ||
                !formValue.email.trim() ||
                (!!formValue.password && formValue.password.length < 6)
              }
            >
              {isLoading ? 'Сохраняем...' : 'Сохранить'}
            </Button>
          </div>
        )}
        {saved && (
          <p role="status" className="pt-5 text text_type_main-default">
            Данные сохранены
          </p>
        )}
        {updateUserError && (
          <p role="alert" className={`${styles.error} pt-5 text text_type_main-default`}>
            {updateUserError}
          </p>
        )}
      </>
    </form>
  </main>
);
