import { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import logo from '../img/logo.png';

const Wrapper = styled.div`
  height: 100vh;
  width: 420px;
  padding: 0 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  justify-self: center;
  gap: 20px;
`;
const AppImg = styled.img`
  width: 200px;
  height: 200px;
`;
const Title = styled.h1`
  font-size: 50px;
  font-weight: 500;
  color: #815854;
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
`;
const Input = styled.input`
  border: none;
  padding: 10px 15px;
  border-radius: 50px;
  &[type='submit'] {
    cursor: pointer;
    background-color: #815854;
    color: white;
    font-size: 15px;
    &:hover {
      opacity: 0.8;
    }
  }
`;
const Error = styled.span`
  font-size: 13px;
  color: #cd0c22;
  font-weight: 500;
`;
const Switcher = styled.span``;

const errors: { [key: string]: string } = {
  'Firebase: Error (auth/invalid-email).': '유효하지 않은 이메일 형식입니다.',
  'Firebase: Error (auth/user-disabled).': '비활성화된 사용자입니다.',
  'Firebase: Error (auth/user-not-found).': '등록되지 않은 사용자입니다.',
  'Firebase: Error (auth/wrong-password).': '잘못된 비밀번호입니다.',
  'Firebase: Error (auth/too-many-requests).':
    '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
  'Firebase: Error (auth/network-request-failed).':
    '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.',
  'Firebase: Error (auth/invalid-login-credentials).':
    '유효하지 않은 이메일 또는 비밀번호입니다.',
};

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || email === '' || password === '') return;

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (e) {
      if (e instanceof FirebaseError) {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <Wrapper>
      <Title>👋🏻 Welcome</Title>
      <AppImg src={logo} alt='logo'></AppImg>
      <Form onSubmit={onSubmit}>
        <Input
          onChange={onChange}
          name='email'
          value={email}
          placeholder='Mail'
          type='email'
          required
        />
        <Input
          onChange={onChange}
          name='password'
          value={password}
          placeholder='Password'
          type='password'
          required
        />
        <Input type='submit' value={isLoading ? 'Loading...' : 'Log In'} />
      </Form>
      {error !== '' ? <Error>{errors[error]}</Error> : null}
      <Switcher>
        Don't have an account?{' '}
        <Link to='/create-account'>Create one &rarr;</Link>
      </Switcher>
    </Wrapper>
  );
}
