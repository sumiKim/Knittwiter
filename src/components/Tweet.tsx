import styled from 'styled-components';
import { ITweet } from './Timeline';
import { auth, db, storage } from '../firebase';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref } from 'firebase/storage';
import { useEffect, useState } from 'react';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 50px 1fr 25px;
  padding: 10px;
  border: 2px solid rgba(129, 88, 84, 0.1);
  border-radius: 15px;
  gap: 10px;
`;
const Column = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 5px 0;
`;
const AvatarImg = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
`;
const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`;
const Payload = styled.p`
  font-size: 15px;
  white-space: pre-wrap;
`;
const Photo = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 15px;
`;
const EditInput = styled.textarea`
  width: 100%;
  height: 60px;
  font-size: 15px;
  border-radius: 10px;
  padding: 5px;
  border-color: rgba(129, 88, 84, 0.7);
  border-width: 1px;
  background-color: #f9ebde;
  &:focus {
    outline: none;
    border-color: #815854;
  }
`;
const ButtonWrapper = styled.span`
  cursor: pointer;
  position: relative;
  .dropdown {
    position: absolute;
    right: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
    background-color: #f9ebde;
    border: 1px solid rgba(129, 88, 84, 0.1);
    border-radius: 5px;
    padding: 5px;
  }
`;
const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;
const Button = styled.button<{ danger?: boolean }>`
  display: flex;
  gap: 5px;
  background-color: #f9ebde;
  color: ${({ danger }) => (danger ? 'tomato' : 'black')};
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 5px;
  svg {
    width: 15px;
    height: 15px;
  }
`;
const EditMode = styled.div``;
export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
  const user = auth.currentUser;
  const [avatar, setAvatar] = useState('');
  const [isDropdown, setIsDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(tweet);

  useEffect(() => {
    async function fetchProfileImg() {
      const pathReference = ref(storage, `avatars/${user?.uid}`);
      const avatarUrl = await getDownloadURL(pathReference);
      setAvatar(avatarUrl);
    }
    fetchProfileImg();
  });
  const clickDropdown = () => {
    if (isEditing) return;
    setIsDropdown(!isDropdown);
  };
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
      setIsDropdown(false);
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
      {avatar ? (
        <AvatarImg src={avatar} />
      ) : (
        <svg
          fill='currentColor'
          viewBox='0 0 20 20'
          xmlns='http://www.w3.org/2000/svg'
          aria-hidden='true'
        >
          <path d='M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z' />
        </svg>
      )}
      <Column>
        <Username>{username}</Username>
        {isEditing ? (
          <EditMode>
            <EditInput
              value={editText}
              onChange={e => setEditText(e.target.value)}
            />
            <ButtonContainer>
              <Button
                onClick={() => {
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={onEdit}>Save</Button>
            </ButtonContainer>
          </EditMode>
        ) : (
          <Payload>{tweet}</Payload>
        )}
        {photo ? <Photo src={photo} /> : null}
      </Column>
      {user?.uid === userId ? (
        <ButtonWrapper>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='size-6'
            onClick={clickDropdown}
          >
            <path
              fillRule='evenodd'
              d='M10.5 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z'
              clipRule='evenodd'
            />
          </svg>
          {isDropdown ? (
            <div className='dropdown'>
              <Button onClick={onEdit}>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path d='M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z' />
                </svg>
                <span>Edit</span>
              </Button>
              <Button onClick={onDelete} danger>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 30 30'
                  fill='currentColor'
                >
                  <path
                    fill-rule='evenodd'
                    d='M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z'
                    clip-rule='evenodd'
                  />
                </svg>
                <span>Delete</span>
              </Button>
            </div>
          ) : null}
        </ButtonWrapper>
      ) : null}
    </Wrapper>
  );
}
