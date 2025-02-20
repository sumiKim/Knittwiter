import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useState } from 'react';
import styled from 'styled-components';
import { auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import GithubBtn from '../components/GithubBtn';
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
const Error = styled.span``;
const Switcher = styled.span``;

const errors: { [key: string]: string } = {
  'Firebase: Error (auth/invalid-email).': '가입할 수 없는 이메일입니다.',
  'Firebase: Error (auth/email-already-in-use).':
    '이미 사용 중인 이메일입니다.',
  'Firebase: Error (auth/weak-password).':
    '비밀번호는 6자리 이상이어야 합니다.',
};

export default function CreateAccount() {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'name') {
      setName(value);
    } else if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || name === '' || email === '' || password === '') return;

    try {
      setLoading(true);
      const credentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(credentials.user, {
        displayName: name,
      });
      navigate('/');
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.log(e.message);
        const errorMessage =
          errors[e.message] || '알 수 없는 오류가 발생했습니다.';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <Wrapper>
      <Title>Join</Title>
      <AppImg src={logo} alt='logo'></AppImg>
      <Form onSubmit={onSubmit}>
        <Input
          onChange={onChange}
          name='name'
          value={name}
          placeholder='Name'
          type='text'
          required
        />
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
        <Input
          type='submit'
          value={isLoading ? 'Loading...' : 'Create Account'}
        />
      </Form>
      {error !== '' ? <Error>{error}</Error> : null}
      <Switcher>
        Already have an account? <Link to='/login'>Login &rarr;</Link>
      </Switcher>
      {/* <GithubBtn /> */}
    </Wrapper>
  );
}
