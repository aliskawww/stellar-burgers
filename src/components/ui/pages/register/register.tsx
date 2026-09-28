import {
  Input,
  Button,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { Link } from 'react-router-dom';

import type { RegisterUIProps } from './type';

import styles from '../common.module.css';

export const RegisterUI = ({
  isLoading = false,
  errorText,
  email,
  setEmail,
  handleSubmit,
  password,
  setPassword,
  userName,
  setUserName,
}: RegisterUIProps): React.JSX.Element => (
  /*
    Отображение ошибок и валидация форм в "можно лучше"
  */
  <main className={styles.container}>
    <div className={`pt-6 ${styles.wrapCenter}`}>
      <h3 className="pb-6 text text_type_main-medium">Регистрация</h3>
      <form className={`pb-15 ${styles.form}`} name="register" onSubmit={handleSubmit}>
        <>
          <div className="pb-6">
            <Input
              required
              autoComplete="name"
              disabled={isLoading}
              type="text"
              placeholder="Имя"
              onChange={(e) => setUserName(e.target.value)}
              value={userName}
              name="name"
              error={false}
              errorText=""
              size="default"
            />
          </div>
          <div className="pb-6">
            <Input
              required
              autoComplete="email"
              disabled={isLoading}
              type="email"
              placeholder="E-mail"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              name={'email'}
              error={false}
              errorText=""
              size={'default'}
            />
          </div>
          <div className="pb-6">
            <PasswordInput
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              name="password"
              required
              minLength={6}
              autoComplete="new-password"
              disabled={isLoading}
            />
          </div>
          <div className={`pb-6 ${styles.button}`}>
            <Button type="primary" size="medium" htmlType="submit" disabled={isLoading || !userName.trim() || !email.trim() || password.length < 6}>
              {isLoading ? 'Регистрируем...' : 'Зарегистрироваться'}
            </Button>
          </div>
          {errorText && (
            <p role="alert" className={`${styles.error} text text_type_main-default pb-6`}>
              {errorText}
            </p>
          )}
        </>
      </form>
      <div className={`${styles.question} text text_type_main-default pb-6`}>
        Уже зарегистрированы?
        <Link to="/login" className={`pl-2 ${styles.link}`}>
          Войти
        </Link>
      </div>
    </div>
  </main>
);
