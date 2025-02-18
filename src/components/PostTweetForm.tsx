import { addDoc, collection, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import styled from 'styled-components';
import { auth, db, storage } from '../firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
const TextArea = styled.textarea`
  border-color: rgba(129, 88, 84, 0.7);
  border-width: 2px;
  padding: 20px;
  border-radius: 20px;
  font-size: 16px;
  color: black;
  background-color: #f9ebde;
  width: 100%;
  resize: none;
  &::placeholder {
    font-size: 16px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
      Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
      sans-serif;
  }
  &:focus {
    outline: none;
    border-color: #815854;
  }
`;
const AttachFileButton = styled.label`
  padding: 10px 0px;
  color: #815854;
  text-align: center;
  border-radius: 20px;
  border: 1px solid #815854;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background-color: rgba(129, 88, 84, 0.3);
  }
`;
const AttachFileInput = styled.input`
  display: none;
`;
const SubmitBtn = styled.input`
  background-color: #815854;
  color: white;
  border: none;
  padding: 10px 0px;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  &:hover,
  &:active {
    opacity: 0.8;
  }
`;

export default function PostTweetForm() {
  const [loading, setLoading] = useState(false);
  const [tweet, setTweet] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTweet(e.target.value);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length === 1) {
      const selectedFile = files[0];
      if (selectedFile.size > 1048576) {
        setFile(null);
        alert('파일 크기는 1MB 이하만 가능합니다.');
        return;
      }
      setFile(files[0]);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user || loading || tweet === '' || tweet.length > 200) return;

    try {
      setLoading(true);

      const doc = await addDoc(collection(db, 'tweets'), {
        tweet,
        createdAt: Date.now(),
        usernamd: user.displayName || 'Anonymous',
        userId: user.uid,
      });

      if (file) {
        const locationRef = ref(storage, `tweets/${user.uid}/${doc.id}`);

        const result = await uploadBytes(locationRef, file);
        const url = await getDownloadURL(result.ref);

        updateDoc(doc, {
          photo: url,
        });
      }
      setTweet('');
      setFile(null);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Form onSubmit={onSubmit}>
      <TextArea
        required
        rows={5}
        maxLength={200}
        onChange={onChange}
        value={tweet}
        placeholder='What is happening?'
      />
      <AttachFileButton htmlFor='file'>
        {file ? 'Photo added ✅' : 'Add photo'}
      </AttachFileButton>
      <AttachFileInput
        onChange={onFileChange}
        id='file'
        type='file'
        accept='image/*'
      ></AttachFileInput>
      <SubmitBtn
        type='submit'
        value={loading ? 'Posting...' : 'Post Tweet'}
      ></SubmitBtn>
    </Form>
  );
}
