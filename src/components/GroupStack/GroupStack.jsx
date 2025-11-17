import styled from 'styled-components';
import { Layers, Plus } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLibraryStore } from '../../store/useStore';

const StackContainer = styled.div`
  position: relative;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${({ $isOver }) => $isOver ? 'translateY(-10px) scale(1.06) rotate(-1.5deg)' : 'scale(1)'};
  filter: ${({ $isOver }) => $isOver ? 'brightness(1.18)' : 'brightness(1)'};
  width: 140px;
  height: 220px;
  
  @media (max-width: 768px) {
    width: 120px;
    height: 188px;
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.04) rotate(-1deg);
  }
  
  &::before {
    content: '';
    position: absolute;
    inset: -10px;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    background: radial-gradient(circle at 30% 20%, rgba(137,180,250,0.4), transparent 70%),
      radial-gradient(circle at 70% 80%, rgba(180,142,173,0.35), transparent 75%);
    opacity: ${({ $isOver }) => $isOver ? 1 : 0};
    transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: -1;
    animation: ${({ $isOver }) => $isOver ? 'pulse 1.5s ease-in-out infinite' : 'none'};
    box-shadow: ${({ $isOver }) => $isOver ? '0 0 0 3px rgba(137,180,250,0.35), 0 0 30px rgba(137,180,250,0.45)' : 'none'};
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.05); opacity: 1; }
  }
`;

const StackCard = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.elevation.low};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const MainCard = styled(StackCard)`
  position: relative;
  z-index: 3;
  background: ${({ $image, theme }) => 
    $image 
      ? `url(${$image}) center/cover` 
      : theme.colors.cardBackground
  };
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border: 2px solid ${({ $color }) => $color || '#89B4FA'};
  
  &:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25), 0 0 0 2px ${({ $color }) => $color || 'rgba(137, 180, 250, 0.4)'};
  }
  
  ${StackContainer}:hover & {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25), 0 0 0 2px ${({ $color }) => $color || 'rgba(137, 180, 250, 0.4)'};
  }
`;

const SecondCard = styled(StackCard)`
  z-index: 2;
  top: -6px;
  left: 6px;
  right: -6px;
  opacity: 0.7;
  transform: rotate(-2deg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  
  ${StackContainer}:hover & {
    transform: rotate(-3deg) translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  }
`;

const ThirdCard = styled(StackCard)`
  z-index: 1;
  top: -12px;
  left: 12px;
  right: -12px;
  opacity: 0.5;
  transform: rotate(-4deg);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  
  ${StackContainer}:hover & {
    transform: rotate(-6deg) translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }
`;

const GroupInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.overlay};
  backdrop-filter: blur(8px);
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${StackContainer}:hover & {
    background: ${({ theme }) => theme.colors.overlayHover || theme.colors.overlay};
  }
`;

const GroupName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const BookCount = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const GroupBadge = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  background: ${({ $color }) => $color ? `linear-gradient(135deg, ${$color}, ${$color}dd)` : 'linear-gradient(135deg, #89B4FA, #A6C8FF)'};
  color: ${({ theme }) => theme.colors.background};
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 700;
  box-shadow: 0 4px 12px ${({ $color }) => $color ? `${$color}66` : 'rgba(137, 180, 250, 0.4)'}, 0 0 0 3px ${({ theme }) => theme.colors.background};
  z-index: 10;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${StackContainer}:hover & {
    transform: scale(1.15) rotate(5deg);
    box-shadow: 0 6px 16px ${({ $color }) => $color ? `${$color}99` : 'rgba(137, 180, 250, 0.6)'}, 0 0 0 3px ${({ theme }) => theme.colors.background};
  }
`;

const DropZoneIndicator = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, rgba(137,180,250,0.95), rgba(166,200,255,0.95));
  color: ${({ theme }) => theme.colors.background};
  font-weight: 700;
  font-size: 1.125rem;
  opacity: ${({ $isOver }) => $isOver ? 1 : 0};
  transform: ${({ $isOver }) => $isOver ? 'scale(1) rotate(0deg)' : 'scale(0.9) rotate(-2deg)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  z-index: 20;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(137,180,250,0.5);
`;

const GroupStack = ({ group, onOpenGroup, droppableId, isDragOverlay }) => {
  const books = useLibraryStore((state) => state.books);
  const groupBooks = books.filter((book) => group.bookIds.includes(book.id));
  const topBook = groupBooks[0];
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({ id: droppableId, disabled: isDragOverlay });
  
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: droppableId, disabled: isDragOverlay });

  const style = isDragOverlay ? {} : {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  
  // Combine refs
  const setRefs = (node) => {
    if (!isDragOverlay) {
      setDroppableRef(node);
      setSortableRef(node);
    }
  };

  const handleClick = (e) => {
    // Only open if not dragging
    if (!isDragging) {
      onOpenGroup();
    }
  };

  return (
    <StackContainer 
      ref={isDragOverlay ? undefined : setRefs} 
      onClick={isDragOverlay ? undefined : handleClick} 
      $isOver={!isDragOverlay && isOver}
      style={isDragOverlay ? { transform: 'scale(1.05) rotate(2deg)', cursor: 'grabbing' } : style}
      {...(isDragOverlay ? {} : attributes)}
      {...(isDragOverlay ? {} : listeners)}
    >
      <ThirdCard />
      <SecondCard />
      <MainCard $image={topBook?.coverImage} $color={group.color}>
        <GroupBadge $color={group.color}>
          <Layers size={14} />
          <span style={{ marginLeft: '4px' }}>{group.bookIds.length}</span>
        </GroupBadge>
        <GroupInfo>
          <GroupName>{group.name}</GroupName>
          <BookCount>
            <Layers size={16} />
            {group.bookIds.length} books
          </BookCount>
        </GroupInfo>
      </MainCard>
      <DropZoneIndicator $isOver={isOver}>
        <Plus size={24} />
        Add to Group
      </DropZoneIndicator>
    </StackContainer>
  );
};

export default GroupStack;
