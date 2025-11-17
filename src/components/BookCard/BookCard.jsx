import styled from 'styled-components';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, BookOpen } from 'lucide-react';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import { useLibraryStore } from '../../store/useStore';
import { useState } from 'react';

const Card = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: visible;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${({ theme, $isDragging, $isDragOverlay, $groupHover }) => 
    $isDragOverlay ? `0 20px 60px rgba(0, 0, 0, 0.6), 0 0 24px ${theme.colors.accentGlow}` :
    $groupHover ? `0 12px 40px rgba(137, 180, 250, 0.5), 0 0 32px ${theme.colors.accentGlow}` :
    $isDragging ? '0 8px 32px rgba(0, 0, 0, 0.3)' : 
    theme.elevation.low};
  cursor: ${({ $isDragging }) => $isDragging ? 'grabbing' : 'pointer'};
  transform: ${({ $isDragging, $isDragOverlay, $groupTarget, $reorderTarget }) => 
    $isDragOverlay ? 'scale(1.05) rotate(2deg)' :
    $groupTarget ? 'scale(1.04)' :
    $reorderTarget ? 'translateX(4px)' :
    $isDragging ? 'scale(0.95)' : 'scale(1)'};
  opacity: ${({ $isDragging, $isDragOverlay }) => 
    $isDragOverlay ? 1 :
    $isDragging ? 0.4 : 1};
  border: 1px solid ${({ theme, $groupTarget, $reorderTarget }) => 
    $groupTarget ? theme.colors.accent : 
    $reorderTarget ? theme.colors.borderHover :
    theme.colors.border};
  width: 140px;
  height: 220px;
  
  @media (max-width: 768px) {
    width: 120px;
    height: 188px;
  }
  
  &:hover {
    transform: ${({ $isDragging, $groupTarget, $reorderTarget }) => 
      $groupTarget ? 'scale(1.04)' :
      $reorderTarget ? 'translateX(4px)' :
      $isDragging ? 'scale(0.95)' : 'translateY(-8px) scale(1.03)'};
    box-shadow: ${({ theme, $isDragging, $groupTarget, $reorderTarget }) => 
      $groupTarget ? `0 16px 48px rgba(137, 180, 250, 0.6), 0 0 40px ${theme.colors.accentGlow}` :
      $reorderTarget ? `0 12px 36px rgba(148, 226, 213, 0.4), 0 0 24px rgba(148, 226, 213, 0.3)` :
      $isDragging ? '0 8px 32px rgba(0, 0, 0, 0.3)' : 
      `0 16px 48px rgba(0, 0, 0, 0.3), 0 0 0 2px ${theme.colors.borderHover}, 0 0 24px ${theme.colors.accentGlow}`};
    background: ${({ theme, $isDragging }) => $isDragging ? theme.colors.cardBackground : theme.colors.cardHover};
    border-color: ${({ theme }) => theme.colors.accent};
  }

  &::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    background: ${({ theme, $groupTarget, $reorderTarget }) => 
      $groupTarget ? `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.accentHover})` : 
      $reorderTarget ? 'linear-gradient(135deg, #94E2D5, #7FC8B8)' :
      'transparent'};
    opacity: ${({ $groupTarget, $reorderTarget }) => ($groupTarget || $reorderTarget) ? 0.25 : 0};
    pointer-events: none;
    z-index: -1;
    transition: opacity 0.2s ease;
    filter: blur(10px);
  }
`;

const DragHandle = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  left: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  opacity: 0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: grab;
  z-index: 30;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  
  ${Card}:hover & {
    opacity: 1;
    transform: scale(1.05);
  }
  
  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.background};
    box-shadow: 0 4px 12px rgba(137, 180, 250, 0.4);
  }
  
  &:active {
    cursor: grabbing;
    transform: scale(0.95);
  }
`;

const CoverImage = styled.div`
  position: relative;
  width: 100%;
  height: ${({ $hasCover }) => $hasCover ? '100%' : 'calc(100% - 72px)'};
  background: ${({ $image, theme }) => 
    $image 
      ? `url(${$image}) center/cover` 
      : `linear-gradient(135deg, ${theme.colors.surface} 0%, ${theme.colors.surfaceHover} 100%)`
  };
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
    background: linear-gradient(90deg,
      rgba(0,0,0,0.35) 0px,
      rgba(0,0,0,0.22) 6px,
      rgba(0,0,0,0.0) 14px);
    opacity: 0.35;
  }
`;

const CardContent = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  display: ${({ $hasCover }) => $hasCover ? 'none' : 'flex'};
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  height: 72px;
  overflow: hidden;
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
`;

const Author = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Progress = styled.div`
  margin-top: auto;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Actions = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.overlay};
  backdrop-filter: blur(12px);
  opacity: 0;
  transform: translateY(100%);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 20;
  pointer-events: none;
  
  ${Card}:hover & {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
`;

const ActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.background};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.colors.accentGlow};
  }
  
  &.danger:hover {
    background: ${({ theme }) => theme.colors.error};
    box-shadow: 0 4px 12px ${({ theme }) => theme.colors.errorGlow};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const BookCard = ({ book, onOpen, isDragOverlay, isGroupTarget, isReorderTarget }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: book.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const deleteBook = useLibraryStore((state) => state.deleteBook);
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const progressPercent = book.totalPages > 0 
    ? Math.round((book.currentPage / book.totalPages) * 100)
    : 0;

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setConfirmDelete(true);
  };
  
  if (!book) return null;

  return (
    <Card
      ref={setNodeRef}
      style={isDragOverlay ? undefined : style}
      $isDragging={isDragging}
      $isDragOverlay={isDragOverlay}
      $groupTarget={isGroupTarget}
      $reorderTarget={isReorderTarget}
      onClick={isDragOverlay ? undefined : onOpen}
    >
      <DragHandle {...attributes} {...listeners}>
        <GripVertical size={20} />
      </DragHandle>
      
      <CoverImage $image={book.coverImage} $hasCover={!!book.coverImage}>
        {!book.coverImage && <BookOpen size={48} />}
      </CoverImage>
      
      <CardContent $hasCover={!!book.coverImage}>
        <Title>{book.title}</Title>
        <Author>{book.author}</Author>
        {progressPercent > 0 && (
          <Progress>{progressPercent}% complete</Progress>
        )}
      </CardContent>
      
      <Actions>
        <ActionButton onClick={handleEdit}>
          <Edit size={16} />
        </ActionButton>
        <ActionButton className="danger" onClick={handleDelete}>
          <Trash2 size={16} />
        </ActionButton>
      </Actions>
      <ConfirmDialog
        open={confirmDelete}
        title="Delete Book"
        message={`Move "${book.title}" to the recycle bin? You can restore it later from the bin.`}
        confirmLabel="Move to Bin"
        cancelLabel="Cancel"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => { deleteBook(book.id); setConfirmDelete(false); }}
      />
    </Card>
  );
};

export default BookCard;
