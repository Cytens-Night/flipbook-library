import styled from 'styled-components';
import { XCircle } from 'lucide-react';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(137,180,250,0.15), transparent 60%), rgba(0,0,0,0.7);
  backdrop-filter: blur(10px);
  display: ${({ $open }) => $open ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 4000;
  animation: ${({ $open }) => $open ? 'overlayFade 0.4s forwards' : 'none'};
  @keyframes overlayFade { from { opacity: 0; } to { opacity: 1; } }
`;

const Dialog = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.surface} 0%, ${({ theme }) => theme.colors.surfaceHover} 100%);
  border-radius: 18px;
  width: clamp(320px, 40vw, 520px);
  padding: 1.9rem 1.7rem 1.3rem;
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  box-shadow: 0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px ${({ theme }) => theme.colors.border};
  transform: scale(0.92) translateY(20px);
  opacity: 0;
  animation: dialogPop 0.45s forwards cubic-bezier(0.4, 0, 0.2, 1);
  @keyframes dialogPop { 0% { opacity: 0; transform: scale(0.85) translateY(30px); } 60% { opacity:1; transform: scale(1.02) translateY(0); } 100% { opacity:1; transform: scale(1) translateY(0); } }
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: ${({ theme, $danger }) => $danger ? theme.colors.error : theme.colors.accent};
`;

const Message = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 0.65rem 1.05rem;
  font-size: 0.87rem;
  font-weight: 600;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surfaceHover};
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  box-shadow: 0 4px 14px rgba(0,0,0,0.25);
  position: relative;
  overflow: hidden;
  
  &:hover { background: ${({ theme }) => theme.colors.accent}; color: ${({ theme }) => theme.colors.background}; transform: translateY(-2px); box-shadow: 0 8px 20px ${({ theme }) => theme.colors.accentGlow}; }
  &.danger { background: ${({ theme }) => theme.colors.error}33; color: ${({ theme }) => theme.colors.error}; }
  &.danger:hover { background: ${({ theme }) => theme.colors.error}; color: #fff; box-shadow: 0 8px 20px ${({ theme }) => theme.colors.errorGlow}; }
  &:active { transform: translateY(0); }
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.accent}; outline-offset: 3px; }
`;

const ConfirmDialog = ({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, danger }) => {
  return (
    <Overlay $open={open} onClick={onCancel}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        <Title $danger={danger}>{title}</Title>
        <Message>{message}</Message>
        <Actions>
          <Button onClick={onCancel}><XCircle size={16}/> {cancelLabel}</Button>
          <Button className={danger ? 'danger' : ''} onClick={onConfirm}>{confirmLabel}</Button>
        </Actions>
      </Dialog>
    </Overlay>
  );
};

export default ConfirmDialog;