import { useEffect, useState } from 'react';
import styled from 'styled-components';

interface Photo {
  id: number;
  sort_order: number;
  user_id: number;
  x_offset: number;
  y_offset: number;
  square_url: string;
  medium_url: string;
  thumbnail_url: string;
}

interface Pattern {
  id: number;
  name: string;
  favorites_count: number;
  photos: Photo[];
}

interface PatternsResponse {
  patterns: {
    [key: string]: Pattern; // 키는 문자열로 패턴 id가 들어감
  };
}

const Wrapper = styled.div`
  width: 100%;
`;
const Title = styled.h6`
  display: flex;
  justify-content: center;
  align-items: center;
  color: #815854;
  font-weight: 700;
  svg {
    width: 30px;
    height: 30px;
    fill: #815854;
  }
`;
const PatternCards = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
  padding: 10px;
`;
const PatternCard = styled.li`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  span {
    font-weight: 600;
    font-size: 13px;
  }
  span:last-child {
    text-align: end;
  }
`;

export default function RecommandPatterns() {
  const [pattern, setPattern] = useState<PatternsResponse | null>(null);
  const [error, setError] = useState(null);

  const formatPatternName = (name: string): string => {
    // '#' 제거, 앞뒤 공백 제거, 공백을 '-'로 대체 후 소문자로 변환
    return name.replace(/#/g, '').trim().replace(/\s+/g, '-').toLowerCase();
  };

  const clickCard = (name: string) => {
    const formattedName = formatPatternName(name);
    const url = `https://www.ravelry.com/patterns/library/${formattedName}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    fetch('/api/ravelry/patterns.json')
      .then(res => res.json())
      .then(data => setPattern(data))
      .catch(err => setError(err));
  }, []);

  if (error) return <div>Error: {JSON.stringify(error)}</div>;
  if (!pattern) return <div>Loading...</div>;

  return (
    <Wrapper>
      <Title>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='currentColor'
        >
          <path
            fill-rule='evenodd'
            d='M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z'
            clip-rule='evenodd'
          />
        </svg>
        추천 패턴
      </Title>
      <PatternCards>
        {Object.keys(pattern.patterns).map(key => {
          const pat = pattern.patterns[key];
          return (
            <PatternCard key={pat.id} onClick={() => clickCard(pat.name)}>
              <span>🧶 {pat.name}</span>
              {pat.photos && pat.photos.length > 0 && (
                <img src={pat.photos[0].square_url} alt={pat.name} />
              )}
              <span>🤎 {pat.favorites_count}</span>
            </PatternCard>
          );
        })}
      </PatternCards>
    </Wrapper>
  );
}
