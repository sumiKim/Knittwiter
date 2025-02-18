import styled from 'styled-components';
import { auth, db, storage } from '../firebase';
import { useEffect, useState } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import Tweet from '../components/Tweet';
import { ITweet } from '../components/Timeline';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;
const AvatarUpload = styled.label`
  width: 80px;
  height: 80px;
  overflow: hidden;
  border-radius: 50%;
  background-color: #1d9bf0;
  cursor: pointer;
  svg {
    width: 100%;
  }
`;
const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
`;
const AvatarInput = styled.input`
  display: none;
`;
const UserInfo = styled.div`
  display: flex;
`;
const Name = styled.span`
  font-size: 22px;
  cursor: pointer;
`;
const Tweets = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 10px;
`;
const EditInput = styled.textarea`
  width: 50%;
  height: 30px;
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
export default function Profile() {
  const user = auth.currentUser;
  const [avatar, setAvatar] = useState(user?.photoURL);
  const [tweets, setTweets] = useState<ITweet[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || 'Anonymous');
  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!user) return;
    if (files && files.length === 1) {
      const file = files[0];
      const locationRef = ref(storage, `avatars/${user?.uid}`);
      const result = await uploadBytes(locationRef, file);
      const avatarUrl = await getDownloadURL(result.ref);
      setAvatar(avatarUrl);
      await updateProfile(user, {
        photoURL: avatarUrl,
      });
    }
  };
  const fetchTweets = async () => {
    const tweetQuery = query(
      collection(db, 'tweets'),
      where('userId', '==', user?.uid),
      orderBy('createdAt', 'desc'),
      limit(25)
    );
    const snapshot = await getDocs(tweetQuery);
    const tweets = snapshot.docs.map(doc => {
      const { tweet, createdAt, userId, username, photo } = doc.data();
      return {
        tweet,
        createdAt,
        userId,
        username,
        photo,
        id: doc.id,
      };
    });
    setTweets(tweets);
  };
  const onEdit = async () => {
    if (!isEditing) {
      setIsEditing(true);
    } else {
      if (!user) return;

      try {
        await updateProfile(user, {
          displayName: editName,
        });
        setIsEditing(false);
      } catch (e) {
        console.log(e);
      }
    }
  };
  useEffect(() => {
    fetchTweets();
  }, []);
  return (
    <Wrapper>
      <AvatarUpload htmlFor='avatar'>
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
        <AvatarImg />
      </AvatarUpload>
      <AvatarInput
        onChange={onAvatarChange}
        id='avatar'
        type='file'
        accept='image/*'
      />
      <UserInfo>
        {isEditing ? (
          <>
            <EditInput
              value={editName}
              onChange={e => setEditName(e.target.value)}
            />
            <Button onClick={onEdit}>Save</Button>
            <Button danger onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <Name onClick={onEdit}>
            {user?.displayName ? user.displayName : 'Anonymous'}
          </Name>
        )}
      </UserInfo>
      <Tweets>
        {tweets.map(tweet => (
          <Tweet key={tweet.id} {...tweet} />
        ))}
      </Tweets>
    </Wrapper>
  );
}
