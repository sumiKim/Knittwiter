import styled from 'styled-components';
import { ITweet } from './Timeline';
import { auth, db, storage } from '../firebase';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { useState } from 'react';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`;
const Column = styled.div``;
const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
`;
const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`;
const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
  white-space: pre-wrap;
`;

const EditInput = styled.textarea`
  width: 100%;
  height: 80px;
  font-size: 16px;
  border-radius: 5px;
  padding: 5px;
`;
const Button = styled.button<{ danger?: boolean }>`
  background-color: ${({ danger }) => (danger ? 'tomato' : '#1DA1F2')};
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 5px;
`;

export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
  const user = auth.currentUser;
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(tweet);

  const onDelete = async () => {
    const ok = confirm('트윗을 정말로 삭제할까요?');
    if (!ok || user?.uid !== userId) return;

    if (user?.uid !== userId) return;
    try {
      await deleteDoc(doc(db, 'tweets', id));
      if (photo) {
        const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
        await deleteObject(photoRef);
      }
    } catch (e) {
      console.log(e);
    } finally {
    }
  };

  const onEdit = async () => {
    if (!isEditing) {
      setIsEditing(true);
    } else {
      try {
        await updateDoc(doc(db, 'tweets', id), {
          tweet: editText,
        });
        setIsEditing(false);
      } catch (e) {
        console.log(e);
      }
    }
  };
  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
        {isEditing ? (
          <EditInput
            value={editText}
            onChange={e => setEditText(e.target.value)}
          />
        ) : (
          <Payload>{tweet}</Payload>
        )}
        {user?.uid === userId ? (
          <>
            <Button onClick={onEdit}>{isEditing ? 'Save' : 'Edit'}</Button>
            {isEditing ? (
              <Button danger onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            ) : (
              <Button danger onClick={onDelete}>
                Delete
              </Button>
            )}
          </>
        ) : null}
      </Column>
      {photo ? (
        <Column>
          <Photo src={photo} />
        </Column>
      ) : null}
    </Wrapper>
  );
}
