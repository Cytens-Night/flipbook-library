import styled from 'styled-components';

const GhostCard = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(137, 180, 250, 0.5);
  transform: scale(1.05) rotate(2deg);
  opacity: 0.95;
  cursor: grabbing;
  width: 160px;
`;

const Cover = styled.div`
  width: 100%;
  aspect-ratio: 2/3;
  background: ${({ $cover, theme }) =>
    $cover
      ? `url(${$cover}) center/cover`
      : `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.accentHover})`};
  position: relative;
`;

const Info = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.cardBackground};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.text};
`;

const Author = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DragGhost = ({ book }) => {
  if (!book) return null;

  return (
    <GhostCard>
      <Cover $cover={book.cover || book.coverImage} />
      <Info>
        <Title>{book.title}</Title>
        <Author>{book.author || 'Unknown Author'}</Author>
      </Info>
    </GhostCard>
  );
};

export default DragGhost;
