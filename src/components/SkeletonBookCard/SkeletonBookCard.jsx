import styled from 'styled-components';

const SkeletonWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  height: 100%;
  animation: fadeIn 0.4s ease;
  border: 1px solid ${({ theme }) => theme.colors.border};

  @keyframes fadeIn { from { opacity:0; transform: scale(.96); } to { opacity:1; transform: scale(1); } }
`;

const SkeletonCover = styled.div`
  width: 100%;
  aspect-ratio: 2/3;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.surface} 0%, ${({ theme }) => theme.colors.surfaceHover} 100%);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    transform: translateX(-100%);
    animation: shimmer 2.2s infinite;
  }

  @keyframes shimmer { 100% { transform: translateX(100%); } }
`;

const SkeletonContent = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Line = styled.div`
  height: 12px;
  width: ${({ $w }) => $w || '100%'};
  background: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: 6px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
    transform: translateX(-100%);
    animation: shimmer 2.2s infinite;
  }
`;

const SkeletonBookCard = () => (
  <SkeletonWrapper>
    <SkeletonCover />
    <SkeletonContent>
      <Line $w="80%" />
      <Line $w="60%" />
      <Line $w="40%" />
    </SkeletonContent>
  </SkeletonWrapper>
);

export default SkeletonBookCard;
